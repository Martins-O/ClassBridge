import { AssessmentTakeContent } from './AssessmentTakeContent';
import AuthGuard from '@/components/AuthGuard';

type AssessmentPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AssessmentPage({ params }: AssessmentPageProps) {
  const resolvedParams = await params;

  return (
    <AuthGuard>
      <AssessmentTakeContent params={resolvedParams} />
    </AuthGuard>
  );
}
