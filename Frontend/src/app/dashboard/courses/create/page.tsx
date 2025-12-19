'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ClassOption {
    _id: string;
    name: string;
}

export default function CreateCoursePage() {
    const router = useRouter();

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [subject, setSubject] = useState('');
    const [classId, setClassId] = useState('');
    const [duration, setDuration] = useState('3 months');
    const [maxStudents, setMaxStudents] = useState('30');
    const [syllabus, setSyllabus] = useState('');

    // Data State
    const [classes, setClasses] = useState<ClassOption[]>([]);
    const [loadingClasses, setLoadingClasses] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            // Fetch classes relevant to the user (mentors see their classes, admins see all)
            const response = await fetch('/api/classes?schoolId=all');
            const data = await response.json();

            if (response.ok) {
                setClasses(data.classes || []);
            } else {
                setError('Failed to load eligible classes');
            }
        } catch {
            setError('Network error loading classes');
        } finally {
            setLoadingClasses(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name || !classId || !duration) {
            setError('Please fill in all required fields');
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch('/api/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description,
                    subject,
                    classId,
                    duration,
                    maxStudents: parseInt(maxStudents),
                    syllabus,
                    // startDate/endDate can be added if needed, or inferred from duration/class
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
                    <p className="dashboard__muted">Add a new course to a class curriculum</p>
                </div>
            </section>

            <section className="dashboard__grid">
                <div className="dashboard__card">
                    <form onSubmit={handleSubmit}>
                        {error && <p className="alert alert--error u-margin-bottom-md">{error}</p>}

                        <div className="form-grid">
                            <label className="field">
                                <span>Course Name *</span>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Advanced React Patterns"
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
                                    placeholder="e.g., Computer Science"
                                    disabled={submitting}
                                />
                            </label>
                        </div>

                        <label className="field u-margin-top-sm">
                            <span>Assign to Class *</span>
                            <select
                                value={classId}
                                onChange={(e) => setClassId(e.target.value)}
                                required
                                disabled={submitting || loadingClasses}
                            >
                                <option value="">Select a Class</option>
                                {classes.map((cls) => (
                                    <option key={cls._id} value={cls._id}>
                                        {cls.name}
                                    </option>
                                ))}
                            </select>
                            {classes.length === 0 && !loadingClasses && (
                                <small className="text-yellow-500">
                                    No classes found. You must be assigned to a class to create a course.
                                </small>
                            )}
                        </label>

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
                                placeholder="Brief overview of the course content..."
                                rows={3}
                                disabled={submitting}
                            />
                        </label>

                        <label className="field u-margin-top-sm">
                            <span>Syllabus (Optional)</span>
                            <textarea
                                value={syllabus}
                                onChange={(e) => setSyllabus(e.target.value)}
                                placeholder="Weekly breakdown or learning objectives..."
                                rows={5}
                                disabled={submitting}
                            />
                        </label>

                        <div className="form-actions u-margin-top-md">
                            <button
                                type="button"
                                className="btn btn--ghost"
                                onClick={() => router.push('/dashboard/courses')}
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn--primary"
                                disabled={submitting || (classes.length === 0)}
                            >
                                {submitting ? 'Creating...' : 'Create Course'}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </main>
    );
}
