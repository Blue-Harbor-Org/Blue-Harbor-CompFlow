import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getClients, getTeamMembers, getTeamMemberByUserId } from '@/lib/dashboard';
import DashboardShell from '@/components/admin/DashboardShell';
import ClientPipelineView from '@/components/admin/ClientPipelineView';

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const currentMember = await getTeamMemberByUserId(user.id);
  if (!currentMember) redirect('/auth/login?error=not_team_member');

  const [clients, teamMembers] = await Promise.all([
    getClients(),
    getTeamMembers(),
  ]);

  return (
    <DashboardShell currentMember={currentMember}>
      <div className="p-4 md:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="font-body text-xl font-semibold" style={{ color: 'var(--light)' }}>
              Pipeline
            </h1>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              {clients.length} client{clients.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>
        <ClientPipelineView initialClients={clients} teamMembers={teamMembers} />
      </div>
    </DashboardShell>
  );
}
