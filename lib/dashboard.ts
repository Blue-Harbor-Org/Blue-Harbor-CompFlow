import { createAdminClient } from '@/lib/supabase';
import type { Client, LatestProposalBadge, TeamMember, ActivityLogEntry } from '@/types/dashboard';
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

function latestProposalBadge(
  row: { status: string; accepted_at: string | null; sent_at: string | null } | null | undefined
): LatestProposalBadge {
  if (!row) return 'none';
  if (row.accepted_at || row.status === 'signed') return 'signed';
  if (row.status === 'paused') return 'paused';
  if (row.status === 'proposal_sent' || row.sent_at) return 'sent';
  if (row.status === 'proposal_draft') return 'draft';
  return 'none';
}

export async function getClientIdForLeadId(
  admin: ReturnType<typeof createAdminClient>,
  leadId: string
): Promise<string | null> {
  const { data: report } = await admin
    .from('reports')
    .select('id')
    .eq('lead_id', leadId)
    .eq('report_type', 'standard')
    .maybeSingle();
  if (!report) return null;
  const { data: client } = await admin
    .from('bh_clients')
    .select('id')
    .eq('report_id', report.id)
    .maybeSingle();
  return client?.id ?? null;
}

export async function getClients(): Promise<Client[]> {
  const admin = createAdminClient();

  const [
    { data: clients },
    { data: members },
    { data: reports },
    { data: leads },
    { data: proposalRows },
    { data: buildoutRows },
  ] = await Promise.all([
    admin.from('bh_clients').select('*').order('created_at', { ascending: false }),
    admin.from('bh_team_members').select('*'),
    admin.from('reports').select('id, lead_id, report_type'),
    admin.from('leads').select('*'),
    admin
      .from('bh_proposals')
      .select('client_id, status, accepted_at, sent_at, created_at')
      .order('created_at', { ascending: false }),
    admin
      .from('bh_site_buildouts')
      .select('client_id, portal_token, created_at')
      .order('created_at', { ascending: false }),
  ]);

  const latestProposalByClient = new Map<
    string,
    { status: string; accepted_at: string | null; sent_at: string | null }
  >();
  for (const p of proposalRows ?? []) {
    const cid = p.client_id as string;
    if (!latestProposalByClient.has(cid)) {
      latestProposalByClient.set(cid, {
        status: p.status as string,
        accepted_at: p.accepted_at as string | null,
        sent_at: p.sent_at as string | null,
      });
    }
  }

  const portalTokenByClient = new Map<string, string>();
  for (const b of buildoutRows ?? []) {
    const cid = b.client_id as string;
    const tok = b.portal_token as string | null;
    if (tok && !portalTokenByClient.has(cid)) portalTokenByClient.set(cid, tok);
  }

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
      intake_token: (c as { intake_token?: string | null }).intake_token ?? null,
      latest_proposal_status: latestProposalBadge(latestProposalByClient.get(c.id)),
      portal_token: portalTokenByClient.get(c.id) ?? null,
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

  const [{ data: latestProp }, { data: latestBuild }] = await Promise.all([
    admin
      .from('bh_proposals')
      .select('status, accepted_at, sent_at')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin
      .from('bh_site_buildouts')
      .select('portal_token')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

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
    intake_token: client.intake_token ?? null,
    latest_proposal_status: latestProposalBadge(
      latestProp as { status: string; accepted_at: string | null; sent_at: string | null } | null
    ),
    portal_token: (latestBuild as { portal_token?: string } | null)?.portal_token ?? null,
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
