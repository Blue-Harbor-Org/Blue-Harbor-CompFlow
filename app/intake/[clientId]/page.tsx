import IntakeForm from '@/components/intake/IntakeForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Client Intake — Blue Harbor',
  description: 'Complete your onboarding intake form for Blue Harbor.',
};

interface Props {
  params: Promise<{ clientId: string }>;
}

export default async function IntakePage({ params }: Props) {
  const { clientId } = await params;

  return <IntakeForm clientId={clientId} />;
}
