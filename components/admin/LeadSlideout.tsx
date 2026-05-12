'use client';

import { useEffect, useState } from 'react';
import type { Lead } from '@/types/lead';
import type { Report } from '@/types/report';
import StatusBadge from '@/components/admin/StatusBadge';
import StatusDropdown from '@/components/admin/StatusDropdown';
import IndustrySelect from '@/components/admin/IndustrySelect';
import NotesField from '@/components/admin/NotesField';
import LeadIntelField from '@/components/admin/LeadIntelField';
import UnlockButton from '@/components/admin/UnlockButton';
import DeepDivePanel from '@/components/admin/DeepDivePanel';
import GenerateReportButton from '@/components/admin/GenerateReportButton';
import { getPublicSiteUrl } from '@/lib/siteUrl';
import { parseCompetitors } from '@/lib/competitorLead';
import CompetitorManager from '@/components/admin/CompetitorManager';

function formatDate(date: string | null | undefined) {
  if (!date) return null;
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface Props {
  lead: Lead | null;
  standardReport: Report | null;
  deepReport: Report | null;
  open: boolean;
  onClose: () => void;
  onLeadPatch: (leadId: string, patch: Partial<Lead>) => void;
  /** Reload lead + reports from Supabase after mutations */
  onRefresh: (leadId: string) => Promise<void>;
}

export default function LeadSlideout({
  lead,
  standardReport,
  deepReport,
  open,
  onClose,
  onLeadPatch,
  onRefresh,
}: Props) {
  const [tab, setTab] = useState<'overview' | 'report' | 'notes'>('overview');

  useEffect(() => {
    if (open) setTab('overview');
  }, [open, lead?.id]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!lead) return null;

  const competitorPreview =
    parseCompetitors(lead.competitors)
      .map((c) => c.name)
      .filter(Boolean)
      .join(', ') ||
    lead.competitor_name ||
    '';

  const base = getPublicSiteUrl();
  const teaserUrl = `${base}/report/${lead.report_token}`;
  const fullUrl = `${base}/report/${lead.report_token}/full?admin=true`;

  const tabBtn =
    'min-h-[44px] flex-1 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors duration-150';

  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-[45] bg-black/45 md:hidden"
          aria-label="Close panel"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 right-0 z-[50] flex w-full max-w-full flex-col shadow-2xl transition-transform duration-150 ease-out md:w-[480px] ${
          open ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
        style={{
          background: 'var(--navy2)',
          borderLeft: '1px solid var(--border)',
        }}
        aria-hidden={!open}
      >
        <header className="shrink-0 border-b px-5 py-4" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="font-heading text-2xl leading-tight" style={{ color: 'var(--light)' }}>
                {lead.business_name}
              </h2>
              {competitorPreview && (
                <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
                  vs {competitorPreview}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <StatusBadge status={lead.status} />
                {lead.deepdive_status && (
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                    style={{
                      background: 'rgba(212,168,67,0.15)',
                      color: 'var(--gold)',
                    }}
                  >
                    Deep dive · {lead.deepdive_status}
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] rounded-lg text-xl leading-none"
              style={{ color: 'var(--muted)', border: '1px solid var(--border)' }}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="mt-5 flex gap-1 rounded-xl p-1" style={{ background: 'rgba(9,20,40,0.6)' }}>
            {(
              [
                ['overview', 'Overview'],
                ['report', 'Report'],
                ['notes', 'Notes'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={tabBtn}
                style={{
                  background: tab === id ? 'var(--gold-dim)' : 'transparent',
                  color: tab === id ? 'var(--gold)' : 'var(--muted)',
                  border: tab === id ? '1px solid var(--border-gold)' : '1px solid transparent',
                }}
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {tab === 'overview' && (
            <div className="space-y-8">
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                  Contact
                </h3>
                <div className="space-y-2 text-sm" style={{ color: 'var(--silver)' }}>
                  <div>{lead.contact_name}</div>
                  <a href={`mailto:${encodeURIComponent(lead.email)}`} className="block min-h-[44px] py-2 underline-offset-2 hover:underline">
                    {lead.email}
                  </a>
                  {lead.phone && (
                    <a href={`tel:${lead.phone.replace(/\s/g, '')}`} className="block min-h-[44px] py-2 underline-offset-2 hover:underline">
                      {lead.phone}
                    </a>
                  )}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span
                      className="rounded-full px-2 py-1 text-[10px] font-bold uppercase"
                      style={{
                        background: lead.source === 'manual' ? 'rgba(212,168,67,0.12)' : 'rgba(143,168,200,0.12)',
                        color: lead.source === 'manual' ? 'var(--gold)' : 'var(--silver)',
                      }}
                    >
                      {lead.source === 'manual' ? 'Manual' : 'Public'}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>
                      Created {formatDate(lead.created_at)}
                    </span>
                  </div>
                </div>
                <div className="mt-5" key={lead.id}>
                  <IndustrySelect leadId={lead.id} currentIndustry={lead.industry ?? 'general'} />
                </div>
              </section>

              <section>
                <CompetitorManager lead={lead} onLeadPatch={onLeadPatch} onRefresh={onRefresh} />
              </section>

              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                  Pipeline
                </h3>
                <StatusDropdown
                  leadId={lead.id}
                  currentStatus={lead.status}
                  refreshAfterChange={false}
                  onChange={(s) => onLeadPatch(lead.id, { status: s })}
                />

                <div className="mt-6 space-y-3 border-l-2 pl-4" style={{ borderColor: 'var(--border)' }}>
                  <TimelineRow label="Created" value={formatDate(lead.created_at)} />
                  <TimelineRow
                    label="Report generated"
                    value={standardReport?.report_data ? formatDate(standardReport.created_at) : '—'}
                  />
                  <TimelineRow
                    label="Full report unlocked"
                    value={standardReport?.is_unlocked ? formatDate(standardReport.unlocked_at) : '—'}
                  />
                  <TimelineRow
                    label="Call booked (stage)"
                    value={['call_booked', 'unlocked', 'proposal_sent', 'closed_won'].includes(lead.status) ? '✓ Reached' : '—'}
                  />
                </div>
              </section>

              <section className="flex flex-col gap-3">
                {standardReport && !standardReport.is_unlocked && (
                  <UnlockButton
                    leadId={lead.id}
                    email={lead.email}
                    businessName={lead.business_name}
                    onSuccess={() => void onRefresh(lead.id)}
                  />
                )}
                <a href={teaserUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost min-h-[44px] w-full py-3 text-center text-sm">
                  👁 View teaser page
                </a>
                <button
                  type="button"
                  className="btn-ghost min-h-[44px] w-full py-3 text-sm"
                  onClick={() => navigator.clipboard.writeText(teaserUrl)}
                >
                  📋 Copy teaser link
                </button>
                <button
                  type="button"
                  className="btn-ghost min-h-[44px] w-full py-3 text-sm"
                  onClick={() => navigator.clipboard.writeText(fullUrl)}
                >
                  📋 Copy full report link
                </button>
                {lead.phone && (
                  <a href={`tel:${lead.phone.replace(/\s/g, '')}`} className="btn-primary min-h-[44px] w-full py-3 text-center text-sm">
                    📞 Call {lead.phone}
                  </a>
                )}
                <a href={`mailto:${encodeURIComponent(lead.email)}`} className="btn-ghost min-h-[44px] w-full py-3 text-center text-sm">
                  ✉️ Email {lead.email}
                </a>
              </section>
            </div>
          )}

          {tab === 'report' && (
            <div className="space-y-6">
              <div className="card p-5">
                <h3 className="font-body mb-4 text-lg font-semibold" style={{ color: 'var(--light)' }}>
                  Standard report
                </h3>
                <div className="mb-5 space-y-2">
                  {[
                    {
                      label: 'Status',
                      value: standardReport?.report_data ? '✓ Generated' : standardReport ? '⟳ Processing…' : '✗ Not started',
                      color: standardReport?.report_data ? 'var(--green)' : standardReport ? 'var(--gold)' : 'var(--red)',
                    },
                    {
                      label: 'Unlocked',
                      value: standardReport?.is_unlocked ? `✓ ${formatDate(standardReport.unlocked_at)}` : '✗ Locked',
                      color: standardReport?.is_unlocked ? 'var(--green)' : 'var(--muted)',
                    },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between gap-4 text-sm">
                      <span style={{ color: 'var(--muted)' }}>{row.label}</span>
                      <span style={{ color: row.color }}>{row.value}</span>
                    </div>
                  ))}
                </div>

                {standardReport && !standardReport.is_unlocked ? (
                  <UnlockButton
                    leadId={lead.id}
                    email={lead.email}
                    businessName={lead.business_name}
                    onSuccess={() => void onRefresh(lead.id)}
                  />
                ) : standardReport?.is_unlocked ? (
                  <div
                    className="rounded-lg px-4 py-3 text-center text-sm font-medium"
                    style={{
                      background: 'rgba(46,204,138,0.1)',
                      border: '1px solid rgba(46,204,138,0.3)',
                      color: 'var(--green)',
                    }}
                  >
                    ✓ Report unlocked {formatDate(standardReport.unlocked_at)}
                  </div>
                ) : (
                  <GenerateReportButton leadId={lead.id} onDone={() => void onRefresh(lead.id)} />
                )}
              </div>

              <DeepDivePanel
                leadId={lead.id}
                reportToken={lead.report_token}
                deepdiveStatus={lead.deepdive_status ?? null}
                deepdiveViewedAt={lead.deepdive_viewed_at ?? null}
                deepReport={deepReport}
                onAfterMutation={() => void onRefresh(lead.id)}
              />
            </div>
          )}

          {tab === 'notes' && (
            <div className="space-y-8">
              <NotesField leadId={lead.id} initialNotes={lead.notes} />
              <LeadIntelField
                leadId={lead.id}
                field="client_intel"
                initial={lead.client_intel ?? null}
                label="Client intel"
                placeholder="Positioning, objections, goals…"
              />
              <LeadIntelField
                leadId={lead.id}
                field="competitor_intel"
                initial={lead.competitor_intel ?? null}
                label="Competitor intel"
              />
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                Fields save automatically when you leave the field.
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

function TimelineRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
        {label}
      </div>
      <div className="text-sm" style={{ color: 'var(--silver)' }}>
        {value ?? '—'}
      </div>
    </div>
  );
}
