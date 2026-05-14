'use client';

import { useCallback, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';

interface Props {
  leadId: string;
  field: 'client_intel' | 'competitor_intel';
  initial: string | null;
  label: string;
  placeholder?: string;
}

export default function LeadIntelField({ leadId, field, initial, label, placeholder }: Props) {
  const initialValue = initial ?? '';
  const [draft, setDraft] = useState({
    leadId,
    initialValue,
    value: initialValue,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const value =
    draft.leadId === leadId && draft.initialValue === initialValue
      ? draft.value
      : initialValue;
  const setValue = useCallback((nextValue: string) => {
    setDraft({ leadId, initialValue, value: nextValue });
  }, [initialValue, leadId]);

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
