import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase';
import { logActivity } from '@/lib/dashboard';
import type { PipelineStatus } from '@/types/dashboard';

const VALID_STATUSES: PipelineStatus[] = [
  'intake_pending', 'intake_complete', 'proposal_sent', 'signed', 'in_buildout', 'live',
];

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();
  const { data: member } = await admin
    .from('bh_team_members')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!member) return NextResponse.json({ error: 'Not a team member' }, { status: 403 });

  const { clientId, status } = await request.json();
  if (!clientId || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { data: prev } = await admin
    .from('bh_clients')
    .select('status')
    .eq('id', clientId)
    .maybeSingle();

  const { error } = await admin
    .from('bh_clients')
    .update({ status, notes: `status_changed_at:${new Date().toISOString()}` })
    .eq('id', clientId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logActivity(
    clientId,
    user.id,
    'status_change',
    `Status changed from ${prev?.status ?? 'unknown'} to ${status}`,
    { from: prev?.status, to: status }
  );

  return NextResponse.json({ ok: true });
}
