import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import AdminShell from '@/components/admin/AdminShell';
import PipelineView from '@/components/admin/PipelineView';
import type { Lead } from '@/types/lead';
import type { Report } from '@/types/report';

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const admin = createAdminClient();

  const [{ data: leads }, { data: reportRows }] = await Promise.all([
    admin.from('leads').select('*').order('created_at', { ascending: false }),
    admin.from('reports').select('*'),
  ]);

  const leadCount = leads?.length ?? 0;

  return (
    <AdminShell
      userEmail={user.email}
      title="Pipeline"
      subtitle={`${leadCount} lead${leadCount === 1 ? '' : 's'}`}
      headerActions={
        <Link
          href="/dashboard/leads/new"
          className="btn-primary inline-flex min-h-[44px] items-center justify-center px-5 py-2.5 text-center text-sm"
        >
          + New Lead
        </Link>
      }
    >
      <div className="p-4 md:p-8">
        <PipelineView
          initialLeads={(leads ?? []) as Lead[]}
          initialReportRows={(reportRows ?? []) as Report[]}
        />
      </div>
    </AdminShell>
  );
}
