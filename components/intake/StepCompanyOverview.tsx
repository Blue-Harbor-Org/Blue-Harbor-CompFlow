'use client';

import { IntakeFormData } from '@/types/intake';

interface Props {
  data: IntakeFormData;
  onChange: (updates: Partial<IntakeFormData>) => void;
}

export default function StepCompanyOverview({ data, onChange }: Props) {
  return (
    <div className="space-y-6 fade-up">
      <div>
        <h2 className="font-heading text-2xl sm:text-3xl mb-1" style={{ color: 'var(--gold)' }}>
          Company Overview
        </h2>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Tell us about your lending business so we can build your competitive profile.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="label">Company Name</label>
          <input
            type="text"
            className="input"
            value={data.company_name}
            onChange={(e) => onChange({ company_name: e.target.value })}
            placeholder="e.g. Blue Harbor Capital"
          />
        </div>

        <div>
          <label className="label">Years in Business</label>
          <input
            type="number"
            className="input"
            value={data.years_in_business ?? ''}
            onChange={(e) =>
              onChange({ years_in_business: e.target.value ? Number(e.target.value) : null })
            }
            placeholder="e.g. 12"
            min={0}
          />
        </div>

        <div>
          <label className="label">Total Loan Volume Funded ($)</label>
          <input
            type="number"
            className="input"
            value={data.total_loan_volume ?? ''}
            onChange={(e) =>
              onChange({ total_loan_volume: e.target.value ? Number(e.target.value) : null })
            }
            placeholder="e.g. 500000000"
            min={0}
          />
          {data.total_loan_volume ? (
            <p className="text-xs mt-1" style={{ color: 'var(--silver)' }}>
              ${data.total_loan_volume.toLocaleString()}
            </p>
          ) : null}
        </div>

        <div>
          <label className="label">Total Deals Closed (#)</label>
          <input
            type="number"
            className="input"
            value={data.total_deals_closed ?? ''}
            onChange={(e) =>
              onChange({ total_deals_closed: e.target.value ? Number(e.target.value) : null })
            }
            placeholder="e.g. 250"
            min={0}
          />
        </div>
      </div>
    </div>
  );
}
