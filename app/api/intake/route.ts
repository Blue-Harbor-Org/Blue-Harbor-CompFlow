import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

async function validateIntakeToken(
  supabase: ReturnType<typeof createAdminClient>,
  clientId: string,
  token: string | null
) {
  if (!token) return false;
  const { data } = await supabase
    .from('bh_clients')
    .select('id')
    .eq('id', clientId)
    .eq('intake_token', token)
    .maybeSingle();
  return !!data;
}

function parseGeoFocus(value: string | null) {
  if (!value) return [];
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseTestimonials(value: string | null) {
  if (!value) return [];
  return value
    .split('\n---\n')
    .map((text, index) => ({ id: `testimonial-${index + 1}`, text: text.trim() }))
    .filter((entry) => entry.text.length > 0);
}

export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get('clientId');
  if (!clientId) {
    return NextResponse.json({ error: 'clientId required' }, { status: 400 });
  }

  const supabase = createAdminClient();

  const intakeToken = req.headers.get('x-intake-token');
  if (!(await validateIntakeToken(supabase, clientId, intakeToken))) {
    return NextResponse.json({ error: 'Invalid or missing intake token' }, { status: 403 });
  }

  const { data: client, error: clientErr } = await supabase
    .from('bh_clients')
    .select('id, company_name, contact_email, contact_phone')
    .eq('id', clientId)
    .single();

  if (clientErr || !client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  const { data: submission } = await supabase
    .from('bh_intake_submissions')
    .select('*')
    .eq('client_id', clientId)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const normalizedClient = {
    id: client.id,
    company_name: client.company_name,
    email: client.contact_email,
    phone: client.contact_phone,
    address: null,
    organization_id: '',
  };

  const normalizedSubmission = submission
    ? {
        ...submission,
        current_step: 1,
        company_name: client.company_name,
        total_loan_volume: submission.total_volume,
        total_deals_closed: submission.deals_closed,
        deal_history: submission.deal_examples ?? [],
        physical_address: submission.address,
        direct_lending_min: submission.loan_min,
        direct_lending_max: submission.loan_max,
        brokered_loan_min: null,
        brokered_loan_max: null,
        geographic_focus: parseGeoFocus(submission.geo_focus),
        geographic_focus_other: '',
        property_types_served: [],
        testimonials: parseTestimonials(submission.testimonials),
        awards_press: submission.existing_copy ?? '',
        marketing_file_urls: [],
      }
    : null;

  return NextResponse.json({ client: normalizedClient, submission: normalizedSubmission });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { clientId, formData, completed } = body;

  if (!clientId) {
    return NextResponse.json({ error: 'clientId required' }, { status: 400 });
  }

  const supabase = createAdminClient();

  const intakeToken = req.headers.get('x-intake-token');
  if (!(await validateIntakeToken(supabase, clientId, intakeToken))) {
    return NextResponse.json({ error: 'Invalid or missing intake token' }, { status: 403 });
  }

  const { data: client } = await supabase
    .from('bh_clients')
    .select('id')
    .eq('id', clientId)
    .single();

  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  const { data: existing } = await supabase
    .from('bh_intake_submissions')
    .select('id')
    .eq('client_id', clientId)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const row = {
    client_id: clientId,
    completed: completed ?? false,
    total_volume: formData.total_loan_volume || null,
    years_in_business: formData.years_in_business || null,
    deals_closed: formData.total_deals_closed || null,
    deal_examples: formData.deal_history ?? [],
    office_phone: formData.office_phone || null,
    contact_email: formData.contact_email || null,
    address: formData.physical_address || null,
    john_cell: formData.john_cell || null,
    craig_cell: formData.craig_cell || null,
    loan_min: formData.direct_lending_min || null,
    loan_max: formData.direct_lending_max || null,
    geo_focus: Array.isArray(formData.geographic_focus)
      ? [
          ...formData.geographic_focus,
          formData.geographic_focus_other || '',
        ].filter(Boolean).join(', ')
      : formData.geographic_focus || null,
    testimonials: Array.isArray(formData.testimonials)
      ? formData.testimonials.map((t: { text?: string }) => t.text ?? '').filter(Boolean).join('\n---\n')
      : formData.testimonials || null,
    team_bios: formData.team_bios ?? [],
    existing_copy: formData.awards_press || null,
    submitted_at: new Date().toISOString(),
  };

  let result;

  if (existing) {
    result = await supabase
      .from('bh_intake_submissions')
      .update(row)
      .eq('id', existing.id)
      .select()
      .single();
  } else {
    result = await supabase
      .from('bh_intake_submissions')
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
      .from('bh_clients')
      .update({ status: 'intake_complete' })
      .eq('id', clientId);
  }

  return NextResponse.json({ submission: result.data });
}
