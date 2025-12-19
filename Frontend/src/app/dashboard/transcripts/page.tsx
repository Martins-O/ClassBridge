'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface CourseRecord {
    _id: string;
    className: string;
    academicYear: string;
    duration: string;
    cohort: string;
    grade: string;
    credits: number;
    mentorName: string;
    completedDate: string;
}

interface AcademicSummary {
    totalCredits: number;
    gpa: number;
    overallGrade: string;
}

interface Transcript {
    _id: string;
    studentInfo: {
        name: string;
        email: string;
        studentNumber: string;
        enrollmentDate: string;
    };
    schoolId: {
        _id: string;
        name: string;
    } | string;
    courseRecords: CourseRecord[];
    academicSummary: AcademicSummary;
    generatedAt: string;
}

export default function TranscriptPage() {
    const router = useRouter();
    const [user, setUser] = useState<{ role: string } | null>(null);
    const [transcripts, setTranscripts] = useState<Transcript[]>([]);
    const [selectedTranscript, setSelectedTranscript] = useState<Transcript | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const userRes = await fetch('/api/auth/me');
            const userData = await userRes.json();

            if (userRes.ok) {
                setUser(userData.user);
                fetchTranscripts(userData.user.role);
            } else {
                router.push('/login');
            }
        } catch {
            setError('Failed to load user data');
            setLoading(false);
        }
    };

    const fetchTranscripts = async (role: string) => {
        try {
            const response = await fetch('/api/transcripts');
            const data = await response.json();

            if (response.ok) {
                const list = data.transcripts || [];
                setTranscripts(list);

                // If student, auto-select their transcript
                if (role === 'student' && list.length > 0) {
                    setSelectedTranscript(list[0]);
                }
            } else {
                setError(data.error || 'Failed to fetch transcripts');
            }
        } catch {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <main className="dashboard">
                <div className="dashboard__card">Loading academic records...</div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="dashboard">
                <div className="dashboard__card">
                    <p className="auth-card__error">{error}</p>
                </div>
            </main>
        );
    }

    // LIST VIEW (For Admins/Mentors when no transcript selected)
    if (!selectedTranscript && user?.role !== 'student') {
        return (
            <main className="dashboard">
                <section className="dashboard__hero">
                    <div>
                        <p className="eyebrow">Academic Records</p>
                        <h1>Student Transcripts</h1>
                        <p className="dashboard__muted">Select a student to view their full academic history.</p>
                    </div>
                </section>

                <section className="dashboard__card">
                    {transcripts.length === 0 ? (
                        <p className="text-gray-400">No transcripts found.</p>
                    ) : (
                        <div className="table">
                            <div className="table__head" style={{ gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr' }}>
                                <span>Student Name</span>
                                <span>Email</span>
                                <span>GPA</span>
                                <span>Credits</span>
                                <span>Action</span>
                            </div>
                            {transcripts.map((t) => (
                                <div key={t._id} className="table__row" style={{ gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr' }}>
                                    <span><strong>{t.studentInfo.name}</strong></span>
                                    <span>{t.studentInfo.email}</span>
                                    <span><strong>{t.academicSummary.gpa.toFixed(2)}</strong></span>
                                    <span>{t.academicSummary.totalCredits}</span>
                                    <button
                                        className="btn btn--ghost btn--sm"
                                        onClick={() => setSelectedTranscript(t)}
                                    >
                                        View
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        );
    }

    // DETAIL VIEW (Selected Transcript)
    const t = selectedTranscript!;
    const schoolName = typeof t.schoolId === 'object' ? t.schoolId.name : 'Unknown School';

    return (
        <main className="dashboard">
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .transcript-container, .transcript-container * {
                        visibility: visible;
                    }
                    .transcript-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        background: white !important;
                        color: black !important;
                        margin: 0;
                        padding: 2rem; 
                    }
                    .btn, .dashboard__hero-actions, header, nav, footer {
                        display: none !important;
                    }
                    .dashboard__card {
                       background: white !important;
                       border: none !important;
                       color: black !important;
                       box-shadow: none !important;
                    }
                    .table__head span { color: #666 !important; }
                    .table__row { border-bottom: 1px solid #ccc !important; }
                    h1, h2, h3, strong { color: black !important; }
                    p, span { color: #333 !important; }
                }
            `}</style>

            <section className="dashboard__hero">
                <div>
                    <p className="eyebrow">Academic Records</p>
                    <h1>{t.studentInfo.name}</h1>
                    <p className="dashboard__muted">Official Academic Transcript</p>
                </div>
                <div className="dashboard__hero-actions">
                    <button className="btn btn--ghost" onClick={() => (user?.role === 'student' ? router.push('/dashboard') : setSelectedTranscript(null))}>
                        {user?.role === 'student' ? 'Back to dashboard' : 'Back to List'}
                    </button>
                    <button className="btn btn--primary" onClick={handlePrint}>
                        Print / Download PDF
                    </button>
                </div>
            </section>

            <div className="transcript-container dashboard__grid">
                <div className="dashboard__card dashboard__card--full">
                    <div className="flex justify-between items-start border-b border-gray-100 pb-6 mb-6">
                        <div>
                            <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--slate-900)' }}>{schoolName}</h2>
                            <p className="text-sm dashboard__muted">Official Institution Record</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm"><strong>Generated:</strong> {new Date(t.generatedAt).toLocaleDateString()}</p>
                            <p className="text-sm"><strong>Student ID:</strong> {t.studentInfo.studentNumber}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                        <div>
                            <h3 className="eyebrow u-margin-bottom-sm">Student Information</h3>
                            <div className="space-y-1">
                                <p><strong>Name:</strong> {t.studentInfo.name}</p>
                                <p><strong>Email:</strong> {t.studentInfo.email}</p>
                                <p><strong>Enrolled:</strong> {new Date(t.studentInfo.enrollmentDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="eyebrow u-margin-bottom-sm">Academic Summary</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
                                    <span className="block text-xs uppercase text-slate-500 font-bold mb-1">Current GPA</span>
                                    <strong className="text-2xl text-blue-600">{t.academicSummary.gpa.toFixed(2)}</strong>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
                                    <span className="block text-xs uppercase text-slate-500 font-bold mb-1">Total Credits</span>
                                    <strong className="text-2xl text-blue-600">{t.academicSummary.totalCredits}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dashboard__card dashboard__card--full">
                    <h3 className="text-lg font-bold u-margin-bottom-md">Complete Course History</h3>
                    {t.courseRecords.length === 0 ? (
                        <p className="dashboard__muted">No courses completed yet.</p>
                    ) : (
                        <div className="table">
                            <div className="table__head" style={{ gridTemplateColumns: 'minmax(200px, 2fr) 1fr 1fr 1fr 1.5fr' }}>
                                <span>Course Description</span>
                                <span>Year</span>
                                <span>Credits</span>
                                <span>Grade</span>
                                <span>Completion Date</span>
                            </div>
                            {t.courseRecords.map((course) => (
                                <div key={course._id} className="table__row" style={{ gridTemplateColumns: 'minmax(200px, 2fr) 1fr 1fr 1fr 1.5fr' }}>
                                    <span>
                                        <strong style={{ display: 'block' }}>{course.className}</strong>
                                        <span className="text-xs dashboard__muted">{course.cohort}</span>
                                    </span>
                                    <span>{course.academicYear}</span>
                                    <span>{course.credits}</span>
                                    <span>
                                        <span className={`badge ${course.grade.startsWith('A') || course.grade.startsWith('B') ? 'badge--active' : 'badge--pending'}`}>
                                            {course.grade}
                                        </span>
                                    </span>
                                    <span>{new Date(course.completedDate).toLocaleDateString()}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="dashboard__card dashboard__card--full" style={{ textAlign: 'center', background: 'transparent', border: 'none', boxShadow: 'none' }}>
                    <p className="dashboard__muted text-sm">
                        This document is a verified academic record of the student&apos;s performance at {schoolName}.
                    </p>
                </div>
            </div>
        </main>
    );
}
