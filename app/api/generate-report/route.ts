import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase';
import { scrapeWebsite } from '@/lib/scraper';
import { analyzeWithClaude } from '@/lib/analyzeWithClaude';
import { sendReportReadyEmail } from '@/lib/resend';
import { REPORT_MODEL_COOKIE, resolveReportModelId } from '@/lib/reportModel';
import { normalizeIndustryId } from '@/lib/verticals';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      leadId?: string;
      industry?: string;
      regenerate?: boolean;
    };
    const { leadId, industry: industryFromBody, regenerate } = body;

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

    let industryForReport =
      typeof lead.industry === 'string' && lead.industry.length > 0
        ? lead.industry
        : 'general';

    if (typeof industryFromBody === 'string' && industryFromBody.trim().length > 0) {
      const industryId = normalizeIndustryId(industryFromBody);
      await supabase.from('leads').update({ industry: industryId }).eq('id', leadId);
      industryForReport = industryId;
    }

    // Scrape both sites in parallel
    const [clientContent, competitorContent] = await Promise.all([
      scrapeWebsite(lead.website_url),
      scrapeWebsite(lead.competitor_url),
    ]);

    const competitorName = lead.competitor_name || lead.competitor_url;

    const reportData = await analyzeWithClaude(
      clientContent,
      competitorContent,
      lead.business_name,
      lead.website_url,
      competitorName,
      lead.competitor_url,
      industryForReport,
      modelId
    );

    // Update competitor_name if not set
    if (!lead.competitor_name && reportData.meta.competitorName) {
      await supabase
        .from('leads')
        .update({ competitor_name: reportData.meta.competitorName })
        .eq('id', leadId);
    }

    const { data: existingReport } = await supabase
      .from('reports')
      .select('id')
      .eq('lead_id', leadId)
      .eq('report_type', 'standard')
      .maybeSingle();

    if (existingReport) {
      await supabase
        .from('reports')
        .update({ report_data: reportData })
        .eq('id', existingReport.id);
    } else {
      await supabase.from('reports').insert({
        lead_id: leadId,
        report_data: reportData,
        report_type: 'standard',
      });
    }

    // Update lead status
    await supabase
      .from('leads')
      .update({ status: 'report_ready' })
      .eq('id', leadId);

    if (!regenerate) {
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
      }
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
