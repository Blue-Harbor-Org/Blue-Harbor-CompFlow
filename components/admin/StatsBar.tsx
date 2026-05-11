'use client';

import { useMemo } from 'react';
import type { Lead } from '@/types/lead';
import type { LeadReports } from '@/lib/pipelineReports';

export type StatFilterKey = 'all' | 'call_booked' | 'reports_unlocked' | 'closed_won';

interface Props {
  leads: Lead[];
  reportMap: Record<string, LeadReports>;
  activeStat?: StatFilterKey | null;
  onStatClick?: (key: StatFilterKey) => void;
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function trendVsPriorWeek(leads: Lead[], predicate: (l: Lead) => boolean): string {
  const now = startOfDay(new Date());
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const curStart = new Date(now.getTime() - weekMs);
  const prevStart = new Date(now.getTime() - 2 * weekMs);

  let cur = 0;
  let prev = 0;
  for (const l of leads) {
    if (!predicate(l)) continue;
    const t = new Date(l.created_at).getTime();
    if (t >= curStart.getTime() && t <= now.getTime()) cur++;
    else if (t >= prevStart.getTime() && t < curStart.getTime()) prev++;
  }
  if (prev === 0) return cur > 0 ? '+vs prior week' : '—';
  const pct = Math.round(((cur - prev) / prev) * 100);
  if (pct === 0) return 'Flat vs prior week';
  return `${pct > 0 ? '+' : ''}${pct}% vs prior week`;
}

export default function StatsBar({ leads, reportMap, activeStat, onStatClick }: Props) {
  const metrics = useMemo(() => {
    const total = leads.length;
    const callBooked = leads.filter((l) => l.status === 'call_booked').length;
    const reportsUnlocked = leads.filter((l) => {
      const std = reportMap[l.id]?.standard;
      return Boolean(std?.is_unlocked);
    }).length;
    const closedWon = leads.filter((l) => l.status === 'closed_won').length;

    return {
      total,
      callBooked,
      reportsUnlocked,
      closedWon,
      trendTotal: trendVsPriorWeek(leads, () => true),
      trendCall: trendVsPriorWeek(leads, (l) => l.status === 'call_booked'),
      trendUnlock: trendVsPriorWeek(leads, (l) => Boolean(reportMap[l.id]?.standard?.is_unlocked)),
      trendWon: trendVsPriorWeek(leads, (l) => l.status === 'closed_won'),
    };
  }, [leads, reportMap]);

  const items: {
    key: StatFilterKey;
    value: number;
    label: string;
    trend: string;
    accent?: boolean;
  }[] = [
    {
      key: 'all',
      value: metrics.total,
      label: 'Total Leads',
      trend: metrics.trendTotal,
    },
    {
      key: 'call_booked',
      value: metrics.callBooked,
      label: 'Call Booked',
      trend: metrics.trendCall,
      accent: true,
    },
    {
      key: 'reports_unlocked',
      value: metrics.reportsUnlocked,
      label: 'Reports Unlocked',
      trend: metrics.trendUnlock,
    },
    {
      key: 'closed_won',
      value: metrics.closedWon,
      label: 'Closed Won',
      trend: metrics.trendWon,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((item) => {
        const active =
          item.key === 'all'
            ? activeStat === undefined || activeStat === null || activeStat === 'all'
            : activeStat === item.key;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onStatClick?.(item.key)}
            className="rounded-xl border p-4 text-left transition-all duration-150 ease-out"
            style={{
              minHeight: 88,
              borderColor:
                active ? 'var(--border-gold)' : 'var(--border)',
              background:
                item.accent
                  ? 'rgba(212,168,67,0.08)'
                  : active
                    ? 'var(--gold-dim)'
                    : 'rgba(9,20,40,0.45)',
              boxShadow: active ? '0 0 0 1px rgba(212,168,67,0.25)' : undefined,
            }}
          >
            <div
              className="font-body text-3xl font-bold tabular-nums"
              style={{
                color: item.accent ? 'var(--gold)' : 'var(--light)',
              }}
            >
              {item.value}
            </div>
            <div
              className="mt-1 text-xs font-semibold uppercase tracking-wide"
              style={{ color: item.accent ? 'var(--gold)' : 'var(--silver)' }}
            >
              {item.label}
              {item.accent ? ' 🔥' : ''}
            </div>
            <div className="mt-2 text-[11px] leading-snug" style={{ color: 'var(--muted)' }}>
              {item.trend}
            </div>
          </button>
        );
      })}
    </div>
  );
}
