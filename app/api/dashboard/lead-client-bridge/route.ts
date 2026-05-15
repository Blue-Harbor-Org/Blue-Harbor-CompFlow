import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { requireTeamMember, isAuthError } from '@/lib/auth-guard';
import { getClientIdForLeadId, getClient, getActivityLog } from '@/lib/dashboard';

export async function GET(req: NextRequest) {
  const auth = await requireTeamMember();
  if (isAuthError(auth)) return auth;

  const leadId = req.nextUrl.searchParams.get('leadId');
  if (!leadId) {
    return NextResponse.json({ error: 'leadId required' }, { status: 400 });
  }

  const admin = createAdminClient();
  const clientId = await getClientIdForLeadId(admin, leadId);
  if (!clientId) {
    return NextResponse.json({ clientId: null, portalToken: null, activity: [] });
  }

  const [client, activity] = await Promise.all([
    getClient(clientId),
    getActivityLog(clientId),
  ]);

  return NextResponse.json({
    clientId,
    portalToken: client?.portal_token ?? null,
    activity: activity.slice(0, 5),
  });
}
