export interface ProposalDeliverable {
  id: string;
  title: string;
  description: string;
  tags: string[];
  included: boolean;
}

export interface PricingFeature {
  id: string;
  text: string;
}

export interface PricingTier {
  id: string;
  name: string;
  subtitle: string;
  monthlyPrice: number;
  oneTimeFee: number;
  features: PricingFeature[];
  featured: boolean;
}

export interface RoadmapPhase {
  id: string;
  title: string;
  timeline: string;
  description: string;
}

export interface BattlecardRow {
  id: string;
  category: string;
  client: string;
  competitor: string;
  included: boolean;
}

export interface ProposalClosing {
  headline: string;
  body: string;
  ctaLabel: string;
  ctaLink: string;
}

export interface ProposalData {
  title: string;
  tagline: string;
  prepDate: string;
  situationSummary: string;
  battlecard: BattlecardRow[];
  deliverables: ProposalDeliverable[];
  pricing: PricingTier[];
  roadmap: RoadmapPhase[];
  closing: ProposalClosing;
}

export interface Proposal {
  id: string;
  client_id: string;
  created_at: string;
  sent_at: string | null;
  accepted_at: string | null;
  created_by: string | null;
  title: string;
  tagline: string | null;
  situation_summary: string | null;
  battlecard: BattlecardRow[];
  deliverables: ProposalDeliverable[];
  pricing: PricingTier[];
  roadmap: RoadmapPhase[];
  closing: ProposalClosing | null;
  status: string;
  public_slug: string | null;
  prep_date: string | null;
}

export const DEFAULT_DELIVERABLES: ProposalDeliverable[] = [
  {
    id: 'del-1',
    title: 'Website Redesign',
    description: 'Modern, high-converting website built to outperform your competition. Mobile-first, fast, SEO-ready.',
    tags: ['Design', 'Development'],
    included: true,
  },
  {
    id: 'del-2',
    title: 'SEO Strategy',
    description: 'Comprehensive search optimization to rank for high-intent keywords your competitors are winning.',
    tags: ['SEO', 'Content'],
    included: true,
  },
  {
    id: 'del-3',
    title: 'Google Business Optimization',
    description: 'Full Google Business Profile setup, optimization, and ongoing management for local visibility.',
    tags: ['Local', 'Maps'],
    included: true,
  },
  {
    id: 'del-4',
    title: 'Content Program',
    description: 'Monthly content production — blog posts, landing pages, and social content tailored to your audience.',
    tags: ['Content', 'Strategy'],
    included: true,
  },
  {
    id: 'del-5',
    title: 'Monthly Reporting',
    description: 'Transparent performance dashboards with actionable insights delivered every month.',
    tags: ['Analytics', 'Reporting'],
    included: true,
  },
];

export const DEFAULT_PRICING: PricingTier[] = [
  {
    id: 'tier-1',
    name: 'Essentials',
    subtitle: 'Foundation for growth',
    monthlyPrice: 2500,
    oneTimeFee: 5000,
    features: [
      { id: 'f-1', text: 'Website redesign & development' },
      { id: 'f-2', text: 'On-page SEO optimization' },
      { id: 'f-3', text: 'Google Business setup' },
      { id: 'f-4', text: '2 blog posts / month' },
      { id: 'f-5', text: 'Monthly performance report' },
      { id: 'f-6', text: 'Dedicated account manager' },
    ],
    featured: false,
  },
  {
    id: 'tier-2',
    name: 'Growth Retainer',
    subtitle: 'Full-service competitive dominance',
    monthlyPrice: 5000,
    oneTimeFee: 7500,
    features: [
      { id: 'f-7', text: 'Everything in Essentials' },
      { id: 'f-8', text: 'Advanced SEO & link building' },
      { id: 'f-9', text: '4 blog posts + 2 landing pages / month' },
      { id: 'f-10', text: 'Social media management' },
      { id: 'f-11', text: 'Google & Meta ad campaigns' },
      { id: 'f-12', text: 'Bi-weekly strategy calls' },
      { id: 'f-13', text: 'Competitor monitoring dashboard' },
    ],
    featured: true,
  },
];

export const DEFAULT_ROADMAP: RoadmapPhase[] = [
  {
    id: 'phase-1',
    title: 'Discovery & Audit',
    timeline: 'Weeks 1–2',
    description: 'Deep dive into your business, competitors, and market. Full technical and content audit.',
  },
  {
    id: 'phase-2',
    title: 'Strategy & Design',
    timeline: 'Weeks 3–4',
    description: 'Develop creative direction, sitemap, wireframes, and content strategy.',
  },
  {
    id: 'phase-3',
    title: 'Build & Launch',
    timeline: 'Weeks 5–8',
    description: 'Development, content production, QA, and site launch with full SEO configuration.',
  },
  {
    id: 'phase-4',
    title: 'Optimize & Scale',
    timeline: 'Ongoing',
    description: 'Monthly optimization, content publishing, ad management, and performance reporting.',
  },
];

export const DEFAULT_CLOSING: ProposalClosing = {
  headline: 'Ready to Outperform Your Competition?',
  body: "Let's schedule a quick call to walk through this proposal and answer any questions. We're confident this plan will move the needle for your business.",
  ctaLabel: 'Book a Strategy Call',
  ctaLink: '',
};
