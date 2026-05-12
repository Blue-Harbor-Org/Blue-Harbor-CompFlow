import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get('clientId');
  if (!clientId) {
    return NextResponse.json({ error: 'clientId required' }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: client, error: clientErr } = await supabase
    .from('clients')
    .select('id, company_name, email, phone, address, organization_id')
    .eq('id', clientId)
    .single();

  if (clientErr || !client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  const { data: submission } = await supabase
    .from('intake_submissions')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({ client, submission });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { clientId, formData, currentStep, completed } = body;

  if (!clientId) {
    return NextResponse.json({ error: 'clientId required' }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: client } = await supabase
    .from('clients')
    .select('id, organization_id')
    .eq('id', clientId)
    .single();

  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  const { data: existing } = await supabase
    .from('intake_submissions')
    .select('id')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const row = {
    client_id: clientId,
    organization_id: client.organization_id,
    current_step: currentStep ?? 1,
    completed: completed ?? false,
    company_name: formData.company_name || null,
    years_in_business: formData.years_in_business || null,
    total_loan_volume: formData.total_loan_volume || null,
    total_deals_closed: formData.total_deals_closed || null,
    deal_history: formData.deal_history ?? [],
    office_phone: formData.office_phone || null,
    contact_email: formData.contact_email || null,
    physical_address: formData.physical_address || null,
    john_cell: formData.john_cell || null,
    craig_cell: formData.craig_cell || null,
    direct_lending_min: formData.direct_lending_min || null,
    direct_lending_max: formData.direct_lending_max || null,
    brokered_loan_min: formData.brokered_loan_min || null,
    brokered_loan_max: formData.brokered_loan_max || null,
    geographic_focus: formData.geographic_focus ?? [],
    geographic_focus_other: formData.geographic_focus_other || null,
    property_types_served: formData.property_types_served ?? [],
    testimonials: formData.testimonials ?? [],
    team_bios: formData.team_bios ?? [],
    awards_press: formData.awards_press || null,
    marketing_file_urls: formData.marketing_file_urls ?? [],
    updated_at: new Date().toISOString(),
  };

  let result;

  if (existing) {
    result = await supabase
      .from('intake_submissions')
      .update(row)
      .eq('id', existing.id)
      .select()
      .single();
  } else {
    result = await supabase
      .from('intake_submissions')
      .insert(row)
      .select()
      .single();
  }

  if (result.error) {
    console.error('[intake] save error:', result.error);
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  if (completed) {
    await supabase
      .from('clients')
      .update({ notes: 'intake_complete' })
      .eq('id', clientId);
  }

  return NextResponse.json({ submission: result.data });
}
