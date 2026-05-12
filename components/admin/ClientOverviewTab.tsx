'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Client, TeamMember } from '@/types/dashboard';
import type { Report } from '@/types/report';

interface Props {
  client: Client;
  currentMember: TeamMember;
  standardReport: Report | null;
  deepdiveReport: Report | null;
}

export default function ClientOverviewTab({ client, currentMember, standardReport, deepdiveReport }: Props) {
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
      {/* Key Info — editable */}
      <div className="rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
          Key Info
        </h3>
        <dl className="space-y-3">
          <EditableField clientId={client.id} field="company_name" label="Company" initialValue={client.business_name} />
          <EditableField clientId={client.id} field="contact_name" label="Contact" initialValue={client.contact_name} />
          <EditableField clientId={client.id} field="contact_email" label="Email" initialValue={client.email} isLink />
          <EditableField clientId={client.id} field="contact_phone" label="Phone" initialValue={client.phone ?? ''} />
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

      {/* Report Links */}
      <div className="rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
          Standard Report
        </h3>
        {standardReport ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'var(--muted)' }}>Status</span>
              <span className="text-xs font-medium" style={{ color: standardReport.report_data ? 'var(--green)' : 'var(--gold)' }}>
                {standardReport.report_data ? '✓ Generated' : '⟳ Generating...'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'var(--muted)' }}>Unlocked</span>
              <span className="text-xs font-medium" style={{ color: standardReport.is_unlocked ? 'var(--green)' : 'var(--muted)' }}>
                {standardReport.is_unlocked ? '✓ Yes' : '✗ Locked'}
              </span>
            </div>
            {client.report_token && (
              <div className="space-y-2 pt-2">
                <a
                  href={`/report/${client.report_token}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full rounded-lg px-3 py-2 text-center text-xs font-semibold transition-colors"
                  style={{ background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid var(--border-gold)' }}
                >
                  View Teaser Report
                </a>
                <a
                  href={`/report/${client.report_token}/full?admin=true`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full rounded-lg px-3 py-2 text-center text-xs font-semibold transition-colors"
                  style={{ background: 'rgba(9,20,40,0.6)', color: 'var(--silver)', border: '1px solid var(--border)' }}
                >
                  Preview Full Report (Admin)
                </a>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs" style={{ color: 'var(--muted)' }}>No standard report generated yet.</p>
        )}
      </div>

      {/* Deep Dive */}
      <div className="rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
          Deep Dive Report
        </h3>
        {deepdiveReport ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'var(--muted)' }}>Status</span>
              <span className="text-xs font-medium" style={{ color: deepdiveReport.report_data ? 'var(--green)' : 'var(--gold)' }}>
                {deepdiveReport.report_data ? '✓ Generated' : '⟳ Generating...'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'var(--muted)' }}>Unlocked</span>
              <span className="text-xs font-medium" style={{ color: deepdiveReport.is_unlocked ? 'var(--green)' : 'var(--muted)' }}>
                {deepdiveReport.is_unlocked ? '✓ Yes' : '✗ Locked'}
              </span>
            </div>
            {client.report_token && (
              <a
                href={`/report/${client.report_token}/deepdive`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-lg px-3 py-2 text-center text-xs font-semibold transition-colors"
                style={{ background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid var(--border-gold)' }}
              >
                View Deep Dive Report
              </a>
            )}
          </div>
        ) : (
          <p className="text-xs" style={{ color: 'var(--muted)' }}>No deep dive report generated yet.</p>
        )}
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

function EditableField({
  clientId, field, label, initialValue, isLink,
}: {
  clientId: string; field: string; label: string; initialValue: string; isLink?: boolean;
}) {
  const [value, setValue] = useState(initialValue);
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  const save = useCallback(async (newVal: string) => {
    if (newVal === initialValue) { setEditing(false); return; }
    setStatus('saving');
    await fetch('/api/dashboard/update-client', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, fields: { [field]: newVal } }),
    });
    setStatus('saved');
    setEditing(false);
    setTimeout(() => setStatus('idle'), 2000);
  }, [clientId, field, initialValue]);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  if (editing) {
    return (
      <div className="flex items-start justify-between gap-4">
        <dt className="shrink-0 text-xs pt-1.5" style={{ color: 'var(--muted)' }}>{label}</dt>
        <dd className="flex-1 max-w-[200px]">
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => save(value)}
            onKeyDown={(e) => { if (e.key === 'Enter') save(value); if (e.key === 'Escape') { setValue(initialValue); setEditing(false); } }}
            className="w-full rounded px-2 py-1 text-right text-xs outline-none"
            style={{ background: 'var(--navy3)', border: '1px solid var(--border-gold)', color: 'var(--light)' }}
          />
        </dd>
      </div>
    );
  }

  return (
    <div
      className="flex items-start justify-between gap-4 group cursor-pointer rounded px-1 -mx-1 transition-colors hover:bg-white/5"
      onClick={() => setEditing(true)}
    >
      <dt className="shrink-0 text-xs" style={{ color: 'var(--muted)' }}>
        {label}
        {status === 'saved' && <span className="ml-1 text-[10px]" style={{ color: 'var(--green)' }}>✓</span>}
      </dt>
      <dd className="text-right text-xs font-medium" style={{ color: 'var(--light)', wordBreak: 'break-all' }}>
        {isLink && value && value !== '—' ? (
          <span onClick={(e) => e.stopPropagation()}>
            <a href={value.startsWith('http') ? value : `mailto:${value}`} target="_blank" rel="noopener"
              className="hover:underline" style={{ color: 'var(--gold)' }}>
              {value || '—'}
            </a>
          </span>
        ) : (value || '—')}
        <span className="ml-2 text-[10px] opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: 'var(--muted)' }}>✎</span>
      </dd>
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
