'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VERTICAL_OPTIONS } from '@/lib/verticals';

interface FormData {
  contact_name: string;
  business_name: string;
  email: string;
  phone: string;
  website_url: string;
  competitor_url: string;
  competitor_name: string;
  notes: string;
  unlock_immediately: boolean;
  industry: string;
}

export default function ManualLeadForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    contact_name: '',
    business_name: '',
    email: '',
    phone: '',
    website_url: '',
    competitor_url: '',
    competitor_name: '',
    notes: '',
    unlock_immediately: false,
    industry: 'general',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function update<K extends keyof FormData>(field: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create lead
      const res = await fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source: 'manual' }),
      });

      const data = await res.json() as { success: boolean; leadId: string; token: string; error?: string };

      if (!data.success || !data.leadId) {
        throw new Error(data.error ?? 'Failed to create lead');
      }

      // Fire off report generation
      fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: data.leadId }),
      }).catch(console.error);

      router.push(`/dashboard/leads/${data.leadId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  }

  const inputClass = 'w-full px-4 py-3 rounded-lg text-sm outline-none';
  const inputStyle = {
    background: 'rgba(13,31,60,0.8)',
    border: '1px solid var(--border)',
    color: 'var(--light)',
  };

  function handleFocus(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    e.target.style.borderColor = 'var(--border-gold)';
  }
  function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    e.target.style.borderColor = 'var(--border)';
  }

  return (
    <form onSubmit={handleSubmit} className="card p-8 space-y-5">
      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--silver)' }}>
            Contact Name *
          </label>
          <input
            type="text" required value={form.contact_name}
            onChange={(e) => update('contact_name', e.target.value)}
            className={inputClass} style={inputStyle}
            onFocus={handleFocus} onBlur={handleBlur}
            placeholder="Jane Smith"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--silver)' }}>
            Business Name *
          </label>
          <input
            type="text" required value={form.business_name}
            onChange={(e) => update('business_name', e.target.value)}
            className={inputClass} style={inputStyle}
            onFocus={handleFocus} onBlur={handleBlur}
            placeholder="Acme Co."
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--silver)' }}>
            Email *
          </label>
          <input
            type="email" required value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className={inputClass} style={inputStyle}
            onFocus={handleFocus} onBlur={handleBlur}
            placeholder="jane@business.com"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--silver)' }}>
            Phone
          </label>
          <input
            type="tel" value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            className={inputClass} style={inputStyle}
            onFocus={handleFocus} onBlur={handleBlur}
            placeholder="(555) 000-0000"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--silver)' }}>
          Their Website URL *
        </label>
        <input
          type="url" required value={form.website_url}
          onChange={(e) => update('website_url', e.target.value)}
          className={inputClass} style={inputStyle}
          onFocus={handleFocus} onBlur={handleBlur}
          placeholder="https://theirbusiness.com"
        />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--silver)' }}>
            Competitor URL *
          </label>
          <input
            type="url" required value={form.competitor_url}
            onChange={(e) => update('competitor_url', e.target.value)}
            className={inputClass} style={inputStyle}
            onFocus={handleFocus} onBlur={handleBlur}
            placeholder="https://competitor.com"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--silver)' }}>
            Competitor Name
          </label>
          <input
            type="text" value={form.competitor_name}
            onChange={(e) => update('competitor_name', e.target.value)}
            className={inputClass} style={inputStyle}
            onFocus={handleFocus} onBlur={handleBlur}
            placeholder="Competitor Co."
          />
        </div>
      </div>

      <div>
        <label htmlFor="industry" className="block text-sm font-semibold mb-2" style={{ color: 'var(--silver)' }}>
          Industry vertical
        </label>
        <select
          id="industry"
          value={form.industry}
          onChange={(e) => update('industry', e.target.value)}
          className={inputClass}
          style={inputStyle}
        >
          {VERTICAL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <p className="text-xs mt-1.5" style={{ color: 'var(--muted)' }}>
          Shapes how the AI writes the report — language, examples, and focus areas.
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--silver)' }}>
          Notes
        </label>
        <textarea
          value={form.notes}
          onChange={(e) => update('notes', e.target.value)}
          rows={3}
          className="w-full px-4 py-3 rounded-lg text-sm outline-none resize-none"
          style={inputStyle}
          onFocus={handleFocus} onBlur={handleBlur}
          placeholder="Add any notes about this lead..."
        />
      </div>

      {/* Unlock toggle */}
      <div
        className="flex items-center gap-3 p-4 rounded-lg cursor-pointer"
        style={{
          background: form.unlock_immediately ? 'var(--gold-dim)' : 'rgba(13,31,60,0.5)',
          border: `1px solid ${form.unlock_immediately ? 'var(--border-gold)' : 'var(--border)'}`,
        }}
        onClick={() => update('unlock_immediately', !form.unlock_immediately)}
      >
        <div
          className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
          style={{
            background: form.unlock_immediately ? 'var(--gold)' : 'transparent',
            border: `2px solid ${form.unlock_immediately ? 'var(--gold)' : 'var(--muted)'}`,
          }}
        >
          {form.unlock_immediately && <span style={{ color: 'var(--navy)', fontSize: 10 }}>✓</span>}
        </div>
        <div>
          <div className="text-sm font-semibold" style={{ color: form.unlock_immediately ? 'var(--gold)' : 'var(--silver)' }}>
            Skip teaser — unlock report immediately
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
            For warm leads who don&apos;t need gating
          </div>
        </div>
      </div>

      {error && (
        <div
          className="text-sm px-4 py-3 rounded-lg"
          style={{ background: 'rgba(224,80,80,0.1)', border: '1px solid rgba(224,80,80,0.3)', color: 'var(--red)' }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full py-4 text-sm disabled:opacity-60"
      >
        {loading ? 'Creating lead + generating report...' : 'Create Lead + Generate Report →'}
      </button>
    </form>
  );
}
