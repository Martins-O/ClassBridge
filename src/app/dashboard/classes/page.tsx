'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import { PageShell } from '@/components/ui/PageShell';
import { GradientHeader } from '@/components/ui/GradientHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

interface ClassSummary {
  _id: string;
  name: string;
  description?: string;
  subject?: string;
  grade?: string;
  academicYear: string;
  semester?: string;
  mentorIds: Array<{ _id: string; name: string; email: string }>;
  studentIds: Array<{ _id: string; name: string; email: string }>;
  isActive: boolean;
  maxStudents?: number;
  createdAt: string;
}

interface SchoolSummary {
  _id: string;
  name: string;
}

const INITIAL_FORM = {
  name: '',
  description: '',
  schoolId: '',
  academicYear: '',
  semester: '',
  duration: '',
  cohort: '',
  maxStudents: 50,
};

export default function ClassManagement() {
  const router = useRouter();
  const { pushToast } = useToast();
  const [classes, setClasses] = useState<ClassSummary[]>([]);
  const [schools, setSchools] = useState<SchoolSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);

  const fetchSchools = useCallback(async () => {
    try {
      const response = await fetch('/api/schools');
      if (!response.ok) return;
      const data = await response.json();
      setSchools(data.schools || []);
    } catch {
      pushToast({ title: 'Unable to load schools', intent: 'warning' });
    }
  }, [pushToast]);

  const fetchClasses = useCallback(async () => {
    try {
      const response = await fetch('/api/classes?schoolId=all');
      if (!response.ok) return;
      const data = await response.json();
      setClasses(data.classes || []);
    } catch {
      pushToast({ title: 'Unable to load classes', intent: 'warning' });
    } finally {
      setLoading(false);
    }
  }, [pushToast]);

  useEffect(() => {
    fetchSchools();
    fetchClasses();
  }, [fetchClasses, fetchSchools]);

  useEffect(() => {
    if (schools.length > 0 && !formData.schoolId) {
      setFormData((prev) => ({ ...prev, schoolId: schools[0]._id }));
    }
  }, [schools, formData.schoolId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        pushToast({ title: 'Class created successfully', intent: 'success' });
        setShowCreateModal(false);
        setFormData({ ...INITIAL_FORM, schoolId: schools[0]?._id || '' });
        fetchClasses();
      } else {
        const error = await response.json();
        pushToast({ title: error.error || 'Failed to create class', intent: 'danger' });
      }
    } catch {
      pushToast({ title: 'Failed to create class', description: 'Please try again.', intent: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleClassStatus = useCallback(async (classId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/classes/${classId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });

      if (response.ok) {
        fetchClasses();
        pushToast({
          title: `Class ${isActive ? 'activated' : 'deactivated'}`,
          intent: isActive ? 'success' : 'info',
        });
      } else {
        const error = await response.json();
        pushToast({ title: error.error || 'Unable to update class', intent: 'danger' });
      }
    } catch {
      pushToast({ title: 'Unable to update class', description: 'Please retry in a moment.', intent: 'danger' });
    }
  }, [fetchClasses, pushToast]);

  const classCards = useMemo(() => {
    if (classes.length === 0) {
      return (
        <Card className="border border-white/40 p-10 text-center shadow-glass">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-brand-500/15 text-brand-600">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-ink-900">No classes yet</h2>
          <p className="mt-2 text-sm text-ink-500">Create your first class to start organizing students and mentors.</p>
        </Card>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {classes.map((classItem) => (
          <Card key={classItem._id} className="border border-white/40 p-6 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-ink-900">{classItem.name}</h3>
                {classItem.description ? (
                  <p className="mt-1 text-sm text-ink-400">{classItem.description}</p>
                ) : null}
                <p className="mt-2 text-xs font-medium text-brand-500/80">
                  {classItem.academicYear} {classItem.semester ? `• ${classItem.semester}` : ''}
                </p>
              </div>
              <span
                className={`mt-1 h-2 w-2 rounded-full ${classItem.isActive ? 'bg-success' : 'bg-ink-300'}`}
                aria-hidden
              />
            </div>

            <div className="mt-5 flex items-center justify-between rounded-xl border border-white/40 bg-white/70 px-4 py-3 text-sm">
              <div className="text-center">
                <p className="text-lg font-semibold text-brand-600">{classItem.mentorIds.length}</p>
                <p className="text-xs text-ink-400">Mentors</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-accent-purple">{classItem.studentIds.length}</p>
                <p className="text-xs text-ink-400">Students</p>
              </div>
              {classItem.maxStudents ? (
                <div className="text-center">
                  <p className="text-lg font-semibold text-mint-500">{classItem.maxStudents}</p>
                  <p className="text-xs text-ink-400">Capacity</p>
                </div>
              ) : null}
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <Button onClick={() => router.push(`/dashboard/classes/${classItem._id}`)}>View class</Button>
              <Button
                variant={classItem.isActive ? 'secondary' : 'primary'}
                onClick={() => toggleClassStatus(classItem._id, !classItem.isActive)}
              >
                {classItem.isActive ? 'Pause enrollments' : 'Activate class'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    );
  }, [classes, router, toggleClassStatus]);

  if (loading) {
    return (
      <PageShell>
        <GradientHeader title="Loading classes" description="Please wait while we set up your workspace." />
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
        title="Class Management"
        description="Create, activate, and monitor classes without leaving this workspace."
        action={
          <Button onClick={() => setShowCreateModal(true)}>
            Create class
          </Button>
        }
      />

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-300">Overview</p>
            <h2 className="text-xl font-semibold text-ink-900">{classes.length} classes</h2>
          </div>
          <Button variant="ghost" onClick={() => router.push('/dashboard')}>
            Back to dashboard
          </Button>
        </div>

        <div className="mt-8">{classCards}</div>
      </section>

      <Footer />

      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create a new class"
        description="Define the cohort details and assign it to a school."
        actions={
          <>
            <Button variant="ghost" onClick={() => setShowCreateModal(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" form="create-class-form" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create class'}
            </Button>
          </>
        }
      >
        <form id="create-class-form" className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-500">Class name *</label>
              <input
                className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
                value={formData.name}
                onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Intro to Leadership"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-500">Academic year *</label>
              <input
                className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
                value={formData.academicYear}
                onChange={(event) => setFormData((prev) => ({ ...prev, academicYear: event.target.value }))}
                placeholder="2024-2025"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-ink-500">Description</label>
            <textarea
              className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
              rows={3}
              value={formData.description}
              onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Share what this class covers and how students will benefit."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-500">Semester *</label>
              <select
                className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
                value={formData.semester}
                onChange={(event) => setFormData((prev) => ({ ...prev, semester: event.target.value }))}
                required
              >
                <option value="">Select semester</option>
                <option value="Fall">Fall</option>
                <option value="Spring">Spring</option>
                <option value="Summer">Summer</option>
                <option value="Winter">Winter</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-500">Duration *</label>
              <select
                className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
                value={formData.duration}
                onChange={(event) => setFormData((prev) => ({ ...prev, duration: event.target.value }))}
                required
              >
                <option value="">Select duration</option>
                <option value="1 month">1 month</option>
                <option value="2 months">2 months</option>
                <option value="3 months">3 months</option>
                <option value="6 months">6 months</option>
                <option value="1 year">1 year</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-500">Cohort *</label>
              <input
                className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
                value={formData.cohort}
                onChange={(event) => setFormData((prev) => ({ ...prev, cohort: event.target.value }))}
                placeholder="Cohort A"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-500">Maximum students</label>
              <input
                type="number"
                min={1}
                className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
                value={formData.maxStudents}
                onChange={(event) => setFormData((prev) => ({ ...prev, maxStudents: Number(event.target.value) }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-ink-500">Assign to school *</label>
            <select
              className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
              value={formData.schoolId}
              onChange={(event) => setFormData((prev) => ({ ...prev, schoolId: event.target.value }))}
              required
            >
              <option value="">Select school</option>
              {schools.map((school) => (
                <option key={school._id} value={school._id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>
        </form>
      </Modal>
    </PageShell>
  );
}
