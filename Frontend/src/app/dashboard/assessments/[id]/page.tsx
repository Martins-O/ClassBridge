'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Assessment {
    _id: string;
    title: string;
    description: string;
    assessmentType: string;
    targetRole: string;
    assessorRole: string;
    isActive: boolean;
    createdAt: string;
    questions: Array<{
        question: string;
        type: string;
        options?: string[];
    }>;
    timeLimit?: number;
    maxAttempts?: number;
    passingScore?: number;
}

export default function AssessmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [assessmentId, setAssessmentId] = useState('');
    const [assessment, setAssessment] = useState<Assessment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const unwrapParams = async () => {
            const unwrapped = await params;
            setAssessmentId(unwrapped.id);
        };
        unwrapParams();
    }, [params]);

    useEffect(() => {
        if (assessmentId) {
            fetchAssessment();
        }
    }, [assessmentId]);

    const fetchAssessment = async () => {
        try {
            const response = await fetch(`/api/assessments/${assessmentId}`);
            const data = await response.json();

            if (response.ok) {
                setAssessment(data.assessment);
            } else {
                setError(data.error || 'Failed to load assessment');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this assessment? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/assessments/${assessmentId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                router.push('/dashboard/assessments');
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to delete assessment');
            }
        } catch {
            setError('Network error. Please try again.');
        }
    };

    const toggleActive = async () => {
        try {
            const response = await fetch(`/api/assessments/${assessmentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    isActive: !assessment?.isActive,
                }),
            });

            if (response.ok) {
                fetchAssessment();
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to update assessment');
            }
        } catch {
            setError('Network error. Please try again.');
        }
    };

    if (loading) {
        return (
            <main className="dashboard">
                <div className="dashboard__card">Loading assessment…</div>
            </main>
        );
    }

    if (error || !assessment) {
        return (
            <main className="dashboard">
                <div className="dashboard__card">
                    <p className="auth-card__error">{error || 'Assessment not found'}</p>
                    <button className="btn btn--primary" onClick={() => router.push('/dashboard/assessments')}>
                        Back to assessments
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="dashboard">
            <section className="dashboard__hero">
                <div>
                    <p className="eyebrow">Assessment Details</p>
                    <h1>{assessment.title}</h1>
                    <p className="dashboard__muted">{assessment.assessmentType.replace('_', ' ')}</p>
                </div>
                <div className="dashboard__hero-actions">
                    <button className="btn btn--ghost" onClick={() => router.push('/dashboard/assessments')}>
                        Back
                    </button>
                    <button className="btn btn--primary" onClick={() => router.push(`/dashboard/assessments/${assessmentId}/take`)}>
                        Take Assessment
                    </button>
                    <button className="btn btn--ghost" onClick={toggleActive}>
                        {assessment.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button className="btn btn--error" onClick={handleDelete}>
                        Delete
                    </button>
                </div>
            </section>

            <section className="dashboard__grid">
                <div className="dashboard__card">
                    <p className="eyebrow">Assessment Information</p>
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="info-item__label">Title</span>
                            <strong>{assessment.title}</strong>
                        </div>
                        <div className="info-item">
                            <span className="info-item__label">Description</span>
                            <p>{assessment.description}</p>
                        </div>
                        <div className="info-item">
                            <span className="info-item__label">Type</span>
                            <strong>{assessment.assessmentType.replace('_', ' ')}</strong>
                        </div>
                        <div className="info-item">
                            <span className="info-item__label">Target Role</span>
                            <strong>{assessment.targetRole}</strong>
                        </div>
                        <div className="info-item">
                            <span className="info-item__label">Assessor Role</span>
                            <strong>{assessment.assessorRole}</strong>
                        </div>
                        <div className="info-item">
                            <span className="info-item__label">Status</span>
                            <span className={`badge badge--${assessment.isActive ? 'active' : 'inactive'}`}>
                                {assessment.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        {assessment.timeLimit && (
                            <div className="info-item">
                                <span className="info-item__label">Time Limit</span>
                                <strong>{assessment.timeLimit} minutes</strong>
                            </div>
                        )}
                        {assessment.maxAttempts && (
                            <div className="info-item">
                                <span className="info-item__label">Max Attempts</span>
                                <strong>{assessment.maxAttempts}</strong>
                            </div>
                        )}
                        {assessment.passingScore && (
                            <div className="info-item">
                                <span className="info-item__label">Passing Score</span>
                                <strong>{assessment.passingScore}%</strong>
                            </div>
                        )}
                    </div>
                </div>

                <div className="dashboard__card">
                    <p className="eyebrow">Questions</p>
                    <h2>{assessment.questions.length} Questions</h2>
                    <div className="questions-list">
                        {assessment.questions.map((q, index) => (
                            <div key={index} className="question-preview">
                                <div className="question-preview__header">
                                    <strong>Question {index + 1}</strong>
                                    <span className="badge badge--pending">{q.type}</span>
                                </div>
                                <p className="question-preview__text">{q.question}</p>
                                {q.options && q.options.length > 0 && (
                                    <ul className="question-preview__options">
                                        {q.options.map((opt, optIndex) => (
                                            <li key={optIndex}>{opt}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
