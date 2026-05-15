import { redirect, notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase';
import { getClient, getTeamMemberByUserId } from '@/lib/dashboard';
import DashboardShell from '@/components/admin/DashboardShell';
import {
  BuildoutManager,
  type BuildoutPageRow,
  type BuildoutRow,
} from '@/components/admin/buildout/BuildoutManager';

interface PageProps {
  params: Promise<{ clientId: string }>;
}

export default async function ClientBuildoutPage({ params }: PageProps) {
  const { clientId } = await params;

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const currentMember = await getTeamMemberByUserId(user.id);
  if (!currentMember) redirect('/auth/login?error=not_team_member');

  const client = await getClient(clientId);
  if (!client) notFound();

  const admin = createAdminClient();
  const { data: buildout } = await admin
    .from('bh_site_buildouts')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: pages } = buildout
    ? await admin
      .from('bh_buildout_pages')
      .select('*')
      .eq('buildout_id', buildout.id)
      .order('slug')
    : { data: [] };

  return (
    <DashboardShell currentMember={currentMember}>
      <div className="p-4 md:p-6">
        <a
          href={`/dashboard/clients/${clientId}`}
          className="mb-4 inline-flex text-xs font-medium underline-offset-2 hover:underline"
          style={{ color: 'var(--gold)' }}
        >
          ← Back to {client.business_name}
        </a>
        <BuildoutManager
          clientId={clientId}
          initialBuildout={(buildout ?? null) as BuildoutRow | null}
          initialPages={(pages ?? []) as BuildoutPageRow[]}
        />
      </div>
    </DashboardShell>
  );
}
