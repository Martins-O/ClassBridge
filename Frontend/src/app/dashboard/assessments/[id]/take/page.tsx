'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Question {
    _id?: string;
    id?: string;
    question: string;
    type: 'multiple-choice' | 'checkbox' | 'text' | 'rating' | 'scale';
    options?: string[];
    required?: boolean;
}

interface Assessment {
    _id: string;
    title: string;
    description: string;
    questions: Question[];
    timeLimit?: number;
    isActive: boolean;
}

interface AssessmentAttempt {
    _id: string;
    attemptNumber: number;
    startedAt: string;
}

export default function TakeAssessmentPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [assessmentId, setAssessmentId] = useState('');
    const [assessment, setAssessment] = useState<Assessment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [attempt, setAttempt] = useState<AssessmentAttempt | null>(null);
    const [answers, setAnswers] = useState<Record<string, string | string[] | number>>({});
    const [step, setStep] = useState<'intro' | 'active' | 'submitting' | 'completed'>('intro');

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
            setError('Network error. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const startAssessment = async () => {
        setLoading(true);
        try {
            // Get user info to send as respondentId (optional, but good practice if needed by backend)
            // The backend mostly relies on session user as assessor, but let's just trigger the create
            const response = await fetch(`/api/assessments/${assessmentId}/attempts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            });

            const data = await response.json();

            if (response.ok) {
                setAttempt(data.attempt);
                setStep('active');
            } else {
                setError(data.error || 'Failed to start assessment');
            }
        } catch {
            setError('Failed to start assessment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionId: string, value: string | string[] | number) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const handleCheckboxChange = (questionId: string, option: string, checked: boolean) => {
        setAnswers(prev => {
            const current = (prev[questionId] as string[]) || [];
            if (checked) {
                return { ...prev, [questionId]: [...current, option] };
            } else {
                return { ...prev, [questionId]: current.filter(o => o !== option) };
            }
        });
    };

    const submitAssessment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!attempt) return;

        setStep('submitting');

        // Format answers for backend
        const formattedAnswers = assessment?.questions.map(q => {
            // Prefer id, fallback to _id
            const qId = q.id || q._id;
            if (!qId) return null;

            return {
                questionId: qId,
                answer: answers[qId]
            };
        }).filter(Boolean);

        try {
            const response = await fetch(`/api/assessments/attempts/${attempt._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    answers: formattedAnswers,
                    isComplete: true
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setStep('completed');
                setTimeout(() => {
                    router.push('/dashboard/assessments');
                }, 3000);
            } else {
                setError(data.error || 'Failed to submit assessment');
                setStep('active');
            }
        } catch {
            setError('Network error. Please try again.');
            setStep('active');
        }
    };

    if (loading && !assessment) {
        return (
            <main className="dashboard">
                <div className="dashboard__card">Loading assessment...</div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="dashboard">
                <div className="dashboard__card">
                    <p className="auth-card__error">{error}</p>
                    <button className="btn btn--primary" onClick={() => router.push('/dashboard/assessments')}>
                        Return to Assessments
                    </button>
                </div>
            </main>
        );
    }

    if (!assessment) return null;

    if (step === 'completed') {
        return (
            <main className="dashboard">
                <div className="dashboard__card text-center">
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                    <h2>Assessment Completed!</h2>
                    <p>Your answers have been submitted successfully.</p>
                    <p className="dashboard__muted">Redirecting you back to the dashboard...</p>
                    <button className="btn btn--primary mt-4" onClick={() => router.push('/dashboard/assessments')}>
                        Return Now
                    </button>
                </div>
            </main>
        );
    }

    if (step === 'intro') {
        return (
            <main className="dashboard">
                <section className="dashboard__hero">
                    <div>
                        <p className="eyebrow">Assessment</p>
                        <h1>{assessment.title}</h1>
                        <p className="dashboard__muted">{assessment.description}</p>
                    </div>
                </section>

                <section className="dashboard__grid">
                    <div className="dashboard__card">
                        <h3>Ready to start?</h3>
                        <div className="info-grid u-margin-bottom-md">
                            <div className="info-item">
                                <span className="info-item__label">Questions</span>
                                <strong>{assessment.questions.length}</strong>
                            </div>
                            {assessment.timeLimit && (
                                <div className="info-item">
                                    <span className="info-item__label">Time Limit</span>
                                    <strong>{assessment.timeLimit} minutes</strong>
                                </div>
                            )}
                        </div>

                        <div className="alert alert--info u-margin-bottom-md">
                            Once you start, please do not close this window until you submit correctly.
                        </div>

                        <button className="btn btn--primary btn--lg" onClick={startAssessment}>
                            Start Assessment
                        </button>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main className="dashboard">
            <section className="dashboard__hero">
                <div>
                    <p className="eyebrow">Taking Assessment</p>
                    <h1>{assessment.title}</h1>
                </div>
                <div className="dashboard__hero-actions">
                    {assessment.timeLimit && <div className="badge badge--warning">Time Limit: {assessment.timeLimit}m</div>}
                </div>
            </section>

            <form onSubmit={submitAssessment} className="dashboard__grid">
                {assessment.questions.map((q, index) => {
                    const qId = q.id || q._id;
                    if (!qId) return null;

                    return (
                        <div key={qId} className="dashboard__card">
                            <p className="eyebrow">Question {index + 1}</p>
                            <h3 className="u-margin-bottom-sm">{q.question}</h3>

                            {/* Text Input */}
                            {q.type === 'text' && (
                                <textarea
                                    className="input"
                                    rows={4}
                                    value={(answers[qId] as string) || ''}
                                    onChange={(e) => handleAnswerChange(qId, e.target.value)}
                                    placeholder="Type your answer here..."
                                    required={q.required !== false} // default to true
                                />
                            )}

                            {/* Multiple Choice */}
                            {q.type === 'multiple-choice' && (
                                <div className="radio-group">
                                    {q.options?.map((opt, i) => (
                                        <label key={i} className="radio-option">
                                            <input
                                                type="radio"
                                                name={qId}
                                                value={opt}
                                                checked={answers[qId] === opt}
                                                onChange={(e) => handleAnswerChange(qId, e.target.value)}
                                                required={q.required !== false}
                                            />
                                            <span>{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {/* Checkbox */}
                            {q.type === 'checkbox' && (
                                <div className="checkbox-group">
                                    {q.options?.map((opt, i) => (
                                        <label key={i} className="checkbox-option">
                                            <input
                                                type="checkbox"
                                                value={opt}
                                                checked={((answers[qId] as string[]) || []).includes(opt)}
                                                onChange={(e) => handleCheckboxChange(qId, opt, e.target.checked)}
                                            />
                                            <span>{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {/* Rating */}
                            {q.type === 'rating' && (
                                <div className="rating-input">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            className={`btn btn--${answers[qId] === star ? 'primary' : 'ghost'}`}
                                            onClick={() => handleAnswerChange(qId, star)}
                                        >
                                            {star} ★
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Scale */}
                            {q.type === 'scale' && (
                                <div className="scale-input">
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={(answers[qId] as number) || 5}
                                        onChange={(e) => handleAnswerChange(qId, parseInt(e.target.value))}
                                        className="w-full"
                                    />
                                    <div className="scale-labels">
                                        <span>1 (Lowest)</span>
                                        <span className="font-bold text-lg">{answers[qId] || 5}</span>
                                        <span>10 (Highest)</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                <div className="dashboard__card">
                    <div className="form-actions">
                        <button
                            type="submit"
                            className="btn btn--primary btn--lg w-full"
                            disabled={step === 'submitting'}
                        >
                            {step === 'submitting' ? 'Submitting...' : 'Submit Assessment'}
                        </button>
                    </div>
                </div>
            </form>
        </main>
    );
}

// Add some simple styles for inputs if they don't exist in global css
