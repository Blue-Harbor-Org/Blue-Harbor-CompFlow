'use client';

import { IntakeFormData } from '@/types/intake';

interface Props {
  data: IntakeFormData;
  onChange: (updates: Partial<IntakeFormData>) => void;
}

export default function StepContactInfo({ data, onChange }: Props) {
  return (
    <div className="space-y-6 fade-up">
      <div>
        <h2 className="font-heading text-2xl sm:text-3xl mb-1" style={{ color: 'var(--gold)' }}>
          Contact &amp; Office Info
        </h2>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          How should clients and partners reach your team?
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="label">Office Phone</label>
          <input
            type="tel"
            className="input"
            value={data.office_phone}
            onChange={(e) => onChange({ office_phone: e.target.value })}
            placeholder="(555) 123-4567"
          />
        </div>

        <div>
          <label className="label">Working Contact Email</label>
          <input
            type="email"
            className="input"
            value={data.contact_email}
            onChange={(e) => onChange({ contact_email: e.target.value })}
            placeholder="info@yourcompany.com"
          />
        </div>

        <div>
          <label className="label">Physical Address</label>
          <textarea
            className="input"
            rows={2}
            value={data.physical_address}
            onChange={(e) => onChange({ physical_address: e.target.value })}
            placeholder="123 Main St, Suite 200, New York, NY 10001"
            style={{ resize: 'vertical' }}
          />
        </div>

        <div className="gold-divider my-2" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">John&apos;s Cell</label>
            <input
              type="tel"
              className="input"
              value={data.john_cell}
              onChange={(e) => onChange({ john_cell: e.target.value })}
              placeholder="(555) 000-0000"
            />
          </div>
          <div>
            <label className="label">Craig&apos;s Cell</label>
            <input
              type="tel"
              className="input"
              value={data.craig_cell}
              onChange={(e) => onChange({ craig_cell: e.target.value })}
              placeholder="(555) 000-0000"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
