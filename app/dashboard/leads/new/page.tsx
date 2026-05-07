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

      <div className="ml-60">
        {/* Top bar */}
        <div
          className="sticky top-0 z-30 px-8 py-5 flex items-center gap-4"
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

        <div className="p-8 max-w-2xl">
          <ManualLeadForm />
        </div>
      </div>
    </div>
  );
}
