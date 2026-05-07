import { createAdminClient } from '@/lib/supabase';

export interface SEOData {
  domain: string;
  summary: string;
  keywords?: string[];
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function cleanDomain(urlOrDomain: string): string {
  return urlOrDomain
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
    .toLowerCase();
}

async function fetchSEODataFromAPI(domain: string): Promise<SEOData | null> {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;

  console.log('[DataForSEO] login set:', !!login);
  console.log('[DataForSEO] password set:', !!password);

  if (!login || !password) {
    console.warn('[DataForSEO] credentials missing — returning stub (no real API call)');
    return {
      domain,
      summary:
        'SEO API not configured (set DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD). Analysis uses scraped site content only.',
    };
  }

  try {
    console.log('[DataForSEO] fetching from API for domain:', domain);

    const credentials = Buffer.from(`${login}:${password}`).toString('base64');
    const response = await fetch('https://api.dataforseo.com/v3/serp/google/organic/live/advanced', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{ keyword: `${domain}`, location_code: 2840, language_code: 'en', device: 'desktop', os: 'windows', depth: 10 }]),
    });

    console.log('[DataForSEO] response status:', response.status);

    const data = await response.json() as Record<string, unknown>;
    console.log('[DataForSEO] response data (first 500 chars):', JSON.stringify(data).slice(0, 500));

    return {
      domain,
      summary: `DataForSEO status ${response.status} — raw data logged server-side. Configure endpoint mapping to extract ranking data.`,
      keywords: [],
    };
  } catch (err) {
    console.error('[DataForSEO] error:', err);
    return {
      domain,
      summary: `DataForSEO fetch failed: ${err instanceof Error ? err.message : String(err)}`,
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
