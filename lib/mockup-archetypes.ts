export type DesignArchetype = {
  id: string;
  name: string;
  description: string;
  typography: {
    heading: string;
    body: string;
    headingWeight: string;
    style: string;
  };
  colorLogic: string;
  layoutPersonality: string;
  moodWords: string[];
  forbidden: string[];
};

export const DESIGN_ARCHETYPES: DesignArchetype[] = [
  {
    id: 'dark-luxury',
    name: 'Dark Luxury',
    description: 'Premium dark backgrounds, gold or amber accents, generous whitespace',
    typography: { heading: 'Cormorant Garamond', body: 'DM Sans', headingWeight: '300', style: 'tall, thin serifs with wide tracking' },
    colorLogic: 'Near-black background (#0a0a0a or similar), one warm metallic accent (gold, champagne, or deep amber), white body text',
    layoutPersonality: 'Full-bleed hero with large centered headline, wide margins, section dividers using thin horizontal rules, no card grids',
    moodWords: ['refined', 'exclusive', 'timeless', 'premium'],
    forbidden: ['purple gradients', 'card grids', 'rounded pill buttons', 'Inter font', 'blue CTAs', 'stock photo collages'],
  },
  {
    id: 'bold-editorial',
    name: 'Bold Editorial',
    description: 'Magazine-style layout, oversized type, asymmetric composition',
    typography: { heading: 'Bebas Neue', body: 'Source Sans 3', headingWeight: '400', style: 'all-caps compressed headlines, huge contrast with small body text' },
    colorLogic: 'White or off-white background, one bold single color pulled from the brand (NOT blue unless brand is specifically blue), black type',
    layoutPersonality: 'Asymmetric grid, oversized pull quotes, text overlapping imagery, horizontal scrolling sections or full-width text blocks',
    moodWords: ['bold', 'direct', 'confident', 'modern'],
    forbidden: ['centered hero layouts', 'rounded corners', 'soft shadows', 'pastel colors', 'Inter font'],
  },
  {
    id: 'warm-local',
    name: 'Warm & Local',
    description: 'Approachable, neighborhood business feel - trustworthy and human',
    typography: { heading: 'Playfair Display', body: 'Lato', headingWeight: '700', style: 'classic serif headings, friendly weight contrast' },
    colorLogic: 'Warm off-white or cream background, earthy accent (terracotta, sage, warm brown, deep olive), never cold blues or grays',
    layoutPersonality: 'Centered hero with warm imagery space, 3-column service grid, testimonial strip, map/address section prominent, phone number in header',
    moodWords: ['trusted', 'community', 'established', 'personal'],
    forbidden: ['dark backgrounds', 'neon accents', 'tech startup aesthetic', 'Space Grotesk', 'Montserrat'],
  },
  {
    id: 'tech-minimal',
    name: 'Technical Minimal',
    description: 'Clean, precise, engineering-inspired - for technical service businesses',
    typography: { heading: 'IBM Plex Sans', body: 'IBM Plex Sans', headingWeight: '500', style: 'tight tracking, monospace details for specs/numbers' },
    colorLogic: 'Pure white background, black type, one single electric accent (electric blue #0066FF, or signal green, or warning orange) used sparingly on CTAs only',
    layoutPersonality: 'Grid-aligned, precise spacing, data/specs displayed in clean tables or stat blocks, no decorative elements',
    moodWords: ['precise', 'capable', 'systematic', 'expert'],
    forbidden: ['script fonts', 'decorative borders', 'warm colors', 'testimonial carousels', 'stock photography'],
  },
  {
    id: 'geometric-bold',
    name: 'Geometric Bold',
    description: 'Strong shapes, high contrast, graphic design-forward',
    typography: { heading: 'Clash Display', body: 'General Sans', headingWeight: '700', style: 'wide, geometric, high contrast with tight spacing' },
    colorLogic: 'Two-color palette maximum - one strong background color (deep navy, forest green, rich burgundy) and white, with one bright geometric accent shape',
    layoutPersonality: 'Full-color hero block, geometric shape dividers between sections, bold numbered lists, diagonal section breaks',
    moodWords: ['strong', 'decisive', 'graphic', 'impactful'],
    forbidden: ['light pastel colors', 'thin fonts', 'stock photos without strong cropping', 'standard nav bars'],
  },
  {
    id: 'organic-natural',
    name: 'Organic & Natural',
    description: 'For businesses connected to nature, health, food, or outdoor work',
    typography: { heading: 'Fraunces', body: 'Nunito Sans', headingWeight: '600', style: 'soft variable serif, slightly rounded feel' },
    colorLogic: 'Nature-derived palette: forest greens, stone grays, sand, clay - never artificial or synthetic feeling colors',
    layoutPersonality: 'Organic shapes (soft blobs, leaf-inspired curves), full-bleed nature imagery zones, flowing sections without hard edges',
    moodWords: ['natural', 'sustainable', 'grounded', 'authentic'],
    forbidden: ['hard geometric shapes', 'dark mode', 'neon or electric colors', 'corporate sans-serif fonts'],
  },
  {
    id: 'retro-americana',
    name: 'Retro Americana',
    description: 'Badge-based, classic trade aesthetic - for contractors, trades, auto, food',
    typography: { heading: 'Alfa Slab One', body: 'Barlow', headingWeight: '400', style: 'slab serif display, sturdy and readable' },
    colorLogic: 'Classic palette: navy + red + cream, or black + yellow, or forest green + gold - inspired by vintage signage and trade badges',
    layoutPersonality: 'Badge/seal graphics, centered compositions, star or check icon lists, banner-style section headers, established date callouts',
    moodWords: ['reliable', 'established', 'American', 'skilled'],
    forbidden: ['thin fonts', 'modern minimalism', 'dark luxury', 'sans-only typography', 'startup aesthetics'],
  },
  {
    id: 'brutalist-raw',
    name: 'Brutalist Raw',
    description: 'Intentionally raw and direct - for brands that want to stand out aggressively',
    typography: { heading: 'Space Mono', body: 'Space Mono', headingWeight: '700', style: 'monospace everything, typewriter aesthetic' },
    colorLogic: 'Black and white with ONE jarring accent color (hot pink, acid yellow, or bright orange) used on exactly one element only',
    layoutPersonality: 'Broken grid, text at angles, borders used as design elements, stark contrast, anti-decoration philosophy',
    moodWords: ['honest', 'raw', 'anti-corporate', 'direct'],
    forbidden: ['rounded corners', 'drop shadows', 'hero images', 'testimonial stars', 'gradient backgrounds'],
  },
  {
    id: 'soft-professional',
    name: 'Soft Professional',
    description: 'Medical, legal, financial, coaching - trust-forward but modern',
    typography: { heading: 'Instrument Serif', body: 'Plus Jakarta Sans', headingWeight: '400', style: 'refined serif heading with clean modern body' },
    colorLogic: 'Light background (soft blue-gray, warm white, or pale sage), muted professional accent (slate blue, teal, warm navy), never loud',
    layoutPersonality: 'Calm, centered hero, credential callouts (years experience, certifications, clients served), FAQ section, clean contact form prominent',
    moodWords: ['trustworthy', 'credentialed', 'calm', 'professional'],
    forbidden: ['dark backgrounds', 'aggressive CTAs', 'flashy animations', 'bold color pops', 'Helvetica or Arial'],
  },
  {
    id: 'restaurant-food',
    name: 'Restaurant & Food',
    description: 'Atmosphere-first - full bleed imagery, menu-forward, reservation-driven',
    typography: { heading: 'Canela', body: "Suisse Int'l", headingWeight: '300', style: 'elegant thin display with clean body - or use Lora + Open Sans as fallback' },
    colorLogic: 'Derived entirely from the cuisine type - Italian: warm cream + terracotta; Japanese: white + black + red; BBQ: dark + amber + orange',
    layoutPersonality: 'Full-bleed hero with atmosphere image zone, menu grid, hours + location sticky, reservation CTA always visible',
    moodWords: ['atmospheric', 'appetizing', 'experiential', 'inviting'],
    forbidden: ['corporate layouts', 'card grids for menu items', 'blue color schemes', 'stock food photos (leave image zones empty with placeholder text)'],
  },
  {
    id: 'real-estate-prestige',
    name: 'Real Estate Prestige',
    description: 'Property-forward, lifestyle aspirational, listing-optimized',
    typography: { heading: 'Libre Baskerville', body: 'Raleway', headingWeight: '700', style: 'authoritative serif with elegant body, wide letter spacing on headings' },
    colorLogic: 'White or very light gray base, black type, ONE prestige accent (deep navy, forest, or charcoal gold) - never red, never orange',
    layoutPersonality: 'Hero with property image zone and search bar, stats strip (homes sold, years experience, volume), featured listings grid, agent bio section',
    moodWords: ['prestigious', 'aspirational', 'local expert', 'trusted'],
    forbidden: ['warm colors', 'playful fonts', 'busy layouts', 'bright CTA buttons', 'generic blue real estate palette'],
  },
  {
    id: 'health-wellness',
    name: 'Health & Wellness',
    description: 'Spas, gyms, nutrition, therapists - calm energy with clear conversion',
    typography: { heading: 'Jost', body: 'Hind', headingWeight: '300', style: 'light and airy with generous line height' },
    colorLogic: 'Soft and clean: sage green, lavender, warm white, blush - avoid clinical whites or cold blues',
    layoutPersonality: 'Calm hero with benefit-led headline, service cards with icons, before/after or transformation section, booking CTA persistent',
    moodWords: ['restorative', 'clean', 'transformative', 'supportive'],
    forbidden: ['dark backgrounds', 'aggressive sales copy layout', 'corporate feel', 'hard geometric shapes'],
  },
];

export function selectArchetype(previousId?: string): DesignArchetype {
  const available = previousId
    ? DESIGN_ARCHETYPES.filter((a) => a.id !== previousId)
    : DESIGN_ARCHETYPES;
  return available[Math.floor(Math.random() * available.length)];
}

export function selectArchetypeForIndustry(industry: string, previousId?: string): DesignArchetype {
  const industryMap: Record<string, string[]> = {
    restaurant: ['restaurant-food', 'warm-local', 'retro-americana'],
    food: ['restaurant-food', 'organic-natural', 'warm-local'],
    plumber: ['retro-americana', 'bold-editorial', 'warm-local'],
    hvac: ['retro-americana', 'tech-minimal', 'geometric-bold'],
    contractor: ['retro-americana', 'geometric-bold', 'bold-editorial'],
    legal: ['soft-professional', 'dark-luxury', 'bold-editorial'],
    law: ['soft-professional', 'dark-luxury', 'real-estate-prestige'],
    medical: ['soft-professional', 'health-wellness', 'tech-minimal'],
    dental: ['soft-professional', 'health-wellness', 'organic-natural'],
    spa: ['health-wellness', 'organic-natural', 'dark-luxury'],
    gym: ['health-wellness', 'geometric-bold', 'bold-editorial'],
    realtor: ['real-estate-prestige', 'soft-professional', 'dark-luxury'],
    realestate: ['real-estate-prestige', 'dark-luxury', 'bold-editorial'],
    tech: ['tech-minimal', 'geometric-bold', 'brutalist-raw'],
    finance: ['soft-professional', 'dark-luxury', 'real-estate-prestige'],
    retail: ['bold-editorial', 'geometric-bold', 'warm-local'],
    salon: ['health-wellness', 'dark-luxury', 'organic-natural'],
  };

  const lowerIndustry = industry.toLowerCase();
  const matchKey = Object.keys(industryMap).find((k) => lowerIndustry.includes(k));
  const candidates = matchKey ? industryMap[matchKey] : DESIGN_ARCHETYPES.map((a) => a.id);
  const filtered = candidates.filter((id) => id !== previousId);
  const pool = filtered.length > 0 ? filtered : candidates;
  const selectedId = pool[Math.floor(Math.random() * pool.length)];
  return DESIGN_ARCHETYPES.find((a) => a.id === selectedId) || DESIGN_ARCHETYPES[0];
}
