'use client';

import { ReactNode, useId, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/ThemeProvider';

interface HeaderAction {
  key: string;
  icon: ReactNode;
  ariaLabel: string;
  onClick?: () => void;
  badge?: number;
}

interface HeaderProps {
  title: string;
  subtitle?: string;
  onToggleSidebar?: () => void;
  actions?: HeaderAction[];
  className?: string;
  renderSearchResult?: (query: string) => ReactNode;
}

const ICON_BUTTON_BASE = 'relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted-500 transition hover:bg-muted-100 hover:text-muted-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-muted-300 dark:hover:bg-muted-800 dark:hover:text-white';

export function Header({ title, subtitle, onToggleSidebar, actions, className, renderSearchResult }: HeaderProps) {
  const [query, setQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const searchId = useId();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const searchResults = useMemo(() => {
    if (!query || !renderSearchResult) return null;
    return (
      <div className="mt-3 rounded-xl border border-muted-200 bg-white shadow-lg dark:border-muted-800 dark:bg-muted-900/90">
        {renderSearchResult(query)}
      </div>
    );
  }, [query, renderSearchResult]);

  const renderIconButton = (action: HeaderAction) => (
    <button
      key={action.key}
      type="button"
      className={ICON_BUTTON_BASE}
      aria-label={action.ariaLabel}
      onClick={action.onClick}
    >
      {action.badge !== undefined && action.badge > 0 && (
        <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-semibold text-white">
          {action.badge}
        </span>
      )}
      {action.icon}
    </button>
  );

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex w-full flex-col gap-4 border-b border-muted-200 bg-white/90 px-4 py-4 backdrop-blur-md transition dark:border-muted-800 dark:bg-muted-900/80 sm:px-6',
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-muted-200 text-muted-600 transition hover:border-brand-500 hover:text-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-muted-700 dark:text-muted-200 dark:hover:text-white lg:hidden"
              onClick={onToggleSidebar}
              aria-label="Open navigation"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5M3.75 12h16.5M3.75 18.75h16.5" />
              </svg>
            </button>
          )}
          <div>
            <h1 className="text-xl font-semibold text-muted-900 dark:text-white sm:text-2xl">{title}</h1>
            {subtitle && <p className="text-sm text-muted-500 dark:text-muted-300">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-3 md:flex">
            <div className="relative">
              <label htmlFor={searchId} className="sr-only">
                Search
              </label>
              <input
                id={searchId}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search courses, classes, mentors..."
                className="h-10 w-64 rounded-xl border border-muted-200 bg-white px-4 text-sm text-muted-700 shadow-sm transition placeholder:text-muted-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-muted-700 dark:bg-muted-900/80 dark:text-muted-100 dark:placeholder:text-muted-400"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19a8 8 0 100-16 8 8 0 000 16z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-3-3" />
              </svg>
              {searchResults}
            </div>
          </div>

          <button
            type="button"
            className={ICON_BUTTON_BASE + ' md:hidden'}
            aria-label="Search"
            onClick={() => setShowMobileSearch((prev) => !prev)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19a8 8 0 100-16 8 8 0 000 16z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-3-3" />
            </svg>
          </button>

          {actions?.map(renderIconButton)}

          <button
            type="button"
            onClick={toggleTheme}
            className={ICON_BUTTON_BASE}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1.5M12 19.5V21M4.5 12H3m18 0h-1.5M5.636 5.636l1.06 1.06M17.303 17.303l1.061 1.06M18.364 5.636l-1.061 1.06M7.697 17.303l-1.06 1.06M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {showMobileSearch && (
        <div className="relative md:hidden">
          <label htmlFor={`${searchId}-mobile`} className="sr-only">
            Search
          </label>
          <input
            id={`${searchId}-mobile`}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search courses..."
            className="h-11 w-full rounded-xl border border-muted-200 bg-white px-4 text-sm text-muted-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-muted-700 dark:bg-muted-900/80 dark:text-muted-100"
          />
          <div className="absolute inset-x-0 top-[calc(100%+0.5rem)]">
            {searchResults}
          </div>
        </div>
      )}
    </header>
  );
}
