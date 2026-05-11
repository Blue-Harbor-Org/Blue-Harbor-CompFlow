'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';

interface Props {
  leadId: string;
  field: 'client_intel' | 'competitor_intel';
  initial: string | null;
  label: string;
  placeholder?: string;
}

export default function LeadIntelField({ leadId, field, initial, label, placeholder }: Props) {
  const [value, setValue] = useState(initial ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setValue(initial ?? '');
  }, [initial, leadId]);

  async function handleBlur() {
    setSaving(true);
    const supabase = createBrowserClient();
    await supabase.from('leads').update({ [field]: value }).eq('id', leadId);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="label mb-0">{label}</label>
        {saving && <span className="text-xs" style={{ color: 'var(--muted)' }}>Saving…</span>}
        {saved && <span className="text-xs" style={{ color: 'var(--green)' }}>Saved ✓</span>}
      </div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        rows={4}
        className="input min-h-[100px] resize-none"
        placeholder={placeholder}
      />
    </div>
  );
}
