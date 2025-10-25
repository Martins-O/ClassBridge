'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import { DashboardLayout } from '@/components/ui/DarkLayout';
import { Card, CardContent, CardHeader, TerminalCard, GlowCard } from '@/components/ui/Card';
import { Button, GlowButton, TerminalButton } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/Input';
import { formatNumber } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  schoolId?: string;
  classIds?: string[];
  isActive: boolean;
  createdAt: string;
}

interface DashboardStats {
  totalClasses: number;
  totalSchools: number;
  totalStudents: number;
  totalMentors: number;
}

interface StudentStats {
  myClasses: number;
  pendingAssessments: number;
  completedAssessments: number;
  averageGrade: number;
}

type QuickAction = {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
};

function DashboardContent() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalClasses: 0,
    totalSchools: 0,
    totalStudents: 0,
    totalMentors: 0,
  });
  const [studentStats, setStudentStats] = useState<StudentStats>({
    myClasses: 0,
    pendingAssessments: 0,
    completedAssessments: 0,
    averageGrade: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/stats');
      if (response.ok) {
        const statsData = await response.json();
        if (statsData.stats) {
          setStats(statsData.stats);
        }
        if (statsData.studentStats) {
          setStudentStats(statsData.studentStats);
        }
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
    fetchStats();
  }, [fetchUser, fetchStats]);

  const quickActions = useMemo<QuickAction[]>(() => {
    if (!user) return [];

    switch (user.role) {
      case 'super_admin':
        return [
          {
            title: 'Manage Schools',
            description: 'View and manage all schools in the system',
            href: '/dashboard/schools',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            ),
          },
          {
            title: 'System Analytics',
            description: 'View platform-wide usage and performance metrics',
            href: '/dashboard/analytics',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4" />
              </svg>
            ),
          },
        ];
      case 'school_admin':
        return [
          {
            title: 'Create Class',
            description: 'Set up a new class for your school',
            href: '/dashboard/classes',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            ),
          },
          {
            title: 'Invite Students',
            description: 'Send invitations to new students',
            href: '/dashboard/invitations',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            ),
          },
          {
            title: 'Manage School',
            description: 'Update school information and settings',
            href: '/dashboard/school',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            ),
          },
        ];
      case 'mentor':
        return [
          {
            title: 'Create Course',
            description: 'Design a new course for your classes',
            href: '/dashboard/courses',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            ),
          },
          {
            title: 'Create Assessment',
            description: 'Build assessments for your students',
            href: '/dashboard/assessments',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            ),
          },
        ];
      case 'student':
        return [
          {
            title: 'My Classes',
            description: 'View your enrolled classes',
            href: '/dashboard/classes',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            ),
          },
          {
            title: 'Take Assessments',
            description: 'Complete your pending assessments',
            href: '/dashboard/assessments',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            ),
          },
        ];
      default:
        return [];
    }
  }, [user]);

  // Navigation for sidebar
  const navigation = user && (
    <nav className="p-4 space-y-2">
      <div className="text-xs text-text-muted uppercase tracking-wider mb-3 font-mono">
        Navigation
      </div>

      <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-accent-primary/10 text-accent-primary border border-accent-primary/20">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h2a2 2 0 012 2v0M8 5a2 2 0 012-2h2a2 2 0 012 2v0" />
        </svg>
        <span className="font-medium">Dashboard</span>
      </Link>

      {user.role === 'school_admin' && (
        <>
          <Link href="/dashboard/classes" className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-dark-700 hover:text-text-primary transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>Classes</span>
          </Link>
          <Link href="/dashboard/invitations" className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-dark-700 hover:text-text-primary transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <span>Invitations</span>
          </Link>
          <Link href="/dashboard/school" className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-dark-700 hover:text-text-primary transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span>School</span>
          </Link>
        </>
      )}

      {user.role === 'mentor' && (
        <>
          <Link href="/dashboard/courses" className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-dark-700 hover:text-text-primary transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>Courses</span>
          </Link>
          <Link href="/dashboard/assessments" className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-dark-700 hover:text-text-primary transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span>Assessments</span>
          </Link>
        </>
      )}

      <div className="pt-4 mt-4 border-t border-border-primary">
        <div className="text-xs text-text-muted uppercase tracking-wider mb-3 font-mono">
          Quick Actions
        </div>
        <SearchInput placeholder="Search..." className="mb-3" />
        <TerminalButton size="sm" className="w-full justify-start">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3" />
          </svg>
          Terminal
        </TerminalButton>
      </div>
    </nav>
  );

  if (loading) {
    return (
      <DashboardLayout
        user={user ? { name: user.name, role: user.role } : undefined}
        navigation={navigation}
      >
        <div className="flex min-h-screen items-center justify-center">
          <TerminalCard className="p-8 text-center">
            <div className="neon-spinner mx-auto h-16 w-16 mb-4"></div>
            <p className="font-mono text-neon-cyan">Loading dashboard...</p>
          </TerminalCard>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <GlowCard neonBorder="pink" className="mx-auto max-w-md text-center">
          <CardContent>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-danger/10">
              <svg className="h-8 w-8 text-accent-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-bold text-text-primary">Access Denied</h2>
            <p className="mb-6 text-text-muted">Unable to load user information</p>
            <Link href="/login">
              <Button variant="danger">Go to Login</Button>
            </Link>
          </CardContent>
        </GlowCard>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      user={{ name: user.name, role: user.role }}
      navigation={navigation}
    >
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Welcome back, <span className="text-accent-primary neon-text">{user.name}</span>
        </h1>
        <p className="text-text-muted font-mono">
          {user.role === 'super_admin' ? 'System Administrator' :
           user.role === 'school_admin' ? 'School Administrator' :
           user.role === 'mentor' ? 'Mentor' : 'Student'} Dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 lg:grid-cols-4 mb-8">
        {user.role === 'super_admin' && (
          <>
            <GlowCard neonBorder="cyan" className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-muted text-sm font-mono">Total Schools</p>
                  <p className="text-2xl font-bold text-accent-primary">{formatNumber(stats.totalSchools)}</p>
                </div>
                <div className="w-12 h-12 bg-accent-primary/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
            </GlowCard>

            <GlowCard neonBorder="purple" className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-muted text-sm font-mono">Total Classes</p>
                  <p className="text-2xl font-bold text-accent-secondary">{formatNumber(stats.totalClasses)}</p>
                </div>
                <div className="w-12 h-12 bg-accent-secondary/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-accent-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            </GlowCard>

            <GlowCard neonBorder="green" className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-muted text-sm font-mono">Total Mentors</p>
                  <p className="text-2xl font-bold text-accent-success">{formatNumber(stats.totalMentors)}</p>
                </div>
                <div className="w-12 h-12 bg-accent-success/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-accent-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </GlowCard>

            <GlowCard neonBorder="pink" className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-muted text-sm font-mono">Total Students</p>
                  <p className="text-2xl font-bold text-accent-info">{formatNumber(stats.totalStudents)}</p>
                </div>
                <div className="w-12 h-12 bg-accent-info/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-accent-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
            </GlowCard>
          </>
        )}

        {user.role === 'student' && (
          <>
            <GlowCard neonBorder="cyan" className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-muted text-sm font-mono">My Classes</p>
                  <p className="text-2xl font-bold text-accent-primary">{formatNumber(studentStats.myClasses)}</p>
                </div>
                <div className="w-12 h-12 bg-accent-primary/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            </GlowCard>

            <Card className="p-6 bg-accent-warning/5 border-accent-warning/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-muted text-sm font-mono">Pending Assessments</p>
                  <p className="text-2xl font-bold text-accent-warning">{formatNumber(studentStats.pendingAssessments)}</p>
                </div>
                <div className="w-12 h-12 bg-accent-warning/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-accent-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </Card>

            <GlowCard neonBorder="green" className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-muted text-sm font-mono">Completed</p>
                  <p className="text-2xl font-bold text-accent-success">{formatNumber(studentStats.completedAssessments)}</p>
                </div>
                <div className="w-12 h-12 bg-accent-success/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-accent-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </GlowCard>

            <Card className="p-6 bg-accent-info/5 border-accent-info/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-muted text-sm font-mono">Average Grade</p>
                  <p className="text-2xl font-bold text-accent-info">{studentStats.averageGrade}%</p>
                </div>
                <div className="w-12 h-12 bg-accent-info/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-accent-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-lg font-semibold text-text-primary">Quick Actions</h2>
          <p className="text-sm text-text-muted font-mono">
            Get started with these common tasks based on your role
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {quickActions.map((action) => (
              <Link key={action.title} href={action.href}>
                <Card interactive className="h-full p-6">
                  <div className="flex items-center gap-3 text-accent-primary mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-primary/10">
                      {action.icon}
                    </div>
                    <p className="font-semibold text-text-primary">{action.title}</p>
                  </div>
                  <p className="text-sm text-text-muted">{action.description}</p>
                </Card>
              </Link>
            ))}
            {quickActions.length === 0 && (
              <p className="text-sm text-text-muted font-mono col-span-2 text-center py-8">
                No actions available for your role yet.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <TerminalCard className="p-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-neon-green/10 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-neon-green mb-2 font-mono">
              $ help --documentation
            </h2>
            <p className="text-neon-green/80 text-sm font-mono mb-4">
              Explore our detailed guides on onboarding mentors, setting up classes, and tracking performance insights.
            </p>
            <Link href="/dashboard/invitations">
              <GlowButton variant="success" size="sm">
                Access Documentation →
              </GlowButton>
            </Link>
          </div>
        </div>
      </TerminalCard>
    </DashboardLayout>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}