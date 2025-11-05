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
  schoolId?: string;
}

interface SchoolSummary {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  description?: string;
}

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

interface MentorSummary {
  _id: string;
  name: string;
  email: string;
  isActive: boolean;
  assignedClasses: Array<{ _id: string; name: string }>;
}

interface InviteForm {
  studentName: string;
  studentEmail: string;
  selectedClasses: string[];
  personalMessage: string;
}

interface MentorForm {
  name: string;
  email: string;
}

interface MentorClassForm {
  selectedClasses: string[];
  action: 'assign' | 'remove';
}

type TabKey = 'overview' | 'classes' | 'students' | 'mentors';

const EMPTY_CLASS_FORM = {
  name: '',
  description: '',
  schoolId: '',
  grade: '',
  academicYear: '',
  duration: '',
  cohort: '',
  semester: '',
  subject: '',
  maxStudents: undefined as number | undefined,
};

const EMPTY_INVITE_FORM: InviteForm = {
  studentName: '',
  studentEmail: '',
  selectedClasses: [],
  personalMessage: '',
};

const EMPTY_MENTOR_FORM: MentorForm = {
  name: '',
  email: '',
};

const INITIAL_MENTOR_CLASS_FORM: MentorClassForm = {
  selectedClasses: [],
  action: 'assign',
};

function SchoolManagementContent() {
  const router = useRouter();
  const { pushToast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [school, setSchool] = useState<SchoolSummary | null>(null);
  const [classes, setClasses] = useState<ClassSummary[]>([]);
  const [mentors, setMentors] = useState<MentorSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [classForm, setClassForm] = useState({ ...EMPTY_CLASS_FORM });
  const [creatingClass, setCreatingClass] = useState(false);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState<InviteForm>({ ...EMPTY_INVITE_FORM });
  const [inviteError, setInviteError] = useState('');
  const [sendingInvites, setSendingInvites] = useState(false);

  const [showMentorModal, setShowMentorModal] = useState(false);
  const [mentorForm, setMentorForm] = useState<MentorForm>({ ...EMPTY_MENTOR_FORM });
  const [mentorError, setMentorError] = useState('');
  const [creatingMentor, setCreatingMentor] = useState(false);

  const [showMentorClassModal, setShowMentorClassModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<MentorSummary | null>(null);
  const [mentorClassForm, setMentorClassForm] = useState<MentorClassForm>({ ...INITIAL_MENTOR_CLASS_FORM });
  const [mentorClassError, setMentorClassError] = useState('');
  const [updatingMentorAssignments, setUpdatingMentorAssignments] = useState(false);

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) return;
      const data = await response.json();
      if (!['school_admin', 'super_admin'].includes(data.user.role)) {
        router.push('/dashboard');
        return;
      }
      setUser(data.user);
      return data.user as User;
    } catch {
      pushToast({ title: 'Unable to load profile', intent: 'warning' });
      return undefined;
    }
  }, [pushToast, router]);

  const fetchSchool = useCallback(async (schoolId?: string) => {
    if (!schoolId) return;
    try {
      const response = await fetch(`/api/schools/${schoolId}`);
      if (response.ok) {
        const data = await response.json();
        setSchool(data.school);
        setClassForm((prev) => ({ ...prev, schoolId }));
      }
    } catch {
      pushToast({ title: 'Unable to load school details', intent: 'warning' });
    }
  }, [pushToast]);

  const fetchClasses = useCallback(async () => {
    try {
      const response = await fetch('/api/classes');
      if (response.ok) {
        const data = await response.json();
        setClasses(data.classes || []);
      }
    } catch {
      pushToast({ title: 'Unable to load classes', intent: 'warning' });
    }
  }, [pushToast]);

  const fetchMentors = useCallback(async () => {
    try {
      const response = await fetch('/api/mentors');
      if (response.ok) {
        const data = await response.json();
        setMentors(data.mentors || []);
      }
    } catch {
      pushToast({ title: 'Unable to load mentors', intent: 'warning' });
    }
  }, [pushToast]);

  useEffect(() => {
    (async () => {
      const fetchedUser = await fetchUserProfile();
      if (!fetchedUser) {
        setLoading(false);
        return;
      }
      await Promise.all([fetchSchool(fetchedUser.schoolId), fetchClasses(), fetchMentors()]);
      setLoading(false);
    })();
  }, [fetchClasses, fetchMentors, fetchSchool, fetchUserProfile]);

  const handleCreateClass = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!classForm.schoolId) {
      pushToast({ title: 'Select a school before creating a class', intent: 'warning' });
      return;
    }

    setCreatingClass(true);
    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classForm),
      });
      if (response.ok) {
        pushToast({ title: 'Class created successfully', intent: 'success' });
        setShowCreateClassModal(false);
        setClassForm((prev) => ({ ...EMPTY_CLASS_FORM, schoolId: prev.schoolId }));
        fetchClasses();
      } else {
        const errorData = await response.json();
        pushToast({ title: errorData.error || 'Failed to create class', intent: 'danger' });
      }
    } catch {
      pushToast({ title: 'Failed to create class', description: 'Please try again later.', intent: 'danger' });
    } finally {
      setCreatingClass(false);
    }
  };

  const handleInviteStudents = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!inviteForm.studentEmail || !inviteForm.studentName || inviteForm.selectedClasses.length === 0) {
      setInviteError('Fill in the student details and select at least one class.');
      return;
    }

    setSendingInvites(true);
    setInviteError('');
    try {
      const results = await Promise.all(
        inviteForm.selectedClasses.map((classId) =>
          fetch('/api/students/invite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              studentEmail: inviteForm.studentEmail,
              studentName: inviteForm.studentName,
              classId,
            }),
          })
        )
      );

      if (results.every((res) => res.ok)) {
        pushToast({ title: `Invitation sent to ${inviteForm.studentEmail}`, intent: 'success' });
        setInviteForm({ ...EMPTY_INVITE_FORM });
        setShowInviteModal(false);
        fetchClasses();
      } else {
        const messages = await Promise.all(
          results.map(async (response) => (response.ok ? null : (await response.json()).error || 'Failed to send invitation'))
        );
        setInviteError(messages.filter(Boolean).join(', '));
      }
    } catch {
      setInviteError('Failed to send invitation. Please try again.');
    } finally {
      setSendingInvites(false);
    }
  };

  const handleCreateMentor = async (event: React.FormEvent) => {
    event.preventDefault();
    setMentorError('');
    setCreatingMentor(true);
    try {
      const response = await fetch('/api/mentors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...mentorForm, schoolId: user?.schoolId }),
      });
      if (response.ok) {
        const data = await response.json();
        pushToast({
          title: data.isExistingUser
            ? `Mentor ${mentorForm.name} added to your school`
            : `Invitation sent to ${mentorForm.email}`,
          intent: 'success',
        });
        setMentorForm({ ...EMPTY_MENTOR_FORM });
        setShowMentorModal(false);
        fetchMentors();
      } else {
        const errorData = await response.json();
        setMentorError(errorData.error || 'Failed to invite mentor');
      }
    } catch {
      setMentorError('Failed to invite mentor. Please try again.');
    } finally {
      setCreatingMentor(false);
    }
  };

  const handleMentorClassSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedMentor) return;

    setUpdatingMentorAssignments(true);
    setMentorClassError('');
    try {
      const response = await fetch('/api/mentors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorId: selectedMentor._id,
          classIds: mentorClassForm.selectedClasses,
          action: mentorClassForm.action,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        pushToast({
          title: `Mentor ${data.mentor.name} ${mentorClassForm.action === 'assign' ? 'assigned to' : 'removed from'} classes`,
          intent: 'success',
        });
        setShowMentorClassModal(false);
        setSelectedMentor(null);
        setMentorClassForm({ ...INITIAL_MENTOR_CLASS_FORM });
        fetchMentors();
      } else {
        const errorData = await response.json();
        setMentorClassError(errorData.error || 'Failed to update mentor');
      }
    } catch {
      setMentorClassError('Failed to update mentor assignments. Please try again.');
    } finally {
      setUpdatingMentorAssignments(false);
    }
  };

  const summaryMetrics = useMemo(() => [
    { label: 'Classes', value: classes.length },
    { label: 'Active classes', value: classes.filter((cls) => cls.isActive).length },
    { label: 'Students', value: classes.reduce((sum, cls) => sum + cls.studentIds.length, 0) },
    { label: 'Mentors', value: mentors.length },
  ], [classes, mentors]);

  if (loading) {
    return (
      <PageShell>
        <GradientHeader title="Loading school workspace" description="Preparing the admin view." />
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
        title={school ? school.name : 'School workspace'}
        description="Manage classes, mentors, and student invitations from a single view."
        action={<Link href="/dashboard" className={buttonClasses({ variant: 'ghost' })}>Back to dashboard</Link>}
      />

      <section className="mt-10 flex flex-wrap gap-3">
        {(['overview', 'classes', 'students', 'mentors'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={buttonClasses({ variant: activeTab === tab ? 'primary' : 'secondary', size: 'sm' })}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </section>

      {activeTab === 'overview' && (
        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card className="border border-white/40 p-6 shadow-soft">
            <h2 className="text-lg font-semibold text-ink-900">At a glance</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {summaryMetrics.map((metric) => (
                <div key={metric.label} className="rounded-xl border border-white/30 bg-white/80 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{metric.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-ink-800">{metric.value}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="border border-white/40 p-6 shadow-soft">
            <h2 className="text-lg font-semibold text-ink-900">School contact</h2>
            <div className="mt-4 space-y-3 text-sm text-ink-600">
              <p><strong>Email:</strong> {school?.email ?? 'N/A'}</p>
              <p><strong>Phone:</strong> {school?.phone ?? 'N/A'}</p>
              <p><strong>Address:</strong> {school?.address ?? 'N/A'}</p>
              <p><strong>Website:</strong> {school?.website ?? 'N/A'}</p>
            </div>
          </Card>
        </section>
      )}

      {activeTab === 'classes' && (
        <section className="mt-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-300">Classes</p>
              <h2 className="text-xl font-semibold text-ink-900">{classes.length} total</h2>
            </div>
            <Button onClick={() => setShowCreateClassModal(true)}>Create class</Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {classes.map((cls) => (
              <Card key={cls._id} className="border border-brand-100 p-6 shadow-soft">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-ink-900">{cls.name}</h3>
                    <p className="text-sm text-ink-400">{cls.academicYear}</p>
                    <p className="mt-2 text-xs text-ink-400">{cls.description ?? 'No description provided.'}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${cls.isActive ? 'bg-success/15 text-success' : 'bg-ink-100 text-ink-400'}`}>
                    {cls.isActive ? 'Active' : 'Paused'}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 rounded-xl border border-white/30 bg-white/80 px-4 py-3 text-center text-xs text-ink-400">
                  <div>
                    <p className="text-lg font-semibold text-brand-600">{cls.mentorIds.length}</p>
                    <p>Mentors</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-accent-emerald">{cls.studentIds.length}</p>
                    <p>Students</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-accent-emerald">{cls.maxStudents ?? '—'}</p>
                    <p>Capacity</p>
                  </div>
                </div>
              </Card>
            ))}
            {classes.length === 0 ? <p className="text-sm text-ink-400">No classes created yet.</p> : null}
          </div>
        </section>
      )}

      {activeTab === 'students' && (
        <section className="mt-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-300">Student invitations</p>
              <h2 className="text-xl font-semibold text-ink-900">Invite learners to join classes</h2>
            </div>
            <Button onClick={() => setShowInviteModal(true)}>Invite student</Button>
          </div>

          <Card className="border border-white/40 p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-ink-900">Recently active classes</h3>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-ink-400">
              {classes.map((cls) => (
                <span key={cls._id} className="rounded-xl border border-white/30 bg-white/80 px-3 py-1">
                  {cls.name}
                </span>
              ))}
              {classes.length === 0 ? <span>No classes yet.</span> : null}
            </div>
          </Card>
        </section>
      )}

      {activeTab === 'mentors' && (
        <section className="mt-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-300">Mentor management</p>
              <h2 className="text-xl font-semibold text-ink-900">{mentors.length} mentors</h2>
            </div>
            <Button onClick={() => setShowMentorModal(true)}>Invite mentor</Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {mentors.map((mentor) => (
              <Card key={mentor._id} className="border border-brand-100 p-6 shadow-soft">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-ink-900">{mentor.name}</h3>
                    <p className="text-sm text-ink-400">{mentor.email}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${mentor.isActive ? 'bg-success/15 text-success' : 'bg-ink-100 text-ink-400'}`}>
                    {mentor.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-ink-400">
                  {mentor.assignedClasses.length === 0 ? (
                    <span>No classes yet.</span>
                  ) : (
                    mentor.assignedClasses.map((cls) => (
                      <span key={cls._id} className="rounded-xl border border-white/30 bg-white/80 px-3 py-1">
                        {cls.name}
                      </span>
                    ))
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setSelectedMentor(mentor);
                      setMentorClassForm({
                        action: 'assign',
                        selectedClasses: mentor.assignedClasses.map((cls) => cls._id),
                      });
                      setShowMentorClassModal(true);
                    }}
                  >
                    Manage classes
                  </Button>
                </div>
              </Card>
            ))}
            {mentors.length === 0 ? <p className="text-sm text-ink-400">No mentors invited yet.</p> : null}
          </div>
        </section>
      )}

      <Footer />

      <Modal
        open={showCreateClassModal}
        onClose={() => setShowCreateClassModal(false)}
        title="Create a class"
        description="Define cohort details and set expectations."
        actions={
          <>
            <Button variant="ghost" onClick={() => setShowCreateClassModal(false)} disabled={creatingClass}>
              Cancel
            </Button>
            <Button type="submit" form="school-create-class-form" disabled={creatingClass}>
              {creatingClass ? 'Creating…' : 'Create class'}
            </Button>
          </>
        }
      >
        <form id="school-create-class-form" className="space-y-3" onSubmit={handleCreateClass}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink-500">Class name *</label>
            <input
              className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
              value={classForm.name}
              onChange={(event) => setClassForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink-500">Description</label>
            <textarea
              rows={3}
              className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
              value={classForm.description}
              onChange={(event) => setClassForm((prev) => ({ ...prev, description: event.target.value }))}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-500">Academic year *</label>
              <input
                className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
                value={classForm.academicYear}
                onChange={(event) => setClassForm((prev) => ({ ...prev, academicYear: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-500">Cohort *</label>
              <input
                className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
                value={classForm.cohort}
                onChange={(event) => setClassForm((prev) => ({ ...prev, cohort: event.target.value }))}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink-500">Duration *</label>
            <input
              className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
              value={classForm.duration}
              onChange={(event) => setClassForm((prev) => ({ ...prev, duration: event.target.value }))}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-500">Semester</label>
              <input
                className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
                value={classForm.semester}
                onChange={(event) => setClassForm((prev) => ({ ...prev, semester: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-500">Subject</label>
              <input
                className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
                value={classForm.subject}
                onChange={(event) => setClassForm((prev) => ({ ...prev, subject: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-500">Grade</label>
              <input
                className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
                value={classForm.grade}
                onChange={(event) => setClassForm((prev) => ({ ...prev, grade: event.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink-500">Max students</label>
            <input
              type="number"
              min={1}
              className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
              value={classForm.maxStudents ?? ''}
              onChange={(event) =>
                setClassForm((prev) => ({
                  ...prev,
                  maxStudents: event.target.value ? Number(event.target.value) : undefined,
                }))
              }
            />
          </div>
        </form>
      </Modal>

      <Modal
        open={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite a student"
        description="Send personalised invitations to join classes."
        actions={
          <>
            <Button variant="ghost" onClick={() => setShowInviteModal(false)} disabled={sendingInvites}>
              Cancel
            </Button>
            <Button type="submit" form="school-invite-form" disabled={sendingInvites}>
              {sendingInvites ? 'Sending…' : 'Send invitation'}
            </Button>
          </>
        }
      >
        <form id="school-invite-form" className="space-y-3" onSubmit={handleInviteStudents}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink-500">Student name *</label>
            <input
              className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
              value={inviteForm.studentName}
              onChange={(event) => setInviteForm((prev) => ({ ...prev, studentName: event.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink-500">Student email *</label>
            <input
              type="email"
              className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
              value={inviteForm.studentEmail}
              onChange={(event) => setInviteForm((prev) => ({ ...prev, studentEmail: event.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink-500">Assign to classes *</label>
            <div className="flex flex-wrap gap-2">
              {classes.map((cls) => (
                <button
                  type="button"
                  key={cls._id}
                  onClick={() =>
                    setInviteForm((prev) => ({
                      ...prev,
                      selectedClasses: prev.selectedClasses.includes(cls._id)
                        ? prev.selectedClasses.filter((id) => id !== cls._id)
                        : [...prev.selectedClasses, cls._id],
                    }))
                  }
                  className={buttonClasses({
                    variant: inviteForm.selectedClasses.includes(cls._id) ? 'primary' : 'secondary',
                    size: 'sm',
                  })}
                >
                  {cls.name}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink-500">Personal message</label>
            <textarea
              rows={3}
              className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
              value={inviteForm.personalMessage}
              onChange={(event) => setInviteForm((prev) => ({ ...prev, personalMessage: event.target.value }))}
            />
          </div>
          {inviteError ? <p className="text-sm text-danger">{inviteError}</p> : null}
        </form>
      </Modal>

      <Modal
        open={showMentorModal}
        onClose={() => setShowMentorModal(false)}
        title="Invite a mentor"
        description="Invite mentors to join your school and assign them to classes."
        actions={
          <>
            <Button variant="ghost" onClick={() => setShowMentorModal(false)} disabled={creatingMentor}>
              Cancel
            </Button>
            <Button type="submit" form="school-mentor-form" disabled={creatingMentor}>
              {creatingMentor ? 'Sending…' : 'Send invite'}
            </Button>
          </>
        }
      >
        <form id="school-mentor-form" className="space-y-3" onSubmit={handleCreateMentor}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink-500">Mentor name *</label>
            <input
              className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
              value={mentorForm.name}
              onChange={(event) => setMentorForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink-500">Mentor email *</label>
            <input
              type="email"
              className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
              value={mentorForm.email}
              onChange={(event) => setMentorForm((prev) => ({ ...prev, email: event.target.value }))}
              required
            />
          </div>
          {mentorError ? <p className="text-sm text-danger">{mentorError}</p> : null}
        </form>
      </Modal>

      <Modal
        open={showMentorClassModal}
        onClose={() => {
          setShowMentorClassModal(false);
          setSelectedMentor(null);
        }}
        title={selectedMentor ? `Manage ${selectedMentor.name}'s classes` : 'Manage mentor classes'}
        description="Assign or remove classes from the selected mentor."
        actions={
          <>
            <Button variant="ghost" onClick={() => setShowMentorClassModal(false)} disabled={updatingMentorAssignments}>
              Cancel
            </Button>
            <Button type="submit" form="mentor-class-form" disabled={updatingMentorAssignments}>
              {updatingMentorAssignments ? 'Updating…' : 'Save changes'}
            </Button>
          </>
        }
      >
        <form id="mentor-class-form" className="space-y-3" onSubmit={handleMentorClassSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink-500">Action</label>
            <select
              value={mentorClassForm.action}
              onChange={(event) => setMentorClassForm((prev) => ({ ...prev, action: event.target.value as MentorClassForm['action'] }))}
              className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
            >
              <option value="assign">Assign classes</option>
              <option value="remove">Remove classes</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink-500">Classes</label>
            <div className="flex flex-wrap gap-2">
              {classes.map((cls) => (
                <button
                  type="button"
                  key={cls._id}
                  onClick={() =>
                    setMentorClassForm((prev) => ({
                      ...prev,
                      selectedClasses: prev.selectedClasses.includes(cls._id)
                        ? prev.selectedClasses.filter((id) => id !== cls._id)
                        : [...prev.selectedClasses, cls._id],
                    }))
                  }
                  className={buttonClasses({
                    variant: mentorClassForm.selectedClasses.includes(cls._id) ? 'primary' : 'secondary',
                    size: 'sm',
                  })}
                >
                  {cls.name}
                </button>
              ))}
            </div>
          </div>
          {mentorClassError ? <p className="text-sm text-danger">{mentorClassError}</p> : null}
        </form>
      </Modal>
    </PageShell>
  );
}

export default function SchoolDashboardPage() {
  return (
    <AuthGuard requiredRoles={['school_admin', 'super_admin']}>
      <SchoolManagementContent />
    </AuthGuard>
  );
}
