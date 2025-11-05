'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ProgressBar } from './ProgressBar';

interface CourseCardAction {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}

interface CourseCardProps {
  title: string;
  description?: string;
  duration?: string;
  subject?: string;
  classLabel?: string;
  mentorLabel?: string;
  progress?: number;
  studentsEnrolled?: number;
  capacity?: number;
  resources?: number;
  imageLabel?: string;
  createdAt?: string;
  href?: string;
  className?: string;
  actions?: CourseCardAction[];
}

const STAT_TEXT = 'text-xs text-muted-500 dark:text-muted-300';

export function CourseCard({
  title,
  description,
  duration,
  subject,
  classLabel,
  mentorLabel,
  progress,
  studentsEnrolled,
  capacity,
  resources,
  imageLabel,
  createdAt,
  href,
  className,
  actions,
}: CourseCardProps) {
  const initials = imageLabel?.slice(0, 2).toUpperCase() ?? title.slice(0, 2).toUpperCase();
  const progressValue = typeof progress === 'number' ? Math.max(0, Math.min(100, Math.round(progress))) : undefined;

  const cardBody = (
    <div className={cn('flex h-full flex-col rounded-2xl border border-muted-200 bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-muted-800 dark:bg-muted-900/80', className)}>
      <div className="relative h-36 overflow-hidden rounded-t-2xl bg-gradient-to-br from-brand-500/15 via-brand-500/25 to-brand-500/10">
        <div className="absolute inset-0 opacity-[0.02]" aria-hidden="true">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/20 via-transparent to-transparent" aria-hidden="true" />
        <div className="absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/90 text-base font-semibold text-brand-600 shadow-card dark:bg-muted-900/90 dark:text-brand-200">
          {initials}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div>
          <h3 className="text-lg font-semibold text-muted-900 dark:text-white">{title}</h3>
          {description ? (
            <p className="mt-2 text-sm text-muted-600 dark:text-muted-300">{description}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-medium">
          {subject ? (
            <span className="rounded-full bg-brand-500/10 px-3 py-1 text-brand-600 dark:bg-brand-500/15 dark:text-brand-200">
              {subject}
            </span>
          ) : null}
          {classLabel ? (
            <span className="rounded-full bg-muted-100 px-3 py-1 text-muted-600 dark:bg-muted-800 dark:text-muted-300">
              {classLabel}
            </span>
          ) : null}
          {duration ? (
            <span className="rounded-full bg-secondary-500/10 px-3 py-1 text-secondary-600 dark:bg-secondary-500/20 dark:text-secondary-200">
              {duration}
            </span>
          ) : null}
        </div>

        {mentorLabel ? (
          <p className="text-sm font-medium text-muted-500 dark:text-muted-300">Mentor · {mentorLabel}</p>
        ) : null}

        {typeof progressValue === 'number' && (
          <div>
            <div className="flex items-center justify-between text-xs text-muted-500 dark:text-muted-300">
              <span>Progress</span>
              <span className="font-semibold text-muted-900 dark:text-white">{progressValue}%</span>
            </div>
            <ProgressBar progress={progressValue} className="mt-2" ariaLabel={`${title} progress`} />
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 rounded-xl border border-muted-100 bg-muted-50/60 px-3 py-2 text-center dark:border-muted-800 dark:bg-muted-900/60">
          <div>
            <p className="text-sm font-semibold text-muted-900 dark:text-white">{studentsEnrolled ?? 0}</p>
            <p className={STAT_TEXT}>Enrolled</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-900 dark:text-white">{capacity ?? 0}</p>
            <p className={STAT_TEXT}>Capacity</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-900 dark:text-white">{resources ?? 0}</p>
            <p className={STAT_TEXT}>Resources</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-muted-100 px-6 py-4 text-sm dark:border-muted-800">
        {href ? (
          <Link
            href={href}
            aria-label={`View details for ${title}`}
            className="inline-flex items-center gap-2 font-semibold text-brand-600 transition hover:text-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-brand-300"
          >
            View class
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5l6 6-6 6M4.5 5.25v13.5" />
            </svg>
          </Link>
        ) : (
          <span className="text-xs text-muted-500 dark:text-muted-300">{createdAt ? `Created ${createdAt}` : ''}</span>
        )}

        <div className="flex items-center gap-2">
          {actions?.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-muted-200 text-muted-500 transition hover:border-brand-500 hover:text-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-muted-700 dark:text-muted-300 dark:hover:text-brand-200"
              aria-label={action.label}
            >
              {action.icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return href ? (
    <article>{cardBody}</article>
  ) : (
    <article>{cardBody}</article>
  );
}
