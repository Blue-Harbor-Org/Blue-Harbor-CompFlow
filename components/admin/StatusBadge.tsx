'use client';

import type { LeadStatus } from '@/types/lead';
import { STATUS_STYLES } from '@/components/admin/statusStyles';

interface Props {
  status: LeadStatus;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: Props) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex max-w-full items-center rounded-full px-2.5 py-1 text-xs font-semibold leading-tight ${className}`}
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.color}33`,
      }}
    >
      {s.label}
    </span>
  );
}
