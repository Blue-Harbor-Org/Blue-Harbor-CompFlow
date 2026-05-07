'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Lead } from '@/types/lead';

interface Props {
  lead: Lead;
  onUnlock?: (leadId: string) => Promise<void>;
  onRefresh?: () => void;
}

const sourceBadge = {
  public_form: { label: 'PUBLIC', color: 'var(--silver)', bg: 'rgba(143,168,200,0.1)' },
  manual: { label: 'MANUAL', color: 'var(--gold)', bg: 'rgba(212,168,67,0.1)' },
};

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  const mins = Math.floor(diff / 60000);
  return `${mins}m ago`;
}

export default function LeadCard({ lead, onUnlock, onRefresh }: Props) {
  const [unlocking, setUnlocking] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const src = sourceBadge[lead.source] ?? sourceBadge.public_form;

  async function handleUnlock() {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }
    setUnlocking(true);
    setShowConfirm(false);
    try {
      await onUnlock?.(lead.id);
      onRefresh?.();
    } finally {
      setUnlocking(false);
    }
  }

  return (
    <div
      className="card p-4 text-sm flex flex-col gap-3"
      style={{ background: 'rgba(9,20,40,0.7)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div
            className="font-heading text-base font-bold leading-tight"
            style={{ color: 'var(--light)' }}
          >
            {lead.business_name}
          </div>
          {lead.competitor_name && (
            <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
              vs {lead.competitor_name}
            </div>
          )}
        </div>
        <span
          className="badge flex-shrink-0"
          style={{ background: src.bg, color: src.color, border: `1px solid ${src.color}30` }}
        >
          {src.label}
        </span>
      </div>

      {/* Contact */}
      <div>
        <div className="text-xs" style={{ color: 'var(--silver)' }}>
          {lead.contact_name}
        </div>
        <a
          href={`mailto:${encodeURIComponent(lead.email)}`}
          className="block min-h-[44px] py-2 text-xs underline-offset-2 hover:underline"
          style={{ color: 'var(--muted)' }}
        >
          {lead.email}
        </a>
        {lead.phone && (
          <a
            href={`tel:${lead.phone.replace(/\s/g, '')}`}
            className="block min-h-[44px] py-2 text-xs underline-offset-2 hover:underline"
            style={{ color: 'var(--muted)' }}
          >
            {lead.phone}
          </a>
        )}
      </div>

      {/* Time */}
      <div className="text-xs" style={{ color: 'var(--muted)' }}>
        {timeAgo(lead.created_at)}
      </div>

      {/* Confirm unlock */}
      {showConfirm && (
        <div
          className="rounded-lg p-3 text-xs"
          style={{
            background: 'var(--gold-dim)',
            border: '1px solid var(--border-gold)',
            color: 'var(--gold)',
          }}
        >
          Unlock &amp; email <strong>{lead.email}</strong>?
          <div className="flex gap-2 mt-2.5">
            <button
              type="button"
              onClick={handleUnlock}
              className="btn-primary flex-1 py-1.5 text-xs"
            >
              Yes — Unlock
            </button>
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              className="btn-ghost flex-1 py-1.5 text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="tap-row flex gap-2 pt-1" style={{ borderTop: '1px solid var(--border)' }}>
        <Link
          href={`/dashboard/leads/${lead.id}`}
          className="btn-ghost flex-1 py-2.5 text-xs"
        >
          View Details
        </Link>
        <button
          type="button"
          onClick={handleUnlock}
          disabled={unlocking}
          className="btn-primary flex-1 py-2.5 text-xs"
        >
          {unlocking ? '…' : '🔓 Unlock'}
        </button>
      </div>
    </div>
  );
}
