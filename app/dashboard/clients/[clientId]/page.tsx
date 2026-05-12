import { redirect, notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getClient, getTeamMembers, getTeamMemberByUserId, getActivityLog } from '@/lib/dashboard';
import DashboardShell from '@/components/admin/DashboardShell';
import ClientDetailView from '@/components/admin/ClientDetailView';

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

  const [client, teamMembers, activityLog] = await Promise.all([
    getClient(clientId),
    getTeamMembers(),
    getActivityLog(clientId),
  ]);

  if (!client) notFound();

  return (
    <DashboardShell currentMember={currentMember}>
      <ClientDetailView
        client={client}
        teamMembers={teamMembers}
        currentMember={currentMember}
        activityLog={activityLog}
      />
    </DashboardShell>
  );
}
