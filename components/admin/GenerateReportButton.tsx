'use client';

import { useState } from 'react';

interface Props {
  leadId: string;
  onDone?: () => void;
}

export default function GenerateReportButton({ leadId, onDone }: Props) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function handleGenerate() {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId }),
      });

      const json = await res.json().catch(() => ({ error: 'Failed to generate report' })) as {
        success?: boolean;
        error?: string;
      };

      if (!res.ok || !json.success) {
        throw new Error(json.error ?? 'Failed to generate report');
      }

      setDone(true);
      onDone?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleGenerate}
        disabled={loading || done}
        className="btn-primary w-full py-2.5 text-sm disabled:opacity-60"
      >
        {done ? 'Generating - refresh in 60s' : loading ? 'Generating...' : 'Generate Report'}
      </button>
      {error && (
        <div className="text-xs" style={{ color: '#f87171' }}>
          {error}
        </div>
      )}
    </div>
  );
}
