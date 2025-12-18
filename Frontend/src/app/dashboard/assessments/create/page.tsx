'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Question {
    question: string;
    type: 'multiple-choice' | 'checkbox' | 'text' | 'rating' | 'scale';
    options?: string[];
}

export default function CreateAssessmentPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assessmentType, setAssessmentType] = useState('peer');
    const [targetRole, setTargetRole] = useState('student');
    const [assessorRole, setAssessorRole] = useState('mentor');
    const [questions, setQuestions] = useState<Question[]>([
        { question: '', type: 'text', options: [] }
    ]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const addQuestion = () => {
        setQuestions([...questions, { question: '', type: 'text', options: [] }]);
    };

    const removeQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const updateQuestion = (index: number, field: keyof Question, value: unknown) => {
        const updated = [...questions];
        if (field === 'type') {
            updated[index].type = value as Question['type'];
            // Initialize options for multiple-choice/checkbox
            if (value === 'multiple-choice' || value === 'checkbox') {
                updated[index].options = ['', ''];
            } else {
                updated[index].options = [];
            }
        } else if (field === 'question') {
            updated[index].question = value as string;
        }
        setQuestions(updated);
    };

    const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
        const updated = [...questions];
        if (updated[questionIndex].options) {
            updated[questionIndex].options![optionIndex] = value;
        }
        setQuestions(updated);
    };

    const addOption = (questionIndex: number) => {
        const updated = [...questions];
        if (updated[questionIndex].options) {
            updated[questionIndex].options!.push('');
        }
        setQuestions(updated);
    };

    const removeOption = (questionIndex: number, optionIndex: number) => {
        const updated = [...questions];
        if (updated[questionIndex].options) {
            updated[questionIndex].options = updated[questionIndex].options!.filter((_, i) => i !== optionIndex);
        }
        setQuestions(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!title || !description || questions.length === 0) {
            setError('Please fill in all required fields and add at least one question');
            return;
        }

        // Validate questions
        for (const q of questions) {
            if (!q.question.trim()) {
                setError('All questions must have text');
                return;
            }
            if ((q.type === 'multiple-choice' || q.type === 'checkbox') && (!q.options || q.options.length < 2)) {
                setError('Multiple choice and checkbox questions must have at least 2 options');
                return;
            }
        }

        setSubmitting(true);

        try {
            // Get user's school ID
            const userResponse = await fetch('/api/auth/me');
            const userData = await userResponse.json();

            if (!userResponse.ok || !userData.user?.schoolId) {
                setError('Unable to determine your school');
                setSubmitting(false);
                return;
            }

            const response = await fetch('/api/assessments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    schoolId: userData.user.schoolId,
                    assessmentType,
                    targetRole,
                    assessorRole,
                    questions: questions.map(q => ({
                        question: q.question,
                        type: q.type,
                        options: q.options?.filter(opt => opt.trim()) || undefined
                    })),
                }),
            });

            const data = await response.json();

            if (response.ok) {
                router.push('/dashboard/assessments');
            } else {
                setError(data.error || 'Failed to create assessment');
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
                    <p className="eyebrow">Assessment Management</p>
                    <h1>Create Assessment</h1>
                    <p className="dashboard__muted">Build a new competency assessment</p>
                </div>
            </section>

            <section className="dashboard__grid">
                <div className="dashboard__card">
                    <form onSubmit={handleSubmit}>
                        {error && <p className="auth-card__error">{error}</p>}

                        <p className="form-section-title">Basic Information</p>

                        <label className="field">
                            <span>Title *</span>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Student Leadership Assessment"
                                required
                                disabled={submitting}
                            />
                        </label>

                        <label className="field">
                            <span>Description *</span>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the purpose of this assessment"
                                rows={3}
                                required
                                disabled={submitting}
                            />
                        </label>

                        <label className="field">
                            <span>Assessment Type *</span>
                            <select
                                value={assessmentType}
                                onChange={(e) => setAssessmentType(e.target.value)}
                                required
                                disabled={submitting}
                            >
                                <option value="peer">Peer Assessment</option>
                                <option value="mentor_to_student">Mentor to Student</option>
                                <option value="student_to_mentor">Student to Mentor</option>
                                <option value="self">Self Assessment</option>
                            </select>
                        </label>

                        <label className="field">
                            <span>Target Role *</span>
                            <select
                                value={targetRole}
                                onChange={(e) => setTargetRole(e.target.value)}
                                required
                                disabled={submitting}
                            >
                                <option value="student">Student</option>
                                <option value="mentor">Mentor</option>
                            </select>
                        </label>

                        <label className="field">
                            <span>Assessor Role *</span>
                            <select
                                value={assessorRole}
                                onChange={(e) => setAssessorRole(e.target.value)}
                                required
                                disabled={submitting}
                            >
                                <option value="mentor">Mentor</option>
                                <option value="student">Student</option>
                                <option value="self">Self</option>
                            </select>
                        </label>

                        <p className="form-section-title">Questions</p>

                        {questions.map((q, qIndex) => (
                            <div key={qIndex} className="question-builder">
                                <div className="question-builder__header">
                                    <strong>Question {qIndex + 1}</strong>
                                    {questions.length > 1 && (
                                        <button
                                            type="button"
                                            className="btn btn--error btn--sm"
                                            onClick={() => removeQuestion(qIndex)}
                                            disabled={submitting}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>

                                <label className="field">
                                    <span>Question Text *</span>
                                    <input
                                        type="text"
                                        value={q.question}
                                        onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                                        placeholder="Enter your question"
                                        required
                                        disabled={submitting}
                                    />
                                </label>

                                <label className="field">
                                    <span>Question Type *</span>
                                    <select
                                        value={q.type}
                                        onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                                        required
                                        disabled={submitting}
                                    >
                                        <option value="text">Text (Open-ended)</option>
                                        <option value="multiple-choice">Multiple Choice</option>
                                        <option value="checkbox">Checkbox (Multiple Select)</option>
                                        <option value="rating">Rating (1-5 stars)</option>
                                        <option value="scale">Scale (1-10)</option>
                                    </select>
                                </label>

                                {(q.type === 'multiple-choice' || q.type === 'checkbox') && (
                                    <div className="options-list">
                                        <span className="field-label">Options *</span>
                                        {q.options?.map((opt, optIndex) => (
                                            <div key={optIndex} className="option-item">
                                                <input
                                                    type="text"
                                                    value={opt}
                                                    onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                                                    placeholder={`Option ${optIndex + 1}`}
                                                    required
                                                    disabled={submitting}
                                                />
                                                {q.options!.length > 2 && (
                                                    <button
                                                        type="button"
                                                        className="btn btn--ghost btn--sm"
                                                        onClick={() => removeOption(qIndex, optIndex)}
                                                        disabled={submitting}
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            className="btn btn--ghost btn--sm"
                                            onClick={() => addOption(qIndex)}
                                            disabled={submitting}
                                        >
                                            + Add Option
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}

                        <button
                            type="button"
                            className="btn btn--ghost"
                            onClick={addQuestion}
                            disabled={submitting}
                        >
                            + Add Question
                        </button>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn btn--ghost"
                                onClick={() => router.push('/dashboard/assessments')}
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn btn--primary" disabled={submitting}>
                                {submitting ? 'Creating...' : 'Create Assessment'}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </main>
    );
}
