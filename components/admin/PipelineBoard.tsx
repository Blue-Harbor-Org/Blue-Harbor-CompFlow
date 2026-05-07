'use client';

import { useState, useCallback } from 'react';
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

export default function PipelineBoard({ initialLeads }: Props) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);

  const handleUnlock = useCallback(async (leadId: string) => {
    const res = await fetch('/api/unlock-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId }),
    });
    if (res.ok) {
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: 'unlocked' } : l))
      );
    }
  }, []);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: 'calc(100vh - 120px)' }}>
      {columns.map((col) => {
        const colLeads = leads.filter((l) => l.status === col.status);
        return (
          <div
            key={col.status}
            className="flex-shrink-0 w-64 flex flex-col rounded-xl"
            style={{
              background: col.highlight
                ? 'rgba(212,168,67,0.05)'
                : 'rgba(9,20,40,0.5)',
              border: col.highlight
                ? '1px solid rgba(212,168,67,0.2)'
                : '1px solid var(--border)',
            }}
          >
            {/* Column header */}
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{ borderBottom: `2px solid ${col.accent}` }}
            >
              <span className="text-sm font-semibold" style={{ color: col.accent }}>
                {col.label}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-bold"
                style={{
                  background: `${col.accent}20`,
                  color: col.accent,
                }}
              >
                {colLeads.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex-1 p-3 space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              {colLeads.length === 0 ? (
                <div
                  className="text-xs text-center py-8 opacity-40"
                  style={{ color: 'var(--muted)' }}
                >
                  No leads
                </div>
              ) : (
                colLeads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onUnlock={handleUnlock}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
