'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import Footer from '@/components/Footer';
import { PageShell } from '@/components/ui/PageShell';
import { GradientHeader } from '@/components/ui/GradientHeader';
import { Card } from '@/components/ui/Card';
import { buttonClasses } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

interface User {
  _id: string;
  name: string;
  role: string;
  schoolId: string;
}

interface School {
  _id: string;
  name: string;
  address?: string;
  phone?: string;
  website?: string;
}

interface Student {
  _id: string;
  name: string;
  email: string;
  studentId: string;
}

interface ClassSummary {
  _id: string;
  name: string;
  description?: string;
  grade?: string;
  academicYear: string;
  duration: string;
  cohort: string;
  isActive: boolean;
  studentIds: string[];
  mentorIds: string[];
  students?: Student[];
}

function MentorDashboardContent() {
  const router = useRouter();
  const { pushToast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [assignedClasses, setAssignedClasses] = useState<ClassSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'classes'>('overview');

  const fetchUserAndSchool = useCallback(async () => {
    try {
      const userResponse = await fetch('/api/auth/me');
      if (!userResponse.ok) return;
      const userData = await userResponse.json();
      if (userData.user.role !== 'mentor') {
        router.push('/dashboard');
        return;
      }
      setUser(userData.user);

      if (userData.user.schoolId) {
        const schoolResponse = await fetch(`/api/schools/${userData.user.schoolId}`);
        if (schoolResponse.ok) {
          const schoolData = await schoolResponse.json();
          setSchool(schoolData.school);
        }
      }
    } catch {
      pushToast({ title: 'Unable to load profile', intent: 'warning' });
    }
  }, [pushToast, router]);

  const fetchAssignedClasses = useCallback(async () => {
    if (!user?._id) return;
    try {
      const response = await fetch('/api/classes');
      if (!response.ok) return;
      const data = await response.json();
      const mentorClasses: ClassSummary[] = (data.classes || []).filter((cls: ClassSummary) => cls.mentorIds?.includes(user._id));

      const classesWithStudents = await Promise.all(
        mentorClasses.map(async (cls) => {
          if (!cls.studentIds?.length) return { ...cls, students: [] };
          try {
            const studentsResponse = await fetch(`/api/classes/${cls._id}/students`);
            if (studentsResponse.ok) {
              const studentsData = await studentsResponse.json();
              return { ...cls, students: studentsData.students || [] };
            }
          } catch {
            // ignore
          }
          return { ...cls, students: [] };
        })
      );
      setAssignedClasses(classesWithStudents);
    } catch {
      pushToast({ title: 'Unable to load classes', intent: 'warning' });
    } finally {
      setLoading(false);
    }
  }, [pushToast, user?._id]);

  useEffect(() => {
    fetchUserAndSchool();
  }, [fetchUserAndSchool]);

  useEffect(() => {
    if (user) {
      fetchAssignedClasses();
    }
  }, [user, fetchAssignedClasses]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const totalStudents = useMemo(() => assignedClasses.reduce((sum, cls) => sum + (cls.students?.length ?? 0), 0), [assignedClasses]);
  const activeClasses = useMemo(() => assignedClasses.filter((cls) => cls.isActive).length, [assignedClasses]);

  if (loading) {
    return (
      <PageShell>
        <GradientHeader title="Loading mentor dashboard" description="Gathering your assignments." />
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="h-40 animate-pulse rounded-2xl bg-white/50" />
          <div className="h-40 animate-pulse rounded-2xl bg-white/50" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <GradientHeader
        title={`${greeting}, ${user?.name ?? 'mentor'}!`}
        description={school ? `You’re currently supporting ${school.name}.` : 'Review your classes and stay connected with your learners.'}
        action={<Link href="/dashboard" className={buttonClasses({ variant: 'ghost' })}>Back to dashboard</Link>}
      />

      <section className="mt-10 flex flex-wrap gap-3">
        {(['overview', 'classes'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={buttonClasses({ variant: activeTab === tab ? 'primary' : 'secondary', size: 'sm' })}
          >
            {tab === 'overview' ? 'Overview' : 'My classes'}
          </button>
        ))}
      </section>

      {activeTab === 'overview' && (
        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <Card className="border border-white/40 p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/15 text-brand-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
              <div>
                <p className="text-xs uppercase tracking-wide text-ink-400">Assigned classes</p>
                <p className="text-2xl font-semibold text-ink-800">{assignedClasses.length}</p>
              </div>
            </div>
          </Card>
          <Card className="border border-white/40 p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/15 text-success">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </span>
              <div>
                <p className="text-xs uppercase tracking-wide text-ink-400">Students supported</p>
                <p className="text-2xl font-semibold text-ink-800">{totalStudents}</p>
              </div>
            </div>
          </Card>
          <Card className="border border-white/40 p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/15 text-brand-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <div>
                <p className="text-xs uppercase tracking-wide text-ink-400">Active classes</p>
                <p className="text-2xl font-semibold text-ink-800">{activeClasses}</p>
              </div>
            </div>
          </Card>
        </section>
      )}

      {activeTab === 'classes' && (
        <section className="mt-8 space-y-6">
          {assignedClasses.length === 0 ? (
            <Card className="border border-white/40 p-8 text-center">
              <p className="text-sm text-ink-400">No classes have been assigned yet.</p>
            </Card>
          ) : (
            assignedClasses.map((cls) => (
              <Card key={cls._id} className="border border-white/40 p-6 shadow-soft">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-ink-900">{cls.name}</h2>
                    <p className="text-sm text-ink-500">{cls.description ?? 'No description provided.'}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-ink-400">
                      <span>{cls.academicYear}</span>
                      <span>• {cls.cohort}</span>
                      <span>• {cls.duration}</span>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${cls.isActive ? 'bg-success/15 text-success' : 'bg-ink-100 text-ink-400'}`}>
                    {cls.isActive ? 'Active' : 'Paused'}
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-ink-700">Students</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {cls.students && cls.students.length > 0 ? (
                      cls.students.map((student) => (
                        <span key={student._id} className="rounded-xl border border-white/30 bg-white/80 px-3 py-1 text-xs text-ink-500">
                          {student.name}
                        </span>
                      ))
                    ) : (
                      <p className="text-xs text-ink-400">No students yet.</p>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </section>
      )}

      <Footer />
    </PageShell>
  );
}

export default function MentorDashboardPage() {
  return (
    <AuthGuard requiredRoles={['mentor']}>
      <MentorDashboardContent />
    </AuthGuard>
  );
}
