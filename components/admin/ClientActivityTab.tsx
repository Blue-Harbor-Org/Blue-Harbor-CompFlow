'use client';

import type { ActivityLogEntry } from '@/types/dashboard';
import { Avatar } from '@/components/admin/DashboardShell';

interface Props {
  activityLog: ActivityLogEntry[];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
}

function typeIcon(type: ActivityLogEntry['type']): string {
  switch (type) {
    case 'status_change': return '→';
    case 'note': return '✎';
    case 'assignment': return '⊕';
    case 'proposal': return '◎';
    default: return '·';
  }
}

function typeColor(type: ActivityLogEntry['type']): string {
  switch (type) {
    case 'status_change': return 'var(--gold)';
    case 'note': return 'var(--silver)';
    case 'assignment': return '#6ba3ff';
    case 'proposal': return 'var(--green)';
    default: return 'var(--muted)';
  }
}

export default function ClientActivityTab({ activityLog }: Props) {
  if (activityLog.length === 0) {
    return (
      <div className="rounded-xl p-8 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>No activity yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-4 md:p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
        Activity Log
      </h3>

      <div className="relative space-y-0">
        {/* Vertical line */}
        <div
          className="absolute left-[15px] top-2 h-[calc(100%-16px)] w-px"
          style={{ background: 'var(--border)' }}
        />

        {activityLog.map((entry) => (
          <div key={entry.id} className="relative flex gap-3 py-3">
            {/* Icon */}
            <div
              className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
              style={{
                background: `${typeColor(entry.type)}15`,
                border: `1px solid ${typeColor(entry.type)}40`,
                color: typeColor(entry.type),
              }}
            >
              {typeIcon(entry.type)}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1 pt-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs" style={{ color: 'var(--light)' }}>
                  {entry.description}
                </p>
                <span className="shrink-0 text-[10px]" style={{ color: 'var(--muted)' }}>
                  {formatDate(entry.created_at)}
                </span>
              </div>
              {entry.team_member && (
                <div className="mt-1 flex items-center gap-1.5">
                  <Avatar member={entry.team_member} size={16} />
                  <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
                    {entry.team_member.full_name}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
