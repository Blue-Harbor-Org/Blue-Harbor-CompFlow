'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';
import { VERTICAL_OPTIONS } from '@/lib/verticals';

interface Props {
  leadId: string;
  currentIndustry: string;
}

export default function LeadIndustryRegenerate({ leadId, currentIndustry }: Props) {
  const router = useRouter();
  const [industry, setIndustry] = useState(currentIndustry || 'general');
  const [regenerating, setRegenerating] = useState(false);
  const [, startTransition] = useTransition();

  return (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{ fontSize: 13, color: 'var(--silver)', marginBottom: 6, display: 'block' }}
      >
        Industry Vertical
      </label>
      <select
        value={industry}
        onChange={async (e) => {
          const newIndustry = e.target.value;
          setIndustry(newIndustry);
          const supabase = createBrowserClient();
          await supabase.from('leads').update({ industry: newIndustry }).eq('id', leadId);
        }}
        style={{
          width: '100%',
          padding: '10px 14px',
          background: 'var(--navy3)',
          border: '1px solid var(--border)',
          borderRadius: 6,
          color: 'var(--light)',
          fontSize: 14,
        }}
      >
        {VERTICAL_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
        Changing this and regenerating the report will update the AI tone and analysis focus.
      </p>

      <button
        type="button"
        onClick={async () => {
          setRegenerating(true);
          try {
            await fetch('/api/generate-report', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ leadId, regenerate: true }),
            });
            startTransition(() => {
              router.refresh();
            });
          } finally {
            setRegenerating(false);
          }
        }}
        disabled={regenerating}
        style={{
          marginTop: 12,
          width: '100%',
          padding: '10px 0',
          background: 'transparent',
          border: '1px solid var(--border-gold)',
          borderRadius: 6,
          color: 'var(--gold)',
          fontSize: 13,
          fontWeight: 600,
          cursor: regenerating ? 'not-allowed' : 'pointer',
          opacity: regenerating ? 0.6 : 1,
          letterSpacing: '0.5px',
        }}
      >
        {regenerating ? 'Regenerating...' : '↻ Regenerate Report with New Vertical'}
      </button>
    </div>
  );
}
