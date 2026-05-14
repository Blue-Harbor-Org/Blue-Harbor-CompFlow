import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createAnonClient } from '@/lib/supabase';
import { getBhClientLeadId } from '@/lib/bh-client-context';

export async function POST(request: NextRequest) {
  const { slug } = await request.json();

  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }

  const supabase = createAnonClient();
  const admin = createAdminClient();

  const { data: proposal, error } = await supabase
    .from('bh_proposals')
    .update({
      accepted_at: new Date().toISOString(),
      status: 'signed',
    })
    .eq('public_slug', slug)
    .is('accepted_at', null)
    .select('client_id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (proposal?.client_id) {
    await admin
      .from('bh_clients')
      .update({ status: 'signed' })
      .eq('id', proposal.client_id);

    const leadId = await getBhClientLeadId(admin, proposal.client_id);
    if (leadId) {
      await admin
        .from('leads')
        .update({ status: 'closed_won' })
        .eq('id', leadId);
    }
  }

  return NextResponse.json({ success: true });
}
