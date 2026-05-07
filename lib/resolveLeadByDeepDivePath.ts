import type { SupabaseClient } from '@supabase/supabase-js';
import type { Lead } from '@/types/lead';

/**
 * Resolve a lead from the `[token]` segment of `/report/[token]/deepdive`.
 * Accepts either `leads.report_token` (canonical for share URLs) or
 * `reports.deepdive_token` for deep-dive rows (handles mistaken / legacy links).
 */
export async function resolveLeadByDeepDivePathToken(
  supabase: SupabaseClient,
  rawToken: string
): Promise<{ lead: Lead | null; errorMessage: string | null }> {
  const token = decodeURIComponent(rawToken || '')
    .trim()
    .replace(/\/+$/, '');

  if (!token) {
    return { lead: null, errorMessage: 'empty token' };
  }

  const { data: byReportToken, error: errReport } = await supabase
    .from('leads')
    .select('*')
    .eq('report_token', token)
    .maybeSingle();

  if (errReport) {
    return { lead: null, errorMessage: errReport.message };
  }

  if (byReportToken) {
    return { lead: byReportToken as Lead, errorMessage: null };
  }

  const { data: deepLink, error: errDeep } = await supabase
    .from('reports')
    .select('lead_id')
    .eq('deepdive_token', token)
    .maybeSingle();

  if (errDeep) {
    return { lead: null, errorMessage: errDeep.message };
  }

  if (!deepLink?.lead_id) {
    return { lead: null, errorMessage: null };
  }

  const { data: byLeadId, error: errLead } = await supabase
    .from('leads')
    .select('*')
    .eq('id', deepLink.lead_id)
    .maybeSingle();

  if (errLead) {
    return { lead: null, errorMessage: errLead.message };
  }

  return {
    lead: (byLeadId as Lead | null) ?? null,
    errorMessage: null,
  };
}
