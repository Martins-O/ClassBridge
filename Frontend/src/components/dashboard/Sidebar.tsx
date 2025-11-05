'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
  { name: 'Classes', href: '/dashboard/classes', icon: '🏫' },
  { name: 'Courses', href: '/dashboard/courses', icon: '📚' },
  { name: 'Assessments', href: '/dashboard/assessments', icon: '📝' },
  { name: 'Grades', href: '/dashboard/grades', icon: '📊' },
  { name: 'Transcript', href: '/dashboard/transcript', icon: '🎓' },
  { name: 'School', href: '/dashboard/school', icon: '🏢' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex w-64 flex-col border-r border-muted-200 dark:border-muted-800 bg-white dark:bg-muted-900">
        {/* Logo */}
        <div className="flex h-16 flex-shrink-0 items-center px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-200">
              <span className="text-lg font-semibold">CB</span>
            </div>
            <span className="text-xl font-bold text-muted-900 dark:text-white">ClassBridge</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400'
                    : 'text-muted-600 hover:bg-muted-100 hover:text-muted-900 dark:text-muted-300 dark:hover:bg-muted-800 dark:hover:text-white',
                )}
              >
                <span className="mr-3 text-base">{item.icon}</span>
                {item.name}
                {isActive && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-brand-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="border-t border-muted-200 p-4 dark:border-muted-800">
          <div className="flex items-center">
            <div className="h-9 w-9 rounded-full bg-muted-200 dark:bg-muted-700 flex items-center justify-center">
              <span className="text-sm font-medium text-muted-600 dark:text-muted-300">
                U
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-muted-900 dark:text-white">User Name</p>
              <p className="text-xs text-muted-500 dark:text-muted-400">View profile</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
