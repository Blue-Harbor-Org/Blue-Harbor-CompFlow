import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const serverSupabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await serverSupabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json()) as { leadId?: string };
    const leadId = body.leadId;
    if (!leadId) {
      return NextResponse.json({ error: 'leadId required' }, { status: 400 });
    }

    const admin = createAdminClient();

    const { error: repErr } = await admin.from('reports').delete().eq('lead_id', leadId);
    if (repErr) {
      console.error('[leads/delete] reports', repErr);
      return NextResponse.json({ error: repErr.message }, { status: 500 });
    }

    const { error: leadErr } = await admin.from('leads').delete().eq('id', leadId);
    if (leadErr) {
      console.error('[leads/delete] lead', leadErr);
      return NextResponse.json({ error: leadErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[leads/delete]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
