import type { TopFinding } from '@/types/report';
import {
  getFindingBody,
  getFindingSeverity,
  getFindingTitle,
} from '@/lib/reportUtils';

interface FindingCardProps {
  finding: TopFinding;
  index: number;
  showFull?: boolean;
}

const severityConfig = {
  high: { label: 'HIGH', color: 'var(--red)', bg: 'rgba(224,80,80,0.1)' },
  medium: { label: 'MEDIUM', color: 'var(--gold)', bg: 'rgba(212,168,67,0.1)' },
  low: { label: 'LOW', color: 'var(--silver)', bg: 'rgba(143,168,200,0.1)' },
};

type SeverityKey = keyof typeof severityConfig;

function normalizeSeverity(raw: string | undefined): SeverityKey {
  const s = raw?.toLowerCase().trim() ?? '';
  if (s === 'high' || s === 'medium' || s === 'low') return s;
  if (s === 'critical' || s === 'highest') return 'high';
  return 'medium';
}

export default function FindingCard({ finding, index, showFull = false }: FindingCardProps) {
  const sev = severityConfig[normalizeSeverity(getFindingSeverity(finding))];
  const title = getFindingTitle(finding);
  const body = getFindingBody(finding, showFull);

  return (
    <div
      className={`card p-6 fade-up`}
      style={{
        borderLeft: `3px solid ${sev.color}`,
        animationDelay: `${index * 0.15}s`,
        animationFillMode: 'forwards',
        opacity: 0,
      }}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3
          className="font-heading text-xl"
          style={{ color: 'var(--light)' }}
        >
          {title}
        </h3>
        <span
          className="text-xs font-bold px-2 py-1 rounded flex-shrink-0"
          style={{
            background: sev.bg,
            color: sev.color,
            border: `1px solid ${sev.color}`,
          }}
        >
          {sev.label}
        </span>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--silver)' }}>
        {body}
      </p>
    </div>
  );
}
