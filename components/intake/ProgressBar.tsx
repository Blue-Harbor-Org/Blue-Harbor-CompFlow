'use client';

import { INTAKE_STEPS } from '@/types/intake';

interface ProgressBarProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

export default function ProgressBar({ currentStep, onStepClick }: ProgressBarProps) {
  const pct = ((currentStep - 1) / (INTAKE_STEPS.length - 1)) * 100;

  return (
    <div className="w-full mb-10">
      {/* Bar track */}
      <div className="relative h-1.5 rounded-full" style={{ background: 'var(--navy3)' }}>
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--gold), var(--gold2))' }}
        />
      </div>

      {/* Step labels */}
      <div className="flex justify-between mt-3 gap-1">
        {INTAKE_STEPS.map((label, i) => {
          const stepNum = i + 1;
          const isActive = stepNum === currentStep;
          const isDone = stepNum < currentStep;

          return (
            <button
              key={label}
              onClick={() => onStepClick(stepNum)}
              className="flex flex-col items-center group cursor-pointer"
              style={{ flex: 1, minWidth: 0 }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 mb-1"
                style={{
                  background: isActive
                    ? 'var(--gold)'
                    : isDone
                    ? 'rgba(212,168,67,0.25)'
                    : 'var(--navy3)',
                  color: isActive
                    ? 'var(--navy)'
                    : isDone
                    ? 'var(--gold)'
                    : 'var(--muted)',
                  border: isActive
                    ? '2px solid var(--gold2)'
                    : isDone
                    ? '2px solid var(--border-gold)'
                    : '2px solid transparent',
                  boxShadow: isActive ? '0 0 16px rgba(212,168,67,0.35)' : 'none',
                }}
              >
                {isDone ? '✓' : stepNum}
              </div>
              <span
                className="text-[10px] sm:text-xs font-semibold leading-tight text-center hidden sm:block"
                style={{
                  color: isActive ? 'var(--gold)' : isDone ? 'var(--silver)' : 'var(--muted)',
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
