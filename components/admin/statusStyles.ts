import type { LeadStatus } from '@/types/lead';

export const STATUS_STYLES: Record<
  LeadStatus,
  { bg: string; color: string; label: string }
> = {
  pending: {
    bg: 'rgba(100,140,200,0.1)',
    color: '#8fa8c8',
    label: 'New',
  },
  report_ready: {
    bg: 'rgba(59,130,246,0.1)',
    color: '#60a5fa',
    label: 'Report Ready',
  },
  call_booked: {
    bg: 'rgba(212,168,67,0.15)',
    color: '#d4a843',
    label: '🔥 Call Booked',
  },
  unlocked: {
    bg: 'rgba(46,204,138,0.1)',
    color: '#2ecc8a',
    label: 'Unlocked',
  },
  proposal_sent: {
    bg: 'rgba(139,111,212,0.1)',
    color: '#8b6fd4',
    label: 'Proposal Sent',
  },
  closed_won: {
    bg: 'rgba(46,204,138,0.15)',
    color: '#2ecc8a',
    label: '✓ Won',
  },
  closed_lost: {
    bg: 'rgba(224,80,80,0.1)',
    color: '#e05050',
    label: 'Lost',
  },
};
