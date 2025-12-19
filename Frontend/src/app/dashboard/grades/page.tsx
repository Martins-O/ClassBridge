'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Grade {
    _id: string;
    title: string;
    studentId: { name: string; email: string } | string;
    classId: { name: string; academicYear: string } | string;
    gradeType: string;
    points: number;
    maxPoints: number;
    percentage: number;
    letterGrade: string;
    gradedDate: string;
}

interface ClassOption {
    _id: string;
    name: string;
}

interface User {
    _id: string;
    role: string;
    name: string;
}

export default function GradesPage() {
    const router = useRouter();
    const [grades, setGrades] = useState<Grade[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [user, setUser] = useState<User | null>(null);
    const [classes, setClasses] = useState<ClassOption[]>([]);

    // Filters
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedType, setSelectedType] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (user) {
            fetchGrades();
        }
    }, [user, selectedClass, selectedType]);

    const fetchInitialData = async () => {
        try {
            // Fetch User
            const userRes = await fetch('/api/auth/me');
            const userData = await userRes.json();

            if (userRes.ok) {
                setUser(userData.user);

                // If mentor/admin, fetch classes for filter
                if (['mentor', 'school_admin', 'super_admin'].includes(userData.user.role)) {
                    const classesRes = await fetch('/api/classes/get'); // Use the lightweight 'get' endpoint if available, or just /api/classes
                    // Actually /api/classes/get might list all classes. Let's try /api/classes first or reuse logic.
                    // The backend route /api/classes supports filtering.
                    const classesResponse = await fetch('/api/classes?schoolId=all'); // schoolId=all works for school_admin
                    if (classesResponse.ok) {
                        const classesData = await classesResponse.json();
                        setClasses(classesData.classes || []);
                    }
                }
            } else {
                setError('Authentication required');
                router.push('/login');
            }
        } catch {
            setError('Failed to load user data');
        }
    };

    const fetchGrades = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedClass) params.append('classId', selectedClass);
            if (selectedType) params.append('gradeType', selectedType);

            const response = await fetch(`/api/grades?${params.toString()}`);
            const data = await response.json();

            if (response.ok) {
                setGrades(data.grades || []);
            } else {
                setError(data.error || 'Failed to load grades');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const canCreateGrades = user && ['mentor', 'school_admin'].includes(user.role);

    return (
        <main className="dashboard">
            <section className="dashboard__hero">
                <div>
                    <p className="eyebrow">Academic Records</p>
                    <h1>Grades & Transcripts</h1>
                    <p className="dashboard__muted">
                        {user?.role === 'student'
                            ? 'View your academic performance and assessment results.'
                            : 'Manage student grades and academic records.'}
                    </p>
                </div>
                <div className="dashboard__hero-actions">
                    <button className="btn btn--ghost" onClick={() => router.push('/dashboard')}>
                        Back to dashboard
                    </button>
                    {canCreateGrades && (
                        <>
                            <button className="btn btn--ghost" onClick={() => router.push('/dashboard/grades/bulk')}>
                                Bulk Entry
                            </button>
                            <button className="btn btn--primary" onClick={() => router.push('/dashboard/grades/create')}>
                                + New Grade
                            </button>
                        </>
                    )}
                </div>
            </section>

            {loading && !grades.length ? (
                <div className="dashboard__card" style={{ textAlign: 'center', padding: '4rem' }}>
                    <p className="eyebrow">Syncing records...</p>
                    <h2>Loading grades...</h2>
                </div>
            ) : error ? (
                <div className="dashboard__card">
                    <p className="alert alert--error">{error}</p>
                    <button className="btn btn--primary u-margin-top-md" onClick={fetchGrades}>
                        Retry loading
                    </button>
                </div>
            ) : (
                <section className="dashboard__grid">
                    <div className="dashboard__card dashboard__card--full">
                        <div className="dashboard__card-header" style={{ marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                                {classes.length > 0 && (
                                    <div className="field" style={{ marginBottom: 0 }}>
                                        <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Filter by Class</label>
                                        <select
                                            value={selectedClass}
                                            onChange={(e) => setSelectedClass(e.target.value)}
                                            style={{ minWidth: '200px' }}
                                        >
                                            <option value="">All Classes</option>
                                            {classes.map(cls => (
                                                <option key={cls._id} value={cls._id}>{cls.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="field" style={{ marginBottom: 0 }}>
                                    <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Grade Type</label>
                                    <select
                                        value={selectedType}
                                        onChange={(e) => setSelectedType(e.target.value)}
                                        style={{ minWidth: '150px' }}
                                    >
                                        <option value="">All Types</option>
                                        <option value="assignment">Assignment</option>
                                        <option value="quiz">Quiz</option>
                                        <option value="exam">Exam</option>
                                        <option value="project">Project</option>
                                        <option value="participation">Participation</option>
                                        <option value="final">Final Grade</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div style={{ padding: '2rem', textAlign: 'center' }}>
                                <p className="dashboard__muted">Updating list...</p>
                            </div>
                        ) : grades.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                                <p className="eyebrow">No records found</p>
                                <h2>No grade records match the criteria</h2>
                                <p className="dashboard__muted" style={{ marginTop: '0.5rem' }}>
                                    Try adjusting your filters or adding a new grade entry.
                                </p>
                            </div>
                        ) : (
                            <div className="table">
                                <div className="table__head" style={{ gridTemplateColumns: user?.role === 'student' ? '2fr 1.5fr 1fr 1fr 1fr' : '2fr 2fr 1.5fr 1fr 1fr 1fr' }}>
                                    <span>Title</span>
                                    {user?.role !== 'student' && <span>Student</span>}
                                    <span>Class</span>
                                    <span>Type</span>
                                    <span>Score</span>
                                    <span>Date</span>
                                </div>
                                {grades.map((grade) => {
                                    const studentName = typeof grade.studentId === 'object' ? grade.studentId.name : 'Unknown Student';
                                    const className = typeof grade.classId === 'object' ? grade.classId.name : 'Unknown Class';

                                    return (
                                        <div key={grade._id} className="table__row" style={{ gridTemplateColumns: user?.role === 'student' ? '2fr 1.5fr 1fr 1fr 1fr' : '2fr 2fr 1.5fr 1fr 1fr 1fr' }}>
                                            <span>
                                                <strong>{grade.title}</strong>
                                            </span>
                                            {user?.role !== 'student' && <span>{studentName}</span>}
                                            <span>{className}</span>
                                            <span>
                                                <span className="badge badge--pending" style={{ textTransform: 'capitalize' }}>{grade.gradeType}</span>
                                            </span>
                                            <span style={{ fontWeight: 700 }}>
                                                {grade.points}/{grade.maxPoints} <span className="dashboard__muted">({grade.letterGrade || `${grade.percentage}%`})</span>
                                            </span>
                                            <span>{new Date(grade.gradedDate).toLocaleDateString()}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>
            )}
        </main>
    );
}

function getGradeColorClass(grade: string) {
    if (!grade) return '';
    if (grade.startsWith('A') || grade.startsWith('B')) return 'text-green-400 font-bold';
    if (grade.startsWith('C')) return 'text-yellow-400 font-bold';
    return 'text-red-400 font-bold';
}
