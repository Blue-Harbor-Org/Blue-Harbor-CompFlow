'use client';

import { useMemo, useState } from 'react';
import type { Proposal, ProposalDeliverable, RoadmapPhase, PricingTier } from '@/types/proposal';

const NAVY = '#0f1f38';
const GOLD = '#C9A84C';
const BG = '#FAFAF8';
const GREEN = '#1D9E75';

function parseStringArray(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  return [];
}

function parseTimeline(
  raw: unknown
): Array<{ phase: string; duration: string; deliverable: string }> {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      const o = item as Record<string, unknown>;
      return {
        phase: String(o.phase ?? ''),
        duration: String(o.duration ?? ''),
        deliverable: String(o.deliverable ?? ''),
      };
    })
    .filter((t) => t.phase || t.deliverable);
}

interface Props {
  proposal: Proposal;
  clientCompany: string;
  clientIndustry?: string;
  contactEmail: string;
  slug: string;
}

export default function PublicProposal({
  proposal,
  clientCompany,
  clientIndustry,
  contactEmail,
  slug,
}: Props) {
  const [accepted, setAccepted] = useState(Boolean(proposal.accepted_at));
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState('');
  const [signerName, setSignerName] = useState('');
  const [signerTitle, setSignerTitle] = useState('');

  const scopeLines = useMemo(() => {
    const fromPdf = parseStringArray(proposal.scope_of_work);
    if (fromPdf.length) return fromPdf;
    const dels = (proposal.deliverables || []).filter((d: ProposalDeliverable) => d.included);
    return dels.map((d) => d.title + (d.description ? ` — ${d.description}` : ''));
  }, [proposal.deliverables, proposal.scope_of_work]);

  const timeline = useMemo(() => {
    const fromPdf = parseTimeline(proposal.client_timeline);
    if (fromPdf.length) return fromPdf;
    const rm = (proposal.roadmap || []) as RoadmapPhase[];
    return rm.map((p) => ({
      phase: p.title,
      duration: p.timeline,
      deliverable: p.description,
    }));
  }, [proposal.client_timeline, proposal.roadmap]);

  const investment = useMemo(() => {
    const amt = proposal.investment_amount;
    const monthly = proposal.monthly_hosting ?? 49;
    const tier = proposal.investment_tier_name ?? 'Professional';
    const includes = parseStringArray(proposal.investment_includes);
    if (amt != null && amt > 0) {
      return { oneTime: amt, monthly, tier, includes };
    }
    const featured = (proposal.pricing || []).find((t: PricingTier) => t.featured) ?? proposal.pricing?.[0];
    if (featured) {
      return {
        oneTime: featured.oneTimeFee,
        monthly: featured.monthlyPrice,
        tier: featured.name,
        includes: featured.features.map((f) => f.text).filter(Boolean),
      };
    }
    return null;
  }, [proposal]);

  const executive = proposal.executive_summary?.trim() || proposal.situation_summary || '';
  const proposalNum = proposal.proposal_number || 'Proposal';
  const validUntil = proposal.valid_until
    ? new Date(proposal.valid_until).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;
  const designBadge = clientIndustry || proposal.tagline || 'Custom';

  async function handleAccept(e: React.FormEvent) {
    e.preventDefault();
    if (!signerName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    setAccepting(true);
    setError('');
    try {
      const res = await fetch('/api/proposals/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          name: signerName.trim(),
          title: signerTitle.trim() || null,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || 'Could not accept proposal.');
        return;
      }
      setAccepted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setAccepting(false);
    }
  }

  if (accepted) {
    return (
      <AcceptedView
        clientCompany={clientCompany}
        signerName={signerName.trim() || proposal.accepted_by_name || 'there'}
        acceptedAt={proposal.accepted_at ?? new Date().toISOString()}
        contactEmail={contactEmail}
      />
    );
  }

  return (
    <div
      className="min-h-screen pb-16"
      style={{
        background: BG,
        fontFamily: "'Inter', system-ui, sans-serif",
        color: '#212529',
      }}
    >
      <header
        className="border-b px-4 py-6"
        style={{ borderColor: '#E9ECEF', background: '#fff' }}
      >
        <div className="mx-auto flex max-w-[720px] flex-wrap items-center justify-between gap-4">
          <div>
            <div
              className="text-lg font-semibold tracking-wide"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", color: GOLD }}
            >
              Blue Harbor
            </div>
          </div>
          <div className="text-right text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#868E96' }}>
            {proposalNum}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[720px] px-4 py-10">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: GOLD }}>
          Website redesign proposal
        </p>
        <h1
          className="mt-2 text-3xl font-bold leading-tight sm:text-4xl"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", color: NAVY }}
        >
          Prepared for {clientCompany}
        </h1>
        <div className="mt-4 flex flex-wrap gap-2">
          <span
            className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide"
            style={{ background: NAVY, color: GOLD }}
          >
            {designBadge}
          </span>
          {validUntil && (
            <span className="rounded-full border px-3 py-1 text-[11px]" style={{ borderColor: '#dee2e6', color: '#495057' }}>
              Valid until {validUntil}
            </span>
          )}
        </div>

        {executive && (
          <section className="mt-10 rounded-2xl border p-6 sm:p-8" style={{ borderColor: '#E9ECEF', background: '#fff' }}>
            <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: GOLD }}>
              Executive summary
            </h2>
            <div className="mt-4 space-y-4 text-sm leading-relaxed" style={{ color: '#495057' }}>
              {executive.split(/\n\n+/).map((para) => (
                <p key={para.slice(0, 40)}>{para}</p>
              ))}
            </div>
          </section>
        )}

        {scopeLines.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: GOLD }}>
              Scope of work
            </h2>
            <ul className="mt-4 space-y-3">
              {scopeLines.map((line) => (
                <li key={line} className="flex gap-3 text-sm" style={{ color: '#495057' }}>
                  <span
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                    style={{ background: GREEN }}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                      <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {investment && (
          <section className="mt-10 overflow-hidden rounded-2xl border-2" style={{ borderColor: NAVY }}>
            <div className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between" style={{ background: NAVY }}>
              <div>
                <div className="text-lg font-semibold text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  {investment.tier}
                </div>
                <div className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  One-time + hosting
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold sm:text-4xl" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: GOLD }}>
                  ${investment.oneTime.toLocaleString()}
                </div>
                <div className="text-xs uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  one-time investment
                </div>
                <div className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  + ${investment.monthly.toLocaleString()}/mo hosting &amp; maintenance
                </div>
              </div>
            </div>
            {investment.includes.length > 0 && (
              <div className="bg-white px-6 py-6">
                <h3 className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#868E96' }}>
                  Everything included
                </h3>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {investment.includes.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm" style={{ color: '#495057' }}>
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: GOLD }} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {timeline.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: GOLD }}>
              Timeline
            </h2>
            <div className="mt-6 hidden gap-4 sm:flex sm:flex-wrap">
              {timeline.map((t, i) => (
                <div
                  key={`${t.phase}-${i}`}
                  className="min-w-[140px] flex-1 rounded-xl border p-4"
                  style={{ borderColor: '#E9ECEF', background: '#fff' }}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: GOLD }}>
                    {t.phase}
                  </div>
                  <div className="mt-1 text-xs" style={{ color: '#868E96' }}>
                    {t.duration}
                  </div>
                  <p className="mt-2 text-sm" style={{ color: '#495057' }}>
                    {t.deliverable}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-4 sm:hidden">
              {timeline.map((t, i) => (
                <div key={`m-${t.phase}-${i}`} className="rounded-xl border p-4" style={{ borderColor: '#E9ECEF', background: '#fff' }}>
                  <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: GOLD }}>
                    {t.phase}
                  </div>
                  <div className="text-xs" style={{ color: '#868E96' }}>
                    {t.duration}
                  </div>
                  <p className="mt-2 text-sm" style={{ color: '#495057' }}>
                    {t.deliverable}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section
          className="mt-12 rounded-2xl px-5 py-8 sm:px-8"
          style={{ background: NAVY, color: '#fff' }}
        >
          <h2 className="text-lg font-semibold" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Ready to move forward?
          </h2>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
            By accepting, you authorize Blue Harbor to proceed with the scope described above. A 50% deposit is due
            at signing.
          </p>
          <form className="mt-6 space-y-4" onSubmit={handleAccept}>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.55)' }}>
                Full name
              </label>
              <input
                required
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                className="w-full min-h-[44px] rounded-lg border-0 px-3 text-sm text-gray-900 outline-none"
                placeholder="Your name"
                autoComplete="name"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.55)' }}>
                Title (optional)
              </label>
              <input
                value={signerTitle}
                onChange={(e) => setSignerTitle(e.target.value)}
                className="w-full min-h-[44px] rounded-lg border-0 px-3 text-sm text-gray-900 outline-none"
                placeholder="Owner, CEO, etc."
              />
            </div>
            {error && <p className="text-sm text-red-300">{error}</p>}
            <button
              type="submit"
              disabled={accepting}
              className="w-full min-h-[48px] rounded-lg text-sm font-bold uppercase tracking-wide disabled:opacity-50"
              style={{ background: GOLD, color: NAVY }}
            >
              {accepting ? 'Submitting…' : 'Accept proposal & get started'}
            </button>
          </form>
        </section>

        <footer className="mt-16 text-center text-xs" style={{ color: '#868E96' }}>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", color: NAVY }} className="text-base font-semibold">
            Blue Harbor
          </div>
          <p className="mt-1">Questions? Reply to your proposal email or visit blueharbor.com</p>
        </footer>
      </main>
    </div>
  );
}

function AcceptedView({
  clientCompany,
  signerName,
  acceptedAt,
  contactEmail,
}: {
  clientCompany: string;
  signerName: string;
  acceptedAt: string;
  contactEmail: string;
}) {
  const dateStr = new Date(acceptedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen px-4 py-16" style={{ background: BG, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="mx-auto max-w-[520px] text-center">
        <div className="text-lg font-semibold tracking-wide" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: GOLD }}>
          Blue Harbor
        </div>
        <div
          className="mx-auto mt-10 flex h-16 w-16 items-center justify-center rounded-full text-2xl"
          style={{ border: `3px solid ${GREEN}`, color: GREEN }}
        >
          ✓
        </div>
        <h1
          className="mt-8 text-3xl font-bold"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", color: NAVY }}
        >
          Proposal accepted
        </h1>
        <p className="mt-4 text-base" style={{ color: '#495057' }}>
          Thank you, {signerName}. You&apos;re all set.
        </p>
        <p className="mt-2 text-sm" style={{ color: '#868E96' }}>
          {clientCompany} — {dateStr}
        </p>

        <div className="mt-10 rounded-2xl border bg-white p-6 text-left text-sm" style={{ borderColor: '#E9ECEF', color: '#495057' }}>
          <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: GOLD }}>
            What happens next
          </h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5">
            <li>We&apos;ll reach out within 1 business day.</li>
            <li>
              Deposit invoice will be sent to{' '}
              {contactEmail ? <strong>{contactEmail}</strong> : 'your email on file'}.
            </li>
            <li>Work begins after the deposit is received.</li>
          </ol>
        </div>

        <a
          href="mailto:hello@blueharbor.com"
          className="mt-10 inline-flex min-h-[44px] items-center justify-center rounded-lg px-6 text-sm font-semibold"
          style={{ border: `2px solid ${NAVY}`, color: NAVY }}
        >
          Questions? Contact us →
        </a>
      </div>
    </div>
  );
}
