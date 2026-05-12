import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { AdminThemeProvider } from '@/components/admin/AdminThemeProvider';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/unauthorized');
  }

  const admin = createAdminClient();
  const { data: member } = await admin
    .from('bh_team_members')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!member) {
    redirect('/unauthorized');
  }

  return <AdminThemeProvider>{children}</AdminThemeProvider>;
}
