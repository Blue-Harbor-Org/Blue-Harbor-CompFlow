'use client';

import { useState, useCallback } from 'react';
import type { Client } from '@/types/dashboard';
import type { MockupRow } from '@/components/admin/ClientDetailView';

const AVAILABLE_PAGES = [
  { slug: 'home', label: 'Landing Page' },
  { slug: 'about', label: 'About Us' },
  { slug: 'services', label: 'Services' },
  { slug: 'contact', label: 'Contact' },
] as const;

interface Props {
  client: Client;
  mockups: MockupRow[];
  onMockupsChange: (mockups: MockupRow[]) => void;
}

export default function ClientWebsiteTab({ client, mockups, onMockupsChange }: Props) {
  const [generating, setGenerating] = useState<string | null>(null);
  const [selectedMockup, setSelectedMockup] = useState<MockupRow | null>(mockups[0] ?? null);
  const [copied, setCopied] = useState(false);

  const existingSlugs = new Set(mockups.map((m) => m.page_slug));

  const handleGenerate = useCallback(async (pageSlug: string) => {
    setGenerating(pageSlug);
    try {
      const res = await fetch('/api/dashboard/generate-mockup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: client.id, pageSlug }),
      });
      if (res.ok) {
        const { mockup } = await res.json();
        const updated = mockups.filter((m) => m.page_slug !== pageSlug);
        updated.unshift(mockup);
        onMockupsChange(updated);
        setSelectedMockup(mockup);
      }
    } finally {
      setGenerating(null);
    }
  }, [client.id, mockups, onMockupsChange]);

  const copyPreviewLink = useCallback((token: string) => {
    const base = window.location.origin;
    navigator.clipboard.writeText(`${base}/preview/${token}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  if (mockups.length === 0 && !generating) {
    return (
      <div className="rounded-xl p-8 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: 'var(--gold-dim)' }}>
          <span className="text-2xl">🌐</span>
        </div>
        <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--light)' }}>
          Website Mockup Generator
        </h3>
        <p className="text-xs mb-6 max-w-md mx-auto" style={{ color: 'var(--muted)' }}>
          Generate AI-powered website mockups using the client&apos;s intake data, proposal, and existing site.
          Start with a landing page and add more pages as needed.
        </p>
        <button
          onClick={() => handleGenerate('home')}
          disabled={!!generating}
          className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50"
          style={{ background: 'var(--gold)', color: 'var(--navy)' }}
        >
          {generating ? (
            <>
              <Spinner /> Generating Landing Page...
            </>
          ) : (
            'Generate Landing Page'
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Page list + actions */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Existing pages as tabs */}
        {mockups.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedMockup(m)}
            className="rounded-lg px-3 py-2 text-xs font-semibold transition-all"
            style={{
              background: selectedMockup?.id === m.id ? 'var(--gold-dim)' : 'var(--card)',
              color: selectedMockup?.id === m.id ? 'var(--gold)' : 'var(--muted)',
              border: `1px solid ${selectedMockup?.id === m.id ? 'var(--border-gold)' : 'var(--border)'}`,
            }}
          >
            {m.page_title}
            <span className="ml-1.5 text-[10px] opacity-60">v{m.version}</span>
          </button>
        ))}

        {/* Add page dropdown */}
        {AVAILABLE_PAGES.some((p) => !existingSlugs.has(p.slug)) && (
          <div className="relative group">
            <button
              className="rounded-lg px-3 py-2 text-xs font-semibold transition-all"
              style={{ background: 'var(--card)', color: 'var(--muted)', border: '1px solid var(--border)' }}
            >
              + Add Page
            </button>
            <div
              className="absolute left-0 top-full mt-1 hidden group-hover:block rounded-lg overflow-hidden z-10 min-w-[160px]"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              {AVAILABLE_PAGES.filter((p) => !existingSlugs.has(p.slug)).map((p) => (
                <button
                  key={p.slug}
                  onClick={() => handleGenerate(p.slug)}
                  disabled={!!generating}
                  className="block w-full text-left px-4 py-2 text-xs font-medium transition-colors hover:bg-white/5 disabled:opacity-50"
                  style={{ color: 'var(--light)' }}
                >
                  {generating === p.slug ? 'Generating...' : p.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {generating && (
        <div
          className="flex items-center gap-3 rounded-lg px-4 py-3 text-xs font-medium"
          style={{ background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.3)', color: 'var(--gold)' }}
        >
          <Spinner />
          Generating {generating} page mockup... This may take 15-30 seconds.
        </div>
      )}

      {/* Selected mockup */}
      {selectedMockup && (
        <div className="space-y-3">
          {/* Actions bar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleGenerate(selectedMockup.page_slug)}
              disabled={!!generating}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50"
              style={{ background: 'rgba(9,20,40,0.6)', color: 'var(--silver)', border: '1px solid var(--border)' }}
            >
              {generating === selectedMockup.page_slug ? 'Regenerating...' : '↻ Regenerate'}
            </button>
            <button
              onClick={() => copyPreviewLink(selectedMockup.preview_token)}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
              style={{ background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid var(--border-gold)' }}
            >
              {copied ? '✓ Copied!' : '🔗 Copy Preview Link'}
            </button>
            <a
              href={`/preview/${selectedMockup.preview_token}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
              style={{ background: 'rgba(9,20,40,0.6)', color: 'var(--silver)', border: '1px solid var(--border)' }}
            >
              ↗ Open Full Preview
            </a>
            <span className="text-[10px] ml-auto" style={{ color: 'var(--muted)' }}>
              Last updated: {new Date(selectedMockup.updated_at).toLocaleString()}
            </span>
          </div>

          {/* Preview iframe */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: '1px solid var(--border)', height: '600px' }}
          >
            <iframe
              srcDoc={selectedMockup.html_content}
              title={selectedMockup.page_title}
              className="w-full h-full border-0"
              sandbox="allow-scripts"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
