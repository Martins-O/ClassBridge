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
                    /* Force light theme for print */
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
                    <p className="eyebrow">Academic Transcript</p>
                    <h1>{t.studentInfo.name}</h1>
                </div>
                <div className="dashboard__hero-actions">
                    {user?.role !== 'student' && (
                        <button className="btn btn--ghost" onClick={() => setSelectedTranscript(null)}>
                            Back to List
                        </button>
                    )}
                    <button className="btn btn--primary" onClick={handlePrint}>
                        Print / Download PDF
                    </button>
                </div>
            </section>

            <div className="transcript-container dashboard__grid" style={{ gridTemplateColumns: '1fr' }}>
                {/* Header Info */}
                <div className="dashboard__card">
                    <div className="flex justify-between items-start border-b border-gray-700 pb-6 mb-6">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">{schoolName}</h2>
                            <p className="text-sm text-gray-400">Official Academic Transcript</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm"><strong>Generated:</strong> {new Date(t.generatedAt).toLocaleDateString()}</p>
                            <p className="text-sm"><strong>Student ID:</strong> {t.studentInfo.studentNumber}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-6">
                        <div>
                            <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-3">Student Information</h3>
                            <div className="space-y-1">
                                <p><strong>Name:</strong> {t.studentInfo.name}</p>
                                <p><strong>Email:</strong> {t.studentInfo.email}</p>
                                <p><strong>Enrolled:</strong> {new Date(t.studentInfo.enrollmentDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-3">Academic Summary</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 p-3 rounded-lg text-center border border-white/10">
                                    <span className="block text-xs uppercase text-gray-400">GPA</span>
                                    <strong className="text-2xl text-cyan-400">{t.academicSummary.gpa.toFixed(2)}</strong>
                                </div>
                                <div className="bg-white/5 p-3 rounded-lg text-center border border-white/10">
                                    <span className="block text-xs uppercase text-gray-400">Credits</span>
                                    <strong className="text-2xl text-cyan-400">{t.academicSummary.totalCredits}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Course Records */}
                <div className="dashboard__card">
                    <h3 className="text-lg font-bold mb-4">Course Record</h3>
                    {t.courseRecords.length === 0 ? (
                        <p>No courses completed yet.</p>
                    ) : (
                        <div className="table">
                            <div className="table__head" style={{ gridTemplateColumns: 'minmax(200px, 2fr) 1fr 1fr 1fr 1fr' }}>
                                <span>Course</span>
                                <span>Year</span>
                                <span>Credits</span>
                                <span>Grade</span>
                                <span>Completed</span>
                            </div>
                            {t.courseRecords.map((course) => (
                                <div key={course._id} className="table__row" style={{ gridTemplateColumns: 'minmax(200px, 2fr) 1fr 1fr 1fr 1fr' }}>
                                    <span>
                                        <strong>{course.className}</strong>
                                        <small>{course.cohort}</small>
                                    </span>
                                    <span>{course.academicYear}</span>
                                    <span>{course.credits}</span>
                                    <span>
                                        <span className={`badge ${course.grade.startsWith('A') ? 'badge--active' : ''}`}>
                                            {course.grade}
                                        </span>
                                    </span>
                                    <span>{new Date(course.completedDate).toLocaleDateString()}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="dashboard__card text-center text-sm text-gray-500">
                    <p>This document is an official record of the student's academic performance at {schoolName}.</p>
                </div>
            </div>
        </main>
    );
}
