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

interface ClassSummary {
  _id: string;
  name: string;
  academicYear: string;
  semester?: string;
}

interface InvitationSummary {
  _id: string;
  email: string;
  name: string;
  classId: {
    _id: string;
    name: string;
    academicYear: string;
  };
  status: string;
  expiresAt: string;
  createdAt: string;
}

const INITIAL_FORM = {
  studentEmail: '',
  studentName: '',
  classId: '',
};

function StudentInvitationsContent() {
  const router = useRouter();
  const { pushToast } = useToast();
  const [classes, setClasses] = useState<ClassSummary[]>([]);
  const [invitations, setInvitations] = useState<InvitationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);

  const fetchData = useCallback(async () => {
    try {
      const [classesResponse, invitationsResponse] = await Promise.all([
        fetch('/api/classes'),
        fetch('/api/students/invitations'),
      ]);

      if (classesResponse.ok) {
        const classesData = await classesResponse.json();
        setClasses(classesData.classes || []);
      }

      if (invitationsResponse.ok) {
        const invitationsData = await invitationsResponse.json();
        setInvitations(invitationsData.invitations || []);
      }
    } catch {
      pushToast({ title: 'Unable to load invitations', intent: 'warning' });
    } finally {
      setLoading(false);
    }
  }, [pushToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (classes.length > 0 && !formData.classId) {
      setFormData((prev) => ({ ...prev, classId: classes[0]._id }));
    }
  }, [classes, formData.classId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/students/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        pushToast({ title: 'Invitation sent', description: 'The student will receive an email shortly.', intent: 'success' });
        setShowInviteForm(false);
        setFormData({ ...INITIAL_FORM, classId: classes[0]?._id || '' });
        fetchData();
      } else {
        const errorData = await response.json();
        pushToast({ title: errorData.error || 'Failed to send invitation', intent: 'danger' });
      }
    } catch {
      pushToast({ title: 'Failed to send invitation', description: 'Please try again later.', intent: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (status: string) => {
    const tone = {
      pending: 'bg-warning/15 text-warning px-3 py-1 rounded-full text-xs font-semibold',
      accepted: 'bg-success/15 text-success px-3 py-1 rounded-full text-xs font-semibold',
      expired: 'bg-danger/15 text-danger px-3 py-1 rounded-full text-xs font-semibold',
    } as const;
    const key = status as keyof typeof tone;
    return <span className={tone[key] ?? 'bg-ink-100 text-ink-500 px-3 py-1 rounded-full text-xs font-semibold'}>{status}</span>;
  };

  const invitationTable = useMemo(() => {
    if (invitations.length === 0) {
      return (
        <Card className="border border-white/40 p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-brand-500/15 text-brand-600">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-ink-900">No invitations yet</h3>
          <p className="mt-2 text-sm text-ink-500">Invite your first student to kickstart engagement.</p>
        </Card>
      );
    }

    return (
      <Card className="border border-white/40">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink-400">
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Class</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Sent</th>
                <th className="px-5 py-3">Expires</th>
              </tr>
            </thead>
            <tbody>
              {invitations.map((invitation) => (
                <tr key={invitation._id} className="border-t border-white/30 text-ink-600">
                  <td className="px-5 py-4 font-semibold text-ink-800">{invitation.name}</td>
                  <td className="px-5 py-4">{invitation.email}</td>
                  <td className="px-5 py-4">
                    {invitation.classId.name} ({invitation.classId.academicYear})
                  </td>
                  <td className="px-5 py-4">{statusBadge(invitation.status)}</td>
                  <td className="px-5 py-4 text-ink-400">
                    {new Date(invitation.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 text-ink-400">
                    {new Date(invitation.expiresAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    );
  }, [invitations]);

  if (loading) {
    return (
      <PageShell>
        <GradientHeader title="Loading invitations" description="We are preparing the invitation dashboard." />
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-40 animate-pulse rounded-2xl bg-white/50" />
          ))}
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <GradientHeader
        title="Student Invitations"
        description="Invite learners to join classes and keep track of their status."
        action={
          classes.length > 0 ? (
            <Button onClick={() => setShowInviteForm(true)}>Invite student</Button>
          ) : null
        }
      />

      <section className="mt-10 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-300">Overview</p>
          <h2 className="text-xl font-semibold text-ink-900">{invitations.length} invitations</h2>
        </div>
        <Button variant="ghost" onClick={() => router.push('/dashboard')}>
          Back to dashboard
        </Button>
      </section>

      <section className="mt-8 space-y-6">
        {classes.length === 0 ? (
          <Card className="border border-white/40 p-10 text-center shadow-glass">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-brand-500/15 text-brand-600">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-ink-900">No classes yet</h3>
            <p className="mt-2 text-sm text-ink-500">Create classes before inviting students to join them.</p>
            <Link href="/dashboard/classes" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-600">
              Go to class management →
            </Link>
          </Card>
        ) : (
          invitationTable
        )}
      </section>

      <Footer />

      <Modal
        open={showInviteForm}
        onClose={() => setShowInviteForm(false)}
        title="Invite a student"
        description="Send a personalized invitation to join a class."
        actions={
          <>
            <Button variant="ghost" onClick={() => setShowInviteForm(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" form="invite-student-form" disabled={submitting}>
              {submitting ? 'Sending…' : 'Send invitation'}
            </Button>
          </>
        }
      >
        <form id="invite-student-form" className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-500">Student name *</label>
              <input
                className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
                value={formData.studentName}
                onChange={(event) => setFormData((prev) => ({ ...prev, studentName: event.target.value }))}
                required
                placeholder="Ada Lovelace"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-500">Student email *</label>
              <input
                type="email"
                className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
                value={formData.studentEmail}
                onChange={(event) => setFormData((prev) => ({ ...prev, studentEmail: event.target.value }))}
                required
                placeholder="student@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-ink-500">Class *</label>
            <select
              className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
              value={formData.classId}
              onChange={(event) => setFormData((prev) => ({ ...prev, classId: event.target.value }))}
              required
            >
              <option value="">Select class</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name} · {cls.academicYear}
                </option>
              ))}
            </select>
          </div>
        </form>
      </Modal>
    </PageShell>
  );
}

export default function StudentInvitationsPage() {
  return (
    <AuthGuard requiredRoles={['school_admin', 'super_admin']}>
      <StudentInvitationsContent />
    </AuthGuard>
  );
}
