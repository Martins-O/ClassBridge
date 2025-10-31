'use client';

import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Icons } from '@/components/Icons';

export function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-10 border-b border-muted-200 bg-white/80 backdrop-blur-sm dark:border-muted-800 dark:bg-muted-900/80">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left side - Search */}
        <div className="flex flex-1 items-center">
          <div className="relative w-full max-w-xl">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Icons.search className="h-5 w-5 text-muted-400" />
            </div>
            <Input
              type="text"
              placeholder="Search..."
              className="w-full rounded-xl border-0 bg-muted-100 pl-10 focus:ring-2 focus:ring-brand-500 dark:bg-muted-800 dark:text-white"
            />
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="ml-4 flex items-center gap-2 md:gap-4">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="text-muted-600 hover:bg-muted-100 dark:text-muted-300 dark:hover:bg-muted-800"
          >
            {theme === 'dark' ? (
              <Icons.sun className="h-5 w-5" />
            ) : (
              <Icons.moon className="h-5 w-5" />
            )}
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="relative text-muted-600 hover:bg-muted-100 dark:text-muted-300 dark:hover:bg-muted-800"
            aria-label="View notifications"
          >
            <Icons.bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
          </Button>

          {/* User Menu */}
          <div className="relative ml-2">
            <button
              type="button"
              className="flex items-center rounded-full focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
              id="user-menu"
              aria-expanded="false"
              aria-haspopup="true"
            >
              <span className="sr-only">Open user menu</span>
              <div className="h-9 w-9 rounded-full bg-muted-200 dark:bg-muted-700 flex items-center justify-center">
                <span className="text-sm font-medium text-muted-600 dark:text-muted-300">
                  U
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
