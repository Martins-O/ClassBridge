'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Class {
    _id: string;
    name: string;
    description?: string;
    subject?: string;
    grade?: string;
    academicYear: string;
    semester?: string;
    cohort?: string;
    duration?: string;
    mentors: Array<{ _id: string; name: string; email: string }>;
    students: Array<{ _id: string; name: string; email: string; studentId: string }>;
    maxStudents?: number;
    isActive?: boolean;
}

export default function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [classId, setClassId] = useState<string>('');
    const [classData, setClassData] = useState<Class | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const unwrapParams = async () => {
            const unwrapped = await params;
            setClassId(unwrapped.id);
        };
        unwrapParams();
    }, [params]);

    useEffect(() => {
        if (classId) {
            fetchClass();
        }
    }, [classId]);

    const fetchClass = async () => {
        try {
            const response = await fetch(`/api/classes/${classId}`);
            const data = await response.json();

            if (response.ok) {
                setClassData(data.class);
            } else {
                setError(data.error || 'Failed to load class');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/classes/${classId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                router.push('/dashboard/classes');
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to delete class');
            }
        } catch {
            setError('Network error. Please try again.');
        }
    };

    if (loading) {
        return (
            <main className="dashboard">
                <div className="dashboard__card">Loading class details…</div>
            </main>
        );
    }

    if (error || !classData) {
        return (
            <main className="dashboard">
                <div className="dashboard__card">
                    <p className="auth-card__error">{error || 'Class not found'}</p>
                    <button className="btn btn--primary" onClick={() => router.push('/dashboard/classes')}>
                        Back to classes
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="dashboard">
            <section className="dashboard__hero">
                <div>
                    <p className="eyebrow">Class Details</p>
                    <h1>{classData.name}</h1>
                    <p className="dashboard__muted">
                        {classData.academicYear}
                        {classData.semester && ` • ${classData.semester}`}
                    </p>
                </div>
                <div className="dashboard__hero-actions">
                    <button className="btn btn--ghost" onClick={() => router.push('/dashboard/classes')}>
                        Back to classes
                    </button>
                    <button className="btn btn--error" onClick={handleDelete}>
                        Delete Class
                    </button>
                </div>
            </section>

            <section className="dashboard__grid">
                <div className="dashboard__card">
                    <p className="eyebrow">Class Information</p>
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="info-item__label">Name</span>
                            <strong>{classData.name}</strong>
                        </div>
                        {classData.description && (
                            <div className="info-item">
                                <span className="info-item__label">Description</span>
                                <p>{classData.description}</p>
                            </div>
                        )}
                        {classData.subject && (
                            <div className="info-item">
                                <span className="info-item__label">Subject</span>
                                <strong>{classData.subject}</strong>
                            </div>
                        )}
                        {classData.grade && (
                            <div className="info-item">
                                <span className="info-item__label">Grade Level</span>
                                <strong>{classData.grade}</strong>
                            </div>
                        )}
                        <div className="info-item">
                            <span className="info-item__label">Academic Year</span>
                            <strong>{classData.academicYear}</strong>
                        </div>
                        <div className="info-item">
                            <span className="info-item__label">Duration</span>
                            <strong>{classData.duration}</strong>
                        </div>
                        <div className="info-item">
                            <span className="info-item__label">Cohort</span>
                            <strong>{classData.cohort}</strong>
                        </div>
                        {classData.maxStudents && (
                            <div className="info-item">
                                <span className="info-item__label">Max Students</span>
                                <strong>{classData.maxStudents}</strong>
                            </div>
                        )}
                    </div>
                </div>

                <div className="dashboard__card">
                    <p className="eyebrow">Enrolled Students</p>
                    <h2>{classData.students.length} Students</h2>
                    {classData.students.length === 0 ? (
                        <p className="dashboard__muted">No students enrolled yet</p>
                    ) : (
                        <div className="table table--compact">
                            <div className="table__head">
                                <span>Name</span>
                                <span>Email</span>
                                <span>Student ID</span>
                            </div>
                            {classData.students.map((student) => (
                                <div key={student._id} className="table__row">
                                    <span><strong>{student.name}</strong></span>
                                    <span>{student.email}</span>
                                    <span>{student.studentId}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="dashboard__card">
                    <p className="eyebrow">Assigned Mentors</p>
                    <h2>{classData.mentors.length} Mentors</h2>
                    {classData.mentors.length === 0 ? (
                        <p className="dashboard__muted">No mentors assigned yet</p>
                    ) : (
                        <div className="table table--compact">
                            <div className="table__head">
                                <span>Name</span>
                                <span>Email</span>
                            </div>
                            {classData.mentors.map((mentor) => (
                                <div key={mentor._id} className="table__row">
                                    <span><strong>{mentor.name}</strong></span>
                                    <span>{mentor.email}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
