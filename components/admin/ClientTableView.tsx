'use client';

import Link from 'next/link';
import type { Client, PipelineStatus } from '@/types/dashboard';
import { PIPELINE_COLUMNS } from '@/types/dashboard';
import { Avatar } from '@/components/admin/DashboardShell';

function StatusBadge({ status }: { status: PipelineStatus }) {
  const col = PIPELINE_COLUMNS.find((c) => c.status === status);
  return (
    <span
      className="badge"
      style={{
        background: `${col?.color ?? 'var(--muted)'}20`,
        color: col?.color ?? 'var(--muted)',
        border: `1px solid ${col?.color ?? 'var(--border)'}40`,
      }}
    >
      {col?.label ?? status}
    </span>
  );
}

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

interface Props {
  clients: Client[];
}

export default function ClientTableView({ clients }: Props) {
  if (clients.length === 0) {
    return (
      <div className="py-16 text-center" style={{ color: 'var(--muted)' }}>
        No clients found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border)' }}>
      <table className="w-full text-left text-sm">
        <thead>
          <tr style={{ background: 'rgba(9,20,40,0.6)', borderBottom: '1px solid var(--border)' }}>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Company</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Status</th>
            <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide md:table-cell" style={{ color: 'var(--muted)' }}>Assigned</th>
            <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide md:table-cell" style={{ color: 'var(--muted)' }}>Added</th>
            <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide lg:table-cell" style={{ color: 'var(--muted)' }}>Contact</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr
              key={client.id}
              className="transition-colors duration-100"
              style={{ borderBottom: '1px solid var(--border)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(212,168,67,0.04)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <td className="px-4 py-3">
                <Link href={`/dashboard/clients/${client.id}`} className="group">
                  <div className="font-medium transition-colors group-hover:underline" style={{ color: 'var(--light)' }}>
                    {client.business_name}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>{client.contact_name}</div>
                  {client.report_summary && (
                    <div className="mt-1 max-w-md truncate text-[11px]" style={{ color: 'var(--muted)' }}>
                      {client.report_summary}
                    </div>
                  )}
                </Link>
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={client.pipeline_status} />
              </td>
              <td className="hidden px-4 py-3 md:table-cell">
                {client.assigned_member ? (
                  <div className="flex items-center gap-2">
                    <Avatar member={client.assigned_member} size={22} />
                    <span className="text-xs" style={{ color: 'var(--silver)' }}>
                      {client.assigned_member.full_name}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>—</span>
                )}
              </td>
              <td className="hidden px-4 py-3 text-xs md:table-cell" style={{ color: 'var(--silver)' }}>
                <div>{new Date(client.created_at).toLocaleDateString()}</div>
                <div style={{ color: 'var(--muted)' }}>{daysSince(client.status_changed_at)}d in status</div>
              </td>
              <td className="hidden px-4 py-3 text-xs lg:table-cell" style={{ color: 'var(--muted)' }}>
                {client.email}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { StatusBadge };
