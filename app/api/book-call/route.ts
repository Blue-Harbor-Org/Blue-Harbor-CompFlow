import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { sendAdminNotificationEmail } from '@/lib/resend';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { token?: string };
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: 'token is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('report_token', token)
      .single();

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Only update if currently report_ready (don't downgrade from unlocked)
    if (lead.status === 'report_ready') {
      await supabase
        .from('leads')
        .update({ status: 'call_booked' })
        .eq('id', lead.id);
    }

    // Send admin notification
    try {
      await sendAdminNotificationEmail(
        lead.business_name,
        lead.contact_name,
        lead.email,
        lead.phone,
        lead.competitor_name,
        lead.id
      );
    } catch (emailErr) {
      console.error('Admin notification email failed:', emailErr);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Book call error:', error);
    return NextResponse.json(
      { error: 'Failed to book call' },
      { status: 500 }
    );
  }
}
