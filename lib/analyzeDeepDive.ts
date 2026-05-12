import Anthropic from '@anthropic-ai/sdk';
import type { ReportData } from '@/types/report';
import type { CompetitorEntry } from '@/types/lead';
import { getVertical } from './verticals';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const DEEP_SYSTEM_BASE = `You are an elite marketing strategist at Blue Harbor producing a DEEP DIVE competitive intelligence deliverable (separate from the standard teaser report).

Use ALL supplied scraped content and enriched intel (SEO summaries, reviews/places notes). Be specific and grounded.

CRITICAL OUTPUT RULES:
- Return ONLY valid JSON — no markdown fences
- Same core report structure as standard Blue Harbor reports PLUS a top-level "deepDive" object for SEO + reviews sections
- deepDive.seo.bullets: 4-7 punchy bullets
- Ground claims in provided intel; if intel says API not configured, say so honestly in summaries

CRITICAL JSON RULES:
- Never use double quotes inside string values — use single quotes or rephrase
- Never include newlines inside string values — use spaces instead
- Never include special characters: tab, backslash, or control characters in strings
- Every string value must be on one line

CRITICAL — always use EXACTLY these field names in your JSON, no variations:

topFindings items: { title, teaser, fullDescription, severity }
comparison items: { category, competitor, client, advantage, advantageNote }
advantages items: { title, description, badge }
opportunities items: { title, description, priority }
threats items: { title, description }
roadmap items: { step, phase, title, description, tags }

Never use: finding, detail, name, body, heading, dimension, winner, result, timeframe, or any other field name.
The frontend reads these exact keys. Any deviation causes blank UI.

FULL JSON SCHEMA (field names must match exactly — do not rename any key):
{
  "meta": { "clientName": string, "clientUrl": string, "competitorName": string, "competitorUrl": string, "generatedAt": string },
  "hero": { "headline": string, "subheadline": string, "stats": [ exactly 4 items: { "value": string, "label": string, "note": string } ] },
  "overview": { "clientSummary": string, "competitorSummary": string },
  "topFindings": [ exactly 3 items: { "title": string, "teaser": string, "fullDescription": string, "severity": "high"|"medium"|"low" } ],
  "comparison": [ 10-12 rows: { "category": string, "competitor": string, "client": string, "advantage": "client"|"competitor"|"even", "advantageNote": string } ],
  "advantages": [ 4-6 items: { "title": string, "description": string, "badge": string } ],
  "opportunities": [ 4-6 items: { "title": string, "description": string, "priority": "high"|"medium"|"low" } ],
  "threats": [ 2-4 items: { "title": string, "description": string } ],
  "roadmap": [ 6 steps: { "step": number, "phase": string, "title": string, "description": string, "tags": string[] } ],
  "cta": { "headline": string, "body": string },
  "deepDive": {
    "seo": {
      "headline": string,
      "summary": string,
      "bullets": string[],
      "keywordNotes": string
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

/** Strip fences, parse, sanitize common malformed JSON, then close truncated structures. */
function extractAndParseJSON(raw: string): unknown {
  let cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    console.log('[Claude] Direct parse failed, trying sanitization...');
  }

  cleaned = cleaned.replace(/[\x00-\x1F\x7F]/g, ' ');
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');

  try {
    return JSON.parse(cleaned);
  } catch {
    console.log('[Claude] Sanitized parse failed, trying repair...');
  }

  const openBraces =
    (cleaned.match(/{/g) || []).length - (cleaned.match(/}/g) || []).length;
  const openBrackets =
    (cleaned.match(/\[/g) || []).length - (cleaned.match(/\]/g) || []).length;
  let repaired = cleaned.trimEnd();
  repaired = repaired.replace(/,\s*$/, '');
  for (let i = 0; i < openBrackets; i++) repaired += ']';
  for (let i = 0; i < openBraces; i++) repaired += '}';

  try {
    return JSON.parse(repaired);
  } catch (e3) {
    console.error('[Claude] All parse attempts failed. Raw snippet around error:');
    console.error(cleaned.slice(4800, 5000));
    throw new Error(
      `Deep dive JSON parse failed: ${e3 instanceof Error ? e3.message : String(e3)}`
    );
  }
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
    max_tokens: 12000,
    system: buildDeepSystem(industry),
    messages: [{ role: 'user', content: userPrompt }],
  });

  const rawText = response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: 'text'; text: string }).text)
    .join('');

  let parsed: ReportData;
  try {
    parsed = extractAndParseJSON(rawText) as ReportData;
  } catch (err) {
    console.error('[analyzeDeepDive] JSON parse failed. Raw text length:', rawText.length, 'Stop reason:', response.stop_reason);
    console.error('[analyzeDeepDive] Raw text tail:', rawText.slice(-500));
    throw new Error(`Deep dive JSON parse failed (stop_reason=${response.stop_reason}): ${err}`);
  }
  parsed.meta.generatedAt = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/New_York',
  }).format(new Date());
  return parsed;
}

const DEEP_MULTI_SYSTEM_BASE = `You are an elite marketing strategist at Blue Harbor producing a DEEP DIVE competitive intelligence deliverable analyzing ONE CLIENT against MULTIPLE COMPETITORS.

Use ALL supplied scraped content and enriched intel (SEO summaries, reviews/places notes). Be specific and grounded.

CRITICAL OUTPUT RULES:
- Return ONLY valid JSON — no markdown fences
- Same hero/overview/topFindings/advantages/opportunities/roadmap/cta/deepDive structure as standard deep dives
- PLUS "competitorRankings" array (required for multi): rank each named competitor by threat level
- comparison rows MUST use MULTI shape (not legacy two-column):
  { "category", "client", "competitors": [ { "name", "value" } ], "topCompetitor", "clientAdvantage": boolean, "advantageNote" }
- threats items may include optional "competitorName" when a specific competitor is referenced
- overview may include "competitorSummaries": [ { "name", "summary" } ] one per competitor
- meta may include "competitors": [ { "name", "url" } ] listing all analyzed competitors
- deepDive.reviews may include "competitorSummaries": [ { "name", "summary" } ] for reputation per competitor

CRITICAL JSON RULES:
- Never use double quotes inside string values — use single quotes or rephrase
- Never include newlines inside string values — use spaces instead
- Never include special characters: tab, backslash, or control characters in strings

FIELD NAMES (exact):
topFindings: { title, teaser, fullDescription, severity }
comparison (MULTI): { category, client, competitors (array of {name,value}), topCompetitor, clientAdvantage, advantageNote }
advantages, opportunities, threats (optional competitorName), roadmap, cta
deepDive.seo, deepDive.reviews (optional competitorSummaries array)
competitorRankings: [ { name, threatLevel: high|medium|low, summary } ]

Never rename keys.`;

function buildDeepMultiSystem(industry: string, competitorNames: string[]): string {
  const vertical = getVertical(industry);
  return `${DEEP_MULTI_SYSTEM_BASE}

COMPETITORS IN THIS ANALYSIS (${competitorNames.length}): ${competitorNames.join(', ')}

INDUSTRY VERTICAL: ${vertical.label}
TONE: ${vertical.tone}
PRIORITIES: ${vertical.contextHints}

Return ONLY the JSON object.`;
}

export async function analyzeDeepDiveMultiWithClaude(
  clientContent: string,
  clientName: string,
  clientUrl: string,
  competitorInputs: { entry: CompetitorEntry; content: string }[],
  enrichedIntel: string,
  industry: string,
  anthropicModelId: string
): Promise<ReportData> {
  const names = competitorInputs.map((c) => c.entry.name);
  const competitorBlocks = competitorInputs
    .map(
      (c, i) => `---

COMPETITOR ${i + 1}: ${c.entry.name} (${c.entry.url})

${c.content}`
    )
    .join('\n');

  const userPrompt = `Deep dive MULTI-COMPETITOR analysis. Return ONLY JSON per schema.

ENRICHED INTEL:
${enrichedIntel}

---

CLIENT: ${clientName} (${clientUrl})

${clientContent}
${competitorBlocks}`;

  const response = await client.messages.create({
    model: anthropicModelId,
    max_tokens: 14000,
    system: buildDeepMultiSystem(industry, names),
    messages: [{ role: 'user', content: userPrompt }],
  });

  const rawText = response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: 'text'; text: string }).text)
    .join('');

  let parsed: ReportData;
  try {
    parsed = extractAndParseJSON(rawText) as ReportData;
  } catch (err) {
    console.error('[analyzeDeepDiveMulti] JSON parse failed. Raw tail:', rawText.slice(-500));
    throw new Error(`Deep dive multi JSON parse failed: ${err}`);
  }

  parsed.meta.generatedAt = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/New_York',
  }).format(new Date());

  parsed.meta.competitors = competitorInputs.map((c) => ({
    name: c.entry.name,
    url: c.entry.url,
  }));
  parsed.meta.competitorName = names[0] ?? parsed.meta.competitorName;
  parsed.meta.competitorUrl = competitorInputs[0]?.entry.url ?? parsed.meta.competitorUrl;

  return parsed;
}
