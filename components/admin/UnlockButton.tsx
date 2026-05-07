'use client';

import { useState } from 'react';

interface Props {
  leadId: string;
  email: string;
  businessName: string;
  onSuccess?: () => void;
}

export default function UnlockButton({ leadId, email, businessName, onSuccess }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function handleUnlock() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/unlock-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId }),
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (!data.success) throw new Error(data.error ?? 'Failed');
      setDone(true);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  }

  if (done) {
    return (
      <div
        className="px-6 py-4 rounded-lg text-sm font-semibold text-center"
        style={{ background: 'rgba(46,204,138,0.1)', color: 'var(--green)', border: '1px solid rgba(46,204,138,0.3)' }}
      >
        ✓ Report unlocked · Email sent to {email}
      </div>
    );
  }

  return (
    <div>
      {confirming && (
        <div
          className="text-sm px-4 py-3 rounded-lg mb-3"
          style={{
            background: 'var(--gold-dim)',
            border: '1px solid var(--border-gold)',
            color: 'var(--gold)',
          }}
        >
          Unlock full report for <strong>{businessName}</strong> and send email to <strong>{email}</strong>?
        </div>
      )}

      {error && (
        <div className="text-sm text-red-400 mb-2">{error}</div>
      )}

      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap">
        <button
          type="button"
          onClick={handleUnlock}
          disabled={loading}
          className="btn-primary min-h-14 w-full flex-1 py-4 text-sm disabled:opacity-60 md:min-h-0 md:py-3"
        >
          {loading
            ? 'Unlocking...'
            : confirming
            ? 'Yes — Unlock + Send Email'
            : `Unlock Full Report + Send Email to ${email}`}
        </button>
        {confirming && (
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="btn-ghost min-h-12 w-full px-4 py-3 text-sm md:min-h-0 md:w-auto"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
