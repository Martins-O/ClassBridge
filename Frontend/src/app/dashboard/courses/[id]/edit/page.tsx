'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ClassOption {
    _id: string;
    name: string;
}

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [id, setId] = useState<string>('');
    const [loading, setLoading] = useState(true);

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [subject, setSubject] = useState('');
    const [classId, setClassId] = useState('');
    const [duration, setDuration] = useState('3 months');
    const [maxStudents, setMaxStudents] = useState('30');
    const [syllabus, setSyllabus] = useState('');
    const [isActive, setIsActive] = useState(true);

    // Data State
    const [classes, setClasses] = useState<ClassOption[]>([]);
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
            Promise.all([fetchClasses(), fetchCourse()]);
        }
    }, [id]);

    const fetchClasses = async () => {
        try {
            const response = await fetch('/api/classes?schoolId=all');
            const data = await response.json();
            if (response.ok) {
                setClasses(data.classes || []);
            }
        } catch {
            console.error('Failed to load classes');
        }
    };

    const fetchCourse = async () => {
        try {
            const response = await fetch(`/api/courses/${id}`);
            const data = await response.json();

            if (response.ok) {
                const c = data.course;
                setName(c.name);
                setDescription(c.description || '');
                setSubject(c.subject || '');
                // Handle populated classId object if returned, or string
                setClassId(typeof c.classId === 'object' ? c.classId._id : c.classId);
                setDuration(c.duration);
                setMaxStudents(c.maxStudents.toString());
                setSyllabus(c.syllabus || '');
                setIsActive(c.isActive);
            } else {
                setError(data.error || 'Failed to load course');
            }
        } catch {
            setError('Failed to fetch course');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const response = await fetch(`/api/courses/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description,
                    subject,
                    classId,
                    duration,
                    maxStudents: parseInt(maxStudents),
                    syllabus,
                    isActive
                }),
            });

            const data = await response.json();

            if (response.ok) {
                router.push(`/dashboard/courses/${id}`);
            } else {
                setError(data.error || 'Failed to update course');
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
                <div className="dashboard__card">Loading course editor...</div>
            </main>
        );
    }

    return (
        <main className="dashboard">
            <section className="dashboard__hero">
                <div>
                    <p className="eyebrow">Course Management</p>
                    <h1>Edit Course</h1>
                    <p className="dashboard__muted">Update course details and curriculum</p>
                </div>
            </section>

            <section className="dashboard__grid">
                <div className="dashboard__card" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                    <form onSubmit={handleSubmit}>
                        {error && <p className="auth-card__error">{error}</p>}

                        <div className="form-grid">
                            <label className="field">
                                <span>Course Name *</span>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
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
                        </div>

                        <div className="form-grid u-margin-top-sm">
                            <label className="field">
                                <span>Assigned Class *</span>
                                <select
                                    value={classId}
                                    onChange={(e) => setClassId(e.target.value)}
                                    required
                                    disabled={submitting}
                                >
                                    <option value="">Select a Class</option>
                                    {classes.map((cls) => (
                                        <option key={cls._id} value={cls._id}>
                                            {cls.name}
                                        </option>
                                    ))}
                                </select>
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
                        </div>

                        <div className="form-grid u-margin-top-sm">
                            <label className="field">
                                <span>Duration *</span>
                                <select
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    required
                                    disabled={submitting}
                                >
                                    <option value="1 week">1 Week</option>
                                    <option value="2 weeks">2 Weeks</option>
                                    <option value="1 month">1 Month</option>
                                    <option value="2 months">2 Months</option>
                                    <option value="3 months">3 Months</option>
                                    <option value="6 months">6 Months</option>
                                </select>
                            </label>

                            <label className="field">
                                <span>Max Students</span>
                                <input
                                    type="number"
                                    value={maxStudents}
                                    onChange={(e) => setMaxStudents(e.target.value)}
                                    min="1"
                                    max="100"
                                    required
                                    disabled={submitting}
                                />
                            </label>
                        </div>

                        <label className="field u-margin-top-sm">
                            <span>Description</span>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                disabled={submitting}
                            />
                        </label>

                        <label className="field u-margin-top-sm">
                            <span>Syllabus</span>
                            <textarea
                                value={syllabus}
                                onChange={(e) => setSyllabus(e.target.value)}
                                rows={5}
                                disabled={submitting}
                            />
                        </label>

                        <div className="form-actions u-margin-top-md">
                            <button
                                type="button"
                                className="btn btn--ghost"
                                onClick={() => router.push(`/dashboard/courses/${id}`)}
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn--primary"
                                disabled={submitting}
                            >
                                {submitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </main>
    );
}
