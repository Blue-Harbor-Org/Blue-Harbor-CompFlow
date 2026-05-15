import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getBhClientContext } from '@/lib/bh-client-context';
import { getLatestClientIntake } from '@/lib/client-intake';
import AdminShell from '@/components/admin/AdminShell';
import ProposalBuilder from '@/components/proposal/ProposalBuilder';
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
  const { client, standardReport } = await getBhClientContext(admin, clientId);
  if (!client) notFound();

  const [existingProposalResult, intake, mockupsForPdfResult] = await Promise.all([
    admin
      .from('bh_proposals')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    getLatestClientIntake(admin, clientId, standardReport?.lead_id ?? null),
    admin
      .from('bh_site_mockups')
      .select('id, page_slug, updated_at')
      .eq('client_id', clientId)
      .order('updated_at', { ascending: false }),
  ]);
  const existingProposal = existingProposalResult.data;
  const mockupsForPdf = mockupsForPdfResult.data ?? [];
  const pdfMockupId =
    mockupsForPdf.find((m) => m.page_slug === 'home')?.id ?? mockupsForPdf[0]?.id ?? null;

  const reportData = standardReport?.report_data
    ? (standardReport.report_data as unknown as Record<string, unknown>)
    : null;

  let battlecardFromReport: BattlecardRow[] = [];
  if (reportData && Array.isArray(reportData.comparison)) {
    battlecardFromReport = reportData.comparison
      .slice(0, 10)
      .map((row: Record<string, unknown>, i: number) => ({
        id: `bc-${i}`,
        category: (row.category as string) || '',
        client: (row.client as string) || '',
        competitor: (row.competitor as string) || (row.topCompetitor as string) || '',
        included: true,
      }));
  }

  const summaryParts: string[] = [];

  if (intake) {
    const intakeHighlights: string[] = [];
    if (intake.years_in_business) {
      intakeHighlights.push(`${intake.years_in_business} years in business`);
    }
    if (intake.deals_closed) {
      intakeHighlights.push(`${intake.deals_closed} closed deals`);
    }
    if (intake.total_volume) {
      intakeHighlights.push(`$${Number(intake.total_volume).toLocaleString()} in volume`);
    }
    if (intakeHighlights.length > 0) {
      summaryParts.push(`${client.company_name} reports ${intakeHighlights.join(', ')}.`);
    }
    if (intake.geo_focus) {
      summaryParts.push(`Geographic focus: ${intake.geo_focus}.`);
    }
  }

  if (reportData) {
    const overview = reportData.overview as Record<string, unknown> | undefined;
    if (overview?.clientSummary) {
      summaryParts.push(overview.clientSummary as string);
    }

    const topFindings = reportData.topFindings as { title: string }[] | undefined;
    if (topFindings?.length) {
      const gaps = topFindings
        .slice(0, 3)
        .map((finding) => finding.title)
        .join(', ');
      summaryParts.push(`Key gaps identified: ${gaps}.`);
    }
  }

  return (
    <AdminShell
      userEmail={user.email}
      title="Proposal Builder"
      subtitle={client.company_name}
      headerActions={
        <Link href={`/dashboard/clients/${clientId}`} className="btn-ghost min-h-[44px] px-4 py-2 text-sm">
          Back
        </Link>
      }
    >
      <ProposalBuilder
        clientId={clientId}
        clientName={client.company_name}
        existingProposal={existingProposal}
        battlecardFromReport={battlecardFromReport}
        situationSummary={summaryParts.join(' ')}
        pdfMockupId={pdfMockupId}
      />
    </AdminShell>
  );
}
