import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { requireTeamMember, isAuthError } from '@/lib/auth-guard';
import { createAdminClient } from '@/lib/supabase';
import { getBhClientContext } from '@/lib/bh-client-context';
import { logActivity } from '@/lib/dashboard';
import { STANDARD_PAGES, buildPagePrompt } from '@/lib/buildout-pages';
import { fetchPhotos, buildPhotoQuery } from '@/lib/mockup-media';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function extractSharedElements(homepageHtml: string): {
  styles: string;
  nav: string;
  footer: string;
} {
  const styleMatch = homepageHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  const navMatch = homepageHtml.match(/<nav[\s\S]*?<\/nav>/i);
  const footerMatch = homepageHtml.match(/<footer[\s\S]*?<\/footer>/i);

  return {
    styles: styleMatch ? `<style>${styleMatch[1]}</style>` : '',
    nav: navMatch ? navMatch[0] : '',
    footer: footerMatch ? footerMatch[0] : '',
  };
}

function readArchetypeIdFromHtml(html: string | null | undefined): string | null {
  return html?.match(/<meta\s+name=["']bh-archetype-id["']\s+content=["']([^"']+)["']/i)?.[1] ?? null;
}

function buildCmsData(
  pages: Array<{ slug: string; title: string; html: string }>,
  businessName: string,
  contact: { phone?: string | null; email?: string | null; address?: string | null }
): Record<string, string> {
  return {
    business_name: businessName,
    phone: contact.phone ?? '',
    email: contact.email ?? '',
    address: contact.address ?? '',
    tagline: '',
    hours: '',
    service_area: '',
    about_blurb: '',
    cta_text: 'Contact Us',
    founded_year: '',
    generated_pages: pages.map((page) => page.slug).join(','),
  };
}

export async function POST(request: Request) {
  const auth = await requireTeamMember();
  if (isAuthError(auth)) return auth;

  const { clientId, mockupId } = await request.json() as {
    clientId?: string;
    mockupId?: string;
  };
  if (!clientId || !mockupId) {
    return NextResponse.json({ error: 'Missing clientId or mockupId' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: mockup, error: mockupError } = await admin
    .from('bh_site_mockups')
    .select('*')
    .eq('id', mockupId)
    .eq('client_id', clientId)
    .single();

  if (mockupError || !mockup) {
    return NextResponse.json({ error: 'Mockup not found' }, { status: 404 });
  }

  const clientContext = await getBhClientContext(admin, clientId);
  if (!clientContext.client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  const businessName = clientContext.client.company_name ?? 'This Business';
  const industry = clientContext.lead?.industry ?? 'professional services';
  const archetypeId = readArchetypeIdFromHtml(mockup.html_content) ?? null;

  const { data: buildout, error: buildoutError } = await admin
    .from('bh_site_buildouts')
    .insert({
      client_id: clientId,
      mockup_id: mockupId,
      status: 'generating',
      archetype_id: archetypeId,
    })
    .select()
    .single();

  if (buildoutError || !buildout) {
    return NextResponse.json({ error: buildoutError?.message ?? 'Failed to create buildout record' }, { status: 500 });
  }

  await logActivity(
    clientId,
    auth.user.id,
    'general',
    'Site buildout started — 4-page site generation',
    { buildout_id: buildout.id }
  );

  const homepageHtml = mockup.html_content ?? '';
  const shared = extractSharedElements(homepageHtml);
  const generatedPages: Array<{ slug: string; title: string; html: string }> = [
    { slug: 'index', title: 'Home', html: homepageHtml },
  ];

  await admin.from('bh_buildout_pages').insert({
    buildout_id: buildout.id,
    slug: 'index',
    title: 'Home',
    html_content: homepageHtml,
    status: 'done',
  });

  for (const page of STANDARD_PAGES.filter((item) => item.slug !== 'index')) {
    const { data: pageRecord } = await admin
      .from('bh_buildout_pages')
      .insert({
        buildout_id: buildout.id,
        slug: page.slug,
        title: page.title,
        status: 'generating',
      })
      .select()
      .single();

    try {
      const photos = await fetchPhotos(buildPhotoQuery(industry, businessName), 4);
      const prompt = buildPagePrompt(
        page,
        businessName,
        industry,
        archetypeId ?? '',
        shared.styles,
        shared.nav,
        shared.footer,
        photos.map((photo) => photo.url),
        {}
      );

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        messages: [{ role: 'user', content: prompt }],
      });

      const html = message.content
        .filter((block) => block.type === 'text')
        .map((block) => block.text)
        .join('')
        .replace(/```html|```/g, '')
        .trim();

      generatedPages.push({ slug: page.slug, title: page.title, html });

      if (pageRecord) {
        await admin
          .from('bh_buildout_pages')
          .update({ html_content: html, status: 'done' })
          .eq('id', pageRecord.id);
      }
    } catch (error) {
      console.error(`[buildout] Failed to generate ${page.slug}:`, error);
      if (pageRecord) {
        await admin
          .from('bh_buildout_pages')
          .update({ status: 'failed' })
          .eq('id', pageRecord.id);
      }
    }
  }

  const cmsData = buildCmsData(generatedPages, businessName, {
    phone: clientContext.client.contact_phone,
    email: clientContext.client.contact_email,
  });

  await admin
    .from('bh_site_buildouts')
    .update({
      status: 'generated',
      pages: generatedPages,
      cms_data: cmsData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', buildout.id);

  await logActivity(
    clientId,
    auth.user.id,
    'general',
    'Site buildout pages generated',
    { buildout_id: buildout.id }
  );

  return NextResponse.json({
    buildoutId: buildout.id,
    status: 'generated',
    pages: generatedPages.map((page) => ({ slug: page.slug, title: page.title })),
  });
}
