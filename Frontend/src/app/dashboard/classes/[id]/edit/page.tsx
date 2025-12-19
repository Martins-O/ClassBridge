'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EditClassPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [id, setId] = useState<string>('');
    const [loading, setLoading] = useState(true);

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [subject, setSubject] = useState('');
    const [grade, setGrade] = useState('');
    const [academicYear, setAcademicYear] = useState('');
    const [semester, setSemester] = useState('');
    const [cohort, setCohort] = useState('');
    const [duration, setDuration] = useState('');
    const [maxStudents, setMaxStudents] = useState('');
    const [isActive, setIsActive] = useState(true);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const unwrapParams = async () => {
            const unwrapped = await params;
            setId(unwrapped.id);
        };
        unwrapParams();
    }, [params]);

    useEffect(() => {
        if (id) {
            fetchClass();
        }
    }, [id]);

    const fetchClass = async () => {
        try {
            const response = await fetch(`/api/classes/${id}`);
            const data = await response.json();

            if (response.ok) {
                const c = data.class;
                setName(c.name);
                setDescription(c.description || '');
                setSubject(c.subject || '');
                setGrade(c.grade || '');
                setAcademicYear(c.academicYear);
                setSemester(c.semester || '');
                setCohort(c.cohort);
                setDuration(c.duration);
                setMaxStudents(c.maxStudents ? c.maxStudents.toString() : '');
                setIsActive(c.isActive);
            } else {
                setError(data.error || 'Failed to load class');
            }
        } catch {
            setError('Failed to fetch class data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name || !academicYear || !duration || !cohort) {
            setError('Please fill in all required fields');
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch(`/api/classes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description: description || undefined,
                    subject: subject || undefined,
                    grade: grade || undefined,
                    academicYear,
                    semester: semester || undefined,
                    cohort,
                    duration,
                    maxStudents: maxStudents ? parseInt(maxStudents) : undefined,
                    isActive
                }),
            });

            const data = await response.json();

            if (response.ok) {
                router.push(`/dashboard/classes/${id}`);
            } else {
                setError(data.error || 'Failed to update class');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <main className="dashboard">
                <div className="dashboard__card">Loading class editor...</div>
            </main>
        );
    }

    return (
        <main className="dashboard">
            <section className="dashboard__hero">
                <div>
                    <p className="eyebrow">Class Management</p>
                    <h1>Edit Class</h1>
                    <p className="dashboard__muted">Update class details</p>
                </div>
            </section>

            <section className="dashboard__grid">
                <div className="dashboard__card">
                    <form onSubmit={handleSubmit}>
                        {error && <p className="auth-card__error">{error}</p>}

                        <p className="form-section-title">Required Information</p>

                        <label className="field">
                            <span>Class Name *</span>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                disabled={submitting}
                            />
                        </label>

                        <label className="field">
                            <span>Academic Year *</span>
                            <input
                                type="text"
                                value={academicYear}
                                onChange={(e) => setAcademicYear(e.target.value)}
                                required
                                disabled={submitting}
                            />
                        </label>

                        <label className="field">
                            <span>Duration *</span>
                            <select
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                required
                                disabled={submitting}
                            >
                                <option value="">Select duration</option>
                                <option value="Full Year">Full Year</option>
                                <option value="Semester 1">Semester 1</option>
                                <option value="Semester 2">Semester 2</option>
                                <option value="Quarter 1">Quarter 1</option>
                                <option value="Quarter 2">Quarter 2</option>
                                <option value="Quarter 3">Quarter 3</option>
                                <option value="Quarter 4">Quarter 4</option>
                            </select>
                        </label>

                        <label className="field">
                            <span>Cohort *</span>
                            <input
                                type="text"
                                value={cohort}
                                onChange={(e) => setCohort(e.target.value)}
                                required
                                disabled={submitting}
                            />
                        </label>

                        <label className="field">
                            <span>Status</span>
                            <select
                                value={isActive ? 'true' : 'false'}
                                onChange={(e) => setIsActive(e.target.value === 'true')}
                                disabled={submitting}
                            >
                                <option value="true">Active</option>
                                <option value="false">Archived / Inactive</option>
                            </select>
                        </label>

                        <p className="form-section-title">Optional Information</p>

                        <label className="field">
                            <span>Description</span>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                disabled={submitting}
                            />
                        </label>

                        <label className="field">
                            <span>Subject</span>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                disabled={submitting}
                            />
                        </label>

                        <label className="field">
                            <span>Grade Level</span>
                            <input
                                type="text"
                                value={grade}
                                onChange={(e) => setGrade(e.target.value)}
                                disabled={submitting}
                            />
                        </label>

                        <label className="field">
                            <span>Semester</span>
                            <select
                                value={semester}
                                onChange={(e) => setSemester(e.target.value)}
                                disabled={submitting}
                            >
                                <option value="">None</option>
                                <option value="Fall">Fall</option>
                                <option value="Spring">Spring</option>
                                <option value="Summer">Summer</option>
                            </select>
                        </label>

                        <label className="field">
                            <span>Maximum Students</span>
                            <input
                                type="number"
                                value={maxStudents}
                                onChange={(e) => setMaxStudents(e.target.value)}
                                min="1"
                                disabled={submitting}
                            />
                        </label>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn btn--ghost"
                                onClick={() => router.push(`/dashboard/classes/${id}`)}
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn btn--primary" disabled={submitting}>
                                {submitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </main>
    );
}
