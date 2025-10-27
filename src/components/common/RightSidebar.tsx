'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import { ProgressBar } from './ProgressBar';

export interface BadgeItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface RightSidebarProps {
  className?: string;
  currentLesson?: {
    title: string;
    description?: string;
    progress: number;
  };
  badges?: BadgeItem[];
  pendingRequests?: number;
}

const SECTION_CLASS = 'rounded-2xl border border-muted-200 bg-white p-5 shadow-sm dark:border-muted-800 dark:bg-muted-900/80';

function RightSidebarComponent({ className, currentLesson, badges = [], pendingRequests = 0 }: RightSidebarProps) {
  return (
    <aside
      className={cn(
        'w-full lg:w-[320px] xl:w-[360px] space-y-5',
        className
      )}
      aria-label="Progress and achievements"
    >
      {currentLesson && (
        <section className={SECTION_CLASS}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-500 dark:text-muted-300">
                Current lesson
              </p>
              <h3 className="mt-1 text-base font-semibold text-muted-900 dark:text-white">
                {currentLesson.title}
              </h3>
            </div>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600 dark:bg-brand-500/15 dark:text-brand-200">
              {Math.round(currentLesson.progress)}%
            </span>
          </div>
          {currentLesson.description && (
            <p className="mt-3 text-sm text-muted-600 dark:text-muted-200">
              {currentLesson.description}
            </p>
          )}
          <div className="mt-4">
            <ProgressBar progress={currentLesson.progress} ariaLabel="Lesson progress" />
          </div>
          <button
            type="button"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 transition hover:text-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-brand-300 dark:hover:text-brand-200"
          >
            Continue learning
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5l6 6-6 6M4.5 5.25v13.5" />
            </svg>
          </button>
        </section>
      )}

      <section className={SECTION_CLASS} aria-labelledby="badge-heading">
        <div className="flex items-center justify-between">
          <h3 id="badge-heading" className="text-sm font-semibold text-muted-900 dark:text-white">
            Badges & milestones
          </h3>
          <span className="rounded-full bg-muted-100 px-2 py-1 text-xs font-semibold text-muted-600 dark:bg-muted-800 dark:text-muted-200">
            {badges.length}
          </span>
        </div>
        <ul className="mt-4 space-y-3">
          {badges.map((badge) => (
            <li key={badge.id}>
              <button
                type="button"
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-muted-600 transition hover:bg-muted-100 hover:text-muted-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-muted-200 dark:hover:bg-muted-800 dark:hover:text-white"
                title={badge.description}
                aria-label={badge.description ? `${badge.label}: ${badge.description}` : badge.label}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-600 transition group-hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-200 dark:group-hover:bg-brand-500/20">
                  {badge.icon ?? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                      <path d="M12 2.25a.75.75 0 01.65.378l1.819 3.154 3.6.527a.75.75 0 01.416 1.28l-2.607 2.542.615 3.58a.75.75 0 01-1.088.791L12 12.97l-3.215 1.732a.75.75 0 01-1.088-.79l.615-3.58-2.607-2.543a.75.75 0 01.416-1.28l3.6-.527 1.82-3.154A.75.75 0 0112 2.25z" />
                    </svg>
                  )}
                </span>
                <span>
                  <p className="font-semibold text-muted-800 dark:text-white">{badge.label}</p>
                  {badge.description && (
                    <span className="text-xs text-muted-500 dark:text-muted-300">{badge.description}</span>
                  )}
                </span>
              </button>
            </li>
          ))}
          {badges.length === 0 && (
            <li className="rounded-xl border border-dashed border-muted-200 p-4 text-center text-sm text-muted-500 dark:border-muted-700 dark:text-muted-300">
              Earn badges by completing your first lessons.
            </li>
          )}
        </ul>
      </section>

      <section className={SECTION_CLASS}>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m2 0v1a3 3 0 006 0v-1m-6 0a3 3 0 11-6 0" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-semibold text-muted-900 dark:text-white">Pending requests</p>
            <p className="text-xs text-muted-500 dark:text-muted-300">Awaiting your approval</p>
          </div>
          <span className="ml-auto rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600 dark:bg-orange-500/15 dark:text-orange-200">
            {pendingRequests}
          </span>
        </div>
        <button
          type="button"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          aria-label="View pending requests"
        >
          Review requests
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m-6-6l6 6-6 6" />
          </svg>
        </button>
      </section>
    </aside>
  );
}

export const RightSidebar = memo(RightSidebarComponent);
export type { RightSidebarProps };
