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
  if (!login || !password) {
    return {
      domain,
      summary:
        'SEO API not configured (set DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD). Analysis uses scraped site content only.',
    };
  }

  // Placeholder: wire DataForSEO endpoints here when credentials exist.
  return {
    domain,
    summary: `Keyword & ranking snapshot for ${domain} (configure endpoint mapping).`,
    keywords: [],
  };
}

export async function getSEOData(urlOrDomain: string): Promise<SEOData | null> {
  const domain = cleanDomain(urlOrDomain);
  const supabase = createAdminClient();

  const { data: cached } = await supabase
    .from('seo_cache')
    .select('data, fetched_at')
    .eq('domain', domain)
    .maybeSingle();

  if (cached?.fetched_at) {
    const age = Date.now() - new Date(cached.fetched_at).getTime();
    if (age < SEVEN_DAYS_MS && cached.data) {
      console.log(`[SEO] cache hit for ${domain}`);
      return cached.data as SEOData;
    }
  }

  const fresh = await fetchSEODataFromAPI(domain);
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
