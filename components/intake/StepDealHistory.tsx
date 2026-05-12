'use client';

import { IntakeFormData, DealEntry } from '@/types/intake';

interface Props {
  data: IntakeFormData;
  onChange: (updates: Partial<IntakeFormData>) => void;
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function StepDealHistory({ data, onChange }: Props) {
  const deals = data.deal_history;

  function updateDeal(idx: number, updates: Partial<DealEntry>) {
    const next = deals.map((d, i) => (i === idx ? { ...d, ...updates } : d));
    onChange({ deal_history: next });
  }

  function addDeal() {
    if (deals.length >= 10) return;
    onChange({
      deal_history: [
        ...deals,
        {
          id: generateId(),
          loan_amount: null,
          property_type: '',
          location: '',
          close_timeline_days: null,
          anonymized_ok: true,
        },
      ],
    });
  }

  function removeDeal(idx: number) {
    onChange({ deal_history: deals.filter((_, i) => i !== idx) });
  }

  return (
    <div className="space-y-6 fade-up">
      <div>
        <h2 className="font-heading text-2xl sm:text-3xl mb-1" style={{ color: 'var(--gold)' }}>
          Deal History
        </h2>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Add up to 10 representative deals. These help us showcase your track record.
        </p>
      </div>

      {deals.map((deal, idx) => (
        <div
          key={deal.id}
          className="card-gold p-4 sm:p-5 space-y-3"
          style={{ background: 'var(--card)', border: '1px solid var(--border-gold)', borderRadius: 12 }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-bold" style={{ color: 'var(--gold)' }}>
              Deal #{idx + 1}
            </span>
            <button
              onClick={() => removeDeal(idx)}
              className="text-xs px-2 py-1 rounded"
              style={{ color: 'var(--red)', background: 'rgba(224,80,80,0.1)' }}
            >
              Remove
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Loan Amount ($)</label>
              <input
                type="number"
                className="input"
                value={deal.loan_amount ?? ''}
                onChange={(e) =>
                  updateDeal(idx, { loan_amount: e.target.value ? Number(e.target.value) : null })
                }
                placeholder="e.g. 2500000"
                min={0}
              />
            </div>
            <div>
              <label className="label">Property Type</label>
              <input
                type="text"
                className="input"
                value={deal.property_type}
                onChange={(e) => updateDeal(idx, { property_type: e.target.value })}
                placeholder="e.g. Multi-Family"
              />
            </div>
            <div>
              <label className="label">Location</label>
              <input
                type="text"
                className="input"
                value={deal.location}
                onChange={(e) => updateDeal(idx, { location: e.target.value })}
                placeholder="e.g. Manhattan, NY"
              />
            </div>
            <div>
              <label className="label">Close Timeline (days)</label>
              <input
                type="number"
                className="input"
                value={deal.close_timeline_days ?? ''}
                onChange={(e) =>
                  updateDeal(idx, {
                    close_timeline_days: e.target.value ? Number(e.target.value) : null,
                  })
                }
                placeholder="e.g. 30"
                min={0}
              />
            </div>
          </div>

          <label
            className="flex items-center gap-2 cursor-pointer mt-1"
            style={{ color: 'var(--silver)' }}
          >
            <input
              type="checkbox"
              checked={deal.anonymized_ok}
              onChange={(e) => updateDeal(idx, { anonymized_ok: e.target.checked })}
              className="w-4 h-4 rounded"
              style={{ accentColor: 'var(--gold)' }}
            />
            <span className="text-sm">OK to anonymize and use publicly</span>
          </label>
        </div>
      ))}

      {deals.length < 10 && (
        <button onClick={addDeal} className="btn-ghost px-5 py-2.5 w-full sm:w-auto">
          + Add Deal {deals.length > 0 ? `(${deals.length}/10)` : ''}
        </button>
      )}

      {deals.length === 0 && (
        <div
          className="text-center py-10 rounded-xl"
          style={{ border: '2px dashed var(--border)', color: 'var(--muted)' }}
        >
          <p className="text-sm mb-2">No deals added yet</p>
          <p className="text-xs">Click the button above to add your first deal</p>
        </div>
      )}
    </div>
  );
}
