import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase';
import FullReportPage from '@/components/report/FullReportPage';
import { resolveLeadByDeepDivePathToken } from '@/lib/resolveLeadByDeepDivePath';
import type { Lead } from '@/types/lead';
import type { Report } from '@/types/report';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ admin?: string }>;
}

function Pending() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#050c1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Syne, sans-serif',
        padding: '40px 24px',
        textAlign: 'center',
      }}
    >
      <div>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔬</div>
        <h1
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 32,
            color: '#e8edf5',
            marginBottom: 12,
          }}
        >
          Deep Dive Report Pending
        </h1>
        <p style={{ color: '#8fa8c8', fontSize: 15, maxWidth: 400, margin: '0 auto' }}>
          Your deep dive report is being prepared. Check back shortly or wait for our email.
        </p>
      </div>
    </div>
  );
}

function ReadyLocked() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#050c1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Syne, sans-serif',
        padding: '40px 24px',
        textAlign: 'center',
      }}
    >
      <div>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <h1
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 32,
            color: '#e8edf5',
            marginBottom: 12,
          }}
        >
          Your Deep Dive Report Is Ready
        </h1>
        <p
          style={{
            color: '#8fa8c8',
            fontSize: 15,
            maxWidth: 400,
            margin: '0 auto 24px',
          }}
        >
          Your full deep dive competitive analysis is complete. You will receive an email with
          access shortly.
        </p>
        <p style={{ color: '#5a7294', fontSize: 13, marginBottom: 24 }}>
          Questions? Reply to your report email or contact Blue Harbor directly.
        </p>
        <Link href="/" className="btn-primary inline-block px-6 py-3 text-sm">
          Back to Blue Harbor
        </Link>
      </div>
    </div>
  );
}

export default async function DeepDivePage({ params, searchParams }: Props) {
  const { token: rawToken } = await params;
  const { admin } = await searchParams;
  const isAdmin = admin === 'true';

  const supabase = createAdminClient();

  const { lead, errorMessage } = await resolveLeadByDeepDivePathToken(
    supabase,
    rawToken
  );

  if (errorMessage) {
    console.error('[deepdive] lead resolve:', errorMessage);
  }

  if (!lead) {
    notFound();
  }

  const leadRow = lead as Lead;

  const {
    data: report,
    error: reportErr,
  } = await supabase
    .from('reports')
    .select('*')
    .eq('lead_id', leadRow.id)
    .eq('report_type', 'deepdive')
    .maybeSingle();

  if (reportErr) {
    console.error('[deepdive] reports query:', reportErr.message);
    return <Pending />;
  }

  const deepReport = report as Report | null;

  if (
    leadRow.deepdive_status === 'generating' ||
    (deepReport && !deepReport.report_data)
  ) {
    return <Pending />;
  }

  if (!deepReport) {
    return <Pending />;
  }

  if (!deepReport.is_unlocked && !isAdmin) {
    return <ReadyLocked />;
  }

  if (!deepReport.report_data) {
    return <Pending />;
  }

  // Debug: log actual topFindings shape so field-name mismatches are visible in the terminal
  if (process.env.NODE_ENV !== 'production') {
    console.log('[deepdive] topFindings sample:', JSON.stringify(deepReport.report_data.topFindings?.[0], null, 2));
  }

  if (!isAdmin && deepReport.is_unlocked && !(leadRow as { deepdive_viewed_at?: string | null }).deepdive_viewed_at) {
    await supabase
      .from('leads')
      .update({
        deepdive_status: 'viewed',
        deepdive_viewed_at: new Date().toISOString(),
      })
      .eq('id', leadRow.id);
  }

  return (
    <FullReportPage lead={leadRow} report={deepReport as Report} variant="deepdive" />
  );
}
