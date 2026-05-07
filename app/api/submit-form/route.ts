import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { normalizeIndustryId } from '@/lib/verticals';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      contact_name: string;
      business_name: string;
      email: string;
      phone?: string;
      website_url: string;
      competitor_url: string;
      competitor_name?: string;
      notes?: string;
      unlock_immediately?: boolean;
      source?: string;
      industry?: string;
    };

    const {
      contact_name,
      business_name,
      email,
      phone,
      website_url,
      competitor_url,
      competitor_name,
      notes,
      unlock_immediately,
      source = 'public_form',
      industry,
    } = body;

    if (!contact_name || !business_name || !email || !website_url || !competitor_url) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const industryId = normalizeIndustryId(industry);

    // Duplicate check: same website + competitor within 24 hours
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: existing } = await supabase
      .from('leads')
      .select('id, report_token, status')
      .eq('website_url', website_url.trim())
      .eq('competitor_url', competitor_url.trim())
      .gte('created_at', since)
      .single();

    if (existing) {
      return NextResponse.json({
        success: true,
        leadId: existing.id,
        token: existing.report_token,
        duplicate: true,
      });
    }

    // Insert lead
    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        contact_name: contact_name.trim(),
        business_name: business_name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        website_url: website_url.trim(),
        competitor_url: competitor_url.trim(),
        competitor_name: competitor_name?.trim() || null,
        notes: notes?.trim() || null,
        source,
        industry: industryId,
      })
      .select()
      .single();

    if (error || !lead) {
      console.error('Insert lead error:', error);
      return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
    }

    // If unlock immediately is set (manual lead), auto-unlock after report is ready
    if (unlock_immediately) {
      // We'll handle this in the generate-report flow
      await supabase
        .from('leads')
        .update({ notes: (notes ? notes + '\n' : '') + '[auto-unlock]' })
        .eq('id', lead.id);
    }

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      token: lead.report_token,
      duplicate: false,
    });
  } catch (error) {
    console.error('Submit form error:', error);
    return NextResponse.json(
      { error: 'Failed to submit form' },
      { status: 500 }
    );
  }
}
