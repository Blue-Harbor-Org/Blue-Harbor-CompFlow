'use client';

import { useState } from 'react';

interface Props {
  leadId: string;
  /** Called after the generate request returns (report may still be processing). */
  onDone?: () => void;
}

export default function GenerateReportButton({ leadId, onDone }: Props) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    await fetch('/api/generate-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId }),
    });
    setLoading(false);
    setDone(true);
    onDone?.();
  }

  return (
    <button
      onClick={handleGenerate}
      disabled={loading || done}
      className="btn-primary w-full py-2.5 text-sm disabled:opacity-60"
    >
      {done ? '✓ Generating — refresh in 60s' : loading ? 'Generating...' : 'Generate Report'}
    </button>
  );
}
