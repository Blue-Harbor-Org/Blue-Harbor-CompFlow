import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase';
import { logActivity } from '@/lib/dashboard';

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();
  const { data: member } = await admin
    .from('team_members')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!member) return NextResponse.json({ error: 'Not a team member' }, { status: 403 });

  const { clientId, notes, memberId } = await request.json();
  if (!clientId) return NextResponse.json({ error: 'Missing clientId' }, { status: 400 });

  const { error } = await admin
    .from('leads')
    .update({ notes: notes ?? '' })
    .eq('id', clientId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logActivity(clientId, memberId || member.id, 'note', 'Notes updated');

  return NextResponse.json({ ok: true });
}
