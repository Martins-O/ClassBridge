'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AssignedClass {
    _id: string;
    name: string;
    academicYear: string;
    semester?: string;
}

interface Mentor {
    _id: string;
    name: string;
    email: string;
    isActive: boolean;
    assignedClasses: AssignedClass[];
}

export default function MentorDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [mentorId, setMentorId] = useState('');
    const [mentor, setMentor] = useState<Mentor | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const unwrapParams = async () => {
            const unwrapped = await params;
            setMentorId(unwrapped.id);
        };
        unwrapParams();
    }, [params]);

    useEffect(() => {
        if (mentorId) {
            fetchMentor();
        }
    }, [mentorId]);

    const fetchMentor = async () => {
        try {
            const response = await fetch(`/api/mentors/${mentorId}`);
            const data = await response.json();

            if (response.ok) {
                setMentor(data.mentor);
            } else {
                setError(data.error || 'Failed to load mentor');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeactivate = async () => {
        if (!confirm('Are you sure you want to deactivate this mentor? They will be removed from all assigned classes.')) {
            return;
        }

        try {
            const response = await fetch(`/api/mentors/${mentorId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchMentor(); // Refresh data
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to deactivate mentor');
            }
        } catch {
            setError('Network error. Please try again.');
        }
    };

    if (loading) {
        return (
            <main className="dashboard">
                <div className="dashboard__card">Loading mentor details…</div>
            </main>
        );
    }

    if (error || !mentor) {
        return (
            <main className="dashboard">
                <div className="dashboard__card dashboard__card--full">
                    {error && <p className="alert alert--error u-margin-bottom-md">{error}</p>}
                    {!error && <p className="auth-card__error">Mentor not found</p>}
                    <button className="btn btn--primary" onClick={() => router.push('/dashboard/mentors')}>
                        Back to mentors
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="dashboard">
            <section className="dashboard__hero">
                <div>
                    <p className="eyebrow">Mentor Details</p>
                    <h1>{mentor.name}</h1>
                    <p className="dashboard__muted">{mentor.email}</p>
                </div>
                <div className="dashboard__hero-actions">
                    <button className="btn btn--ghost" onClick={() => router.push('/dashboard/mentors')}>
                        Back to mentors
                    </button>
                    {mentor.isActive && (
                        <button className="btn btn--error" onClick={handleDeactivate}>
                            Deactivate Mentor
                        </button>
                    )}
                </div>
            </section>

            <section className="dashboard__grid">
                <div className="dashboard__card">
                    <p className="eyebrow">Information</p>
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="info-item__label">Name</span>
                            <strong>{mentor.name}</strong>
                        </div>
                        <div className="info-item">
                            <span className="info-item__label">Email</span>
                            <strong>{mentor.email}</strong>
                        </div>
                        <div className="info-item">
                            <span className="info-item__label">Status</span>
                            <span className={`badge badge--${mentor.isActive ? 'active' : 'inactive'}`}>
                                {mentor.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="dashboard__card">
                    <p className="eyebrow">Currently Teaching</p>
                    <h2>{mentor.assignedClasses.length} Classes</h2>
                    {mentor.assignedClasses.length === 0 ? (
                        <p className="dashboard__muted">No classes assigned yet.</p>
                    ) : (
                        <div className="table table--compact">
                            <div className="table__head">
                                <span>Class Name</span>
                                <span>Academic Year</span>
                                <span>Actions</span>
                            </div>
                            {mentor.assignedClasses.map((cls) => (
                                <div key={cls._id} className="table__row">
                                    <span><strong>{cls.name}</strong></span>
                                    <span>{cls.academicYear} {cls.semester && ` • ${cls.semester}`}</span>
                                    <span>
                                        <button
                                            className="btn btn--ghost btn--sm"
                                            onClick={() => router.push(`/dashboard/classes/${cls._id}`)}
                                        >
                                            View Class
                                        </button>
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
