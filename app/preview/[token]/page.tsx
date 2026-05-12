import { notFound } from 'next/navigation';
import { createAnonClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ token: string }>;
}

export default async function MockupPreviewPage({ params }: Props) {
  const { token } = await params;

  const supabase = createAnonClient();
  const { data: mockup } = await supabase
    .from('bh_site_mockups')
    .select('html_content, page_title, client_id')
    .eq('preview_token', token)
    .maybeSingle();

  if (!mockup) notFound();

  return (
    <iframe
      srcDoc={mockup.html_content}
      title={mockup.page_title}
      className="w-full h-screen border-0"
      sandbox="allow-scripts allow-same-origin"
    />
  );
}
