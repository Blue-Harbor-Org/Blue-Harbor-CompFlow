import { redirect, notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase';
import { getClient, getTeamMembers, getTeamMemberByUserId, getActivityLog } from '@/lib/dashboard';
import { getBhClientContext } from '@/lib/bh-client-context';
import DashboardShell from '@/components/admin/DashboardShell';
import ClientDetailView from '@/components/admin/ClientDetailView';
import type { Report } from '@/types/report';
import { getLatestClientIntake } from '@/lib/client-intake';
import type { ClientIntakeRecord } from '@/types/client-intake';

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
  const clientContext = await getBhClientContext(admin, clientId);

  const [
    client, teamMembers, activityLog,
    intakeSubmission,
    { data: mockups },
  ] = await Promise.all([
    getClient(clientId),
    getTeamMembers(),
    getActivityLog(clientId),
    getLatestClientIntake(admin, clientId, clientContext.lead?.id ?? null),
    admin.from('bh_site_mockups').select('*').eq('client_id', clientId).order('created_at', { ascending: false }),
  ]);

  if (!client) notFound();

  return (
    <DashboardShell currentMember={currentMember}>
      <ClientDetailView
        client={client}
        teamMembers={teamMembers}
        currentMember={currentMember}
        activityLog={activityLog}
        standardReport={clientContext.standardReport as Report | null}
        deepdiveReport={clientContext.deepdiveReport as Report | null}
        intake={(intakeSubmission ?? null) as ClientIntakeRecord | null}
        mockups={(mockups ?? []) as { id: string; client_id: string; page_slug: string; page_title: string; html_content: string; preview_token: string; version: number; created_at: string; updated_at: string }[]}
      />
    </DashboardShell>
  );
}
