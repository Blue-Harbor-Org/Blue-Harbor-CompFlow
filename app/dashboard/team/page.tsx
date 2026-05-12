import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getTeamMembers, getTeamMemberByUserId, getClients } from '@/lib/dashboard';
import DashboardShell from '@/components/admin/DashboardShell';
import TeamManagementView from '@/components/admin/TeamManagementView';

export default async function TeamPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const currentMember = await getTeamMemberByUserId(user.id);
  if (!currentMember) redirect('/auth/login?error=not_team_member');

  const [teamMembers, clients] = await Promise.all([
    getTeamMembers(),
    getClients(),
  ]);

  return (
    <DashboardShell currentMember={currentMember}>
      <div className="p-4 md:p-6">
        <div className="mb-5">
          <h1 className="font-body text-xl font-semibold" style={{ color: 'var(--light)' }}>
            Team
          </h1>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            {teamMembers.length} member{teamMembers.length === 1 ? '' : 's'}
          </p>
        </div>
        <TeamManagementView
          teamMembers={teamMembers}
          clients={clients}
          currentMember={currentMember}
        />
      </div>
    </DashboardShell>
  );
}
