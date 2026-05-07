import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { sendDeepDiveUnlocked } from '@/lib/resend';

export async function POST(req: NextRequest) {
  try {
    const serverSupabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await serverSupabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json() as { leadId?: string };
    const { leadId } = body;

    if (!leadId) {
      return NextResponse.json({ error: 'leadId is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const { data: deepReport, error: reportError } = await supabase
      .from('reports')
      .select('*')
      .eq('lead_id', leadId)
      .eq('report_type', 'deepdive')
      .maybeSingle();

    if (reportError || !deepReport) {
      return NextResponse.json(
        { error: 'Deep dive report not found' },
        { status: 404 }
      );
    }

    await supabase
      .from('reports')
      .update({
        is_unlocked: true,
        unlocked_at: new Date().toISOString(),
      })
      .eq('id', deepReport.id);

    await supabase
      .from('leads')
      .update({
        deepdive_status: 'unlocked',
        deepdive_unlocked_at: new Date().toISOString(),
      })
      .eq('id', leadId);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const deepDiveUrl = `${appUrl}/report/${lead.report_token}/deepdive`;

    try {
      await sendDeepDiveUnlocked(lead, deepDiveUrl);
    } catch (emailErr) {
      console.error('Deep dive unlock email failed:', emailErr);
    }

    return NextResponse.json({
      success: true,
      deepdiveUrl: deepDiveUrl,
    });
  } catch (error) {
    console.error('unlock-deepdive error:', error);
    return NextResponse.json(
      { error: 'Failed to unlock deep dive' },
      { status: 500 }
    );
  }
}
