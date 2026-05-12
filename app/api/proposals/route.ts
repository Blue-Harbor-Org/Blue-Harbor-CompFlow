import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { slugify } from '@/lib/slugify';
import type { ProposalData } from '@/types/proposal';

export async function POST(request: NextRequest) {
  const session = await createServerSupabaseClient();
  const { data: { user } } = await session.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { clientId, proposalData } = body as {
    clientId: string;
    proposalData: ProposalData;
  };

  if (!clientId || !proposalData) {
    return NextResponse.json({ error: 'Missing clientId or proposalData' }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: client } = await admin
    .from('leads')
    .select('business_name')
    .eq('id', clientId)
    .single();

  const slug = slugify(
    `${client?.business_name || 'proposal'}-${Date.now().toString(36)}`
  );

  const { data: proposal, error } = await admin
    .from('bh_proposals')
    .insert({
      client_id: clientId,
      created_by: user.id,
      title: proposalData.title,
      tagline: proposalData.tagline,
      prep_date: proposalData.prepDate,
      situation_summary: proposalData.situationSummary,
      battlecard: proposalData.battlecard,
      deliverables: proposalData.deliverables,
      pricing: proposalData.pricing,
      roadmap: proposalData.roadmap,
      closing: proposalData.closing,
      status: 'proposal_draft',
      public_slug: slug,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ proposal });
}

export async function PUT(request: NextRequest) {
  const session = await createServerSupabaseClient();
  const { data: { user } } = await session.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { proposalId, proposalData, action } = body as {
    proposalId: string;
    proposalData?: ProposalData;
    action?: 'send' | 'save';
  };

  if (!proposalId) {
    return NextResponse.json({ error: 'Missing proposalId' }, { status: 400 });
  }

  const admin = createAdminClient();

  if (action === 'send') {
    const { data: proposal, error } = await admin
      .from('bh_proposals')
      .update({
        sent_at: new Date().toISOString(),
        status: 'proposal_sent',
      })
      .eq('id', proposalId)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update client status in the leads table (pipeline dashboard)
    if (proposal?.client_id) {
      await admin
        .from('leads')
        .update({ pipeline_status: 'proposal_sent', status_changed_at: new Date().toISOString() })
        .eq('id', proposal.client_id);
    }

    return NextResponse.json({ proposal });
  }

  if (!proposalData) {
    return NextResponse.json({ error: 'Missing proposalData' }, { status: 400 });
  }

  const { data: proposal, error } = await admin
    .from('bh_proposals')
    .update({
      title: proposalData.title,
      tagline: proposalData.tagline,
      prep_date: proposalData.prepDate,
      situation_summary: proposalData.situationSummary,
      battlecard: proposalData.battlecard,
      deliverables: proposalData.deliverables,
      pricing: proposalData.pricing,
      roadmap: proposalData.roadmap,
      closing: proposalData.closing,
    })
    .eq('id', proposalId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ proposal });
}
