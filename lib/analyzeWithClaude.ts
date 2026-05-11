import Anthropic from '@anthropic-ai/sdk';
import type { ReportData } from '@/types/report';
import { getVertical } from './verticals';
import { resolveReportModelId } from './reportModel';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const BASE_SYSTEM_PROMPT = `You are an elite marketing strategist at Blue Harbor, a premium digital marketing agency. You have 20 years of experience helping businesses win market share.

Your job: analyze a CLIENT and their COMPETITOR and produce a brutally honest, specific competitive audit that will be shown to the client as a sales pitch deck. The goal is to show the client exactly where they can win — and make them feel like they need Blue Harbor's help to execute.

Baseline voice: Confident, direct, premium — like a trusted senior strategist who has seen everything. Not academic. Not vague. Specific, concrete, grounded in what you actually found in the scraped content.

CRITICAL OUTPUT RULES:
- Return ONLY valid JSON — no markdown fences, no explanation text, nothing else
- Every claim must be grounded in the scraped content
- Numbers and specifics are everything — vague statements destroy credibility
- The framing is always: "the client can win with the right strategy and execution partner"
- topFindings must be exactly 3 items — these show on the teaser page to create urgency
- hero.stats must be exactly 4 items — the most compelling quantifiable advantages
- comparison must have 10-12 rows
- advantages must have 4-6 items (only real, verifiable advantages)
- opportunities must have 4-6 items
- threats must have 2-4 items (honest about where competitor is stronger)
- roadmap must have 6 steps

CRITICAL — always use EXACTLY these field names in your JSON, no variations:

topFindings items: { title, teaser, fullDescription, severity }
comparison items: { category, competitor, client, advantage, advantageNote }
advantages items: { title, description, badge }
opportunities items: { title, description, priority }
threats items: { title, description }
roadmap items: { step, phase, title, description, tags }

Never use: finding, detail, name, body, heading, dimension, winner, result, timeframe, or any other field name.
The frontend reads these exact keys. Any deviation causes blank UI.

JSON SCHEMA (must match exactly):
{
  "meta": { "clientName": string, "clientUrl": string, "competitorName": string, "competitorUrl": string, "generatedAt": string },
  "hero": {
    "headline": string,
    "subheadline": string,
    "stats": [ exactly 4 items: { "value", "label", "note" } ]
  },
  "overview": { "clientSummary": string, "competitorSummary": string },
  "topFindings": [ exactly 3 items with "title", "teaser", "fullDescription", "severity": "high"|"medium"|"low" ],
  "comparison": [ 10-12 rows: { "category", "competitor", "client", "advantage": "client"|"competitor"|"even", "advantageNote" } ],
  "advantages": [ 4-6 items: { "title", "description", "badge" } ],
  "opportunities": [ 4-6 items: { "title", "description", "priority": "high"|"medium"|"low" } ],
  "threats": [ 2-4 items: { "title", "description" } ],
  "roadmap": [ 6 steps: { "step": number, "phase", "title", "description", "tags": string[] } ],
  "cta": { "headline": string, "body": string }
}`;

function buildSystemPrompt(industry: string): string {
  const vertical = getVertical(industry);
  const verticalBlock = `
---
INDUSTRY VERTICAL: ${vertical.label}
VOICE & TONE FOR THIS VERTICAL: ${vertical.tone}
ANALYSIS PRIORITIES: ${vertical.contextHints}

Write the entire report in a voice and framing that matches this industry and tone.
Tailor examples, terminology, and recommendations to what actually matters in ${vertical.label}.
A dental report should reference patient trust and insurance. A fitness report should reference membership friction and transformation. A restaurant report should reference reviews and delivery. Be specific to the industry — not generic.
`;

  return BASE_SYSTEM_PROMPT + verticalBlock + '\n\nReturn ONLY the JSON object. Nothing else.';
}

export async function analyzeWithClaude(
  clientContent: string,
  competitorContent: string,
  clientName: string,
  clientUrl: string,
  competitorName: string,
  competitorUrl: string,
  industry: string = 'general',
  anthropicModelId: string = resolveReportModelId()
): Promise<ReportData> {
  const userPrompt = `Analyze CLIENT vs COMPETITOR below. Return ONLY valid JSON matching the schema in your instructions.

CLIENT: ${clientName}
URL: ${clientUrl}

${clientContent}

---

COMPETITOR: ${competitorName}
URL: ${competitorUrl}

${competitorContent}`;

  const response = await client.messages.create({
    model: anthropicModelId,
    max_tokens: 8000,
    system: buildSystemPrompt(industry),
    messages: [{ role: 'user', content: userPrompt }],
  });

  const rawText = response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: 'text'; text: string }).text)
    .join('');

  const cleaned = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const parsed = JSON.parse(cleaned) as ReportData;
  parsed.meta.generatedAt = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/New_York',
  }).format(new Date());
  return parsed;
}
