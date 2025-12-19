'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Option {
    id: string;
    name: string;
}

export default function CreateGradePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Data Loading
    const [classes, setClasses] = useState<Option[]>([]);
    const [students, setStudents] = useState<Option[]>([]);

    // Form State
    const [classId, setClassId] = useState('');
    const [studentId, setStudentId] = useState('');
    const [title, setTitle] = useState('');
    const [gradeType, setGradeType] = useState('assignment');
    const [points, setPoints] = useState('');
    const [maxPoints, setMaxPoints] = useState('100');
    const [description, setDescription] = useState('');

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (classId) {
            fetchStudents(classId);
        } else {
            setStudents([]);
            setStudentId('');
        }
    }, [classId]);

    const fetchClasses = async () => {
        try {
            const response = await fetch('/api/classes?schoolId=all');
            const data = await response.json();
            if (response.ok) {
                // Map to Option interface
                setClasses((data.classes || []).map((c: { _id: string; name: string }) => ({
                    id: c._id,
                    name: c.name
                })));
            }
        } catch {
            setError('Failed to load classes');
        }
    };

    const fetchStudents = async (id: string) => {
        try {
            const response = await fetch(`/api/classes/${id}/students`);
            const data = await response.json();
            if (response.ok) {
                setStudents(data.students || []);
            }
        } catch {
            setError('Failed to load students');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/grades', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId,
                    classId,
                    title,
                    gradeType,
                    points: parseFloat(points),
                    maxPoints: parseFloat(maxPoints),
                    description
                }),
            });

            const data = await response.json();

            if (response.ok) {
                router.push('/dashboard/grades');
            } else {
                setError(data.error || 'Failed to create grade');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="dashboard">
            <section className="dashboard__hero">
                <div>
                    <p className="eyebrow">Grade Management</p>
                    <h1>New Grade Entry</h1>
                    <p className="dashboard__muted">Record a new grade for a student.</p>
                </div>
            </section>

            <section className="dashboard__grid" style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}>
                <div className="dashboard__card" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                    <form onSubmit={handleSubmit}>
                        {error && <p className="auth-card__error">{error}</p>}

                        <div className="form-grid">
                            <label className="field">
                                <span>Class *</span>
                                <select
                                    value={classId}
                                    onChange={(e) => setClassId(e.target.value)}
                                    required
                                >
                                    <option value="">Select Class</option>
                                    {classes.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </label>

                            <label className="field">
                                <span>Student *</span>
                                <select
                                    value={studentId}
                                    onChange={(e) => setStudentId(e.target.value)}
                                    required
                                    disabled={!classId}
                                >
                                    <option value="">Select Student</option>
                                    {students.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <div className="form-grid u-margin-top-sm">
                            <label className="field">
                                <span>Grade Title *</span>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Midterm Project"
                                    required
                                />
                            </label>

                            <label className="field">
                                <span>Grade Type *</span>
                                <select
                                    value={gradeType}
                                    onChange={(e) => setGradeType(e.target.value)}
                                    required
                                >
                                    <option value="assignment">Assignment</option>
                                    <option value="quiz">Quiz</option>
                                    <option value="exam">Exam</option>
                                    <option value="project">Project</option>
                                    <option value="participation">Participation</option>
                                    <option value="final">Final Grade</option>
                                </select>
                            </label>
                        </div>

                        <div className="form-grid u-margin-top-sm">
                            <label className="field">
                                <span>Points *</span>
                                <input
                                    type="number"
                                    value={points}
                                    onChange={(e) => setPoints(e.target.value)}
                                    placeholder="0"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </label>

                            <label className="field">
                                <span>Max Points *</span>
                                <input
                                    type="number"
                                    value={maxPoints}
                                    onChange={(e) => setMaxPoints(e.target.value)}
                                    placeholder="100"
                                    min="1"
                                    step="0.01"
                                    required
                                />
                            </label>
                        </div>

                        <label className="field u-margin-top-sm">
                            <span>Description / Comments (Optional)</span>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                placeholder="Add any feedback or notes..."
                            />
                        </label>

                        <div className="form-actions u-margin-top-md">
                            <button
                                type="button"
                                className="btn btn--ghost"
                                onClick={() => router.push('/dashboard/grades')}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn--primary"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Grade'}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </main>
    );
}
