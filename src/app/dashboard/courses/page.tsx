'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import Footer from '@/components/Footer';
import { PageShell } from '@/components/ui/PageShell';
import { GradientHeader } from '@/components/ui/GradientHeader';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { CourseCard } from '@/components/common/CourseCard';

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

  const handleEditCourse = useCallback((course: Course) => {
    pushToast({ title: `Edit ${course.name}`, description: 'Editing courses will arrive soon.', intent: 'info' });
  }, [pushToast]);

  const handleArchiveCourse = useCallback((course: Course) => {
    pushToast({ title: `Archive ${course.name}`, description: 'Contact support to archive a course.', intent: 'warning' });
  }, [pushToast]);

  const courseCards = useMemo(() => {
    if (courses.length === 0) {
      return (
        <div className="rounded-2xl border border-muted-200 bg-white p-12 text-center shadow-card dark:border-muted-800 dark:bg-muted-900/80">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:bg-brand-500/15 dark:text-brand-200">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m6-6H6" />
            </svg>
          </div>
          <h2 className="mt-4 text-lg font-semibold text-muted-900 dark:text-white">No courses yet</h2>
          <p className="mt-2 text-sm text-muted-500 dark:text-muted-300">Create your first course to give learners a clear path.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {courses.map((course) => {
          const enrolment = course.studentIds.length || course.enrolledCount || 0;
          const completion = course.maxStudents > 0 ? Math.round((enrolment / course.maxStudents) * 100) : 0;

          return (
            <CourseCard
              key={course._id}
              title={course.name}
              description={course.description}
              classLabel={`Class · ${course.classId.name}`}
              subject={course.subject}
              duration={course.duration}
              mentorLabel={course.mentorId?.name}
              progress={completion}
              studentsEnrolled={enrolment}
              capacity={course.maxStudents}
              resources={course.materials?.length ?? 0}
              imageLabel={course.subject ?? course.name}
              createdAt={new Date(course.createdAt).toLocaleDateString()}
              href={`/dashboard/classes/${course.classId._id}`}
              actions={[
                {
                  label: `Edit ${course.name}`,
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 012.651 2.651l-1.688 1.688M8.25 20.25h-3a.75.75 0 01-.75-.75v-3l10.607-10.607 3.75 3.75L8.25 20.25z" />
                    </svg>
                  ),
                  onClick: () => handleEditCourse(course),
                },
                {
                  label: `Archive ${course.name}`,
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519l-.621 9.584a1 1 0 001 1.067h4.484a1 1 0 001-1.067l-.621-9.584M14.121 7.519V6a2.121 2.121 0 10-4.242 0v1.519M4 7.5h16" />
                    </svg>
                  ),
                  onClick: () => handleArchiveCourse(course),
                },
              ]}
            />
          );
        })}
      </div>
    );
  }, [courses, handleArchiveCourse, handleEditCourse]);

  if (loading) {
    return (
      <PageShell>
        <GradientHeader title="Loading courses" description="Collecting course data, please hang tight." />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-48 animate-pulse rounded-2xl border border-muted-200 bg-muted-100 dark:border-muted-800 dark:bg-muted-900/60" />
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
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-500">Overview</p>
            <h2 className="text-xl font-semibold text-muted-900 dark:text-white">{courses.length} courses</h2>
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
            <label className="text-sm font-medium text-muted-600 dark:text-muted-300">Course name *</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Design Thinking Fundamentals"
              className="w-full rounded-xl border border-muted-200 bg-white px-4 py-3 text-sm text-muted-700 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-muted-700 dark:bg-muted-900/70 dark:text-muted-100"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-600 dark:text-muted-300">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Explain what students will gain from this course."
              className="w-full rounded-xl border border-muted-200 bg-white px-4 py-3 text-sm text-muted-700 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-muted-700 dark:bg-muted-900/70 dark:text-muted-100"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-600 dark:text-muted-300">Assign to class *</label>
              <select
                name="classId"
                value={formData.classId}
                onChange={handleInputChange}
                required
                className="w-full rounded-xl border border-muted-200 bg-white px-4 py-3 text-sm text-muted-700 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-muted-700 dark:bg-muted-900/70 dark:text-muted-100"
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
              <label className="text-sm font-medium text-muted-600 dark:text-muted-300">Subject</label>
              <input
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="Leadership"
                className="w-full rounded-xl border border-muted-200 bg-white px-4 py-3 text-sm text-muted-700 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-muted-700 dark:bg-muted-900/70 dark:text-muted-100"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-600 dark:text-muted-300">Duration *</label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-muted-200 bg-white px-4 py-3 text-sm text-muted-700 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-muted-700 dark:bg-muted-900/70 dark:text-muted-100"
              >
                {durationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-600 dark:text-muted-300">Maximum students</label>
              <input
                type="number"
                min={1}
                name="maxStudents"
                value={formData.maxStudents}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-muted-200 bg-white px-4 py-3 text-sm text-muted-700 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-muted-700 dark:bg-muted-900/70 dark:text-muted-100"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-600 dark:text-muted-300">Start date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-muted-200 bg-white px-4 py-3 text-sm text-muted-700 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-muted-700 dark:bg-muted-900/70 dark:text-muted-100"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-600 dark:text-muted-300">End date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-muted-200 bg-white px-4 py-3 text-sm text-muted-700 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-muted-700 dark:bg-muted-900/70 dark:text-muted-100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-600 dark:text-muted-300">Syllabus URL</label>
            <input
              name="syllabus"
              value={formData.syllabus}
              onChange={handleInputChange}
              placeholder="https://..."
              className="w-full rounded-xl border border-muted-200 bg-white px-4 py-3 text-sm text-muted-700 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-muted-700 dark:bg-muted-900/70 dark:text-muted-100"
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
