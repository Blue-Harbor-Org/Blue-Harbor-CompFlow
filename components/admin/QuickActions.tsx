'use client';

import { useEffect, useRef, useState } from 'react';
import type { Lead, LeadStatus } from '@/types/lead';
import type { Report } from '@/types/report';
import { getPublicSiteUrl } from '@/lib/siteUrl';
import { STATUS_STYLES } from '@/components/admin/statusStyles';

const STATUSES = Object.keys(STATUS_STYLES) as LeadStatus[];

interface Props {
  lead: Lead;
  standardReport: Report | null;
  deepReport: Report | null;
  onUnlockReport: () => Promise<void>;
  onUnlockDeepDive?: () => Promise<void>;
  onGenerateDeepDive?: () => Promise<void>;
  onStatusChange: (status: LeadStatus) => Promise<void> | void;
  onDeleted?: () => void;
  compact?: boolean;
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    console.warn('Clipboard unavailable');
  }
}

export default function QuickActions({
  lead,
  standardReport,
  deepReport,
  onUnlockReport,
  onUnlockDeepDive,
  onGenerateDeepDive,
  onStatusChange,
  onDeleted,
  compact,
}: Props) {
  const base = getPublicSiteUrl();
  const teaserUrl = `${base}/report/${lead.report_token}`;
  const fullUrl = `${base}/report/${lead.report_token}/full?admin=true`;
  const deepUrl = `${base}/report/${lead.report_token}/deepdive`;

  const [unlockReportConfirm, setUnlockReportConfirm] = useState(false);
  const [unlockDeepConfirm, setUnlockDeepConfirm] = useState(false);
  const [unlockingR, setUnlockingR] = useState(false);
  const [unlockingD, setUnlockingD] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!unlockReportConfirm) return;
    const t = setTimeout(() => setUnlockReportConfirm(false), 5000);
    return () => clearTimeout(t);
  }, [unlockReportConfirm]);

  useEffect(() => {
    if (!unlockDeepConfirm) return;
    const t = setTimeout(() => setUnlockDeepConfirm(false), 5000);
    return () => clearTimeout(t);
  }, [unlockDeepConfirm]);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (!moreRef.current?.contains(e.target as Node)) setMoreOpen(false);
    }
    if (moreOpen) document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [moreOpen]);

  const stdUnlocked = Boolean(standardReport?.is_unlocked);
  const hasDeepData = Boolean(deepReport?.report_data);
  const dd = lead.deepdive_status;

  const showUnlockReport = Boolean(standardReport && !stdUnlocked);

  const showCopyFull = stdUnlocked;

  const showGenDeep = dd !== 'generating' && !hasDeepData && onGenerateDeepDive;

  const showUnlockDeep =
    hasDeepData && dd === 'ready' && onUnlockDeepDive;

  const showCopyDeep =
    hasDeepData && (dd === 'unlocked' || dd === 'viewed');

  const btnBase =
    'inline-flex min-h-[44px] items-center justify-center gap-1 rounded-lg px-2.5 text-xs font-semibold transition-colors duration-150';
  const btnGhost = `${btnBase} border border-transparent hover:bg-white/5`;
  const btnGold = `${btnBase} btn-primary px-3`;

  async function handleDelete() {
    if (!window.confirm(`Delete lead “${lead.business_name}”? This cannot be undone.`)) return;
    const res = await fetch('/api/leads/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId: lead.id }),
    });
    if (res.ok) onDeleted?.();
  }

  async function runUnlockReport() {
    if (!unlockReportConfirm) {
      setUnlockReportConfirm(true);
      return;
    }
    setUnlockingR(true);
    try {
      await onUnlockReport();
    } finally {
      setUnlockingR(false);
      setUnlockReportConfirm(false);
    }
  }

  async function runUnlockDeep() {
    if (!unlockDeepConfirm) {
      setUnlockDeepConfirm(true);
      return;
    }
    setUnlockingD(true);
    try {
      await onUnlockDeepDive?.();
    } finally {
      setUnlockingD(false);
      setUnlockDeepConfirm(false);
    }
  }

  return (
    <div
      className={`flex flex-wrap items-center gap-1 ${compact ? 'justify-end' : ''}`}
      onClick={(e) => e.stopPropagation()}
    >
      <a
        href={teaserUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={btnGhost}
        style={{ color: 'var(--silver)' }}
      >
        👁 {!compact && 'Teaser'}
      </a>

      {showUnlockReport && (
        <div className="flex flex-col gap-1">
          {unlockReportConfirm && (
            <div
              className="rounded-lg px-2 py-2 text-[11px] leading-snug"
              style={{
                background: 'var(--gold-dim)',
                border: '1px solid var(--border-gold)',
                color: 'var(--gold)',
                maxWidth: compact ? 160 : 260,
              }}
            >
              Send unlock email to {lead.email}?
              <div className="mt-2 flex gap-2">
                <button type="button" className="btn-primary flex-1 py-1.5 text-[11px]" onClick={runUnlockReport} disabled={unlockingR}>
                  {unlockingR ? '…' : 'Confirm'}
                </button>
                <button
                  type="button"
                  className="btn-ghost flex-1 py-1.5 text-[11px]"
                  onClick={() => setUnlockReportConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          <button
            type="button"
            className={unlockReportConfirm ? btnGhost : btnGold}
            style={unlockReportConfirm ? { color: 'var(--gold)', borderColor: 'var(--border-gold)' } : undefined}
            onClick={runUnlockReport}
            disabled={unlockingR}
          >
            🔓 {!compact && 'Unlock'}
          </button>
        </div>
      )}

      {showCopyFull && (
        <button type="button" className={btnGhost} style={{ color: 'var(--silver)' }} onClick={() => copyText(fullUrl)}>
          📋 {!compact && 'Report'}
        </button>
      )}

      {showGenDeep && (
        <button
          type="button"
          className={btnGhost}
          style={{ color: 'var(--silver)' }}
          onClick={() => onGenerateDeepDive?.()}
        >
          🔬 {!compact && 'Deep dive'}
        </button>
      )}

      {showUnlockDeep && (
        <div className="flex flex-col gap-1">
          {unlockDeepConfirm && (
            <div
              className="rounded-lg px-2 py-2 text-[11px]"
              style={{
                background: 'var(--gold-dim)',
                border: '1px solid var(--border-gold)',
                color: 'var(--gold)',
                maxWidth: compact ? 160 : 260,
              }}
            >
              Send deep dive unlock to {lead.email}?
              <div className="mt-2 flex gap-2">
                <button type="button" className="btn-primary flex-1 py-1.5 text-[11px]" onClick={runUnlockDeep} disabled={unlockingD}>
                  {unlockingD ? '…' : 'Confirm'}
                </button>
                <button type="button" className="btn-ghost flex-1 py-1.5 text-[11px]" onClick={() => setUnlockDeepConfirm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
          <button
            type="button"
            className={unlockDeepConfirm ? btnGhost : btnGold}
            onClick={runUnlockDeep}
            disabled={unlockingD}
          >
            🔓 {!compact && 'Deep'}
          </button>
        </div>
      )}

      {showCopyDeep && (
        <button type="button" className={btnGhost} style={{ color: 'var(--silver)' }} onClick={() => copyText(deepUrl)}>
          📋 {!compact && 'Deep link'}
        </button>
      )}

      <div className="relative" ref={moreRef}>
        <button
          type="button"
          className={`${btnGhost} min-w-[44px] px-2`}
          style={{ color: 'var(--muted)' }}
          aria-expanded={moreOpen}
          onClick={() => setMoreOpen((o) => !o)}
        >
          ···
        </button>
        {moreOpen && (
          <div
            className="absolute right-0 z-[80] mt-1 min-w-[220px] rounded-xl border py-2 shadow-xl"
            style={{
              background: 'var(--navy2)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Change status
            </div>
            <div className="max-h-48 overflow-y-auto">
              {STATUSES.map((st) => (
                <button
                  key={st}
                  type="button"
                  className="flex w-full min-h-[40px] items-center px-3 py-2 text-left text-xs hover:bg-white/5"
                  style={{ color: 'var(--light)' }}
                  onClick={async () => {
                    setMoreOpen(false);
                    await onStatusChange(st);
                  }}
                >
                  {STATUS_STYLES[st].label}
                </button>
              ))}
            </div>
            <div style={{ borderTop: '1px solid var(--border)' }} className="my-2" />
            <button
              type="button"
              className="flex w-full min-h-[40px] items-center px-3 py-2 text-xs hover:bg-white/5"
              style={{ color: 'var(--light)' }}
              onClick={() => {
                copyText(teaserUrl);
                setMoreOpen(false);
              }}
            >
              Copy teaser link
            </button>
            <button
              type="button"
              className="flex w-full min-h-[40px] items-center px-3 py-2 text-xs hover:bg-white/5"
              style={{ color: 'var(--light)' }}
              onClick={() => {
                copyText(fullUrl);
                setMoreOpen(false);
              }}
            >
              Copy full report link
            </button>
            <button
              type="button"
              className="flex w-full min-h-[40px] items-center px-3 py-2 text-xs hover:bg-white/5"
              style={{ color: 'var(--green)' }}
              onClick={async () => {
                setMoreOpen(false);
                await onStatusChange('closed_won');
              }}
            >
              Mark as Won ✓
            </button>
            <button
              type="button"
              className="flex w-full min-h-[40px] items-center px-3 py-2 text-xs hover:bg-white/5"
              style={{ color: 'var(--red)' }}
              onClick={async () => {
                setMoreOpen(false);
                await onStatusChange('closed_lost');
              }}
            >
              Mark as Lost ✗
            </button>
            <button
              type="button"
              className="flex w-full min-h-[40px] items-center px-3 py-2 text-xs hover:bg-white/5"
              style={{ color: 'var(--red)' }}
              onClick={() => {
                setMoreOpen(false);
                void handleDelete();
              }}
            >
              Delete lead…
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
