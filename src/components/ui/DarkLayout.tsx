'use client';

import { ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from './Card';
import { Button } from './Button';

interface DarkLayoutProps {
  children: ReactNode;
  className?: string;
  showSidebar?: boolean;
  sidebarContent?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
}

export function DarkLayout({
  children,
  className,
  showSidebar = false,
  sidebarContent,
  header,
  footer
}: DarkLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className={cn(
      'min-h-screen bg-background-primary text-text-primary',
      'matrix-bg', // Subtle animated background
      className
    )}>
      {/* Header */}
      {header && (
        <header className="sticky top-0 z-50 bg-background-secondary/95 backdrop-blur-dark border-b border-border-primary">
          <div className="px-6 py-3">
            {header}
          </div>
        </header>
      )}

      <div className="flex min-h-screen">
        {/* Sidebar - VS Code style */}
        {showSidebar && (
          <>
            {/* Sidebar overlay for mobile */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 z-40 bg-background-overlay lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            {/* Sidebar */}
            <aside className={cn(
              'fixed lg:static inset-y-0 left-0 z-50',
              'w-64 bg-background-secondary border-r border-border-primary',
              'shadow-dark-medium lg:shadow-none',
              'transform transition-transform duration-200 ease-in-out',
              sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            )}>
              {/* Sidebar header */}
              <div className="flex items-center justify-between p-4 border-b border-border-primary">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-neon rounded"></div>
                  <span className="font-mono text-accent-primary font-semibold">
                    ClassBridge
                  </span>
                </div>

                {/* Close button for mobile */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(false)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>

              {/* Sidebar content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {sidebarContent}
              </div>

              {/* Terminal-style status bar */}
              <div className="p-3 border-t border-border-primary bg-dark-800">
                <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
                  <div className="w-2 h-2 bg-accent-success rounded-full animate-glow-pulse"></div>
                  <span>System Online</span>
                  <div className="ml-auto text-accent-primary">
                    {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </aside>
          </>
        )}

        {/* Main content area */}
        <main className="flex-1 flex flex-col">
          {/* Mobile sidebar toggle */}
          {showSidebar && (
            <div className="lg:hidden p-4 border-b border-border-primary bg-background-secondary">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Menu
              </Button>
            </div>
          )}

          {/* Page content */}
          <div className="flex-1 p-6 page-transition">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <footer className="mt-auto border-t border-border-primary bg-background-secondary">
              <div className="p-6">
                {footer}
              </div>
            </footer>
          )}
        </main>
      </div>
    </div>
  );
}

// Specialized layouts
export function TerminalLayout({ children, className, ...props }: DarkLayoutProps) {
  return (
    <DarkLayout
      className={cn('font-mono', className)}
      {...props}
    >
      <Card variant="terminal" className="min-h-[400px]">
        <CardContent className="p-4">
          {children}
        </CardContent>
      </Card>
    </DarkLayout>
  );
}

// Dashboard-specific layout
export function DashboardLayout({
  children,
  user,
  navigation,
  ...props
}: DarkLayoutProps & {
  user?: { name: string; role: string; avatar?: string };
  navigation?: ReactNode;
}) {
  return (
    <DarkLayout
      showSidebar
      header={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-text-primary">
              ClassBridge <span className="text-accent-primary">Dashboard</span>
            </h1>
          </div>

          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium text-text-primary">{user.name}</div>
                <div className="text-xs text-text-muted font-mono">{user.role}</div>
              </div>
              <div className="w-8 h-8 bg-gradient-neon rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-background-primary">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </div>
      }
      sidebarContent={navigation}
      {...props}
    >
      {children}
    </DarkLayout>
  );
}

// Code editor style layout
export function EditorLayout({ children, ...props }: DarkLayoutProps) {
  return (
    <DarkLayout
      className="font-mono"
      showSidebar
      sidebarContent={
        <div className="p-4 space-y-2">
          <div className="text-xs text-text-muted uppercase tracking-wider mb-3">
            Explorer
          </div>
          {/* File tree would go here */}
          <div className="space-y-1 text-sm">
            <div className="text-accent-primary cursor-pointer hover:bg-dark-700 px-2 py-1 rounded">
              📁 src/
            </div>
            <div className="text-text-secondary cursor-pointer hover:bg-dark-700 px-2 py-1 rounded ml-4">
              📄 components/
            </div>
          </div>
        </div>
      }
      {...props}
    >
      <Card variant="terminal" className="h-full">
        <CardContent className="p-0 h-full">
          {children}
        </CardContent>
      </Card>
    </DarkLayout>
  );
}