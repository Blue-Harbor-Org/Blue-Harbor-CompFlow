import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import AdminShell from '@/components/admin/AdminShell';
import type { Lead } from '@/types/lead';
import type { Report } from '@/types/report';
import { VERTICAL_OPTIONS } from '@/lib/verticals';
import { STATUS_STYLES } from '@/components/admin/statusStyles';

export default async function StatsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const admin = createAdminClient();
  const [{ data: leads }, { data: reports }] = await Promise.all([
    admin.from('leads').select('*'),
    admin.from('reports').select('*'),
  ]);

  const leadRows = (leads ?? []) as Lead[];
  const reportRows = (reports ?? []) as Report[];

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const leadsThisMonth = leadRows.filter((l) => new Date(l.created_at) >= monthStart).length;

  const reportsGenerated = reportRows.filter(
    (r) => (r.report_type ?? 'standard') === 'standard' && r.report_data
  ).length;

  const callsBooked = leadRows.filter((l) => l.status === 'call_booked').length;

  const dealsClosed = leadRows.filter((l) => l.status === 'closed_won').length;

  const funnel = [
    { key: 'all', label: 'Leads', count: leadRows.length },
    {
      key: 'report_ready',
      label: 'Report Ready',
      count: leadRows.filter((l) =>
        ['report_ready', 'call_booked', 'unlocked', 'proposal_sent', 'closed_won', 'closed_lost'].includes(
          l.status
        )
      ).length,
    },
    {
      key: 'call_booked',
      label: 'Call Booked',
      count: leadRows.filter((l) =>
        ['call_booked', 'unlocked', 'proposal_sent', 'closed_won', 'closed_lost'].includes(l.status)
      ).length,
    },
    {
      key: 'unlocked',
      label: 'Unlocked',
      count: leadRows.filter((l) =>
        ['unlocked', 'proposal_sent', 'closed_won', 'closed_lost'].includes(l.status)
      ).length,
    },
    {
      key: 'closed_won',
      label: 'Won',
      count: dealsClosed,
    },
  ] as const;

  const byIndustry = VERTICAL_OPTIONS.map((v) => ({
    id: v.value,
    label: v.label,
    count: leadRows.filter((l) => (l.industry ?? 'general') === v.value).length,
  })).filter((x) => x.count > 0);

  const publicCount = leadRows.filter((l) => l.source === 'public_form').length;
  const manualCount = leadRows.filter((l) => l.source === 'manual').length;

  const recent = [...leadRows]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

  return (
    <AdminShell userEmail={user.email} title="Stats" subtitle="Pipeline overview">
      <div className="space-y-10 p-4 md:p-8">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Leads this month', value: leadsThisMonth },
            { label: 'Reports generated', value: reportsGenerated },
            { label: 'Calls booked', value: callsBooked },
            { label: 'Deals closed', value: dealsClosed },
          ].map((m) => (
            <div key={m.label} className="card rounded-xl p-5">
              <div className="font-body text-3xl font-bold tabular-nums" style={{ color: 'var(--light)' }}>
                {m.value}
              </div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                {m.label}
              </div>
            </div>
          ))}
        </section>

        <section className="card rounded-xl p-6">
          <h2 className="font-body mb-6 text-lg font-semibold" style={{ color: 'var(--light)' }}>
            Conversion funnel
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {funnel.map((stage) => {
              const pct =
                leadRows.length === 0 ? 0 : Math.round((stage.count / leadRows.length) * 100);
              return (
                <div key={stage.label} className="flex flex-col gap-2 rounded-lg border p-4" style={{ borderColor: 'var(--border)' }}>
                  <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                    {stage.label}
                  </div>
                  <div className="font-body text-2xl font-bold" style={{ color: 'var(--gold)' }}>
                    {stage.count}{' '}
                    <span className="text-sm font-normal" style={{ color: 'var(--muted)' }}>
                      ({pct}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div className="card rounded-xl p-6">
            <h2 className="font-body mb-4 text-lg font-semibold" style={{ color: 'var(--light)' }}>
              By industry
            </h2>
            <div className="space-y-3">
              {byIndustry.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  No industry data yet.
                </p>
              ) : (
                byIndustry.map((row) => {
                  const max = Math.max(...byIndustry.map((b) => b.count), 1);
                  const w = Math.round((row.count / max) * 100);
                  return (
                    <div key={row.id}>
                      <div className="mb-1 flex justify-between text-xs" style={{ color: 'var(--silver)' }}>
                        <span>{row.label}</span>
                        <span className="tabular-nums">{row.count}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full" style={{ background: 'rgba(9,20,40,0.6)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-150"
                          style={{
                            width: `${w}%`,
                            background: 'linear-gradient(90deg, var(--gold), var(--gold2))',
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="card rounded-xl p-6">
            <h2 className="font-body mb-4 text-lg font-semibold" style={{ color: 'var(--light)' }}>
              By source
            </h2>
            <div className="flex gap-6">
              <div className="flex-1 rounded-xl p-4" style={{ background: 'rgba(143,168,200,0.08)' }}>
                <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--silver)' }}>
                  Public form
                </div>
                <div className="font-body mt-2 text-3xl font-bold" style={{ color: 'var(--light)' }}>
                  {publicCount}
                </div>
              </div>
              <div className="flex-1 rounded-xl p-4" style={{ background: 'rgba(212,168,67,0.08)' }}>
                <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--gold)' }}>
                  Manual
                </div>
                <div className="font-body mt-2 text-3xl font-bold" style={{ color: 'var(--light)' }}>
                  {manualCount}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="card rounded-xl p-6">
          <h2 className="font-body mb-4 text-lg font-semibold" style={{ color: 'var(--light)' }}>
            Recent pipeline entries
          </h2>
          <p className="mb-4 text-xs" style={{ color: 'var(--muted)' }}>
            Latest leads by creation time with current stage (live audit log not configured).
          </p>
          <ul className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {recent.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <Link
                    href="/dashboard"
                    className="font-medium hover:underline"
                    style={{ color: 'var(--silver)' }}
                  >
                    {l.business_name}
                  </Link>
                  <span className="ml-2 text-xs tabular-nums" style={{ color: 'var(--muted)' }}>
                    {new Date(l.created_at).toLocaleString()}
                  </span>
                </div>
                <span
                  className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  style={{
                    background: STATUS_STYLES[l.status].bg,
                    color: STATUS_STYLES[l.status].color,
                  }}
                >
                  {STATUS_STYLES[l.status].label}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AdminShell>
  );
}
