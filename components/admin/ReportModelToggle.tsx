'use client';

import { useEffect, useState } from 'react';
import type { ReportModelKey } from '@/lib/reportModel';

export default function ReportModelToggle() {
  const [model, setModel] = useState<ReportModelKey>('haiku');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/report-model')
      .then((r) => r.json() as Promise<{ model: ReportModelKey }>)
      .then((d) => setModel(d.model === 'sonnet' ? 'sonnet' : 'haiku'))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function toggle(next: ReportModelKey) {
    if (next === model) return;
    setSaving(true);
    try {
      const res = await fetch('/api/report-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: next }),
      });
      if (res.ok) setModel(next);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="px-3 py-2 text-xs" style={{ color: 'var(--muted)' }}>
        AI model…
      </div>
    );
  }

  return (
    <div className="px-3 py-3 mb-2 rounded-lg" style={{ border: '1px solid var(--border)' }}>
      <div className="text-xs font-semibold mb-2" style={{ color: 'var(--silver)' }}>
        Report AI model
      </div>
      <div className="flex rounded-md overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <button
          type="button"
          disabled={saving}
          onClick={() => toggle('haiku')}
          className="flex-1 py-2 text-xs font-semibold transition-colors"
          style={{
            background: model === 'haiku' ? 'var(--gold-dim)' : 'transparent',
            color: model === 'haiku' ? 'var(--gold)' : 'var(--muted)',
          }}
        >
          Haiku
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => toggle('sonnet')}
          className="flex-1 py-2 text-xs font-semibold transition-colors"
          style={{
            background: model === 'sonnet' ? 'var(--gold-dim)' : 'transparent',
            color: model === 'sonnet' ? 'var(--gold)' : 'var(--muted)',
          }}
        >
          Sonnet
        </button>
      </div>
      <p className="text-[11px] mt-2 leading-snug" style={{ color: 'var(--muted)' }}>
        Haiku: faster & cheaper. Sonnet: deeper analysis. Applies to reports you generate while logged in.
      </p>
    </div>
  );
}
