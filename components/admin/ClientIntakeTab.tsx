'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Client } from '@/types/dashboard';
import type { ClientIntakeRecord } from '@/types/client-intake';
import { getPublicSiteUrl } from '@/lib/siteUrl';

interface Props {
  client: Client;
  intake: ClientIntakeRecord | null;
}

export default function ClientIntakeTab({ client, intake }: Props) {
  const workingIntake = intake ?? createEmptyIntake(client.id);
  const submissionId = intake?.source === 'bh' ? intake.id : undefined;

  const intakeUrl =
    client.intake_token != null && client.intake_token !== ''
      ? `${getPublicSiteUrl()}/intake/${client.id}?token=${client.intake_token}`
      : null;
  const [copied, setCopied] = useState(false);

  return (
    <div className="space-y-4">
      {intakeUrl && (
        <div
          className="flex flex-col gap-3 rounded-xl p-4 sm:flex-row sm:items-center sm:justify-between"
          style={{ background: 'var(--navy3)', border: '1px solid var(--border)' }}
        >
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Client intake link
            </div>
            <div className="mt-1 truncate font-mono text-[11px]" style={{ color: 'var(--silver)' }} title={intakeUrl}>
              {intakeUrl}
            </div>
          </div>
          <button
            type="button"
            className="min-h-[44px] shrink-0 rounded-lg px-4 text-xs font-semibold"
            style={{ background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid var(--border-gold)' }}
            onClick={() => {
              void navigator.clipboard.writeText(intakeUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? 'Copied' : 'Copy link'}
          </button>
        </div>
      )}

      {!intake ? (
        <Banner
          title="No intake row yet"
          message="You can start filling this out here. The first save will create a new bh_intake_submissions row for the client."
        />
      ) : intake.source === 'legacy' ? (
        <Banner
          title="Legacy intake detected"
          message="These values came from the older intake table. Saving any field here will write the updated data into the new bh_intake_submissions table."
        />
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold"
            style={{
              background: workingIntake.completed ? 'rgba(46,204,138,0.1)' : 'rgba(212,168,67,0.1)',
              color: workingIntake.completed ? 'var(--green)' : 'var(--gold)',
              border: `1px solid ${workingIntake.completed ? 'rgba(46,204,138,0.3)' : 'rgba(212,168,67,0.3)'}`,
            }}
          >
            {workingIntake.completed ? 'Completed' : 'Draft'}
          </span>
          <span className="text-[11px]" style={{ color: 'var(--muted)' }}>
            Last updated {new Date(workingIntake.submitted_at).toLocaleDateString()}
          </span>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <IntakeSection title="Company Overview">
          <IntakeField clientId={client.id} submissionId={submissionId} field="total_volume" label="Total Loan Volume ($)" value={workingIntake.total_volume} type="number" />
          <IntakeField clientId={client.id} submissionId={submissionId} field="years_in_business" label="Years in Business" value={workingIntake.years_in_business} type="number" />
          <IntakeField clientId={client.id} submissionId={submissionId} field="deals_closed" label="Total Deals Closed" value={workingIntake.deals_closed} type="number" />
        </IntakeSection>

        <IntakeSection title="Contact & Office">
          <IntakeField clientId={client.id} submissionId={submissionId} field="office_phone" label="Office Phone" value={workingIntake.office_phone} />
          <IntakeField clientId={client.id} submissionId={submissionId} field="contact_email" label="Contact Email" value={workingIntake.contact_email} />
          <IntakeField clientId={client.id} submissionId={submissionId} field="address" label="Physical Address" value={workingIntake.address} />
          <IntakeField clientId={client.id} submissionId={submissionId} field="john_cell" label="John Cell" value={workingIntake.john_cell} />
          <IntakeField clientId={client.id} submissionId={submissionId} field="craig_cell" label="Craig Cell" value={workingIntake.craig_cell} />
        </IntakeSection>

        <IntakeSection title="Loan Programs">
          <IntakeField clientId={client.id} submissionId={submissionId} field="loan_min" label="Loan Min ($)" value={workingIntake.loan_min} type="number" />
          <IntakeField clientId={client.id} submissionId={submissionId} field="loan_max" label="Loan Max ($)" value={workingIntake.loan_max} type="number" />
          <IntakeField clientId={client.id} submissionId={submissionId} field="geo_focus" label="Geographic Focus" value={workingIntake.geo_focus} />
        </IntakeSection>

        <IntakeSection title="Brand Assets">
          <IntakeField clientId={client.id} submissionId={submissionId} field="existing_copy" label="Awards / Press" value={workingIntake.existing_copy} multiline />
          <IntakeField clientId={client.id} submissionId={submissionId} field="testimonials" label="Testimonials" value={workingIntake.testimonials} multiline />
        </IntakeSection>

        {workingIntake.deal_examples.length > 0 && (
          <div className="rounded-xl p-4 lg:col-span-2" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Deal Examples ({workingIntake.deal_examples.length})
            </h3>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {workingIntake.deal_examples.map((deal, index) => {
                const details = deal as Record<string, unknown>;
                return (
                  <div key={index} className="rounded-lg p-3" style={{ background: 'var(--navy3)', border: '1px solid var(--border)' }}>
                    <div className="text-xs font-medium" style={{ color: 'var(--light)' }}>
                      {(details.property_type as string) || 'Deal'} - {(details.location as string) || 'N/A'}
                    </div>
                    {details.loan_amount != null && (
                      <div className="mt-1 text-[11px]" style={{ color: 'var(--muted)' }}>
                        ${Number(details.loan_amount).toLocaleString()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {workingIntake.team_bios.length > 0 && (
          <div className="rounded-xl p-4 lg:col-span-2" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Team Bios ({workingIntake.team_bios.length})
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {workingIntake.team_bios.map((bio, index) => {
                const details = bio as Record<string, unknown>;
                return (
                  <div key={index} className="rounded-lg p-3" style={{ background: 'var(--navy3)', border: '1px solid var(--border)' }}>
                    <div className="text-xs font-semibold" style={{ color: 'var(--light)' }}>
                      {details.name as string}
                    </div>
                    <div className="text-[11px]" style={{ color: 'var(--gold)' }}>
                      {details.title as string}
                    </div>
                    {details.bio ? (
                      <div className="mt-1 text-[11px]" style={{ color: 'var(--muted)' }}>
                        {details.bio as string}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Banner({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.22)' }}>
      <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--gold)' }}>
        {title}
      </div>
      <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>
        {message}
      </p>
    </div>
  );
}

function IntakeSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function IntakeField({
  clientId, submissionId, field, label, value, type = 'text', multiline,
}: {
  clientId: string;
  submissionId?: string;
  field: string;
  label: string;
  value: string | number | null;
  type?: 'text' | 'number';
  multiline?: boolean;
}) {
  const router = useRouter();
  const displayVal = value != null ? String(value) : '';
  const [draft, setDraft] = useState({
    source: displayVal,
    value: displayVal,
  });
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const localVal = draft.source === displayVal ? draft.value : displayVal;
  const setLocalVal = useCallback((nextValue: string) => {
    setDraft({ source: displayVal, value: nextValue });
  }, [displayVal]);

  const save = useCallback(async () => {
    if (localVal === displayVal) {
      setEditing(false);
      return;
    }

    setStatus('saving');
    setError('');

    const parsed = type === 'number' && localVal ? Number(localVal) : localVal;
    const res = await fetch('/api/dashboard/update-intake', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, submissionId, fields: { [field]: parsed } }),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({ error: 'Failed to save intake field' })) as { error?: string };
      setError(json.error ?? 'Failed to save intake field');
      setStatus('idle');
      return;
    }

    setStatus('saved');
    setEditing(false);
    router.refresh();
    setTimeout(() => setStatus('idle'), 2000);
  }, [clientId, submissionId, field, localVal, displayVal, type, router]);

  if (editing) {
    const sharedStyle = { background: 'var(--navy3)', border: '1px solid var(--border-gold)', color: 'var(--light)' };
    return (
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-4">
          <span className="shrink-0 pt-1.5 text-xs" style={{ color: 'var(--muted)' }}>{label}</span>
          {multiline ? (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={localVal}
              onChange={(event) => setLocalVal(event.target.value)}
              onBlur={save}
              rows={3}
              className="max-w-[220px] flex-1 resize-y rounded px-2 py-1 text-right text-xs outline-none"
              style={sharedStyle}
              autoFocus
            />
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type={type}
              value={localVal}
              onChange={(event) => setLocalVal(event.target.value)}
              onBlur={save}
              onKeyDown={(event) => {
                if (event.key === 'Enter') save();
                if (event.key === 'Escape') {
                  setLocalVal(displayVal);
                  setEditing(false);
                }
              }}
              className="max-w-[220px] flex-1 rounded px-2 py-1 text-right text-xs outline-none"
              style={sharedStyle}
              autoFocus
            />
          )}
        </div>
        {error && (
          <div className="text-right text-[11px]" style={{ color: '#f87171' }}>
            {error}
          </div>
        )}
      </div>
    );
  }

  const formatted = type === 'number' && value != null ? Number(value).toLocaleString() : (displayVal || '-');

  return (
    <div
      className="group -mx-1 flex cursor-pointer items-start justify-between gap-4 rounded px-1 transition-colors hover:bg-white/5"
      onClick={() => setEditing(true)}
    >
      <span className="shrink-0 text-xs" style={{ color: 'var(--muted)' }}>
        {label}
        {status === 'saved' && (
          <span className="ml-1 text-[10px]" style={{ color: 'var(--green)' }}>
            ✓
          </span>
        )}
      </span>
      <span className="text-right text-xs font-medium" style={{ color: 'var(--light)', wordBreak: 'break-all' }}>
        {multiline && displayVal.length > 60 ? `${displayVal.slice(0, 60)}...` : formatted}
        <span className="ml-2 text-[10px] opacity-0 transition-opacity group-hover:opacity-60" style={{ color: 'var(--muted)' }}>
          ✎
        </span>
      </span>
    </div>
  );
}

function createEmptyIntake(clientId: string): ClientIntakeRecord {
  return {
    id: `draft-${clientId}`,
    client_id: clientId,
    submitted_at: new Date().toISOString(),
    completed: false,
    total_volume: null,
    years_in_business: null,
    deals_closed: null,
    deal_examples: [],
    office_phone: null,
    contact_email: null,
    address: null,
    john_cell: null,
    craig_cell: null,
    loan_min: null,
    loan_max: null,
    geo_focus: null,
    testimonials: null,
    team_bios: [],
    existing_copy: null,
    source: 'bh',
  };
}
