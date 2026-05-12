import type { LeadStatus } from '@/types/lead';

export const STATUS_STYLES: Record<
  LeadStatus,
  { bg: string; color: string; label: string }
> = {
  pending: {
    bg: 'rgba(156,179,212,0.12)',
    color: '#9cb3d4',
    label: 'New',
  },
  report_ready: {
    bg: 'rgba(59,130,246,0.12)',
    color: '#60a5fa',
    label: 'Report Ready',
  },
  call_booked: {
    bg: 'rgba(229,184,74,0.14)',
    color: '#e5b84a',
    label: '🔥 Call Booked',
  },
  unlocked: {
    bg: 'rgba(52,211,153,0.12)',
    color: '#34d399',
    label: 'Unlocked',
  },
  proposal_sent: {
    bg: 'rgba(139,111,212,0.12)',
    color: '#8b6fd4',
    label: 'Proposal Sent',
  },
  closed_won: {
    bg: 'rgba(52,211,153,0.15)',
    color: '#34d399',
    label: '✓ Won',
  },
  closed_lost: {
    bg: 'rgba(240,96,96,0.12)',
    color: '#f06060',
    label: 'Lost',
  },
};
