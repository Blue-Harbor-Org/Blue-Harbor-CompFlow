import { notFound, redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase';
import TeaserPage from '@/components/report/TeaserPage';
import type { Lead } from '@/types/lead';
import type { Report } from '@/types/report';

interface Props {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ locked?: string; admin?: string }>;
}

export default async function ReportTeaserPage({ params, searchParams }: Props) {
  const { token } = await params;
  const { locked, admin } = await searchParams;

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

  const { data: report } = await supabase
    .from('reports')
    .select('*')
    .eq('lead_id', lead.id)
    .eq('report_type', 'standard')
    .maybeSingle();

  // If unlocked (and not coming from locked redirect), go to full report
  if (report?.is_unlocked && !locked) {
    redirect(`/report/${token}/full`);
  }

  // Mark teaser as viewed
  if (report && !report.viewed_teaser_at) {
    await supabase
      .from('reports')
      .update({ viewed_teaser_at: new Date().toISOString() })
      .eq('id', report.id);
  }

  return (
    <TeaserPage
      lead={lead as Lead}
      report={(report ?? { id: '', created_at: '', updated_at: '', lead_id: lead.id, report_data: null, is_unlocked: false, unlocked_at: null, viewed_teaser_at: null, viewed_full_at: null }) as Report}
    />
  );
}
