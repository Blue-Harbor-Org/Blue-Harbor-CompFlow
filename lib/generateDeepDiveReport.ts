import type { Lead } from '@/types/lead';
import { scrapeMultiPageBundle } from '@/lib/scraper';
import { getSEOData } from '@/lib/dataForSEO';
import { getPlacesSummary } from '@/lib/googlePlaces';
import { analyzeDeepDiveWithClaude } from '@/lib/analyzeDeepDive';
import type { ReportData } from '@/types/report';

function intelBlock(label: string, obj: unknown): string {
  if (!obj) return `${label}: (none)`;
  try {
    return `${label}:\n${JSON.stringify(obj, null, 2)}`;
  } catch {
    return `${label}: (unavailable)`;
  }
}

export async function generateDeepDiveReport(
  lead: Lead,
  anthropicModelId: string
): Promise<ReportData> {
  console.log('[GenerateDeepDive] starting for lead:', lead.id, lead.business_name);
  console.log('[GenerateDeepDive] model:', anthropicModelId);
  console.log('[GenerateDeepDive] scraping client:', lead.website_url);
  console.log('[GenerateDeepDive] scraping competitor:', lead.competitor_url);

  const [clientContent, competitorContent] = await Promise.all([
    scrapeMultiPageBundle(lead.website_url),
    scrapeMultiPageBundle(lead.competitor_url),
  ]);

  console.log('[GenerateDeepDive] client scrape chars:', clientContent.length);
  console.log('[GenerateDeepDive] competitor scrape chars:', competitorContent.length);
  console.log('[GenerateDeepDive] fetching SEO + Places intel...');

  const [seoClient, seoComp, placesClient, placesComp] = await Promise.all([
    getSEOData(lead.website_url),
    getSEOData(lead.competitor_url),
    getPlacesSummary(lead.website_url, lead.business_name),
    getPlacesSummary(
      lead.competitor_url,
      lead.competitor_name || 'Competitor'
    ),
  ]);

  console.log('[GenerateDeepDive] seoClient result:', seoClient ? `got data` : 'null');
  console.log('[GenerateDeepDive] seoComp result:', seoComp ? `got data` : 'null');
  console.log('[GenerateDeepDive] placesClient result:', placesClient ? `got data` : 'null');
  console.log('[GenerateDeepDive] placesComp result:', placesComp ? `got data` : 'null');

  const enriched = [
    intelBlock('SEO_CLIENT', seoClient),
    intelBlock('SEO_COMPETITOR', seoComp),
    intelBlock('PLACES_REVIEWS_CLIENT', placesClient),
    intelBlock('PLACES_REVIEWS_COMPETITOR', placesComp),
  ].join('\n\n');

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
