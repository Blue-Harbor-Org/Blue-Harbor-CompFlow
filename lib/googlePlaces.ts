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

  console.log('[Places] API key set:', !!key);

  if (!key) {
    console.warn('[Places] GOOGLE_PLACES_API_KEY not set — returning stub');
    return {
      domain,
      summary: `Review/rating intel not fetched (set GOOGLE_PLACES_API_KEY). Business hint: ${businessHint}.`,
    };
  }

  console.log('[Places] fetching from Google Places API for:', domain, businessHint);

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

  console.log('[Places] getPlacesSummary called for domain:', domain, '| hint:', businessNameHint);

  const supabase = createAdminClient();

  const { data: cached } = await supabase
    .from('places_cache')
    .select('data, fetched_at')
    .eq('domain', domain)
    .maybeSingle();

  if (cached?.fetched_at) {
    const age = Date.now() - new Date(cached.fetched_at).getTime();
    if (age < SEVEN_DAYS_MS && cached.data) {
      console.log(`[Places] cache hit for ${domain} (age: ${Math.round(age / 60000)}min)`);
      return cached.data as PlacesData;
    }
    console.log(`[Places] cache stale for ${domain} — fetching fresh`);
  } else {
    console.log(`[Places] no cache entry for ${domain} — fetching fresh`);
  }

  const fresh = await fetchPlacesFromAPI(domain, businessNameHint);

  console.log('[Places] fresh result:', fresh ? `got data (summary: ${fresh.summary.slice(0, 80)}...)` : 'null');

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
