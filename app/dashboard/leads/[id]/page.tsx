import { redirect, notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import AdminNav from '@/components/layout/AdminNav';
import StatusDropdown from '@/components/admin/StatusDropdown';
import NotesField from '@/components/admin/NotesField';
import UnlockButton from '@/components/admin/UnlockButton';
import CopyButton from '@/components/admin/CopyButton';
import GenerateReportButton from '@/components/admin/GenerateReportButton';
import IndustrySelect from '@/components/admin/IndustrySelect';
import Link from 'next/link';

interface Props {
  params: Promise<{ id: string }>;
}

function formatDate(date: string | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function ContactFieldValue({ label, value }: { label: string; value: string }) {
  const muted = <span className="text-sm break-words" style={{ color: 'var(--silver)' }}>{value}</span>;

  if (!value || value === '—') return muted;

  const linkClass =
    'text-sm break-all underline-offset-2 hover:underline min-h-11 inline-flex items-center py-1';

  if (label === 'Email') {
    return (
      <a href={`mailto:${encodeURIComponent(value)}`} className={linkClass} style={{ color: 'var(--silver)' }}>
        {value}
      </a>
    );
  }
  if (label === 'Phone') {
    return (
      <a href={`tel:${value.replace(/\s/g, '')}`} className={linkClass} style={{ color: 'var(--silver)' }}>
        {value}
      </a>
    );
  }
  if (label === 'Website' || label === 'Competitor URL') {
    const href = value.startsWith('http://') || value.startsWith('https://') ? value : `https://${value}`;
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass} style={{ color: 'var(--silver)' }}>
        {value}
      </a>
    );
  }

  return muted;
}

export default async function LeadDetailPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const admin = createAdminClient();

  const { data: lead, error } = await admin
    .from('leads')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !lead) notFound();

  const { data: report } = await admin
    .from('reports')
    .select('*')
    .eq('lead_id', id)
    .single();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const teaserUrl = `${appUrl}/report/${lead.report_token}`;
  const fullUrl = `${appUrl}/report/${lead.report_token}/full?admin=true`;

  return (
    <div style={{ background: 'var(--navy)', minHeight: '100vh' }}>
      <AdminNav userEmail={user.email} />

      <div className="admin-main">
        <div
          className="sticky top-0 z-30 flex items-center gap-4 px-4 py-4 md:px-8 md:py-5"
          style={{
            background: 'rgba(5,12,26,0.95)',
            borderBottom: '1px solid var(--border)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <Link href="/dashboard" className="text-sm" style={{ color: 'var(--muted)' }}>
            ← Pipeline
          </Link>
          <span style={{ color: 'var(--border)' }}>·</span>
          <h1 className="font-heading text-xl" style={{ color: 'var(--light)' }}>
            {lead.business_name}
          </h1>
        </div>

        <div className="p-4 md:p-8">
          <div className="grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-2">

            {/* Left: Lead Info */}
            <div className="space-y-6">
              <div className="card p-6">
                <h2 className="font-heading text-xl mb-5" style={{ color: 'var(--light)' }}>
                  Contact Information
                </h2>
                <div className="space-y-4">
                  {[
                    { label: 'Contact Name', value: lead.contact_name },
                    { label: 'Business Name', value: lead.business_name },
                    { label: 'Email', value: lead.email },
                    { label: 'Phone', value: lead.phone || '—' },
                    { label: 'Website', value: lead.website_url },
                    { label: 'Competitor URL', value: lead.competitor_url },
                    { label: 'Competitor Name', value: lead.competitor_name || '—' },
                    { label: 'Source', value: lead.source },
                    { label: 'Created', value: formatDate(lead.created_at) ?? '—' },
                  ].map((field) => (
                    <div
                      key={field.label}
                      className="grid grid-cols-1 gap-1 sm:grid-cols-2 sm:items-start sm:gap-4"
                    >
                      <span className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>
                        {field.label}
                      </span>
                      <ContactFieldValue label={field.label} value={String(field.value)} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="card p-6">
                <h2 className="font-heading text-xl mb-4" style={{ color: 'var(--light)' }}>
                  Pipeline Status
                </h2>
                <StatusDropdown leadId={lead.id} currentStatus={lead.status} />
              </div>

              {/* Industry vertical */}
              <div className="card p-6">
                <IndustrySelect
                  leadId={lead.id}
                  currentIndustry={(lead as { industry?: string }).industry ?? 'general'}
                />
              </div>

              {/* Notes */}
              <div className="card p-6">
                <NotesField leadId={lead.id} initialNotes={lead.notes} />
              </div>

              {/* Report links */}
              <div className="card p-6">
                <h2 className="font-heading text-xl mb-4" style={{ color: 'var(--light)' }}>
                  Report Links
                </h2>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs mb-1.5" style={{ color: 'var(--muted)' }}>
                      Teaser (public)
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={teaserUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm truncate"
                        style={{ color: 'var(--silver)' }}
                      >
                        {teaserUrl}
                      </a>
                      <CopyButton text={teaserUrl} />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs mb-1.5" style={{ color: 'var(--muted)' }}>
                      Full Report (admin preview)
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={fullUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm truncate"
                        style={{ color: 'var(--silver)' }}
                      >
                        {fullUrl}
                      </a>
                      <CopyButton text={fullUrl} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Report + Actions */}
            <div className="space-y-6">
              <div className="card p-6">
                <h2 className="font-heading text-xl mb-5" style={{ color: 'var(--light)' }}>
                  Report
                </h2>

                <div className="space-y-3 mb-6">
                  {[
                    {
                      label: 'Status',
                      value: report?.report_data
                        ? '✓ Generated'
                        : report
                        ? '⟳ Generating...'
                        : '✗ Not started',
                      color: report?.report_data
                        ? 'var(--green)'
                        : report
                        ? 'var(--gold)'
                        : 'var(--red)',
                    },
                    {
                      label: 'Unlocked',
                      value: report?.is_unlocked
                        ? `✓ ${formatDate(report.unlocked_at)}`
                        : '✗ Locked',
                      color: report?.is_unlocked ? 'var(--green)' : 'var(--muted)',
                    },
                    {
                      label: 'Teaser Viewed',
                      value: report?.viewed_teaser_at
                        ? (formatDate(report.viewed_teaser_at) ?? 'Not yet')
                        : 'Not yet',
                      color: report?.viewed_teaser_at ? 'var(--silver)' : 'var(--muted)',
                    },
                    {
                      label: 'Full Report Viewed',
                      value: report?.viewed_full_at
                        ? (formatDate(report.viewed_full_at) ?? 'Not yet')
                        : 'Not yet',
                      color: report?.viewed_full_at ? 'var(--silver)' : 'var(--muted)',
                    },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: 'var(--muted)' }}>{row.label}</span>
                      <span className="text-sm font-medium" style={{ color: row.color }}>{row.value}</span>
                    </div>
                  ))}
                </div>

                {report && !report.is_unlocked ? (
                  <UnlockButton
                    leadId={lead.id}
                    email={lead.email}
                    businessName={lead.business_name}
                  />
                ) : report?.is_unlocked ? (
                  <div
                    className="px-4 py-3 rounded-lg text-sm text-center font-medium"
                    style={{
                      background: 'rgba(46,204,138,0.1)',
                      border: '1px solid rgba(46,204,138,0.3)',
                      color: 'var(--green)',
                    }}
                  >
                    ✓ Report unlocked on {formatDate(report.unlocked_at)}
                  </div>
                ) : (
                  <div
                    className="text-sm px-4 py-3 rounded-lg"
                    style={{
                      background: 'rgba(90,114,148,0.1)',
                      color: 'var(--muted)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    Report not yet generated.
                  </div>
                )}
              </div>

              {/* Quick actions */}
              <div className="card p-6">
                <h2 className="font-heading text-xl mb-4" style={{ color: 'var(--light)' }}>
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  <a
                    href={teaserUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost block min-h-12 w-full py-3 text-center text-sm"
                  >
                    View Teaser Page
                  </a>
                  <a
                    href={fullUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost block min-h-12 w-full py-3 text-center text-sm"
                  >
                    Preview Full Report (Admin)
                  </a>
                  {!report && <GenerateReportButton leadId={lead.id} />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
