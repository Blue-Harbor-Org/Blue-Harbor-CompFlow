import type { Lead } from '@/types/lead';
import { scrapeMultiPageBundle, scrapeWebsite } from '@/lib/scraper';
import { getSEOData } from '@/lib/dataForSEO';
import { getPlacesSummary } from '@/lib/googlePlaces';
import { analyzeDeepDiveWithClaude } from '@/lib/analyzeDeepDive';
import type { ReportData } from '@/types/report';
import { DEEP_CONFIG, type ReportConfig } from '@/lib/reportConfig';
import type { SEOData } from '@/lib/dataForSEO';
import type { PlacesData } from '@/lib/googlePlaces';

function intelBlock(label: string, obj: unknown): string {
  if (!obj) return `${label}: (none)`;
  try {
    return `${label}:\n${JSON.stringify(obj, null, 2)}`;
  } catch {
    return `${label}: (unavailable)`;
  }
}

function quickDomain(url: string): string {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
    .toLowerCase();
}

function seoSkipped(url: string): Promise<SEOData> {
  const domain = quickDomain(url);
  return Promise.resolve({
    domain,
    summary: 'SEO intel skipped for this generation run (report config).',
  });
}

function placesSkipped(url: string, hint: string): Promise<PlacesData> {
  const domain = quickDomain(url);
  return Promise.resolve({
    domain,
    summary: `Places/reviews skipped for this generation run (report config). Hint: ${hint}.`,
  });
}

export async function generateDeepDiveReport(
  lead: Lead,
  anthropicModelId: string
): Promise<ReportData> {
  // Deep dive always runs full intel pipeline regardless of per-lead toggles.
  const config: ReportConfig = {
    ...DEEP_CONFIG,
    multiPage: true,
    googleReviews: true,
    seoData: true,
    adminIntel: true,
    model: anthropicModelId,
  };

  console.log('[GenerateDeepDive] running with config:', config);
  console.log('[GenerateDeepDive] DATAFORSEO_LOGIN set:', !!process.env.DATAFORSEO_LOGIN);
  console.log('[GenerateDeepDive] GOOGLE_PLACES_API_KEY set:', !!process.env.GOOGLE_PLACES_API_KEY);

  console.log('[GenerateDeepDive] starting for lead:', lead.id, lead.business_name);
  console.log('[GenerateDeepDive] model:', anthropicModelId);
  console.log('[GenerateDeepDive] scraping client:', lead.website_url);
  console.log('[GenerateDeepDive] scraping competitor:', lead.competitor_url);

  const [clientContent, competitorContent] = await Promise.all([
    config.multiPage
      ? scrapeMultiPageBundle(lead.website_url)
      : scrapeWebsite(lead.website_url),
    config.multiPage
      ? scrapeMultiPageBundle(lead.competitor_url)
      : scrapeWebsite(lead.competitor_url),
  ]);

  console.log('[GenerateDeepDive] client scrape chars:', clientContent.length);
  console.log('[GenerateDeepDive] competitor scrape chars:', competitorContent.length);
  console.log('[GenerateDeepDive] fetching SEO + Places intel...');

  const [seoClient, seoComp, placesClient, placesComp] = await Promise.all([
    config.seoData
      ? (await getSEOData(lead.website_url)) ?? (await seoSkipped(lead.website_url))
      : seoSkipped(lead.website_url),
    config.seoData
      ? (await getSEOData(lead.competitor_url)) ?? (await seoSkipped(lead.competitor_url))
      : seoSkipped(lead.competitor_url),
    config.googleReviews
      ? (await getPlacesSummary(lead.website_url, lead.business_name)) ??
        (await placesSkipped(lead.website_url, lead.business_name))
      : placesSkipped(lead.website_url, lead.business_name),
    config.googleReviews
      ? (await getPlacesSummary(
          lead.competitor_url,
          lead.competitor_name || 'Competitor'
        )) ??
        (await placesSkipped(
          lead.competitor_url,
          lead.competitor_name || 'Competitor'
        ))
      : placesSkipped(
          lead.competitor_url,
          lead.competitor_name || 'Competitor'
        ),
  ]);

  console.log('[GenerateDeepDive] seoClient result:', seoClient ? `got data` : 'null');
  console.log('[GenerateDeepDive] seoComp result:', seoComp ? `got data` : 'null');
  console.log('[GenerateDeepDive] placesClient result:', placesClient ? `got data` : 'null');
  console.log('[GenerateDeepDive] placesComp result:', placesComp ? `got data` : 'null');

  const baseIntel = [
    intelBlock('SEO_CLIENT', seoClient),
    intelBlock('SEO_COMPETITOR', seoComp),
    intelBlock('PLACES_REVIEWS_CLIENT', placesClient),
    intelBlock('PLACES_REVIEWS_COMPETITOR', placesComp),
  ];

  if (config.adminIntel) {
    const ci = lead.client_intel;
    const co = lead.competitor_intel;
    if (ci) baseIntel.push(intelBlock('ADMIN_CLIENT_INTEL', ci));
    if (co) baseIntel.push(intelBlock('ADMIN_COMPETITOR_INTEL', co));
  }

  const enriched = baseIntel.join('\n\n');

  console.log('[GenerateDeepDive] enrichedIntel chars:', enriched.length);
  console.log('[GenerateDeepDive] enrichedIntel preview:', enriched.slice(0, 300));

  const industry =
    typeof lead.industry === 'string' && lead.industry.length > 0
      ? lead.industry
      : 'general';

  const competitorName = lead.competitor_name || lead.competitor_url;

  console.log('[GenerateDeepDive] industry:', industry, '| competitorName:', competitorName);
  console.log('[GenerateDeepDive] calling Claude...');

  const result = await analyzeDeepDiveWithClaude(
    clientContent,
    competitorContent,
    lead.business_name,
    lead.website_url,
    competitorName,
    lead.competitor_url,
    enriched,
    industry,
    anthropicModelId
  );

  console.log('[GenerateDeepDive] Claude done. topFindings count:', result.topFindings?.length);
  console.log('[GenerateDeepDive] topFindings[0] keys:', result.topFindings?.[0] ? Object.keys(result.topFindings[0]).join(', ') : 'none');
  console.log('[GenerateDeepDive] deepDive present:', !!result.deepDive);

  return result;
}
