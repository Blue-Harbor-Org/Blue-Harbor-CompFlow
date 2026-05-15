'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Client, TeamMember, ActivityLogEntry } from '@/types/dashboard';
import type { Report } from '@/types/report';
import GenerateReportButton from '@/components/admin/GenerateReportButton';
import UnlockButton from '@/components/admin/UnlockButton';
import DeepDivePanel from '@/components/admin/DeepDivePanel';

interface Props {
  client: Client;
  currentMember: TeamMember;
  standardReport: Report | null;
  deepdiveReport: Report | null;
  recentActivity?: ActivityLogEntry[];
  mockupCount?: number;
  onOpenWebsiteTab?: () => void;
}

export default function ClientOverviewTab({
  client,
  currentMember,
  standardReport,
  deepdiveReport,
  recentActivity = [],
  mockupCount = 0,
  onOpenWebsiteTab,
}: Props) {
  const router = useRouter();
  const initialNotes = client.notes ?? '';
  const [notesDraft, setNotesDraft] = useState({
    clientId: client.id,
    initial: initialNotes,
    value: initialNotes,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mockupGenerating, setMockupGenerating] = useState(false);
  const [mockupSaved, setMockupSaved] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const notes =
    notesDraft.clientId === client.id && notesDraft.initial === initialNotes
      ? notesDraft.value
      : initialNotes;

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (notes === initialNotes) return;
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

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [notes, client.id, initialNotes, currentMember.id]);

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const canRunReportActions = Boolean(client.lead_id);
  const showStandardGenerate = canRunReportActions && !standardReport;
  const showStandardUnlock = canRunReportActions && Boolean(standardReport) && !standardReport?.is_unlocked;
  const showDeepDive = canRunReportActions && Boolean(client.report_token);

  const regenerateMockup = useCallback(async () => {
    setMockupGenerating(true);
    setMockupSaved(false);
    const res = await fetch('/api/dashboard/generate-mockup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: client.id,
        pageSlug: 'home',
        industry: client.industry,
        competitorUrl: client.competitor_url ?? undefined,
      }),
    });
    setMockupGenerating(false);
    if (res.ok) {
      setMockupSaved(true);
      router.refresh();
      setTimeout(() => setMockupSaved(false), 2000);
    }
  }, [client.competitor_url, client.id, client.industry, router]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Key Info">
        <dl className="space-y-3">
          <EditableField clientId={client.id} field="company_name" label="Company" initialValue={client.business_name} />
          <EditableField clientId={client.id} field="contact_name" label="Contact" initialValue={client.contact_name} />
          <EditableField clientId={client.id} field="contact_email" label="Email" initialValue={client.email} isLink />
          <EditableField clientId={client.id} field="contact_phone" label="Phone" initialValue={client.phone ?? ''} />
          <InfoRow label="Website" value={client.website_url || '-'} isLink />
          <InfoRow label="Industry" value={client.industry || 'General'} />
          <InfoRow label="Source" value={client.source} />
          <InfoRow label="Created" value={new Date(client.created_at).toLocaleDateString()} />
        </dl>
      </Card>

      <Card title="Team Notes" actionLabel={saving ? 'Saving...' : saved ? 'Saved' : ''} actionColor={saving ? 'var(--gold)' : saved ? 'var(--green)' : 'transparent'}>
        <textarea
          value={notes}
          onChange={(event) =>
            setNotesDraft({ clientId: client.id, initial: initialNotes, value: event.target.value })
          }
          placeholder="Add notes visible to the team..."
          rows={8}
          className="input resize-y"
          style={{ fontSize: '13px', lineHeight: '1.6' }}
        />
      </Card>

      <Card title="Standard Report">
        {standardReport ? (
          <div className="space-y-3">
            <StatusRow
              label="Status"
              value={standardReport.report_data ? 'Generated' : 'Generating...'}
              color={standardReport.report_data ? 'var(--green)' : 'var(--gold)'}
            />
            <StatusRow
              label="Unlocked"
              value={standardReport.is_unlocked ? 'Yes' : 'Locked'}
              color={standardReport.is_unlocked ? 'var(--green)' : 'var(--muted)'}
            />

            {client.report_token && (
              <div className="space-y-2 pt-2">
                <LinkButton href={`/report/${client.report_token}`} label="View Teaser Report" primary />
                <LinkButton href={`/report/${client.report_token}/full?admin=true`} label="Preview Full Report (Admin)" />
              </div>
            )}

            {showStandardUnlock && client.lead_id && (
              <div className="pt-2">
                <UnlockButton
                  leadId={client.lead_id}
                  email={client.email}
                  businessName={client.business_name}
                  onSuccess={refresh}
                />
              </div>
            )}
          </div>
        ) : showStandardGenerate && client.lead_id ? (
          <div className="space-y-3">
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              No competitive report yet.
            </p>
            <GenerateReportButton leadId={client.lead_id} onDone={refresh} />
          </div>
        ) : (
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            No competitive report yet — link a lead to generate a report.
          </p>
        )}
      </Card>

      <Card title="Deep Dive Report">
        {deepdiveReport ? (
          <div className="space-y-3">
            <StatusRow
              label="Status"
              value={deepdiveReport.report_data ? 'Generated' : 'Generating...'}
              color={deepdiveReport.report_data ? 'var(--green)' : 'var(--gold)'}
            />
            <StatusRow
              label="Unlocked"
              value={deepdiveReport.is_unlocked ? 'Yes' : 'Locked'}
              color={deepdiveReport.is_unlocked ? 'var(--green)' : 'var(--muted)'}
            />
            {client.report_token && (
              <LinkButton href={`/report/${client.report_token}/deepdive`} label="View Deep Dive Report" primary />
            )}
          </div>
        ) : (
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            No deep dive report yet.
          </p>
        )}
      </Card>

      <Card
        title="Website Mockup"
        actionLabel={mockupGenerating ? 'Generating...' : mockupSaved ? 'Saved' : ''}
        actionColor={mockupGenerating ? 'var(--gold)' : mockupSaved ? 'var(--green)' : 'transparent'}
      >
        <div className="space-y-3">
          {mockupCount === 0 && (
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              No mockup yet.
            </p>
          )}
          {mockupCount === 0 && onOpenWebsiteTab && (
            <button
              type="button"
              onClick={onOpenWebsiteTab}
              className="w-full rounded-lg px-3 py-2 text-xs font-semibold min-h-[44px]"
              style={{ background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid var(--border-gold)' }}
            >
              Create mockup →
            </button>
          )}
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            Generate or refresh the homepage mockup with the uniqueness-first design engine.
          </p>
          {mockupCount > 0 && (
            <button
              type="button"
              onClick={() => void regenerateMockup()}
              disabled={mockupGenerating}
              className="w-full rounded-lg px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-50"
              style={{ background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid var(--border-gold)' }}
            >
              {mockupGenerating ? 'Generating mockup...' : 'Regenerate mockup'}
            </button>
          )}
        </div>
      </Card>

      {showDeepDive && client.lead_id && (
        <div className="lg:col-span-2">
          <DeepDivePanel
            leadId={client.lead_id}
            reportToken={client.report_token}
            deepdiveStatus={client.deepdive_status ?? null}
            deepdiveViewedAt={client.deepdive_viewed_at ?? null}
            deepReport={deepdiveReport}
            onAfterMutation={refresh}
          />
        </div>
      )}

      {client.competitors && client.competitors.length > 0 && (
        <Card title="Competitors" className="lg:col-span-2">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {client.competitors.map((competitor) => (
              <div key={competitor.id} className="rounded-lg p-3" style={{ background: 'var(--navy3)', border: '1px solid var(--border)' }}>
                <div className="text-sm font-medium" style={{ color: 'var(--light)' }}>{competitor.name}</div>
                <a href={competitor.url} target="_blank" rel="noopener" className="text-xs hover:underline" style={{ color: 'var(--gold)' }}>
                  {competitor.url}
                </a>
              </div>
            ))}
          </div>
        </Card>
      )}

      {recentActivity.length > 0 && (
        <Card title="Recent activity" className="lg:col-span-2">
          <ul className="space-y-2">
            {recentActivity.map((entry) => (
              <li key={entry.id} className="flex items-start justify-between gap-3 text-xs" style={{ color: 'var(--silver)' }}>
                <span className="min-w-0 flex-1">{entry.description}</span>
                <span className="shrink-0 text-[10px]" style={{ color: 'var(--muted)' }}>
                  {new Date(entry.created_at).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function Card({
  title,
  children,
  className = '',
  actionLabel,
  actionColor,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  actionLabel?: string;
  actionColor?: string;
}) {
  return (
    <div className={`rounded-xl p-4 ${className}`.trim()} style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
          {title}
        </h3>
        {actionLabel ? (
          <span className="text-[10px] font-medium" style={{ color: actionColor ?? 'var(--muted)' }}>
            {actionLabel}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function StatusRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs" style={{ color: 'var(--muted)' }}>{label}</span>
      <span className="text-xs font-medium" style={{ color }}>{value}</span>
    </div>
  );
}

function LinkButton({ href, label, primary = false }: { href: string; label: string; primary?: boolean }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full rounded-lg px-3 py-2 text-center text-xs font-semibold transition-colors"
      style={{
        background: primary ? 'var(--gold-dim)' : 'rgba(9,20,40,0.6)',
        color: primary ? 'var(--gold)' : 'var(--silver)',
        border: primary ? '1px solid var(--border-gold)' : '1px solid var(--border)',
      }}
    >
      {label}
    </a>
  );
}

function EditableField({
  clientId,
  field,
  label,
  initialValue,
  isLink,
}: {
  clientId: string;
  field: string;
  label: string;
  initialValue: string;
  isLink?: boolean;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState({
    initialValue,
    value: initialValue,
  });
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const value = draft.initialValue === initialValue ? draft.value : initialValue;
  const setValue = useCallback((nextValue: string) => {
    setDraft({ initialValue, value: nextValue });
  }, [initialValue]);

  const save = useCallback(async (nextValue: string) => {
    if (nextValue === initialValue) {
      setEditing(false);
      return;
    }

    setStatus('saving');
    setError('');

    const res = await fetch('/api/dashboard/update-client', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, fields: { [field]: nextValue } }),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({ error: 'Failed to save field' })) as { error?: string };
      setError(json.error ?? 'Failed to save field');
      setStatus('idle');
      return;
    }

    setStatus('saved');
    setEditing(false);
    router.refresh();
    setTimeout(() => setStatus('idle'), 2000);
  }, [clientId, field, initialValue, router]);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  if (editing) {
    return (
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-4">
          <dt className="shrink-0 pt-1.5 text-xs" style={{ color: 'var(--muted)' }}>{label}</dt>
          <dd className="max-w-[200px] flex-1">
            <input
              ref={inputRef}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onBlur={() => save(value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') save(value);
                if (event.key === 'Escape') {
                  setValue(initialValue);
                  setEditing(false);
                }
              }}
              className="w-full rounded px-2 py-1 text-right text-xs outline-none"
              style={{ background: 'var(--navy3)', border: '1px solid var(--border-gold)', color: 'var(--light)' }}
            />
          </dd>
        </div>
        {error && (
          <div className="text-right text-[11px]" style={{ color: '#f87171' }}>
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="group -mx-1 flex cursor-pointer items-start justify-between gap-4 rounded px-1 transition-colors hover:bg-white/5"
      onClick={() => setEditing(true)}
    >
      <dt className="shrink-0 text-xs" style={{ color: 'var(--muted)' }}>
        {label}
        {status === 'saved' && (
          <span className="ml-1 text-[10px]" style={{ color: 'var(--green)' }}>
            ✓
          </span>
        )}
      </dt>
      <dd className="text-right text-xs font-medium" style={{ color: 'var(--light)', wordBreak: 'break-all' }}>
        {isLink && value && value !== '-' ? (
          <span onClick={(event) => event.stopPropagation()}>
            <a
              href={value.startsWith('http') ? value : `mailto:${value}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              style={{ color: 'var(--gold)' }}
            >
              {value || '-'}
            </a>
          </span>
        ) : (
          value || '-'
        )}
        <span className="ml-2 text-[10px] opacity-0 transition-opacity group-hover:opacity-60" style={{ color: 'var(--muted)' }}>
          ✎
        </span>
      </dd>
    </div>
  );
}

function InfoRow({ label, value, isLink }: { label: string; value: string; isLink?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-xs" style={{ color: 'var(--muted)' }}>{label}</dt>
      <dd className="text-right text-xs font-medium" style={{ color: 'var(--light)', wordBreak: 'break-all' }}>
        {isLink && value !== '-' ? (
          <a
            href={value.startsWith('http') ? value : `mailto:${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            style={{ color: 'var(--gold)' }}
          >
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
