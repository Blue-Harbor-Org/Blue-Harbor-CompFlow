import { NextResponse } from 'next/server';
import { requireTeamMember, isAuthError } from '@/lib/auth-guard';
import { createAdminClient } from '@/lib/supabase';

export async function PATCH(request: Request) {
  const auth = await requireTeamMember();
  if (isAuthError(auth)) return auth;

  const { buildoutId, cmsData } = await request.json() as {
    buildoutId?: string;
    cmsData?: Record<string, string>;
  };
  if (!buildoutId) return NextResponse.json({ error: 'Missing buildoutId' }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin
    .from('bh_site_buildouts')
    .update({ cms_data: cmsData ?? {}, updated_at: new Date().toISOString() })
    .eq('id', buildoutId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
