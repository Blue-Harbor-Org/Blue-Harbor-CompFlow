import { randomUUID } from 'crypto';
import type { CompetitorEntry, Lead } from '@/types/lead';
import { cleanDomain } from '@/lib/dataForSEO';
import { findCompetitors, formatDomainAsName } from '@/lib/findCompetitors';
import { normalizeIndustryId } from '@/lib/verticals';

export function normalizeHttpUrl(url: string): string {
  const t = url.trim();
  if (!t) return '';
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

export function domainsMatch(a: string, b: string): boolean {
  return cleanDomain(a) === cleanDomain(b);
}

/** Parse JSONB competitors from DB */
export function parseCompetitors(raw: unknown): CompetitorEntry[] {
  if (!raw) return [];
  if (!Array.isArray(raw)) return [];
  const out: CompetitorEntry[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    const id = typeof o.id === 'string' ? o.id : randomUUID();
    const name = typeof o.name === 'string' ? o.name : '';
    const url = typeof o.url === 'string' ? normalizeHttpUrl(o.url) : '';
    const source = o.source === 'manual' ? 'manual' : 'auto';
    const autoFound = Boolean(o.autoFound);
    if (!url) continue;
    out.push({ id, name: name || formatDomainAsName(cleanDomain(url)), url, source, autoFound });
  }
  return out;
}

/** Resolved list: competitors JSON first, else legacy columns */
export function getResolvedCompetitors(lead: Lead): CompetitorEntry[] {
  const fromJson = parseCompetitors(lead.competitors);
  if (fromJson.length > 0) return fromJson.slice(0, 3);
  const legacyUrl = lead.competitor_url?.trim();
  if (legacyUrl) {
    return [
      {
        id: randomUUID(),
        name: lead.competitor_name?.trim() || formatDomainAsName(cleanDomain(legacyUrl)),
        url: normalizeHttpUrl(legacyUrl),
        source: 'manual',
        autoFound: false,
      },
    ];
  }
  return [];
}

/** Build up to 3 competitors: manual first, then DataForSEO fill */
export async function buildCompetitorsForNewLead(options: {
  websiteUrl: string;
  competitorUrl?: string | null;
  competitorName?: string | null;
  industry?: string | null;
}): Promise<CompetitorEntry[]> {
  const industry = normalizeIndustryId(options.industry);
  const competitors: CompetitorEntry[] = [];
  const manualUrl = options.competitorUrl?.trim();
  if (manualUrl) {
    competitors.push({
      id: randomUUID(),
      name:
        options.competitorName?.trim() ||
        formatDomainAsName(cleanDomain(manualUrl)),
      url: normalizeHttpUrl(manualUrl),
      source: 'manual',
      autoFound: false,
    });
  }

  if (competitors.length >= 3) return competitors.slice(0, 3);

  const need = 3 - competitors.length;
  const autoFound = await findCompetitors(options.websiteUrl, industry, need + 2);
  for (const c of autoFound) {
    if (competitors.length >= 3) break;
    if (competitors.some((ex) => domainsMatch(ex.url, c.url))) continue;
    competitors.push(c);
  }

  return competitors.slice(0, 3);
}
