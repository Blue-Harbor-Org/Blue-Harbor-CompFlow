'use client';

import type { Lead, LeadStatus } from '@/types/lead';
import type { Report } from '@/types/report';
import StatusBadge from '@/components/admin/StatusBadge';
import QuickActions from '@/components/admin/QuickActions';
import { getVertical } from '@/lib/verticals';
import { formatRelativeTime } from '@/lib/formatRelativeTime';

const DOT_PALETTE = ['#60a5fa', '#e5b84a', '#34d399', '#8b6fd4', '#f06060', '#9cb3d4'];

function industryDotColor(industry: string | undefined): string {
  const id = (industry || 'general').toLowerCase();
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i)) % DOT_PALETTE.length;
  return DOT_PALETTE[h];
}

interface Props {
  lead: Lead;
  standardReport: Report | null;
  deepReport: Report | null;
  selected: boolean;
  onOpen: () => void;
  onUnlockReport: () => Promise<void>;
  onUnlockDeepDive?: () => Promise<void>;
  onGenerateDeepDive?: () => Promise<void>;
  onStatusChange: (status: LeadStatus) => Promise<void> | void;
  onDeleted?: () => void;
}

export default function LeadRow({
  lead,
  standardReport,
  deepReport,
  selected,
  onOpen,
  onUnlockReport,
  onUnlockDeepDive,
  onGenerateDeepDive,
  onStatusChange,
  onDeleted,
}: Props) {
  const vertical = getVertical(lead.industry);
  const src =
    lead.source === 'manual'
      ? { label: 'Manual', bg: 'rgba(212,168,67,0.12)', color: 'var(--gold)' }
      : { label: 'Public', bg: 'rgba(143,168,200,0.12)', color: 'var(--silver)' };

  const subStatus =
    lead.deepdive_status && lead.deepdive_status !== 'generating'
      ? `Deep dive: ${lead.deepdive_status}`
      : null;

  return (
    <tr
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      className="cursor-pointer transition-colors duration-150 ease-out"
      style={{
        borderLeft: selected || undefined ? '3px solid var(--gold)' : '3px solid transparent',
        background:
          selected ? 'rgba(212,168,67,0.06)' : 'transparent',
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.borderLeftColor = 'rgba(212,168,67,0.45)';
          e.currentTarget.style.background = 'rgba(212,168,67,0.03)';
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.borderLeftColor = 'transparent';
          e.currentTarget.style.background = 'transparent';
        }
      }}
    >
      <td className="min-h-[52px] px-3 py-3 align-top md:py-2.5">
        <div className="font-body text-sm font-semibold" style={{ color: 'var(--light)' }}>
          {lead.business_name}
        </div>
        {lead.competitor_name && (
          <div className="mt-0.5 text-xs" style={{ color: 'var(--muted)' }}>
            vs {lead.competitor_name}
          </div>
        )}
        {lead.deepdive_status && lead.deepdive_status !== 'generating' && (
          <span
            className="mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
            style={{
              background: 'rgba(212,168,67,0.12)',
              color: 'var(--gold)',
            }}
          >
            Deep dive
          </span>
        )}
      </td>

      <td className="min-h-[52px] px-3 py-3 align-top md:py-2.5">
        <div className="text-sm" style={{ color: 'var(--silver)' }}>
          {lead.contact_name}
        </div>
        <a
          href={`mailto:${encodeURIComponent(lead.email)}`}
          className="block min-h-[44px] py-1 text-xs underline-offset-2 hover:underline"
          style={{ color: 'var(--muted)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {lead.email}
        </a>
        {lead.phone && (
          <a
            href={`tel:${lead.phone.replace(/\s/g, '')}`}
            className="block min-h-[44px] py-1 text-xs underline-offset-2 hover:underline"
            style={{ color: 'var(--muted)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {lead.phone}
          </a>
        )}
      </td>

      <td className="min-h-[52px] px-3 py-3 align-top md:py-2.5">
        <StatusBadge status={lead.status} />
        {subStatus && (
          <div className="mt-1 text-[10px]" style={{ color: 'var(--muted)' }}>
            {subStatus}
          </div>
        )}
      </td>

      <td className="hidden min-h-[52px] px-3 py-3 align-top lg:table-cell md:py-2.5">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 shrink-0 rounded-full"
            style={{ background: industryDotColor(lead.industry) }}
            aria-hidden
          />
          <span className="text-sm" style={{ color: 'var(--silver)' }}>
            {vertical.label}
          </span>
        </div>
      </td>

      <td className="hidden min-h-[52px] px-3 py-3 align-top sm:table-cell md:py-2.5">
        <span
          className="inline-flex rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide"
          style={{ background: src.bg, color: src.color }}
        >
          {src.label}
        </span>
      </td>

      <td className="min-h-[52px] px-3 py-3 align-top md:py-2.5">
        <span className="text-sm" style={{ color: 'var(--muted)' }} title={new Date(lead.created_at).toLocaleString()}>
          {formatRelativeTime(lead.created_at)}
        </span>
      </td>

      <td className="min-h-[52px] px-2 py-3 align-top md:py-2.5" onClick={(e) => e.stopPropagation()}>
        <QuickActions
          lead={lead}
          standardReport={standardReport}
          deepReport={deepReport}
          onUnlockReport={onUnlockReport}
          onUnlockDeepDive={onUnlockDeepDive}
          onGenerateDeepDive={onGenerateDeepDive}
          onStatusChange={onStatusChange}
          onDeleted={onDeleted}
        />
      </td>
    </tr>
  );
}
