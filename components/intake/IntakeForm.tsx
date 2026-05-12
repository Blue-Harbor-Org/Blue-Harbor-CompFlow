'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { IntakeFormData, emptyFormData, INTAKE_STEPS } from '@/types/intake';
import ProgressBar from './ProgressBar';
import StepCompanyOverview from './StepCompanyOverview';
import StepDealHistory from './StepDealHistory';
import StepContactInfo from './StepContactInfo';
import StepLoanPrograms from './StepLoanPrograms';
import StepBrandAssets from './StepBrandAssets';
import StepReview from './StepReview';

interface ClientData {
  id: string;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  organization_id: string;
}

interface IntakeFormProps {
  clientId: string;
}

export default function IntakeForm({ clientId }: IntakeFormProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [data, setData] = useState<IntakeFormData>(emptyFormData());
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [clientInfo, setClientInfo] = useState<ClientData | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/intake?clientId=${clientId}`);
        if (!res.ok) {
          setError('Could not load client data. Please check the URL.');
          setLoading(false);
          return;
        }
        const json = await res.json();
        setClientInfo(json.client);

        if (json.submission) {
          const s = json.submission;
          if (s.completed) {
            setSubmitted(true);
          }
          setStep(s.current_step || 1);
          setData({
            company_name: s.company_name || json.client.company_name || '',
            years_in_business: s.years_in_business,
            total_loan_volume: s.total_loan_volume ? Number(s.total_loan_volume) : null,
            total_deals_closed: s.total_deals_closed,
            deal_history: s.deal_history || [],
            office_phone: s.office_phone || '',
            contact_email: s.contact_email || json.client.email || '',
            physical_address: s.physical_address || json.client.address || '',
            john_cell: s.john_cell || '',
            craig_cell: s.craig_cell || '',
            direct_lending_min: s.direct_lending_min ? Number(s.direct_lending_min) : null,
            direct_lending_max: s.direct_lending_max ? Number(s.direct_lending_max) : null,
            brokered_loan_min: s.brokered_loan_min ? Number(s.brokered_loan_min) : null,
            brokered_loan_max: s.brokered_loan_max ? Number(s.brokered_loan_max) : null,
            geographic_focus: s.geographic_focus || [],
            geographic_focus_other: s.geographic_focus_other || '',
            property_types_served: s.property_types_served || [],
            testimonials: s.testimonials || [],
            team_bios: s.team_bios || [],
            awards_press: s.awards_press || '',
            marketing_file_urls: s.marketing_file_urls || [],
          });
        } else {
          setData((prev) => ({
            ...prev,
            company_name: json.client.company_name || '',
            contact_email: json.client.email || '',
            physical_address: json.client.address || '',
            office_phone: json.client.phone || '',
          }));
        }
      } catch {
        setError('Failed to load. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [clientId]);

  const saveDraft = useCallback(
    async (formData: IntakeFormData, currentStep: number, completed = false) => {
      setSaving(true);
      try {
        const res = await fetch('/api/intake', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId,
            formData,
            currentStep,
            completed,
          }),
        });
        if (res.ok) {
          setLastSaved(new Date());
        }
      } catch {
        // Silently fail — draft save is best-effort
      } finally {
        setSaving(false);
      }
    },
    [clientId]
  );

  function handleChange(updates: Partial<IntakeFormData>) {
    const next = { ...data, ...updates };
    setData(next);

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveDraft(next, step);
    }, 1500);
  }

  async function goToStep(target: number) {
    if (target < 1 || target > INTAKE_STEPS.length) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    await saveDraft(data, target);
    setStep(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit() {
    setSubmitting(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    await saveDraft(data, INTAKE_STEPS.length, true);
    setSubmitted(true);
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--navy)' }}
      >
        <div className="text-center">
          <div
            className="w-10 h-10 border-3 rounded-full spin mx-auto mb-4"
            style={{ borderColor: 'var(--navy3)', borderTopColor: 'var(--gold)' }}
          />
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Loading intake form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6"
        style={{ background: 'var(--navy)' }}
      >
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">⚠</div>
          <h1 className="font-heading text-2xl mb-2" style={{ color: 'var(--light)' }}>
            Something went wrong
          </h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>{error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6"
        style={{ background: 'var(--navy)' }}
      >
        <div className="text-center max-w-lg fade-up">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'var(--gold-dim)', border: '2px solid var(--border-gold)' }}
          >
            <span className="text-2xl">✓</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl mb-3" style={{ color: 'var(--gold)' }}>
            Intake Complete
          </h1>
          <p className="text-sm mb-2" style={{ color: 'var(--silver)' }}>
            Thank you{clientInfo?.company_name ? `, ${clientInfo.company_name}` : ''}! Your information has
            been submitted successfully.
          </p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            Our team will review your submission and be in touch shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--navy)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50 px-4 sm:px-6 py-3 flex items-center justify-between"
        style={{
          background: 'rgba(5, 12, 26, 0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-3">
          <span className="font-heading text-lg" style={{ color: 'var(--gold)' }}>
            Blue Harbor
          </span>
          <span className="text-xs" style={{ color: 'var(--muted)' }}>·</span>
          <span className="text-xs" style={{ color: 'var(--muted)' }}>Client Intake</span>
        </div>
        <div className="flex items-center gap-3">
          {saving && (
            <span className="text-xs flex items-center gap-1.5" style={{ color: 'var(--muted)' }}>
              <span
                className="w-2 h-2 rounded-full spin"
                style={{ border: '1.5px solid var(--muted)', borderTopColor: 'transparent' }}
              />
              Saving...
            </span>
          )}
          {!saving && lastSaved && (
            <span className="text-xs" style={{ color: 'var(--green)' }}>
              ✓ Saved
            </span>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <ProgressBar currentStep={step} onStepClick={goToStep} />

        {step === 1 && <StepCompanyOverview data={data} onChange={handleChange} />}
        {step === 2 && <StepDealHistory data={data} onChange={handleChange} />}
        {step === 3 && <StepContactInfo data={data} onChange={handleChange} />}
        {step === 4 && <StepLoanPrograms data={data} onChange={handleChange} />}
        {step === 5 && <StepBrandAssets data={data} onChange={handleChange} clientId={clientId} />}
        {step === 6 && <StepReview data={data} onSubmit={handleSubmit} submitting={submitting} />}

        {/* Navigation Buttons */}
        {step < INTAKE_STEPS.length && (
          <div className="flex items-center justify-between mt-10 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
            <button
              onClick={() => goToStep(step - 1)}
              disabled={step === 1}
              className="btn-ghost px-5 py-2.5"
              style={{ visibility: step === 1 ? 'hidden' : 'visible' }}
            >
              ← Back
            </button>
            <button
              onClick={() => goToStep(step + 1)}
              className="btn-primary px-6 py-2.5"
            >
              Continue →
            </button>
          </div>
        )}

        {step === INTAKE_STEPS.length && (
          <div className="flex items-center justify-start mt-6">
            <button
              onClick={() => goToStep(step - 1)}
              className="btn-ghost px-5 py-2.5"
            >
              ← Back
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className="text-center py-6 px-4"
        style={{ borderTop: '1px solid var(--border)', color: 'var(--muted)' }}
      >
        <div className="font-heading text-sm" style={{ color: 'var(--gold)' }}>Blue Harbor</div>
        <p className="text-xs mt-0.5">© 2026 Blue Harbor · Clarity. Strategy. Growth.</p>
      </footer>
    </div>
  );
}
