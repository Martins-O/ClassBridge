'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import Footer from '@/components/Footer';
import { PageShell } from '@/components/ui/PageShell';
import { GradientHeader } from '@/components/ui/GradientHeader';
import { Card } from '@/components/ui/Card';
import { Button, buttonClasses } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

interface Question {
  id: string;
  type: 'multiple-choice' | 'checkbox' | 'text' | 'rating' | 'scale';
  question: string;
  required: boolean;
  weight?: number;
  options?: string[];
  min?: number;
  max?: number;
}

interface AssessmentDetail {
  _id: string;
  title: string;
  description: string;
  assessmentType: 'peer' | 'mentor_to_student' | 'student_to_mentor' | 'self';
  targetRole: 'mentor' | 'student';
  assessorRole: 'mentor' | 'student' | 'self';
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  maxAttempts?: number;
  timeLimit?: number;
  passingScore?: number;
  questions: Question[];
  createdAt: string;
  schoolId: {
    _id: string;
    name: string;
  };
  classIds: Array<{
    _id: string;
    name: string;
    subject?: string;
  }>;
}

interface AssessmentAttempt {
  _id: string;
  attemptNumber: number;
  startedAt: string;
  submittedAt?: string;
  timeSpent?: number;
  score?: number;
  maxScore?: number;
  percentage?: number;
  passed?: boolean;
  isComplete: boolean;
  respondentId: {
    _id: string;
    name: string;
    email: string;
  };
  assessorId: {
    _id: string;
    name: string;
    email: string;
  };
}

function AssessmentDetailContent({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { pushToast } = useToast();

  const [assessment, setAssessment] = useState<AssessmentDetail | null>(null);
  const [attempts, setAttempts] = useState<AssessmentAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [attemptsLoading, setAttemptsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'attempts' | 'analytics'>('overview');

  const fetchAssessment = useCallback(async () => {
    try {
      const response = await fetch(`/api/assessments/${params.id}`);
      if (!response.ok) return;
      const data = await response.json();
      setAssessment(data.assessment);
    } catch {
      pushToast({ title: 'Unable to load assessment', intent: 'warning' });
    } finally {
      setLoading(false);
    }
  }, [params.id, pushToast]);

  const fetchAttempts = useCallback(async () => {
    try {
      const response = await fetch(`/api/assessments/${params.id}/attempts`);
      if (!response.ok) return;
      const data = await response.json();
      setAttempts(data.attempts || []);
    } catch {
      pushToast({ title: 'Unable to load attempts', intent: 'warning' });
    } finally {
      setAttemptsLoading(false);
    }
  }, [params.id, pushToast]);

  useEffect(() => {
    fetchAssessment();
    fetchAttempts();
  }, [fetchAssessment, fetchAttempts]);

  const toggleAssessmentStatus = async () => {
    if (!assessment) return;
    try {
      const response = await fetch(`/api/assessments/${assessment._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !assessment.isActive }),
      });
      if (response.ok) {
        setAssessment((prev) => prev ? { ...prev, isActive: !prev.isActive } : prev);
        pushToast({ title: `Assessment ${assessment.isActive ? 'paused' : 'activated'}`, intent: assessment.isActive ? 'info' : 'success' });
      }
    } catch {
      pushToast({ title: 'Unable to update assessment', intent: 'danger' });
    }
  };

  const deleteAssessment = async () => {
    if (!assessment) return;
    const confirmed = window.confirm('Delete this assessment? This cannot be undone.');
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/assessments/${assessment._id}`, { method: 'DELETE' });
      if (response.ok) {
        pushToast({ title: 'Assessment deleted', intent: 'success' });
        router.push('/dashboard/assessments');
      } else {
        const error = await response.json();
        pushToast({ title: error.error || 'Failed to delete assessment', intent: 'danger' });
      }
    } catch {
      pushToast({ title: 'Failed to delete assessment', intent: 'danger' });
    }
  };

  const analytics = useMemo(() => {
    const completed = attempts.filter((attempt) => attempt.isComplete);
    const averageScore = completed.length
      ? completed.reduce((sum, attempt) => sum + (attempt.percentage || 0), 0) / completed.length
      : 0;
    const passRate = completed.length
      ? (completed.filter((attempt) => attempt.passed).length / completed.length) * 100
      : 0;
    return {
      totalAttempts: attempts.length,
      completedAttempts: completed.length,
      averageScore: Math.round(averageScore),
      passRate: Math.round(passRate),
    };
  }, [attempts]);

  const typeLabel = (type: AssessmentDetail['assessmentType']) => {
    const map: Record<AssessmentDetail['assessmentType'], string> = {
      peer: 'Peer assessment',
      mentor_to_student: 'Mentor → student',
      student_to_mentor: 'Student → mentor',
      self: 'Self assessment',
    };
    return map[type];
  };

  const statusBadge = (item: AssessmentDetail) => {
    if (!item.isActive) return { label: 'Inactive', tone: 'bg-ink-100 text-ink-500' };
    const now = new Date();
    if (item.startDate && new Date(item.startDate) > now) return { label: 'Scheduled', tone: 'bg-warning/15 text-warning' };
    if (item.endDate && new Date(item.endDate) < now) return { label: 'Ended', tone: 'bg-danger/15 text-danger' };
    return { label: 'Active', tone: 'bg-success/15 text-success' };
  };

  if (loading) {
    return (
      <PageShell>
        <GradientHeader title="Loading assessment" description="Gathering the latest details." />
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="h-40 animate-pulse rounded-2xl bg-white/50" />
          <div className="h-40 animate-pulse rounded-2xl bg-white/50" />
        </div>
      </PageShell>
    );
  }

  if (!assessment) {
    return (
      <PageShell>
        <GradientHeader title="Assessment unavailable" description="We couldn't find this assessment." />
        <Card className="mt-8 border border-white/40 p-8 text-center">
          <Link href="/dashboard/assessments" className={buttonClasses({ variant: 'primary' })}>
            Back to assessments
          </Link>
        </Card>
      </PageShell>
    );
  }

  const status = statusBadge(assessment);

  return (
    <PageShell>
      <GradientHeader
        title={assessment.title}
        description={assessment.description}
        action={
          <div className="flex flex-wrap items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.tone}`}>{status.label}</span>
            <Button size="sm" variant="secondary" onClick={toggleAssessmentStatus}>
              {assessment.isActive ? 'Pause' : 'Activate'}
            </Button>
            <Button size="sm" variant="ghost" onClick={deleteAssessment}>
              Delete
            </Button>
          </div>
        }
      />

      <section className="mt-10 grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card className="border border-white/40 p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-ink-900">Assessment overview</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/30 bg-white/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Type</p>
              <p className="mt-1 text-sm text-ink-700">{typeLabel(assessment.assessmentType)}</p>
            </div>
            <div className="rounded-xl border border-white/30 bg-white/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Target role</p>
              <p className="mt-1 text-sm text-ink-700">{assessment.targetRole}</p>
            </div>
            <div className="rounded-xl border border-white/30 bg-white/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Assessor role</p>
              <p className="mt-1 text-sm text-ink-700">{assessment.assessorRole}</p>
            </div>
            <div className="rounded-xl border border-white/30 bg-white/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Max attempts</p>
              <p className="mt-1 text-sm text-ink-700">{assessment.maxAttempts ?? 'Unlimited'}</p>
            </div>
            <div className="rounded-xl border border-white/30 bg-white/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Time limit</p>
              <p className="mt-1 text-sm text-ink-700">{assessment.timeLimit ? `${assessment.timeLimit} minutes` : 'No limit'}</p>
            </div>
            <div className="rounded-xl border border-white/30 bg-white/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Passing score</p>
              <p className="mt-1 text-sm text-ink-700">{assessment.passingScore ? `${assessment.passingScore}%` : 'Not set'}</p>
            </div>
          </div>
        </Card>

        <Card className="border border-white/40 p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-ink-900">Quick actions</h2>
          <div className="mt-4 flex flex-col gap-3 text-sm">
            <Link href="/dashboard/assessments" className="text-brand-600">
              Back to assessment list
            </Link>
            <Link href="/dashboard/assessments/create" className="text-brand-600">
              Duplicate this assessment
            </Link>
          </div>
        </Card>
      </section>

      <section className="mt-10 flex flex-wrap gap-3">
        {(['overview', 'questions', 'attempts', 'analytics'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={buttonClasses({ variant: activeTab === tab ? 'primary' : 'secondary', size: 'sm' })}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </section>

      <section className="mt-8 space-y-6">
        {activeTab === 'overview' && (
          <Card className="border border-white/40 p-6 shadow-soft">
            <h2 className="text-lg font-semibold text-ink-900">Linked classes</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {assessment.classIds.length === 0 ? (
                <p className="text-sm text-ink-400">No classes linked yet.</p>
              ) : (
                assessment.classIds.map((cls) => (
                  <span key={cls._id} className="rounded-xl border border-white/30 bg-white/80 px-4 py-2 text-sm text-ink-700">
                    {cls.name}
                  </span>
                ))
              )}
            </div>
          </Card>
        )}

        {activeTab === 'questions' && (
          <Card className="border border-white/40 p-6 shadow-soft">
            <h2 className="text-lg font-semibold text-ink-900">Questions ({assessment.questions.length})</h2>
            <div className="mt-4 space-y-4">
              {assessment.questions.map((question, index) => (
                <div key={question.id} className="rounded-xl border border-white/30 bg-white/80 px-4 py-3">
                  <p className="text-sm font-semibold text-ink-800">
                    {index + 1}. {question.question}
                  </p>
                  <p className="text-xs text-ink-400 capitalize">{question.type.replace('-', ' ')}</p>
                  {question.options && question.options.length > 0 ? (
                    <ul className="mt-2 list-disc pl-5 text-xs text-ink-500">
                      {question.options.map((option, idx) => (
                        <li key={`${question.id}-option-${idx}`}>{option}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
              {assessment.questions.length === 0 ? <p className="text-sm text-ink-400">No questions defined.</p> : null}
            </div>
          </Card>
        )}

        {activeTab === 'attempts' && (
          <Card className="border border-white/40 p-6 shadow-soft">
            <h2 className="text-lg font-semibold text-ink-900">Attempts</h2>
            {attemptsLoading ? (
              <p className="mt-4 text-sm text-ink-400">Loading attempts…</p>
            ) : attempts.length === 0 ? (
              <p className="mt-4 text-sm text-ink-400">No attempts recorded yet.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-ink-400">
                      <th className="px-4 py-3">Respondent</th>
                      <th className="px-4 py-3">Assessor</th>
                      <th className="px-4 py-3">Score</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Started</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attempts.map((attempt) => (
                      <tr key={attempt._id} className="border-t border-white/30 text-ink-600">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-ink-800">{attempt.respondentId?.name || 'Anonymous'}</div>
                          <div className="text-xs text-ink-400">Attempt {attempt.attemptNumber}</div>
                        </td>
                        <td className="px-4 py-3">{attempt.assessorId?.name || 'Auto'}</td>
                        <td className="px-4 py-3">
                          {attempt.score != null && attempt.maxScore ? `${attempt.score}/${attempt.maxScore}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <span className={`rounded-full px-3 py-1 ${attempt.isComplete ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'}`}>
                            {attempt.isComplete ? 'Completed' : 'In progress'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-ink-400">
                          {new Date(attempt.startedAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {activeTab === 'analytics' && (
          <Card className="border border-white/40 p-6 shadow-soft">
            <h2 className="text-lg font-semibold text-ink-900">Performance insights</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-white/30 bg-white/80 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Total attempts</p>
                <p className="mt-1 text-2xl font-semibold text-ink-800">{analytics.totalAttempts}</p>
              </div>
              <div className="rounded-xl border border-white/30 bg-white/80 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Completed attempts</p>
                <p className="mt-1 text-2xl font-semibold text-ink-800">{analytics.completedAttempts}</p>
              </div>
              <div className="rounded-xl border border-white/30 bg-white/80 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Average score</p>
                <p className="mt-1 text-2xl font-semibold text-ink-800">{analytics.averageScore}%</p>
              </div>
              <div className="rounded-xl border border-white/30 bg-white/80 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Pass rate</p>
                <p className="mt-1 text-2xl font-semibold text-ink-800">{analytics.passRate}%</p>
              </div>
            </div>
          </Card>
        )}
      </section>

      <Footer />
    </PageShell>
  );
}

export default function AssessmentDetailPage({ params }: { params: { id: string } }) {
  return (
    <AuthGuard>
      <AssessmentDetailContent params={params} />
    </AuthGuard>
  );
}
