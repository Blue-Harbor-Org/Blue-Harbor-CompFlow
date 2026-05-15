const UNSPLASH_BASE = 'https://api.unsplash.com';
const PEXELS_BASE = 'https://api.pexels.com/v1';

export type MediaPhoto = {
  url: string;
  thumb: string;
  alt: string;
  credit: string;
  creditUrl: string;
  source: 'unsplash' | 'pexels';
};

export type MediaIcon = {
  svg: string;
  name: string;
};

let warnedUnsplash = false;
let warnedPexels = false;

export async function fetchPhotos(query: string, count = 6): Promise<MediaPhoto[]> {
  const results: MediaPhoto[] = [];

  try {
    const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!unsplashKey || unsplashKey === 'your_unsplash_access_key') {
      if (!warnedUnsplash) {
        console.warn('[mockup-media] UNSPLASH_ACCESS_KEY missing; skipping Unsplash photos.');
        warnedUnsplash = true;
      }
    } else {
      const res = await fetch(
        `${UNSPLASH_BASE}/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`,
        { headers: { Authorization: `Client-ID ${unsplashKey}` } }
      );
      if (res.ok) {
        const data = await res.json() as {
          results?: Array<{
            urls?: { regular?: string; thumb?: string };
            alt_description?: string | null;
            user?: { name?: string; links?: { html?: string } };
          }>;
        };
        for (const photo of data.results ?? []) {
          if (!photo.urls?.regular) continue;
          results.push({
            url: photo.urls.regular,
            thumb: photo.urls.thumb ?? photo.urls.regular,
            alt: photo.alt_description ?? query,
            credit: photo.user?.name ?? 'Unsplash photographer',
            creditUrl: photo.user?.links?.html ?? 'https://unsplash.com',
            source: 'unsplash',
          });
        }
      }
    }
  } catch (error) {
    console.warn('[mockup-media] Unsplash fetch failed:', error);
  }

  if (results.length < count) {
    try {
      const pexelsKey = process.env.PEXELS_API_KEY;
      if (!pexelsKey || pexelsKey === 'your_pexels_api_key') {
        if (!warnedPexels) {
          console.warn('[mockup-media] PEXELS_API_KEY missing; skipping Pexels photos.');
          warnedPexels = true;
        }
      } else {
        const needed = count - results.length;
        const res = await fetch(
          `${PEXELS_BASE}/search?query=${encodeURIComponent(query)}&per_page=${needed}&orientation=landscape`,
          { headers: { Authorization: pexelsKey } }
        );
        if (res.ok) {
          const data = await res.json() as {
            photos?: Array<{
              src?: { large2x?: string; large?: string; tiny?: string };
              alt?: string;
              photographer?: string;
              photographer_url?: string;
            }>;
          };
          for (const photo of data.photos ?? []) {
            const url = photo.src?.large2x ?? photo.src?.large;
            if (!url) continue;
            results.push({
              url,
              thumb: photo.src?.tiny ?? url,
              alt: photo.alt ?? query,
              credit: photo.photographer ?? 'Pexels photographer',
              creditUrl: photo.photographer_url ?? 'https://pexels.com',
              source: 'pexels',
            });
          }
        }
      }
    } catch (error) {
      console.warn('[mockup-media] Pexels fetch failed:', error);
    }
  }

  return results.slice(0, count);
}

export async function fetchIcon(iconName: string): Promise<MediaIcon | null> {
  try {
    const [collection, name] = iconName.split(':');
    if (!collection || !name) return null;
    const res = await fetch(`https://api.iconify.design/${collection}/${name}.svg?color=%23currentColor&width=24&height=24`);
    if (!res.ok) return null;
    const svg = await res.text();
    return { svg, name: iconName };
  } catch {
    return null;
  }
}

export function getIndustryIcons(industry: string): string[] {
  const iconMap: Record<string, string[]> = {
    plumber: ['lucide:droplets', 'lucide:wrench', 'lucide:phone', 'lucide:star', 'lucide:clock', 'lucide:shield-check'],
    hvac: ['lucide:thermometer', 'lucide:wind', 'lucide:wrench', 'lucide:phone', 'lucide:star', 'lucide:home'],
    contractor: ['lucide:hard-hat', 'lucide:hammer', 'lucide:ruler', 'lucide:phone', 'lucide:star', 'lucide:shield-check'],
    restaurant: ['lucide:utensils', 'lucide:clock', 'lucide:map-pin', 'lucide:star', 'lucide:phone', 'lucide:calendar'],
    legal: ['lucide:scale', 'lucide:shield', 'lucide:file-text', 'lucide:phone', 'lucide:star', 'lucide:users'],
    medical: ['lucide:stethoscope', 'lucide:heart', 'lucide:shield-check', 'lucide:phone', 'lucide:clock', 'lucide:calendar'],
    dental: ['lucide:smile', 'lucide:shield-check', 'lucide:star', 'lucide:phone', 'lucide:clock', 'lucide:calendar'],
    spa: ['lucide:sparkles', 'lucide:heart', 'lucide:star', 'lucide:clock', 'lucide:phone', 'lucide:calendar'],
    gym: ['lucide:dumbbell', 'lucide:heart', 'lucide:star', 'lucide:users', 'lucide:clock', 'lucide:zap'],
    realtor: ['lucide:home', 'lucide:map-pin', 'lucide:key', 'lucide:phone', 'lucide:star', 'lucide:trending-up'],
    finance: ['lucide:trending-up', 'lucide:shield', 'lucide:dollar-sign', 'lucide:phone', 'lucide:users', 'lucide:lock'],
    salon: ['lucide:sparkles', 'lucide:scissors', 'lucide:star', 'lucide:phone', 'lucide:clock', 'lucide:calendar'],
  };
  const key = Object.keys(iconMap).find((k) => industry.toLowerCase().includes(k));
  return iconMap[key ?? ''] ?? ['lucide:star', 'lucide:phone', 'lucide:map-pin', 'lucide:clock', 'lucide:shield-check', 'lucide:users'];
}

export function buildPhotoQuery(industry: string, businessName: string): string {
  const queryMap: Record<string, string> = {
    plumber: 'plumbing professional work pipes',
    hvac: 'hvac air conditioning technician',
    contractor: 'construction renovation professional',
    restaurant: 'restaurant food interior dining',
    legal: 'law office professional meeting',
    medical: 'medical clinic healthcare professional',
    dental: 'dental office smile professional',
    spa: 'spa wellness relaxation treatment',
    gym: 'gym fitness workout training',
    realtor: 'real estate house property modern',
    finance: 'finance business professional meeting',
    salon: 'hair salon beauty professional',
  };
  const key = Object.keys(queryMap).find((k) => industry.toLowerCase().includes(k));
  return queryMap[key ?? ''] ?? `${industry || businessName} professional business`;
}
