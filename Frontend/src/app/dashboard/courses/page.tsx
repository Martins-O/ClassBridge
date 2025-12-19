'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Course {
    _id: string;
    name: string;
    code: string;
    description?: string;
    credits?: number;
    isActive: boolean;
}

export default function CoursesPage() {
    const router = useRouter();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await fetch('/api/courses');
            const data = await response.json();

            if (response.ok) {
                setCourses(data.courses || []);
            } else {
                setError(data.error || 'Failed to load courses');
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
                <div className="dashboard__card">Loading courses…</div>
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
                    <p className="eyebrow">Course Management</p>
                    <h1>Course Catalog</h1>
                    <p className="dashboard__muted">Define available courses for your school</p>
                </div>
                <div className="dashboard__hero-actions">
                    <button className="btn btn--ghost" onClick={() => router.push('/dashboard')}>
                        Back to dashboard
                    </button>
                    <Link href="/dashboard/courses/create" className="btn btn--primary">
                        Create Course
                    </Link>
                </div>
            </section>

            <section className="dashboard__grid">
                {courses.length === 0 ? (
                    <div className="dashboard__card">
                        <p className="eyebrow">No courses yet</p>
                        <h2>Get started by creating your first course</h2>
                        <p>Courses define the curriculum offerings at your school.</p>
                        <Link href="/dashboard/courses/create" className="btn btn--primary">
                            Create your first course
                        </Link>
                    </div>
                ) : (
                    <div className="dashboard__card">
                        <div className="table">
                            <div className="table__head">
                                <span>Course Code</span>
                                <span>Course Name</span>
                                <span>Credits</span>
                                <span>Status</span>
                                <span>Actions</span>
                            </div>
                            {courses.map((course) => (
                                <div key={course._id} className="table__row">
                                    <span><strong>{course.code}</strong></span>
                                    <span>{course.name}</span>
                                    <span>{course.credits || '—'}</span>
                                    <span>
                                        <span className={`badge badge--${course.isActive ? 'active' : 'inactive'}`}>
                                            {course.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </span>
                                    <span>
                                        <Link
                                            href={`/dashboard/courses/${course._id}`}
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
