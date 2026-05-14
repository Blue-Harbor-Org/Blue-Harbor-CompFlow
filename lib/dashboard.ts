import { createAdminClient } from '@/lib/supabase';
import type { Client, TeamMember, ActivityLogEntry } from '@/types/dashboard';
import { getBhClientContext } from '@/lib/bh-client-context';

function toBhTeamMember(row: Record<string, unknown>): TeamMember {
  return {
    ...row,
    full_name: row.name as string,
  } as unknown as TeamMember;
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  const admin = createAdminClient();
  const { data } = await admin.from('bh_team_members').select('*').order('name');
  return (data ?? []).map(toBhTeamMember);
}

export async function getTeamMemberByUserId(userId: string): Promise<TeamMember | null> {
  const admin = createAdminClient();
  const { data } = await admin.from('bh_team_members').select('*').eq('user_id', userId).maybeSingle();
  return data ? toBhTeamMember(data) : null;
}

export async function getClients(): Promise<Client[]> {
  const admin = createAdminClient();

  const [{ data: clients }, { data: members }, { data: reports }, { data: leads }] = await Promise.all([
    admin.from('bh_clients').select('*').order('created_at', { ascending: false }),
    admin.from('bh_team_members').select('*'),
    admin.from('reports').select('id, lead_id, report_type'),
    admin.from('leads').select('*'),
  ]);

  const memberByUserId = new Map(
    (members ?? []).map(m => [m.user_id, toBhTeamMember(m)])
  );

  const leadIdByReportId = new Map(
    (reports ?? [])
      .filter(r => (r.report_type ?? 'standard') === 'standard')
      .map(r => [r.id, r.lead_id])
  );

  const leadById = new Map(
    (leads ?? []).map(l => [l.id, l])
  );

  return (clients ?? []).map(c => {
    const resolvedLeadId =
      (c.report_id ? leadIdByReportId.get(c.report_id) : null) ?? c.id;
    const lead = leadById.get(resolvedLeadId);
    return {
      ...c,
      lead_id: lead?.id ?? resolvedLeadId ?? null,
      business_name: c.company_name,
      email: c.contact_email ?? '',
      phone: c.contact_phone,
      pipeline_status: c.status,
      status_changed_at: c.status_changed_at ?? c.created_at,
      assigned_member: c.assigned_to ? memberByUserId.get(c.assigned_to) ?? null : null,
      website_url: lead?.website_url ?? '',
      industry: lead?.industry ?? 'general',
      source: lead?.source ?? 'manual',
      report_token: lead?.report_token ?? '',
      deepdive_status: lead?.deepdive_status ?? null,
      deepdive_viewed_at: lead?.deepdive_viewed_at ?? null,
      competitor_url: lead?.competitor_url ?? null,
      competitor_name: lead?.competitor_name ?? null,
      competitors: lead?.competitors ?? null,
    };
  }) as Client[];
}

export async function getClient(clientId: string): Promise<Client | null> {
  const admin = createAdminClient();
  const { client, lead } = await getBhClientContext(admin, clientId);

  if (!client) return null;

  let assigned_member: TeamMember | null = null;
  if (client.assigned_to) {
    const { data: member } = await admin
      .from('bh_team_members')
      .select('*')
      .eq('user_id', client.assigned_to)
      .maybeSingle();
    if (member) assigned_member = toBhTeamMember(member);
  }

  return {
    ...client,
    lead_id: lead?.id ?? null,
    business_name: client.company_name,
    email: client.contact_email ?? '',
    phone: client.contact_phone,
    pipeline_status: client.status,
    status_changed_at: (client as { status_changed_at?: string | null }).status_changed_at ?? client.created_at,
    assigned_member,
    website_url: lead?.website_url ?? '',
    industry: lead?.industry ?? 'general',
    source: lead?.source ?? 'manual',
    report_token: lead?.report_token ?? '',
    deepdive_status: lead?.deepdive_status ?? null,
    deepdive_viewed_at: lead?.deepdive_viewed_at ?? null,
    competitor_url: lead?.competitor_url ?? null,
    competitor_name: lead?.competitor_name ?? null,
    competitors: lead?.competitors ?? null,
  } as Client;
}

export async function getActivityLog(clientId: string): Promise<ActivityLogEntry[]> {
  const admin = createAdminClient();

  const [{ data: logs }, { data: members }] = await Promise.all([
    admin
      .from('bh_activity_log')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false }),
    admin.from('bh_team_members').select('*'),
  ]);

  const memberByUserId = new Map(
    (members ?? []).map(m => [m.user_id, toBhTeamMember(m)])
  );

  return (logs ?? []).map(log => ({
    id: log.id,
    client_id: log.client_id,
    team_member_id: log.actor_id,
    type: 'general' as const,
    description: log.action,
    metadata: log.metadata ?? {},
    created_at: log.created_at,
    team_member: log.actor_id ? memberByUserId.get(log.actor_id) ?? null : null,
  }));
}

/**
 * @param actorId  auth.users UUID (was previously team_members.id)
 */
export async function logActivity(
  clientId: string,
  actorId: string | null,
  type: ActivityLogEntry['type'],
  description: string,
  metadata: Record<string, unknown> = {}
) {
  const admin = createAdminClient();
  await admin.from('bh_activity_log').insert({
    client_id: clientId,
    actor_id: actorId,
    action: `[${type}] ${description}`,
    metadata,
  });
}
