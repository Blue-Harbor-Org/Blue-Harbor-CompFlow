import { notFound } from 'next/navigation';
import IntakeForm from '@/components/intake/IntakeForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Client Intake — Blue Harbor',
  description: 'Complete your onboarding intake form for Blue Harbor.',
};

interface Props {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function IntakePage({ params, searchParams }: Props) {
  const { clientId } = await params;
  const { token } = await searchParams;

  if (!token) notFound();

  return <IntakeForm clientId={clientId} intakeToken={token} />;
}
