'use client';

import type { Client } from '@/types/dashboard';

interface Props {
  client: Client;
}

export default function ClientIntakeTab({ client }: Props) {
  const fields: { label: string; value: string | null | undefined }[] = [
    { label: 'Business Name', value: client.business_name },
    { label: 'Contact Name', value: client.contact_name },
    { label: 'Email', value: client.email },
    { label: 'Phone', value: client.phone },
    { label: 'Website URL', value: client.website_url },
    { label: 'Industry', value: client.industry },
    { label: 'Source', value: client.source },
    { label: 'Primary Competitor', value: client.competitor_name || client.competitor_url },
    { label: 'Report Token', value: client.report_token },
    { label: 'Created At', value: new Date(client.created_at).toLocaleString() },
  ];

  return (
    <div className="rounded-xl p-4 md:p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
        Intake Submission Data
      </h3>

      <div className="space-y-0">
        {fields.map(({ label, value }) => (
          <div
            key={label}
            className="flex items-center justify-between gap-4 py-2.5"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <span className="text-xs font-medium" style={{ color: 'var(--silver)' }}>{label}</span>
            <span className="text-right text-xs" style={{ color: 'var(--light)', wordBreak: 'break-all' }}>
              {value || '—'}
            </span>
          </div>
        ))}
      </div>

      {/* Competitors list */}
      {client.competitors && client.competitors.length > 0 && (
        <div className="mt-5">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
            Competitors ({client.competitors.length})
          </h4>
          <div className="space-y-2">
            {client.competitors.map((comp, i) => (
              <div key={comp.id} className="flex items-center justify-between rounded-lg p-3"
                style={{ background: 'var(--navy3)', border: '1px solid var(--border)' }}>
                <div>
                  <span className="text-xs font-medium" style={{ color: 'var(--light)' }}>
                    {i + 1}. {comp.name}
                  </span>
                  <div className="text-[11px]" style={{ color: 'var(--muted)' }}>{comp.url}</div>
                </div>
                <span className="badge badge-muted text-[10px]">
                  {comp.source === 'auto' ? 'Auto-found' : 'Manual'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
