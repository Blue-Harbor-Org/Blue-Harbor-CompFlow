'use client';

import { DESIGN_ARCHETYPES } from '@/lib/mockup-archetypes';
import { ArchetypeCard } from './ArchetypeCard';

interface Props {
  selectedId: string | 'auto';
  onSelect: (id: string | 'auto') => void;
}

export function StyleSelector({ selectedId, onSelect }: Props) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <label className="text-sm font-medium" style={{ color: 'var(--light)' }}>
          Design Style
        </label>
        <button
          type="button"
          onClick={() => onSelect('auto')}
          className={`rounded-full border px-3 py-1 text-xs transition-colors ${
            selectedId === 'auto'
              ? 'border-blue-500 bg-blue-500 text-white'
              : 'border-gray-300 text-gray-500 hover:border-gray-400'
          }`}
        >
          Auto (recommended)
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {DESIGN_ARCHETYPES.map((archetype) => (
          <ArchetypeCard
            key={archetype.id}
            archetype={archetype}
            selected={selectedId === archetype.id}
            onSelect={onSelect}
          />
        ))}
      </div>
      {selectedId !== 'auto' && (
        <p className="mt-2 text-xs" style={{ color: 'var(--muted)' }}>
          Style locked:{' '}
          <span className="font-medium">
            {DESIGN_ARCHETYPES.find((a) => a.id === selectedId)?.name}
          </span>
          . The AI will follow this archetype strictly.
        </p>
      )}
    </div>
  );
}
