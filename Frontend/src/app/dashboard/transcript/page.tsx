'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import Footer from '@/components/Footer';
import { PageShell } from '@/components/ui/PageShell';
import { GradientHeader } from '@/components/ui/GradientHeader';
import { Card } from '@/components/ui/Card';
import { Button, buttonClasses } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

interface User {
  role: string;
}

interface CourseRecord {
  _id: string;
  classId: string;
  className: string;
  academicYear: string;
  duration: string;
  cohort: string;
  grade: string;
  credits: number;
  mentorName: string;
  completedDate: string;
  notes?: string;
}

interface AcademicSummary {
  totalCredits: number;
  gpa: number;
  overallGrade: string;
}

interface Transcript {
  _id: string;
  studentInfo: {
    name: string;
    email: string;
    studentNumber: string;
    enrollmentDate: string;
  };
  courseRecords: CourseRecord[];
  academicSummary: AcademicSummary;
  generatedAt: string;
  lastUpdated: string;
}

function TranscriptDashboardContent() {
  const router = useRouter();
  const { pushToast } = useToast();

  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTranscript = useCallback(async () => {
    try {
      const userResponse = await fetch('/api/auth/me');
      if (!userResponse.ok) return;
      const userData: { user: User } = await userResponse.json();
      if (userData.user.role !== 'student') {
        router.push('/dashboard');
        return;
      }

      const transcriptResponse = await fetch('/api/transcripts');
      if (!transcriptResponse.ok) return;
      const data = await transcriptResponse.json();
      const [record] = data.transcripts || [];
      if (!record) {
        setError('Your transcript has not been generated yet.');
        return;
      }
      setTranscript(record);
    } catch {
      setError('Unable to load transcript.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchTranscript();
  }, [fetchTranscript]);

  const exportTranscript = () => {
    try {
      window.print();
    } catch {
      pushToast({ title: 'Failed to export transcript', intent: 'danger' });
    }
  };

  const summaryCards = useMemo(() => {
    if (!transcript) return [];
    return [
      { label: 'Total credits', value: transcript.academicSummary.totalCredits },
      { label: 'GPA', value: transcript.academicSummary.gpa.toFixed(2) },
      { label: 'Overall grade', value: transcript.academicSummary.overallGrade },
    ];
  }, [transcript]);

  const gradeTone = (grade: string) => {
    switch (grade.charAt(0)) {
      case 'A':
        return 'bg-success/15 text-success';
      case 'B':
        return 'bg-brand-500/15 text-brand-600';
      case 'C':
        return 'bg-warning/15 text-warning';
      case 'D':
        return 'bg-orange-500/10 text-orange-500';
      case 'F':
        return 'bg-danger/15 text-danger';
      default:
        return 'bg-ink-100 text-ink-400';
    }
  };

  if (loading) {
    return (
      <PageShell>
        <GradientHeader title="Loading transcript" description="Retrieving your academic journey." />
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="h-40 animate-pulse rounded-2xl bg-white/50" />
          <div className="h-40 animate-pulse rounded-2xl bg-white/50" />
        </div>
      </PageShell>
    );
  }

  if (error || !transcript) {
    return (
      <PageShell>
        <GradientHeader title="Transcript unavailable" description={error || 'No transcript data yet.'} />
        <Card className="mt-8 border border-white/40 p-8 text-center">
          <Link href="/dashboard" className={buttonClasses({ variant: 'primary' })}>
            Back to dashboard
          </Link>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <GradientHeader
        title="Academic transcript"
        description="A complete record of your completed courses and achievements."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" onClick={exportTranscript}>
              Export transcript
            </Button>
          </div>
        }
      />

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <Card className="border border-white/40 p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-ink-900">Student profile</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Name</p>
              <p className="mt-1 text-sm text-ink-700">{transcript.studentInfo.name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Student ID</p>
              <p className="mt-1 text-sm text-ink-700">{transcript.studentInfo.studentNumber}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Email</p>
              <p className="mt-1 text-sm text-ink-700">{transcript.studentInfo.email}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Enrollment date</p>
              <p className="mt-1 text-sm text-ink-700">
                {new Date(transcript.studentInfo.enrollmentDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="border border-white/40 p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-ink-900">Academic summary</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {summaryCards.map((card) => (
              <div key={card.label} className="rounded-xl border border-white/30 bg-white/80 px-4 py-3 text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{card.label}</p>
                <p className="mt-2 text-2xl font-semibold text-ink-800">{card.value}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="mt-10">
        <Card className="border border-white/40 p-6 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-ink-900">Course records</h2>
            <span className="text-sm text-ink-400">
              Updated {new Date(transcript.lastUpdated).toLocaleDateString()}
            </span>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-ink-400">
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Year</th>
                  <th className="px-4 py-3">Cohort</th>
                  <th className="px-4 py-3">Grade</th>
                  <th className="px-4 py-3">Credits</th>
                  <th className="px-4 py-3">Mentor</th>
                  <th className="px-4 py-3">Completed</th>
                </tr>
              </thead>
              <tbody>
                {transcript.courseRecords.map((record) => (
                  <tr key={record._id} className="border-t border-white/30 text-ink-600">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-ink-800">{record.className}</div>
                      <div className="text-xs text-ink-400">{record.duration}</div>
                    </td>
                    <td className="px-4 py-3">{record.academicYear}</td>
                    <td className="px-4 py-3">{record.cohort}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${gradeTone(record.grade)}`}>
                        {record.grade}
                      </span>
                    </td>
                    <td className="px-4 py-3">{record.credits}</td>
                    <td className="px-4 py-3">{record.mentorName}</td>
                    <td className="px-4 py-3 text-xs text-ink-400">
                      {new Date(record.completedDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <Footer />
    </PageShell>
  );
}

export default function TranscriptDashboardPage() {
  return (
    <AuthGuard>
      <TranscriptDashboardContent />
    </AuthGuard>
  );
}
