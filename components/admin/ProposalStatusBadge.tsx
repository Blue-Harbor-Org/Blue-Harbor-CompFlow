import type { LatestProposalBadge } from '@/types/dashboard';

export function ProposalStatusBadge({ status }: { status?: LatestProposalBadge | null }) {
  if (!status || status === 'none' || status === 'draft') return null;

  if (status === 'sent') {
    return (
      <span
        className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
        style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.35)' }}
      >
        Proposal sent
      </span>
    );
  }

  if (status === 'signed') {
    return (
      <span
        className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
        style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.35)' }}
      >
        ✓ Accepted
      </span>
    );
  }

  if (status === 'paused') {
    return (
      <span
        className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
        style={{ background: 'rgba(248,113,113,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.35)' }}
      >
        On hold
      </span>
    );
  }

  return null;
}
