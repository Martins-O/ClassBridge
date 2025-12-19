'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import NotificationCenter from './components/NotificationCenter';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    const isActive = (path: string) => {
        if (path === '/dashboard' && pathname === '/dashboard') return true;
        if (path !== '/dashboard' && pathname.startsWith(path)) return true;
        return false;
    };

    const navItems = [
        { label: 'Overview', href: '/dashboard' },
        { label: 'Classes', href: '/dashboard/classes' },
        { label: 'Courses', href: '/dashboard/courses' },
        { label: 'Students', href: '/dashboard/students' },
        { label: 'Assessments', href: '/dashboard/assessments' },
        { label: 'Grades', href: '/dashboard/grades' },
        { label: 'Transcripts', href: '/dashboard/transcripts' },
        { label: 'Mentors', href: '/dashboard/mentors' },
        { label: 'Profile', href: '/dashboard/profile' },
    ];

    return (
        <div className="min-h-screen">
            <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/dashboard" className="text-xl font-bold tracking-tight text-slate-900 hover:text-blue-600 transition-colors">
                        ClassBridge
                    </Link>

                    <nav className="hidden lg:flex items-center gap-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${isActive(item.href)
                                    ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-4">
                        <NotificationCenter />
                        <button
                            className="hidden md:flex w-10 h-10 rounded-full bg-slate-100 border border-slate-200 items-center justify-center hover:bg-slate-200 transition-colors"
                            onClick={() => router.push('/dashboard/profile')}
                        >
                            <span className="text-slate-600 font-bold text-sm">AT</span>
                        </button>
                    </div>
                </div>
            </header>

            <main>
                {children}
            </main>
        </div>
    );
}
