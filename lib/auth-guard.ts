import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import type { User } from '@supabase/supabase-js';

export type TeamMember = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  avatar_url: string | null;
};

export type AuthResult = {
  user: User;
  member: TeamMember;
};

const FORBIDDEN = NextResponse.json(
  { error: 'Forbidden – not a team member' },
  { status: 403 }
);

const UNAUTHORIZED = NextResponse.json(
  { error: 'Unauthorized' },
  { status: 401 }
);

/**
 * Verifies the request comes from an authenticated user who exists in
 * bh_team_members. Returns the user + member row or a NextResponse error.
 */
export async function requireTeamMember(): Promise<AuthResult | NextResponse> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return UNAUTHORIZED;

  const admin = createAdminClient();
  const { data: member } = await admin
    .from('bh_team_members')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!member) return FORBIDDEN;

  return { user, member: member as TeamMember };
}

/**
 * Same as requireTeamMember but also enforces role = 'admin'.
 */
export async function requireAdmin(): Promise<AuthResult | NextResponse> {
  const result = await requireTeamMember();

  if (result instanceof NextResponse) return result;

  if (result.member.role !== 'admin') {
    return NextResponse.json(
      { error: 'Forbidden – admin role required' },
      { status: 403 }
    );
  }

  return result;
}

/** Type guard to check if the result is an error response. */
export function isAuthError(result: AuthResult | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}
