'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import Footer from '@/components/Footer';
import { PageShell } from '@/components/ui/PageShell';
import { GradientHeader } from '@/components/ui/GradientHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

interface Course {
  _id: string;
  name: string;
  description?: string;
  classId: {
    _id: string;
    name: string;
    academicYear: string;
  };
  mentorId: {
    _id: string;
    name: string;
    email: string;
  };
  studentIds: Array<{ _id: string; name: string; email: string }>;
  subject?: string;
  duration: string;
  startDate?: string;
  endDate?: string;
  maxStudents: number;
  enrolledCount: number;
  availableSpots: number;
  materials?: Array<{
    title: string;
    description?: string;
    url: string;
    type: string;
    uploadedAt: string;
  }>;
  syllabus?: string;
  isActive: boolean;
  createdAt: string;
}

interface ClassSummary {
  _id: string;
  name: string;
  academicYear: string;
  schoolId: string;
  mentorIds?: string[];
}

const INITIAL_FORM = {
  name: '',
  description: '',
  classId: '',
  subject: '',
  duration: '1 month',
  startDate: '',
  endDate: '',
  maxStudents: 30,
  syllabus: '',
};

function CourseManagementContent() {
  const router = useRouter();
  const { pushToast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<ClassSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);

  const durationOptions = ['1 week', '2 weeks', '1 month', '2 months', '3 months', '6 months'];

  const fetchUserAndData = useCallback(async () => {
    try {
      const userResponse = await fetch('/api/auth/me');
      if (!userResponse.ok) return;
      const userData = await userResponse.json();

      if (userData.user.role !== 'mentor' && userData.user.role !== 'super_admin') {
        router.push('/dashboard');
        return;
      }

      const [coursesResponse, classesResponse] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/classes'),
      ]);

      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        setCourses(coursesData.courses || []);
      }

      if (classesResponse.ok) {
        const classesData = await classesResponse.json();
        const allClasses: ClassSummary[] = classesData.classes || [];
        const mentorClasses = allClasses.filter((cls) => cls.mentorIds?.includes(userData.user._id));
        setClasses(mentorClasses);
      }
    } catch {
      pushToast({ title: 'Unable to load courses', intent: 'warning' });
    } finally {
      setLoading(false);
    }
  }, [pushToast, router]);

  useEffect(() => {
    fetchUserAndData();
  }, [fetchUserAndData]);

  useEffect(() => {
    if (classes.length > 0 && !formData.classId) {
      setFormData((prev) => ({ ...prev, classId: classes[0]._id }));
    }
  }, [classes, formData.classId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        pushToast({ title: 'Course created', description: 'Your learners can now enroll.', intent: 'success' });
        setShowCreateForm(false);
        setFormData({ ...INITIAL_FORM, classId: classes[0]?._id || '' });
        fetchUserAndData();
      } else {
        const errorData = await response.json();
        pushToast({ title: errorData.error || 'Failed to create course', intent: 'danger' });
      }
    } catch {
      pushToast({ title: 'Failed to create course', description: 'Please try again shortly.', intent: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const courseCards = useMemo(() => {
    if (courses.length === 0) {
      return (
        <Card className="border border-white/40 p-10 text-center shadow-glass">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-brand-500/15 text-brand-600">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-ink-900">No courses yet</h2>
          <p className="mt-2 text-sm text-ink-500">Create a course for one of your classes to start coaching.</p>
        </Card>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => (
          <Card key={course._id} className="border border-white/40 p-6 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-ink-900">{course.name}</h3>
                {course.description ? <p className="mt-1 text-sm text-ink-400">{course.description}</p> : null}
              </div>
              <span className="rounded-full bg-brand-500/15 px-3 py-1 text-xs font-semibold text-brand-600">
                {course.duration}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-ink-400">
              <span className="rounded-full bg-white/80 px-3 py-1">Class · {course.classId.name}</span>
              {course.subject ? <span className="rounded-full bg-white/80 px-3 py-1">{course.subject}</span> : null}
              <span className="rounded-full bg-white/80 px-3 py-1">Max {course.maxStudents} students</span>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3 rounded-xl border border-white/40 bg-white/80 px-4 py-3 text-center text-sm">
              <div>
                <p className="text-lg font-semibold text-brand-600">{course.studentIds.length}</p>
                <p className="text-xs text-ink-400">Enrolled</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-mint-500">{course.availableSpots}</p>
                <p className="text-xs text-ink-400">Spots left</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-accent-purple">{course.materials?.length ?? 0}</p>
                <p className="text-xs text-ink-400">Resources</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between text-sm text-brand-600">
              <Link href={`/dashboard/classes/${course.classId._id}`} className="font-semibold">
                View class →
              </Link>
              <span className="text-ink-400">Created {new Date(course.createdAt).toLocaleDateString()}</span>
            </div>
          </Card>
        ))}
      </div>
    );
  }, [courses]);

  if (loading) {
    return (
      <PageShell>
        <GradientHeader title="Loading courses" description="Collecting course data, please hang tight." />
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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
        title="Course Management"
        description="Design compelling learning experiences and keep your cohorts moving forward."
        action={
          classes.length > 0 ? (
            <Button onClick={() => setShowCreateForm(true)}>Create course</Button>
          ) : null
        }
      />

      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-300">Overview</p>
            <h2 className="text-xl font-semibold text-ink-900">{courses.length} courses</h2>
          </div>
          <Button variant="ghost" onClick={() => router.push('/dashboard')}>
            Back to dashboard
          </Button>
        </div>

        <div className="mt-8">{courseCards}</div>
      </section>

      <Footer />

      <Modal
        open={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        title="Create a course"
        description="Provide details students will see when enrolling."
        actions={
          <>
            <Button variant="ghost" onClick={() => setShowCreateForm(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" form="create-course-form" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create course'}
            </Button>
          </>
        }
      >
        <form id="create-course-form" className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink-500">Course name *</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Design Thinking Fundamentals"
              className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-ink-500">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Explain what students will gain from this course."
              className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-500">Assign to class *</label>
              <select
                name="classId"
                value={formData.classId}
                onChange={handleInputChange}
                required
                className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
              >
                <option value="">Select class</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name} · {cls.academicYear}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-500">Subject</label>
              <input
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="Leadership"
                className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-500">Duration *</label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
              >
                {durationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-500">Maximum students</label>
              <input
                type="number"
                min={1}
                name="maxStudents"
                value={formData.maxStudents}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-500">Start date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-500">End date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-ink-500">Syllabus URL</label>
            <input
              name="syllabus"
              value={formData.syllabus}
              onChange={handleInputChange}
              placeholder="https://..."
              className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
            />
          </div>
        </form>
      </Modal>
    </PageShell>
  );
}

export default function CourseManagementPage() {
  return (
    <AuthGuard requiredRoles={['mentor', 'super_admin']}>
      <CourseManagementContent />
    </AuthGuard>
  );
}
