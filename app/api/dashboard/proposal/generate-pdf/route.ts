import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { requireTeamMember, isAuthError } from '@/lib/auth-guard';
import { getBhClientContext } from '@/lib/bh-client-context';
import { generateProposalContent } from '@/lib/proposal-generator';
import { generateProposalPdf, isHtmlProposalBuffer } from '@/lib/proposal-pdf';
import type { ProposalData } from '@/lib/proposal-template';
import { extractProposalReportContext } from '@/lib/proposal-report-context';
import type { ReportData } from '@/types/report';

export const maxDuration = 120;

function readArchetypeNameFromHtml(html: string | null | undefined): string | undefined {
  return html?.match(/<meta\s+name=["']bh-archetype-name["']\s+content=["']([^"']+)["']/i)?.[1];
}

export async function POST(req: Request) {
  const auth = await requireTeamMember();
  if (isAuthError(auth)) return auth;

  const admin = createAdminClient();
  const body = (await req.json()) as { clientId?: string; mockupId?: string | null };
  const { clientId, mockupId } = body;
  if (!clientId) {
    return NextResponse.json({ error: 'Missing clientId' }, { status: 400 });
  }

  const { client, standardReport, lead } = await getBhClientContext(admin, clientId);
  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  let preparedBy = auth.member.name;
  if (client.assigned_to) {
    const { data: assignee } = await admin
      .from('bh_team_members')
      .select('name')
      .eq('user_id', client.assigned_to)
      .maybeSingle();
    if (assignee?.name) preparedBy = assignee.name;
  }

  const reportData = standardReport?.report_data
    ? (standardReport.report_data as ReportData)
    : null;
  const { findings, competitorStrengths, competitorName: reportCompetitor } =
    extractProposalReportContext(reportData);

  const competitorName =
    lead?.competitor_name || reportCompetitor || lead?.competitor_url || undefined;

  type MockupPick = { id: string; html_content: string | null };
  let mockupRow: MockupPick | null = null;
  if (mockupId) {
    const { data } = await admin
      .from('bh_site_mockups')
      .select('id, html_content, client_id')
      .eq('id', mockupId)
      .maybeSingle();
    if (data && data.client_id === clientId) {
      mockupRow = { id: data.id, html_content: data.html_content };
    }
  }
  if (!mockupRow) {
    const { data } = await admin
      .from('bh_site_mockups')
      .select('id, html_content')
      .eq('client_id', clientId)
      .eq('page_slug', 'home')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) mockupRow = data;
  }
  if (!mockupRow) {
    const { data } = await admin
      .from('bh_site_mockups')
      .select('id, html_content')
      .eq('client_id', clientId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    mockupRow = data ?? null;
  }

  const archetypeName = readArchetypeNameFromHtml(mockupRow?.html_content);

  const websiteUrl = lead?.website_url || '';
  const industry = lead?.industry || 'professional services';

  const proposalNumber = `BH-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
  const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const content = await generateProposalContent({
    businessName: client.company_name ?? 'Your Business',
    industry,
    contactName: client.contact_name ?? 'Valued Client',
    websiteUrl,
    reportFindings: findings.length > 0 ? findings : undefined,
    competitorName,
    competitorStrengths: competitorStrengths.length > 0 ? competitorStrengths : undefined,
    archetypeName,
    preparedBy,
  });

  const proposalPayload: ProposalData = {
    businessName: client.company_name ?? 'Your Business',
    contactName: client.contact_name ?? 'Valued Client',
    contactEmail: client.contact_email ?? '',
    industry,
    websiteUrl,
    reportFindings: findings.length > 0 ? findings : undefined,
    competitorName,
    competitorStrengths: competitorStrengths.length > 0 ? competitorStrengths : undefined,
    archetypeName,
    proposalNumber,
    preparedBy,
    validUntil,
    ...content,
  };

  const pdfBuffer = await generateProposalPdf(proposalPayload);
  const isHtmlFallback = isHtmlProposalBuffer(pdfBuffer);
  const ext = isHtmlFallback ? 'html' : 'pdf';
  const fileName = `proposals/${clientId}/${proposalNumber}.${ext}`;
  const contentType = isHtmlFallback ? 'text/html' : 'application/pdf';

  const { error: storageError } = await admin.storage
    .from('documents')
    .upload(fileName, pdfBuffer, { contentType, upsert: true });

  if (storageError) {
    console.error('[proposal] Storage error:', storageError);
    return NextResponse.json(
      { error: 'Failed to upload proposal file', detail: storageError.message },
      { status: 500 }
    );
  }

  const { data: pub } = admin.storage.from('documents').getPublicUrl(fileName);
  const publicUrl = pub.publicUrl;

  const { data: latestProposal } = await admin
    .from('bh_proposals')
    .select('id')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestProposal?.id) {
    const includes = content.investmentTier.includes;
    const { error: updateErr } = await admin
      .from('bh_proposals')
      .update({
        pdf_url: publicUrl,
        proposal_number: proposalNumber,
        investment_amount: content.investmentTier.price,
        monthly_hosting: content.investmentTier.monthlyHosting,
        investment_tier_name: content.investmentTier.name,
        investment_includes: includes,
        scope_of_work: content.scopeOfWork,
        client_timeline: content.timeline,
        executive_summary: content.executiveSummary,
        valid_until: validUntil,
        updated_at: new Date().toISOString(),
      })
      .eq('id', latestProposal.id);
    if (updateErr) {
      console.warn('[proposal] bh_proposals update skipped or failed:', updateErr.message);
    }
  }

  return NextResponse.json({
    proposalNumber,
    pdfUrl: publicUrl,
    isHtmlFallback,
    investmentAmount: content.investmentTier.price,
    validUntil,
  });
}
