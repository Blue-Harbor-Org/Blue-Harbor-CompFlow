'use client';

import { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';

interface Props {
  leadId: string;
  initialNotes: string | null;
}

export default function NotesField({ leadId, initialNotes }: Props) {
  const [notes, setNotes] = useState(initialNotes ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleBlur() {
    setSaving(true);
    const supabase = createBrowserClient();
    await supabase.from('leads').update({ notes }).eq('id', leadId);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="label mb-0">Notes</label>
        {saving && <span className="text-xs" style={{ color: 'var(--muted)' }}>Saving...</span>}
        {saved && <span className="text-xs" style={{ color: 'var(--green)' }}>Saved ✓</span>}
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={handleBlur}
        rows={6}
        className="input min-h-[120px] resize-none"
        placeholder="Add notes about this lead..."
      />
    </div>
  );
}
