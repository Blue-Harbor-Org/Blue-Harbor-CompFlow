'use client';

import { useState, useRef, useCallback } from 'react';
import type { Client } from '@/types/dashboard';

export interface IntakeData {
  id: string;
  client_id: string;
  submitted_at: string;
  completed: boolean;
  total_volume: number | null;
  years_in_business: number | null;
  deals_closed: number | null;
  deal_examples: unknown[];
  office_phone: string | null;
  contact_email: string | null;
  address: string | null;
  john_cell: string | null;
  craig_cell: string | null;
  loan_min: number | null;
  loan_max: number | null;
  geo_focus: string | null;
  testimonials: string | null;
  team_bios: unknown[];
  existing_copy: string | null;
}

interface Props {
  client: Client;
  intake: IntakeData | null;
}

export default function ClientIntakeTab({ client, intake }: Props) {
  if (!intake) {
    return (
      <div className="rounded-xl p-6 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: 'var(--gold-dim)' }}>
          <span className="text-xl">📋</span>
        </div>
        <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--light)' }}>No Intake Data Yet</h3>
        <p className="text-xs" style={{ color: 'var(--muted)' }}>
          The client hasn&apos;t submitted their intake form. Send them the intake link to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Completion badge */}
      <div className="flex items-center gap-2">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold"
          style={{
            background: intake.completed ? 'rgba(46,204,138,0.1)' : 'rgba(212,168,67,0.1)',
            color: intake.completed ? 'var(--green)' : 'var(--gold)',
            border: `1px solid ${intake.completed ? 'rgba(46,204,138,0.3)' : 'rgba(212,168,67,0.3)'}`,
          }}
        >
          {intake.completed ? '✓ Completed' : '⟳ Draft'}
        </span>
        <span className="text-[11px]" style={{ color: 'var(--muted)' }}>
          Submitted {new Date(intake.submitted_at).toLocaleDateString()}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Company Overview */}
        <IntakeSection title="Company Overview">
          <IntakeField clientId={client.id} submissionId={intake.id} field="total_volume" label="Total Loan Volume ($)" value={intake.total_volume} type="number" />
          <IntakeField clientId={client.id} submissionId={intake.id} field="years_in_business" label="Years in Business" value={intake.years_in_business} type="number" />
          <IntakeField clientId={client.id} submissionId={intake.id} field="deals_closed" label="Total Deals Closed" value={intake.deals_closed} type="number" />
        </IntakeSection>

        {/* Contact & Office */}
        <IntakeSection title="Contact & Office">
          <IntakeField clientId={client.id} submissionId={intake.id} field="office_phone" label="Office Phone" value={intake.office_phone} />
          <IntakeField clientId={client.id} submissionId={intake.id} field="contact_email" label="Contact Email" value={intake.contact_email} />
          <IntakeField clientId={client.id} submissionId={intake.id} field="address" label="Physical Address" value={intake.address} />
          <IntakeField clientId={client.id} submissionId={intake.id} field="john_cell" label="John Cell" value={intake.john_cell} />
          <IntakeField clientId={client.id} submissionId={intake.id} field="craig_cell" label="Craig Cell" value={intake.craig_cell} />
        </IntakeSection>

        {/* Loan Programs */}
        <IntakeSection title="Loan Programs">
          <IntakeField clientId={client.id} submissionId={intake.id} field="loan_min" label="Loan Min ($)" value={intake.loan_min} type="number" />
          <IntakeField clientId={client.id} submissionId={intake.id} field="loan_max" label="Loan Max ($)" value={intake.loan_max} type="number" />
          <IntakeField clientId={client.id} submissionId={intake.id} field="geo_focus" label="Geographic Focus" value={intake.geo_focus} />
        </IntakeSection>

        {/* Brand Assets */}
        <IntakeSection title="Brand Assets">
          <IntakeField clientId={client.id} submissionId={intake.id} field="existing_copy" label="Awards / Press" value={intake.existing_copy} multiline />
          <IntakeField clientId={client.id} submissionId={intake.id} field="testimonials" label="Testimonials" value={intake.testimonials} multiline />
        </IntakeSection>

        {/* Deal Examples */}
        {intake.deal_examples && intake.deal_examples.length > 0 && (
          <div className="rounded-xl p-4 lg:col-span-2" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Deal Examples ({intake.deal_examples.length})
            </h3>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {intake.deal_examples.map((deal, i) => {
                const d = deal as Record<string, unknown>;
                return (
                  <div key={i} className="rounded-lg p-3" style={{ background: 'var(--navy3)', border: '1px solid var(--border)' }}>
                    <div className="text-xs font-medium" style={{ color: 'var(--light)' }}>
                      {d.property_type as string || 'Deal'} — {d.location as string || 'N/A'}
                    </div>
                    {d.loan_amount != null && (
                      <div className="text-[11px] mt-1" style={{ color: 'var(--muted)' }}>
                        ${Number(d.loan_amount).toLocaleString()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Team Bios */}
        {intake.team_bios && intake.team_bios.length > 0 && (
          <div className="rounded-xl p-4 lg:col-span-2" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Team Bios ({intake.team_bios.length})
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {intake.team_bios.map((bio, i) => {
                const b = bio as Record<string, unknown>;
                return (
                  <div key={i} className="rounded-lg p-3" style={{ background: 'var(--navy3)', border: '1px solid var(--border)' }}>
                    <div className="text-xs font-semibold" style={{ color: 'var(--light)' }}>
                      {b.name as string}
                    </div>
                    <div className="text-[11px]" style={{ color: 'var(--gold)' }}>{b.title as string}</div>
                    {b.bio ? <div className="text-[11px] mt-1" style={{ color: 'var(--muted)' }}>{b.bio as string}</div> : null}
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
  clientId: string; submissionId: string; field: string; label: string;
  value: string | number | null; type?: 'text' | 'number'; multiline?: boolean;
}) {
  const displayVal = value != null ? String(value) : '';
  const [localVal, setLocalVal] = useState(displayVal);
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const save = useCallback(async () => {
    if (localVal === displayVal) { setEditing(false); return; }
    setStatus('saving');
    const parsed = type === 'number' && localVal ? Number(localVal) : localVal;
    await fetch('/api/dashboard/update-intake', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, submissionId, fields: { [field]: parsed } }),
    });
    setStatus('saved');
    setEditing(false);
    setTimeout(() => setStatus('idle'), 2000);
  }, [clientId, submissionId, field, localVal, displayVal, type]);

  if (editing) {
    const sharedStyle = { background: 'var(--navy3)', border: '1px solid var(--border-gold)', color: 'var(--light)' };
    return (
      <div className="flex items-start justify-between gap-4">
        <span className="shrink-0 text-xs pt-1.5" style={{ color: 'var(--muted)' }}>{label}</span>
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={localVal}
            onChange={(e) => setLocalVal(e.target.value)}
            onBlur={save}
            rows={3}
            className="flex-1 max-w-[220px] rounded px-2 py-1 text-right text-xs outline-none resize-y"
            style={sharedStyle}
            autoFocus
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type={type}
            value={localVal}
            onChange={(e) => setLocalVal(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setLocalVal(displayVal); setEditing(false); } }}
            className="flex-1 max-w-[220px] rounded px-2 py-1 text-right text-xs outline-none"
            style={sharedStyle}
            autoFocus
          />
        )}
      </div>
    );
  }

  const formatted = type === 'number' && value != null ? Number(value).toLocaleString() : (displayVal || '—');

  return (
    <div
      className="flex items-start justify-between gap-4 group cursor-pointer rounded px-1 -mx-1 transition-colors hover:bg-white/5"
      onClick={() => setEditing(true)}
    >
      <span className="shrink-0 text-xs" style={{ color: 'var(--muted)' }}>
        {label}
        {status === 'saved' && <span className="ml-1 text-[10px]" style={{ color: 'var(--green)' }}>✓</span>}
      </span>
      <span className="text-right text-xs font-medium" style={{ color: 'var(--light)', wordBreak: 'break-all' }}>
        {multiline && displayVal.length > 60 ? displayVal.slice(0, 60) + '...' : formatted}
        <span className="ml-2 text-[10px] opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: 'var(--muted)' }}>✎</span>
      </span>
    </div>
  );
}
