import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import AdminNav from '@/components/layout/AdminNav';
import PipelineBoard from '@/components/admin/PipelineBoard';
import Link from 'next/link';
import type { Lead } from '@/types/lead';

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const admin = createAdminClient();

  // Fetch all leads for this owner or all (since we're using service role)
  const { data: leads } = await admin
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div style={{ background: 'var(--navy)', minHeight: '100vh' }}>
      <AdminNav userEmail={user.email} />

      <div className="admin-main">
        {/* Top bar */}
        <div
          className="sticky top-0 z-30 flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-8 md:py-5"
          style={{
            background: 'rgba(5,12,26,0.95)',
            borderBottom: '1px solid var(--border)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div>
            <h1
              className="font-heading text-2xl"
              style={{ color: 'var(--light)' }}
            >
              Pipeline
            </h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
              {leads?.length ?? 0} total leads
            </p>
          </div>
          <Link
            href="/dashboard/leads/new"
            className="btn-primary w-full px-4 py-3 text-center text-sm sm:w-auto sm:py-2"
          >
            + Add Lead
          </Link>
        </div>

        <div className="p-4 md:p-8">
          <PipelineBoard initialLeads={(leads ?? []) as Lead[]} />
        </div>
      </div>
    </div>
  );
}
