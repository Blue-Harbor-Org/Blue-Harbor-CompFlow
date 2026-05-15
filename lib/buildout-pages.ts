export type PageSpec = {
  slug: string;
  title: string;
  navLabel: string;
  purpose: string;
  requiredSections: string[];
};

export const STANDARD_PAGES: PageSpec[] = [
  {
    slug: 'index',
    title: 'Home',
    navLabel: 'Home',
    purpose: 'Convert visitors into leads. Lead with the strongest value proposition, establish trust immediately.',
    requiredSections: [
      'Hero with headline, subheadline, and primary CTA',
      'Trust bar: years in business, number of clients, key credential',
      'Services overview (3-6 services with icons)',
      'Why choose us / differentiators (3 points)',
      'Testimonials (3 real-sounding fake reviews with names and star ratings)',
      'Final CTA section with phone number and contact button',
      'Footer with address, phone, email, nav links, copyright',
    ],
  },
  {
    slug: 'about',
    title: 'About Us',
    navLabel: 'About',
    purpose: 'Build personal connection and credibility. Tell the story of the business and the people behind it.',
    requiredSections: [
      'Page hero with headline',
      'Our story section (founding year, mission, how it started)',
      'Team section (2-3 fake but realistic team member bios with names and roles)',
      'Core values (3-4 values with icons)',
      'Credentials and certifications section',
      'CTA to contact page',
    ],
  },
  {
    slug: 'services',
    title: 'Services',
    navLabel: 'Services',
    purpose: 'Detail every service clearly so prospects self-qualify and understand the full scope of what is offered.',
    requiredSections: [
      'Page hero',
      'Services grid (6-8 services, each with icon, name, 2-3 sentence description, and starting price if applicable)',
      'Process section: how it works (3-4 steps)',
      'FAQ section (5-6 questions specific to this industry)',
      'CTA to contact',
    ],
  },
  {
    slug: 'contact',
    title: 'Contact',
    navLabel: 'Contact',
    purpose: 'Make it as easy as possible to reach out. Multiple contact methods, a form, and location info.',
    requiredSections: [
      'Page hero',
      'Contact form (name, email, phone, message, submit button)',
      'Direct contact info (phone as clickable tel: link, email as mailto: link)',
      'Business hours',
      'Service area or address',
      'Google Maps embed placeholder (a styled div with address text - no actual API needed)',
    ],
  },
];

export function buildPagePrompt(
  page: PageSpec,
  businessName: string,
  industry: string,
  archetypeId: string,
  sharedStyles: string,
  navHtml: string,
  footerHtml: string,
  photos: string[],
  cmsData: Record<string, string>
): string {
  return `You are building page "${page.title}" (/${page.slug === 'index' ? '' : page.slug}) for ${businessName}, a ${industry} business.

This page is part of a multi-page site. The design style, colors, fonts, and overall visual language are already established by the homepage. You must match them exactly.

ARCHETYPE ID: ${archetypeId}

SHARED STYLES - Copy this <style> block into the <head> of this page exactly as-is:
${sharedStyles}

SHARED NAV - Use this exact nav HTML at the top of the <body>:
${navHtml}

SHARED FOOTER - Use this exact footer HTML at the bottom of the <body>:
${footerHtml}

PAGE PURPOSE: ${page.purpose}

REQUIRED SECTIONS FOR THIS PAGE:
${page.requiredSections.map((section, index) => `${index + 1}. ${section}`).join('\n')}

AVAILABLE PHOTOS FOR THIS PAGE:
${photos.map((url, index) => `Photo ${index + 1}: ${url}`).join('\n')}

CMS CONTENT OVERRIDES (use these exact values where applicable):
${Object.entries(cmsData).map(([key, value]) => `${key}: ${value}`).join('\n') || 'None - generate realistic placeholder content'}

OUTPUT: A complete HTML file for this page only. Same fonts, same colors, same nav, same footer as the homepage. Do not add explanations. Output only the HTML.`;
}
