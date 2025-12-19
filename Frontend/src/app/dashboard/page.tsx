'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StudentInviteModal from './components/StudentInviteModal';

interface UserPayload {
  user: {
    name: string;
    email: string;
    role: string;
    createdAt?: string;
  };
}

interface DashboardStats {
  totalClasses: number;
  totalSchools: number;
  totalStudents: number;
  totalMentors: number;
}

interface ClassSummary {
  _id: string;
  name: string;
  academicYear: string;
  semester?: string;
  mentorIds?: string[];
  studentIds?: string[];
  createdAt?: string;
}

interface InvitationSummary {
  _id: string;
  email: string;
  name: string;
  status: string;
  classId?: {
    name: string;
    academicYear?: string;
  };
  expiresAt: string;
}

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserPayload['user'] | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [classes, setClasses] = useState<ClassSummary[]>([]);
  const [invitations, setInvitations] = useState<InvitationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Chart Logic
  const chartData = {
    labels: classes.map(c => c.name),
    datasets: [
      {
        label: 'Students per Class',
        data: classes.map(c => c.studentIds?.length || 0),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: '#94a3b8' }
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      x: {
        ticks: { color: '#94a3b8' },
        grid: { display: false }
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const [userRes, statsRes, classesRes, invitationsRes] = await Promise.all([
          fetch('/api/auth/me', { signal: controller.signal }),
          fetch('/api/stats', { signal: controller.signal }),
          fetch('/api/classes?schoolId=all', { signal: controller.signal }),
          fetch('/api/students/invitations', { signal: controller.signal }),
        ]);

        if (!userRes.ok) {
          setError('Please sign in to access your admin workspace.');
          return;
        }

        const userData: UserPayload = await userRes.json();
        setUser(userData.user);

        if (userData.user.role !== 'school_admin') {
          setError('School administrator access required.');
          return;
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (statsData.stats) setStats(statsData.stats as DashboardStats);
        }

        if (classesRes.ok) {
          const classesData = await classesRes.json();
          setClasses(classesData.classes || []);
        }

        if (invitationsRes.ok) {
          const invitationsData = await invitationsRes.json();
          setInvitations(invitationsData.invitations || []);
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError('Failed to load workspace data.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => controller.abort();
  }, []);

  const refreshInvitations = async () => {
    try {
      const response = await fetch('/api/students/invitations');
      if (response.ok) {
        const data = await response.json();
        setInvitations(data.invitations || []);
      }
    } catch {
      // Silently fail refresh
    }
  };

  const signOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading) {
    return (
      <main className="dashboard">
        <div className="dashboard__card">Loading your workspace…</div>
      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="dashboard">
        <div className="dashboard__card">
          <p>{error || 'Account unavailable.'}</p>
          <button className="btn btn--primary" onClick={() => router.push('/login')}>
            Go to login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard">
      <section className="dashboard__hero">
        <div>
          <p className="eyebrow">School administrator</p>
          <h1>{user.name}</h1>
          <p className="dashboard__muted">{user.email}</p>
          <p className="dashboard__muted">
            Account created: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
          </p>
        </div>
        <div className="dashboard__hero-actions">
          <button className="btn btn--ghost" onClick={() => router.push('/')}>Marketing site</button>
          <button className="btn btn--primary" onClick={signOut}>Sign out</button>
        </div>
      </section>

      <section className="dashboard__grid">
        {stats ? (
          <section className="dashboard__stats">
            {/* ... stats cards ... */}
            <div className="stat-card">
              <div className="stat-card__icon">📚</div>
              <div className="stat-card__content">
                <p className="stat-card__label">Total Classes</p>
                <h2 className="stat-card__value">{stats?.totalClasses || 0}</h2>
                <p className="stat-card__trend">Active this semester</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card__icon">👥</div>
              <div className="stat-card__content">
                <p className="stat-card__label">Total Students</p>
                <h2 className="stat-card__value">{stats?.totalStudents || 0}</h2>
                <p className="stat-card__trend">Enrolled students</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card__icon">🎓</div>
              <div className="stat-card__content">
                <p className="stat-card__label">Total Mentors</p>
                <h2 className="stat-card__value">{stats?.totalMentors || 0}</h2>
                <p className="stat-card__trend">Active mentors</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card__icon">📧</div>
              <div className="stat-card__content">
                <p className="stat-card__label">Pending Invites</p>
                <h2 className="stat-card__value">{invitations.filter(i => i.status === 'pending').length}</h2>
                <p className="stat-card__trend">Awaiting acceptance</p>
              </div>
            </div>
          </section>
        ) : null}

        {classes.length > 0 && (
          <div className="dashboard__card" style={{ gridColumn: 'span 2' }}>
            <p className="eyebrow">Visual Insights</p>
            <h2>Student Distribution</h2>
            <div style={{ height: '300px', marginTop: '1.5rem' }}>
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        )}

        <div className="dashboard__card">
          <p className="eyebrow">Quick actions</p>
          <div className="actions">
            <article>
              <h3>Set up your school</h3>
              <p>Update contact info, branding, and subscription details for families.</p>
              <button className="btn btn--ghost" type="button" onClick={() => router.push('/dashboard/school')}>
                Update profile
              </button>
            </article>
            <article>
              <h3>Invite students</h3>
              <p>Send secure invitations so learners can join your workspace.</p>
              <button className="btn btn--ghost" type="button" onClick={() => setShowInviteModal(true)}>
                Send invite
              </button>
            </article>
            <article>
              <h3>Share assessments</h3>
              <p>Use curated templates to measure competency and feedback loops.</p>
              <button className="btn btn--ghost" type="button" disabled>
                Assessment builder (coming soon)
              </button>
            </article>
          </div>
        </div>

        <div className="dashboard__card">
          <div className="dashboard__card-header">
            <div>
              <p className="eyebrow">Classes</p>
              <h2>Active cohorts</h2>
            </div>
          </div>
          {classes.length === 0 ? (
            <p>No classes yet. Set up your first cohort.</p>
          ) : (
            <div className="table">
              <div className="table__head">
                <span>Class</span>
                <span>Students</span>
                <span>Mentors</span>
                <span>Year</span>
              </div>
              {classes.map((cls) => (
                <div key={cls._id} className="table__row">
                  <span>{cls.name}</span>
                  <span>{cls.studentIds?.length ?? 0}</span>
                  <span>{cls.mentorIds?.length ?? 0}</span>
                  <span>
                    {cls.academicYear}
                    {cls.semester ? ` • ${cls.semester}` : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard__card">
          <div className="dashboard__card-header">
            <div>
              <p className="eyebrow">Invitations</p>
              <h2>Pending students</h2>
            </div>
          </div>
          {invitations.length === 0 ? (
            <p>No invitations sent yet.</p>
          ) : (
            <div className="table table--compact">
              <div className="table__head">
                <span>Student</span>
                <span>Status</span>
                <span>Class</span>
                <span>Expires</span>
              </div>
              {invitations.map((invite) => (
                <div key={invite._id} className="table__row">
                  <span>
                    <strong>{invite.name}</strong>
                    <small className="dashboard__muted">{invite.email}</small>
                  </span>
                  <span>
                    <span className={`badge badge--${invite.status?.toLowerCase()}`}>
                      {invite.status}
                    </span>
                  </span>
                  <span>{invite.classId?.name ?? '—'}</span>
                  <span>{new Date(invite.expiresAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="dashboard__card">
        <p className="eyebrow">Next steps</p>
        <ul className="checklist">
          <li>
            <span>Configure your school profile and upload branding assets.</span>
            <button className="btn btn--ghost" type="button" disabled>Open profile (coming soon)</button>
          </li>
          <li>
            <span>Create mentor accounts and assign them to classes.</span>
            <button className="btn btn--ghost" type="button" disabled>Mentor hub (coming soon)</button>
          </li>
          <li>
            <span>Share assessments to collect competency evidence.</span>
            <button className="btn btn--ghost" type="button" disabled>Assessment hub (coming soon)</button>
          </li>
        </ul>
      </section>

      <StudentInviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={refreshInvitations}
      />
    </main>
  );
}
