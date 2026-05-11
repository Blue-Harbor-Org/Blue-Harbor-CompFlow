import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import type { LeadStatus } from '@/types/lead';

const ALLOWED: LeadStatus[] = [
  'pending',
  'report_ready',
  'call_booked',
  'unlocked',
  'proposal_sent',
  'closed_won',
  'closed_lost',
];

export async function POST(req: NextRequest) {
  try {
    const serverSupabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await serverSupabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json() as { leadId?: string; status?: string };
    const { leadId, status } = body;

    if (!leadId || typeof status !== 'string') {
      return NextResponse.json(
        { error: 'leadId and status are required' },
        { status: 400 }
      );
    }

    if (!ALLOWED.includes(status as LeadStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from('leads')
      .update({ status })
      .eq('id', leadId);

    if (error) {
      console.error('[lead-status]', error);
      return NextResponse.json(
        { error: error.message || 'Update failed' },
        { status: 500 }
      );
    }

    revalidatePath('/dashboard');
    revalidatePath(`/dashboard/leads/${leadId}`);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('lead-status:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
