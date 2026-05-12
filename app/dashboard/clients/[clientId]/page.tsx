import { redirect, notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase';
import { getClient, getTeamMembers, getTeamMemberByUserId, getActivityLog } from '@/lib/dashboard';
import DashboardShell from '@/components/admin/DashboardShell';
import ClientDetailView from '@/components/admin/ClientDetailView';
import type { Report } from '@/types/report';

interface PageProps {
  params: Promise<{ clientId: string }>;
}

export default async function ClientDetailPage({ params }: PageProps) {
  const { clientId } = await params;

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const currentMember = await getTeamMemberByUserId(user.id);
  if (!currentMember) redirect('/auth/login?error=not_team_member');

  const admin = createAdminClient();

  const [client, teamMembers, activityLog, { data: standardReport }, { data: deepdiveReport }] = await Promise.all([
    getClient(clientId),
    getTeamMembers(),
    getActivityLog(clientId),
    admin.from('reports').select('*').eq('lead_id', clientId).eq('report_type', 'standard').maybeSingle(),
    admin.from('reports').select('*').eq('lead_id', clientId).eq('report_type', 'deepdive').maybeSingle(),
  ]);

  if (!client) notFound();

  return (
    <DashboardShell currentMember={currentMember}>
      <ClientDetailView
        client={client}
        teamMembers={teamMembers}
        currentMember={currentMember}
        activityLog={activityLog}
        standardReport={(standardReport ?? null) as Report | null}
        deepdiveReport={(deepdiveReport ?? null) as Report | null}
      />
    </DashboardShell>
  );
}
