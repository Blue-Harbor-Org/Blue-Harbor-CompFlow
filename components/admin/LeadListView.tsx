'use client';

import LeadRow from '@/components/admin/LeadRow';
import type { Lead, LeadStatus } from '@/types/lead';
import type { LeadReports } from '@/lib/pipelineReports';

interface Props {
  leads: Lead[];
  reportMap: Record<string, LeadReports>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUnlockReport: (leadId: string) => Promise<void>;
  onUnlockDeepDive: (leadId: string) => Promise<void>;
  onGenerateDeepDive: (leadId: string) => Promise<void>;
  onStatusChange: (leadId: string, status: LeadStatus) => Promise<void>;
  onDeleted: (leadId: string) => void;
  hasActiveFilters: boolean;
}

export default function LeadListView({
  leads,
  reportMap,
  selectedId,
  onSelect,
  onUnlockReport,
  onUnlockDeepDive,
  onGenerateDeepDive,
  onStatusChange,
  onDeleted,
  hasActiveFilters,
}: Props) {
  if (leads.length === 0) {
    return (
      <div
        className="rounded-xl border px-6 py-16 text-center text-sm"
        style={{
          borderColor: 'var(--border)',
          background: 'rgba(9,20,40,0.35)',
          color: 'var(--muted)',
        }}
      >
        {hasActiveFilters ? (
          <>
            <p className="font-medium" style={{ color: 'var(--silver)' }}>
              No leads match your filters.
            </p>
            <p className="mt-2 text-xs">Try clearing filters or widening your search.</p>
          </>
        ) : (
          <>
            <p className="font-medium" style={{ color: 'var(--silver)' }}>
              No leads yet.
            </p>
            <p className="mt-2 text-xs">Add your first lead to get started.</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div
      className="overflow-x-auto rounded-xl border md:rounded-xl"
      style={{ borderColor: 'var(--border)' }}
    >
      <table className="w-full min-w-[920px] border-collapse text-left">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(9,20,40,0.55)' }}>
            {['Business', 'Contact', 'Status', 'Industry', 'Source', 'Created', 'Actions'].map(
              (h) => (
                <th
                  key={h}
                  className="whitespace-nowrap px-3 py-3 text-[11px] font-semibold uppercase tracking-wide md:py-2.5"
                  style={{ color: 'var(--muted)' }}
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const bundle = reportMap[lead.id] ?? { standard: null, deep: null };
            return (
              <LeadRow
                key={lead.id}
                lead={lead}
                standardReport={bundle.standard}
                deepReport={bundle.deep}
                selected={selectedId === lead.id}
                onOpen={() => onSelect(lead.id)}
                onUnlockReport={() => onUnlockReport(lead.id)}
                onUnlockDeepDive={() => onUnlockDeepDive(lead.id)}
                onGenerateDeepDive={() => onGenerateDeepDive(lead.id)}
                onStatusChange={(status) => onStatusChange(lead.id, status)}
                onDeleted={() => onDeleted(lead.id)}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
