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
import type { Client, PipelineStatus } from '@/types/dashboard';
import { PIPELINE_COLUMNS } from '@/types/dashboard';
import ClientCard from '@/components/admin/ClientCard';

function DroppableColumn({
  status,
  label,
  accent,
  count,
  children,
}: {
  status: PipelineStatus;
  label: string;
  accent: string;
  count: number;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `col-${status}` });
  return (
    <div
      ref={setNodeRef}
      className="flex w-[260px] shrink-0 flex-col rounded-xl"
      style={{
        background: 'rgba(9,20,40,0.45)',
        border: `1px solid ${isOver ? accent : 'var(--border)'}`,
        minHeight: 200,
        transition: 'border-color 0.15s ease',
      }}
    >
      <div
        className="flex items-center justify-between px-3 py-2.5"
        style={{ borderBottom: `2px solid ${accent}` }}
      >
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: accent }}>
          {label}
        </span>
        <span
          className="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold"
          style={{ background: `${accent}20`, color: accent }}
        >
          {count}
        </span>
      </div>
      <div className="flex max-h-[calc(100vh-240px)] flex-1 flex-col gap-2 overflow-y-auto p-2">
        {children}
      </div>
    </div>
  );
}

function DraggableWrap({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, opacity: isDragging ? 0.8 : 1, zIndex: isDragging ? 50 : undefined }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </div>
  );
}

interface Props {
  clients: Client[];
  onStatusDrop: (clientId: string, status: PipelineStatus) => void;
}

export default function ClientKanbanView({ clients, onStatusDrop }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const clientId = String(active.id);
    const overId = String(over.id);
    if (!overId.startsWith('col-')) return;
    const newStatus = overId.replace('col-', '') as PipelineStatus;
    const client = clients.find((c) => c.id === clientId);
    if (!client || client.pipeline_status === newStatus) return;
    onStatusDrop(clientId, newStatus);
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div
        className="flex gap-3 overflow-x-auto pb-4"
        style={{ WebkitOverflowScrolling: 'touch', minHeight: 'calc(100vh - 220px)' }}
      >
        {PIPELINE_COLUMNS.map(({ status, label, color }) => {
          const colClients = clients.filter((c) => c.pipeline_status === status);
          return (
            <DroppableColumn key={status} status={status} label={label} accent={color} count={colClients.length}>
              {colClients.length === 0 ? (
                <div className="py-8 text-center text-[11px]" style={{ color: 'var(--muted)', opacity: 0.5 }}>
                  Drop here
                </div>
              ) : (
                colClients.map((client) => (
                  <DraggableWrap key={client.id} id={client.id}>
                    <ClientCard client={client} compact />
                  </DraggableWrap>
                ))
              )}
            </DroppableColumn>
          );
        })}
      </div>
    </DndContext>
  );
}
