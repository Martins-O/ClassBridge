'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Student {
    id: string;
    name: string;
    email: string;
}

interface ClassOption {
    _id: string;
    name: string;
}

export default function BulkGradePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Selection Data
    const [classes, setClasses] = useState<ClassOption[]>([]);
    const [students, setStudents] = useState<Student[]>([]);

    // Form settings
    const [classId, setClassId] = useState('');
    const [title, setTitle] = useState('');
    const [gradeType, setGradeType] = useState('assignment');
    const [maxPoints, setMaxPoints] = useState('100');

    // Individual scores: { [studentId]: points }
    const [scores, setScores] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (classId) {
            fetchStudents(classId);
        } else {
            setStudents([]);
        }
    }, [classId]);

    const fetchClasses = async () => {
        try {
            const response = await fetch('/api/classes?schoolId=all');
            const data = await response.json();
            if (response.ok) {
                setClasses(data.classes || []);
            }
        } catch {
            setError('Failed to load classes');
        }
    };

    const fetchStudents = async (id: string) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/classes/${id}/students`);
            const data = await response.json();
            if (response.ok) {
                setStudents(data.students || []);
                // Initialize scores
                const initialScores: Record<string, string> = {};
                data.students.forEach((s: Student) => initialScores[s.id] = '');
                setScores(initialScores);
            }
        } catch {
            setError('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const handleScoreChange = (sid: string, val: string) => {
        setScores(prev => ({ ...prev, [sid]: val }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const entries = Object.entries(scores)
            .filter(([_, points]) => points !== '')
            .map(([studentId, points]) => ({
                studentId,
                points: parseFloat(points)
            }));

        if (entries.length === 0) {
            setError('Please enter at least one score');
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch('/api/grades/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    classId,
                    title,
                    gradeType,
                    maxPoints: parseFloat(maxPoints),
                    entries
                }),
            });

            if (response.ok) {
                router.push('/dashboard/grades');
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to save grades');
            }
        } catch {
            setError('Network error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="dashboard">
            <section className="dashboard__hero">
                <div>
                    <p className="eyebrow">Grade Management</p>
                    <h1>Bulk Grade Entry</h1>
                    <p className="dashboard__muted">Enter scores for an entire class at once.</p>
                </div>
                <div className="dashboard__hero-actions">
                    <button className="btn btn--ghost" onClick={() => router.push('/dashboard/grades')}>
                        Back
                    </button>
                </div>
            </section>

            <section className="dashboard__grid">
                <div className="dashboard__card">
                    <form onSubmit={handleSubmit}>
                        {error && <p className="auth-card__error">{error}</p>}

                        <div className="form-grid">
                            <label className="field">
                                <span>Subject Class *</span>
                                <select value={classId} onChange={e => setClassId(e.target.value)} required>
                                    <option value="">Select Class</option>
                                    {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </label>

                            <label className="field">
                                <span>Assignment Title *</span>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="e.g. Unit 1 Quiz"
                                    required
                                />
                            </label>
                        </div>

                        <div className="form-grid u-margin-top-sm">
                            <label className="field">
                                <span>Type</span>
                                <select value={gradeType} onChange={e => setGradeType(e.target.value)}>
                                    <option value="assignment">Assignment</option>
                                    <option value="quiz">Quiz</option>
                                    <option value="exam">Exam</option>
                                    <option value="project">Project</option>
                                    <option value="participation">Participation</option>
                                    <option value="final">Final Grade</option>
                                </select>
                            </label>

                            <label className="field">
                                <span>Max Points *</span>
                                <input
                                    type="number"
                                    value={maxPoints}
                                    onChange={e => setMaxPoints(e.target.value)}
                                    required
                                />
                            </label>
                        </div>

                        {classId && (
                            <div className="u-margin-top-lg">
                                <h3>Student Scores</h3>
                                {loading ? <p>Loading students...</p> : (
                                    <div className="table u-margin-top-sm">
                                        <div className="table__head" style={{ gridTemplateColumns: '1fr 2fr 1fr' }}>
                                            <span>Name</span>
                                            <span>Email</span>
                                            <span>Points</span>
                                        </div>
                                        {students.map(s => (
                                            <div key={s.id} className="table__row" style={{ gridTemplateColumns: '1fr 2fr 1fr' }}>
                                                <span><strong>{s.name}</strong></span>
                                                <span className="dashboard__muted">{s.email}</span>
                                                <span>
                                                    <input
                                                        type="number"
                                                        value={scores[s.id]}
                                                        onChange={e => handleScoreChange(s.id, e.target.value)}
                                                        min="0"
                                                        max={maxPoints}
                                                        step="0.01"
                                                        placeholder="Score"
                                                        style={{ width: '100%', padding: '4px 8px' }}
                                                    />
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="form-actions u-margin-top-lg">
                            <button type="submit" className="btn btn--primary" disabled={submitting || !classId}>
                                {submitting ? 'Saving Grades...' : 'Save All Grades'}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </main>
    );
}
