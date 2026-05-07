'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Report } from '@/types/report';

interface Props {
  leadId: string;
  reportToken: string;
  deepdiveStatus: string | null;
  deepdiveViewedAt: string | null;
  deepReport: Report | null;
}

function clientBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? '';
}

export default function DeepDivePanel({
  leadId,
  reportToken,
  deepdiveStatus,
  deepdiveViewedAt,
  deepReport,
}: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [generating, setGenerating] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  const base = clientBaseUrl();
  const deepUrl = `${base}/report/${reportToken}/deepdive`;
  const adminPreviewUrl = `${deepUrl}?admin=true`;

  async function handleGenerate(force = false) {
    setGenerating(true);
    try {
      await fetch('/api/generate-deepdive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, force }),
      });
      startTransition(() => router.refresh());
    } finally {
      setGenerating(false);
    }
  }

  async function handleUnlock() {
    setUnlocking(true);
    try {
      await fetch('/api/unlock-deepdive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId }),
      });
      startTransition(() => router.refresh());
    } finally {
      setUnlocking(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(deepUrl);
    } catch {
      console.warn('Clipboard unavailable');
    }
  }

  const hasDeepData = Boolean(deepReport?.report_data);
  const showGenerate =
    deepdiveStatus !== 'generating' && !hasDeepData;

  return (
    <div
      style={{
        background: 'var(--navy3)',
        border: '1px solid var(--border-gold)',
        borderRadius: 10,
        padding: '20px 24px',
        marginTop: 20,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gold)' }}>
            🔬 Deep Dive Report
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            Separate deliverable — multi-page scrape, SEO data, reviews, admin intel
          </div>
        </div>
        {deepdiveStatus && (
          <span
            style={{
              fontSize: 11,
              padding: '3px 10px',
              borderRadius: 12,
              background:
                deepdiveStatus === 'unlocked' || deepdiveStatus === 'viewed'
                  ? 'rgba(46,204,138,0.15)'
                  : 'rgba(212,168,67,0.15)',
              color:
                deepdiveStatus === 'unlocked' || deepdiveStatus === 'viewed'
                  ? 'var(--green)'
                  : 'var(--gold)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {deepdiveStatus}
          </span>
        )}
      </div>

      {deepdiveStatus === 'generating' && (
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>
          Generation in progress… refresh in a minute.
        </p>
      )}

      {showGenerate && (
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="btn-primary w-full py-3 text-sm disabled:opacity-60"
        >
          {generating ? 'Generating...' : '🔬 Generate Deep Dive Report'}
        </button>
      )}

      {hasDeepData && deepdiveStatus === 'ready' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button
            type="button"
            onClick={handleUnlock}
            disabled={unlocking}
            className="btn-primary flex-1 min-w-[140px] py-3 text-sm disabled:opacity-60"
          >
            {unlocking ? 'Unlocking...' : '🔓 Unlock + Send to Client'}
          </button>
          <button
            type="button"
            onClick={() => window.open(adminPreviewUrl, '_blank')}
            className="btn-ghost flex-1 min-w-[140px] py-3 text-sm"
          >
            👁 Preview
          </button>
          <button
            type="button"
            onClick={() => handleGenerate(true)}
            disabled={generating}
            className="btn-ghost w-full py-2 text-xs disabled:opacity-60"
            style={{ color: 'var(--muted)' }}
          >
            {generating ? 'Regenerating...' : '🔄 Regenerate Report'}
          </button>
        </div>
      )}

      {(deepdiveStatus === 'unlocked' || deepdiveStatus === 'viewed') && hasDeepData && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <button type="button" onClick={copyLink} className="btn-ghost py-3 text-sm">
            📋 Copy Deep Dive Link
          </button>
          <button
            type="button"
            onClick={() => window.open(adminPreviewUrl, '_blank')}
            className="btn-ghost py-3 text-sm"
          >
            👁 View Report
          </button>
          <button
            type="button"
            onClick={() => handleGenerate(true)}
            disabled={generating}
            className="btn-ghost py-3 text-xs disabled:opacity-60"
            style={{ color: 'var(--muted)' }}
          >
            {generating ? 'Regenerating...' : '🔄 Regenerate'}
          </button>
          {deepdiveStatus === 'viewed' && deepdiveViewedAt && (
            <span style={{ color: 'var(--green)', fontSize: 12 }}>
              ✓ Client viewed{' '}
              {new Date(deepdiveViewedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
