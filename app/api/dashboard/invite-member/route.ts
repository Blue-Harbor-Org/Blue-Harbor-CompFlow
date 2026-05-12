import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase';

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();

  const { data: currentMember } = await admin
    .from('team_members')
    .select('id, role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!currentMember || currentMember.role !== 'admin') {
    return NextResponse.json({ error: 'Only admins can invite members' }, { status: 403 });
  }

  const { email, full_name, role } = await request.json();
  if (!email || !full_name) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const { data: existing } = await admin
    .from('team_members')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: 'Member already exists' }, { status: 409 });
  }

  const { data: member, error } = await admin
    .from('team_members')
    .insert({
      email,
      full_name,
      role: role || 'member',
      user_id: null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ member });
}
