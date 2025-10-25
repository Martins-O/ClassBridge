'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { AssessmentLayout } from '@/components/ui/AssessmentLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface Question {
  id: string;
  type: 'multiple-choice' | 'checkbox' | 'text' | 'rating' | 'scale';
  question: string;
  required: boolean;
  weight?: number;
  options?: string[];
  min?: number;
  max?: number;
}

interface Assessment {
  _id: string;
  title: string;
  description: string;
  assessmentType: 'peer' | 'mentor_to_student' | 'student_to_mentor' | 'self';
  targetRole: 'mentor' | 'student';
  assessorRole: 'mentor' | 'student' | 'self';
  isActive: boolean;
  timeLimit?: number;
  questions: Question[];
  maxAttempts?: number;
  passingScore?: number;
}

interface Answer {
  questionId: string;
  answer: string | number | string[] | null;
}

interface AssessmentAttempt {
  _id: string;
  attemptNumber: number;
  startedAt: string;
  timeSpent?: number;
}

function AssessmentTakeContent({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [attempt, setAttempt] = useState<AssessmentAttempt | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (assessment?.timeLimit && attempt) {
      const startTime = new Date(attempt.startedAt).getTime();
      const timeLimit = assessment.timeLimit * 60 * 1000; // Convert to milliseconds

      const timer = setInterval(() => {
        const now = new Date().getTime();
        const elapsed = now - startTime;
        const remaining = Math.max(0, timeLimit - elapsed);

        setTimeRemaining(remaining);

        if (remaining === 0) {
          submitRef.current?.(); // Auto-submit when time runs out
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [assessment, attempt]);

  const fetchAssessment = useCallback(async () => {
    try {
      const response = await fetch(`/api/assessments/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setAssessment(data.assessment);

        // Start a new attempt
        await startNewAttempt();
      } else {
        setError('Assessment not found or not accessible');
      }
    } catch {
      setError('Failed to load assessment');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchAssessment();
  }, [params.id, fetchAssessment]);

  const startNewAttempt = useCallback(async () => {
    try {
      const response = await fetch(`/api/assessments/${params.id}/attempts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        const data = await response.json();
        setAttempt(data.attempt);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to start assessment');
      }
    } catch {
      setError('Failed to start assessment');
    }
  }, [params.id]);

  const updateAnswer = (questionId: string, answer: string | number | string[]) => {
    setAnswers(prev => {
      const existing = prev.find(a => a.questionId === questionId);
      if (existing) {
        return prev.map(a => a.questionId === questionId ? { ...a, answer } : a);
      } else {
        return [...prev, { questionId, answer }];
      }
    });
  };

  const handleSubmit = useCallback(async () => {
    if (!attempt || submitting) return;

    setSubmitting(true);

    try {
      const response = await fetch(`/api/assessments/attempts/${attempt._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers,
          isComplete: true,
        }),
      });

      if (response.ok) {
        router.push(`/assessment/${params.id}/result?attemptId=${attempt._id}`);
      } else {
        setError('Failed to submit assessment');
      }
    } catch {
      setError('Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  }, [attempt, submitting, answers, router, params.id]);

  useEffect(() => {
    submitRef.current = handleSubmit;
  }, [handleSubmit]);

  const saveProgress = async () => {
    if (!attempt) return;

    try {
      await fetch(`/api/assessments/attempts/${attempt._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers,
          isComplete: false,
        }),
      });
    } catch {
    }
  };

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderQuestion = (question: Question) => {
    const currentAnswer = answers.find(a => a.questionId === question.id)?.answer;

    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={currentAnswer === option}
                  onChange={(e) => updateAnswer(question.id, e.target.value)}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  value={option}
                  checked={Array.isArray(currentAnswer) && currentAnswer.includes(option)}
                  onChange={(e) => {
                    const currentValues = Array.isArray(currentAnswer) ? currentAnswer : [];
                    if (e.target.checked) {
                      updateAnswer(question.id, [...currentValues, option]);
                    } else {
                      updateAnswer(question.id, currentValues.filter(v => v !== option));
                    }
                  }}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'text':
        return (
          <textarea
            value={currentAnswer as string || ''}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            placeholder="Type your answer here..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
        );

      case 'rating':
      case 'scale':
        const min = question.min || 1;
        const max = question.max || 5;
        return (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{min}</span>
              <span>{max}</span>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((value) => (
                <button
                  key={value}
                  onClick={() => updateAnswer(question.id, value)}
                  className={`min-w-11 min-h-11 w-12 h-12 rounded-full border-2 font-medium touch-manipulation ${
                    currentAnswer === value
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-500 active:bg-gray-50'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return <div>Unknown question type</div>;
    }
  };

  if (loading) {
    return (
      <AssessmentLayout title="Loading Assessment" description="Please wait...">
        <Card className="p-8 text-center">
          <div className="w-16 h-16 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-6 text-ink-600 font-medium">Loading assessment...</p>
        </Card>
      </AssessmentLayout>
    );
  }

  if (error) {
    return (
      <AssessmentLayout title="Assessment Error" description="Unable to load assessment">
        <Card className="p-8 text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-ink-900 mb-2">Assessment Error</h2>
          <p className="text-ink-600 mb-6">{error}</p>
          <Button onClick={() => router.push('/dashboard')} variant="primary">
            Back to Dashboard
          </Button>
        </Card>
      </AssessmentLayout>
    );
  }

  if (!assessment || !attempt) return null;

  const currentQuestion = assessment.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / assessment.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{assessment.title}</h1>
              <p className="text-gray-600 mt-1">{assessment.description}</p>
            </div>
            {timeRemaining !== null && (
              <div className="text-right">
                <div className="text-sm text-gray-500">Time Remaining</div>
                <div className={`text-2xl font-bold ${timeRemaining < 300000 ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatTime(timeRemaining)}
                </div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Question {currentQuestionIndex + 1} of {assessment.questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20 mb-6">
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium mr-3">
                Question {currentQuestionIndex + 1}
              </span>
              {currentQuestion.required && (
                <span className="text-red-500 text-sm">Required</span>
              )}
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {currentQuestion.question}
            </h2>
          </div>

          {renderQuestion(currentQuestion)}
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <button
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
            className="min-h-11 px-6 py-3 bg-white/80 text-gray-700 rounded-xl font-medium border border-gray-200 hover:bg-white hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            Previous
          </button>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={saveProgress}
              className="min-h-11 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-300 touch-manipulation"
            >
              Save Progress
            </button>

            {currentQuestionIndex < assessment.questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                className="min-h-11 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 touch-manipulation"
              >
                Next
              </button>
            ) : (
              <button
                onClick={() => handleSubmit()}
                disabled={submitting}
                className="min-h-11 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 touch-manipulation"
              >
                {submitting ? 'Submitting...' : 'Submit Assessment'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AssessmentTake({ params }: { params: { id: string } }) {
  return (
    <AuthGuard>
      <AssessmentTakeContent params={params} />
    </AuthGuard>
  );
}
