export interface ReportStat {
  value: string;
  label: string;
  note: string;
}

export interface TopFinding {
  title: string;
  teaser: string;
  fullDescription: string;
  severity: 'high' | 'medium' | 'low';
}

export interface ComparisonRow {
  category: string;
  competitor: string;
  client: string;
  advantage: 'client' | 'competitor' | 'even';
  advantageNote: string;
}

/** Deep-dive multi-competitor comparison row */
export interface MultiComparisonRow {
  category: string;
  client: string;
  competitors: { name: string; value: string }[];
  topCompetitor: string;
  clientAdvantage: boolean;
  advantageNote: string;
}

export interface CompetitorRanking {
  name: string;
  threatLevel: 'high' | 'medium' | 'low';
  summary: string;
}

export interface Advantage {
  title: string;
  description: string;
  badge: string;
}

export interface Opportunity {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface Threat {
  title: string;
  description: string;
  competitorName?: string;
}

export interface RoadmapStep {
  step: number;
  phase: string;
  title: string;
  description: string;
  tags: string[];
}

export interface DeepDiveExtras {
  seo: {
    headline: string;
    summary: string;
    bullets: string[];
    keywordNotes?: string;
  };
  reviews: {
    headline: string;
    clientSummary: string;
    competitorSummary: string;
    recommendation: string;
    /** Per-competitor reputation blurbs when multi-competitor deep dive */
    competitorSummaries?: { name: string; summary: string }[];
  };
}

export interface ReportData {
  meta: {
    clientName: string;
    clientUrl: string;
    competitorName: string;
    competitorUrl: string;
    generatedAt: string;
    /** When deep dive compares multiple competitors */
    competitors?: { name: string; url: string }[];
  };
  hero: {
    headline: string;
    subheadline: string;
    stats: ReportStat[];
  };
  overview: {
    clientSummary: string;
    competitorSummary: string;
    competitorSummaries?: { name: string; summary: string }[];
  };
  topFindings: TopFinding[];
  comparison: ComparisonRow[] | MultiComparisonRow[];
  advantages: Advantage[];
  opportunities: Opportunity[];
  threats: Threat[];
  roadmap: RoadmapStep[];
  cta: {
    headline: string;
    body: string;
  };
  /** Present on deep-dive deliverables only */
  deepDive?: DeepDiveExtras;
  /** Deep dive only — ranked competitive threats */
  competitorRankings?: CompetitorRanking[];
}

export type ReportType = 'standard' | 'deepdive';

export interface Report {
  id: string;
  created_at: string;
  updated_at: string;
  lead_id: string;
  report_data: ReportData | null;
  is_unlocked: boolean;
  unlocked_at: string | null;
  viewed_teaser_at: string | null;
  viewed_full_at: string | null;
  report_type?: ReportType;
  deepdive_token?: string | null;
}
