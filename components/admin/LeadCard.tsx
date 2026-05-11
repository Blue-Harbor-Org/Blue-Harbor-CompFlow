'use client';

import type { Lead, LeadStatus } from '@/types/lead';
import type { Report } from '@/types/report';
import QuickActions from '@/components/admin/QuickActions';
import { formatRelativeTime } from '@/lib/formatRelativeTime';

interface Props {
  lead: Lead;
  standardReport: Report | null;
  deepReport: Report | null;
  highlight?: boolean;
  large?: boolean;
  onOpen: () => void;
  onUnlockReport: () => Promise<void>;
  onUnlockDeepDive: () => Promise<void>;
  onGenerateDeepDive: () => Promise<void>;
  onStatusChange: (s: LeadStatus) => Promise<void>;
  onDeleted?: () => void;
}

export default function LeadCard({
  lead,
  standardReport,
  deepReport,
  highlight,
  large,
  onOpen,
  onUnlockReport,
  onUnlockDeepDive,
  onGenerateDeepDive,
  onStatusChange,
  onDeleted,
}: Props) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      className={`flex cursor-pointer flex-col gap-3 rounded-xl border p-4 text-sm transition-colors duration-150 ease-out ${
        large ? 'min-h-[140px]' : ''
      }`}
      style={{
        background: highlight ? 'rgba(212,168,67,0.08)' : 'rgba(9,20,40,0.65)',
        borderColor: highlight ? 'rgba(212,168,67,0.35)' : 'var(--border)',
        borderWidth: highlight ? 2 : 1,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="font-body text-base font-semibold leading-tight" style={{ color: 'var(--light)' }}>
            {lead.business_name}
          </div>
          {lead.competitor_name && (
            <div className="mt-0.5 text-xs" style={{ color: 'var(--muted)' }}>
              vs {lead.competitor_name}
            </div>
          )}
        </div>
        {lead.deepdive_status && lead.deepdive_status !== 'generating' && (
          <span
            className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"
            style={{
              background: 'rgba(212,168,67,0.15)',
              color: 'var(--gold)',
            }}
          >
            Deep dive
          </span>
        )}
      </div>

      <div className="text-xs" style={{ color: 'var(--silver)' }}>
        {lead.contact_name}
      </div>

      <div className="text-xs" style={{ color: 'var(--muted)' }}>
        {formatRelativeTime(lead.created_at)}
      </div>

      <div className="pt-1" style={{ borderTop: '1px solid var(--border)' }} onClick={(e) => e.stopPropagation()}>
        <QuickActions
          lead={lead}
          standardReport={standardReport}
          deepReport={deepReport}
          compact
          onUnlockReport={onUnlockReport}
          onUnlockDeepDive={onUnlockDeepDive}
          onGenerateDeepDive={onGenerateDeepDive}
          onStatusChange={onStatusChange}
          onDeleted={onDeleted}
        />
      </div>
    </div>
  );
}
