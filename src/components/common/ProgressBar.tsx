'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress: number;
  className?: string;
  trackClassName?: string;
  indicatorClassName?: string;
  showLabel?: boolean;
  ariaLabel?: string;
}

const clampProgress = (value: number) => {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, value));
};

/**
 * Accessible progress bar with rounded track and theme-aware colours.
 */
function ProgressBarComponent({
  progress,
  className,
  trackClassName,
  indicatorClassName,
  showLabel = false,
  ariaLabel,
}: ProgressBarProps) {
  const safeProgress = clampProgress(progress);

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div
        className={cn(
          'relative h-2 w-full overflow-hidden rounded-full bg-muted-200 dark:bg-muted-700',
          trackClassName
        )}
        role="progressbar"
        aria-valuenow={Math.round(safeProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel}
      >
        <div
          className={cn(
            'absolute inset-y-0 left-0 rounded-full bg-brand-500 transition-[width] duration-300 ease-out',
            'dark:bg-brand-400',
            indicatorClassName
          )}
          style={{ width: `${safeProgress}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-muted-600 dark:text-muted-300">
          {safeProgress}% complete
        </span>
      )}
    </div>
  );
}

export const ProgressBar = memo(ProgressBarComponent);
export type { ProgressBarProps };
