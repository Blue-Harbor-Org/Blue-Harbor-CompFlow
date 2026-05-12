import { NextRequest, NextResponse } from 'next/server';
import { createAnonClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const { slug } = await request.json();

  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }

  const supabase = createAnonClient();

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
    await supabase
      .from('leads')
      .update({ pipeline_status: 'signed', status_changed_at: new Date().toISOString() })
      .eq('id', proposal.client_id);
  }

  return NextResponse.json({ success: true });
}
