'use client';

import type { DesignArchetype } from '@/lib/mockup-archetypes';

interface Props {
  archetype: DesignArchetype;
  selected: boolean;
  onSelect: (id: string) => void;
}

export function ArchetypeCard({ archetype, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={() => onSelect(archetype.id)}
      className={`relative overflow-hidden rounded-xl border-2 text-left transition-all ${
        selected
          ? 'scale-[1.02] border-blue-500 ring-2 ring-blue-200'
          : 'border-transparent hover:border-gray-300'
      }`}
      style={{ background: archetype.palette.bg }}
    >
      <div className="relative flex h-24 w-full flex-col justify-between p-3">
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-8 rounded-full opacity-60" style={{ background: archetype.palette.text }} />
          <div className="ml-auto flex gap-1">
            <div className="h-1 w-4 rounded-full opacity-40" style={{ background: archetype.palette.text }} />
            <div className="h-1 w-4 rounded-full opacity-40" style={{ background: archetype.palette.text }} />
            <div className="h-1 w-4 rounded-full opacity-40" style={{ background: archetype.palette.text }} />
          </div>
        </div>
        <div>
          <div className="mb-1.5 h-2.5 w-3/4 rounded" style={{ background: archetype.palette.text }} />
          <div className="mb-3 h-1.5 w-1/2 rounded opacity-50" style={{ background: archetype.palette.text }} />
          <div
            className="flex h-5 w-16 items-center justify-center rounded text-[8px] font-bold"
            style={{ background: archetype.palette.accent, color: archetype.palette.bg }}
          >
            Learn More
          </div>
        </div>
      </div>

      <div className="border-t px-3 py-2" style={{ borderColor: `${archetype.palette.text}15` }}>
        <p
          className="truncate text-[11px] font-semibold"
          style={{ color: archetype.palette.text, fontFamily: archetype.fontPreview }}
        >
          {archetype.name}
        </p>
        <p className="mt-0.5 truncate text-[10px] opacity-60" style={{ color: archetype.palette.text }}>
          {archetype.moodWords.slice(0, 2).join(' · ')}
        </p>
      </div>

      {selected && (
        <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
            <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </button>
  );
}
