import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { requireTeamMember, isAuthError } from '@/lib/auth-guard';
import { createAdminClient } from '@/lib/supabase';
import { logActivity } from '@/lib/dashboard';

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

export async function POST(request: Request) {
  const auth = await requireTeamMember();
  if (isAuthError(auth)) return auth;

  const { clientId, pageSlug = 'home' } = await request.json();
  if (!clientId) return NextResponse.json({ error: 'Missing clientId' }, { status: 400 });

  const admin = createAdminClient();

  const [{ data: client }, { data: intake }, { data: lead }, { data: proposal }] = await Promise.all([
    admin.from('bh_clients').select('*').eq('id', clientId).maybeSingle(),
    admin.from('bh_intake_submissions').select('*').eq('client_id', clientId).order('submitted_at', { ascending: false }).limit(1).maybeSingle(),
    admin.from('leads').select('*').eq('id', clientId).maybeSingle(),
    admin.from('bh_proposals').select('*').eq('client_id', clientId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ]);

  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

  let siteContent = '';
  const websiteUrl = lead?.website_url;
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

  const context = contextParts.filter(Boolean).join('\n');

  const systemPrompt = `You are an expert web designer and developer at Blue Harbor, a premium digital marketing agency. You create stunning, modern website mockups as complete HTML pages.

RULES:
- Return ONLY the complete HTML document — no markdown, no explanation, no code fences
- The HTML must be fully self-contained with inline <style> in the <head>
- Use Google Fonts (link in head): Inter for body, Playfair Display for headings
- Design must be modern, responsive, and professional
- Use a color scheme that feels premium — navy (#0D1F3C), gold (#D4A843), white, subtle grays
- Include proper meta viewport tag for mobile
- Images: use placeholder divs with background colors and descriptive text (no external image URLs)
- Include smooth scroll behavior and subtle CSS animations
- Make it look like a real, production-ready website
- All content must be based on the provided business context — do NOT use lorem ipsum
- If information is missing, create realistic placeholder content based on the industry`;

  const userPrompt = `Create ${pageDesc} for this business:\n\n${context}\n\nReturn the complete HTML document.`;

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 8000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const textBlock = message.content.find((b) => b.type === 'text');
  let html = textBlock?.text ?? '';

  html = html.replace(/^```html?\n?/i, '').replace(/\n?```$/i, '').trim();

  const pageTitle = pageSlug.charAt(0).toUpperCase() + pageSlug.slice(1);

  const { data: existing } = await admin
    .from('bh_site_mockups')
    .select('id, version')
    .eq('client_id', clientId)
    .eq('page_slug', pageSlug)
    .maybeSingle();

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

  await logActivity(clientId, auth.user.id, 'general', `Generated ${pageTitle} page mockup (v${mockupRow.version})`);

  return NextResponse.json({ mockup: mockupRow });
}
