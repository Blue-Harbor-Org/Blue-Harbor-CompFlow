import { NextResponse } from 'next/server';
import { requireTeamMember, isAuthError } from '@/lib/auth-guard';
import { createAdminClient } from '@/lib/supabase';
import { logActivity } from '@/lib/dashboard';

const ALLOWED_FIELDS = new Set([
  'total_volume',
  'years_in_business',
  'deals_closed',
  'deal_examples',
  'office_phone',
  'contact_email',
  'address',
  'john_cell',
  'craig_cell',
  'loan_min',
  'loan_max',
  'geo_focus',
  'testimonials',
  'team_bios',
  'existing_copy',
]);

export async function PATCH(request: Request) {
  const auth = await requireTeamMember();
  if (isAuthError(auth)) return auth;

  const { clientId, submissionId, fields } = await request.json();
  if (!clientId || !fields || typeof fields !== 'object') {
    return NextResponse.json({ error: 'Missing clientId or fields' }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (ALLOWED_FIELDS.has(key)) updates[key] = value;
  }
  updates.submitted_at = new Date().toISOString();

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const admin = createAdminClient();

  if (submissionId) {
    const { error } = await admin
      .from('bh_intake_submissions')
      .update(updates)
      .eq('id', submissionId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await admin
      .from('bh_intake_submissions')
      .insert({ client_id: clientId, ...updates });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const changed = Object.keys(updates).join(', ');
  await logActivity(clientId, auth.user.id, 'general', `Updated intake fields: ${changed}`);

  return NextResponse.json({ ok: true });
}
