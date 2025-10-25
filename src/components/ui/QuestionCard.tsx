import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card } from './Card';

interface QuestionCardProps {
  questionNumber: number;
  totalQuestions: number;
  question: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function QuestionCard({
  questionNumber,
  totalQuestions,
  question,
  required = false,
  children,
  className
}: QuestionCardProps) {
  return (
    <Card className={cn('p-8', className)}>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="bg-brand-100 text-brand-800 px-3 py-1 rounded-full text-sm font-medium">
              Question {questionNumber} of {totalQuestions}
            </span>
            {required && (
              <span className="text-danger text-sm font-medium">Required</span>
            )}
          </div>
        </div>

        <h2 className="text-xl font-semibold text-ink-900 leading-relaxed">
          {question}
        </h2>
      </div>

      <div className="space-y-4">
        {children}
      </div>
    </Card>
  );
}