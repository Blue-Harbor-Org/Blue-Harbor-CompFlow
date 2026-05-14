'use client';

import { useEffect, useState } from 'react';
import type { LeadSource, LeadStatus } from '@/types/lead';
import { VERTICAL_OPTIONS } from '@/lib/verticals';
import type { StatFilterKey } from '@/components/admin/StatsBar';

export type SortKey = 'newest' | 'oldest' | 'updated' | 'business';

export const defaultPipelineFilters = (): PipelineFilterState => ({
  search: '',
  status: 'all',
  industry: 'all',
  source: 'all',
  sort: 'newest',
  statPreset: null,
});

export interface PipelineFilterState {
  search: string;
  status: LeadStatus | 'all';
  industry: string | 'all';
  source: LeadSource | 'all';
  sort: SortKey;
  /** Applied when clicking summary stats — drives highlight + special filters */
  statPreset: StatFilterKey | null;
}

interface Props {
  value: PipelineFilterState;
  onChange: (next: PipelineFilterState) => void;
  debouncedSearch: string;
  onDebouncedSearchChange: (q: string) => void;
}

const STATUS_OPTIONS: { value: LeadStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'New' },
  { value: 'report_ready', label: 'Report Ready' },
  { value: 'call_booked', label: 'Call Booked' },
  { value: 'unlocked', label: 'Unlocked' },
  { value: 'proposal_sent', label: 'Proposal' },
  { value: 'closed_won', label: 'Won' },
  { value: 'closed_lost', label: 'Lost' },
];

const SOURCE_OPTIONS: { value: LeadSource | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'public_form', label: 'Public' },
  { value: 'manual', label: 'Manual' },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'updated', label: 'Last Updated' },
  { value: 'business', label: 'Business Name' },
];

const selectClass =
  'input min-h-[44px] appearance-none py-2.5 pr-8 text-sm transition-colors duration-150';

export default function PipelineFilters({
  value,
  onChange,
  debouncedSearch,
  onDebouncedSearchChange,
}: Props) {
  const [searchDraft, setSearchDraft] = useState({
    source: value.search,
    value: value.search,
  });
  const localSearch = searchDraft.source === value.search ? searchDraft.value : value.search;

  useEffect(() => {
    const t = setTimeout(() => {
      onDebouncedSearchChange(localSearch.trim());
    }, 300);
    return () => clearTimeout(t);
  }, [localSearch, onDebouncedSearchChange]);

  const pills: { label: string; onClear: () => void }[] = [];
  if (debouncedSearch) {
    pills.push({
      label: `Search: "${debouncedSearch}"`,
      onClear: () => {
        setSearchDraft({ source: '', value: '' });
        onChange({ ...value, search: '', statPreset: null });
        onDebouncedSearchChange('');
      },
    });
  }
  if (value.status !== 'all') {
    pills.push({
      label: STATUS_OPTIONS.find((s) => s.value === value.status)?.label ?? value.status,
      onClear: () => onChange({ ...value, status: 'all', statPreset: null }),
    });
  }
  if (value.industry !== 'all') {
    pills.push({
      label: VERTICAL_OPTIONS.find((v) => v.value === value.industry)?.label ?? value.industry,
      onClear: () => onChange({ ...value, industry: 'all', statPreset: null }),
    });
  }
  if (value.source !== 'all') {
    pills.push({
      label: SOURCE_OPTIONS.find((s) => s.value === value.source)?.label ?? value.source,
      onClear: () => onChange({ ...value, source: 'all', statPreset: null }),
    });
  }
  if (value.sort !== 'newest') {
    pills.push({
      label: `Sort: ${SORT_OPTIONS.find((s) => s.value === value.sort)?.label}`,
      onClear: () => onChange({ ...value, sort: 'newest', statPreset: null }),
    });
  }
  if (value.statPreset && value.statPreset !== 'all') {
    const labels: Record<string, string> = {
      call_booked: 'Stat: Call Booked',
      reports_unlocked: 'Stat: Reports unlocked',
      closed_won: 'Stat: Closed Won',
    };
    pills.push({
      label: labels[value.statPreset] ?? value.statPreset,
      onClear: () => onChange({ ...value, statPreset: null }),
    });
  }

  const hasFilters = pills.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0 flex-1">
          <label className="sr-only" htmlFor="pipeline-search">
            Search leads
          </label>
          <input
            id="pipeline-search"
            type="search"
            value={localSearch}
            onChange={(e) => {
              const q = e.target.value;
              setSearchDraft({ source: value.search, value: q });
              onChange({ ...value, search: q, statPreset: null });
            }}
            placeholder="Search business, contact, email…"
            className="input min-h-[44px] w-full py-2.5 text-sm transition-colors duration-150"
          />
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          <div className="relative min-w-[140px] flex-1 sm:flex-initial">
            <select
              className={`${selectClass} w-full`}
              value={value.status}
              onChange={(e) =>
                onChange({
                  ...value,
                  status: e.target.value as LeadStatus | 'all',
                  statPreset: null,
                })
              }
              aria-label="Filter by status"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  Status · {s.label}
                </option>
              ))}
            </select>
            <span
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs"
              style={{ color: 'var(--muted)' }}
            >
              ▾
            </span>
          </div>

          <div className="relative min-w-[160px] flex-1 sm:flex-initial">
            <select
              className={`${selectClass} w-full`}
              value={value.industry}
              onChange={(e) =>
                onChange({ ...value, industry: e.target.value, statPreset: null })
              }
              aria-label="Filter by industry"
            >
              <option value="all">Industry · All</option>
              {VERTICAL_OPTIONS.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
            <span
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs"
              style={{ color: 'var(--muted)' }}
            >
              ▾
            </span>
          </div>

          <div className="relative min-w-[130px] flex-1 sm:flex-initial">
            <select
              className={`${selectClass} w-full`}
              value={value.source}
              onChange={(e) =>
                onChange({
                  ...value,
                  source: e.target.value as LeadSource | 'all',
                  statPreset: null,
                })
              }
              aria-label="Filter by source"
            >
              {SOURCE_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  Source · {s.label}
                </option>
              ))}
            </select>
            <span
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs"
              style={{ color: 'var(--muted)' }}
            >
              ▾
            </span>
          </div>

          <div className="relative min-w-[160px] flex-1 sm:flex-initial">
            <select
              className={`${selectClass} w-full`}
              value={value.sort}
              onChange={(e) =>
                onChange({ ...value, sort: e.target.value as SortKey, statPreset: null })
              }
              aria-label="Sort leads"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  Sort · {s.label}
                </option>
              ))}
            </select>
            <span
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs"
              style={{ color: 'var(--muted)' }}
            >
              ↕
            </span>
          </div>
        </div>
      </div>

      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {pills.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={p.onClear}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-150"
              style={{
                background: 'var(--gold-dim)',
                color: 'var(--gold)',
                border: '1px solid var(--border-gold)',
                minHeight: 36,
              }}
            >
              {p.label}
              <span aria-hidden>×</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setSearchDraft({ source: '', value: '' });
              onDebouncedSearchChange('');
              onChange(defaultPipelineFilters());
            }}
            className="text-xs font-semibold underline-offset-2 hover:underline"
            style={{ color: 'var(--muted)' }}
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
