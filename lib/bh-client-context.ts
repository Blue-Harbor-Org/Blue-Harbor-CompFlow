import type { SupabaseClient } from '@supabase/supabase-js';
import type { Lead } from '@/types/lead';
import type { Report } from '@/types/report';

export interface BhClientRecord {
  id: string;
  report_id: string | null;
  company_name: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  status: string;
  assigned_to: string | null;
  created_at: string;
  notes: string | null;
  intake_token?: string | null;
}

export interface BhClientContext {
  client: BhClientRecord | null;
  standardReport: Report | null;
  deepdiveReport: Report | null;
  lead: Lead | null;
}

export async function getBhClientContext(
  supabase: SupabaseClient,
  clientId: string
): Promise<BhClientContext> {
  const { data: client } = await supabase
    .from('bh_clients')
    .select('*')
    .eq('id', clientId)
    .maybeSingle();

  if (!client) {
    return {
      client: null,
      standardReport: null,
      deepdiveReport: null,
      lead: null,
    };
  }

  let standardReport: Report | null = null;

  if (client.report_id) {
    const { data } = await supabase
      .from('reports')
      .select('*')
      .eq('id', client.report_id)
      .maybeSingle();

    standardReport = (data as Report | null) ?? null;
  }

  if (!standardReport) {
    const { data } = await supabase
      .from('reports')
      .select('*')
      .eq('lead_id', client.id)
      .eq('report_type', 'standard')
      .maybeSingle();

    standardReport = (data as Report | null) ?? null;
  }

  const leadId = standardReport?.lead_id ?? client.id;

  const [{ data: lead }, { data: deepdiveReport }] = await Promise.all([
    supabase.from('leads').select('*').eq('id', leadId).maybeSingle(),
    supabase
      .from('reports')
      .select('*')
      .eq('lead_id', leadId)
      .eq('report_type', 'deepdive')
      .maybeSingle(),
  ]);

  return {
    client: client as BhClientRecord,
    standardReport,
    deepdiveReport: (deepdiveReport as Report | null) ?? null,
    lead: (lead as Lead | null) ?? null,
  };
}

export async function getBhClientLeadId(
  supabase: SupabaseClient,
  clientId: string
): Promise<string | null> {
  const { client, lead } = await getBhClientContext(supabase, clientId);
  if (!client) return null;
  return lead?.id ?? client.id;
}
