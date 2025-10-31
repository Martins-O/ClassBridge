'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/components/ThemeProvider';

export function PublicHeader() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-primary-500 text-white shadow-lg dark:bg-muted-900 dark:border-b dark:border-muted-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white dark:bg-muted-800 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 40 40" className="w-6 h-6 text-primary-500 dark:text-primary-400" fill="none">
                <rect x="8" y="8" width="24" height="24" rx="2" stroke="currentColor" strokeWidth="2" />
                <rect x="3" y="22" width="2" height="8" fill="currentColor" rx="1" />
                <rect x="35" y="22" width="2" height="8" fill="currentColor" rx="1" />
                <rect x="19" y="17" width="2" height="13" fill="currentColor" rx="1" />
              </svg>
            </div>
            <span className="text-xl font-bold">ClassBridge</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-white hover:text-primary-100 dark:hover:text-primary-300 transition-colors">
              Home
            </Link>
            <Link href="/#features" className="text-white hover:text-primary-100 dark:hover:text-primary-300 transition-colors">
              Features
            </Link>
            <Link href="/about" className="text-white hover:text-primary-100 dark:hover:text-primary-300 transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-white hover:text-primary-100 dark:hover:text-primary-300 transition-colors">
              Contact
            </Link>
          </nav>

          {/* CTA Buttons + Theme Toggle */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1.5M12 19.5V21M4.5 12H3m18 0h-1.5M5.636 5.636l1.06 1.06M17.303 17.303l1.061 1.06M18.364 5.636l-1.061 1.06M7.697 17.303l-1.06 1.06M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              )}
            </button>

            <Link href="/login">
              <Button 
                variant="outline" 
                size="sm" 
                className="!border-2 !border-white !text-white hover:!bg-white hover:!text-primary-600 dark:hover:!text-primary-500"
              >
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button 
                variant="ghost" 
                size="sm" 
                className="!bg-white !text-primary-600 hover:!bg-primary-50 hover:!text-primary-700 font-semibold dark:!bg-muted-800 dark:!text-white dark:hover:!bg-muted-700"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
