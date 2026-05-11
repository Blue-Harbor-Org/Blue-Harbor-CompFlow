import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import AdminShell from '@/components/admin/AdminShell';
import ManualLeadForm from '@/components/admin/ManualLeadForm';

export default async function NewLeadPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  return (
    <AdminShell
      userEmail={user.email}
      title="New Lead"
      subtitle="Create manually"
      headerActions={
        <Link href="/dashboard" className="btn-ghost min-h-[44px] px-4 py-2 text-sm">
          ← Pipeline
        </Link>
      }
    >
      <div className="max-w-2xl p-4 md:p-8">
        <ManualLeadForm />
      </div>
    </AdminShell>
  );
}
