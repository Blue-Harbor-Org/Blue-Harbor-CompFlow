import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { requireTeamMember, isAuthError } from '@/lib/auth-guard';
import { getBhClientLeadId } from '@/lib/bh-client-context';
import { slugify } from '@/lib/slugify';
import type { ProposalData } from '@/types/proposal';

export async function POST(request: NextRequest) {
  const auth = await requireTeamMember();
  if (isAuthError(auth)) return auth;
  const { user } = auth;

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
    .from('bh_clients')
    .select('id, company_name')
    .eq('id', clientId)
    .maybeSingle();

  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  const slug = slugify(
    `${client.company_name || 'proposal'}-${Date.now().toString(36)}`
  );

  const { data: proposal, error } = await admin
    .from('bh_proposals')
    .insert({
      client_id: client.id,
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
  const auth = await requireTeamMember();
  if (isAuthError(auth)) return auth;

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

    // Update client pipeline status in bh_clients and keep the linked lead in sync.
    if (proposal?.client_id) {
      await admin
        .from('bh_clients')
        .update({ status: 'proposal_sent' })
        .eq('id', proposal.client_id);

      const leadId = await getBhClientLeadId(admin, proposal.client_id);
      if (leadId) {
        await admin
          .from('leads')
          .update({ status: 'proposal_sent' })
          .eq('id', leadId);
      }
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
