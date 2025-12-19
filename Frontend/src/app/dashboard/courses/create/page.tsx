'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateCoursePage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [credits, setCredits] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name || !code) {
            setError('Course name and code are required');
            return;
        }

        setSubmitting(true);

        try {
            const userResponse = await fetch('/api/auth/me');
            const userData = await userResponse.json();

            if (!userResponse.ok || !userData.user?.schoolId) {
                setError('Unable to determine your school');
                setSubmitting(false);
                return;
            }

            const response = await fetch('/api/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    code,
                    description: description || undefined,
                    credits: credits ? parseInt(credits) : undefined,
                    schoolId: userData.user.schoolId,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                router.push('/dashboard/courses');
            } else {
                setError(data.error || 'Failed to create course');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="dashboard">
            <section className="dashboard__hero">
                <div>
                    <p className="eyebrow">Course Management</p>
                    <h1>Create Course</h1>
                    <p className="dashboard__muted">Add a new course to your catalog</p>
                </div>
            </section>

            <section className="dashboard__grid">
                <div className="dashboard__card">
                    <form onSubmit={handleSubmit}>
                        {error && <p className="auth-card__error">{error}</p>}

                        <label className="field">
                            <span>Course Code *</span>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="e.g., CS101"
                                required
                                disabled={submitting}
                            />
                        </label>

                        <label className="field">
                            <span>Course Name *</span>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Introduction to Computer Science"
                                required
                                disabled={submitting}
                            />
                        </label>

                        <label className="field">
                            <span>Description</span>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Course description"
                                rows={4}
                                disabled={submitting}
                            />
                        </label>

                        <label className="field">
                            <span>Credits</span>
                            <input
                                type="number"
                                value={credits}
                                onChange={(e) => setCredits(e.target.value)}
                                placeholder="e.g., 3"
                                min="0"
                                disabled={submitting}
                            />
                        </label>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn btn--ghost"
                                onClick={() => router.push('/dashboard/courses')}
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn btn--primary" disabled={submitting}>
                                {submitting ? 'Creating...' : 'Create Course'}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </main>
    );
}
