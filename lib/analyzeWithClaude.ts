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
- roadmap must have 6 steps`;

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

  return BASE_SYSTEM_PROMPT + verticalBlock;
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
  const prompt = `Analyze these two businesses and return the competitive audit JSON.

CLIENT (writing FOR them):
Name: ${clientName}
URL: ${clientUrl}
Content: ${clientContent}

COMPETITOR (their main competition):
Name: ${competitorName}
URL: ${competitorUrl}
Content: ${competitorContent}

Return a single JSON object matching this schema exactly:
{
  "meta": { "clientName", "clientUrl", "competitorName", "competitorUrl", "generatedAt": "<ISO>" },
  "hero": {
    "headline": "<8-12 word punchy headline — client's core advantage. Start strong.>",
    "subheadline": "<1-2 sentences naming specific advantages>",
    "stats": [4 items: { "value", "label", "note" }]
  },
  "overview": { "clientSummary": "<2-3 sentences>", "competitorSummary": "<2-3 sentences>" },
  "topFindings": [exactly 3: {
    "title": "<finding title — creates urgency>",
    "teaser": "<1 sentence shown on locked teaser — intriguing, not complete>",
    "fullDescription": "<2-3 sentences — full detail shown in unlocked report>",
    "severity": "high|medium|low"
  }],
  "comparison": [10-12 rows: { "category", "competitor", "client", "advantage": "client|competitor|even", "advantageNote" }],
  "advantages": [4-6: { "title", "description": "<2-3 sentences>", "badge": "<short label>" }],
  "opportunities": [4-6: { "title", "description": "<2-3 sentences>", "priority": "high|medium|low" }],
  "threats": [2-4: { "title", "description": "<2 sentences — honest>" }],
  "roadmap": [6 steps: { "step": number, "phase": "<e.g. Days 1-14 · Immediate>", "title", "description": "<2-3 sentences>", "tags": ["tag1","tag2"] }],
  "cta": { "headline": "<8-12 word closing headline>", "body": "<2-3 sentences driving urgency>" }
}

Return ONLY the JSON. Nothing else.`;

  const response = await client.messages.create({
    model: anthropicModelId,
    max_tokens: 8000,
    system: buildSystemPrompt(industry),
    messages: [{ role: 'user', content: prompt }],
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
