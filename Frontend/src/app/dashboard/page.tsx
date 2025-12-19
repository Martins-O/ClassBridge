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
        backgroundColor: 'rgba(37, 99, 235, 0.7)',
        borderColor: 'rgba(37, 99, 235, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#475569',
          font: { weight: 'bold' as const }
        }
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#64748b' },
        grid: { color: 'rgba(0, 0, 0, 0.05)' }
      },
      x: {
        ticks: { color: '#64748b' },
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

        if (userData.user.role !== 'school_admin' && userData.user.role !== 'super_admin') {
          // Allowing super_admin too for testing
          if (userData.user.role !== 'school_admin') {
            setError('School administrator access required.');
            return;
          }
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
      {/* Hero Section */}
      <section className="dashboard__hero">
        <div className="dashboard__hero-content">
          <p className="eyebrow">Welcome back,</p>
          <h1>{user.name}</h1>
          <div className="dashboard__hero-meta">
            <span>{user.email}</span>
            <span>Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</span>
            <span className="badge badge--active">{user.role.replace('_', ' ')}</span>
          </div>
        </div>
        <div className="dashboard__hero-actions">
          <button className="btn btn--ghost" onClick={() => router.push('/')}>Marketing Site</button>
          <button className="btn btn--primary" onClick={signOut}>Sign out</button>
        </div>
      </section>

      <div className="dashboard__grid">
        {/* Stats Row */}
        {stats && (
          <div className="dashboard__stats-grid">
            <div className="stat-card">
              <div className="stat-card__icon">📚</div>
              <div>
                <p className="stat-card__label">Total Classes</p>
                <h2 className="stat-card__value">{stats.totalClasses}</h2>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card__icon">👥</div>
              <div>
                <p className="stat-card__label">Total Students</p>
                <h2 className="stat-card__value">{stats.totalStudents}</h2>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card__icon">🎓</div>
              <div>
                <p className="stat-card__label">Total Mentors</p>
                <h2 className="stat-card__value">{stats.totalMentors}</h2>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card__icon">📧</div>
              <div>
                <p className="stat-card__label">Pending Invites</p>
                <h2 className="stat-card__value">{invitations.filter(i => i.status === 'pending').length}</h2>
              </div>
            </div>
          </div>
        )}

        {/* Visualization Card */}
        {classes.length > 0 && (
          <div className="dashboard__card dashboard__card--main">
            <p className="eyebrow">Performance Overview</p>
            <h2>Student Distribution</h2>
            <div style={{ height: '300px', marginTop: '1rem' }}>
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        )}

        {/* Quick Actions Card */}
        <div className="dashboard__card dashboard__card--side">
          <p className="eyebrow">Quick Actions</p>
          <h2>Manage Tasks</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button className="btn btn--ghost btn--sm w-full" onClick={() => router.push('/dashboard/school')}>
              Update School Profile
            </button>
            <button className="btn btn--primary btn--sm w-full" onClick={() => setShowInviteModal(true)}>
              Invite Students
            </button>
            <button className="btn btn--ghost btn--sm w-full" onClick={() => router.push('/dashboard/classes/create')}>
              Create New Class
            </button>
          </div>
        </div>

        {/* Classes Table */}
        <div className="dashboard__card dashboard__card--main">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>Active Cohorts</h2>
            <button className="btn btn--ghost btn--sm" onClick={() => router.push('/dashboard/classes')}>View All</button>
          </div>
          {classes.length === 0 ? (
            <p className="dashboard__muted">No classes active this semester.</p>
          ) : (
            <div className="table">
              <div className="table__head" style={{ gridTemplateColumns: '2fr 1fr 1fr 2fr' }}>
                <span>Class Name</span>
                <span>Students</span>
                <span>Mentors</span>
                <span>Academic Year</span>
              </div>
              {classes.slice(0, 5).map((cls) => (
                <div key={cls._id} className="table__row" style={{ gridTemplateColumns: '2fr 1fr 1fr 2fr' }}>
                  <span><strong>{cls.name}</strong></span>
                  <span>{cls.studentIds?.length ?? 0}</span>
                  <span>{cls.mentorIds?.length ?? 0}</span>
                  <span>{cls.academicYear}{cls.semester ? ` — ${cls.semester}` : ''}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Invitations Table */}
        <div className="dashboard__card dashboard__card--side">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>Recents</h2>
            <button className="btn btn--ghost btn--sm" onClick={() => router.push('/dashboard/students')}>View All</button>
          </div>
          {invitations.length === 0 ? (
            <p className="dashboard__muted">No recent invitations.</p>
          ) : (
            <div className="table">
              {invitations.slice(0, 5).map((invite) => (
                <div key={invite._id} className="table__row" style={{ gridTemplateColumns: '1fr auto', padding: '0.75rem 0' }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.875rem' }}>{invite.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>{invite.email}</p>
                  </div>
                  <span className={`badge badge--${invite.status.toLowerCase()}`}>
                    {invite.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <StudentInviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={refreshInvitations}
      />
    </main>
  );
}
