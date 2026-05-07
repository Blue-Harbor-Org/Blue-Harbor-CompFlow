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
  const [clientContent, competitorContent] = await Promise.all([
    scrapeMultiPageBundle(lead.website_url),
    scrapeMultiPageBundle(lead.competitor_url),
  ]);

  const [seoClient, seoComp, placesClient, placesComp] = await Promise.all([
    getSEOData(lead.website_url),
    getSEOData(lead.competitor_url),
    getPlacesSummary(lead.website_url, lead.business_name),
    getPlacesSummary(
      lead.competitor_url,
      lead.competitor_name || 'Competitor'
    ),
  ]);

  const enriched = [
    intelBlock('SEO_CLIENT', seoClient),
    intelBlock('SEO_COMPETITOR', seoComp),
    intelBlock('PLACES_REVIEWS_CLIENT', placesClient),
    intelBlock('PLACES_REVIEWS_COMPETITOR', placesComp),
  ].join('\n\n');

  const industry =
    typeof lead.industry === 'string' && lead.industry.length > 0
      ? lead.industry
      : 'general';

  const competitorName = lead.competitor_name || lead.competitor_url;

  return analyzeDeepDiveWithClaude(
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
}
