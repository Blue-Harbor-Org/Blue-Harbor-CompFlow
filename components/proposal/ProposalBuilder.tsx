'use client';

import { useState, useCallback } from 'react';
import type {
  BattlecardRow,
  ProposalClosing,
  ProposalData,
  ProposalDeliverable,
  PricingTier,
  RoadmapPhase,
  Proposal,
} from '@/types/proposal';
import {
  DEFAULT_DELIVERABLES,
  DEFAULT_PRICING,
  DEFAULT_ROADMAP,
  DEFAULT_CLOSING,
} from '@/types/proposal';

interface Props {
  clientId: string;
  clientName: string;
  existingProposal: Proposal | null;
  battlecardFromReport: BattlecardRow[];
  situationSummary: string;
  /** Preferred mockup for PDF (e.g. latest home page). */
  pdfMockupId?: string | null;
}

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function ProposalBuilder({
  clientId,
  clientName,
  existingProposal,
  battlecardFromReport,
  situationSummary: defaultSummary,
  pdfMockupId,
}: Props) {
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [proposalNumber, setProposalNumber] = useState<string | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState<number | null>(null);
  const [pdfValidUntil, setPdfValidUntil] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [proposalId, setProposalId] = useState(existingProposal?.id || '');
  const [publicSlug, setPublicSlug] = useState(existingProposal?.public_slug || '');

  const [title, setTitle] = useState(
    existingProposal?.title || clientName
  );
  const [tagline, setTagline] = useState(
    existingProposal?.tagline || 'Digital Growth Proposal'
  );
  const [prepDate, setPrepDate] = useState(
    existingProposal?.prep_date || new Date().toISOString().split('T')[0]
  );
  const [situationSummary, setSituationSummary] = useState(
    existingProposal?.situation_summary || defaultSummary
  );
  const [battlecard, setBattlecard] = useState<BattlecardRow[]>(
    existingProposal?.battlecard?.length
      ? existingProposal.battlecard
      : battlecardFromReport
  );
  const [deliverables, setDeliverables] = useState<ProposalDeliverable[]>(
    existingProposal?.deliverables?.length
      ? existingProposal.deliverables
      : DEFAULT_DELIVERABLES
  );
  const [pricing, setPricing] = useState<PricingTier[]>(
    existingProposal?.pricing?.length
      ? existingProposal.pricing
      : DEFAULT_PRICING
  );
  const [roadmap, setRoadmap] = useState<RoadmapPhase[]>(
    existingProposal?.roadmap?.length
      ? existingProposal.roadmap
      : DEFAULT_ROADMAP
  );
  const [closing, setClosing] = useState<ProposalClosing>(
    existingProposal?.closing || DEFAULT_CLOSING
  );

  const buildProposalData = useCallback((): ProposalData => ({
    title,
    tagline,
    prepDate,
    situationSummary,
    battlecard,
    deliverables,
    pricing,
    roadmap,
    closing,
  }), [title, tagline, prepDate, situationSummary, battlecard, deliverables, pricing, roadmap, closing]);

  async function handleGeneratePdf() {
    setPdfGenerating(true);
    setPdfError(null);
    try {
      const res = await fetch('/api/dashboard/proposal/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, mockupId: pdfMockupId ?? undefined }),
      });
      const data = (await res.json()) as {
        pdfUrl?: string;
        proposalNumber?: string;
        investmentAmount?: number;
        validUntil?: string;
        error?: string;
        detail?: string;
      };
      if (!res.ok) {
        setPdfError(data.error || data.detail || 'Generation failed');
        return;
      }
      if (data.pdfUrl) {
        setPdfUrl(data.pdfUrl);
        setProposalNumber(data.proposalNumber ?? null);
        setInvestmentAmount(data.investmentAmount ?? null);
        setPdfValidUntil(data.validUntil ?? null);
      }
    } catch (e) {
      setPdfError(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setPdfGenerating(false);
    }
  }

  async function handleSendProposal() {
    if (!pdfUrl || !proposalNumber || investmentAmount === null) return;
    setSending(true);
    setPdfError(null);
    try {
      const res = await fetch('/api/dashboard/proposal/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          proposalNumber,
          pdfUrl,
          investmentAmount,
          validUntil: pdfValidUntil ?? undefined,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setPdfError(data.error || 'Send failed');
        return;
      }
      setSent(true);
    } catch (e) {
      setPdfError(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setSending(false);
    }
  }

  function handleRegeneratePdf() {
    setPdfUrl(null);
    setProposalNumber(null);
    setInvestmentAmount(null);
    setPdfValidUntil(null);
    setSent(false);
    setPdfError(null);
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    const proposalData = buildProposalData();

    try {
      if (proposalId) {
        await fetch('/api/proposals', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ proposalId, proposalData }),
        });
      } else {
        const res = await fetch('/api/proposals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientId, proposalData }),
        });
        const { proposal } = await res.json();
        if (proposal) {
          setProposalId(proposal.id);
          setPublicSlug(proposal.public_slug);
        }
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleSend() {
    if (!proposalId) await handleSave();
    const id = proposalId || '';
    if (!id) return;

    await fetch('/api/proposals', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proposalId: id, action: 'send' }),
    });

    const url = `${window.location.origin}/proposal/${publicSlug}`;
    await navigator.clipboard.writeText(url);
    alert('Link copied to clipboard! Client status updated to proposal_sent.');
  }

  function handlePreview() {
    if (publicSlug) {
      window.open(`/proposal/${publicSlug}`, '_blank');
    } else {
      alert('Save the proposal first to generate a preview link.');
    }
  }

  function handleExportPDF() {
    if (publicSlug) {
      const printWin = window.open(`/proposal/${publicSlug}`, '_blank');
      if (printWin) {
        printWin.addEventListener('load', () => {
          setTimeout(() => printWin.print(), 500);
        });
      }
    } else {
      alert('Save the proposal first.');
    }
  }

  // --- Battlecard helpers ---
  function updateBattlecard(id: string, field: keyof BattlecardRow, value: string | boolean) {
    setBattlecard(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  }

  // --- Deliverable helpers ---
  function updateDeliverable(id: string, field: keyof ProposalDeliverable, value: unknown) {
    setDeliverables(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
  }

  // --- Pricing helpers ---
  function updateTier(tierId: string, field: keyof PricingTier, value: unknown) {
    setPricing(prev => prev.map(t => t.id === tierId ? { ...t, [field]: value } : t));
  }

  function addFeature(tierId: string) {
    setPricing(prev => prev.map(t => {
      if (t.id !== tierId) return t;
      return { ...t, features: [...t.features, { id: genId(), text: '' }] };
    }));
  }

  function updateFeature(tierId: string, featureId: string, text: string) {
    setPricing(prev => prev.map(t => {
      if (t.id !== tierId) return t;
      return {
        ...t,
        features: t.features.map(f => f.id === featureId ? { ...f, text } : f),
      };
    }));
  }

  function removeFeature(tierId: string, featureId: string) {
    setPricing(prev => prev.map(t => {
      if (t.id !== tierId) return t;
      return { ...t, features: t.features.filter(f => f.id !== featureId) };
    }));
  }

  // --- Roadmap helpers ---
  function updatePhase(id: string, field: keyof RoadmapPhase, value: string) {
    setRoadmap(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  }

  function addPhase() {
    setRoadmap(prev => [...prev, { id: genId(), title: '', timeline: '', description: '' }]);
  }

  function removePhase(id: string) {
    setRoadmap(prev => prev.filter(p => p.id !== id));
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl">
      {/* Action bar */}
      <div className="flex flex-wrap gap-3 mb-8 sticky top-0 z-20 py-3" style={{ background: 'var(--navy)' }}>
        <button onClick={handleSave} disabled={saving} className="btn-primary min-h-[44px] px-5 py-2 text-sm">
          {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Draft'}
        </button>
        <button onClick={handlePreview} className="btn-ghost min-h-[44px] px-5 py-2 text-sm">
          Preview
        </button>
        <button onClick={handleSend} className="btn-ghost min-h-[44px] px-5 py-2 text-sm">
          Send to Client
        </button>
        <button onClick={handleExportPDF} className="btn-ghost min-h-[44px] px-5 py-2 text-sm">
          Export PDF
        </button>
      </div>

      {/* 1. Header */}
      <Section title="Header">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Client Name" value={title} onChange={setTitle} />
          <Field label="Tagline" value={tagline} onChange={setTagline} />
          <Field label="Prep Date" value={prepDate} onChange={setPrepDate} type="date" />
        </div>
      </Section>

      {/* 2. Situation Summary */}
      <Section title="Situation Summary">
        <p className="text-xs mb-2" style={{ color: 'var(--muted)' }}>
          Auto-generated from comp report gaps. Edit freely.
        </p>
        <textarea
          className="input min-h-[120px] resize-y"
          value={situationSummary}
          onChange={e => setSituationSummary(e.target.value)}
        />
      </Section>

      {/* 3. Competitive Battlecard */}
      <Section title="Competitive Battlecard">
        {battlecard.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            No comparison data available from the report.
          </p>
        ) : (
          <div className="space-y-3">
            {battlecard.map(row => (
              <div
                key={row.id}
                className="grid grid-cols-[auto_1fr_1fr_1fr] gap-3 items-center p-3 rounded-lg"
                style={{
                  background: row.included ? 'var(--card)' : 'transparent',
                  border: `1px solid ${row.included ? 'var(--border)' : 'var(--border)'}`,
                  opacity: row.included ? 1 : 0.5,
                }}
              >
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={row.included}
                    onChange={e => updateBattlecard(row.id, 'included', e.target.checked)}
                    className="w-4 h-4 accent-[var(--gold)]"
                  />
                </label>
                <input
                  className="input text-sm py-1.5"
                  value={row.category}
                  onChange={e => updateBattlecard(row.id, 'category', e.target.value)}
                  placeholder="Category"
                />
                <input
                  className="input text-sm py-1.5"
                  value={row.client}
                  onChange={e => updateBattlecard(row.id, 'client', e.target.value)}
                  placeholder="Client"
                />
                <input
                  className="input text-sm py-1.5"
                  value={row.competitor}
                  onChange={e => updateBattlecard(row.id, 'competitor', e.target.value)}
                  placeholder="Competitor"
                />
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* 4. Deliverables */}
      <Section title="Deliverables">
        <div className="space-y-4">
          {deliverables.map(del => (
            <div
              key={del.id}
              className="p-4 rounded-lg"
              style={{
                background: del.included ? 'var(--card)' : 'transparent',
                border: `1px solid ${del.included ? 'var(--border-gold)' : 'var(--border)'}`,
                opacity: del.included ? 1 : 0.5,
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="checkbox"
                  checked={del.included}
                  onChange={e => updateDeliverable(del.id, 'included', e.target.checked)}
                  className="w-4 h-4 accent-[var(--gold)]"
                />
                <input
                  className="input flex-1 font-semibold"
                  value={del.title}
                  onChange={e => updateDeliverable(del.id, 'title', e.target.value)}
                />
              </div>
              <textarea
                className="input min-h-[60px] resize-y text-sm mb-2"
                value={del.description}
                onChange={e => updateDeliverable(del.id, 'description', e.target.value)}
              />
              <input
                className="input text-xs"
                value={del.tags.join(', ')}
                onChange={e => updateDeliverable(del.id, 'tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                placeholder="Tags (comma-separated)"
              />
            </div>
          ))}
        </div>
      </Section>

      {/* 5. Pricing */}
      <Section title="Pricing">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pricing.map(tier => (
            <div
              key={tier.id}
              className="p-5 rounded-lg"
              style={{
                background: 'var(--card)',
                border: tier.featured ? '2px solid var(--gold)' : '1px solid var(--border)',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <input
                  className="input font-heading text-xl w-2/3"
                  value={tier.name}
                  onChange={e => updateTier(tier.id, 'name', e.target.value)}
                />
                <label className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted)' }}>
                  <input
                    type="checkbox"
                    checked={tier.featured}
                    onChange={e => updateTier(tier.id, 'featured', e.target.checked)}
                    className="w-4 h-4 accent-[var(--gold)]"
                  />
                  Featured
                </label>
              </div>
              <input
                className="input text-sm mb-3"
                value={tier.subtitle}
                onChange={e => updateTier(tier.id, 'subtitle', e.target.value)}
                placeholder="Subtitle"
              />
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="label">Monthly</label>
                  <input
                    type="number"
                    className="input"
                    value={tier.monthlyPrice}
                    onChange={e => updateTier(tier.id, 'monthlyPrice', Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="label">One-time Fee</label>
                  <input
                    type="number"
                    className="input"
                    value={tier.oneTimeFee}
                    onChange={e => updateTier(tier.id, 'oneTimeFee', Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="label">Features</label>
                {tier.features.map(feature => (
                  <div key={feature.id} className="flex items-center gap-2">
                    <input
                      className="input flex-1 text-sm py-1.5"
                      value={feature.text}
                      onChange={e => updateFeature(tier.id, feature.id, e.target.value)}
                    />
                    <button
                      onClick={() => removeFeature(tier.id, feature.id)}
                      className="text-sm px-2 py-1 rounded"
                      style={{ color: 'var(--red)' }}
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addFeature(tier.id)}
                  className="text-xs font-semibold py-1"
                  style={{ color: 'var(--gold)' }}
                >
                  + Add Feature
                </button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 6. Roadmap */}
      <Section title="Roadmap">
        <div className="space-y-4">
          {roadmap.map((phase, idx) => (
            <div key={phase.id} className="p-4 rounded-lg" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: 'var(--gold-dim)', color: 'var(--gold)' }}>
                  {idx + 1}
                </span>
                <input
                  className="input flex-1"
                  value={phase.title}
                  onChange={e => updatePhase(phase.id, 'title', e.target.value)}
                  placeholder="Phase title"
                />
                <input
                  className="input w-32 text-sm"
                  value={phase.timeline}
                  onChange={e => updatePhase(phase.id, 'timeline', e.target.value)}
                  placeholder="e.g. Weeks 1–2"
                />
                {roadmap.length > 1 && (
                  <button
                    onClick={() => removePhase(phase.id)}
                    className="text-sm px-2 py-1"
                    style={{ color: 'var(--red)' }}
                  >
                    ×
                  </button>
                )}
              </div>
              <textarea
                className="input min-h-[60px] resize-y text-sm"
                value={phase.description}
                onChange={e => updatePhase(phase.id, 'description', e.target.value)}
                placeholder="Description"
              />
            </div>
          ))}
          <button onClick={addPhase} className="btn-ghost min-h-[44px] px-4 py-2 text-sm">
            + Add Phase
          </button>
        </div>
      </Section>

      {/* 7. Closing */}
      <Section title="Closing">
        <div className="space-y-4">
          <Field label="Headline" value={closing.headline} onChange={v => setClosing(prev => ({ ...prev, headline: v }))} />
          <div>
            <label className="label">Body</label>
            <textarea
              className="input min-h-[80px] resize-y"
              value={closing.body}
              onChange={e => setClosing(prev => ({ ...prev, body: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="CTA Label" value={closing.ctaLabel} onChange={v => setClosing(prev => ({ ...prev, ctaLabel: v }))} />
            <Field label="CTA Link" value={closing.ctaLink} onChange={v => setClosing(prev => ({ ...prev, ctaLink: v }))} />
          </div>
        </div>
      </Section>

      <div className="border-t border-[var(--border)] pt-6 mt-6 space-y-4 max-w-5xl">
        <h3 className="font-semibold text-sm" style={{ color: 'var(--light)' }}>
          PDF proposal
        </h3>
        {pdfError && (
          <p className="text-sm text-red-400" role="alert">
            {pdfError}
          </p>
        )}
        {!pdfUrl ? (
          <button
            type="button"
            onClick={handleGeneratePdf}
            disabled={pdfGenerating}
            className="w-full py-3 rounded-xl min-h-[44px] text-sm font-medium disabled:opacity-50"
            style={{ background: 'var(--gray-900, #111)', color: '#fff' }}
          >
            {pdfGenerating ? 'Generating proposal…' : 'Generate PDF proposal'}
          </button>
        ) : (
          <div className="space-y-3">
            <div
              className="flex items-center gap-3 p-3 rounded-xl border"
              style={{ background: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.35)' }}
            >
              <span className="text-green-400" aria-hidden>
                ✓
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: 'var(--light)' }}>
                  Proposal {proposalNumber} ready
                </p>
                {investmentAmount != null && (
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>
                    Investment: ${investmentAmount.toLocaleString()}
                  </p>
                )}
              </div>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs shrink-0 underline"
                style={{ color: 'var(--gold)' }}
              >
                Preview
              </a>
            </div>

            <button
              type="button"
              onClick={handleSendProposal}
              disabled={sending || sent}
              className="w-full py-2.5 rounded-xl border min-h-[44px] text-sm font-medium disabled:opacity-50"
              style={{ borderColor: 'var(--border)', color: 'var(--light)' }}
            >
              {sent ? 'Sent to client' : sending ? 'Sending…' : 'Email to client'}
            </button>

            <button
              type="button"
              onClick={handleRegeneratePdf}
              className="w-full py-2 text-xs"
              style={{ color: 'var(--muted)' }}
            >
              Regenerate
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="font-heading text-2xl mb-4" style={{ color: 'var(--light)' }}>
        {title}
      </h2>
      <div className="card p-5 md:p-6">
        {children}
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        type={type}
        className="input"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}
