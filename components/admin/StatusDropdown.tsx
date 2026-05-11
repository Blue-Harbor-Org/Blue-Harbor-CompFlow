'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [status, setStatus] = useState<LeadStatus>(currentStatus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

  const current = statuses.find((s) => s.value === status);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value as LeadStatus;
    const previous = status;
    setError(null);
    setSaving(true);
    setStatus(newStatus);

    try {
      const res = await fetch('/api/lead-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, status: newStatus }),
      });
      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setStatus(previous);
        setError(data.error ?? 'Could not update status');
        return;
      }

      onChange?.(newStatus);
      router.refresh();
    } catch {
      setStatus(previous);
      setError('Network error — try again');
    } finally {
      setSaving(false);
    }
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
      {error && (
        <p className="mt-2 text-xs" style={{ color: 'var(--red)' }}>
          {error}
        </p>
      )}
    </div>
  );
}
