'use client';

import { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { VERTICAL_OPTIONS } from '@/lib/verticals';

interface Props {
  leadId: string;
  currentIndustry: string;
}

export default function IndustrySelect({ leadId, currentIndustry }: Props) {
  const [industry, setIndustry] = useState(currentIndustry || 'general');
  const [saving, setSaving] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    setIndustry(next);
    setSaving(true);
    const supabase = createBrowserClient();
    await supabase.from('leads').update({ industry: next }).eq('id', leadId);
    setSaving(false);
  }

  return (
    <div>
      <label
        className="block text-sm font-semibold mb-2"
        style={{ color: 'var(--silver)' }}
      >
        Industry vertical
      </label>
      <select
        id="industry"
        value={industry}
        onChange={handleChange}
        disabled={saving}
        className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
        style={{
          background: 'rgba(13,31,60,0.8)',
          border: '1px solid var(--border)',
          color: 'var(--light)',
        }}
      >
        {VERTICAL_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <p className="text-xs mt-1.5" style={{ color: 'var(--muted)' }}>
        Shapes how the AI writes the report — language, examples, and focus areas.
        Regenerate the report after changing this.
      </p>
    </div>
  );
}
