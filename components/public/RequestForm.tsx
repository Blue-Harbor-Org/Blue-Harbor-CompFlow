'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VERTICAL_OPTIONS } from '@/lib/verticals';

interface FormData {
  contact_name: string;
  business_name: string;
  website_url: string;
  competitor_url: string;
  email: string;
  phone: string;
  industry: string;
}

export default function RequestForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    contact_name: '',
    business_name: '',
    website_url: '',
    competitor_url: '',
    email: '',
    phone: '',
    industry: 'general',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function update(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Step 1: Create the lead
      const submitRes = await fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const submitData = await submitRes.json() as { success: boolean; leadId: string; token: string; error?: string };

      if (!submitData.success || !submitData.leadId) {
        throw new Error(submitData.error || 'Failed to submit form');
      }

      // Redirect to thank-you immediately
      router.push(
        `/get-my-report/thank-you?name=${encodeURIComponent(form.business_name)}&token=${submitData.token}&leadId=${submitData.leadId}`
      );

      // Fire off report generation in the background (don't await)
      fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: submitData.leadId }),
      }).catch(console.error);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  const inputClass =
    'w-full px-4 py-3 rounded-lg text-sm outline-none transition-all';
  const inputStyle = {
    background: 'rgba(13,31,60,0.8)',
    border: '1px solid var(--border)',
    color: 'var(--light)',
  };

  function scrollFieldIntoView(el: HTMLElement) {
    requestAnimationFrame(() => {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
  }

  function handleFieldFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    e.target.style.borderColor = 'var(--border-gold)';
    scrollFieldIntoView(e.target);
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    e.target.style.borderColor = 'var(--border)';
  }

  if (loading) {
    return (
      <div className="card p-10 text-center max-w-lg mx-auto">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 pulse-gold"
          style={{ background: 'var(--gold-dim)', border: '2px solid var(--gold)' }}
        >
          <span style={{ color: 'var(--gold)', fontSize: 28 }}>⟳</span>
        </div>
        <h3 className="font-heading text-2xl mb-2" style={{ color: 'var(--light)' }}>
          Redirecting you now...
        </h3>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Your report is being prepared in the background.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card mx-auto max-w-lg p-6 md:p-10">
      <div className="space-y-5">
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--silver)' }}>
              Your Name *
            </label>
            <input
              type="text"
              name="contact_name"
              autoComplete="name"
              autoCapitalize="words"
              required
              value={form.contact_name}
              onChange={(e) => update('contact_name', e.target.value)}
              className={inputClass}
              style={inputStyle}
              onFocus={handleFieldFocus}
              onBlur={handleBlur}
              placeholder="Jane Smith"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--silver)' }}>
              Business Name *
            </label>
            <input
              type="text"
              name="business_name"
              autoComplete="organization"
              autoCapitalize="words"
              required
              value={form.business_name}
              onChange={(e) => update('business_name', e.target.value)}
              className={inputClass}
              style={inputStyle}
              onFocus={handleFieldFocus}
              onBlur={handleBlur}
              placeholder="Acme Co."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--silver)' }}>
            Your Website URL *
          </label>
          <input
            type="url"
            name="website_url"
            inputMode="url"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
            value={form.website_url}
            onChange={(e) => update('website_url', e.target.value)}
            className={inputClass}
            style={inputStyle}
            onFocus={handleFieldFocus}
            onBlur={handleBlur}
            placeholder="https://yourbusiness.com"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--silver)' }}>
            Your Competitor&apos;s Website URL *
          </label>
          <input
            type="url"
            name="competitor_url"
            inputMode="url"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
            value={form.competitor_url}
            onChange={(e) => update('competitor_url', e.target.value)}
            className={inputClass}
            style={inputStyle}
            onFocus={handleFieldFocus}
            onBlur={handleBlur}
            placeholder="https://competitor.com"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--silver)' }}>
            Your Email *
          </label>
          <input
            type="email"
            name="email"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className={inputClass}
            style={inputStyle}
            onFocus={handleFieldFocus}
            onBlur={handleBlur}
            placeholder="jane@yourbusiness.com"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--silver)' }}>
            Your Phone{' '}
            <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span>
          </label>
          <input
            type="tel"
            name="phone"
            inputMode="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            className={inputClass}
            style={inputStyle}
            onFocus={handleFieldFocus}
            onBlur={handleBlur}
            placeholder="Helpful for scheduling your strategy call"
          />
        </div>

        <div>
          <label
            htmlFor="industry"
            className="block text-sm font-semibold mb-2"
            style={{ color: 'var(--silver)' }}
          >
            Industry
          </label>
          <select
            id="industry"
            value={form.industry}
            onChange={(e) => update('industry', e.target.value)}
            className={inputClass}
            style={inputStyle}
            onFocus={handleFieldFocus}
            onBlur={handleBlur}
          >
            {VERTICAL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="text-xs mt-1.5" style={{ color: 'var(--muted)' }}>
            Shapes how we frame your competitive analysis — same Blue Harbor report, tailored language.
          </p>
        </div>

        {error && (
          <div
            className="text-sm px-4 py-3 rounded-lg"
            style={{
              background: 'rgba(224,80,80,0.1)',
              border: '1px solid rgba(224,80,80,0.3)',
              color: 'var(--red)',
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn-primary min-h-14 w-full py-4 text-base"
        >
          Analyze My Competition →
        </button>

        <p className="text-xs text-center" style={{ color: 'var(--muted)' }}>
          No credit card required. Free. Takes 60 seconds.
        </p>
      </div>
    </form>
  );
}
