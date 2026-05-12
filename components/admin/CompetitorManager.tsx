'use client';

import { useCallback, useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import type { CompetitorEntry, Lead } from '@/types/lead';
import { parseCompetitors } from '@/lib/competitorLead';

interface Props {
  lead: Lead;
  onLeadPatch: (leadId: string, patch: Partial<Lead>) => void;
  onRefresh: (leadId: string) => Promise<void>;
}

export default function CompetitorManager({ lead, onLeadPatch, onRefresh }: Props) {
  const [competitors, setCompetitors] = useState<CompetitorEntry[]>(() =>
    parseCompetitors(lead.competitors).slice(0, 3)
  );
  const [finding, setFinding] = useState(false);

  useEffect(() => {
    setCompetitors(parseCompetitors(lead.competitors).slice(0, 3));
  }, [lead.id, lead.competitors]);

  const persist = useCallback(
    async (next: CompetitorEntry[]) => {
      const cleaned = next
        .filter((c) => c.url.trim())
        .slice(0, 3)
        .map((c) => ({
          ...c,
          url: c.url.trim().startsWith('http') ? c.url.trim() : `https://${c.url.trim()}`,
          name: c.name.trim() || c.url.trim(),
        }));

      const supabase = createBrowserClient();
      const first = cleaned[0];
      await supabase
        .from('leads')
        .update({
          competitors: cleaned,
          competitor_url: first?.url ?? null,
          competitor_name: first?.name ?? null,
        })
        .eq('id', lead.id);

      onLeadPatch(lead.id, {
        competitors: cleaned,
        competitor_url: first?.url ?? null,
        competitor_name: first?.name ?? null,
      });
      await onRefresh(lead.id);
    },
    [lead.id, onLeadPatch, onRefresh]
  );

  function updateCompetitor(id: string, updates: Partial<CompetitorEntry>) {
    setCompetitors((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  }

  async function saveCompetitors(next?: CompetitorEntry[]) {
    await persist(next ?? competitors);
  }

  function removeCompetitor(id: string) {
    const next = competitors.filter((c) => c.id !== id);
    setCompetitors(next);
    void persist(next);
  }

  function addCompetitor() {
    if (competitors.length >= 3) return;
    const newComp: CompetitorEntry = {
      id: crypto.randomUUID(),
      name: '',
      url: '',
      source: 'manual',
      autoFound: false,
    };
    setCompetitors((prev) => [...prev, newComp]);
  }

  async function handleRefind() {
    setFinding(true);
    try {
      const res = await fetch('/api/find-competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead.id }),
      });
      const data = (await res.json()) as { competitors?: CompetitorEntry[]; error?: string };
      if (data.competitors) {
        setCompetitors(data.competitors.slice(0, 3));
        await onRefresh(lead.id);
      }
    } finally {
      setFinding(false);
    }
  }

  const labelStyle = {
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    color: 'var(--muted)',
    marginBottom: 12,
    fontWeight: 600,
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={labelStyle}>Competitors ({competitors.length}/3)</div>

      <div className="flex flex-col gap-2">
        {competitors.map((comp) => (
          <div
            key={comp.id}
            className="grid items-center gap-2 rounded-lg border px-3 py-2.5"
            style={{
              gridTemplateColumns: '1fr auto',
              background: 'var(--navy3)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="min-w-0">
              <input
                value={comp.name}
                onChange={(e) => updateCompetitor(comp.id, { name: e.target.value })}
                onBlur={() => void saveCompetitors()}
                className="w-full border-none bg-transparent font-semibold outline-none"
                style={{ color: 'var(--light)', fontSize: 13 }}
                placeholder="Competitor name"
              />
              <input
                value={comp.url}
                onChange={(e) => updateCompetitor(comp.id, { url: e.target.value })}
                onBlur={() => void saveCompetitors()}
                className="mt-1 w-full border-none bg-transparent outline-none"
                style={{ color: 'var(--muted)', fontSize: 11 }}
                placeholder="https://…"
              />
              <span
                className="mt-1 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
                style={{
                  background: comp.autoFound ? 'rgba(59,130,246,0.1)' : 'rgba(212,168,67,0.1)',
                  color: comp.autoFound ? '#60a5fa' : 'var(--gold)',
                }}
              >
                {comp.autoFound ? 'Auto-found' : 'Manual'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => removeCompetitor(comp.id)}
              className="min-h-[44px] px-2 text-lg"
              style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}
              aria-label="Remove competitor"
            >
              ×
            </button>
          </div>
        ))}

        {competitors.length < 3 && (
          <button
            type="button"
            onClick={addCompetitor}
            className="rounded-lg border border-dashed px-3 py-2 text-left text-xs transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--muted)', cursor: 'pointer' }}
          >
            + Add competitor manually
          </button>
        )}

        <button
          type="button"
          onClick={() => void handleRefind()}
          disabled={finding}
          className="rounded-md border px-3 py-2 text-[11px] font-semibold uppercase tracking-wide transition-opacity disabled:opacity-50"
          style={{
            borderColor: 'var(--border)',
            color: 'var(--silver)',
            cursor: finding ? 'wait' : 'pointer',
            background: 'transparent',
          }}
        >
          {finding ? 'Finding…' : '↻ Re-find competitors (DataForSEO)'}
        </button>
      </div>
    </div>
  );
}
