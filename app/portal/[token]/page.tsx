import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createAnonClient } from '@/lib/supabase';
import { PortalMetaRefresh } from '@/components/portal/PortalMetaRefresh';
import { PortalProgressBar } from '@/components/portal/PortalProgressBar';
import { PortalStageList, type PortalStage } from '@/components/portal/PortalStageList';
import { PortalPageStatusList, type PageRow } from '@/components/portal/PortalPageStatusList';

export const dynamic = 'force-dynamic';

type Snapshot = {
  buildout: Record<string, unknown>;
  pages: unknown;
  client: Record<string, unknown>;
  proposal: Record<string, unknown> | null;
};

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function parseSnapshot(raw: unknown): Snapshot | null {
  const root = asRecord(raw);
  if (!root) return null;
  const buildout = asRecord(root.buildout);
  const client = asRecord(root.client);
  if (!buildout || !client) return null;
  const proposal = root.proposal === null || root.proposal === undefined ? null : asRecord(root.proposal);
  return {
    buildout,
    pages: root.pages,
    client,
    proposal,
  };
}

function toPageRows(pages: unknown): PageRow[] {
  if (!Array.isArray(pages)) return [];
  return pages.map((p) => {
    const row = asRecord(p) ?? {};
    return {
      slug: String(row.slug ?? ''),
      title: String(row.title ?? row.slug ?? ''),
      status: row.status != null ? String(row.status) : null,
    };
  });
}

function deriveStages(snap: Snapshot): { stages: PortalStage[]; progress: number } {
  const proposal = snap.proposal;
  const proposalAccepted =
    proposal == null
      ? true
      : Boolean(
          proposal.accepted_at ||
            proposal.status === 'signed' ||
            proposal.status === 'accepted'
        );

  const st = String(snap.buildout.status ?? 'queued');
  const domain = String(snap.buildout.domain_status ?? 'pending');
  const hasBuildout = true;

  const stages: PortalStage[] = [
    {
      id: 'p1',
      label: 'Proposal accepted',
      state: proposalAccepted ? 'done' : 'active',
      detail: proposalAccepted ? undefined : 'Awaiting acceptance',
    },
    {
      id: 'p2',
      label: 'Design approved',
      state: !proposalAccepted ? 'pending' : hasBuildout ? 'done' : 'active',
      detail: hasBuildout ? undefined : undefined,
    },
    {
      id: 'p3',
      label: 'Site being built',
      state:
        st === 'generating'
          ? 'active'
          : ['generated', 'deployed', 'live'].includes(st)
            ? 'done'
            : proposalAccepted && (st === 'queued' || st === 'failed')
              ? 'active'
              : proposalAccepted
                ? 'pending'
                : 'pending',
      detail: st === 'generating' ? 'In progress' : st === 'queued' ? 'Queued' : undefined,
    },
    {
      id: 'p4',
      label: 'Review & approval',
      state: st === 'generated' ? 'active' : ['deployed', 'live'].includes(st) ? 'done' : 'pending',
    },
    {
      id: 'p5',
      label: 'Domain connected',
      state:
        domain === 'live'
          ? 'done'
          : domain === 'propagating'
            ? 'active'
            : st === 'live'
              ? 'done'
              : 'pending',
    },
    {
      id: 'p6',
      label: 'Live!',
      state: st === 'live' || domain === 'live' ? 'done' : 'pending',
    },
  ];

  const doneCount = stages.filter((s) => s.state === 'done').length;
  const progress = Math.round((doneCount / stages.length) * 100);
  return { stages, progress };
}

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function PortalPage({ params }: PageProps) {
  const { token } = await params;
  const supabase = createAnonClient();

  const { data: raw, error } = await supabase.rpc('get_portal_snapshot', {
    p_token: token,
  });

  if (error) {
    console.error('[portal] get_portal_snapshot', error.message);
    notFound();
  }

  const snap = parseSnapshot(raw);
  if (!snap) notFound();

  const pages = toPageRows(snap.pages);
  const { stages, progress } = deriveStages(snap);
  const st = String(snap.buildout.status ?? 'queued');
  const domain = String(snap.buildout.domain_status ?? 'pending');
  const isLive = st === 'live' || domain === 'live';
  const previewUrl = snap.buildout.preview_url != null ? String(snap.buildout.preview_url) : null;
  const companyName = String(snap.client.company_name ?? 'Your business');

  return (
    <div className="min-h-screen pb-16" style={{ background: '#FAFAF8' }}>
      <PortalMetaRefresh enabled={!isLive} />

      <header className="border-b bg-white px-4 py-5" style={{ borderColor: '#E9ECEF' }}>
        <div className="mx-auto flex max-w-[720px] flex-wrap items-center justify-between gap-3">
          <div
            className="text-lg font-semibold"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#C9A84C' }}
          >
            Blue Harbor
          </div>
          <span className="text-[10px] uppercase tracking-widest" style={{ color: '#868E96' }}>
            Powered by Blue Harbor
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-[720px] px-4 py-10" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <h1
          className="text-2xl font-bold sm:text-3xl"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#0f1f38' }}
        >
          Your website project
        </h1>
        <p className="mt-2 text-lg" style={{ color: '#495057' }}>
          {companyName}
        </p>

        <div className="mt-8 rounded-2xl border bg-white p-6" style={{ borderColor: '#E9ECEF' }}>
          <div className="mb-2 flex items-center justify-between text-sm font-semibold" style={{ color: '#0f1f38' }}>
            <span>Overall progress</span>
            <span>{progress}%</span>
          </div>
          <PortalProgressBar pct={progress} />
        </div>

        <section className="mt-10">
          <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#C9A84C' }}>
            Project stages
          </h2>
          <div className="mt-6">
            <PortalStageList stages={stages} />
          </div>
        </section>

        <PortalPageStatusList pages={pages} />

        {previewUrl && (
          <div className="mt-10">
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg px-6 text-sm font-semibold text-white"
              style={{ background: '#0f1f38' }}
            >
              Preview your site →
            </a>
          </div>
        )}

        <p className="mt-12 text-center text-xs" style={{ color: '#868E96' }}>
          Questions? Reply to your proposal email.{' '}
          <Link href="/" className="underline" style={{ color: '#0f1f38' }}>
            Home
          </Link>
        </p>
      </main>
    </div>
  );
}
