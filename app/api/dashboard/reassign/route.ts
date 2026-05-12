import { NextResponse } from 'next/server';
import { requireTeamMember, isAuthError } from '@/lib/auth-guard';
import { createAdminClient } from '@/lib/supabase';
import { logActivity } from '@/lib/dashboard';

export async function POST(request: Request) {
  const auth = await requireTeamMember();
  if (isAuthError(auth)) return auth;

  const { clientId, memberId } = await request.json();
  if (!clientId) return NextResponse.json({ error: 'Missing clientId' }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin
    .from('bh_clients')
    .update({ assigned_to: memberId || null })
    .eq('id', clientId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (memberId) {
    const { data: assignedMember } = await admin
      .from('bh_team_members')
      .select('name')
      .eq('user_id', memberId)
      .maybeSingle();

    await logActivity(
      clientId,
      auth.user.id,
      'assignment',
      `Assigned to ${assignedMember?.name ?? 'team member'}`,
      { assigned_to: memberId }
    );
  } else {
    await logActivity(clientId, auth.user.id, 'assignment', 'Unassigned from team member');
  }

  return NextResponse.json({ ok: true });
}
