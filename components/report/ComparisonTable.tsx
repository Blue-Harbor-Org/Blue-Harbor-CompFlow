import type { ComparisonRow } from '@/types/report';

interface Props {
  rows: ComparisonRow[];
  clientName: string;
  competitorName: string;
}

export default function ComparisonTable({ rows, clientName, competitorName }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
        <thead>
          <tr>
            <th
              className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
              style={{
                color: 'var(--muted)',
                borderBottom: '1px solid var(--border)',
                width: '25%',
              }}
            >
              Category
            </th>
            <th
              className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
              style={{
                color: 'var(--gold)',
                borderBottom: '1px solid var(--border)',
                width: '30%',
              }}
            >
              {clientName}
            </th>
            <th
              className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
              style={{
                color: 'var(--muted)',
                borderBottom: '1px solid var(--border)',
                width: '30%',
              }}
            >
              {competitorName}
            </th>
            <th
              className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
              style={{
                color: 'var(--muted)',
                borderBottom: '1px solid var(--border)',
                width: '15%',
              }}
            >
              Edge
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const isClient = row.advantage === 'client';
            const isCompetitor = row.advantage === 'competitor';
            const isEven = row.advantage === 'even';

            return (
              <tr
                key={i}
                style={{
                  background: i % 2 === 0 ? 'rgba(10,30,60,0.3)' : 'transparent',
                }}
              >
                <td
                  className="px-4 py-3 font-medium"
                  style={{
                    color: 'var(--silver)',
                    borderBottom: '1px solid var(--border)',
                  }}
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
                <td
                  className="px-4 py-3"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <span
                    className="text-xs px-2 py-1 rounded font-semibold"
                    style={{
                      background: isClient
                        ? 'rgba(46,204,138,0.15)'
                        : isCompetitor
                        ? 'rgba(224,80,80,0.15)'
                        : 'rgba(143,168,200,0.1)',
                      color: isClient
                        ? 'var(--green)'
                        : isCompetitor
                        ? 'var(--red)'
                        : 'var(--muted)',
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
  );
}
