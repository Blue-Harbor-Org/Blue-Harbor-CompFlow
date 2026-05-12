'use client';

import { IntakeFormData, GEOGRAPHIC_OPTIONS, PROPERTY_TYPE_OPTIONS } from '@/types/intake';

interface Props {
  data: IntakeFormData;
  onChange: (updates: Partial<IntakeFormData>) => void;
}

export default function StepLoanPrograms({ data, onChange }: Props) {
  function toggleGeo(val: string) {
    const next = data.geographic_focus.includes(val)
      ? data.geographic_focus.filter((g) => g !== val)
      : [...data.geographic_focus, val];
    onChange({ geographic_focus: next });
  }

  function togglePropType(val: string) {
    const next = data.property_types_served.includes(val)
      ? data.property_types_served.filter((p) => p !== val)
      : [...data.property_types_served, val];
    onChange({ property_types_served: next });
  }

  return (
    <div className="space-y-6 fade-up">
      <div>
        <h2 className="font-heading text-2xl sm:text-3xl mb-1" style={{ color: 'var(--gold)' }}>
          Loan Programs
        </h2>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Define your lending parameters so we can accurately position your services.
        </p>
      </div>

      {/* Direct Lending */}
      <div>
        <h3 className="font-heading text-lg mb-3" style={{ color: 'var(--light)' }}>
          Direct Lending Range
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Minimum Loan Size ($)</label>
            <input
              type="number"
              className="input"
              value={data.direct_lending_min ?? ''}
              onChange={(e) =>
                onChange({ direct_lending_min: e.target.value ? Number(e.target.value) : null })
              }
              placeholder="e.g. 100000"
              min={0}
            />
          </div>
          <div>
            <label className="label">Maximum Loan Size ($)</label>
            <input
              type="number"
              className="input"
              value={data.direct_lending_max ?? ''}
              onChange={(e) =>
                onChange({ direct_lending_max: e.target.value ? Number(e.target.value) : null })
              }
              placeholder="e.g. 25000000"
              min={0}
            />
          </div>
        </div>
      </div>

      <div className="gold-divider" />

      {/* Traditional / Brokered */}
      <div>
        <h3 className="font-heading text-lg mb-3" style={{ color: 'var(--light)' }}>
          Traditional / Brokered Loan Range
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Minimum ($)</label>
            <input
              type="number"
              className="input"
              value={data.brokered_loan_min ?? ''}
              onChange={(e) =>
                onChange({ brokered_loan_min: e.target.value ? Number(e.target.value) : null })
              }
              placeholder="e.g. 500000"
              min={0}
            />
          </div>
          <div>
            <label className="label">Maximum ($)</label>
            <input
              type="number"
              className="input"
              value={data.brokered_loan_max ?? ''}
              onChange={(e) =>
                onChange({ brokered_loan_max: e.target.value ? Number(e.target.value) : null })
              }
              placeholder="e.g. 50000000"
              min={0}
            />
          </div>
        </div>
      </div>

      <div className="gold-divider" />

      {/* Geographic Focus */}
      <div>
        <h3 className="font-heading text-lg mb-3" style={{ color: 'var(--light)' }}>
          Geographic Focus
        </h3>
        <div className="flex flex-wrap gap-2">
          {GEOGRAPHIC_OPTIONS.map((geo) => {
            const active = data.geographic_focus.includes(geo);
            return (
              <button
                key={geo}
                onClick={() => toggleGeo(geo)}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                style={{
                  background: active ? 'var(--gold-dim)' : 'var(--navy3)',
                  color: active ? 'var(--gold)' : 'var(--silver)',
                  border: active ? '1px solid var(--border-gold)' : '1px solid var(--border)',
                }}
              >
                {active ? '✓ ' : ''}
                {geo}
              </button>
            );
          })}
        </div>

        {data.geographic_focus.includes('Other') && (
          <div className="mt-3">
            <label className="label">Specify Other Region(s)</label>
            <input
              type="text"
              className="input"
              value={data.geographic_focus_other}
              onChange={(e) => onChange({ geographic_focus_other: e.target.value })}
              placeholder="e.g. Texas, Midwest"
            />
          </div>
        )}
      </div>

      <div className="gold-divider" />

      {/* Property Types */}
      <div>
        <h3 className="font-heading text-lg mb-3" style={{ color: 'var(--light)' }}>
          Property Types Served
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PROPERTY_TYPE_OPTIONS.map((pt) => {
            const active = data.property_types_served.includes(pt);
            return (
              <button
                key={pt}
                onClick={() => togglePropType(pt)}
                className="px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 text-left"
                style={{
                  background: active ? 'var(--gold-dim)' : 'var(--navy3)',
                  color: active ? 'var(--gold)' : 'var(--silver)',
                  border: active ? '1px solid var(--border-gold)' : '1px solid var(--border)',
                }}
              >
                {active ? '✓ ' : ''}
                {pt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
