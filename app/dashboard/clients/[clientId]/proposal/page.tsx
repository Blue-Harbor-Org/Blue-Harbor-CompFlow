import { redirect, notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import AdminShell from '@/components/admin/AdminShell';
import ProposalBuilder from '@/components/proposal/ProposalBuilder';
import Link from 'next/link';
import type { BattlecardRow } from '@/types/proposal';

interface Props {
  params: Promise<{ clientId: string }>;
}

export default async function ProposalBuilderPage({ params }: Props) {
  const { clientId } = await params;

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const admin = createAdminClient();

  // Client data comes from the leads table (used by the pipeline dashboard)
  const { data: client, error: clientError } = await admin
    .from('leads')
    .select('*')
    .eq('id', clientId)
    .single();

  if (clientError || !client) notFound();

  // Check for existing proposal in bh_proposals
  const { data: existingProposal } = await admin
    .from('bh_proposals')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // Pull comp report data if a standard report exists for this lead
  let reportData: Record<string, unknown> | null = null;
  const { data: report } = await admin
    .from('reports')
    .select('report_data')
    .eq('lead_id', clientId)
    .eq('report_type', 'standard')
    .maybeSingle();
  if (report?.report_data) reportData = report.report_data as Record<string, unknown>;

  // Build battlecard from comp report comparison data
  let battlecardFromReport: BattlecardRow[] = [];
  if (reportData && reportData.comparison) {
    const comp = reportData.comparison;
    if (Array.isArray(comp)) {
      battlecardFromReport = comp.slice(0, 10).map((row: Record<string, unknown>, i: number) => ({
        id: `bc-${i}`,
        category: (row.category as string) || '',
        client: (row.client as string) || '',
        competitor: (row.competitor as string) || (row.topCompetitor as string) || '',
        included: true,
      }));
    }
  }

  // Auto-generate situation summary from report
  let situationSummary = '';
  if (reportData) {
    const parts: string[] = [];
    const overview = reportData.overview as Record<string, unknown> | undefined;
    if (overview?.clientSummary) {
      parts.push(overview.clientSummary as string);
    }
    const topFindings = reportData.topFindings as { title: string }[] | undefined;
    if (topFindings?.length) {
      const gaps = topFindings
        .slice(0, 3)
        .map(f => f.title)
        .join(', ');
      parts.push(`Key gaps identified: ${gaps}.`);
    }
    situationSummary = parts.join(' ');
  }

  return (
    <AdminShell
      userEmail={user.email}
      title="Proposal Builder"
      subtitle={client.business_name}
      headerActions={
        <Link href={`/dashboard/clients/${clientId}`} className="btn-ghost min-h-[44px] px-4 py-2 text-sm">
          ← Back
        </Link>
      }
    >
      <ProposalBuilder
        clientId={clientId}
        clientName={client.business_name}
        existingProposal={existingProposal}
        intakeData={null}
        battlecardFromReport={battlecardFromReport}
        situationSummary={situationSummary}
      />
    </AdminShell>
  );
}
