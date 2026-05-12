'use client';

import { IntakeFormData } from '@/types/intake';

interface Props {
  data: IntakeFormData;
  onSubmit: () => void;
  submitting: boolean;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="p-4 sm:p-5 rounded-xl"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <h3 className="font-heading text-lg mb-3" style={{ color: 'var(--gold)' }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  const display = value === null || value === undefined || value === '' ? '—' : String(value);
  return (
    <div className="flex justify-between py-1.5" style={{ borderBottom: '1px solid var(--border)' }}>
      <span className="text-sm" style={{ color: 'var(--muted)' }}>{label}</span>
      <span className="text-sm font-semibold text-right" style={{ color: 'var(--light)' }}>
        {display}
      </span>
    </div>
  );
}

function formatMoney(val: number | null) {
  if (!val) return null;
  return '$' + val.toLocaleString();
}

export default function StepReview({ data, onSubmit, submitting }: Props) {
  return (
    <div className="space-y-6 fade-up">
      <div>
        <h2 className="font-heading text-2xl sm:text-3xl mb-1" style={{ color: 'var(--gold)' }}>
          Review &amp; Submit
        </h2>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Please review all information before submitting. You can go back to any step to make changes.
        </p>
      </div>

      {/* Company Overview */}
      <Section title="Company Overview">
        <Field label="Company Name" value={data.company_name} />
        <Field label="Years in Business" value={data.years_in_business} />
        <Field label="Total Loan Volume" value={formatMoney(data.total_loan_volume)} />
        <Field label="Total Deals Closed" value={data.total_deals_closed} />
      </Section>

      {/* Deal History */}
      <Section title={`Deal History (${data.deal_history.length} deals)`}>
        {data.deal_history.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--muted)' }}>No deals added</p>
        ) : (
          <div className="space-y-3">
            {data.deal_history.map((deal, idx) => (
              <div
                key={deal.id}
                className="px-3 py-2 rounded-lg"
                style={{ background: 'var(--navy3)' }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold" style={{ color: 'var(--gold)' }}>
                    #{idx + 1}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--light)' }}>
                    {formatMoney(deal.loan_amount) || 'Amount TBD'}
                  </span>
                </div>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  {[deal.property_type, deal.location, deal.close_timeline_days ? `${deal.close_timeline_days}d close` : null]
                    .filter(Boolean)
                    .join(' · ') || 'Details pending'}
                </p>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Contact Info */}
      <Section title="Contact & Office">
        <Field label="Office Phone" value={data.office_phone} />
        <Field label="Contact Email" value={data.contact_email} />
        <Field label="Physical Address" value={data.physical_address} />
        <Field label="John's Cell" value={data.john_cell} />
        <Field label="Craig's Cell" value={data.craig_cell} />
      </Section>

      {/* Loan Programs */}
      <Section title="Loan Programs">
        <Field label="Direct Lending Min" value={formatMoney(data.direct_lending_min)} />
        <Field label="Direct Lending Max" value={formatMoney(data.direct_lending_max)} />
        <Field label="Brokered Min" value={formatMoney(data.brokered_loan_min)} />
        <Field label="Brokered Max" value={formatMoney(data.brokered_loan_max)} />
        <Field
          label="Geographic Focus"
          value={data.geographic_focus.length > 0 ? data.geographic_focus.join(', ') : null}
        />
        {data.geographic_focus_other && (
          <Field label="Other Regions" value={data.geographic_focus_other} />
        )}
        <Field
          label="Property Types"
          value={data.property_types_served.length > 0 ? data.property_types_served.join(', ') : null}
        />
      </Section>

      {/* Brand Assets */}
      <Section title="Brand Assets">
        <Field label="Testimonials" value={`${data.testimonials.length} added`} />
        <Field label="Team Bios" value={`${data.team_bios.length} added`} />
        <Field label="Awards & Press" value={data.awards_press || '—'} />
        <Field label="Uploaded Files" value={`${data.marketing_file_urls.length} files`} />
      </Section>

      {/* Submit */}
      <div className="pt-4">
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="btn-primary w-full py-4 text-base tracking-wide"
          style={{ fontSize: 16 }}
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full spin" />
              Submitting...
            </span>
          ) : (
            'Submit Intake Form'
          )}
        </button>
        <p className="text-xs text-center mt-3" style={{ color: 'var(--muted)' }}>
          Your progress is saved automatically. You can close and return anytime before submitting.
        </p>
      </div>
    </div>
  );
}
