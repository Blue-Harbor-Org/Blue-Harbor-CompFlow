'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import type { Client, PipelineStatus, TeamMember } from '@/types/dashboard';
import { PIPELINE_COLUMNS } from '@/types/dashboard';
import ClientKanbanView from '@/components/admin/ClientKanbanView';
import ClientTableView from '@/components/admin/ClientTableView';

const VIEW_PREF_KEY = 'bh-dashboard-view';

interface Props {
  initialClients: Client[];
  teamMembers: TeamMember[];
}

export default function ClientPipelineView({ initialClients, teamMembers }: Props) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<PipelineStatus | 'all'>('all');
  const [filterMember, setFilterMember] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>(() => {
    if (typeof window === 'undefined') return 'table';
    return (localStorage.getItem(VIEW_PREF_KEY) as 'table' | 'kanban') || 'table';
  });

  useEffect(() => {
    localStorage.setItem(VIEW_PREF_KEY, viewMode);
  }, [viewMode]);

  useEffect(() => {
    const sb = createBrowserClient();
    const channel = sb
      .channel('pipeline-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leads' },
        (payload) => {
          if (payload.eventType === 'UPDATE' && payload.new) {
            setClients((prev) =>
              prev.map((c) => (c.id === (payload.new as Client).id ? { ...c, ...payload.new } : c))
            );
          }
          if (payload.eventType === 'INSERT' && payload.new) {
            setClients((prev) => [payload.new as Client, ...prev]);
          }
          if (payload.eventType === 'DELETE' && payload.old) {
            const id = (payload.old as { id?: string }).id;
            if (id) setClients((prev) => prev.filter((c) => c.id !== id));
          }
        }
      )
      .subscribe();

    return () => { void sb.removeChannel(channel); };
  }, []);

  const filteredClients = useMemo(() => {
    let rows = [...clients];
    const q = search.toLowerCase();
    if (q) {
      rows = rows.filter(
        (c) =>
          c.business_name.toLowerCase().includes(q) ||
          c.contact_name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
      );
    }
    if (filterStatus !== 'all') {
      rows = rows.filter((c) => c.pipeline_status === filterStatus);
    }
    if (filterMember !== 'all') {
      rows = rows.filter((c) => c.assigned_to === filterMember);
    }
    return rows;
  }, [clients, search, filterStatus, filterMember]);

  const handleStatusDrop = useCallback(async (clientId: string, newStatus: PipelineStatus) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId ? { ...c, pipeline_status: newStatus, status_changed_at: new Date().toISOString() } : c
      )
    );
    await fetch('/api/dashboard/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, status: newStatus }),
    });
  }, []);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    PIPELINE_COLUMNS.forEach(({ status }) => {
      counts[status] = clients.filter((c) => c.pipeline_status === status).length;
    });
    return counts;
  }, [clients]);

  return (
    <div className="space-y-4">
      {/* Status summary bar */}
      <div className="flex flex-wrap gap-2">
        {PIPELINE_COLUMNS.map(({ status, label, color }) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilterStatus(filterStatus === status ? 'all' : status)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
            style={{
              background: filterStatus === status ? `${color}20` : 'transparent',
              border: `1px solid ${filterStatus === status ? color : 'var(--border)'}`,
              color: filterStatus === status ? color : 'var(--muted)',
            }}
          >
            <span className="h-2 w-2 rounded-full" style={{ background: color }} />
            {label}
            <span className="font-bold">{statusCounts[status] ?? 0}</span>
          </button>
        ))}
      </div>

      {/* Controls row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input max-w-xs"
            style={{ fontSize: '13px', padding: '8px 12px' }}
          />
          <select
            value={filterMember}
            onChange={(e) => setFilterMember(e.target.value)}
            className="input hidden w-auto sm:block"
            style={{ fontSize: '13px', padding: '8px 12px', maxWidth: 180 }}
          >
            <option value="all">All members</option>
            {teamMembers.map((m) => (
              <option key={m.id} value={m.id}>{m.full_name}</option>
            ))}
          </select>
        </div>

        <div
          className="inline-flex rounded-lg border p-0.5"
          style={{ borderColor: 'var(--border)', background: 'rgba(9,20,40,0.4)' }}
        >
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className="rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors"
            style={{
              background: viewMode === 'table' ? 'var(--gold-dim)' : 'transparent',
              color: viewMode === 'table' ? 'var(--gold)' : 'var(--muted)',
              border: viewMode === 'table' ? '1px solid var(--border-gold)' : '1px solid transparent',
            }}
          >
            Table
          </button>
          <button
            type="button"
            onClick={() => setViewMode('kanban')}
            className="rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors"
            style={{
              background: viewMode === 'kanban' ? 'var(--gold-dim)' : 'transparent',
              color: viewMode === 'kanban' ? 'var(--gold)' : 'var(--muted)',
              border: viewMode === 'kanban' ? '1px solid var(--border-gold)' : '1px solid transparent',
            }}
          >
            Kanban
          </button>
        </div>
      </div>

      {/* View */}
      {viewMode === 'kanban' ? (
        <ClientKanbanView clients={filteredClients} onStatusDrop={handleStatusDrop} />
      ) : (
        <ClientTableView clients={filteredClients} />
      )}
    </div>
  );
}
