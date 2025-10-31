'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export interface SidebarItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: number | string;
  ariaLabel?: string;
}

export interface SidebarSection {
  heading: string;
  items: SidebarItem[];
}

interface SidebarProps {
  sections: SidebarSection[];
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
  activePath?: string;
}

const BORDER_CLASSES = 'border-muted-200 dark:border-muted-700';
const TEXT_SUBTLE = 'text-muted-500 dark:text-muted-300';

/**
 * Responsive sidebar navigation that supports grouped sections, collapsible menus,
 * active link highlight, and keyboard accessible toggles.
 */
export function Sidebar({ sections, isOpen = true, onClose, className, activePath }: SidebarProps) {
  const pathname = usePathname();
  const effectivePath = activePath ?? pathname;

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setExpandedSections((prev) => {
      // auto-expand sections containing the active item
      const next: Record<string, boolean> = { ...prev };
      sections.forEach((section) => {
        const key = section.heading;
        const hasActive = section.items.some((item) => effectivePath?.startsWith(item.href));
        if (!(key in next)) {
          next[key] = hasActive || true;
        } else if (hasActive) {
          next[key] = true;
        }
      });
      return next;
    });
  }, [sections, effectivePath]);

  const handleSectionToggle = (heading: string) => {
    setExpandedSections((prev) => ({ ...prev, [heading]: !prev[heading] }));
  };

  const navContent = useMemo(
    () => (
      <nav className="flex h-full flex-col" aria-label="Main navigation">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-200">
              <span className="text-lg font-semibold">CB</span>
            </span>
            <div>
              <p className="text-sm font-semibold text-muted-900 dark:text-white">ClassBridge</p>
              <p className="text-xs text-muted-500 dark:text-muted-300">Learning Platform</p>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              className="rounded-lg p-2 text-muted-500 transition hover:bg-muted-100 hover:text-muted-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-muted-300 dark:hover:bg-muted-800 lg:hidden"
              aria-label="Close navigation"
              onClick={onClose}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto px-2 pb-4">
          {sections.map((section) => {
            const isExpanded = expandedSections[section.heading] ?? true;
            return (
              <Fragment key={section.heading}>
                <button
                  type="button"
                  className={cn(
                    'group flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide',
                    TEXT_SUBTLE,
                    'hover:bg-muted-100 hover:text-muted-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:hover:bg-muted-800 dark:hover:text-white'
                  )}
                  aria-expanded={isExpanded}
                  onClick={() => handleSectionToggle(section.heading)}
                >
                  <span>{section.heading}</span>
                  <svg
                    className={cn('h-4 w-4 transition-transform', isExpanded ? 'rotate-0' : '-rotate-90')}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                <div className={cn('space-y-1 pl-1 transition-all', !isExpanded && 'hidden')}
                  role="group"
                  aria-label={`${section.heading} links`}
                >
                  {section.items.map((item) => {
                    const isActive = effectivePath?.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          'flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium outline-none transition',
                          'focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:focus-visible:ring-offset-muted-900',
                          isActive
                            ? 'bg-brand-500/10 text-brand-600 dark:bg-brand-500/15 dark:text-brand-200'
                            : 'text-muted-600 hover:bg-muted-100 hover:text-muted-900 dark:text-muted-300 dark:hover:bg-muted-800 dark:hover:text-white'
                        )}
                        aria-label={item.ariaLabel ?? item.label}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <span className="flex items-center gap-3">
                          {item.icon && <span className="text-lg" aria-hidden="true">{item.icon}</span>}
                          {item.label}
                        </span>
                        {item.badge !== undefined && (
                          <span className="inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-muted-100 px-2 text-xs font-semibold text-muted-500 dark:bg-muted-700 dark:text-muted-200">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </Fragment>
            );
          })}
        </div>

        <div className={cn('mt-auto border-t px-4 py-4', BORDER_CLASSES)}>
          <div className="rounded-lg bg-muted-100 px-4 py-3 text-sm text-muted-600 dark:bg-muted-800/80 dark:text-muted-200">
            <p className="font-semibold">Upgrade available</p>
            <p className="text-xs text-muted-500 dark:text-muted-300">Unlock analytics and parent portal.</p>
          </div>
        </div>
      </nav>
    ),
    [sections, expandedSections, effectivePath, onClose]
  );

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 w-72 max-w-full bg-white shadow-lg transition-transform duration-200 ease-out',
        'border-r border-muted-200 dark:border-muted-800 dark:bg-muted-900/95 dark:text-white',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        'lg:static lg:h-full lg:shadow-none',
        className
      )}
    >
      {navContent}
      {/* Mobile backdrop */}
      {onClose && isOpen && (
        <div
          className="fixed inset-0 -z-10 bg-black/40 backdrop-blur-sm lg:hidden"
          role="presentation"
          aria-hidden="true"
          onClick={onClose}
        />
      )}
    </aside>
  );
}
