'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

export default function ClassesPage() {
    const router = useRouter();
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const response = await fetch('/api/classes');
            const data = await response.json();

            if (response.ok) {
                setClasses(data.classes || []);
            } else {
                setError(data.error || 'Failed to load classes');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <main className="dashboard">
                <div className="dashboard__card">Loading classes…</div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="dashboard">
                <div className="dashboard__card">
                    <p className="auth-card__error">{error}</p>
                    <button className="btn btn--primary" onClick={() => router.push('/dashboard')}>
                        Back to dashboard
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="dashboard">
            <section className="dashboard__hero">
                <div>
                    <p className="eyebrow">Class Management</p>
                    <h1>Classes</h1>
                    <p className="dashboard__muted">Manage your school's classes and cohorts</p>
                </div>
                <div className="dashboard__hero-actions">
                    <button className="btn btn--ghost" onClick={() => router.push('/dashboard')}>
                        Back to dashboard
                    </button>
                    <Link href="/dashboard/classes/create" className="btn btn--primary">
                        Create Class
                    </Link>
                </div>
            </section>

            <section className="dashboard__grid">
                {classes.length === 0 ? (
                    <div className="dashboard__card">
                        <p className="eyebrow">No classes yet</p>
                        <h2>Get started by creating your first class</h2>
                        <p>Classes help you organize students and mentors into cohorts for the academic year.</p>
                        <Link href="/dashboard/classes/create" className="btn btn--primary">
                            Create your first class
                        </Link>
                    </div>
                ) : (
                    <div className="dashboard__card">
                        <div className="table">
                            <div className="table__head">
                                <span>Class Name</span>
                                <span>Academic Year</span>
                                <span>Students</span>
                                <span>Mentors</span>
                                <span>Actions</span>
                            </div>
                            {classes.map((cls) => (
                                <div key={cls._id} className="table__row">
                                    <span>
                                        <strong>{cls.name}</strong>
                                        {cls.subject && <small className="dashboard__muted">{cls.subject}</small>}
                                    </span>
                                    <span>
                                        {cls.academicYear}
                                        {cls.semester && ` • ${cls.semester}`}
                                    </span>
                                    <span>
                                        {cls.students.length}
                                        {cls.maxStudents && ` / ${cls.maxStudents}`}
                                    </span>
                                    <span>{cls.mentors.length}</span>
                                    <span>
                                        <Link
                                            href={`/dashboard/classes/${cls._id}`}
                                            className="btn btn--ghost btn--sm"
                                        >
                                            View
                                        </Link>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}
