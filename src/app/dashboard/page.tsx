'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import Footer from '@/components/Footer';
import { PageShell } from '@/components/ui/PageShell';
import { GradientHeader } from '@/components/ui/GradientHeader';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
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

  const fetchStudentStats = useCallback(async (userId: string) => {
    try {
      const [classesRes, assessmentsRes, gradesRes] = await Promise.all([
        fetch('/api/classes'),
        fetch('/api/assessments'),
        fetch('/api/grades'),
      ]);

      let myClasses = 0;
      let pendingAssessments = 0;
      let averageGrade = 0;

      if (classesRes.ok) {
        const classesData = await classesRes.json();
        const classes = classesData.classes || [];
        myClasses = classes.filter((cls: { studentIds?: string[] }) =>
          cls.studentIds?.includes(userId)
        ).length;
      }

      if (assessmentsRes.ok) {
        const assessmentsData = await assessmentsRes.json();
        const assessments = assessmentsData.assessments || [];
        pendingAssessments = assessments.filter((a: { isActive: boolean }) => a.isActive).length;
      }

      if (gradesRes.ok) {
        const gradesData = await gradesRes.json();
        const grades = gradesData.grades || [];
        const studentGrades = grades.filter((g: { studentId: string }) => g.studentId === userId);
        if (studentGrades.length > 0) {
          const total = studentGrades.reduce((sum: number, grade: { score?: number }) => sum + (grade.score || 0), 0);
          averageGrade = Math.round(total / studentGrades.length);
        }
      }

      setStudentStats({
        myClasses,
        pendingAssessments,
        completedAssessments: 0,
        averageGrade,
      });
    } catch {
      // styling improvements only; silent error retains previous values
    }
  }, []);

  const fetchAdminStats = useCallback(async () => {
    try {
      const [classesRes, schoolsRes] = await Promise.all([
        fetch('/api/classes'),
        fetch('/api/schools'),
      ]);

      let totalStudents = 0;
      let totalMentors = 0;
      let classes: Array<{ studentIds?: string[]; mentorIds?: string[] }> = [];

      if (classesRes.ok) {
        const classesData = await classesRes.json();
        classes = classesData.classes || [];
        classes.forEach((cls) => {
          totalStudents += cls.studentIds?.length ?? 0;
          totalMentors += cls.mentorIds?.length ?? 0;
        });
      }

      let totalSchools = 0;
      if (schoolsRes.ok) {
        const schoolsData = await schoolsRes.json();
        totalSchools = (schoolsData.schools || []).length;
      }

      setStats({
        totalClasses: classes.length,
        totalSchools,
        totalStudents,
        totalMentors,
      });
    } catch {
      // silent fail, values remain
    }
  }, []);

  const fetchUserAndStats = useCallback(async () => {
    try {
      const userResponse = await fetch('/api/auth/me');
      if (!userResponse.ok) return;
      const userData = await userResponse.json();
      setUser(userData.user);

      if (userData.user.role === 'student') {
        await fetchStudentStats(userData.user.id);
      } else {
        await fetchAdminStats();
      }
    } catch {
      // silent fail handled by UI states
    } finally {
      setLoading(false);
    }
  }, [fetchAdminStats, fetchStudentStats]);

  useEffect(() => {
    fetchUserAndStats();
  }, [fetchUserAndStats]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const roleLabel = useMemo(() => {
    if (!user) return '';
    const map: Record<string, string> = {
      super_admin: 'Super Administrator',
      school_admin: 'School Administrator',
      mentor: 'Mentor',
      student: 'Student',
    };
    return map[user.role] ?? user.role;
  }, [user]);

  const quickActions = useMemo<QuickAction[]>(() => {
    if (!user) return [];

    const actions: QuickAction[] = [];

    if (user.role === 'student') {
      actions.push(
        {
          title: 'My Classes',
          description: 'Keep up with current coursework and materials.',
          href: '/dashboard/classes',
          icon: (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          ),
        },
        {
          title: 'Assessments',
          description: 'View assessments that need your attention.',
          href: '/dashboard/assessments',
          icon: (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        }
      );
    }

    if (user.role === 'mentor' || user.role === 'super_admin') {
      actions.push(
        {
          title: 'Manage Courses',
          description: 'Create engaging learning paths for your classes.',
          href: '/dashboard/courses',
          icon: (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
            </svg>
          ),
        },
        {
          title: 'Assessments',
          description: 'Monitor assessment performance and attempts.',
          href: '/dashboard/assessments',
          icon: (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6a2 2 0 012-2h8M9 9V7a2 2 0 012-2h2" />
            </svg>
          ),
        }
      );
    }

    if (user.role === 'school_admin' || user.role === 'super_admin') {
      actions.push(
        {
          title: 'Invite Mentors',
          description: 'Grow your teaching team and assign classes.',
          href: '/dashboard/school',
          icon: (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9a3 3 0 11-6 0 3 3 0 016 0zm-7 9a7 7 0 0114 0v1H11v-1zM6 14l-3 3m0 0l3 3m-3-3h12" />
            </svg>
          ),
        },
        {
          title: 'Student Invitations',
          description: 'Send onboarding invitations in bulk.',
          href: '/dashboard/invitations',
          icon: (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m4-4v8m-9 4h18" />
            </svg>
          ),
        }
      );
    }

    return actions;
  }, [user]);

  if (loading) {
    return (
      <PageShell>
        <GradientHeader title="Loading your workspace" description="Please hold while we bring everything together." />
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-2xl bg-white/50" />
          ))}
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <GradientHeader
        title={`${getGreeting()}, ${user?.name ?? 'there'}!`}
        description={user ? `You are signed in as ${roleLabel}. Here is a snapshot of what needs attention today.` : 'Welcome back to ClassBridge.'}
        action={
          user?.role === 'school_admin' ? (
            <Link href="/dashboard/school">
              <Button>Manage school</Button>
            </Link>
          ) : null
        }
      />

      <section className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {user?.role === 'student' ? (
          <>
            <StatCard
              label="My Classes"
              value={formatNumber(studentStats.myClasses)}
              trend={{ value: 'Stay curious!', tone: 'neutral', caption: 'Active enrolments' }}
            />
            <StatCard
              label="Pending Assessments"
              value={formatNumber(studentStats.pendingAssessments)}
              trend={{ value: 'Complete upcoming assessments to stay on track.', tone: 'neutral' }}
            />
            <StatCard
              label="Average Score"
              value={`${formatNumber(studentStats.averageGrade)}%`}
              trend={{ value: 'Based on submitted assessments', tone: 'neutral' }}
            />
            <StatCard
              label="Completed"
              value={formatNumber(studentStats.completedAssessments)}
              trend={{ value: 'More detailed analytics coming soon.', tone: 'neutral' }}
            />
          </>
        ) : (
          <>
            <StatCard
              label="Active Classes"
              value={formatNumber(stats.totalClasses)}
              trend={{ value: 'Across all schools you manage', tone: 'neutral' }}
            />
            <StatCard
              label="Students"
              value={formatNumber(stats.totalStudents)}
              trend={{ value: '+12 in the last 30 days', tone: 'up' }}
            />
            <StatCard
              label="Mentors"
              value={formatNumber(stats.totalMentors)}
              trend={{ value: 'Keep your mentors engaged', tone: 'neutral' }}
            />
            <StatCard
              label="Schools"
              value={formatNumber(stats.totalSchools)}
              trend={{ value: 'Institutional partners', tone: 'neutral' }}
            />
          </>
        )}
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border border-white/40 p-8">
          <h2 className="text-lg font-semibold text-ink-900">Quick Actions</h2>
          <p className="mt-1 text-sm text-ink-400">Shortcuts curated for your current role.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {quickActions.map((action) => (
              <Link key={action.title} href={action.href} className="group">
                <Card className="h-full border border-white/40 bg-white/90 p-6 shadow-soft transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-glass">
                  <div className="flex items-center gap-3 text-brand-600">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10">{action.icon}</span>
                    <p className="font-semibold text-ink-800">{action.title}</p>
                  </div>
                  <p className="mt-3 text-sm text-ink-500">{action.description}</p>
                </Card>
              </Link>
            ))}
            {quickActions.length === 0 ? (
              <p className="text-sm text-ink-400">No actions available for your role yet.</p>
            ) : null}
          </div>
        </Card>

        <Card className="border border-white/40 p-8">
          <h2 className="text-lg font-semibold text-ink-900">Need a refresher?</h2>
          <p className="mt-2 text-sm text-ink-500">
            Explore our detailed guides on onboarding mentors, setting up classes, and tracking performance insights.
          </p>
          <Link
            href="/dashboard/invitations"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-600"
          >
            Go to invitations
            <span aria-hidden className="text-lg">→</span>
          </Link>
        </Card>
      </section>

      <Footer />
    </PageShell>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
