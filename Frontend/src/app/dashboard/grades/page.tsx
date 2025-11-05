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
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

interface User {
  _id: string;
  role: string;
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
  academicYear: string;
  duration: string;
  cohort: string;
  mentorIds?: string[];
  students?: Student[];
}

interface GradeItem {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
    studentId: string;
  };
  classId: {
    _id: string;
    name: string;
    academicYear: string;
  };
  gradeType: string;
  title: string;
  points: number;
  maxPoints: number;
  percentage: number;
  letterGrade: string;
  weight: number;
  gradedDate: string;
  comments?: string;
  status: string;
}

const INITIAL_GRADE_FORM = {
  studentId: '',
  classId: '',
  gradeType: 'assignment',
  title: '',
  description: '',
  points: '',
  maxPoints: '',
  weight: '0.1',
  comments: '',
  dueDate: '',
};

function GradesDashboardContent() {
  const router = useRouter();
  const { pushToast } = useToast();

  const [classes, setClasses] = useState<ClassSummary[]>([]);
  const [grades, setGrades] = useState<GradeItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [gradeFormData, setGradeFormData] = useState(INITIAL_GRADE_FORM);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUserAndClasses = useCallback(async () => {
    try {
      const userResponse = await fetch('/api/auth/me');
      if (!userResponse.ok) return;
      const userData: { user: User } = await userResponse.json();
      if (!['mentor', 'school_admin', 'super_admin'].includes(userData.user.role)) {
        router.push('/dashboard');
        return;
      }

      const classResponse = await fetch('/api/classes');
      if (classResponse.ok) {
        const classData = await classResponse.json();
        let userClasses: ClassSummary[] = classData.classes || [];
        if (userData.user.role === 'mentor') {
          userClasses = userClasses.filter((cls) => cls.mentorIds?.includes(userData.user._id));
        }
        setClasses(userClasses);
        if (userClasses.length > 0) {
          setSelectedClassId(userClasses[0]._id);
          setGradeFormData((prev) => ({ ...prev, classId: userClasses[0]._id }));
        }
      }
    } catch {
      pushToast({ title: 'Unable to load classes', intent: 'warning' });
    } finally {
      setLoading(false);
    }
  }, [pushToast, router]);

  const fetchGrades = useCallback(async () => {
    if (!selectedClassId) return;
    try {
      const response = await fetch(`/api/grades?classId=${selectedClassId}`);
      if (!response.ok) return;
      const data = await response.json();
      setGrades(data.grades || []);
    } catch {
      pushToast({ title: 'Unable to load grades', intent: 'warning' });
    }
  }, [pushToast, selectedClassId]);

  const fetchClassStudents = useCallback(async () => {
    if (!selectedClassId) return;
    try {
      const response = await fetch(`/api/classes/${selectedClassId}/students`);
      if (!response.ok) return;
      const data = await response.json();
      setClasses((prev) =>
        prev.map((cls) => (cls._id === selectedClassId ? { ...cls, students: data.students } : cls))
      );
    } catch {
      pushToast({ title: 'Unable to load students', intent: 'warning' });
    }
  }, [pushToast, selectedClassId]);

  useEffect(() => {
    fetchUserAndClasses();
  }, [fetchUserAndClasses]);

  useEffect(() => {
    if (selectedClassId) {
      fetchGrades();
      fetchClassStudents();
    }
  }, [selectedClassId, fetchGrades, fetchClassStudents]);

  const selectedClass = useMemo(
    () => classes.find((cls) => cls._id === selectedClassId),
    [classes, selectedClassId]
  );

  const classGrades = useMemo(
    () => grades.filter((grade) => grade.classId._id === selectedClassId),
    [grades, selectedClassId]
  );

  const handleCreateGrade = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!gradeFormData.classId || !gradeFormData.studentId) {
      pushToast({ title: 'Select a student and class', intent: 'warning' });
      return;
    }

    try {
      const response = await fetch('/api/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...gradeFormData,
          points: parseFloat(gradeFormData.points),
          maxPoints: parseFloat(gradeFormData.maxPoints),
          weight: parseFloat(gradeFormData.weight),
          dueDate: gradeFormData.dueDate ? new Date(gradeFormData.dueDate) : undefined,
        }),
      });

      if (response.ok) {
        pushToast({ title: 'Grade recorded successfully', intent: 'success' });
        setGradeFormData({ ...INITIAL_GRADE_FORM, classId: selectedClassId });
        setShowGradeModal(false);
        fetchGrades();
      } else {
        const errorData = await response.json();
        pushToast({ title: errorData.error || 'Failed to create grade', intent: 'danger' });
      }
    } catch {
      pushToast({ title: 'Failed to create grade', description: 'Please try again later.', intent: 'danger' });
    }
  };

  if (loading) {
    return (
      <PageShell>
        <GradientHeader title="Loading gradebook" description="Collecting class information." />
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
        title="Gradebook"
        description="Review class performance, capture new grades, and support every learner."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/dashboard" className={buttonClasses({ variant: 'ghost', size: 'sm' })}>
              Back to dashboard
            </Link>
            {selectedClass ? (
              <Button size="sm" onClick={() => setShowGradeModal(true)}>
                Record grade
              </Button>
            ) : null}
          </div>
        }
      />

      <section className="mt-10 grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card className="border border-white/40 p-6 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-300">Classes</p>
              <h2 className="text-xl font-semibold text-ink-900">{classes.length} available</h2>
            </div>
            <select
              value={selectedClassId}
              onChange={(event) => {
                setSelectedClassId(event.target.value);
                setGradeFormData((prev) => ({ ...prev, classId: event.target.value, studentId: '' }));
              }}
              className="rounded-xl border border-white/40 bg-white/90 px-4 py-2 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
            >
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name} · {cls.academicYear}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {classes.map((cls) => (
              <div
                key={cls._id}
                className={`rounded-xl border border-white/30 px-4 py-3 transition-all ${
                  cls._id === selectedClassId ? 'bg-brand-500/10 shadow-glass' : 'bg-white/80'
                }`}
              >
                <p className="text-sm font-semibold text-ink-800">{cls.name}</p>
                <p className="text-xs text-ink-400">{cls.academicYear}</p>
                <p className="mt-2 text-xs text-ink-400">
                  {cls.cohort} • {cls.duration}
                </p>
              </div>
            ))}
            {classes.length === 0 ? (
              <p className="text-sm text-ink-400">No classes available.</p>
            ) : null}
          </div>
        </Card>

        <Card className="border border-white/40 p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-ink-900">Students</h2>
          <div className="mt-4 space-y-3">
            {selectedClass?.students?.length ? (
              selectedClass.students.map((student) => (
                <button
                  key={student._id}
                  onClick={() => setGradeFormData((prev) => ({ ...prev, studentId: student._id }))}
                  className={`w-full rounded-xl border border-white/30 px-4 py-3 text-left transition ${
                    gradeFormData.studentId === student._id ? 'bg-brand-500/10 shadow-glass' : 'bg-white/80'
                  }`}
                >
                  <p className="text-sm font-semibold text-ink-800">{student.name}</p>
                  <p className="text-xs text-ink-400">{student.email}</p>
                </button>
              ))
            ) : (
              <p className="text-sm text-ink-400">No students enrolled yet.</p>
            )}
          </div>
        </Card>
      </section>

      <section className="mt-10">
        <Card className="border border-white/40 p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink-900">Recent grades</h2>
            <span className="text-sm text-ink-400">{classGrades.length} items</span>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-ink-400">
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Assessment</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Grade</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {classGrades.map((grade) => (
                  <tr key={grade._id} className="border-t border-white/30 text-ink-600">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-ink-800">{grade.studentId.name}</div>
                      <div className="text-xs text-ink-400">{grade.studentId.studentId}</div>
                    </td>
                    <td className="px-4 py-3">{grade.title}</td>
                    <td className="px-4 py-3">
                      {grade.points}/{grade.maxPoints} ({Math.round(grade.percentage)}%)
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-600">
                        {grade.letterGrade}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className="rounded-full bg-success/15 px-3 py-1 text-success">{grade.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-400">
                      {new Date(grade.gradedDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {classGrades.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-sm text-ink-400">
                      No grades recorded for this class yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <Footer />

      <Modal
        open={showGradeModal}
        onClose={() => setShowGradeModal(false)}
        title="Record a grade"
        description="Capture assessment results for a learner."
        actions={
          <>
            <Button variant="ghost" onClick={() => setShowGradeModal(false)}>
              Cancel
            </Button>
            <Button type="submit" form="grade-create-form">
              Save grade
            </Button>
          </>
        }
      >
        <form id="grade-create-form" className="space-y-4" onSubmit={handleCreateGrade}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-500">Class *</label>
              <select
                value={gradeFormData.classId}
                onChange={(event) => setGradeFormData((prev) => ({ ...prev, classId: event.target.value }))}
                className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
                required
              >
                <option value="">Select class</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-500">Student *</label>
              <select
                value={gradeFormData.studentId}
                onChange={(event) => setGradeFormData((prev) => ({ ...prev, studentId: event.target.value }))}
                className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
                required
              >
                <option value="">Select student</option>
                {selectedClass?.students?.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-500">Assessment title *</label>
              <input
                className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
                value={gradeFormData.title}
                onChange={(event) => setGradeFormData((prev) => ({ ...prev, title: event.target.value }))}
                required
                placeholder="Midterm project"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-500">Grade type</label>
              <select
                value={gradeFormData.gradeType}
                onChange={(event) => setGradeFormData((prev) => ({ ...prev, gradeType: event.target.value }))}
                className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
              >
                <option value="assignment">Assignment</option>
                <option value="quiz">Quiz</option>
                <option value="project">Project</option>
                <option value="exam">Exam</option>
                <option value="final">Final</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-500">Points *</label>
              <input
                type="number"
                min={0}
                value={gradeFormData.points}
                onChange={(event) => setGradeFormData((prev) => ({ ...prev, points: event.target.value }))}
                className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-500">Max points *</label>
              <input
                type="number"
                min={1}
                value={gradeFormData.maxPoints}
                onChange={(event) => setGradeFormData((prev) => ({ ...prev, maxPoints: event.target.value }))}
                className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-500">Weight</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={gradeFormData.weight}
                onChange={(event) => setGradeFormData((prev) => ({ ...prev, weight: event.target.value }))}
                className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-ink-500">Comments</label>
            <textarea
              rows={3}
              value={gradeFormData.comments}
              onChange={(event) => setGradeFormData((prev) => ({ ...prev, comments: event.target.value }))}
              className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-ink-500">Due date</label>
            <input
              type="date"
              value={gradeFormData.dueDate}
              onChange={(event) => setGradeFormData((prev) => ({ ...prev, dueDate: event.target.value }))}
              className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
            />
          </div>
        </form>
      </Modal>
    </PageShell>
  );
}

export default function GradesDashboardPage() {
  return (
    <AuthGuard requiredRoles={['mentor', 'school_admin', 'super_admin']}>
      <GradesDashboardContent />
    </AuthGuard>
  );
}
