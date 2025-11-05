import AuthGuard from '@/components/AuthGuard';
import { AssessmentDetailContent } from './AssessmentDetailContent';

type AssessmentDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AssessmentDetailPage({ params }: AssessmentDetailPageProps) {
  const { id } = await params;

  return (
    <AuthGuard>
      <AssessmentDetailContent assessmentId={id} />
    </AuthGuard>
  );
}
