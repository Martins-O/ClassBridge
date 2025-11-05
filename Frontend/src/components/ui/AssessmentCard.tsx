import { cn } from '@/lib/utils';
import { Card } from './Card';

interface AssessmentCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'progress' | 'result';
  progress?: number;
}

export function AssessmentCard({
  className,
  children,
  variant = 'default',
  progress,
  ...props
}: AssessmentCardProps) {
  return (
    <Card
      className={cn(
        'transition-all duration-300',
        variant === 'progress' && 'bg-brand-gradient border-brand-200',
        variant === 'result' && 'bg-accent-emerald/5 border-success/20',
        className
      )}
      {...props}
    >
      {variant === 'progress' && progress !== undefined && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-ink-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-surface-subtle rounded-full h-2">
            <div
              className="bg-brand-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      {children}
    </Card>
  );
}