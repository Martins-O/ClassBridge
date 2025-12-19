'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    studentId?: string;
    phone?: string;
    bio?: string;
    createdAt: string;
    schoolId?: {
        name: string;
    };
    classIds?: Array<{
        _id: string;
        name: string;
        academicYear: string;
        isActive: boolean;
    }>;
}

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [id, setId] = useState('');
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    // Edit form state
    const [editName, setEditName] = useState('');
    const [editStudentId, setEditStudentId] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const unwrapParams = async () => {
            const unwrapped = await params;
            setId(unwrapped.id);
        };
        unwrapParams();
    }, [params]);

    useEffect(() => {
        if (id) {
            fetchStudent();
        }
    }, [id]);

    const fetchStudent = async () => {
        try {
            const response = await fetch(`/api/users/${id}`);
            const data = await response.json();

            if (response.ok) {
                setUser(data.user);
                setEditName(data.user.name);
                setEditStudentId(data.user.studentId || '');
                setEditPhone(data.user.phone || '');
            } else {
                setError(data.error || 'Failed to load student');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const response = await fetch(`/api/users/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: editName,
                    studentId: editStudentId || undefined,
                    phone: editPhone || undefined,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
                setIsEditing(false);
            } else {
                const data = await response.json();
                alert(data.error || 'Update failed');
            }
        } catch {
            alert('Network error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <main className="dashboard"><div className="dashboard__card">Loading student...</div></main>;
    }

    if (error || !user) {
        return (
            <main className="dashboard">
                <div className="dashboard__card">
                    <p className="auth-card__error">{error || 'Student not found'}</p>
                    <button className="btn btn--primary" onClick={() => router.push('/dashboard/students')}>
                        Back to students
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="dashboard">
            <section className="dashboard__hero u-flex-between">
                <div>
                    <p className="eyebrow">Student Profile</p>
                    <h1>{user.name}</h1>
                    <p className="dashboard__muted">{user.email}</p>
                </div>
                <div className="dashboard__hero-actions">
                    <button className="btn btn--ghost" onClick={() => router.push('/dashboard/students')}>
                        Back
                    </button>
                    {!isEditing && (
                        <button className="btn btn--primary" onClick={() => setIsEditing(true)}>
                            Edit Profile
                        </button>
                    )}
                </div>
            </section>

            <section className="dashboard__grid">
                <div className="dashboard__card">
                    <p className="eyebrow">Information</p>
                    {isEditing ? (
                        <form onSubmit={handleUpdate} className="u-margin-top-md">
                            <label className="field">
                                <span>Full Name</span>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    required
                                />
                            </label>
                            <label className="field">
                                <span>Student ID</span>
                                <input
                                    type="text"
                                    value={editStudentId}
                                    onChange={e => setEditStudentId(e.target.value)}
                                />
                            </label>
                            <label className="field">
                                <span>Phone</span>
                                <input
                                    type="text"
                                    value={editPhone}
                                    onChange={e => setEditPhone(e.target.value)}
                                />
                            </label>
                            <div className="form-actions u-margin-top-md">
                                <button type="button" className="btn btn--ghost" onClick={() => setIsEditing(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn--primary" disabled={submitting}>
                                    {submitting ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="info-grid u-margin-top-md">
                            <div className="info-item">
                                <span className="info-item__label">Student ID</span>
                                <strong>{user.studentId || 'Not assigned'}</strong>
                            </div>
                            <div className="info-item">
                                <span className="info-item__label">Joined</span>
                                <strong>{new Date(user.createdAt).toLocaleDateString()}</strong>
                            </div>
                            <div className="info-item">
                                <span className="info-item__label">Status</span>
                                <span className={`badge badge--${user.isActive ? 'active' : 'inactive'}`}>
                                    {user.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            {user.phone && (
                                <div className="info-item">
                                    <span className="info-item__label">Phone</span>
                                    <strong>{user.phone}</strong>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="dashboard__card">
                    <p className="eyebrow">Enrollment</p>
                    <h2>{(user.classIds?.length ?? 0)} Active Classes</h2>
                    {(!user.classIds || user.classIds.length === 0) ? (
                        <p className="dashboard__muted">Not enrolled in any classes.</p>
                    ) : (
                        <div className="table table--compact u-margin-top-md">
                            <div className="table__head">
                                <span>Class Name</span>
                                <span>Year</span>
                                <span>Status</span>
                            </div>
                            {user.classIds.map(cls => (
                                <div key={cls._id} className="table__row">
                                    <span><strong>{cls.name}</strong></span>
                                    <span>{cls.academicYear}</span>
                                    <span>
                                        <span className={`badge badge--${cls.isActive ? 'active' : 'inactive'}`}>
                                            {cls.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="dashboard__card" style={{ gridColumn: 'span 2' }}>
                    <p className="eyebrow">Academic Status</p>
                    <div className="u-flex u-flex-between">
                        <article>
                            <h3>Transcript</h3>
                            <p>View complete academic history and grades for this student.</p>
                            <button
                                className="btn btn--ghost u-margin-top-sm"
                                onClick={() => router.push(`/dashboard/students/${user._id}/transcript`)}
                            >
                                View Transcript
                            </button>
                        </article>
                    </div>
                </div>
            </section>
        </main>
    );
}
