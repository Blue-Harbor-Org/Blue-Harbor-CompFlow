import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase';
import FullReportPage from '@/components/report/FullReportPage';
import type { Lead } from '@/types/lead';
import type { Report } from '@/types/report';
import Link from 'next/link';

interface Props {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ admin?: string }>;
}

function Preparing() {
  return (
    <div style={{ background: 'var(--navy)', minHeight: '100vh', padding: 48 }}>
      <div className="mx-auto max-w-lg card p-10 text-center">
        <p className="font-heading text-xl mb-2" style={{ color: 'var(--light)' }}>
          Your deep dive report is being prepared
        </p>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Multi-page analysis takes a few minutes. Check back shortly or contact Blue Harbor.
        </p>
      </div>
    </div>
  );
}

function Locked() {
  return (
    <div style={{ background: 'var(--navy)', minHeight: '100vh', padding: 48 }}>
      <div className="mx-auto max-w-lg card p-10 text-center">
        <p className="font-heading text-xl mb-2" style={{ color: 'var(--light)' }}>
          Deep dive report locked
        </p>
        <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
          This deliverable is unlocked by your strategist after your call.
        </p>
        <Link href="/" className="btn-primary inline-block px-6 py-3 text-sm">
          Back to Blue Harbor
        </Link>
      </div>
    </div>
  );
}

export default async function DeepDiveRoute({ params, searchParams }: Props) {
  const { token } = await params;
  const { admin } = await searchParams;
  const isAdminPreview = admin === 'true';

  const supabase = createAdminClient();

  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select('*')
    .eq('report_token', token)
    .single();

  if (leadError || !lead) notFound();

  const leadRow = lead as Lead;

  const { data: deepReport } = await supabase
    .from('reports')
    .select('*')
    .eq('lead_id', leadRow.id)
    .eq('report_type', 'deepdive')
    .maybeSingle();

  if (leadRow.deepdive_status === 'generating') {
    return <Preparing />;
  }

  if (!deepReport) {
    notFound();
  }

  if (!deepReport.report_data) {
    return <Preparing />;
  }

  if (!deepReport.is_unlocked && !isAdminPreview) {
    return <Locked />;
  }

  if (!isAdminPreview && deepReport.is_unlocked && !leadRow.deepdive_viewed_at) {
    await supabase
      .from('leads')
      .update({
        deepdive_viewed_at: new Date().toISOString(),
        deepdive_status: 'viewed',
      })
      .eq('id', leadRow.id);
  }

  return (
    <FullReportPage
      lead={leadRow}
      report={deepReport as Report}
      variant="deepdive"
    />
  );
}
