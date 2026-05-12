import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase';
import { logActivity } from '@/lib/dashboard';

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();
  const { data: currentMember } = await admin
    .from('team_members')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!currentMember) return NextResponse.json({ error: 'Not a team member' }, { status: 403 });

  const { clientId, memberId } = await request.json();
  if (!clientId) return NextResponse.json({ error: 'Missing clientId' }, { status: 400 });

  const { error } = await admin
    .from('leads')
    .update({ assigned_to: memberId || null })
    .eq('id', clientId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (memberId) {
    const { data: assignedMember } = await admin
      .from('team_members')
      .select('full_name')
      .eq('id', memberId)
      .maybeSingle();

    await logActivity(
      clientId,
      currentMember.id,
      'assignment',
      `Assigned to ${assignedMember?.full_name ?? 'team member'}`,
      { assigned_to: memberId }
    );
  } else {
    await logActivity(clientId, currentMember.id, 'assignment', 'Unassigned from team member');
  }

  return NextResponse.json({ ok: true });
}
