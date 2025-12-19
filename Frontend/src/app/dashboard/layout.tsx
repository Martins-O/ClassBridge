'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

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
        <div className="min-h-screen bg-[#020617]">
            <header className="border-b border-white/10 bg-[#020617]/90 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/dashboard" className="text-xl font-bold tracking-tight text-white hover:text-cyan-400 transition-colors">
                        ClassBridge
                    </Link>

                    <nav className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${isActive(item.href)
                                    ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/10'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-4">
                        {/* Mobile menu place holder / User menu placeholder */}
                    </div>
                </div>
            </header>

            {/* 
                We don't wrap children in .dashboard here because pages currently 
                define <main className="dashboard"> themselves.
                Over time, we should move that class here or adjust it.
                For now, we just render children which contain their own layout structure.
            */}
            {children}
        </div>
    );
}
