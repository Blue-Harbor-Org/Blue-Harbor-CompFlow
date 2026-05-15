import { NextResponse } from 'next/server';
import { requireTeamMember, isAuthError } from '@/lib/auth-guard';
import { createAdminClient } from '@/lib/supabase';

const VERCEL_API = 'https://api.vercel.com';

export async function POST(request: Request) {
  const auth = await requireTeamMember();
  if (isAuthError(auth)) return auth;

  const { buildoutId } = await request.json() as { buildoutId?: string };
  if (!buildoutId) return NextResponse.json({ error: 'Missing buildoutId' }, { status: 400 });

  const token = process.env.VERCEL_API_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;

  if (!token || token === 'your_vercel_api_token') {
    console.warn('[buildout-deploy] VERCEL_API_TOKEN missing; deployment skipped.');
    return NextResponse.json({ error: 'Vercel API token not configured' }, { status: 500 });
  }

  const admin = createAdminClient();
  const [{ data: buildout }, { data: pages }] = await Promise.all([
    admin.from('bh_site_buildouts').select('*').eq('id', buildoutId).single(),
    admin.from('bh_buildout_pages').select('*').eq('buildout_id', buildoutId).order('slug'),
  ]);

  if (!buildout) return NextResponse.json({ error: 'Buildout not found' }, { status: 404 });

  const files = (pages ?? []).map((page) => ({
    file: page.slug === 'index' ? 'index.html' : `${page.slug}.html`,
    data: Buffer.from(page.html_content ?? '').toString('base64'),
    encoding: 'base64',
  }));

  if (files.length === 0) {
    return NextResponse.json({ error: 'No generated pages to deploy' }, { status: 400 });
  }

  const projectName = `compflow-site-${String(buildoutId).slice(0, 8)}`;
  const teamQuery = teamId && teamId !== 'your_vercel_team_id_or_empty' ? `?teamId=${teamId}` : '';
  const deployRes = await fetch(`${VERCEL_API}/v13/deployments${teamQuery}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: projectName,
      files,
      projectSettings: { framework: null },
      target: 'production',
    }),
  });

  if (!deployRes.ok) {
    const detail = await deployRes.text();
    console.error('[buildout-deploy] Vercel error:', detail);
    await admin
      .from('bh_site_buildouts')
      .update({
        status: 'failed',
        error_message: detail,
        updated_at: new Date().toISOString(),
      })
      .eq('id', buildoutId);
    return NextResponse.json({ error: 'Vercel deployment failed', detail }, { status: 500 });
  }

  const deployment = await deployRes.json() as {
    id?: string;
    url?: string;
    projectId?: string;
  };
  const previewUrl = deployment.url ? `https://${deployment.url}` : null;

  await admin
    .from('bh_site_buildouts')
    .update({
      status: 'deployed',
      vercel_project_id: deployment.projectId ?? null,
      vercel_deployment_id: deployment.id ?? null,
      preview_url: previewUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', buildoutId);

  return NextResponse.json({
    previewUrl,
    deploymentId: deployment.id,
    projectId: deployment.projectId,
  });
}
