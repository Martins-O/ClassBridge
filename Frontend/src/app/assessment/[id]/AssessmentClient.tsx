'use client';

import { AssessmentTakeContent } from './AssessmentTakeContent';
import AuthGuard from '@/components/AuthGuard';

export default function AssessmentClient({ id }: { id: string }) {
  return (
    <AuthGuard>
      <AssessmentTakeContent params={{ id }} />
    </AuthGuard>
  );
}
