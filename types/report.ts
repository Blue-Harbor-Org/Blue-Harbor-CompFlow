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
}

export interface RoadmapStep {
  step: number;
  phase: string;
  title: string;
  description: string;
  tags: string[];
}

export interface ReportData {
  meta: {
    clientName: string;
    clientUrl: string;
    competitorName: string;
    competitorUrl: string;
    generatedAt: string;
  };
  hero: {
    headline: string;
    subheadline: string;
    stats: ReportStat[];
  };
  overview: {
    clientSummary: string;
    competitorSummary: string;
  };
  topFindings: TopFinding[];
  comparison: ComparisonRow[];
  advantages: Advantage[];
  opportunities: Opportunity[];
  threats: Threat[];
  roadmap: RoadmapStep[];
  cta: {
    headline: string;
    body: string;
  };
}

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
}
