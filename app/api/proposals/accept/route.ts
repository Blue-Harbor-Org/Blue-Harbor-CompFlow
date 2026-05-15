import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { getBhClientLeadId } from '@/lib/bh-client-context';
import { getPublicSiteUrl } from '@/lib/siteUrl';
import {
  sendProposalAcceptedNotification,
  sendProjectStartedEmail,
} from '@/lib/resend';
import { logActivity } from '@/lib/dashboard';

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    slug?: string;
    name?: string;
    title?: string | null;
  };
  const { slug, name, title } = body;

  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }
  if (!name || !String(name).trim()) {
    return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: proposal, error: fetchErr } = await admin
    .from('bh_proposals')
    .select(
      'id, client_id, accepted_at, proposal_number, investment_amount, title, status'
    )
    .eq('public_slug', slug)
    .maybeSingle();

  if (fetchErr || !proposal) {
    return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
  }

  if (proposal.accepted_at) {
    return NextResponse.json({ success: true, alreadyAccepted: true });
  }

  const now = new Date().toISOString();

  const { error: updateErr } = await admin
    .from('bh_proposals')
    .update({
      accepted_at: now,
      status: 'signed',
      accepted_by_name: name.trim(),
      accepted_by_title: title?.trim() || null,
      updated_at: now,
    })
    .eq('id', proposal.id);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  const clientId = proposal.client_id as string;

  await admin.from('bh_clients').update({ status: 'signed' }).eq('id', clientId);

  const leadId = await getBhClientLeadId(admin, clientId);
  if (leadId) {
    await admin.from('leads').update({ status: 'closed_won' }).eq('id', leadId);
  }

  const { data: existingBuildout } = await admin
    .from('bh_site_buildouts')
    .select('id, portal_token')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  let portalToken = existingBuildout?.portal_token as string | undefined;
  if (!existingBuildout) {
    const { data: inserted, error: insErr } = await admin
      .from('bh_site_buildouts')
      .insert({ client_id: clientId, status: 'queued' })
      .select('portal_token')
      .single();
    if (!insErr && inserted?.portal_token) {
      portalToken = inserted.portal_token as string;
    }
  }

  const { data: clientRow } = await admin
    .from('bh_clients')
    .select('company_name, contact_email, contact_name, assigned_to')
    .eq('id', clientId)
    .single();

  const investmentAmount =
    (proposal as { investment_amount?: number | null }).investment_amount ?? 0;
  const proposalNumber =
    (proposal as { proposal_number?: string | null }).proposal_number ?? 'Proposal';

  const appUrl = getPublicSiteUrl();
  const portalUrl = portalToken ? `${appUrl}/portal/${portalToken}` : `${appUrl}/dashboard`;

  let assigneeEmail: string | null = null;
  let assigneeName = 'there';
  if (clientRow?.assigned_to) {
    const { data: member } = await admin
      .from('bh_team_members')
      .select('email, name')
      .eq('user_id', clientRow.assigned_to)
      .maybeSingle();
    assigneeEmail = member?.email ?? null;
    assigneeName = member?.name ?? assigneeName;
  }

  if (assigneeEmail) {
    await sendProposalAcceptedNotification({
      toEmail: assigneeEmail,
      toName: assigneeName,
      businessName: clientRow?.company_name ?? 'Client',
      contactName: name.trim(),
      proposalNumber,
      investmentAmount,
      portalUrl,
    });
  }

  const clientEmail = clientRow?.contact_email;
  if (clientEmail) {
    await sendProjectStartedEmail({
      toEmail: clientEmail,
      toName: clientRow?.contact_name?.split(' ')[0] ?? 'there',
      businessName: clientRow?.company_name ?? 'Your business',
      portalUrl,
      preparedBy: assigneeName,
    });
  }

  await logActivity(
    clientId,
    null,
    'proposal',
    `Proposal accepted by ${name.trim()}${title ? ` (${title})` : ''}`,
    { proposal_id: proposal.id }
  );

  return NextResponse.json({ success: true, portalUrl });
}
