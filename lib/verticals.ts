export interface Vertical {
  id: string;
  label: string;
  tone: string;
  contextHints: string;
}

export const VERTICALS: Record<string, Vertical> = {
  general: {
    id: 'general',
    label: 'General Business',
    tone: 'confident, professional, strategic',
    contextHints:
      'Focus on positioning, pricing, digital presence, and customer acquisition.',
  },

  medical: {
    id: 'medical',
    label: 'Medical / Healthcare',
    tone: 'trustworthy, precise, patient-outcome-focused',
    contextHints:
      'Key factors: patient trust signals, reviews, insurance accepted, staff credentials, wait times, telehealth options, HIPAA compliance signals, local SEO for "near me" searches.',
  },

  medspa: {
    id: 'medspa',
    label: 'Med Spa / Beauty',
    tone: 'luxury, aspirational, transformation-focused',
    contextHints:
      'Key factors: before/after content, treatment menu breadth, pricing transparency, booking friction, Instagram/social presence, membership programs, loyalty offers, ambiance signals.',
  },

  finance: {
    id: 'finance',
    label: 'Financial Services',
    tone: 'authoritative, data-driven, trust-building',
    contextHints:
      'Key factors: credentials and licensing signals, rate/fee transparency, product breadth, years in business, client testimonials, regulatory compliance signals, speed of service claims.',
  },

  legal: {
    id: 'legal',
    label: 'Legal',
    tone: 'authoritative, precise, outcome-focused',
    contextHints:
      'Key factors: practice area depth, attorney credentials, case results/testimonials, consultation offers, response time signals, local presence, bar association mentions.',
  },

  restaurant: {
    id: 'restaurant',
    label: 'Restaurant / Food & Beverage',
    tone: 'warm, community-rooted, experience-driven',
    contextHints:
      'Key factors: menu differentiation, online ordering/delivery, review volume and rating, hours and location convenience, reservation system, social media presence, loyalty programs.',
  },

  realestate: {
    id: 'realestate',
    label: 'Real Estate',
    tone: 'aspirational, market-savvy, investment-minded',
    contextHints:
      'Key factors: listing volume, agent credentials, local market knowledge signals, testimonials, days on market claims, buyer/seller resources, neighborhood expertise.',
  },

  homeservices: {
    id: 'homeservices',
    label: 'Home Services / HVAC / Plumbing',
    tone: 'reliable, locally trusted, no-nonsense',
    contextHints:
      'Key factors: response time / emergency availability, licensing and insurance signals, service area clarity, review volume, financing options, guarantees, years in business.',
  },

  ecommerce: {
    id: 'ecommerce',
    label: 'E-commerce / Retail',
    tone: 'conversion-focused, competitive, customer-obsessed',
    contextHints:
      'Key factors: product range, pricing, shipping speed and cost, return policy, trust badges, reviews, UX friction, loyalty/rewards program, social proof.',
  },

  dental: {
    id: 'dental',
    label: 'Dental',
    tone: 'clean, trustworthy, family and confidence language',
    contextHints:
      'Key factors: insurance accepted, new patient offers, technology signals (digital X-ray, CEREC), reviews, emergency availability, financing, before/after content.',
  },

  fitness: {
    id: 'fitness',
    label: 'Fitness / Gym / Wellness',
    tone: 'energetic, motivational, transformation-focused',
    contextHints:
      'Key factors: membership pricing and flexibility, class variety, equipment quality signals, trainer credentials, trial offers, community/culture signals, app or on-demand content.',
  },

  automotive: {
    id: 'automotive',
    label: 'Automotive',
    tone: 'performance-driven, technical, reliability-focused',
    contextHints:
      'Key factors: inventory breadth, financing options, service department, warranty, reviews, price transparency, trade-in process, online shopping tools.',
  },
};

export function getVertical(industry: string | null | undefined): Vertical {
  const key = industry?.trim().toLowerCase() ?? 'general';
  return VERTICALS[key] ?? VERTICALS.general;
}

/** Normalize arbitrary input to a known vertical id for DB storage */
export function normalizeIndustryId(raw: string | null | undefined): string {
  return getVertical(raw).id;
}

export const VERTICAL_OPTIONS = Object.values(VERTICALS).map((v) => ({
  value: v.id,
  label: v.label,
}));
