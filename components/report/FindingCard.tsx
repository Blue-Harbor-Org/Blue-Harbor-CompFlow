import type { TopFinding } from '@/types/report';

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
  return 'medium';
}

// Normalise any field-name variant Claude might produce
function resolveField(obj: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === 'string' && v.trim()) return v;
  }
  return '';
}

export default function FindingCard({ finding, index, showFull = false }: FindingCardProps) {
  const sev = severityConfig[normalizeSeverity(finding?.severity)];
  const raw = (finding ?? {}) as unknown as Record<string, unknown>;

  const title = resolveField(raw, 'title', 'name', 'heading', 'finding');
  const body = showFull
    ? resolveField(raw, 'fullDescription', 'full_description', 'description', 'detail', 'body', 'teaser', 'summary')
    : resolveField(raw, 'teaser', 'summary', 'description', 'fullDescription', 'full_description', 'body');

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
