'use client';

import { useState } from 'react';

type CmsField = {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'tel' | 'email' | 'url';
};

const CMS_FIELDS: CmsField[] = [
  { key: 'business_name', label: 'Business Name', type: 'text' },
  { key: 'tagline', label: 'Hero Tagline', type: 'text' },
  { key: 'phone', label: 'Phone Number', type: 'tel' },
  { key: 'email', label: 'Email Address', type: 'email' },
  { key: 'address', label: 'Business Address', type: 'text' },
  { key: 'hours', label: 'Business Hours', type: 'text' },
  { key: 'service_area', label: 'Service Area', type: 'text' },
  { key: 'about_blurb', label: 'About Us (short)', type: 'textarea' },
  { key: 'cta_text', label: 'Primary CTA Button Text', type: 'text' },
  { key: 'founded_year', label: 'Year Founded', type: 'text' },
];

interface Props {
  buildoutId: string;
  initialData: Record<string, string>;
  onSaved: (data: Record<string, string>) => void;
}

export function CmsEditor({ buildoutId, initialData, onSaved }: Props) {
  const [data, setData] = useState<Record<string, string>>(initialData);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/dashboard/buildout/cms', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buildoutId, cmsData: data }),
      });
      if (res.ok) {
        setSaved(true);
        onSaved(data);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--light)' }}>
            Edit Site Content
          </h3>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--muted)' }}>
            Changes here will update saved CMS data for the live site.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="rounded-lg px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
          style={{ background: 'var(--gold)', color: 'var(--navy)' }}
        >
          {saving ? 'Saving...' : saved ? 'Saved' : 'Save Changes'}
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {CMS_FIELDS.map((field) => (
          <div key={field.key}>
            <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--muted)' }}>
              {field.label}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                value={data[field.key] ?? ''}
                onChange={(event) => setData((prev) => ({ ...prev, [field.key]: event.target.value }))}
                rows={3}
                className="input w-full resize-none text-sm"
              />
            ) : (
              <input
                type={field.type}
                value={data[field.key] ?? ''}
                onChange={(event) => setData((prev) => ({ ...prev, [field.key]: event.target.value }))}
                className="input w-full text-sm"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
