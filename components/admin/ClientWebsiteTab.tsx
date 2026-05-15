'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Client } from '@/types/dashboard';
import type { MockupRow } from '@/components/admin/ClientDetailView';
import { DESIGN_ARCHETYPES, selectArchetypeForIndustry } from '@/lib/mockup-archetypes';
import { StyleSelector } from '@/components/admin/mockup/StyleSelector';

type FlowStep = 'info' | 'generating' | 'preview' | 'approved';

interface Props {
  client: Client;
  mockups: MockupRow[];
  onMockupsChange: (mockups: MockupRow[]) => void;
}

function readArchetypeMeta(html: string, key: 'id' | 'name') {
  const metaName = key === 'id' ? 'bh-archetype-id' : 'bh-archetype-name';
  return html.match(new RegExp(`<meta\\s+name=["']${metaName}["']\\s+content=["']([^"']+)["']`, 'i'))?.[1];
}

function getArchetypeId(mockup: MockupRow | null) {
  return mockup ? mockup.archetypeId ?? readArchetypeMeta(mockup.html_content, 'id') : undefined;
}

function getArchetypeName(mockup: MockupRow | null) {
  return mockup ? mockup.archetypeName ?? readArchetypeMeta(mockup.html_content, 'name') ?? 'Custom' : 'Custom';
}

export default function ClientWebsiteTab({ client, mockups, onMockupsChange }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<FlowStep>(mockups[0] ? 'preview' : 'info');
  const [selectedMockup, setSelectedMockup] = useState<MockupRow | null>(mockups[0] ?? null);
  const [form, setForm] = useState({
    businessName: client.business_name,
    industry: client.industry || 'general',
    websiteUrl: client.website_url || '',
    competitorUrl: client.competitor_url || '',
    vibeNotes: '',
  });
  const [selectedArchetypeId, setSelectedArchetypeId] = useState<string | 'auto'>('auto');
  const [activeArchetype, setActiveArchetype] = useState<{
    id: string;
    name: string;
  } | null>(
    selectedMockup
      ? { id: getArchetypeId(selectedMockup) ?? '', name: getArchetypeName(selectedMockup) }
      : null
  );
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  const [buildoutLoading, setBuildoutLoading] = useState(false);

  const updateMockupList = useCallback((mockup: MockupRow) => {
    const updated = mockups.filter((m) => m.page_slug !== mockup.page_slug);
    updated.unshift(mockup);
    onMockupsChange(updated);
    setSelectedMockup(mockup);
  }, [mockups, onMockupsChange]);

  const generateMockup = useCallback(async (previousArchetypeId?: string) => {
    const displayArchetype = selectedArchetypeId === 'auto'
      ? selectArchetypeForIndustry(form.industry, previousArchetypeId)
      : DESIGN_ARCHETYPES.find((a) => a.id === selectedArchetypeId) ?? selectArchetypeForIndustry(form.industry);
    setActiveArchetype({ id: displayArchetype.id, name: displayArchetype.name });
    setStep('generating');

    const res = await fetch('/api/dashboard/generate-mockup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: client.id,
        pageSlug: 'home',
        businessName: form.businessName,
        industry: form.industry,
        websiteUrl: form.websiteUrl,
        competitorUrl: form.competitorUrl || undefined,
        vibeNotes: form.vibeNotes || undefined,
        lockedArchetypeId: selectedArchetypeId,
        previousArchetypeId,
      }),
    });

    if (!res.ok) {
      setStep(selectedMockup ? 'preview' : 'info');
      return;
    }

    const { mockup, archetypeId, archetypeName } = await res.json() as {
      mockup: MockupRow;
      archetypeId: string;
      archetypeName: string;
    };
    const enriched = { ...mockup, archetypeId, archetypeName };
    setActiveArchetype({ id: archetypeId, name: archetypeName });
    updateMockupList(enriched);
    setStep('preview');
  }, [client.id, form, selectedArchetypeId, selectedMockup, updateMockupList]);

  const downloadHtml = useCallback(() => {
    if (!selectedMockup) return;
    const blob = new Blob([selectedMockup.html_content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${client.business_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-mockup.html`;
    link.click();
    URL.revokeObjectURL(url);
  }, [client.business_name, selectedMockup]);

  const copyPreviewLink = useCallback(() => {
    if (!selectedMockup) return;
    navigator.clipboard.writeText(`${window.location.origin}/preview/${selectedMockup.preview_token}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [selectedMockup]);

  const handleStartBuildout = useCallback(async () => {
    if (!selectedMockup) return;
    setBuildoutLoading(true);
    try {
      const res = await fetch('/api/dashboard/buildout/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: client.id, mockupId: selectedMockup.id }),
      });
      const data = await res.json() as { buildoutId?: string };
      if (data.buildoutId) {
        router.push(`/dashboard/clients/${client.id}/buildout`);
      }
    } finally {
      setBuildoutLoading(false);
    }
  }, [client.id, router, selectedMockup]);

  if (step === 'generating') {
    return (
      <div className="rounded-xl p-8 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: 'var(--gold-dim)', color: 'var(--gold)' }}>
          <Spinner />
        </div>
        <h3 className="mb-2 text-lg font-semibold" style={{ color: 'var(--light)' }}>
          Designing your site in {activeArchetype?.name ?? 'a unique'} style...
        </h3>
        <div className="mx-auto mt-6 max-w-sm space-y-3 text-left text-sm" style={{ color: 'var(--muted)' }}>
          <ProgressLine label="Analyzing your current site..." />
          <ProgressLine label="Generating unique design..." />
          <ProgressLine label="Building your preview..." />
        </div>
      </div>
    );
  }

  if (step === 'approved') {
    return (
      <div className="rounded-xl p-8 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="mx-auto max-w-md space-y-3">
          <div className="flex items-center justify-center gap-2 font-medium" style={{ color: 'var(--green)' }}>
            <span>✓</span> Design approved
          </div>
          <button
            type="button"
            onClick={() => void handleStartBuildout()}
            disabled={buildoutLoading || !selectedMockup}
            className="w-full rounded-xl py-3 text-sm font-medium text-white disabled:opacity-50"
            style={{ background: '#111827' }}
          >
            {buildoutLoading ? 'Starting buildout...' : 'Build Full Site (Home, About, Services, Contact)'}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/dashboard/clients/${client.id}/proposal`)}
            className="w-full rounded-xl border py-2 text-sm"
            style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
          >
            Generate Proposal First →
          </button>
        </div>
      </div>
    );
  }

  if (step === 'preview' && selectedMockup) {
    const previousId = getArchetypeId(selectedMockup);
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid var(--border-gold)' }}
          >
            {getArchetypeName(selectedMockup)} style
          </span>
          <button
            type="button"
            onClick={() => void generateMockup(previousId)}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold"
            style={{ background: 'rgba(9,20,40,0.6)', color: 'var(--silver)', border: '1px solid var(--border)' }}
          >
            Try different style
          </button>
          <button
            type="button"
            onClick={() => setStep('approved')}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold"
            style={{ background: 'var(--gold)', color: 'var(--navy)' }}
          >
            Approve this design →
          </button>
        </div>

        <div
          className="overflow-hidden rounded-xl"
          style={{ border: '1px solid var(--border)', minHeight: 600 }}
        >
          <iframe
            srcDoc={selectedMockup.html_content}
            title={selectedMockup.page_title}
            className="h-[600px] w-full border-0"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={downloadHtml} className="rounded-lg px-3 py-2 text-xs font-semibold" style={{ background: 'rgba(9,20,40,0.6)', color: 'var(--silver)', border: '1px solid var(--border)' }}>
            Download HTML
          </button>
          <button
            type="button"
            onClick={() => {
              copyPreviewLink();
              setSent(true);
              setTimeout(() => setSent(false), 2000);
            }}
            className="rounded-lg px-3 py-2 text-xs font-semibold"
            style={{ background: 'rgba(9,20,40,0.6)', color: 'var(--silver)', border: '1px solid var(--border)' }}
          >
            {sent || copied ? 'Preview link copied' : 'Send to client'}
          </button>
          <button type="button" onClick={() => void generateMockup(previousId)} className="rounded-lg px-3 py-2 text-xs font-semibold" style={{ background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid var(--border-gold)' }}>
            Regenerate
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <div className="mb-5">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--light)' }}>
          Business Info
        </h3>
        <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>
          Confirm the inputs before generating a unique homepage mockup.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="Business name">
          <input className="input" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
        </Field>
        <Field label="Industry">
          <input className="input" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
        </Field>
        <Field label="Their current website">
          <input className="input" value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} />
        </Field>
        <Field label="Competitor URL (optional)">
          <input className="input" value={form.competitorUrl} onChange={(e) => setForm({ ...form, competitorUrl: e.target.value })} />
        </Field>
        <div className="lg:col-span-2">
          <StyleSelector selectedId={selectedArchetypeId} onSelect={setSelectedArchetypeId} />
        </div>
        <Field label="Style notes (optional)" className="lg:col-span-2">
          <textarea
            className="input min-h-[110px] resize-y"
            value={form.vibeNotes}
            onChange={(e) => setForm({ ...form, vibeNotes: e.target.value })}
            placeholder="Anything specific you want?"
          />
        </Field>
      </div>

      <button
        type="button"
        onClick={() => void generateMockup()}
        className="mt-5 rounded-lg px-5 py-2.5 text-sm font-semibold"
        style={{ background: 'var(--gold)', color: 'var(--navy)' }}
      >
        Generate Mockup →
      </button>
    </div>
  );
}

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block space-y-1.5 ${className}`.trim()}>
      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
        {label}
      </span>
      {children}
    </label>
  );
}

function ProgressLine({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-2 w-2 animate-pulse rounded-full" style={{ background: 'var(--gold)' }} />
      <span>{label}</span>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
