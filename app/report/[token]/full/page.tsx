import { notFound, redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase';
import FullReportPage from '@/components/report/FullReportPage';
import type { Lead } from '@/types/lead';
import type { Report } from '@/types/report';

interface Props {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ admin?: string }>;
}

export default async function FullReportRoute({ params, searchParams }: Props) {
  const { token } = await params;
  const { admin } = await searchParams;

  const supabase = createAdminClient();

  // Fetch lead by token
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select('*')
    .eq('report_token', token)
    .single();

  if (leadError || !lead) {
    notFound();
  }

  const { data: report, error: reportError } = await supabase
    .from('reports')
    .select('*')
    .eq('lead_id', lead.id)
    .eq('report_type', 'standard')
    .maybeSingle();

  if (reportError || !report) {
    redirect(`/report/${token}?locked=true`);
  }

  const isAdminPreview = admin === 'true';

  // If no report data yet, go back to teaser regardless
  if (!report.report_data) {
    redirect(`/report/${token}`);
  }

  // Enforce lock — admin preview bypasses this
  if (!report.is_unlocked && !isAdminPreview) {
    redirect(`/report/${token}?locked=true`);
  }

  // Mark full report as viewed
  if (!report.viewed_full_at) {
    await supabase
      .from('reports')
      .update({ viewed_full_at: new Date().toISOString() })
      .eq('id', report.id);
  }

  return <FullReportPage lead={lead as Lead} report={report as Report} />;
}
