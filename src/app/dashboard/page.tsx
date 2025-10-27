'use client';

import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import { DashboardLayout } from '@/components/ui/DarkLayout';
import { ProgressBar } from '@/components/common/ProgressBar';
import type { SidebarSection } from '@/components/common/Sidebar';
import type { BadgeItem, RightSidebarProps } from '@/components/common/RightSidebar';
import { formatNumber } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'school_admin' | 'mentor' | 'student';
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
  icon: ReactNode;
};

const EMPTY_STATS: DashboardStats = {
  totalClasses: 0,
  totalSchools: 0,
  totalStudents: 0,
  totalMentors: 0,
};

const EMPTY_STUDENT_STATS: StudentStats = {
  myClasses: 0,
  pendingAssessments: 0,
  completedAssessments: 0,
  averageGrade: 0,
};

function DashboardContent() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [studentStats, setStudentStats] = useState<StudentStats>(EMPTY_STUDENT_STATS);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [loading, setLoading] = useState(true);

  const resolveQuickActions = useCallback((currentUser: User | null): QuickAction[] => {
    if (!currentUser) return [];

    const baseIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l3 3" />
      </svg>
    );

    switch (currentUser.role) {
      case 'super_admin':
        return [
          {
            title: 'Manage schools',
            description: 'Oversee all registered schools and administrators.',
            href: '/dashboard/schools',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7V5a2 2 0 00-2-2H10a2 2 0 00-2 2v2" />
              </svg>
            ),
          },
          {
            title: 'Platform analytics',
            description: 'Review adoption, engagement, and performance insights.',
            href: '/dashboard/analytics',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13h3l2-6 4 12 2-6h6" />
              </svg>
            ),
          },
        ];
      case 'school_admin':
        return [
          {
            title: 'Create new class',
            description: 'Launch a cohort and assign mentors in minutes.',
            href: '/dashboard/classes',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
              </svg>
            ),
          },
          {
            title: 'Invite students',
            description: 'Send secure invitations to join your classes.',
            href: '/dashboard/invitations',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            ),
          },
          {
            title: 'Update school profile',
            description: 'Keep your school information current and accurate.',
            href: '/dashboard/school',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m7-13C18 5.477 16.552 5 15 5s-3 .477-4 1.253v13" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 6.253C5 5.477 6.448 5 8 5s3 .477 4 1.253" />
              </svg>
            ),
          },
        ];
      case 'mentor':
        return [
          {
            title: 'Design a course',
            description: 'Craft engaging lessons with resources and milestones.',
            href: '/dashboard/courses',
            icon: baseIcon,
          },
          {
            title: 'Review assessments',
            description: 'Keep learners on track by reviewing pending work.',
            href: '/dashboard/assessments',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5h6a2 2 0 012 2v12l-5-2-5 2V7a2 2 0 012-2z" />
              </svg>
            ),
          },
        ];
      case 'student':
        return [
          {
            title: 'Continue learning',
            description: 'Jump back into your most recent lesson and stay ahead.',
            href: '/dashboard/courses',
            icon: baseIcon,
          },
          {
            title: 'Complete assessments',
            description: 'Finish outstanding submissions to keep your streak.',
            href: '/dashboard/assessments',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h8m-8 5h16" />
              </svg>
            ),
          },
        ];
      default:
        return [];
    }
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) return;
      const userData = await response.json();
      setUser(userData.user);
      setQuickActions(resolveQuickActions(userData.user));
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  }, [resolveQuickActions]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/stats');
      if (!response.ok) return;
      const statsData = await response.json();
      if (statsData.stats) {
        setStats(statsData.stats);
      }
      if (statsData.studentStats) {
        setStudentStats(statsData.studentStats);
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

  const fetchPendingRequests = useCallback(async () => {
    if (!user) return;
    if (user.role !== 'school_admin' && user.role !== 'mentor') return;

    try {
      const response = await fetch('/api/students/invitations');
      if (!response.ok) return;
      const data = await response.json();
      const invitations = (data.invitations ?? []) as { status?: string }[];
      const pending = invitations.filter((invitation) => invitation.status?.toLowerCase() === 'pending').length;
      setPendingRequests(pending);
    } catch (error) {
      console.error('Failed to fetch pending requests:', error);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    if (user.role === 'school_admin' || user.role === 'mentor') {
      fetchPendingRequests();
      return;
    }

    if (user.role === 'student') {
      setPendingRequests(studentStats.pendingAssessments);
      return;
    }

    if (user.role === 'super_admin') {
      setPendingRequests(stats.totalSchools);
    }
  }, [fetchPendingRequests, studentStats.pendingAssessments, stats.totalSchools, user]);

  const sidebarSections = useMemo<SidebarSection[]>(() => {
    const shared: SidebarSection[] = [
      {
        heading: 'Overview',
        items: [
          {
            label: 'Dashboard',
            href: '/dashboard',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5V21h15V10.5" />
              </svg>
            ),
          },
        ],
      },
    ];

    if (!user) return shared;

    if (user.role === 'super_admin') {
      shared.push({
        heading: 'Administration',
        items: [
          {
            label: 'Schools',
            href: '/dashboard/schools',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7" />
              </svg>
            ),
          },
          {
            label: 'Analytics',
            href: '/dashboard/analytics',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ),
          },
        ],
      });
    }

    if (user.role === 'school_admin') {
      shared.push({
        heading: 'School ops',
        items: [
          {
            label: 'Classes',
            href: '/dashboard/classes',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 4h14M5 12h14M5 20h14" />
              </svg>
            ),
          },
          {
            label: 'Invitations',
            href: '/dashboard/invitations',
            badge: pendingRequests,
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14v7" />
              </svg>
            ),
          },
          {
            label: 'School profile',
            href: '/dashboard/school',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m7-13C19 5.477 17.552 5 16 5s-3 .477-4 1.253v13" />
              </svg>
            ),
          },
        ],
      });
    }

    if (user.role === 'mentor') {
      shared.push({
        heading: 'Teaching',
        items: [
          {
            label: 'Courses',
            href: '/dashboard/courses',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            ),
          },
          {
            label: 'Assessments',
            href: '/dashboard/assessments',
            badge: studentStats.pendingAssessments,
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5h6a2 2 0 012 2v12l-5-2-5 2V7a2 2 0 012-2z" />
              </svg>
            ),
          },
        ],
      });
    }

    if (user.role === 'student') {
      shared.push({
        heading: 'My learning',
        items: [
          {
            label: 'Courses',
            href: '/dashboard/courses',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m8-6H4" />
              </svg>
            ),
          },
          {
            label: 'Grades',
            href: '/dashboard/grades',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
              </svg>
            ),
          },
        ],
      });
    }

    return shared;
  }, [pendingRequests, studentStats.pendingAssessments, user]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const completionRate = useMemo(() => {
    const totalAssessments = studentStats.completedAssessments + studentStats.pendingAssessments;
    if (totalAssessments === 0) return 0;
    return Math.round((studentStats.completedAssessments / totalAssessments) * 100);
  }, [studentStats.completedAssessments, studentStats.pendingAssessments]);

  const badges = useMemo<BadgeItem[]>(() => {
    if (!user) return [];

    const baseBadges: BadgeItem[] = [
      {
        id: 'streak',
        label: 'Momentum Builder',
        description: 'Logged in consistently this week.',
      },
      {
        id: 'collaboration',
        label: 'Collaboration Star',
        description: 'Engaged with your community partners.',
      },
    ];

    if (user.role === 'student' && completionRate >= 50) {
      baseBadges.push({
        id: 'progress',
        label: 'Progress Pioneer',
        description: `Completed ${studentStats.completedAssessments} assessments.`,
      });
    }

    if (user.role === 'mentor' && stats.totalClasses > 0) {
      baseBadges.push({
        id: 'impact',
        label: 'Impact Maker',
        description: `Supporting ${stats.totalClasses} active classes.`,
      });
    }

    if (user.role === 'super_admin') {
      baseBadges.push({
        id: 'growth',
        label: 'Growth Champion',
        description: `Overseeing ${stats.totalSchools} schools.`,
      });
    }

    return baseBadges;
  }, [completionRate, stats.totalClasses, stats.totalSchools, studentStats.completedAssessments, user]);

  const currentLesson = useMemo<RightSidebarProps['currentLesson']>(() => {
    if (!user) return undefined;

    if (user.role === 'student') {
      return {
        title: 'Competency tracker',
        description: 'Your latest assessments inform personalised feedback.',
        progress: completionRate,
      };
    }

    if (user.role === 'mentor') {
      return {
        title: 'Class preparation',
        description: 'Review lesson plans and provide feedback ahead of time.',
        progress: Math.min(100, stats.totalClasses * 10),
      };
    }

    if (user.role === 'school_admin') {
      return {
        title: 'School onboarding',
        description: 'Complete the remaining steps to activate your staff accounts.',
        progress: Math.min(100, stats.totalMentors * 8),
      };
    }

    return {
      title: 'Platform adoption',
      description: 'Monitor key metrics and mentor engagement rates.',
      progress: Math.min(100, stats.totalMentors + stats.totalSchools),
    };
  }, [completionRate, stats.totalClasses, stats.totalMentors, stats.totalSchools, user]);

  const rightSidebarProps = useMemo<RightSidebarProps | undefined>(() => {
    if (!user) return undefined;

    return {
      currentLesson: currentLesson,
      badges,
      pendingRequests,
    };
  }, [badges, currentLesson, pendingRequests, user]);

  const statsCards = useMemo(() => {
    if (!user) return [];

    if (user.role === 'super_admin') {
      return [
        {
          label: 'Schools onboarded',
          value: formatNumber(stats.totalSchools),
          helper: 'Institutions connected to ClassBridge',
        },
        {
          label: 'Active classes',
          value: formatNumber(stats.totalClasses),
          helper: 'Delivering learning experiences',
        },
        {
          label: 'Mentors engaged',
          value: formatNumber(stats.totalMentors),
          helper: 'Educators guiding students',
        },
        {
          label: 'Students supported',
          value: formatNumber(stats.totalStudents),
          helper: 'Learners across all programmes',
        },
      ];
    }

    if (user.role === 'school_admin') {
      return [
        {
          label: 'Classes running',
          value: formatNumber(stats.totalClasses),
          helper: 'Across your school today',
        },
        {
          label: 'Mentors assigned',
          value: formatNumber(stats.totalMentors),
          helper: 'Supporting your cohorts',
        },
        {
          label: 'Students enrolled',
          value: formatNumber(stats.totalStudents),
          helper: 'Learners across classes',
        },
        {
          label: 'Pending invitations',
          value: pendingRequests,
          helper: 'Awaiting action',
        },
      ];
    }

    if (user.role === 'mentor') {
      return [
        {
          label: 'Classes assigned',
          value: formatNumber(stats.totalClasses),
          helper: 'Cohorts you are leading',
        },
        {
          label: 'Students supported',
          value: formatNumber(stats.totalStudents),
          helper: 'Learners across your classes',
        },
        {
          label: 'Pending assessments',
          value: studentStats.pendingAssessments,
          helper: 'Awaiting review',
        },
        {
          label: 'Completed assessments',
          value: studentStats.completedAssessments,
          helper: 'Learner submissions this week',
        },
      ];
    }

    return [
      {
        label: 'My classes',
        value: formatNumber(studentStats.myClasses),
        helper: 'Courses you are enrolled in',
      },
      {
        label: 'Assessments due',
        value: studentStats.pendingAssessments,
        helper: 'Complete to maintain your streak',
      },
      {
        label: 'Completed',
        value: studentStats.completedAssessments,
        helper: 'Finish line moments',
      },
      {
        label: 'Average grade',
        value: `${studentStats.averageGrade}%`,
        helper: 'Across all assessments',
      },
    ];
  }, [pendingRequests, stats, studentStats, user]);

  const layoutTitle = user ? `${greeting}, ${user.name.split(' ')[0]}!` : 'Loading your dashboard';
  const layoutSubtitle = user
    ? `You are signed in as ${user.role.replace('_', ' ')}.`
    : 'Preparing personalised insights for your role.';

  if (!user && !loading) {
    return (
      <DashboardLayout
        title="Session expired"
        subtitle="Please sign in to continue."
        sidebarSections={sidebarSections}
      >
        <div className="flex flex-1 items-center justify-center py-24">
          <div className="w-full max-w-md rounded-2xl border border-muted-200 bg-white p-10 text-center shadow-card dark:border-muted-800 dark:bg-muted-900/80">
            <h2 className="text-xl font-semibold text-muted-900 dark:text-white">We could not load your profile</h2>
            <p className="mt-3 text-sm text-muted-600 dark:text-muted-300">
              Your session may have expired. Please sign in again to access ClassBridge.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              Go to login
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={layoutTitle}
      subtitle={layoutSubtitle}
      sidebarSections={sidebarSections}
      user={user ? { name: user.name, role: user.role } : undefined}
      rightSidebar={rightSidebarProps}
    >
      <section className="space-y-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statsCards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-muted-200 bg-white p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover dark:border-muted-800 dark:bg-muted-900/80"
            >
              <p className="text-sm font-medium text-muted-500 dark:text-muted-300">{card.label}</p>
              <p className="mt-3 text-2xl font-semibold text-muted-900 dark:text-white">{card.value}</p>
              <p className="mt-2 text-xs text-muted-500 dark:text-muted-400">{card.helper}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="rounded-2xl border border-muted-200 bg-white p-6 shadow-card dark:border-muted-800 dark:bg-muted-900/80">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-muted-900 dark:text-white">Quick actions</h2>
                <p className="text-sm text-muted-500 dark:text-muted-300">Complete these to keep momentum.</p>
              </div>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-brand-300"
              >
                View all
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5l6 6-6 6M4.5 5.25v13.5" />
                </svg>
              </Link>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {quickActions.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group flex h-full flex-col justify-between rounded-xl border border-muted-200 bg-surface-base/60 p-4 transition hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-card-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-muted-800 dark:bg-muted-900/60"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 transition group-hover:bg-brand-500 group-hover:text-white dark:bg-brand-500/20 dark:text-brand-200">
                      {action.icon}
                    </span>
                    <p className="text-sm font-semibold text-muted-900 dark:text-white">{action.title}</p>
                  </div>
                  <p className="mt-3 text-sm text-muted-600 dark:text-muted-300">{action.description}</p>
                </Link>
              ))}
              {quickActions.length === 0 && (
                <div className="col-span-2 rounded-xl border border-dashed border-muted-200 p-6 text-center text-sm text-muted-500 dark:border-muted-800 dark:text-muted-300">
                  No quick actions yet. Check back once your profile is ready.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-muted-200 bg-white p-6 shadow-card dark:border-muted-800 dark:bg-muted-900/80">
            <h2 className="text-lg font-semibold text-muted-900 dark:text-white">Learning health</h2>
            <p className="mt-1 text-sm text-muted-500 dark:text-muted-300">
              Track overall momentum across your community.
            </p>
            <div className="mt-6 space-y-5">
              <div>
                <div className="flex items-center justify-between text-sm text-muted-600 dark:text-muted-300">
                  <span>Assessment completion</span>
                  <span className="font-semibold text-muted-900 dark:text-white">{completionRate}%</span>
                </div>
                <ProgressBar progress={completionRate} className="mt-2" ariaLabel="Assessment completion rate" />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm text-muted-600 dark:text-muted-300">
                  <span>Active mentors</span>
                  <span className="font-semibold text-muted-900 dark:text-white">{formatNumber(stats.totalMentors)}</span>
                </div>
                <ProgressBar
                  progress={Math.min(100, stats.totalMentors * 5)}
                  className="mt-2"
                  ariaLabel="Mentor engagement"
                  indicatorClassName="bg-secondary-500"
                />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm text-muted-600 dark:text-muted-300">
                  <span>Student participation</span>
                  <span className="font-semibold text-muted-900 dark:text-white">{formatNumber(stats.totalStudents)}</span>
                </div>
                <ProgressBar
                  progress={Math.min(100, stats.totalStudents * 2)}
                  className="mt-2"
                  ariaLabel="Student participation"
                  indicatorClassName="bg-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
          <div className="rounded-2xl border border-muted-200 bg-white p-6 shadow-card dark:border-muted-800 dark:bg-muted-900/80">
            <h2 className="text-lg font-semibold text-muted-900 dark:text-white">Upcoming agenda</h2>
            <p className="mt-1 text-sm text-muted-500 dark:text-muted-300">What’s next on your ClassBridge calendar.</p>
            <ul className="mt-6 space-y-4">
              <li className="flex items-start gap-3">
                <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:bg-brand-500/15 dark:text-brand-200" aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-semibold text-muted-900 dark:text-white">Launch a new learning sprint</p>
                  <p className="text-xs text-muted-500 dark:text-muted-300">Set goals and supporting resources for the week.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-lg bg-secondary-500/10 text-secondary-600 dark:bg-secondary-500/20 dark:text-secondary-200" aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.25L18.75 18.75M18.75 5.25L5.25 18.75" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-semibold text-muted-900 dark:text-white">Review outstanding assessments</p>
                  <p className="text-xs text-muted-500 dark:text-muted-300">Give timely feedback to keep learners progressing.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200" aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-semibold text-muted-900 dark:text-white">Celebrate learner milestones</p>
                  <p className="text-xs text-muted-500 dark:text-muted-300">Share wins and badges to boost engagement.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-muted-200 bg-white p-6 shadow-card dark:border-muted-800 dark:bg-muted-900/80">
            <h2 className="text-lg font-semibold text-muted-900 dark:text-white">Community pulse</h2>
            <p className="mt-1 text-sm text-muted-500 dark:text-muted-300">Signals from your learning community over the past 7 days.</p>
            <dl className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <dt className="text-sm text-muted-600 dark:text-muted-300">New mentor sign-ups</dt>
                <dd className="text-base font-semibold text-muted-900 dark:text-white">+{formatNumber(stats.totalMentors)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-muted-600 dark:text-muted-300">Student invitations sent</dt>
                <dd className="text-base font-semibold text-muted-900 dark:text-white">+{pendingRequests}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-muted-600 dark:text-muted-300">Average grade</dt>
                <dd className="text-base font-semibold text-muted-900 dark:text-white">{studentStats.averageGrade}%</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
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
