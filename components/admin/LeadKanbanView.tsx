'use client';

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCorners,
  useDroppable,
  useDraggable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { Lead, LeadStatus } from '@/types/lead';
import type { LeadReports } from '@/lib/pipelineReports';
import LeadCard from '@/components/admin/LeadCard';
import { STATUS_STYLES } from '@/components/admin/statusStyles';

const COLUMN_ORDER: LeadStatus[] = [
  'pending',
  'report_ready',
  'call_booked',
  'unlocked',
  'proposal_sent',
  'closed_won',
  'closed_lost',
];

function colId(status: LeadStatus) {
  return `col-${status}`;
}

function DroppableColumn({
  status,
  label,
  accent,
  highlight,
  children,
}: {
  status: LeadStatus;
  label: string;
  accent: string;
  highlight?: boolean;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: colId(status) });
  return (
    <div
      ref={setNodeRef}
      className="flex w-[280px] shrink-0 flex-col rounded-xl pb-2 md:w-[260px]"
      style={{
        background: highlight ? 'rgba(212,168,67,0.06)' : 'rgba(9,20,40,0.45)',
        border: `${highlight ? 2 : 1}px solid ${
          isOver ? 'var(--gold)' : highlight ? 'rgba(212,168,67,0.25)' : 'var(--border)'
        }`,
        minHeight: 200,
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{
          borderBottom: `2px solid ${accent}`,
          background: highlight ? 'rgba(212,168,67,0.12)' : 'transparent',
        }}
      >
        <span className="text-sm font-semibold" style={{ color: accent }}>
          {label}
        </span>
      </div>
      <div className="flex max-h-[calc(100vh-220px)] flex-1 flex-col gap-3 overflow-y-auto p-3">{children}</div>
    </div>
  );
}

function DraggableWrap({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.85 : 1,
        zIndex: isDragging ? 50 : undefined,
      }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </div>
  );
}

interface Props {
  leads: Lead[];
  reportMap: Record<string, LeadReports>;
  onOpen: (id: string) => void;
  onUnlockReport: (leadId: string) => Promise<void>;
  onUnlockDeepDive: (leadId: string) => Promise<void>;
  onGenerateDeepDive: (leadId: string) => Promise<void>;
  onStatusChange: (leadId: string, status: LeadStatus) => Promise<void>;
  onDeleted: (leadId: string) => void;
  onStatusDrop: (leadId: string, status: LeadStatus) => Promise<void>;
}

export default function LeadKanbanView({
  leads,
  reportMap,
  onOpen,
  onUnlockReport,
  onUnlockDeepDive,
  onGenerateDeepDive,
  onStatusChange,
  onDeleted,
  onStatusDrop,
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 10 },
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const leadId = String(active.id);
    const overId = String(over.id);
    if (!overId.startsWith('col-')) return;
    const newStatus = overId.replace('col-', '') as LeadStatus;
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.status === newStatus) return;
    void onStatusDrop(leadId, newStatus);
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="flex min-h-[calc(100vh-240px)] gap-4 overflow-x-auto pb-4" style={{ WebkitOverflowScrolling: 'touch' }}>
        {COLUMN_ORDER.map((status) => {
          const colLeads = leads.filter((l) => l.status === status);
          const meta = STATUS_STYLES[status];
          const highlight = status === 'call_booked';
          return (
            <DroppableColumn
              key={status}
              status={status}
              label={meta.label}
              accent={meta.color}
              highlight={highlight}
            >
              {colLeads.length === 0 ? (
                <div className="py-8 text-center text-xs opacity-50" style={{ color: 'var(--muted)' }}>
                  Drop here
                </div>
              ) : (
                colLeads.map((lead) => {
                  const bundle = reportMap[lead.id] ?? { standard: null, deep: null };
                  return (
                    <DraggableWrap key={lead.id} id={lead.id}>
                      <LeadCard
                        lead={lead}
                        standardReport={bundle.standard}
                        deepReport={bundle.deep}
                        highlight={highlight}
                        large={highlight}
                        onOpen={() => onOpen(lead.id)}
                        onUnlockReport={() => onUnlockReport(lead.id)}
                        onUnlockDeepDive={() => onUnlockDeepDive(lead.id)}
                        onGenerateDeepDive={() => onGenerateDeepDive(lead.id)}
                        onStatusChange={(s) => onStatusChange(lead.id, s)}
                        onDeleted={() => onDeleted(lead.id)}
                      />
                    </DraggableWrap>
                  );
                })
              )}
            </DroppableColumn>
          );
        })}
      </div>
    </DndContext>
  );
}
