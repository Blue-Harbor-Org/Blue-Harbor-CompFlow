import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import {
  REPORT_MODEL_COOKIE,
  type ReportModelKey,
} from '@/lib/reportModel';

const ONE_YEAR = 60 * 60 * 24 * 365;

export async function GET() {
  const store = await cookies();
  const raw = store.get(REPORT_MODEL_COOKIE)?.value;
  const model: ReportModelKey = raw === 'sonnet' ? 'sonnet' : 'haiku';
  return NextResponse.json({ model });
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await req.json()) as { model?: string };
  const next = body.model === 'sonnet' ? 'sonnet' : 'haiku';

  const res = NextResponse.json({ success: true, model: next });
  res.cookies.set(REPORT_MODEL_COOKIE, next, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ONE_YEAR,
  });
  return res;
}
