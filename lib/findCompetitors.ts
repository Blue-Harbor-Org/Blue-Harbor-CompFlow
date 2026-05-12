import { randomUUID } from 'crypto';
import type { CompetitorEntry } from '@/types/lead';
import { cleanDomain } from '@/lib/dataForSEO';

const COMPETITORS_DOMAIN_URL =
  'https://api.dataforseo.com/v3/dataforseo_labs/google/competitors_domain/live';

const EXCLUDE_DOMAINS = [
  'facebook.com',
  'instagram.com',
  'twitter.com',
  'x.com',
  'linkedin.com',
  'youtube.com',
  'yelp.com',
  'google.com',
  'wikipedia.org',
  'amazon.com',
  'indeed.com',
  'glassdoor.com',
  'bbb.org',
];

/** Convert "acmepainting.com" → "Acme Painting" */
export function formatDomainAsName(domain: string): string {
  const base = domain
    .replace(/\.(com|net|org|io|co|us|biz|ai|app)$/i, '')
    .replace(/^www\./i, '')
    .replace(/[-_]/g, ' ');
  return base
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function domainExcluded(domain: string, clientDomain: string): boolean {
  const d = domain.toLowerCase();
  if (d === clientDomain || d.endsWith(`.${clientDomain}`)) return true;
  return EXCLUDE_DOMAINS.some((ex) => d === ex || d.endsWith(`.${ex}`));
}

/**
 * Auto-find competitor domains via DataForSEO Labs (competitors_domain).
 */
export async function findCompetitors(
  websiteUrl: string,
  industry: string = 'general',
  maxResults: number = 3
): Promise<CompetitorEntry[]> {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;

  if (!login || !password) {
    console.log('[FindCompetitors] DataForSEO credentials missing — skipping auto-find');
    return [];
  }

  const domain = cleanDomain(websiteUrl);
  const auth = Buffer.from(`${login}:${password}`).toString('base64');

  try {
    console.log('[FindCompetitors] finding competitors for:', domain, '| industry:', industry);

    const response = await fetch(COMPETITORS_DOMAIN_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        {
          target: domain,
          location_code: 2840,
          language_code: 'en',
          limit: 10,
          filters: [['metrics.organic.count', '>', 0]],
          order_by: ['metrics.organic.etv,desc'],
        },
      ]),
      signal: AbortSignal.timeout(15000),
    });

    const data = (await response.json()) as {
      tasks?: { status_code?: number; result?: { items?: unknown[] }[] }[];
    };
    const task0 = data?.tasks?.[0] as Record<string, unknown> | undefined;
    console.log('[FindCompetitors] API status:', task0?.status_code);
    const results = task0?.result;
    const block0 =
      Array.isArray(results) && results.length > 0
        ? (results[0] as Record<string, unknown>)
        : null;
    const items = (block0?.items as unknown[]) ?? [];

    if (!Array.isArray(items) || items.length === 0) {
      console.log('[FindCompetitors] no competitors found from DataForSEO');
      return [];
    }

    const filtered: { domain: string }[] = [];
    for (const raw of items) {
      if (filtered.length >= maxResults) break;
      const item = raw as { domain?: string };
      const d = typeof item.domain === 'string' ? item.domain.trim().toLowerCase() : '';
      if (!d || domainExcluded(d, domain)) continue;
      filtered.push({ domain: d });
    }

    const competitors: CompetitorEntry[] = filtered.map(({ domain: dom }) => ({
      id: randomUUID(),
      name: formatDomainAsName(dom),
      url: `https://${dom}`,
      source: 'auto' as const,
      autoFound: true,
    }));

    console.log(
      '[FindCompetitors] found:',
      competitors.map((c) => c.url)
    );
    return competitors;
  } catch (err) {
    console.error('[FindCompetitors] error:', err);
    return [];
  }
}
