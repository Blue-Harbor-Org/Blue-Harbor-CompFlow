import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { requireTeamMember, isAuthError } from '@/lib/auth-guard';
import { findCompetitors } from '@/lib/findCompetitors';
import type { CompetitorEntry } from '@/types/lead';
import { parseCompetitors, domainsMatch } from '@/lib/competitorLead';

export async function POST(req: NextRequest) {
  try {
    const auth = await requireTeamMember();
    if (isAuthError(auth)) return auth;

    const body = (await req.json()) as { leadId?: string };
    const leadId = body.leadId;
    if (!leadId) {
      return NextResponse.json({ error: 'leadId required' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: lead, error } = await admin
      .from('leads')
      .select('website_url, industry, competitors')
      .eq('id', leadId)
      .single();

    if (error || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const websiteUrl = lead.website_url as string;
    const industry =
      typeof lead.industry === 'string' && lead.industry.length > 0
        ? lead.industry
        : 'general';

    const autoFound = await findCompetitors(websiteUrl, industry, 5);
    const existing = parseCompetitors(lead.competitors);
    const manualOnes = existing.filter((c) => !c.autoFound);

    const merged: CompetitorEntry[] = [...manualOnes];
    for (const c of autoFound) {
      if (merged.length >= 3) break;
      if (manualOnes.some((m) => domainsMatch(m.url, c.url))) continue;
      if (merged.some((m) => domainsMatch(m.url, c.url))) continue;
      merged.push(c);
    }

    const competitors = merged.slice(0, 3);
    const first = competitors[0];

    await admin
      .from('leads')
      .update({
        competitors,
        competitor_url: first?.url ?? null,
        competitor_name: first?.name ?? null,
      })
      .eq('id', leadId);

    return NextResponse.json({ competitors });
  } catch (e) {
    console.error('[find-competitors]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
