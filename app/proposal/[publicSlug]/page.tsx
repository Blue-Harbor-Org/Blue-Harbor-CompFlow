import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase';
import PublicProposal from '@/components/proposal/PublicProposal';
import type { Proposal } from '@/types/proposal';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ publicSlug: string }>;
}

export default async function PublicProposalPage({ params }: Props) {
  const { publicSlug } = await params;

  const admin = createAdminClient();

  const { data: proposal, error } = await admin
    .from('bh_proposals')
    .select('*')
    .eq('public_slug', publicSlug)
    .single();

  if (error || !proposal) notFound();

  // Fetch client name from leads table
  let clientName = proposal.title || 'Client';
  if (proposal.client_id) {
    const { data: lead } = await admin
      .from('leads')
      .select('business_name')
      .eq('id', proposal.client_id)
      .maybeSingle();
    if (lead?.business_name) clientName = lead.business_name;
  }

  return (
    <PublicProposal
      proposal={proposal as unknown as Proposal}
      clientName={clientName}
      slug={publicSlug}
    />
  );
}
