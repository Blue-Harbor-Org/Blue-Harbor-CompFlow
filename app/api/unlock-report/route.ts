import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { sendUnlockEmail } from '@/lib/resend';

export async function POST(req: NextRequest) {
  try {
    // Verify admin auth
    const serverSupabase = await createServerSupabaseClient();
    const { data: { user } } = await serverSupabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json() as { leadId?: string };
    const { leadId } = body;

    if (!leadId) {
      return NextResponse.json({ error: 'leadId is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Fetch lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Fetch report
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('*')
      .eq('lead_id', leadId)
      .single();

    if (reportError || !report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Unlock the report
    await supabase
      .from('reports')
      .update({ is_unlocked: true, unlocked_at: new Date().toISOString() })
      .eq('lead_id', leadId);

    await supabase
      .from('leads')
      .update({ status: 'unlocked' })
      .eq('id', leadId);

    // Send unlock email
    const firstName = lead.contact_name.split(' ')[0];
    const competitorName =
      lead.competitor_name || report.report_data?.meta?.competitorName || lead.competitor_url;

    try {
      await sendUnlockEmail(
        lead.email,
        firstName,
        lead.business_name,
        competitorName,
        lead.report_token
      );
    } catch (emailErr) {
      console.error('Unlock email send failed:', emailErr);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unlock report error:', error);
    return NextResponse.json(
      { error: 'Failed to unlock report' },
      { status: 500 }
    );
  }
}
