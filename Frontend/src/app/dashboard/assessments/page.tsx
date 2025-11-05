'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import Footer from '@/components/Footer';
import { PageShell } from '@/components/ui/PageShell';
import { GradientHeader } from '@/components/ui/GradientHeader';
import { Card } from '@/components/ui/Card';
import { Button, buttonClasses } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

interface Assessment {
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

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'inactive', label: 'Inactive' },
  { key: 'peer', label: 'Peer' },
  { key: 'mentor_to_student', label: 'Mentor → Student' },
  { key: 'student_to_mentor', label: 'Student → Mentor' },
  { key: 'self', label: 'Self' },
];

function AssessmentDashboardContent() {
  const { pushToast } = useToast();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAssessments = useCallback(async () => {
    try {
      const response = await fetch('/api/assessments');
      if (!response.ok) return;
      const data = await response.json();
      setAssessments(data.assessments || []);
    } catch {
      pushToast({ title: 'Unable to load assessments', intent: 'warning' });
    } finally {
      setLoading(false);
    }
  }, [pushToast]);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  const deleteAssessment = useCallback(
    async (id: string) => {
      const confirmDelete = window.confirm('Delete this assessment? This cannot be undone.');
      if (!confirmDelete) return;

      try {
        const response = await fetch(`/api/assessments/${id}`, { method: 'DELETE' });
        if (response.ok) {
          setAssessments((prev) => prev.filter((assessment) => assessment._id !== id));
          pushToast({ title: 'Assessment deleted', intent: 'success' });
        } else {
          const error = await response.json();
          pushToast({ title: error.error || 'Failed to delete assessment', intent: 'danger' });
        }
      } catch {
        pushToast({ title: 'Failed to delete assessment', description: 'Please try again.', intent: 'danger' });
      }
    },
    [pushToast]
  );

  const toggleAssessmentStatus = useCallback(
    async (id: string, isActive: boolean) => {
      try {
        const response = await fetch(`/api/assessments/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: !isActive }),
        });

        if (response.ok) {
          setAssessments((prev) =>
            prev.map((assessment) =>
              assessment._id === id ? { ...assessment, isActive: !isActive } : assessment
            )
          );
          pushToast({
            title: `Assessment ${!isActive ? 'activated' : 'paused'}`,
            intent: !isActive ? 'success' : 'info',
          });
        }
      } catch {
        pushToast({ title: 'Unable to update assessment', description: 'Please retry shortly.', intent: 'danger' });
      }
    },
    [pushToast]
  );

  const filteredAssessments = useMemo(() => {
    return assessments.filter((assessment) => {
      const matchesFilter =
        filter === 'all' ||
        (filter === 'active' && assessment.isActive) ||
        (filter === 'inactive' && !assessment.isActive) ||
        assessment.assessmentType === filter;

      const matchesSearch =
        searchTerm.trim() === '' ||
        assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.description.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [assessments, filter, searchTerm]);

  const statusBadge = (assessment: Assessment) => {
    if (!assessment.isActive) return 'Inactive';
    const now = new Date();
    if (assessment.startDate && new Date(assessment.startDate) > now) return 'Scheduled';
    if (assessment.endDate && new Date(assessment.endDate) < now) return 'Ended';
    return 'Active';
  };

  const statusTone = (assessment: Assessment) => {
    if (!assessment.isActive) return 'bg-ink-100 text-ink-500';
    const now = new Date();
    if (assessment.startDate && new Date(assessment.startDate) > now) return 'bg-warning/15 text-warning';
    if (assessment.endDate && new Date(assessment.endDate) < now) return 'bg-danger/15 text-danger';
    return 'bg-success/15 text-success';
  };

  const typeLabel = (type: Assessment['assessmentType']) => {
    const labels: Record<Assessment['assessmentType'], string> = {
      peer: 'Peer assessment',
      mentor_to_student: 'Mentor → student',
      student_to_mentor: 'Student → mentor',
      self: 'Self assessment',
    };
    return labels[type];
  };

  if (loading) {
    return (
      <PageShell>
        <GradientHeader title="Loading assessments" description="Preparing assessment data." />
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-48 animate-pulse rounded-2xl bg-white/50" />
          ))}
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <GradientHeader
        title="Assessment Management"
        description="Craft assessments, track engagement, and keep your cohorts aligned."
        action={
          <Link href="/dashboard/assessments/create">
            <Button>Create assessment</Button>
          </Link>
        }
      />

      <section className="mt-10 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-300">Overview</p>
          <h2 className="text-xl font-semibold text-ink-900">{assessments.length} assessments</h2>
        </div>
        <Link href="/dashboard" className={buttonClasses({ variant: 'ghost' })}>
          Back to dashboard
        </Link>
      </section>

      <Card className="mt-8 border border-white/40 p-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={buttonClasses({
                variant: filter === item.key ? 'primary' : 'secondary',
                size: 'sm',
              })}
            >
              {item.label}
            </button>
          ))}
          </div>
          <div className="ml-auto flex w-full items-center gap-3 sm:w-auto">
            <input
              className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-2 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none sm:w-64"
              placeholder="Search assessments"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </div>
      </Card>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        {filteredAssessments.map((assessment) => (
          <Card key={assessment._id} className="border border-white/40 p-6 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-ink-900">{assessment.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-ink-500">{assessment.description}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone(assessment)}`}>
                {statusBadge(assessment)}
              </span>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-ink-400">
              <span className="rounded-full bg-white/70 px-3 py-1">{typeLabel(assessment.assessmentType)}</span>
              <span className="rounded-full bg-white/70 px-3 py-1">Assessors · {assessment.assessorRole}</span>
              <span className="rounded-full bg-white/70 px-3 py-1">Target · {assessment.targetRole}</span>
              <span className="rounded-full bg-white/70 px-3 py-1">
                Classes · {assessment.classIds.map((cls) => cls.name).join(', ') || 'N/A'}
              </span>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href={`/dashboard/assessments/${assessment._id}`}
                className={buttonClasses({ size: 'sm' })}
              >
                View details
              </Link>
              <button
                onClick={() => toggleAssessmentStatus(assessment._id, assessment.isActive)}
                className={buttonClasses({ size: 'sm', variant: 'secondary' })}
              >
                {assessment.isActive ? 'Pause' : 'Activate'}
              </button>
              <button
                onClick={() => deleteAssessment(assessment._id)}
                className={buttonClasses({ size: 'sm', variant: 'ghost' })}
              >
                Delete
              </button>
            </div>
          </Card>
        ))}

        {filteredAssessments.length === 0 ? (
          <Card className="border border-white/40 p-10 text-center shadow-glass">
            <h3 className="text-lg font-semibold text-ink-900">No assessments match this view</h3>
            <p className="mt-2 text-sm text-ink-500">Try adjusting your filters or search term.</p>
          </Card>
        ) : null}
      </section>

      <Footer />
    </PageShell>
  );
}

export default function AssessmentDashboardPage() {
  return (
    <AuthGuard>
      <AssessmentDashboardContent />
    </AuthGuard>
  );
}
