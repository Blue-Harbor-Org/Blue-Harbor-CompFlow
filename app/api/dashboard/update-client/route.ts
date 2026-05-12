import { NextResponse } from 'next/server';
import { requireTeamMember, isAuthError } from '@/lib/auth-guard';
import { createAdminClient } from '@/lib/supabase';
import { logActivity } from '@/lib/dashboard';

const ALLOWED_FIELDS = new Set([
  'company_name',
  'contact_name',
  'contact_email',
  'contact_phone',
]);

export async function PATCH(request: Request) {
  const auth = await requireTeamMember();
  if (isAuthError(auth)) return auth;

  const { clientId, fields } = await request.json();
  if (!clientId || !fields || typeof fields !== 'object') {
    return NextResponse.json({ error: 'Missing clientId or fields' }, { status: 400 });
  }

  const updates: Record<string, string> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (ALLOWED_FIELDS.has(key)) updates[key] = value as string;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from('bh_clients')
    .update(updates)
    .eq('id', clientId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const leadsSync: Record<string, string> = {};
  if (updates.company_name) leadsSync.business_name = updates.company_name;
  if (updates.contact_name) leadsSync.contact_name = updates.contact_name;
  if (updates.contact_email) leadsSync.email = updates.contact_email;
  if (updates.contact_phone) leadsSync.phone = updates.contact_phone;

  if (Object.keys(leadsSync).length > 0) {
    await admin.from('leads').update(leadsSync).eq('id', clientId);
  }

  const changed = Object.keys(updates).join(', ');
  await logActivity(clientId, auth.user.id, 'general', `Updated client fields: ${changed}`);

  return NextResponse.json({ ok: true });
}
