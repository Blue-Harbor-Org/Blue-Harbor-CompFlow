import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { requireTeamMember, isAuthError } from '@/lib/auth-guard';
import { sendProposalEmail } from '@/lib/resend';
import { logActivity } from '@/lib/dashboard';

export async function POST(req: Request) {
  const auth = await requireTeamMember();
  if (isAuthError(auth)) return auth;

  const admin = createAdminClient();
  const body = (await req.json()) as {
    clientId?: string;
    proposalNumber?: string;
    pdfUrl?: string;
    investmentAmount?: number;
    validUntil?: string;
  };
  const { clientId, proposalNumber, pdfUrl, investmentAmount, validUntil } = body;

  if (!clientId || !proposalNumber || !pdfUrl || investmentAmount === undefined) {
    return NextResponse.json(
      { error: 'Missing clientId, proposalNumber, pdfUrl, or investmentAmount' },
      { status: 400 }
    );
  }

  const { data: clientData } = await admin
    .from('bh_clients')
    .select('company_name, contact_name, contact_email, assigned_to')
    .eq('id', clientId)
    .maybeSingle();

  if (!clientData) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  const row = clientData as {
    company_name: string | null;
    contact_name: string | null;
    contact_email: string | null;
    assigned_to: string | null;
  };

  if (!row.contact_email) {
    return NextResponse.json({ error: 'Client has no email address' }, { status: 400 });
  }

  let preparedBy = auth.member.name;
  if (row.assigned_to) {
    const { data: assignedMember } = await admin
      .from('bh_team_members')
      .select('name')
      .eq('user_id', row.assigned_to)
      .maybeSingle();
    if (assignedMember?.name) preparedBy = assignedMember.name;
  }

  const effectiveValid =
    validUntil ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const result = await sendProposalEmail({
    toEmail: row.contact_email,
    toName: row.contact_name ?? 'there',
    businessName: row.company_name ?? 'Your Business',
    proposalNumber,
    pdfUrl,
    preparedBy,
    validUntil: effectiveValid,
    investmentAmount,
  });

  if (result.error && result.error !== 'not_configured') {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  const { data: latestProposal } = await admin
    .from('bh_proposals')
    .select('id')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestProposal?.id) {
    await admin
      .from('bh_proposals')
      .update({
        status: 'proposal_sent',
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', latestProposal.id);
  }

  await logActivity(
    clientId,
    auth.user.id,
    'proposal',
    `Proposal ${proposalNumber} sent to ${row.contact_email}`,
    { proposal_number: proposalNumber }
  );

  return NextResponse.json({ ok: true, emailId: result.id, skippedEmail: result.error === 'not_configured' });
}
