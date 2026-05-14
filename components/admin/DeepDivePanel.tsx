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
  onAfterMutation?: () => void;
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
  onAfterMutation,
}: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [generating, setGenerating] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState('');

  const base = clientBaseUrl();
  const deepUrl = `${base}/report/${reportToken}/deepdive`;
  const adminPreviewUrl = `${deepUrl}?admin=true`;

  async function handleGenerate(force = false) {
    setGenerating(true);
    setError('');

    try {
      const res = await fetch('/api/generate-deepdive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, force }),
      });

      const json = await res.json().catch(() => ({ error: 'Failed to generate deep dive report' })) as {
        success?: boolean;
        error?: string;
      };

      if (!res.ok || !json.success) {
        throw new Error(json.error ?? 'Failed to generate deep dive report');
      }

      onAfterMutation?.();
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate deep dive report');
    } finally {
      setGenerating(false);
    }
  }

  async function handleUnlock() {
    setUnlocking(true);
    setError('');

    try {
      const res = await fetch('/api/unlock-deepdive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId }),
      });

      const json = await res.json().catch(() => ({ error: 'Failed to unlock deep dive report' })) as {
        success?: boolean;
        error?: string;
      };

      if (!res.ok || !json.success) {
        throw new Error(json.error ?? 'Failed to unlock deep dive report');
      }

      onAfterMutation?.();
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlock deep dive report');
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
  const showGenerate = deepdiveStatus !== 'generating' && !hasDeepData;
  const showRegenerate = hasDeepData && deepdiveStatus !== 'generating';

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
            Deep Dive Report
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            Separate deliverable with multi-page scrape, SEO data, reviews, and admin intel.
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
          Generation in progress. Refresh in a minute.
        </p>
      )}

      {showGenerate && (
        <button
          type="button"
          onClick={() => handleGenerate()}
          disabled={generating}
          className="btn-primary w-full py-3 text-sm disabled:opacity-60"
        >
          {generating ? 'Generating...' : 'Generate Deep Dive Report'}
        </button>
      )}

      {hasDeepData && deepdiveStatus === 'ready' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button
            type="button"
            onClick={handleUnlock}
            disabled={unlocking}
            className="btn-primary min-w-[140px] flex-1 py-3 text-sm disabled:opacity-60"
          >
            {unlocking ? 'Unlocking...' : 'Unlock + Send to Client'}
          </button>
          <button
            type="button"
            onClick={() => window.open(adminPreviewUrl, '_blank')}
            className="btn-ghost min-w-[140px] flex-1 py-3 text-sm"
          >
            Preview
          </button>
        </div>
      )}

      {(deepdiveStatus === 'unlocked' || deepdiveStatus === 'viewed') && hasDeepData && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <button type="button" onClick={copyLink} className="btn-ghost py-3 text-sm">
            Copy Deep Dive Link
          </button>
          <button
            type="button"
            onClick={() => window.open(adminPreviewUrl, '_blank')}
            className="btn-ghost py-3 text-sm"
          >
            View Report
          </button>
          {deepdiveStatus === 'viewed' && deepdiveViewedAt && (
            <span style={{ color: 'var(--green)', fontSize: 12 }}>
              Client viewed {new Date(deepdiveViewedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      )}

      {showRegenerate && (
        <div style={{ marginTop: 12 }}>
          <button
            type="button"
            onClick={() => handleGenerate(true)}
            disabled={generating}
            className="btn-ghost w-full py-2.5 text-sm disabled:opacity-60"
            style={{ color: 'var(--muted)', borderStyle: 'dashed' }}
          >
            {generating ? 'Regenerating...' : 'Regenerate'}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-3 text-sm" style={{ color: '#f87171' }}>
          {error}
        </div>
      )}
    </div>
  );
}
