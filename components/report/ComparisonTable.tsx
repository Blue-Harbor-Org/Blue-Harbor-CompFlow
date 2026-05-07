import type { ComparisonRow } from '@/types/report';

interface Props {
  rows: ComparisonRow[];
  clientName: string;
  competitorName: string;
}

function edgeLabel(row: ComparisonRow): { text: string; color: string; bg: string } {
  const isClient = row.advantage === 'client';
  const isCompetitor = row.advantage === 'competitor';
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

export default function ComparisonTable({ rows, clientName, competitorName }: Props) {
  return (
    <>
      {/* Mobile: stacked cards */}
      <div className="space-y-4 md:hidden">
        {rows.map((row, i) => {
          const isClient = row.advantage === 'client';
          const isCompetitor = row.advantage === 'competitor';
          const edge = edgeLabel(row);
          return (
            <div key={i} className="card p-4">
              <div className="mb-3 font-heading text-lg" style={{ color: 'var(--light)' }}>
                {row.category}
              </div>
              <div className="mb-2 text-sm">
                <span style={{ color: 'var(--muted)' }}>{competitorName}: </span>
                <span style={{ color: isCompetitor ? 'var(--red)' : 'var(--silver)' }}>
                  {row.competitor}
                </span>
              </div>
              <div className="mb-3 text-sm">
                <span style={{ color: 'var(--muted)' }}>{clientName}: </span>
                <span style={{ color: isClient ? 'var(--green)' : 'var(--silver)' }}>{row.client}</span>
              </div>
              <span
                className="inline-block rounded px-2 py-1 text-xs font-semibold"
                style={{ background: edge.bg, color: edge.color }}
              >
                {edge.text}
              </span>
              {row.advantageNote && (
                <p className="mt-2 text-xs" style={{ color: 'var(--muted)' }}>
                  {row.advantageNote}
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
            {rows.map((row, i) => {
              const isClient = row.advantage === 'client';
              const isCompetitor = row.advantage === 'competitor';
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
                    {row.category}
                  </td>
                  <td
                    className="px-4 py-3"
                    style={{
                      color: isClient ? 'var(--green)' : 'var(--silver)',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    {row.client}
                  </td>
                  <td
                    className="px-4 py-3"
                    style={{
                      color: isCompetitor ? 'var(--red)' : 'var(--silver)',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    {row.competitor}
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
