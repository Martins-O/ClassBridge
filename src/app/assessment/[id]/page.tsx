import { AssessmentTakeContent } from './AssessmentTakeContent';
import AuthGuard from '@/components/AuthGuard';

export default function AssessmentPage({ params }: { params: { id: string } }) {
  return (
    <AuthGuard>
      <AssessmentTakeContent params={params} />
    </AuthGuard>
  );
}
