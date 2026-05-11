import { notFound, redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase';
import TeaserPage from '@/components/report/TeaserPage';
import type { Lead } from '@/types/lead';
import type { Report } from '@/types/report';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ token: string }>;
}

function ReportBeingPrepared({ businessName }: { businessName: string }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--navy)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: 420 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⟳</div>
        <h1
          className="font-heading text-2xl mb-3"
          style={{ color: 'var(--light)' }}
        >
          Report being prepared
        </h1>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Your competitive analysis for <strong style={{ color: 'var(--silver)' }}>{businessName}</strong>{' '}
          is not in our system yet. If you just submitted the form, wait a moment and refresh.
        </p>
      </div>
    </div>
  );
}

export default async function ReportTeaserPage({ params }: Props) {
  const { token } = await params;

  const supabase = createAdminClient();

  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select('*')
    .eq('report_token', token)
    .single();

  if (leadError || !lead) {
    notFound();
  }

  // Must filter standard report only — deep dive rows share lead_id and must never drive teaser / unlock logic
  const { data: report, error: reportError } = await supabase
    .from('reports')
    .select('*')
    .eq('lead_id', lead.id)
    .eq('report_type', 'standard')
    .maybeSingle();

  if (reportError) {
    console.error('[teaser] standard report query:', reportError.message);
  }

  if (!report) {
    return <ReportBeingPrepared businessName={lead.business_name} />;
  }

  if (report.is_unlocked) {
    redirect(`/report/${token}/full`);
  }

  if (report && !report.viewed_teaser_at) {
    await supabase
      .from('reports')
      .update({ viewed_teaser_at: new Date().toISOString() })
      .eq('id', report.id);
  }

  return (
    <TeaserPage lead={lead as Lead} report={report as Report} />
  );
}
