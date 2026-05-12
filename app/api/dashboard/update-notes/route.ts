import { NextResponse } from 'next/server';
import { requireTeamMember, isAuthError } from '@/lib/auth-guard';
import { createAdminClient } from '@/lib/supabase';
import { logActivity } from '@/lib/dashboard';

export async function POST(request: Request) {
  const auth = await requireTeamMember();
  if (isAuthError(auth)) return auth;

  const { clientId, notes } = await request.json();
  if (!clientId) return NextResponse.json({ error: 'Missing clientId' }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin
    .from('bh_clients')
    .update({ notes: notes ?? '' })
    .eq('id', clientId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logActivity(clientId, auth.user.id, 'note', 'Notes updated');

  return NextResponse.json({ ok: true });
}
