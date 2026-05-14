import type { DesignArchetype } from '@/lib/mockup-archetypes';

export function buildMockupPrompt({
  businessName,
  industry,
  scrapedContent,
  competitorUrl,
  vibeNotes,
  archetype,
}: {
  businessName: string;
  industry: string;
  scrapedContent: string;
  competitorUrl?: string;
  vibeNotes?: string;
  archetype: DesignArchetype;
}): { system: string; user: string } {
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
- Output a complete, self-contained HTML file only - no explanations, no markdown, no code fences`;

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
