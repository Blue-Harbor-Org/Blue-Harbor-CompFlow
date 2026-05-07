import * as cheerio from 'cheerio';

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

    return content.slice(0, 6000);
  } catch (error) {
    console.error(`Scraping failed for ${url}:`, error);
    return `Could not scrape ${url}. Limited analysis available.`;
  }
}
