import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase';
import { scrapeWebsite } from '@/lib/scraper';
import { analyzeWithClaude } from '@/lib/analyzeWithClaude';
import { sendReportReadyEmail } from '@/lib/resend';
import { REPORT_MODEL_COOKIE, resolveReportModelId } from '@/lib/reportModel';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { leadId?: string };
    const { leadId } = body;

    const cookieStore = await cookies();
    const modelId = resolveReportModelId(
      cookieStore.get(REPORT_MODEL_COOKIE)?.value
    );

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

    // Scrape both sites in parallel
    const [clientContent, competitorContent] = await Promise.all([
      scrapeWebsite(lead.website_url),
      scrapeWebsite(lead.competitor_url),
    ]);

    const competitorName = lead.competitor_name || lead.competitor_url;

    // Analyze with Claude
    const industry =
      typeof lead.industry === 'string' && lead.industry.length > 0
        ? lead.industry
        : 'general';

    const reportData = await analyzeWithClaude(
      clientContent,
      competitorContent,
      lead.business_name,
      lead.website_url,
      competitorName,
      lead.competitor_url,
      industry,
      modelId
    );

    // Update competitor_name if not set
    if (!lead.competitor_name && reportData.meta.competitorName) {
      await supabase
        .from('leads')
        .update({ competitor_name: reportData.meta.competitorName })
        .eq('id', leadId);
    }

    // Check if report already exists
    const { data: existingReport } = await supabase
      .from('reports')
      .select('id')
      .eq('lead_id', leadId)
      .single();

    if (existingReport) {
      await supabase
        .from('reports')
        .update({ report_data: reportData })
        .eq('lead_id', leadId);
    } else {
      await supabase
        .from('reports')
        .insert({ lead_id: leadId, report_data: reportData });
    }

    // Update lead status
    await supabase
      .from('leads')
      .update({ status: 'report_ready' })
      .eq('id', leadId);

    // Send email
    const firstName = lead.contact_name.split(' ')[0];
    try {
      await sendReportReadyEmail(
        lead.email,
        firstName,
        lead.business_name,
        reportData.meta.competitorName || competitorName,
        lead.report_token,
        reportData
      );
    } catch (emailErr) {
      console.error('Email send failed:', emailErr);
      // Don't fail the whole request for email errors
    }

    return NextResponse.json({
      success: true,
      token: lead.report_token,
    });
  } catch (error) {
    console.error('Generate report error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
