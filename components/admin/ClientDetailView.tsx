'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import type { Client, TeamMember, ActivityLogEntry, PipelineStatus } from '@/types/dashboard';
import type { Report } from '@/types/report';
import type { ClientIntakeRecord } from '@/types/client-intake';
import { PIPELINE_COLUMNS } from '@/types/dashboard';
import { Avatar } from '@/components/admin/DashboardShell';
import { StatusBadge } from '@/components/admin/ClientTableView';
import ClientOverviewTab from '@/components/admin/ClientOverviewTab';
import ClientIntakeTab from '@/components/admin/ClientIntakeTab';
import ClientProposalTab from '@/components/admin/ClientProposalTab';
import ClientActivityTab from '@/components/admin/ClientActivityTab';
import ClientWebsiteTab from '@/components/admin/ClientWebsiteTab';

type Tab = 'overview' | 'intake' | 'proposal' | 'website' | 'activity';

export interface MockupRow {
  id: string;
  client_id: string;
  page_slug: string;
  page_title: string;
  html_content: string;
  preview_token: string;
  version: number;
  created_at: string;
  updated_at: string;
}

interface Props {
  client: Client;
  teamMembers: TeamMember[];
  currentMember: TeamMember;
  activityLog: ActivityLogEntry[];
  standardReport: Report | null;
  deepdiveReport: Report | null;
  intake: ClientIntakeRecord | null;
  mockups: MockupRow[];
}

export default function ClientDetailView({
  client: initialClient, teamMembers, currentMember, activityLog,
  standardReport, deepdiveReport, intake, mockups: initialMockups,
}: Props) {
  const [client, setClient] = useState(initialClient);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [assignedTo, setAssignedTo] = useState(client.assigned_to ?? '');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [mockups, setMockups] = useState(initialMockups);

  const handleStatusChange = useCallback(async (newStatus: PipelineStatus) => {
    setStatusUpdating(true);
    const res = await fetch('/api/dashboard/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: client.id, status: newStatus }),
    });
    if (res.ok) {
      setClient((c) => ({ ...c, pipeline_status: newStatus, status_changed_at: new Date().toISOString() }));
    }
    setStatusUpdating(false);
  }, [client.id]);

  const handleReassign = useCallback(async (memberId: string) => {
    setAssignedTo(memberId);
    await fetch('/api/dashboard/reassign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: client.id, memberId: memberId || null }),
    });
    const member = teamMembers.find((m) => m.id === memberId) ?? null;
    setClient((c) => ({ ...c, assigned_to: memberId || null, assigned_member: member }));
  }, [client.id, teamMembers]);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'intake', label: 'Intake Data' },
    { key: 'proposal', label: 'Proposal' },
    { key: 'website', label: 'Website' },
    { key: 'activity', label: 'Activity Log' },
  ];

  return (
    <div className="p-4 md:p-6">
      <Link
        href="/dashboard"
        className="mb-4 inline-flex items-center gap-1 text-xs font-medium transition-colors hover:underline"
        style={{ color: 'var(--gold)' }}
      >
        ← Back to Pipeline
      </Link>

      {/* Header */}
      <div className="mb-6 rounded-xl p-4 md:p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="font-body text-xl font-semibold" style={{ color: 'var(--light)' }}>
                {client.business_name}
              </h1>
              <div className="mt-1 flex items-center gap-3">
                <StatusBadge status={client.pipeline_status} />
                <span className="text-xs" style={{ color: 'var(--muted)' }}>
                  {client.contact_name}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={client.pipeline_status}
              onChange={(e) => handleStatusChange(e.target.value as PipelineStatus)}
              disabled={statusUpdating}
              className="input w-auto"
              style={{ fontSize: '12px', padding: '6px 10px' }}
            >
              {PIPELINE_COLUMNS.map(({ status, label }) => (
                <option key={status} value={status}>{label}</option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: 'var(--muted)' }}>Assigned:</span>
              <select
                value={assignedTo}
                onChange={(e) => handleReassign(e.target.value)}
                className="input w-auto"
                style={{ fontSize: '12px', padding: '6px 10px' }}
              >
                <option value="">Unassigned</option>
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>{m.full_name}</option>
                ))}
              </select>
              {client.assigned_member && <Avatar member={client.assigned_member} size={24} />}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 overflow-x-auto rounded-lg p-1" style={{ background: 'rgba(9,20,40,0.4)', border: '1px solid var(--border)' }}>
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className="whitespace-nowrap rounded-md px-4 py-2 text-xs font-semibold transition-all"
            style={{
              background: activeTab === key ? 'var(--gold-dim)' : 'transparent',
              color: activeTab === key ? 'var(--gold)' : 'var(--muted)',
              border: activeTab === key ? '1px solid var(--border-gold)' : '1px solid transparent',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'overview' && (
          <ClientOverviewTab client={client} currentMember={currentMember} standardReport={standardReport} deepdiveReport={deepdiveReport} />
        )}
        {activeTab === 'intake' && <ClientIntakeTab client={client} intake={intake} />}
        {activeTab === 'proposal' && <ClientProposalTab client={client} />}
        {activeTab === 'website' && <ClientWebsiteTab client={client} mockups={mockups} onMockupsChange={setMockups} />}
        {activeTab === 'activity' && <ClientActivityTab activityLog={activityLog} />}
      </div>
    </div>
  );
}
