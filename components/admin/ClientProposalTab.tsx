'use client';

import Link from 'next/link';
import type { Client } from '@/types/dashboard';

interface Props {
  client: Client;
}

export default function ClientProposalTab({ client }: Props) {
  const hasProposal = client.pipeline_status === 'proposal_sent' ||
    client.pipeline_status === 'signed' ||
    client.pipeline_status === 'in_buildout' ||
    client.pipeline_status === 'live';

  const proposalSent = client.pipeline_status !== 'intake_pending' && client.pipeline_status !== 'intake_complete';

  return (
    <div className="rounded-xl p-4 md:p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
        Proposal
      </h3>

      <div className="space-y-4">
        {/* Status */}
        <div className="flex items-center gap-3">
          <div
            className="h-3 w-3 rounded-full"
            style={{ background: hasProposal ? 'var(--green)' : proposalSent ? 'var(--gold)' : 'var(--muted)' }}
          />
          <span className="text-sm font-medium" style={{ color: 'var(--light)' }}>
            {hasProposal
              ? 'Proposal accepted — client signed'
              : proposalSent
              ? 'Proposal sent — awaiting response'
              : 'No proposal sent yet'}
          </span>
        </div>

        {/* Timeline */}
        <div className="rounded-lg p-4" style={{ background: 'var(--navy3)', border: '1px solid var(--border)' }}>
          <div className="space-y-3">
            <TimelineStep
              done={client.pipeline_status !== 'intake_pending'}
              label="Intake completed"
            />
            <TimelineStep
              done={proposalSent}
              label="Proposal created & sent"
            />
            <TimelineStep
              done={client.pipeline_status === 'signed' || client.pipeline_status === 'in_buildout' || client.pipeline_status === 'live'}
              label="Client signed"
            />
            <TimelineStep
              done={client.pipeline_status === 'in_buildout' || client.pipeline_status === 'live'}
              label="Buildout started"
            />
            <TimelineStep
              done={client.pipeline_status === 'live'}
              label="Project live"
            />
          </div>
        </div>

        {/* Action button */}
        {!proposalSent && (
          <Link href={`/dashboard/clients/${client.id}/proposal`} className="btn-primary inline-flex px-5 py-2.5 text-sm">
            Create Proposal
          </Link>
        )}
        {proposalSent && !hasProposal && (
          <Link href={`/dashboard/clients/${client.id}/proposal`} className="btn-ghost inline-flex px-5 py-2.5 text-sm">
            View / Edit Proposal
          </Link>
        )}
      </div>
    </div>
  );
}

function TimelineStep({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
        style={{
          background: done ? 'var(--green)' : 'var(--navy2)',
          color: done ? '#fff' : 'var(--muted)',
          border: done ? 'none' : '1px solid var(--border)',
        }}
      >
        {done ? '✓' : '·'}
      </div>
      <span className="text-xs" style={{ color: done ? 'var(--light)' : 'var(--muted)' }}>
        {label}
      </span>
    </div>
  );
}
