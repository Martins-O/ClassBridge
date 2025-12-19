'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateClassPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [subject, setSubject] = useState('');
    const [grade, setGrade] = useState('');
    const [academicYear, setAcademicYear] = useState('');
    const [semester, setSemester] = useState('');
    const [cohort, setCohort] = useState('');
    const [duration, setDuration] = useState('');
    const [maxStudents, setMaxStudents] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name || !academicYear || !duration || !cohort) {
            setError('Please fill in all required fields');
            return;
        }

        setSubmitting(true);

        try {
            // Get user's school ID from session
            const userResponse = await fetch('/api/auth/me');
            const userData = await userResponse.json();

            if (!userResponse.ok || !userData.user?.schoolId) {
                setError('Unable to determine your school. Please try again.');
                setSubmitting(false);
                return;
            }

            const response = await fetch('/api/classes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description: description || undefined,
                    schoolId: userData.user.schoolId,
                    subject: subject || undefined,
                    grade: grade || undefined,
                    academicYear,
                    semester: semester || undefined,
                    cohort,
                    duration,
                    maxStudents: maxStudents ? parseInt(maxStudents) : undefined,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                router.push('/dashboard/classes');
            } else {
                setError(data.error || 'Failed to create class');
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
                    <p className="eyebrow">Class Management</p>
                    <h1>Create New Class</h1>
                    <p className="dashboard__muted">Set up a new class for your school</p>
                </div>
            </section>

            <section className="dashboard__grid">
                <div className="dashboard__card">
                    <form onSubmit={handleSubmit}>
                        {error && <p className="alert alert--error u-margin-bottom-md">{error}</p>}

                        <p className="form-section-title">Required Information</p>

                        <label className="field">
                            <span>Class Name *</span>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Mathematics 101"
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
                                placeholder="e.g., 2024-2025"
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
                                placeholder="e.g., Fall 2024"
                                required
                                disabled={submitting}
                            />
                        </label>

                        <p className="form-section-title">Optional Information</p>

                        <label className="field">
                            <span>Description</span>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Brief description of the class"
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
                                placeholder="e.g., Mathematics, Science"
                                disabled={submitting}
                            />
                        </label>

                        <label className="field">
                            <span>Grade Level</span>
                            <input
                                type="text"
                                value={grade}
                                onChange={(e) => setGrade(e.target.value)}
                                placeholder="e.g., 9th Grade, Sophomore"
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
                                placeholder="e.g., 30"
                                min="1"
                                disabled={submitting}
                            />
                        </label>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn btn--ghost"
                                onClick={() => router.push('/dashboard/classes')}
                                disabled={submitting}
                            >
                                Discard Changes
                            </button>
                            <button type="submit" className="btn btn--primary" disabled={submitting}>
                                {submitting ? 'Creating...' : 'Create Class'}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </main>
    );
}
