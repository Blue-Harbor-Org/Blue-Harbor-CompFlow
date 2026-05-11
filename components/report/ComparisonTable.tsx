import type { ComparisonRow, Report } from '@/types/report';

interface Props {
  rows: ComparisonRow[];
  clientName: string;
  competitorName: string;
  /** When set, logs raw `report_data` slices in the browser for field-name debugging */
  report?: Report | null;
}

type LooseComparison = ComparisonRow & {
  competitorValue?: string;
  clientValue?: string;
  note?: string;
};

function normalizeComparisonRow(row: ComparisonRow | undefined | null) {
  const r = row as LooseComparison | null | undefined;
  return {
    category: r?.category ?? '',
    competitor: r?.competitor ?? r?.competitorValue ?? '',
    client: r?.client ?? r?.clientValue ?? '',
    advantageNote: r?.advantageNote ?? r?.note ?? '',
    advantage: r?.advantage,
  };
}

function edgeLabel(advantage: ComparisonRow['advantage'] | undefined): { text: string; color: string; bg: string } {
  const isClient = advantage === 'client';
  const isCompetitor = advantage === 'competitor';
  return {
    text: isClient ? '✓ You win' : isCompetitor ? '✗ Competitor wins' : '— Even',
    color: isClient ? 'var(--green)' : isCompetitor ? 'var(--red)' : 'var(--muted)',
    bg: isClient
      ? 'rgba(46,204,138,0.15)'
      : isCompetitor
        ? 'rgba(224,80,80,0.15)'
        : 'rgba(143,168,200,0.1)',
  };
}

export default function ComparisonTable({ rows, clientName, competitorName, report }: Props) {
  console.log(
    '[ComparisonTable] data received:',
    JSON.stringify(report?.report_data?.comparison?.slice(0, 2))
  );
  console.log(
    '[TopFindings] data received:',
    JSON.stringify(report?.report_data?.topFindings?.slice(0, 2))
  );

  const safeRows = rows ?? [];

  return (
    <>
      {/* Mobile: stacked cards */}
      <div className="space-y-4 md:hidden">
        {safeRows.map((row, i) => {
          const t = normalizeComparisonRow(row);
          const isClient = t.advantage === 'client';
          const isCompetitor = t.advantage === 'competitor';
          const edge = edgeLabel(t.advantage);
          return (
            <div key={i} className="card p-4">
              <div className="mb-3 font-heading text-lg" style={{ color: 'var(--light)' }}>
                {t.category}
              </div>
              <div className="mb-2 text-sm">
                <span style={{ color: 'var(--muted)' }}>{competitorName}: </span>
                <span style={{ color: isCompetitor ? 'var(--red)' : 'var(--silver)' }}>
                  {t.competitor}
                </span>
              </div>
              <div className="mb-3 text-sm">
                <span style={{ color: 'var(--muted)' }}>{clientName}: </span>
                <span style={{ color: isClient ? 'var(--green)' : 'var(--silver)' }}>{t.client}</span>
              </div>
              <span
                className="inline-block rounded px-2 py-1 text-xs font-semibold"
                style={{ background: edge.bg, color: edge.color }}
              >
                {edge.text}
              </span>
              {t.advantageNote && (
                <p className="mt-2 text-xs" style={{ color: 'var(--muted)' }}>
                  {t.advantageNote}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr>
              <th
                className="w-[25%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}
              >
                Category
              </th>
              <th
                className="w-[30%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--gold)', borderBottom: '1px solid var(--border)' }}
              >
                {clientName}
              </th>
              <th
                className="w-[30%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}
              >
                {competitorName}
              </th>
              <th
                className="w-[15%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}
              >
                Edge
              </th>
            </tr>
          </thead>
          <tbody>
            {safeRows.map((row, i) => {
              const t = normalizeComparisonRow(row);
              const isClient = t.advantage === 'client';
              const isCompetitor = t.advantage === 'competitor';
              return (
                <tr
                  key={i}
                  style={{
                    background: i % 2 === 0 ? 'rgba(10,30,60,0.3)' : 'transparent',
                  }}
                >
                  <td
                    className="px-4 py-3 font-medium"
                    style={{ color: 'var(--silver)', borderBottom: '1px solid var(--border)' }}
                  >
                    {t.category}
                  </td>
                  <td
                    className="px-4 py-3"
                    style={{
                      color: isClient ? 'var(--green)' : 'var(--silver)',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    {t.client}
                  </td>
                  <td
                    className="px-4 py-3"
                    style={{
                      color: isCompetitor ? 'var(--red)' : 'var(--silver)',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    {t.competitor}
                  </td>
                  <td className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                    <span
                      className="rounded px-2 py-1 text-xs font-semibold"
                      style={{
                        background: isClient
                          ? 'rgba(46,204,138,0.15)'
                          : isCompetitor
                            ? 'rgba(224,80,80,0.15)'
                            : 'rgba(143,168,200,0.1)',
                        color: isClient ? 'var(--green)' : isCompetitor ? 'var(--red)' : 'var(--muted)',
                      }}
                    >
                      {isClient ? '✓ You' : isCompetitor ? '✗ Them' : '— Even'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
