'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Course {
    _id: string;
    name: string;
    code: string;
    description?: string;
    credits?: number;
    isActive: boolean;
}

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [courseId, setCourseId] = useState('');
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const unwrapParams = async () => {
            const unwrapped = await params;
            setCourseId(unwrapped.id);
        };
        unwrapParams();
    }, [params]);

    useEffect(() => {
        if (courseId) {
            fetchCourse();
        }
    }, [courseId]);

    const fetchCourse = async () => {
        try {
            const response = await fetch(`/api/courses/${courseId}`);
            const data = await response.json();

            if (response.ok) {
                setCourse(data.course);
            } else {
                setError(data.error || 'Failed to load course');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/courses/${courseId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                router.push('/dashboard/courses');
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to delete course');
            }
        } catch {
            setError('Network error. Please try again.');
        }
    };

    if (loading) {
        return (
            <main className="dashboard">
                <div className="dashboard__card">Loading course…</div>
            </main>
        );
    }

    if (error || !course) {
        return (
            <main className="dashboard">
                <div className="dashboard__card dashboard__card--full">
                    {error && <p className="alert alert--error u-margin-bottom-md">{error}</p>}
                    <p className="auth-card__error">{error || 'Course not found'}</p>
                    <button className="btn btn--primary" onClick={() => router.push('/dashboard/courses')}>
                        Back to courses
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="dashboard">
            <section className="dashboard__hero">
                <div>
                    <p className="eyebrow">Course Details</p>
                    <h1>{course.name}</h1>
                    <p className="dashboard__muted">{course.code}</p>
                </div>
                <div className="dashboard__hero-actions">
                    <button className="btn btn--ghost" onClick={() => router.push('/dashboard/courses')}>
                        Back to courses
                    </button>
                    <button className="btn btn--primary" onClick={() => router.push(`/dashboard/courses/${courseId}/edit`)}>
                        Edit Course
                    </button>
                    <button className="btn btn--error" onClick={handleDelete}>
                        Delete Course
                    </button>
                </div>
            </section>

            <section className="dashboard__grid">
                <div className="dashboard__card">
                    <p className="eyebrow">Course Information</p>
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="info-item__label">Course Code</span>
                            <strong>{course.code}</strong>
                        </div>
                        <div className="info-item">
                            <span className="info-item__label">Course Name</span>
                            <strong>{course.name}</strong>
                        </div>
                        {course.description && (
                            <div className="info-item">
                                <span className="info-item__label">Description</span>
                                <p>{course.description}</p>
                            </div>
                        )}
                        {course.credits && (
                            <div className="info-item">
                                <span className="info-item__label">Credits</span>
                                <strong>{course.credits}</strong>
                            </div>
                        )}
                        <div className="info-item">
                            <span className="info-item__label">Status</span>
                            <span className={`badge badge--${course.isActive ? 'active' : 'inactive'}`}>
                                {course.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
