import type { Lead } from '@/types/lead';
import type { CompetitorEntry } from '@/types/lead';
import { scrapeMultiPageBundle, scrapeWebsite } from '@/lib/scraper';
import { getSEOData } from '@/lib/dataForSEO';
import { getPlacesSummary } from '@/lib/googlePlaces';
import { analyzeDeepDiveMultiWithClaude, analyzeDeepDiveWithClaude } from '@/lib/analyzeDeepDive';
import type { ReportData } from '@/types/report';
import { DEEP_CONFIG, type ReportConfig } from '@/lib/reportConfig';
import type { SEOData } from '@/lib/dataForSEO';
import type { PlacesData } from '@/lib/googlePlaces';
import { getResolvedCompetitors } from '@/lib/competitorLead';

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
  const config: ReportConfig = {
    ...DEEP_CONFIG,
    multiPage: true,
    googleReviews: true,
    seoData: true,
    adminIntel: true,
    model: anthropicModelId,
  };

  const comps = getResolvedCompetitors(lead);
  if (comps.length === 0) {
    throw new Error('No competitors found for this lead — add at least one competitor.');
  }

  console.log('[GenerateDeepDive] competitors:', comps.length, comps.map((c) => c.url));

  const industry =
    typeof lead.industry === 'string' && lead.industry.length > 0 ? lead.industry : 'general';

  if (comps.length === 1) {
    return runSingleCompetitorDeepDive(lead, comps[0], config, anthropicModelId, industry);
  }

  return runMultiCompetitorDeepDive(lead, comps, config, anthropicModelId, industry);
}

async function runSingleCompetitorDeepDive(
  lead: Lead,
  primary: CompetitorEntry,
  config: ReportConfig,
  anthropicModelId: string,
  industry: string
): Promise<ReportData> {
  console.log('[GenerateDeepDive] single path · client:', lead.website_url, '· competitor:', primary.url);

  const [clientContent, competitorContent] = await Promise.all([
    config.multiPage ? scrapeMultiPageBundle(lead.website_url) : scrapeWebsite(lead.website_url),
    config.multiPage ? scrapeMultiPageBundle(primary.url) : scrapeWebsite(primary.url),
  ]);

  const [seoClient, seoComp, placesClient, placesComp] = await Promise.all([
    config.seoData
      ? (await getSEOData(lead.website_url)) ?? (await seoSkipped(lead.website_url))
      : seoSkipped(lead.website_url),
    config.seoData
      ? (await getSEOData(primary.url)) ?? (await seoSkipped(primary.url))
      : seoSkipped(primary.url),
    config.googleReviews
      ? (await getPlacesSummary(lead.website_url, lead.business_name)) ??
        (await placesSkipped(lead.website_url, lead.business_name))
      : placesSkipped(lead.website_url, lead.business_name),
    config.googleReviews
      ? (await getPlacesSummary(primary.url, primary.name)) ??
        (await placesSkipped(primary.url, primary.name))
      : placesSkipped(primary.url, primary.name),
  ]);

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
  const competitorName = primary.name || primary.url;

  const result = await analyzeDeepDiveWithClaude(
    clientContent,
    competitorContent,
    lead.business_name,
    lead.website_url,
    competitorName,
    primary.url,
    enriched,
    industry,
    anthropicModelId
  );

  return result;
}

async function runMultiCompetitorDeepDive(
  lead: Lead,
  comps: CompetitorEntry[],
  config: ReportConfig,
  anthropicModelId: string,
  industry: string
): Promise<ReportData> {
  console.log('[GenerateDeepDive] multi path · scraping', comps.length, 'competitors');

  const [clientContent, ...competitorContents] = await Promise.all([
    config.multiPage ? scrapeMultiPageBundle(lead.website_url) : scrapeWebsite(lead.website_url),
    ...comps.map((c) =>
      config.multiPage ? scrapeMultiPageBundle(c.url) : scrapeWebsite(c.url)
    ),
  ]);

  const [seoClient, ...seoCompetitors] = await Promise.all([
    config.seoData
      ? (await getSEOData(lead.website_url)) ?? (await seoSkipped(lead.website_url))
      : seoSkipped(lead.website_url),
    ...comps.map((c) =>
      config.seoData
        ? getSEOData(c.url).then(async (r) => r ?? (await seoSkipped(c.url)))
        : seoSkipped(c.url)
    ),
  ]);

  const [placesClient, ...placesCompetitors] = await Promise.all([
    config.googleReviews
      ? (await getPlacesSummary(lead.website_url, lead.business_name)) ??
        (await placesSkipped(lead.website_url, lead.business_name))
      : placesSkipped(lead.website_url, lead.business_name),
    ...comps.map((c) =>
      config.googleReviews
        ? getPlacesSummary(c.url, c.name).then(
            async (r) => r ?? (await placesSkipped(c.url, c.name))
          )
        : placesSkipped(c.url, c.name)
    ),
  ]);

  const baseIntel: string[] = [
    intelBlock('SEO_CLIENT', seoClient),
    intelBlock('PLACES_REVIEWS_CLIENT', placesClient),
  ];

  comps.forEach((c, i) => {
    baseIntel.push(intelBlock(`SEO_COMPETITOR_${i + 1}_${c.name}`, seoCompetitors[i]));
    baseIntel.push(intelBlock(`PLACES_REVIEWS_COMPETITOR_${i + 1}_${c.name}`, placesCompetitors[i]));
  });

  if (config.adminIntel) {
    const ci = lead.client_intel;
    const co = lead.competitor_intel;
    if (ci) baseIntel.push(intelBlock('ADMIN_CLIENT_INTEL', ci));
    if (co) baseIntel.push(intelBlock('ADMIN_COMPETITOR_INTEL', co));
  }

  const enriched = baseIntel.join('\n\n');

  const competitorInputs = comps.map((entry, i) => ({
    entry,
    content: competitorContents[i] ?? '',
  }));

  return analyzeDeepDiveMultiWithClaude(
    clientContent,
    lead.business_name,
    lead.website_url,
    competitorInputs,
    enriched,
    industry,
    anthropicModelId
  );
}
