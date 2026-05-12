import { createAdminClient } from '@/lib/supabase';
import type { Client, TeamMember, ActivityLogEntry } from '@/types/dashboard';

export async function getTeamMembers(): Promise<TeamMember[]> {
  const admin = createAdminClient();
  const { data } = await admin.from('team_members').select('*').order('full_name');
  return (data ?? []) as TeamMember[];
}

export async function getTeamMemberByUserId(userId: string): Promise<TeamMember | null> {
  const admin = createAdminClient();
  const { data } = await admin.from('team_members').select('*').eq('user_id', userId).maybeSingle();
  return data as TeamMember | null;
}

export async function getClients(): Promise<Client[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('leads')
    .select('*, assigned_member:team_members!leads_assigned_to_fkey(*)')
    .order('status_changed_at', { ascending: false });
  return (data ?? []) as Client[];
}

export async function getClient(clientId: string): Promise<Client | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('leads')
    .select('*, assigned_member:team_members!leads_assigned_to_fkey(*)')
    .eq('id', clientId)
    .maybeSingle();
  return data as Client | null;
}

export async function getActivityLog(clientId: string): Promise<ActivityLogEntry[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('activity_log')
    .select('*, team_member:team_members(*)')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });
  return (data ?? []) as ActivityLogEntry[];
}

export async function logActivity(
  clientId: string,
  teamMemberId: string | null,
  type: ActivityLogEntry['type'],
  description: string,
  metadata: Record<string, unknown> = {}
) {
  const admin = createAdminClient();
  await admin.from('activity_log').insert({
    client_id: clientId,
    team_member_id: teamMemberId,
    type,
    description,
    metadata,
  });
}
