import Anthropic from '@anthropic-ai/sdk';
import type { ReportData } from '@/types/report';
import { getVertical } from './verticals';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const DEEP_SYSTEM_BASE = `You are an elite marketing strategist at Blue Harbor producing a DEEP DIVE competitive intelligence deliverable (separate from the standard teaser report).

Use ALL supplied scraped content and enriched intel (SEO summaries, reviews/places notes). Be specific and grounded.

CRITICAL OUTPUT RULES:
- Return ONLY valid JSON — no markdown fences
- Same core report structure as standard Blue Harbor reports PLUS a top-level "deepDive" object for SEO + reviews sections
- deepDive.seo.bullets: 4-7 punchy bullets
- Ground claims in provided intel; if intel says API not configured, say so honestly in summaries

FULL JSON SCHEMA:
{
  "meta": { "clientName", "clientUrl", "competitorName", "competitorUrl", "generatedAt" },
  "hero": { "headline", "subheadline", "stats": [4 items] },
  "overview": { "clientSummary", "competitorSummary" },
  "topFindings": [ exactly 3 ],
  "comparison": [ 10-12 rows ],
  "advantages": [ 4-6 ],
  "opportunities": [ 4-6 ],
  "threats": [ 2-4 ],
  "roadmap": [ 6 steps ],
  "cta": { "headline", "body" },
  "deepDive": {
    "seo": {
      "headline": string,
      "summary": string,
      "bullets": string[],
      "keywordNotes": string (optional)
    },
    "reviews": {
      "headline": string,
      "clientSummary": string,
      "competitorSummary": string,
      "recommendation": string
    }
  }
}`;

function buildDeepSystem(industry: string): string {
  const vertical = getVertical(industry);
  return `${DEEP_SYSTEM_BASE}

INDUSTRY VERTICAL: ${vertical.label}
TONE: ${vertical.tone}
PRIORITIES: ${vertical.contextHints}

Return ONLY the JSON object.`;
}

export async function analyzeDeepDiveWithClaude(
  clientContent: string,
  competitorContent: string,
  clientName: string,
  clientUrl: string,
  competitorName: string,
  competitorUrl: string,
  enrichedIntel: string,
  industry: string,
  anthropicModelId: string
): Promise<ReportData> {
  const userPrompt = `Deep dive analysis — CLIENT vs COMPETITOR. Return ONLY JSON per schema.

ENRICHED INTEL:
${enrichedIntel}

---

CLIENT: ${clientName} (${clientUrl})

${clientContent}

---

COMPETITOR: ${competitorName} (${competitorUrl})

${competitorContent}`;

  const response = await client.messages.create({
    model: anthropicModelId,
    max_tokens: 8000,
    system: buildDeepSystem(industry),
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
