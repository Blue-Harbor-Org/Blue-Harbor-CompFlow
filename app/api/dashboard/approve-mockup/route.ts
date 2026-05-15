import { NextRequest, NextResponse } from 'next/server';
import { requireTeamMember, isAuthError } from '@/lib/auth-guard';
import { logActivity } from '@/lib/dashboard';

export async function POST(req: NextRequest) {
  const auth = await requireTeamMember();
  if (isAuthError(auth)) return auth;

  const body = (await req.json()) as { clientId?: string; archetypeName?: string };
  const { clientId, archetypeName } = body;
  if (!clientId) {
    return NextResponse.json({ error: 'clientId required' }, { status: 400 });
  }

  const label = archetypeName?.trim() || 'selected style';
  await logActivity(
    clientId,
    auth.user.id,
    'general',
    `Mockup approved — ${label} style`,
    { action: 'mockup_approved' }
  );

  return NextResponse.json({ ok: true });
}
