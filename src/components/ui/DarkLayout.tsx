'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Header } from '@/components/common/Header';
import { Sidebar, SidebarSection } from '@/components/common/Sidebar';
import { RightSidebar, RightSidebarProps } from '@/components/common/RightSidebar';

interface DarkLayoutProps {
  children: ReactNode;
  className?: string;
}

export function DarkLayout({ children, className }: DarkLayoutProps) {
  return (
    <div className={cn('min-h-screen bg-surface-base text-muted-900 antialiased dark:bg-muted-950 dark:text-muted-100', className)}>
      {children}
    </div>
  );
}

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  sidebarSections: SidebarSection[];
  user?: { name: string; role: string; avatarInitials?: string };
  rightSidebar?: RightSidebarProps;
  headerActions?: {
    key: string;
    icon: ReactNode;
    ariaLabel: string;
    onClick?: () => void;
    badge?: number;
  }[];
}

export function DashboardLayout({
  children,
  title,
  subtitle,
  sidebarSections,
  user,
  rightSidebar,
  headerActions,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!sidebarOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  const defaultActions = useMemo(() => [
    {
      key: 'notifications',
      ariaLabel: 'View notifications',
      badge: 3,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082A2 2 0 0113 18H7a2 2 0 01-1.857-2.918l.857-1.714V10a6 6 0 0112 0v3.368l.857 1.714A2 2 0 0117 18h-4" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 18v1a3 3 0 006 0v-1" />
        </svg>
      ),
    },
    {
      key: 'messages',
      ariaLabel: 'View messages',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 10l5 3 5-3" />
        </svg>
      ),
    },
    {
      key: 'profile',
      ariaLabel: user ? `${user.name}'s profile` : 'Profile',
      icon: (
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-600 dark:bg-brand-500/15 dark:text-brand-200">
          {user?.avatarInitials ?? user?.name?.slice(0, 2).toUpperCase() ?? 'CB'}
        </span>
      ),
    },
  ], [user]);

  return (
    <div className="flex min-h-screen bg-surface-base dark:bg-muted-950">
      <Sidebar
        sections={sidebarSections}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-h-screen flex-1 flex-col">
        <Header
          title={title}
          subtitle={subtitle}
          onToggleSidebar={() => setSidebarOpen(true)}
          actions={headerActions ?? defaultActions}
        />

        <div className="flex flex-1 flex-col gap-6 px-4 py-6 lg:flex-row lg:px-8 lg:py-8">
          <main className="flex-1 space-y-8">
            {children}
          </main>

          {rightSidebar && (
            <div className="sticky top-24 h-fit lg:w-[320px] xl:w-[360px]">
              <RightSidebar {...rightSidebar} />
            </div>
          )}
        </div>

        <footer className="border-t border-muted-200 px-4 py-4 text-sm text-muted-500 dark:border-muted-800 dark:text-muted-300 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>© {new Date().getFullYear()} ClassBridge. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                Privacy policy
              </Link>
              <Link href="/terms" className="hover:text-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                Terms
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
