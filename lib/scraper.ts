import * as cheerio from 'cheerio';

/** Priority order — highest value pages first; trimmed as needed */
export const PAGE_PRIORITY = [
  { path: '', label: 'HOMEPAGE', maxChars: 2000 },
  { path: '/services', label: 'SERVICES', maxChars: 2000 },
  { path: '/our-services', label: 'SERVICES', maxChars: 2000 },
  { path: '/pricing', label: 'PRICING', maxChars: 1500 },
  { path: '/about', label: 'ABOUT', maxChars: 1000 },
  { path: '/about-us', label: 'ABOUT', maxChars: 1000 },
  { path: '/team', label: 'TEAM', maxChars: 800 },
  { path: '/reviews', label: 'REVIEWS', maxChars: 800 },
  { path: '/contact', label: 'CONTACT', maxChars: 400 },
];

/** Total cap across all stitched pages (cost control) */
export const MAX_TOTAL_CHARS = 6000;

function sliceText(text: string, maxChars: number): string {
  const t = text.trim();
  return t.length <= maxChars ? t : `${t.slice(0, maxChars)}…`;
}

export async function scrapeWebsite(url: string): Promise<string> {
  try {
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;

    const response = await fetch(normalizedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BlueHarborBot/1.0)',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const html = await response.text();
    const $ = cheerio.load(html);

    $('script, style, noscript, iframe, nav, footer').remove();

    const title = $('title').text().trim();
    const metaDesc = $('meta[name="description"]').attr('content') || '';
    const h1s = $('h1').map((_, el) => $(el).text().trim()).get().join(' · ');
    const h2s = $('h2').map((_, el) => $(el).text().trim()).get().slice(0, 10).join(' · ');
    const h3s = $('h3').map((_, el) => $(el).text().trim()).get().slice(0, 10).join(' · ');

    const bodyText = $('p, li')
      .map((_, el) => $(el).text().trim())
      .get()
      .filter((t) => t.length > 30)
      .slice(0, 40)
      .join(' ');

    const content = [
      `TITLE: ${title}`,
      `META DESCRIPTION: ${metaDesc}`,
      `H1 HEADINGS: ${h1s}`,
      `H2 HEADINGS: ${h2s}`,
      `H3 HEADINGS: ${h3s}`,
      `BODY CONTENT: ${bodyText}`,
    ].join('\n\n');

    return sliceText(content, 6000);
  } catch (error) {
    console.error(`Scraping failed for ${url}:`, error);
    return `Could not scrape ${url}. Limited analysis available.`;
  }
}

/**
 * Multi-path scrape with per-page caps and global trim (~6k chars).
 */
export async function scrapeMultiPageBundle(baseUrl: string): Promise<string> {
  const root = baseUrl.replace(/\/$/, '');
  const normalizedRoot = root.startsWith('http') ? root : `https://${root}`;

  const chunks: string[] = [];

  for (const page of PAGE_PRIORITY) {
    const url = `${normalizedRoot}${page.path}`;
    try {
      const raw = await scrapeWebsite(url);
      const trimmed = sliceText(raw, page.maxChars);
      chunks.push(`=== ${page.label} (${page.path || '/'}) ===\n${trimmed}`);
    } catch {
      // skip failed paths
    }
  }

  return trimForTokens(chunks);
}

/** Stitch labeled chunks and enforce global max */
export function trimForTokens(labeledChunks: string[]): string {
  const combined = labeledChunks.join('\n\n');
  if (combined.length <= MAX_TOTAL_CHARS) return combined;

  const overflow = combined.length - MAX_TOTAL_CHARS;
  console.warn(`[scraper] Trimming ${overflow} chars from multi-page bundle`);
  return `${combined.slice(0, MAX_TOTAL_CHARS)}…`;
}
