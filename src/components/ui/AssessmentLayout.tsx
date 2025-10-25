import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { PageShell } from './PageShell';
import { Card } from './Card';

interface AssessmentLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  timeRemaining?: number;
  progress?: number;
  className?: string;
}

function formatTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function AssessmentLayout({
  children,
  title,
  description,
  timeRemaining,
  progress,
  className
}: AssessmentLayoutProps) {
  return (
    <PageShell className={cn("max-w-4xl", className)}>
      {/* Header Card */}
      <Card className="p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-ink-900 mb-2">{title}</h1>
            {description && (
              <p className="text-ink-600">{description}</p>
            )}
          </div>

          {timeRemaining !== undefined && (
            <div className="text-right">
              <div className="text-sm text-ink-500 mb-1">Time Remaining</div>
              <div className={cn(
                "text-2xl font-bold",
                timeRemaining < 300000 ? 'text-danger' : 'text-ink-900'
              )}>
                {formatTime(timeRemaining)}
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {progress !== undefined && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-ink-600 mb-2">
              <span>Overall Progress</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-surface-subtle rounded-full h-2">
              <div
                className="bg-brand-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Content */}
      {children}
    </PageShell>
  );
}