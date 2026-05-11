import type { Report } from '@/types/report';

export type LeadReports = {
  standard: Report | null;
  deep: Report | null;
};

/** Group flat report rows by lead_id */
/** Split report rows for one lead into standard vs deep */
export function splitReportsForLead(rows: Report[] | null | undefined): LeadReports {
  const out: LeadReports = { standard: null, deep: null };
  for (const r of rows ?? []) {
    const rt = r.report_type ?? 'standard';
    if (rt === 'deepdive') out.deep = r;
    else out.standard = r;
  }
  return out;
}

export function groupReportsByLeadId(rows: Report[]): Record<string, LeadReports> {
  const map: Record<string, LeadReports> = {};
  for (const r of rows) {
    const lid = r.lead_id;
    if (!map[lid]) {
      map[lid] = { standard: null, deep: null };
    }
    const rt = r.report_type ?? 'standard';
    if (rt === 'deepdive') {
      map[lid].deep = r;
    } else {
      map[lid].standard = r;
    }
  }
  return map;
}
