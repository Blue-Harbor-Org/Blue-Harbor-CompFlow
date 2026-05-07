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
          className="text-xs font-bold px-2 py-0.5 rounded flex-shrink-0"
          style={{ background: src.bg, color: src.color }}
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
          className="text-xs p-2 rounded"
          style={{
            background: 'rgba(212,168,67,0.1)',
            border: '1px solid var(--border-gold)',
            color: 'var(--gold)',
          }}
        >
          Unlock report for {lead.business_name} and send email to {lead.email}?
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleUnlock}
              className="px-3 py-1 rounded text-xs font-bold"
              style={{ background: 'var(--gold)', color: 'var(--navy)' }}
            >
              Confirm
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="px-3 py-1 rounded text-xs"
              style={{ color: 'var(--muted)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="tap-row flex gap-1 pt-1" style={{ borderTop: '1px solid var(--border)' }}>
        <Link
          href={`/dashboard/leads/${lead.id}`}
          className="flex-1 rounded py-3 text-center text-xs font-medium transition-colors md:py-1.5"
          style={{ color: 'var(--silver)', background: 'rgba(143,168,200,0.08)' }}
        >
          👁 View
        </Link>
        <button
          type="button"
          onClick={handleUnlock}
          disabled={unlocking}
          className="flex-1 rounded py-3 text-xs font-medium transition-colors md:py-1.5"
          style={{
            color: 'var(--gold)',
            background: 'var(--gold-dim)',
            opacity: unlocking ? 0.6 : 1,
          }}
        >
          {unlocking ? '...' : '🔓 Unlock'}
        </button>
        <Link
          href={`/dashboard/leads/${lead.id}`}
          className="flex-1 rounded py-3 text-center text-xs font-medium transition-colors md:py-1.5"
          style={{ color: 'var(--muted)', background: 'rgba(90,114,148,0.1)' }}
        >
          ✏ Edit
        </Link>
      </div>
    </div>
  );
}
