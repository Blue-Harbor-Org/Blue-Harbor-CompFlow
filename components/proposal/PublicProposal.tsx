'use client';

import { useState } from 'react';
import type {
  Proposal,
  BattlecardRow,
  ProposalDeliverable,
  PricingTier,
  RoadmapPhase,
  ProposalClosing,
} from '@/types/proposal';

interface Props {
  proposal: Proposal;
  clientName: string;
  slug: string;
}

export default function PublicProposal({ proposal, clientName, slug }: Props) {
  const [accepted, setAccepted] = useState(!!proposal.accepted_at);
  const [accepting, setAccepting] = useState(false);

  const battlecard = (proposal.battlecard || []).filter((r: BattlecardRow) => r.included);
  const deliverables = (proposal.deliverables || []).filter((d: ProposalDeliverable) => d.included);
  const pricing = proposal.pricing || [];
  const roadmap = proposal.roadmap || [];
  const closing: ProposalClosing = proposal.closing || {
    headline: '',
    body: '',
    ctaLabel: '',
    ctaLink: '',
  };

  async function handleAccept() {
    setAccepting(true);
    try {
      await fetch('/api/proposals/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      setAccepted(true);
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setAccepting(false);
    }
  }

  if (accepted) {
    return <AcceptedScreen clientName={clientName} />;
  }

  return (
    <div className="proposal-public" style={{ background: 'var(--navy)', minHeight: '100vh' }}>
      <style>{printStyles}</style>

      {/* Header */}
      <header className="section-padding text-center" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] mb-4 font-body font-semibold" style={{ color: 'var(--gold)' }}>
            {proposal.tagline || 'Digital Growth Proposal'}
          </p>
          <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl mb-4" style={{ color: 'var(--light)' }}>
            {proposal.title || clientName}
          </h1>
          <div className="gold-divider my-6" />
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Prepared {proposal.prep_date
              ? new Date(proposal.prep_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
              : 'for you'
            }
            {' '}by <span style={{ color: 'var(--gold)' }}>Blue Harbor</span>
          </p>
        </div>
      </header>

      {/* Situation Summary */}
      {proposal.situation_summary && (
        <section className="section-padding">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-heading text-3xl md:text-4xl mb-6" style={{ color: 'var(--light)' }}>
              The Situation
            </h2>
            <p className="text-base leading-relaxed" style={{ color: 'var(--silver)' }}>
              {proposal.situation_summary}
            </p>
          </div>
        </section>
      )}

      {/* Battlecard */}
      {battlecard.length > 0 && (
        <section className="section-padding" style={{ background: 'var(--navy2)' }}>
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading text-3xl md:text-4xl mb-8 text-center" style={{ color: 'var(--light)' }}>
              Competitive Landscape
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                  <tr>
                    <th className="text-left py-3 px-4 font-body font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                      Category
                    </th>
                    <th className="text-left py-3 px-4 font-body font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--gold)', borderBottom: '1px solid var(--border-gold)' }}>
                      You
                    </th>
                    <th className="text-left py-3 px-4 font-body font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                      Competitor
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {battlecard.map((row: BattlecardRow) => (
                    <tr key={row.id}>
                      <td className="py-3 px-4 font-semibold" style={{ color: 'var(--light)', borderBottom: '1px solid var(--border)' }}>
                        {row.category}
                      </td>
                      <td className="py-3 px-4" style={{ color: 'var(--silver)', borderBottom: '1px solid var(--border)' }}>
                        {row.client}
                      </td>
                      <td className="py-3 px-4" style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                        {row.competitor}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Deliverables */}
      {deliverables.length > 0 && (
        <section className="section-padding">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading text-3xl md:text-4xl mb-3 text-center" style={{ color: 'var(--light)' }}>
              What We&apos;ll Deliver
            </h2>
            <p className="text-center text-sm mb-10" style={{ color: 'var(--muted)' }}>
              A complete digital growth engine tailored to your business.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {deliverables.map((del: ProposalDeliverable) => (
                <div
                  key={del.id}
                  className="p-5 rounded-lg"
                  style={{ background: 'var(--card)', border: '1px solid var(--border-gold)' }}
                >
                  <h3 className="font-heading text-xl mb-2" style={{ color: 'var(--light)' }}>
                    {del.title}
                  </h3>
                  <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--silver)' }}>
                    {del.description}
                  </p>
                  {del.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {del.tags.map(tag => (
                        <span key={tag} className="badge badge-gold text-[10px]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing */}
      {pricing.length > 0 && (
        <section className="section-padding" style={{ background: 'var(--navy2)' }}>
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading text-3xl md:text-4xl mb-3 text-center" style={{ color: 'var(--light)' }}>
              Investment
            </h2>
            <p className="text-center text-sm mb-10" style={{ color: 'var(--muted)' }}>
              Choose the plan that fits your growth goals.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pricing.map((tier: PricingTier) => (
                <div
                  key={tier.id}
                  className="p-6 rounded-xl relative"
                  style={{
                    background: 'var(--card)',
                    border: tier.featured ? '2px solid var(--gold)' : '1px solid var(--border)',
                  }}
                >
                  {tier.featured && (
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                      style={{ background: 'var(--gold)', color: 'var(--navy)' }}
                    >
                      Recommended
                    </div>
                  )}
                  <h3 className="font-heading text-2xl mb-1" style={{ color: 'var(--light)' }}>
                    {tier.name}
                  </h3>
                  <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>
                    {tier.subtitle}
                  </p>
                  <div className="mb-5">
                    <span className="font-heading text-4xl" style={{ color: 'var(--gold)' }}>
                      ${tier.monthlyPrice.toLocaleString()}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--muted)' }}>/mo</span>
                    {tier.oneTimeFee > 0 && (
                      <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                        + ${tier.oneTimeFee.toLocaleString()} one-time setup
                      </div>
                    )}
                  </div>
                  <ul className="space-y-2.5">
                    {tier.features.map(f => (
                      <li key={f.id} className="flex items-start gap-2 text-sm" style={{ color: 'var(--silver)' }}>
                        <span style={{ color: 'var(--gold)' }} className="mt-0.5 shrink-0">✓</span>
                        {f.text}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Roadmap */}
      {roadmap.length > 0 && (
        <section className="section-padding">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-heading text-3xl md:text-4xl mb-10 text-center" style={{ color: 'var(--light)' }}>
              The Roadmap
            </h2>
            <div className="relative">
              <div
                className="absolute left-4 top-0 bottom-0 w-px hidden md:block"
                style={{ background: 'linear-gradient(to bottom, var(--gold), var(--border))' }}
              />
              <div className="space-y-8">
                {roadmap.map((phase: RoadmapPhase, idx: number) => (
                  <div key={phase.id} className="flex gap-5 md:pl-12 relative">
                    <div
                      className="hidden md:flex absolute left-0 w-8 h-8 rounded-full items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: 'var(--gold)', color: 'var(--navy)', top: '4px' }}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span
                          className="md:hidden flex w-6 h-6 rounded-full items-center justify-center text-[10px] font-bold shrink-0"
                          style={{ background: 'var(--gold)', color: 'var(--navy)' }}
                        >
                          {idx + 1}
                        </span>
                        <h3 className="font-heading text-xl" style={{ color: 'var(--light)' }}>
                          {phase.title}
                        </h3>
                      </div>
                      <span className="inline-block text-xs font-semibold mb-2 px-2 py-0.5 rounded" style={{ background: 'var(--gold-dim)', color: 'var(--gold)' }}>
                        {phase.timeline}
                      </span>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--silver)' }}>
                        {phase.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Closing / CTA */}
      {(closing.headline || closing.body) && (
        <section className="section-padding text-center" style={{ background: 'var(--navy2)' }}>
          <div className="max-w-2xl mx-auto">
            <h2 className="font-heading text-3xl md:text-4xl mb-4" style={{ color: 'var(--light)' }}>
              {closing.headline}
            </h2>
            <p className="text-base leading-relaxed mb-8" style={{ color: 'var(--silver)' }}>
              {closing.body}
            </p>
            <div className="flex flex-col items-center gap-4">
              {closing.ctaLink && closing.ctaLabel && (
                <a
                  href={closing.ctaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost min-h-[52px] px-8 py-3 text-base"
                >
                  {closing.ctaLabel}
                </a>
              )}
              <button
                onClick={handleAccept}
                disabled={accepting}
                className="btn-primary min-h-[56px] px-10 py-4 text-base"
              >
                {accepting ? 'Accepting…' : 'Accept Proposal'}
              </button>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                By accepting, you agree to move forward with the scope and investment outlined above.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 text-center" style={{ borderTop: '1px solid var(--border)' }}>
        <p className="font-heading text-lg" style={{ color: 'var(--gold)' }}>Blue Harbor</p>
        <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
          Digital Strategy & Growth
        </p>
      </footer>
    </div>
  );
}

function AcceptedScreen({ clientName }: { clientName: string }) {
  return (
    <div
      style={{ background: 'var(--navy)', minHeight: '100vh' }}
      className="flex items-center justify-center p-6"
    >
      <div className="text-center max-w-md">
        <div
          className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-3xl"
          style={{ background: 'rgba(46,204,138,0.12)', border: '2px solid var(--green)' }}
        >
          ✓
        </div>
        <h1 className="font-heading text-4xl mb-3" style={{ color: 'var(--light)' }}>
          Proposal Accepted!
        </h1>
        <p className="text-base mb-6" style={{ color: 'var(--silver)' }}>
          Thank you, {clientName}. We&apos;re excited to get started.
        </p>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Your account manager will reach out within 24 hours to kick things off.
        </p>
        <div className="gold-divider my-8" />
        <p className="font-heading text-lg" style={{ color: 'var(--gold)' }}>Blue Harbor</p>
      </div>
    </div>
  );
}

const printStyles = `
@media print {
  .proposal-public {
    background: white !important;
    color: #1a1a1a !important;
  }
  .proposal-public * {
    color: #1a1a1a !important;
    border-color: #e0e0e0 !important;
  }
  .proposal-public h1,
  .proposal-public h2,
  .proposal-public h3 {
    color: #0b1425 !important;
  }
  .proposal-public .badge-gold {
    background: #f5f0e0 !important;
    color: #8b6914 !important;
  }
  .proposal-public button {
    display: none !important;
  }
  .proposal-public section {
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .proposal-public footer {
    break-before: avoid;
  }
}
`;
