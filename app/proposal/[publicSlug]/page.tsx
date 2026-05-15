import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase';
import PublicProposal from '@/components/proposal/PublicProposal';
import type { Proposal } from '@/types/proposal';

export const dynamic = 'force-dynamic';

export default async function PublicProposalPage({
  params,
}: PageProps<'/proposal/[publicSlug]'>) {
  const { publicSlug } = await params;

  const admin = createAdminClient();
  const { data: proposal, error } = await admin
    .from('bh_proposals')
    .select('*')
    .eq('public_slug', publicSlug)
    .maybeSingle();

  if (error || !proposal) notFound();

  const { data: clientRow } = await admin
    .from('bh_clients')
    .select('company_name, industry, contact_email, contact_name')
    .eq('id', proposal.client_id as string)
    .maybeSingle();

  const typed = proposal as unknown as Proposal;
  const clientCompany = clientRow?.company_name ?? typed.title ?? 'Your business';
  const contactEmail = clientRow?.contact_email ?? '';

  return (
    <PublicProposal
      proposal={typed}
      clientCompany={clientCompany}
      clientIndustry={clientRow?.industry ?? undefined}
      contactEmail={contactEmail}
      slug={publicSlug}
    />
  );
}
