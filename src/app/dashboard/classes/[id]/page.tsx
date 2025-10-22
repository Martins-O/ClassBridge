'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import Footer from '@/components/Footer';
import { PageShell } from '@/components/ui/PageShell';
import { GradientHeader } from '@/components/ui/GradientHeader';
import { Card } from '@/components/ui/Card';
import { Button, buttonClasses } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

interface UserSummary {
  _id: string;
  name: string;
  email: string;
}

interface ClassDetail {
  _id: string;
  name: string;
  description?: string;
  subject?: string;
  grade?: string;
  academicYear: string;
  semester?: string;
  mentorIds: UserSummary[];
  studentIds: UserSummary[];
  isActive: boolean;
  maxStudents?: number;
  createdAt: string;
}

const INITIAL_INVITE = { studentName: '', studentEmail: '' };

function ClassDashboardContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { pushToast } = useToast();

  const [classData, setClassData] = useState<ClassDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteData, setInviteData] = useState(INITIAL_INVITE);
  const [submitting, setSubmitting] = useState(false);

  const classId = params?.id;

  const fetchClassDetails = useCallback(async () => {
    if (!classId) {
      setError('Invalid class id.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/classes/${classId}`);
      if (!response.ok) {
        setError('Unable to load class details.');
        return;
      }
      const data = await response.json();
      setClassData(data.class);
      setError('');
    } catch {
      setError('Something went wrong while fetching the class.');
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    fetchClassDetails();
  }, [fetchClassDetails]);

  const handleInviteStudent = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!classId) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/students/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentEmail: inviteData.studentEmail,
          studentName: inviteData.studentName,
          classId,
        }),
      });

      if (response.ok) {
        pushToast({ title: 'Invitation sent', description: 'The student will receive an email shortly.', intent: 'success' });
        setShowInviteModal(false);
        setInviteData(INITIAL_INVITE);
        fetchClassDetails();
      } else {
        const errorData = await response.json();
        pushToast({ title: errorData.error || 'Unable to send invitation', intent: 'danger' });
      }
    } catch {
      pushToast({ title: 'Unable to send invitation', description: 'Please try again later.', intent: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  const headerAction = classData ? (
    <div className="flex flex-wrap items-center gap-3">
      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${classData.isActive ? 'bg-success/15 text-success' : 'bg-ink-100 text-ink-400'}`}>
        {classData.isActive ? 'Active' : 'Inactive'}
      </span>
      <Link href="/dashboard/classes" className={buttonClasses({ variant: 'ghost', size: 'sm' })}>
        Back to classes
      </Link>
      <Button size="sm" onClick={() => setShowInviteModal(true)}>
        Invite student
      </Button>
    </div>
  ) : null;

  const detailsList = useMemo(() => {
    if (!classData) return [];
    return [
      { label: 'Subject', value: classData.subject ?? '—' },
      { label: 'Grade', value: classData.grade ?? '—' },
      { label: 'Academic year', value: classData.academicYear },
      { label: 'Semester', value: classData.semester ?? '—' },
      { label: 'Max students', value: classData.maxStudents ? classData.maxStudents.toString() : 'Not set' },
      { label: 'Created', value: new Date(classData.createdAt).toLocaleDateString() },
    ];
  }, [classData]);

  if (loading) {
    return (
      <PageShell>
        <GradientHeader title="Loading class" description="Preparing classroom insights." />
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="h-40 animate-pulse rounded-2xl bg-white/50" />
          <div className="h-40 animate-pulse rounded-2xl bg-white/50" />
        </div>
      </PageShell>
    );
  }

  if (error || !classData) {
    return (
      <PageShell>
        <GradientHeader title="Class unavailable" description={error || 'We could not locate this class.'} />
        <Card className="mt-8 border border-white/40 p-8 text-center">
          <Link href="/dashboard/classes" className={buttonClasses({ variant: 'primary' })}>
            Back to classes
          </Link>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <GradientHeader
        title={classData.name}
        description={classData.description || 'Manage mentors, students, and invitations for this class.'}
        action={headerAction}
      />

      <section className="mt-10 grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card className="border border-white/40 p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-ink-900">Class overview</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {detailsList.map((item) => (
              <div key={item.label} className="rounded-xl border border-white/30 bg-white/80 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{item.label}</p>
                <p className="mt-1 text-sm text-ink-700">{item.value}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border border-white/40 p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-ink-900">Quick links</h2>
          <div className="mt-4 flex flex-col gap-3 text-sm">
            <Link href="/dashboard/assessments" className="text-brand-600">
              View assessments for this class
            </Link>
            <Link href="/dashboard/grades" className="text-brand-600">
              Manage gradebook
            </Link>
            <Link href="/dashboard/invitations" className="text-brand-600">
              Review invitations
            </Link>
          </div>
        </Card>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <Card className="border border-white/40 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-ink-900">Mentors</h2>
              <p className="text-sm text-ink-400">{classData.mentorIds.length} mentors assigned</p>
            </div>
            <Link href="/dashboard/mentor" className={buttonClasses({ variant: 'ghost', size: 'sm' })}>
              Manage mentors
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {classData.mentorIds.length === 0 ? (
              <p className="text-sm text-ink-400">No mentors assigned yet.</p>
            ) : (
              classData.mentorIds.map((mentor) => (
                <div key={mentor._id} className="flex items-center justify-between rounded-xl border border-white/30 bg-white/80 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-ink-800">{mentor.name}</p>
                    <p className="text-xs text-ink-400">{mentor.email}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="border border-white/40 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-ink-900">Students</h2>
              <p className="text-sm text-ink-400">{classData.studentIds.length} enrolled</p>
            </div>
            <button className={buttonClasses({ variant: 'ghost', size: 'sm' })} onClick={() => setShowInviteModal(true)}>
              Invite
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {classData.studentIds.length === 0 ? (
              <p className="text-sm text-ink-400">No students enrolled yet.</p>
            ) : (
              classData.studentIds.map((student) => (
                <div key={student._id} className="flex items-center justify-between rounded-xl border border-white/30 bg-white/80 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-ink-800">{student.name}</p>
                    <p className="text-xs text-ink-400">{student.email}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </section>

      <Footer />

      <Modal
        open={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite a student"
        description="Send a personalised email to enroll a learner into this class."
        actions={
          <>
            <Button variant="ghost" onClick={() => setShowInviteModal(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" form="class-invite-form" disabled={submitting}>
              {submitting ? 'Sending…' : 'Send invitation'}
            </Button>
          </>
        }
      >
        <form id="class-invite-form" className="space-y-4" onSubmit={handleInviteStudent}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink-500">Student name *</label>
            <input
              className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
              value={inviteData.studentName}
              onChange={(event) => setInviteData((prev) => ({ ...prev, studentName: event.target.value }))}
              required
              placeholder="Grace Hopper"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink-500">Student email *</label>
            <input
              type="email"
              className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
              value={inviteData.studentEmail}
              onChange={(event) => setInviteData((prev) => ({ ...prev, studentEmail: event.target.value }))}
              required
              placeholder="student@example.com"
            />
          </div>
        </form>
      </Modal>
    </PageShell>
  );
}

export default function ClassDashboardPage() {
  return (
    <AuthGuard>
      <ClassDashboardContent />
    </AuthGuard>
  );
}
