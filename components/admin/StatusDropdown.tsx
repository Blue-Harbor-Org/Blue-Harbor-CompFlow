'use client';

import { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import type { LeadStatus } from '@/types/lead';

const statuses: { value: LeadStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'New', color: 'var(--silver)' },
  { value: 'report_ready', label: 'Report Ready', color: '#6196f0' },
  { value: 'call_booked', label: 'Call Booked 🔥', color: 'var(--gold)' },
  { value: 'unlocked', label: 'Unlocked', color: 'var(--green)' },
  { value: 'proposal_sent', label: 'Proposal Sent', color: '#a78bfa' },
  { value: 'closed_won', label: 'Won ✓', color: 'var(--green)' },
  { value: 'closed_lost', label: 'Lost', color: 'var(--red)' },
];

interface Props {
  leadId: string;
  currentStatus: LeadStatus;
  onChange?: (status: LeadStatus) => void;
}

export default function StatusDropdown({ leadId, currentStatus, onChange }: Props) {
  const [status, setStatus] = useState<LeadStatus>(currentStatus);
  const [saving, setSaving] = useState(false);

  const current = statuses.find((s) => s.value === status);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value as LeadStatus;
    setSaving(true);
    const supabase = createBrowserClient();
    await supabase.from('leads').update({ status: newStatus }).eq('id', leadId);
    setStatus(newStatus);
    onChange?.(newStatus);
    setSaving(false);
  }

  return (
    <div className="relative">
      <select
        value={status}
        onChange={handleChange}
        disabled={saving}
        className="input pr-8 appearance-none"
        style={{
          borderColor: current?.color ?? 'var(--border)',
          color: current?.color ?? 'var(--light)',
        }}
      >
        {statuses.map((s) => (
          <option key={s.value} value={s.value} style={{ background: 'var(--navy2)', color: 'var(--light)' }}>
            {s.label}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--muted)' }}>
        ▾
      </div>
    </div>
  );
}
