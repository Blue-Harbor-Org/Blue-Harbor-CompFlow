'use client';

import { useState, useEffect, useRef } from 'react';
import type { Client, TeamMember } from '@/types/dashboard';

interface Props {
  client: Client;
  currentMember: TeamMember;
}

export default function ClientOverviewTab({ client, currentMember }: Props) {
  const [notes, setNotes] = useState(client.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (notes === (client.notes ?? '')) return;
      setSaving(true);
      await fetch('/api/dashboard/update-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: client.id, notes, memberId: currentMember.id }),
      });
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [notes, client.id, client.notes, currentMember.id]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Key stats */}
      <div className="rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
          Key Info
        </h3>
        <dl className="space-y-3">
          <InfoRow label="Company" value={client.business_name} />
          <InfoRow label="Contact" value={client.contact_name} />
          <InfoRow label="Email" value={client.email} isLink />
          <InfoRow label="Phone" value={client.phone ?? '—'} />
          <InfoRow label="Website" value={client.website_url} isLink />
          <InfoRow label="Industry" value={client.industry || 'General'} />
          <InfoRow label="Source" value={client.source} />
          <InfoRow label="Created" value={new Date(client.created_at).toLocaleDateString()} />
        </dl>
      </div>

      {/* Notes */}
      <div className="rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
            Team Notes
          </h3>
          <span className="text-[10px] font-medium" style={{ color: saving ? 'var(--gold)' : saved ? 'var(--green)' : 'transparent' }}>
            {saving ? 'Saving...' : saved ? 'Saved' : '·'}
          </span>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes visible to the team..."
          rows={8}
          className="input resize-y"
          style={{ fontSize: '13px', lineHeight: '1.6' }}
        />
      </div>

      {/* Competitors */}
      {client.competitors && client.competitors.length > 0 && (
        <div className="rounded-xl p-4 lg:col-span-2" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
            Competitors
          </h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {client.competitors.map((comp) => (
              <div key={comp.id} className="rounded-lg p-3" style={{ background: 'var(--navy3)', border: '1px solid var(--border)' }}>
                <div className="text-sm font-medium" style={{ color: 'var(--light)' }}>{comp.name}</div>
                <a href={comp.url} target="_blank" rel="noopener" className="text-xs hover:underline" style={{ color: 'var(--gold)' }}>
                  {comp.url}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, isLink }: { label: string; value: string; isLink?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-xs" style={{ color: 'var(--muted)' }}>{label}</dt>
      <dd className="text-right text-xs font-medium" style={{ color: 'var(--light)', wordBreak: 'break-all' }}>
        {isLink && value !== '—' ? (
          <a href={value.startsWith('http') ? value : `mailto:${value}`} target="_blank" rel="noopener"
            className="hover:underline" style={{ color: 'var(--gold)' }}>
            {value}
          </a>
        ) : value}
      </dd>
    </div>
  );
}
