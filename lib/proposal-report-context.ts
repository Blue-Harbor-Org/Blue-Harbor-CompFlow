import type {
  ReportData,
  TopFinding,
  ComparisonRow,
  MultiComparisonRow,
} from '@/types/report';

function findingLines(findings: TopFinding[]): string[] {
  return findings.slice(0, 8).map((f) => {
    const teaser = f.teaser ? ` — ${f.teaser}` : '';
    return `${f.title}${teaser}`;
  });
}

function comparisonStrengths(data: ReportData): string[] {
  const rows = data.comparison ?? [];
  const out: string[] = [];
  for (const row of rows.slice(0, 8)) {
    if ('competitors' in row) {
      const m = row as MultiComparisonRow;
      if (!m.clientAdvantage && m.advantageNote) {
        out.push(`${m.category}: ${m.advantageNote}`);
      }
    } else {
      const c = row as ComparisonRow;
      if (c.advantage === 'competitor' && (c.competitor || c.advantageNote)) {
        out.push(`${c.category}: ${c.competitor}${c.advantageNote ? ` (${c.advantageNote})` : ''}`);
      }
    }
  }
  return out.slice(0, 8);
}

/** Pulls human-readable audit bullets from the competitive report JSON. */
export function extractProposalReportContext(reportData: ReportData | null | undefined): {
  findings: string[];
  competitorStrengths: string[];
  competitorName?: string;
} {
  if (!reportData) {
    return { findings: [], competitorStrengths: [] };
  }
  const findings: string[] = [];
  if (reportData.topFindings?.length) {
    findings.push(...findingLines(reportData.topFindings));
  }
  if (reportData.opportunities?.length) {
    for (const o of reportData.opportunities.slice(0, 4)) {
      findings.push(`${o.title}: ${o.description}`);
    }
  }
  const competitorStrengths = comparisonStrengths(reportData);
  const competitorName = reportData.meta?.competitorName || undefined;
  return {
    findings: findings.slice(0, 8),
    competitorStrengths,
    competitorName,
  };
}
