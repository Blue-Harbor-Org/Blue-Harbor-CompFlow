'use client';

import { useState, useCallback, useMemo } from 'react';
import LeadCard from './LeadCard';
import type { Lead, LeadStatus } from '@/types/lead';

interface Props {
  initialLeads: Lead[];
}

const columns: { status: LeadStatus; label: string; accent: string; highlight?: boolean }[] = [
  { status: 'pending', label: 'New', accent: 'var(--silver)' },
  { status: 'report_ready', label: 'Report Ready', accent: '#6196f0' },
  { status: 'call_booked', label: '🔥 Call Booked', accent: 'var(--gold)', highlight: true },
  { status: 'unlocked', label: 'Unlocked', accent: 'var(--green)' },
  { status: 'proposal_sent', label: 'Proposal Sent', accent: '#a78bfa' },
  { status: 'closed_won', label: 'Won ✓', accent: 'var(--green)' },
  { status: 'closed_lost', label: 'Lost', accent: 'var(--red)' },
];

function KanbanColumn({
  col,
  colLeads,
  onUnlock,
}: {
  col: (typeof columns)[0];
  colLeads: Lead[];
  onUnlock: (id: string) => Promise<void>;
}) {
  return (
    <div
      className="flex w-64 flex-shrink-0 flex-col rounded-xl"
      style={{
        background: col.highlight ? 'rgba(212,168,67,0.05)' : 'rgba(9,20,40,0.5)',
        border: col.highlight ? '1px solid rgba(212,168,67,0.2)' : '1px solid var(--border)',
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: `2px solid ${col.accent}` }}
      >
        <span className="text-sm font-semibold" style={{ color: col.accent }}>
          {col.label}
        </span>
        <span
          className="rounded-full px-2 py-0.5 text-xs font-bold"
          style={{
            background: `${col.accent}20`,
            color: col.accent,
          }}
        >
          {colLeads.length}
        </span>
      </div>
      <div className="max-h-[calc(100vh-200px)] flex-1 space-y-3 overflow-y-auto p-3">
        {colLeads.length === 0 ? (
          <div className="py-8 text-center text-xs opacity-40" style={{ color: 'var(--muted)' }}>
            No leads
          </div>
        ) : (
          colLeads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onUnlock={onUnlock} />
          ))
        )}
      </div>
    </div>
  );
}

export default function PipelineBoard({ initialLeads }: Props) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);

  const initialOpen = useMemo(() => {
    const m: Record<string, boolean> = {};
    columns.forEach((c) => {
      m[c.status] = !!c.highlight;
    });
    return m;
  }, []);

  const [mobileOpen, setMobileOpen] = useState<Record<string, boolean>>(initialOpen);

  const handleUnlock = useCallback(async (leadId: string) => {
    const res = await fetch('/api/unlock-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId }),
    });
    if (res.ok) {
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: 'unlocked' } : l)));
    }
  }, []);

  const toggleMobile = (status: string) => {
    setMobileOpen((o) => ({ ...o, [status]: !o[status] }));
  };

  return (
    <>
      {/* Desktop: horizontal Kanban */}
      <div
        className="hidden min-h-[calc(100vh-120px)] gap-4 overflow-x-auto pb-4 md:flex"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {columns.map((col) => {
          const colLeads = leads.filter((l) => l.status === col.status);
          return (
            <KanbanColumn key={col.status} col={col} colLeads={colLeads} onUnlock={handleUnlock} />
          );
        })}
      </div>

      {/* Mobile: collapsible vertical sections */}
      <div className="flex flex-col gap-3 md:hidden">
        {columns.map((col) => {
          const colLeads = leads.filter((l) => l.status === col.status);
          const expanded = mobileOpen[col.status] ?? false;
          return (
            <div
              key={col.status}
              className="overflow-hidden rounded-xl"
              style={{
                background: col.highlight ? 'rgba(212,168,67,0.08)' : 'rgba(9,20,40,0.5)',
                border: col.highlight ? '1px solid rgba(212,168,67,0.25)' : '1px solid var(--border)',
              }}
            >
              <button
                type="button"
                onClick={() => toggleMobile(col.status)}
                className="flex w-full min-h-[52px] items-center justify-between px-4 py-3 text-left"
                style={{ borderBottom: expanded ? `2px solid ${col.accent}` : 'none' }}
              >
                <span className="text-sm font-semibold" style={{ color: col.accent }}>
                  {expanded ? '▼' : '▶'} {col.label}
                </span>
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-bold"
                  style={{ background: `${col.accent}20`, color: col.accent }}
                >
                  {colLeads.length}
                </span>
              </button>
              {expanded && (
                <div className="space-y-3 p-3">
                  {colLeads.length === 0 ? (
                    <div className="py-6 text-center text-xs opacity-40" style={{ color: 'var(--muted)' }}>
                      No leads
                    </div>
                  ) : (
                    colLeads.map((lead) => (
                      <LeadCard key={lead.id} lead={lead} onUnlock={handleUnlock} />
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
