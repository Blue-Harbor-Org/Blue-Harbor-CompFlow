'use client';

import Link from 'next/link';
import type { Client } from '@/types/dashboard';
import { PIPELINE_COLUMNS } from '@/types/dashboard';
import { Avatar } from '@/components/admin/DashboardShell';

function daysSince(dateStr: string): number {
  const then = new Date(dateStr).getTime();
  const now = Date.now();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

function formatDays(days: number): string {
  if (days === 0) return 'Today';
  if (days === 1) return '1 day';
  return `${days} days`;
}

function statusLabel(status: Client['pipeline_status']) {
  return PIPELINE_COLUMNS.find((c) => c.status === status)?.label ?? status;
}

function statusColor(status: Client['pipeline_status']) {
  return PIPELINE_COLUMNS.find((c) => c.status === status)?.color ?? 'var(--muted)';
}

interface ClientCardProps {
  client: Client;
  compact?: boolean;
}

export default function ClientCard({ client, compact }: ClientCardProps) {
  const daysInStatus = daysSince(client.status_changed_at);
  const color = statusColor(client.pipeline_status);

  return (
    <Link
      href={`/dashboard/clients/${client.id}`}
      className="block rounded-lg p-3 transition-all duration-150"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-gold)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold" style={{ color: 'var(--light)' }}>
            {client.business_name}
          </div>
          {!compact && (
            <div className="mt-0.5 truncate text-xs" style={{ color: 'var(--muted)' }}>
              {client.contact_name}
            </div>
          )}
        </div>
        {client.assigned_member && (
          <Avatar member={client.assigned_member} size={24} />
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
          style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
        >
          {statusLabel(client.pipeline_status)}
        </span>
        <span className="text-[11px] font-medium" style={{ color: 'var(--muted)' }}>
          Added {new Date(client.created_at).toLocaleDateString()}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <span className="text-[11px] font-medium" style={{ color: 'var(--muted)' }}>
          {formatDays(daysInStatus)} in status
        </span>
        <span className="truncate text-[11px]" style={{ color: 'var(--silver)' }}>
          {client.assigned_member ? client.assigned_member.full_name : 'Unassigned'}
        </span>
        {client.industry && client.industry !== 'general' && (
          <span className="truncate text-[11px]" style={{ color: 'var(--silver)' }}>
            {client.industry}
          </span>
        )}
      </div>
      {client.report_summary && (
        <p className="line-clamp-2 text-[11px] leading-5" style={{ color: 'var(--muted)' }}>
          {client.report_summary}
        </p>
      )}
    </Link>
  );
}
