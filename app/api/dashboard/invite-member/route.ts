import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth-guard';
import { createAdminClient } from '@/lib/supabase';

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { email, name, role } = await request.json();
  if (!email || !name) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: existing } = await admin
    .from('bh_team_members')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: 'Member already exists' }, { status: 409 });
  }

  const { data: member, error } = await admin
    .from('bh_team_members')
    .insert({
      email,
      name,
      role: role || 'member',
      user_id: null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ member });
}
