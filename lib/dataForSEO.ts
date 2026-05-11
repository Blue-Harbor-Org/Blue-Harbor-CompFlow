import { createAdminClient } from '@/lib/supabase';

/** Cached SEO snapshot from DataForSEO Labs (domain rank overview). */
export interface SEOData {
  domain: string;
  summary: string;
  keywords?: string[];
  organicTraffic?: number | null;
  organicKeywords?: number | null;
  domainRank?: number | null;
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const DOMAIN_RANK_OVERVIEW_URL =
  'https://api.dataforseo.com/v3/dataforseo_labs/google/domain_rank_overview/live';

export function cleanDomain(urlOrDomain: string): string {
  return urlOrDomain
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
    .toLowerCase();
}

/** Extract first domain item + organic metrics from Labs domain_rank_overview JSON. */
function parseDomainRankOverviewPayload(data: unknown): {
  item: Record<string, unknown> | null;
  metricsOrganic: Record<string, unknown> | null;
  taskStatusCode: number | null;
  taskStatusMessage: string | null;
} {
  const root = data as Record<string, unknown> | null;
  const tasks = root?.tasks;
  const task0 =
    Array.isArray(tasks) && tasks.length > 0 ? (tasks[0] as Record<string, unknown>) : null;
  const taskStatusCode =
    typeof task0?.status_code === 'number' ? task0.status_code : null;
  const taskStatusMessage =
    typeof task0?.status_message === 'string' ? task0.status_message : null;

  const results = task0?.result;
  const resultArr = Array.isArray(results) ? results : [];
  const block0 =
    resultArr.length > 0 ? (resultArr[0] as Record<string, unknown>) : null;

  let item: Record<string, unknown> | null = null;

  const items = block0?.items;
  if (Array.isArray(items) && items.length > 0) {
    item = items[0] as Record<string, unknown>;
  } else if (block0 && typeof block0 === 'object' && !Array.isArray(block0)) {
    // Some responses expose metrics directly on the first result row
    if ('metrics' in block0 || 'domain_rank' in block0) {
      item = block0;
    }
  }

  let metricsOrganic: Record<string, unknown> | null = null;
  if (item?.metrics && typeof item.metrics === 'object' && item.metrics !== null) {
    const m = item.metrics as Record<string, unknown>;
    if (m.organic && typeof m.organic === 'object') {
      metricsOrganic = m.organic as Record<string, unknown>;
    }
  }

  return { item, metricsOrganic, taskStatusCode, taskStatusMessage };
}

async function fetchSEODataFromAPI(cleanDomainValue: string): Promise<SEOData | null> {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;

  console.log('[DataForSEO] login set:', !!login);
  console.log('[DataForSEO] password set:', !!password);

  if (!login || !password) {
    console.warn('[DataForSEO] credentials missing — returning stub (no real API call)');
    return {
      domain: cleanDomainValue,
      summary:
        'SEO API not configured (set DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD). Analysis uses scraped site content only.',
      organicTraffic: null,
      organicKeywords: null,
      domainRank: null,
      keywords: [],
    };
  }

  try {
    console.log('[DataForSEO] fetching domain_rank_overview for:', cleanDomainValue);

    const authHeader = `Basic ${Buffer.from(`${login}:${password}`).toString('base64')}`;
    const response = await fetch(DOMAIN_RANK_OVERVIEW_URL, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        {
          target: cleanDomainValue,
          location_code: 2840,
          language_code: 'en',
        },
      ]),
      signal: AbortSignal.timeout(15_000),
    });

    console.log('[DataForSEO] response status:', response.status);

    const data = (await response.json()) as Record<string, unknown>;
    console.log('[DataForSEO] raw response:', JSON.stringify(data).slice(0, 1000));

    const { item, metricsOrganic, taskStatusCode, taskStatusMessage } =
      parseDomainRankOverviewPayload(data);

    if (!response.ok) {
      return {
        domain: cleanDomainValue,
        summary: `DataForSEO HTTP ${response.status}${taskStatusMessage ? ` — ${taskStatusMessage}` : ''}`,
        organicTraffic: null,
        organicKeywords: null,
        domainRank: null,
        keywords: [],
      };
    }

    if (taskStatusCode !== null && taskStatusCode !== 20000) {
      console.warn('[DataForSEO] task status_code:', taskStatusCode, taskStatusMessage);
    }

    const organicTraffic =
      metricsOrganic?.etv !== undefined && metricsOrganic?.etv !== null
        ? Number(metricsOrganic.etv)
        : null;
    const organicKeywords =
      metricsOrganic?.count !== undefined && metricsOrganic?.count !== null
        ? Number(metricsOrganic.count)
        : null;
    const domainRank =
      item?.domain_rank !== undefined && item?.domain_rank !== null
        ? Number(item.domain_rank)
        : null;

    const etvLabel =
      organicTraffic !== null && !Number.isNaN(organicTraffic)
        ? String(organicTraffic)
        : 'unknown';
    const kwLabel =
      organicKeywords !== null && !Number.isNaN(organicKeywords)
        ? String(organicKeywords)
        : 'unknown';
    const rankLabel =
      domainRank !== null && !Number.isNaN(domainRank)
        ? String(domainRank)
        : 'unknown';

    return {
      domain: cleanDomainValue,
      organicTraffic: Number.isNaN(organicTraffic as number) ? null : organicTraffic,
      organicKeywords: Number.isNaN(organicKeywords as number) ? null : organicKeywords,
      domainRank: Number.isNaN(domainRank as number) ? null : domainRank,
      summary: `Organic traffic (ETV): ${etvLabel}, Keywords: ${kwLabel}, Domain rank: ${rankLabel}`,
      keywords: [],
    };
  } catch (err) {
    console.error('[DataForSEO] error:', err);
    return {
      domain: cleanDomainValue,
      summary: `DataForSEO fetch failed: ${err instanceof Error ? err.message : String(err)}`,
      organicTraffic: null,
      organicKeywords: null,
      domainRank: null,
      keywords: [],
    };
  }
}

export async function getSEOData(urlOrDomain: string): Promise<SEOData | null> {
  const domain = cleanDomain(urlOrDomain);

  console.log('[DataForSEO] getSEOData called for domain:', domain);

  const supabase = createAdminClient();

  const { data: cached } = await supabase
    .from('seo_cache')
    .select('data, fetched_at')
    .eq('domain', domain)
    .maybeSingle();

  if (cached?.fetched_at) {
    const age = Date.now() - new Date(cached.fetched_at).getTime();
    if (age < SEVEN_DAYS_MS && cached.data) {
      console.log(`[DataForSEO] cache hit for ${domain} (age: ${Math.round(age / 60000)}min)`);
      return cached.data as SEOData;
    }
    console.log(`[DataForSEO] cache stale for ${domain} — fetching fresh`);
  } else {
    console.log(`[DataForSEO] no cache entry for ${domain} — fetching fresh`);
  }

  const fresh = await fetchSEODataFromAPI(domain);

  console.log('[DataForSEO] fresh result:', fresh ? `got data (summary: ${fresh.summary.slice(0, 80)}...)` : 'null');

  if (fresh) {
    await supabase.from('seo_cache').upsert(
      {
        domain,
        data: fresh,
        fetched_at: new Date().toISOString(),
      },
      { onConflict: 'domain' }
    );
  }

  return fresh;
}
