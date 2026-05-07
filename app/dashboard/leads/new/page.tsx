import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import AdminNav from '@/components/layout/AdminNav';
import ManualLeadForm from '@/components/admin/ManualLeadForm';

export default async function NewLeadPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  return (
    <div style={{ background: 'var(--navy)', minHeight: '100vh' }}>
      <AdminNav userEmail={user.email} />

      <div className="admin-main">
        <div
          className="sticky top-0 z-30 flex items-center gap-4 px-4 py-4 md:px-8 md:py-5"
          style={{
            background: 'rgba(5,12,26,0.95)',
            borderBottom: '1px solid var(--border)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <h1 className="font-heading text-xl" style={{ color: 'var(--light)' }}>
            Add Lead Manually
          </h1>
        </div>

        <div className="max-w-2xl p-4 md:p-8">
          <ManualLeadForm />
        </div>
      </div>
    </div>
  );
}
