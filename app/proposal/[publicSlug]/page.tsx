import { notFound } from 'next/navigation';
import { createAnonClient } from '@/lib/supabase';
import PublicProposal from '@/components/proposal/PublicProposal';
import type { Proposal } from '@/types/proposal';

export const dynamic = 'force-dynamic';

export default async function PublicProposalPage(
  { params }: PageProps<'/proposal/[publicSlug]'>
) {
  const { publicSlug } = await params;

  const supabase = createAnonClient();

  const { data, error } = await supabase
    .rpc('get_proposal_by_slug', { p_slug: publicSlug })
    .single();

  if (error || !data) notFound();

  const proposal = data as unknown as Proposal;
  const clientName = proposal.title || 'Client';

  return (
    <PublicProposal
      proposal={proposal}
      clientName={clientName}
      slug={publicSlug}
    />
  );
}
