import type { MultiComparisonRow } from '@/types/report';

/** Defensive readers for AI JSON that may use alternate field names across generations. */

function pickString(obj: unknown, keys: string[]): string {
  if (!obj || typeof obj !== 'object') return '';
  const o = obj as Record<string, unknown>;
  for (const k of keys) {
    const v = o[k];
    if (typeof v === 'string' && v.trim()) return v;
  }
  return '';
}

export function getFindingTitle(finding: unknown): string {
  return pickString(finding, ['title', 'finding', 'heading', 'name']);
}

export function getFindingTeaser(finding: unknown): string {
  return pickString(finding, ['teaser', 'detail', 'description', 'summary']);
}

export function getFindingFullDescription(finding: unknown): string {
  return pickString(finding, [
    'fullDescription',
    'full_description',
    'detail',
    'description',
    'body',
  ]);
}

export function getFindingSeverity(finding: unknown): string {
  return pickString(finding, ['severity', 'priority', 'level']) || 'medium';
}

export function getFindingBody(finding: unknown, showFull: boolean): string {
  if (showFull) {
    const full = getFindingFullDescription(finding);
    if (full) return full;
    return getFindingTeaser(finding);
  }
  const teaser = getFindingTeaser(finding);
  if (teaser) return teaser;
  return getFindingFullDescription(finding);
}

export function getComparisonCategory(row: unknown): string {
  return pickString(row, ['category', 'name', 'dimension']);
}

export function getComparisonCompetitor(row: unknown): string {
  return pickString(row, [
    'competitor',
    'competitorValue',
    'them',
    'competitor_value',
  ]);
}

export function getComparisonClient(row: unknown): string {
  return pickString(row, ['client', 'clientValue', 'us', 'client_value', 'you']);
}

export function getComparisonAdvantage(row: unknown): 'client' | 'competitor' | 'even' {
  if (!row || typeof row !== 'object') return 'even';
  const o = row as Record<string, unknown>;
  const keys = ['advantage', 'winner', 'result'] as const;
  let raw = '';
  for (const k of keys) {
    const v = o[k];
    if (typeof v === 'string' && v.trim()) {
      raw = v.toLowerCase().trim();
      break;
    }
  }
  if (raw === 'client' || raw === 'us' || raw === 'you') return 'client';
  if (raw === 'competitor' || raw === 'them') return 'competitor';
  return 'even';
}

export function getComparisonNote(row: unknown): string {
  return pickString(row, ['advantageNote', 'note', 'explanation', 'reason']);
}

export function getAdvantageTitle(adv: unknown): string {
  return pickString(adv, ['title', 'name', 'heading']);
}

export function getAdvantageDescription(adv: unknown): string {
  return pickString(adv, ['description', 'body', 'detail', 'summary', 'content']);
}

export function getAdvantageBadge(adv: unknown): string {
  return pickString(adv, ['badge', 'tag', 'label', 'category']);
}

export function getOpportunityTitle(opp: unknown): string {
  return pickString(opp, ['title', 'name', 'heading']);
}

export function getOpportunityDescription(opp: unknown): string {
  return pickString(opp, ['description', 'body', 'detail', 'summary', 'content']);
}

export function getOpportunityPriorityRaw(opp: unknown): string {
  return pickString(opp, ['priority', 'level', 'severity']) || 'medium';
}

export function getThreatTitle(threat: unknown): string {
  return pickString(threat, ['title', 'name', 'heading']);
}

export function getThreatDescription(threat: unknown): string {
  return pickString(threat, ['description', 'body', 'detail', 'summary', 'content']);
}

export function getThreatCompetitorName(threat: unknown): string {
  return pickString(threat, ['competitorName', 'competitor', 'fromCompetitor']);
}

/** Deep-dive multi comparison rows include a competitors array */
export function isMultiComparisonRows(rows: unknown): rows is MultiComparisonRow[] {
  if (!Array.isArray(rows) || rows.length === 0) return false;
  const r = rows[0];
  if (!r || typeof r !== 'object') return false;
  const o = r as Record<string, unknown>;
  return Array.isArray(o.competitors);
}

export function getRoadmapPhase(step: unknown): string {
  return pickString(step, ['phase', 'timeframe', 'stage', 'period']);
}

export function getRoadmapTitle(step: unknown): string {
  return pickString(step, ['title', 'name', 'action', 'heading']);
}

export function getRoadmapDescription(step: unknown): string {
  return pickString(step, ['description', 'body', 'detail', 'summary', 'content']);
}
