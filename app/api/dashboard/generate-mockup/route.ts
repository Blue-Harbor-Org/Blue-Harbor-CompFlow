import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { requireTeamMember, isAuthError } from '@/lib/auth-guard';
import { createAdminClient } from '@/lib/supabase';
import { logActivity } from '@/lib/dashboard';
import { getBhClientContext } from '@/lib/bh-client-context';
import { getLatestClientIntake } from '@/lib/client-intake';
import { DESIGN_ARCHETYPES, selectArchetypeForIndustry } from '@/lib/mockup-archetypes';
import { buildMockupPrompt } from '@/lib/mockup-prompt';
import { fetchPhotos, fetchIcon, getIndustryIcons, buildPhotoQuery } from '@/lib/mockup-media';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PAGE_PROMPTS: Record<string, string> = {
  home: 'a compelling landing page / homepage with hero section, services overview, testimonials, team section, and a call-to-action',
  about: 'an About Us page with company story, mission, team bios, and years of experience',
  services: 'a Services page detailing each service offering with descriptions, pricing tiers if applicable, and process steps',
  contact: 'a Contact page with a form, office address, phone numbers, map placeholder, and business hours',
};

async function scrapeWebsite(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BluHarborBot/1.0)' },
    });
    clearTimeout(timeout);
    if (!res.ok) return '';
    const html = await res.text();
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 6000);
  } catch {
    return '';
  }
}

function readArchetypeIdFromHtml(html: string | null | undefined): string | undefined {
  return html?.match(/<meta\s+name=["']bh-archetype-id["']\s+content=["']([^"']+)["']/i)?.[1];
}

function injectArchetypeMetadata(html: string, archetypeId: string, archetypeName: string): string {
  const metadata = [
    `<meta name="bh-archetype-id" content="${archetypeId}">`,
    `<meta name="bh-archetype-name" content="${archetypeName}">`,
  ].join('\n');

  if (html.match(/<\/head>/i)) {
    return html.replace(/<\/head>/i, `${metadata}\n</head>`);
  }

  return `${metadata}\n${html}`;
}

export async function POST(request: Request) {
  const auth = await requireTeamMember();
  if (isAuthError(auth)) return auth;

  const {
    clientId,
    pageSlug = 'home',
    businessName,
    industry: requestedIndustry,
    websiteUrl: requestedWebsiteUrl,
    archetypeId,
    lockedArchetypeId,
    previousArchetypeId,
    competitorUrl,
    vibeNotes,
  } = await request.json() as {
    clientId?: string;
    pageSlug?: string;
    businessName?: string;
    industry?: string;
    websiteUrl?: string;
    archetypeId?: string;
    lockedArchetypeId?: string;
    previousArchetypeId?: string;
    competitorUrl?: string;
    vibeNotes?: string;
  };
  if (!clientId) return NextResponse.json({ error: 'Missing clientId' }, { status: 400 });

  const admin = createAdminClient();

  const clientContext = await getBhClientContext(admin, clientId);
  const [{ data: proposal }, intake] = await Promise.all([
    admin.from('bh_proposals').select('*').eq('client_id', clientId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    getLatestClientIntake(admin, clientId, clientContext.lead?.id ?? null),
  ]);

  const client = clientContext.client;
  const lead = clientContext.lead;

  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

  let siteContent = '';
  const websiteUrl = requestedWebsiteUrl || lead?.website_url;
  if (websiteUrl) {
    siteContent = await scrapeWebsite(websiteUrl);
  }

  const pageDesc = PAGE_PROMPTS[pageSlug] || PAGE_PROMPTS.home;

  const contextParts: string[] = [
    `Company: ${client.company_name}`,
    `Contact: ${client.contact_name} (${client.contact_email})`,
    client.contact_phone ? `Phone: ${client.contact_phone}` : '',
  ];

  if (lead) {
    contextParts.push(
      lead.website_url ? `Website: ${lead.website_url}` : '',
      lead.industry ? `Industry: ${lead.industry}` : '',
      lead.competitor_name ? `Competitor: ${lead.competitor_name} (${lead.competitor_url})` : '',
    );
  }

  if (intake) {
    contextParts.push(
      intake.years_in_business ? `Years in business: ${intake.years_in_business}` : '',
      intake.total_volume ? `Total loan volume: $${Number(intake.total_volume).toLocaleString()}` : '',
      intake.deals_closed ? `Deals closed: ${intake.deals_closed}` : '',
      intake.office_phone ? `Office phone: ${intake.office_phone}` : '',
      intake.address ? `Address: ${intake.address}` : '',
      intake.geo_focus ? `Geographic focus: ${intake.geo_focus}` : '',
      intake.testimonials ? `Testimonials: ${intake.testimonials}` : '',
      intake.existing_copy ? `Awards/Press: ${intake.existing_copy}` : '',
    );
    if (intake.team_bios && Array.isArray(intake.team_bios)) {
      const bios = intake.team_bios as { name?: string; title?: string; bio?: string }[];
      bios.forEach((b) => contextParts.push(`Team member: ${b.name} — ${b.title}. ${b.bio || ''}`));
    }
    if (intake.loan_min || intake.loan_max) {
      contextParts.push(`Loan range: $${intake.loan_min?.toLocaleString() ?? '?'} – $${intake.loan_max?.toLocaleString() ?? '?'}`);
    }
  }

  if (proposal) {
    contextParts.push(`Proposal data available (signed: ${client.status === 'signed' || client.status === 'in_buildout' || client.status === 'live'})`);
  }

  if (siteContent) {
    contextParts.push(`\nExisting website content (scraped from ${websiteUrl}):\n${siteContent}`);
  }

  const context = [
    `Requested page: ${pageDesc}`,
    contextParts.filter(Boolean).join('\n'),
  ].join('\n\n');

  const { data: existing } = await admin
    .from('bh_site_mockups')
    .select('id, version, html_content')
    .eq('client_id', clientId)
    .eq('page_slug', pageSlug)
    .maybeSingle();

  const industry = requestedIndustry || lead?.industry || 'general';
  const previousId = previousArchetypeId || readArchetypeIdFromHtml(existing?.html_content);
  const lockedArchetype = lockedArchetypeId && lockedArchetypeId !== 'auto'
    ? DESIGN_ARCHETYPES.find((item) => item.id === lockedArchetypeId)
    : undefined;
  const requestedArchetype = lockedArchetype ?? (archetypeId
    ? DESIGN_ARCHETYPES.find((item) => item.id === archetypeId && item.id !== previousId)
    : undefined);
  const archetype = requestedArchetype ?? selectArchetypeForIndustry(industry, previousId);
  const effectiveBusinessName = businessName || client.company_name;
  const photoQuery = buildPhotoQuery(industry, effectiveBusinessName);
  const iconNames = getIndustryIcons(industry);
  const [photos, ...iconResults] = await Promise.all([
    fetchPhotos(photoQuery, 6),
    ...iconNames.map((name) => fetchIcon(name)),
  ]);
  const icons = iconResults.filter((icon): icon is NonNullable<typeof icon> => Boolean(icon));
  const prompt = buildMockupPrompt({
    businessName: effectiveBusinessName,
    industry,
    scrapedContent: context,
    competitorUrl: competitorUrl || lead?.competitor_url || undefined,
    vibeNotes,
    archetype,
    photos,
    icons,
  });

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 8000,
    system: prompt.system,
    messages: [{ role: 'user', content: prompt.user }],
  });

  const textBlock = message.content.find((b) => b.type === 'text');
  let html = textBlock?.text ?? '';

  html = html.replace(/^```html?\n?/i, '').replace(/\n?```$/i, '').trim();
  html = injectArchetypeMetadata(html, archetype.id, archetype.name);

  const pageTitle = pageSlug.charAt(0).toUpperCase() + pageSlug.slice(1);

  let mockupRow;
  if (existing) {
    const { data, error } = await admin
      .from('bh_site_mockups')
      .update({
        html_content: html,
        version: existing.version + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    mockupRow = data;
  } else {
    const { data, error } = await admin
      .from('bh_site_mockups')
      .insert({
        client_id: clientId,
        page_slug: pageSlug,
        page_title: pageTitle,
        html_content: html,
      })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    mockupRow = data;
  }

  await logActivity(clientId, auth.user.id, 'general', `Generated ${pageTitle} page mockup in ${archetype.name} style (v${mockupRow.version})`);

  return NextResponse.json({
    mockup: {
      ...mockupRow,
      archetypeId: archetype.id,
      archetypeName: archetype.name,
    },
    html,
    archetypeId: archetype.id,
    archetypeName: archetype.name,
  });
}
