'use client';

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import type { Lead, LeadStatus } from '@/types/lead';
import type { Report } from '@/types/report';
import PipelineFilters, {
  defaultPipelineFilters,
  type PipelineFilterState,
} from '@/components/admin/PipelineFilters';
import StatsBar, { type StatFilterKey } from '@/components/admin/StatsBar';
import LeadListView from '@/components/admin/LeadListView';
import LeadKanbanView from '@/components/admin/LeadKanbanView';
import LeadSlideout from '@/components/admin/LeadSlideout';
import {
  groupReportsByLeadId,
  splitReportsForLead,
  type LeadReports,
} from '@/lib/pipelineReports';

interface Props {
  initialLeads: Lead[];
  initialReportRows: Report[];
}

function subscribeToWideViewport(callback: () => void) {
  const mq = window.matchMedia('(min-width: 768px)');
  mq.addEventListener('change', callback);
  return () => mq.removeEventListener('change', callback);
}

function getWideViewportSnapshot() {
  return typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches;
}

export default function PipelineView({ initialLeads, initialReportRows }: Props) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [reportMap, setReportMap] = useState<Record<string, LeadReports>>(() =>
    groupReportsByLeadId(initialReportRows)
  );
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState<PipelineFilterState>(() => defaultPipelineFilters());
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const wide = useSyncExternalStore(
    subscribeToWideViewport,
    getWideViewportSnapshot,
    () => false
  );

  const refreshLead = useCallback(async (leadId: string) => {
    const sb = createBrowserClient();
    const [{ data: row }, { data: reps }] = await Promise.all([
      sb.from('leads').select('*').eq('id', leadId).maybeSingle(),
      sb.from('reports').select('*').eq('lead_id', leadId),
    ]);
    if (row) {
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, ...(row as Lead) } : l))
      );
    }
    setReportMap((prev) => ({
      ...prev,
      [leadId]: splitReportsForLead((reps ?? []) as Report[]),
    }));
  }, []);

  useEffect(() => {
    const sb = createBrowserClient();
    const channel = sb
      .channel('leads-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leads' },
        (payload) => {
          if (payload.eventType === 'UPDATE' && payload.new) {
            const n = payload.new as Lead;
            setLeads((prev) => prev.map((l) => (l.id === n.id ? { ...l, ...n } : l)));
          }
          if (payload.eventType === 'INSERT' && payload.new) {
            setLeads((prev) => [payload.new as Lead, ...prev]);
          }
          if (payload.eventType === 'DELETE' && payload.old) {
            const id = (payload.old as { id?: string }).id;
            if (id) {
              setLeads((prev) => prev.filter((l) => l.id !== id));
              setReportMap((prev) => {
                const next = { ...prev };
                delete next[id];
                return next;
              });
              setSelectedId((sid) => (sid === id ? null : sid));
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reports' },
        (payload) => {
          const row = (payload.new ?? payload.old) as Report | undefined;
          const leadId = row?.lead_id;
          if (leadId) void refreshLead(leadId);
        }
      )
      .subscribe();

    return () => {
      void sb.removeChannel(channel);
    };
  }, [refreshLead]);

  const handleStatClick = useCallback((key: StatFilterKey) => {
    setFilters((f) => {
      if (key === 'all') return { ...f, statPreset: null, status: 'all' };
      if (key === 'call_booked') return { ...f, statPreset: 'call_booked', status: 'call_booked' };
      if (key === 'reports_unlocked')
        return { ...f, statPreset: 'reports_unlocked', status: 'all' };
      if (key === 'closed_won') return { ...f, statPreset: 'closed_won', status: 'closed_won' };
      return f;
    });
  }, []);

  const filteredLeads = useMemo(() => {
    let rows = [...leads];
    const q = debouncedSearch.toLowerCase();
    if (q) {
      rows = rows.filter(
        (l) =>
          l.business_name.toLowerCase().includes(q) ||
          l.contact_name.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q)
      );
    }
    if (filters.statPreset === 'reports_unlocked') {
      rows = rows.filter((l) => reportMap[l.id]?.standard?.is_unlocked);
    }
    if (filters.status !== 'all') {
      rows = rows.filter((l) => l.status === filters.status);
    }
    if (filters.industry !== 'all') {
      rows = rows.filter((l) => (l.industry ?? 'general') === filters.industry);
    }
    if (filters.source !== 'all') {
      rows = rows.filter((l) => l.source === filters.source);
    }

    rows.sort((a, b) => {
      switch (filters.sort) {
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'business':
          return a.business_name.localeCompare(b.business_name);
        case 'updated': {
          const ta = Math.max(
            new Date(a.created_at).getTime(),
            new Date(reportMap[a.id]?.standard?.updated_at ?? 0).getTime()
          );
          const tb = Math.max(
            new Date(b.created_at).getTime(),
            new Date(reportMap[b.id]?.standard?.updated_at ?? 0).getTime()
          );
          return tb - ta;
        }
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return rows;
  }, [leads, debouncedSearch, filters, reportMap]);

  const hasActiveFilters = Boolean(
    debouncedSearch ||
      filters.status !== 'all' ||
      filters.industry !== 'all' ||
      filters.source !== 'all' ||
      filters.sort !== 'newest' ||
      (filters.statPreset !== null && filters.statPreset !== 'all')
  );

  const selectedLead = selectedId ? leads.find((l) => l.id === selectedId) ?? null : null;
  const selectedBundle = selectedId ? reportMap[selectedId] ?? { standard: null, deep: null } : { standard: null, deep: null };

  const patchLead = useCallback((leadId: string, patch: Partial<Lead>) => {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, ...patch } : l)));
  }, []);

  async function postStatus(leadId: string, status: LeadStatus) {
    const res = await fetch('/api/lead-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId, status }),
    });
    if (!res.ok) return;
    patchLead(leadId, { status });
  }

  const unlockReport = useCallback(
    async (leadId: string) => {
      const res = await fetch('/api/unlock-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId }),
      });
      if (res.ok) {
        patchLead(leadId, { status: 'unlocked' });
        await refreshLead(leadId);
      }
    },
    [patchLead, refreshLead]
  );

  const unlockDeepDive = useCallback(
    async (leadId: string) => {
      await fetch('/api/unlock-deepdive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId }),
      });
      await refreshLead(leadId);
    },
    [refreshLead]
  );

  const generateDeepDive = useCallback(
    async (leadId: string) => {
      await fetch('/api/generate-deepdive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId }),
      });
      patchLead(leadId, { deepdive_status: 'generating' });
      await refreshLead(leadId);
    },
    [patchLead, refreshLead]
  );

  const removeLead = useCallback((leadId: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
    setReportMap((prev) => {
      const next = { ...prev };
      delete next[leadId];
      return next;
    });
    setSelectedId((id) => (id === leadId ? null : id));
  }, []);

  const showKanban = wide && viewMode === 'kanban';

  return (
    <div className="space-y-6">
      <StatsBar
        leads={leads}
        reportMap={reportMap}
        activeStat={filters.statPreset ?? 'all'}
        onStatClick={handleStatClick}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="font-body text-sm font-semibold md:hidden" style={{ color: 'var(--muted)' }}>
          Pipeline
        </div>
        <div className="hidden md:flex md:flex-1 md:justify-end">
          <div
            className="inline-flex rounded-xl border p-1"
            style={{ borderColor: 'var(--border)', background: 'rgba(9,20,40,0.4)' }}
          >
            <button
              type="button"
              className="min-h-[44px] rounded-lg px-5 py-2 text-xs font-semibold uppercase tracking-wide transition-colors duration-150"
              style={{
                background: viewMode === 'list' ? 'var(--gold-dim)' : 'transparent',
                color: viewMode === 'list' ? 'var(--gold)' : 'var(--muted)',
                border: viewMode === 'list' ? '1px solid var(--border-gold)' : '1px solid transparent',
              }}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
            <button
              type="button"
              className="min-h-[44px] rounded-lg px-5 py-2 text-xs font-semibold uppercase tracking-wide transition-colors duration-150"
              style={{
                background: viewMode === 'kanban' ? 'var(--gold-dim)' : 'transparent',
                color: viewMode === 'kanban' ? 'var(--gold)' : 'var(--muted)',
                border: viewMode === 'kanban' ? '1px solid var(--border-gold)' : '1px solid transparent',
              }}
              onClick={() => setViewMode('kanban')}
            >
              Kanban
            </button>
          </div>
        </div>
      </div>

      <PipelineFilters
        value={filters}
        onChange={setFilters}
        debouncedSearch={debouncedSearch}
        onDebouncedSearchChange={setDebouncedSearch}
      />

      {showKanban ? (
        <LeadKanbanView
          leads={filteredLeads}
          reportMap={reportMap}
          onOpen={(id) => setSelectedId(id)}
          onUnlockReport={unlockReport}
          onUnlockDeepDive={unlockDeepDive}
          onGenerateDeepDive={generateDeepDive}
          onStatusChange={(leadId, status) => postStatus(leadId, status)}
          onDeleted={removeLead}
          onStatusDrop={(leadId, status) => postStatus(leadId, status)}
        />
      ) : (
        <LeadListView
          leads={filteredLeads}
          reportMap={reportMap}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onUnlockReport={unlockReport}
          onUnlockDeepDive={unlockDeepDive}
          onGenerateDeepDive={generateDeepDive}
          onStatusChange={(leadId, status) => postStatus(leadId, status)}
          onDeleted={removeLead}
          hasActiveFilters={hasActiveFilters}
        />
      )}

      <LeadSlideout
        lead={selectedLead}
        standardReport={selectedBundle.standard}
        deepReport={selectedBundle.deep}
        open={Boolean(selectedId && selectedLead)}
        onClose={() => setSelectedId(null)}
        onLeadPatch={patchLead}
        onRefresh={refreshLead}
      />
    </div>
  );
}
