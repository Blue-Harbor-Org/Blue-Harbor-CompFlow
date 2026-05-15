import type { DesignArchetype } from '@/lib/mockup-archetypes';
import type { MediaPhoto, MediaIcon } from '@/lib/mockup-media';

export function buildMockupPrompt({
  businessName,
  industry,
  scrapedContent,
  competitorUrl,
  vibeNotes,
  archetype,
  photos,
  icons,
}: {
  businessName: string;
  industry: string;
  scrapedContent: string;
  competitorUrl?: string;
  vibeNotes?: string;
  archetype: DesignArchetype;
  photos: MediaPhoto[];
  icons: MediaIcon[];
}): { system: string; user: string } {
  const mediaSection = photos.length > 0 || icons.length > 0
    ? `

MEDIA ASSETS - USE THESE IN THE DESIGN:

PHOTOS (use as <img src="..."> tags with the provided URLs directly):
${photos.map((p, i) => `Photo ${i + 1}: ${p.url}
  Alt text: "${p.alt}"
  Credit: ${p.credit} (${p.source})`).join('\n')}

SVG ICONS (paste the SVG code inline where icons are needed):
${icons.map((icon) => `Icon "${icon.name}":
${icon.svg}`).join('\n\n')}

RULES FOR MEDIA USE:
- Use at least 3 of the provided photos when 3 or more are available - place them as real <img> tags, not CSS backgrounds where possible
- Scale photos appropriately: hero images full-width, service photos 400px tall, team/profile photos square
- Use icons in the services section, feature lists, and contact info - inline the SVG directly into the HTML
- Add photo credits as a tiny footnote at the page bottom: "Photos: ${photos.map((p) => p.credit).join(', ')}"
- Never use placeholder boxes or colored divs when photos are provided
- If a photo URL returns a 404 at render time, the img tag should have object-fit: cover on a colored fallback background`
    : `

MEDIA ASSETS:
No external photo assets were available. Use strong layout, typography, color, and inline SVG/CSS graphics. Do not mention missing API keys.`;

  const system = `You are an expert web designer who creates visually stunning, completely unique websites. You never produce generic output. Every site you design is distinctive and memorable.

DESIGN ARCHETYPE ASSIGNED: ${archetype.name}
${archetype.description}

TYPOGRAPHY RULES FOR THIS GENERATION:
- Heading font: ${archetype.typography.heading} (import from Google Fonts)
- Body font: ${archetype.typography.body}
- Heading weight: ${archetype.typography.headingWeight}
- Type style: ${archetype.typography.style}

COLOR RULES FOR THIS GENERATION:
${archetype.colorLogic}

LAYOUT RULES FOR THIS GENERATION:
${archetype.layoutPersonality}

MOOD THIS SITE MUST CONVEY: ${archetype.moodWords.join(', ')}

ABSOLUTELY FORBIDDEN IN THIS GENERATION:
${archetype.forbidden.map((f) => `- ${f}`).join('\n')}

GLOBAL RULES (apply to every generation regardless of archetype):
- Never use Inter, Roboto, or Arial as heading fonts
- Never use purple-to-blue gradients as the hero background
- Never use a 3-column card grid as the primary homepage layout unless the archetype specifically calls for it
- Never use generic stock photo placeholder boxes - use colored placeholder divs with descriptive text inside instead
- The design must look like it was made by a human designer who deeply understands this specific industry
- Include real placeholder content (fake but realistic business name, phone, address, services) - never use Lorem Ipsum
- All CSS must be inline in a single <style> tag in the <head>
- Output a complete, self-contained HTML file only - no explanations, no markdown, no code fences${mediaSection}`;

  const user = `Create a complete homepage HTML mockup for this business:

Business Name: ${businessName}
Industry: ${industry}
${vibeNotes ? `Client's style notes: ${vibeNotes}` : ''}
${competitorUrl ? `Competitor to reference for industry context: ${competitorUrl}` : ''}

Content extracted from their current site:
${scrapedContent}

Output a single complete HTML file. The design must strictly follow the ${archetype.name} archetype rules in your system prompt. Do not deviate from the assigned archetype. Do not add any explanation - output only the HTML.`;

  return { system, user };
}
