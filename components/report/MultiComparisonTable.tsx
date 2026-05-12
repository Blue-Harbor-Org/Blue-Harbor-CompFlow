'use client';

import type { MultiComparisonRow } from '@/types/report';

interface Props {
  rows: MultiComparisonRow[];
  clientName: string;
}

function winnerBadge(
  row: MultiComparisonRow,
): { text: string; color: string; bg: string } {
  if (row.clientAdvantage) {
    return {
      text: 'You',
      color: 'var(--green)',
      bg: 'rgba(46,204,138,0.15)',
    };
  }
  return {
    text: row.topCompetitor || '—',
    color: 'var(--red)',
    bg: 'rgba(224,80,80,0.12)',
  };
}

export default function MultiComparisonTable({ rows, clientName }: Props) {
  const safe = rows ?? [];
  const maxComp = Math.max(1, ...safe.map((r) => r.competitors?.length ?? 0));

  return (
    <>
      <div className="space-y-4 md:hidden">
        {safe.map((row, i) => {
          const w = winnerBadge(row);
          return (
            <div key={i} className="card p-4">
              <div className="font-heading mb-3 text-lg" style={{ color: 'var(--light)' }}>
                {row.category}
              </div>
              <div className="mb-2 text-sm">
                <span style={{ color: 'var(--muted)' }}>{clientName}: </span>
                <span style={{ color: row.clientAdvantage ? 'var(--green)' : 'var(--silver)' }}>
                  {row.client}
                </span>
              </div>
              {(row.competitors ?? []).map((c) => (
                <div key={c.name} className="mb-2 text-sm">
                  <span style={{ color: 'var(--muted)' }}>{c.name}: </span>
                  <span style={{ color: 'var(--silver)' }}>{c.value}</span>
                </div>
              ))}
              <span
                className="mt-2 inline-block rounded px-2 py-1 text-xs font-semibold"
                style={{ background: w.bg, color: w.color }}
              >
                Edge → {w.text}
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

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] text-sm" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr>
              <th
                className="sticky left-0 z-[1] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                style={{
                  color: 'var(--muted)',
                  borderBottom: '1px solid var(--border)',
                  background: 'var(--navy2)',
                  minWidth: 160,
                }}
              >
                Category
              </th>
              <th
                className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--gold)', borderBottom: '1px solid var(--border)', minWidth: 140 }}
              >
                {clientName}
              </th>
              {Array.from({ length: maxComp }).map((_, ci) => (
                <th
                  key={ci}
                  className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)', minWidth: 130 }}
                >
                  Comp {ci + 1}
                </th>
              ))}
              <th
                className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)', minWidth: 100 }}
              >
                Edge
              </th>
            </tr>
          </thead>
          <tbody>
            {safe.map((row, i) => {
              const comps = row.competitors ?? [];
              const w = winnerBadge(row);
              const fill = (idx: number) => comps[idx]?.value ?? '—';
              const fillName = (idx: number) => comps[idx]?.name ?? `Comp ${idx + 1}`;
              return (
                <tr
                  key={i}
                  style={{
                    background: i % 2 === 0 ? 'rgba(10,30,60,0.3)' : 'transparent',
                  }}
                >
                  <td
                    className="sticky left-0 z-[1] px-3 py-3 font-medium"
                    style={{
                      color: 'var(--silver)',
                      borderBottom: '1px solid var(--border)',
                      background: 'var(--navy2)',
                    }}
                  >
                    {row.category}
                  </td>
                  <td
                    className="px-3 py-3"
                    style={{
                      color: row.clientAdvantage ? 'var(--green)' : 'var(--silver)',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    {row.client}
                  </td>
                  {Array.from({ length: maxComp }).map((_, ci) => (
                    <td
                      key={ci}
                      className="px-3 py-3"
                      style={{
                        color:
                          !row.clientAdvantage && row.topCompetitor === fillName(ci)
                            ? 'var(--red)'
                            : 'var(--silver)',
                        borderBottom: '1px solid var(--border)',
                      }}
                      title={fillName(ci)}
                    >
                      {fill(ci)}
                    </td>
                  ))}
                  <td className="px-3 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                    <span
                      className="rounded px-2 py-1 text-xs font-semibold"
                      style={{ background: w.bg, color: w.color }}
                    >
                      {w.text}
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
