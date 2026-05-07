import { createAdminClient } from '@/lib/supabase';

export interface PlacesData {
  domain: string;
  summary: string;
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function cleanDomain(urlOrDomain: string): string {
  return urlOrDomain
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
    .toLowerCase();
}

async function fetchPlacesFromAPI(domain: string, businessHint: string): Promise<PlacesData | null> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) {
    return {
      domain,
      summary: `Review/rating intel not fetched (set GOOGLE_PLACES_API_KEY). Business hint: ${businessHint}.`,
    };
  }

  return {
    domain,
    summary: `Places/reviews placeholder for ${domain} (${businessHint}) — wire Places Text Search + Details.`,
  };
}

export async function getPlacesSummary(
  urlOrDomain: string,
  businessNameHint: string
): Promise<PlacesData | null> {
  const domain = cleanDomain(urlOrDomain);
  const supabase = createAdminClient();

  const { data: cached } = await supabase
    .from('places_cache')
    .select('data, fetched_at')
    .eq('domain', domain)
    .maybeSingle();

  if (cached?.fetched_at) {
    const age = Date.now() - new Date(cached.fetched_at).getTime();
    if (age < SEVEN_DAYS_MS && cached.data) {
      console.log(`[Places] cache hit for ${domain}`);
      return cached.data as PlacesData;
    }
  }

  const fresh = await fetchPlacesFromAPI(domain, businessNameHint);
  if (fresh) {
    await supabase.from('places_cache').upsert(
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
