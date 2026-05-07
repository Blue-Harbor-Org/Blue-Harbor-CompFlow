import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { randomBytes } from 'node:crypto';
import { createAdminClient } from '@/lib/supabase';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { generateDeepDiveReport } from '@/lib/generateDeepDiveReport';
import { REPORT_MODEL_COOKIE, resolveReportModelId } from '@/lib/reportModel';
import type { Lead } from '@/types/lead';

export const maxDuration = 300;

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

    const cookieStore = await cookies();
    const modelId = resolveReportModelId(
      cookieStore.get(REPORT_MODEL_COOKIE)?.value
    );

    const supabase = createAdminClient();

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const leadRow = lead as Lead;

    if (leadRow.deepdive_status === 'generating') {
      return NextResponse.json(
        { error: 'Deep dive generation already in progress' },
        { status: 409 }
      );
    }

    const { data: existingDeep } = await supabase
      .from('reports')
      .select('id, deepdive_token, report_data')
      .eq('lead_id', leadId)
      .eq('report_type', 'deepdive')
      .maybeSingle();

    if (existingDeep?.report_data) {
      return NextResponse.json({
        success: true,
        deepdiveToken: existingDeep.deepdive_token,
        existing: true,
      });
    }

    await supabase
      .from('leads')
      .update({ deepdive_status: 'generating' })
      .eq('id', leadId);

    try {
      const reportData = await generateDeepDiveReport(leadRow, modelId);
      const token =
        existingDeep?.deepdive_token ?? randomBytes(32).toString('hex');

      if (existingDeep) {
        await supabase
          .from('reports')
          .update({
            report_data: reportData,
            deepdive_token: existingDeep.deepdive_token ?? token,
          })
          .eq('id', existingDeep.id);
      } else {
        await supabase.from('reports').insert({
          lead_id: leadId,
          report_data: reportData,
          report_type: 'deepdive',
          deepdive_token: token,
          is_unlocked: false,
        });
      }

      await supabase
        .from('leads')
        .update({ deepdive_status: 'ready' })
        .eq('id', leadId);

      return NextResponse.json({
        success: true,
        deepdiveToken: token,
        existing: false,
      });
    } catch (genErr) {
      console.error('Deep dive generation failed:', genErr);
      await supabase
        .from('leads')
        .update({ deepdive_status: null })
        .eq('id', leadId);
      throw genErr;
    }
  } catch (error) {
    console.error('generate-deepdive error:', error);
    return NextResponse.json(
      { error: 'Failed to generate deep dive report' },
      { status: 500 }
    );
  }
}
