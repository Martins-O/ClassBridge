'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';

interface AssessmentAttempt {
  _id: string;
  attemptNumber: number;
  startedAt: string;
  submittedAt: string;
  timeSpent: number;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  isComplete: boolean;
  answers: Array<{
    questionId: string;
    answer: string | number | string[];
  }>;
  assessmentId: {
    title: string;
    description: string;
    passingScore?: number;
    questions: Array<{
      id: string;
      question: string;
      type: string;
      weight?: number;
    }>;
  };
}

function AssessmentResultContent({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get('attemptId');

  const [attempt, setAttempt] = useState<AssessmentAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (attemptId) {
      fetchAttemptResult();
    } else {
      setError('No attempt ID provided');
      setLoading(false);
    }
  }, [attemptId]);

  const fetchAttemptResult = async () => {
    try {
      const response = await fetch(`/api/assessments/attempts/${attemptId}`);
      if (response.ok) {
        const data = await response.json();
        setAttempt(data.attempt);
      } else {
        setError('Assessment result not found');
      }
    } catch (error) {
      console.error('Error fetching assessment result:', error);
      setError('Failed to load assessment result');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getScoreColor = (percentage: number, passed: boolean) => {
    if (passed) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (percentage: number, passed: boolean) => {
    if (passed) return 'bg-green-100 text-green-800';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-6 text-gray-600 font-medium">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Results Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/dashboard"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-100 to-purple-100">
            {attempt.passed ? (
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Assessment {attempt.passed ? 'Completed' : 'Submitted'}
          </h1>
          <p className="text-xl text-gray-600">{attempt.assessmentId.title}</p>
        </div>

        {/* Results Overview */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20 mb-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Score */}
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
                <span className={getScoreColor(attempt.percentage, attempt.passed)}>
                  {Math.round(attempt.percentage)}%
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-2">Final Score</div>
              <div className="text-xs text-gray-500">
                {attempt.score} / {attempt.maxScore} points
              </div>
            </div>

            {/* Status */}
            <div className="text-center">
              <div className="mb-2">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getScoreBadgeColor(attempt.percentage, attempt.passed)}`}>
                  {attempt.passed ? 'Passed' : 'Not Passed'}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-2">Status</div>
              {attempt.assessmentId.passingScore && (
                <div className="text-xs text-gray-500">
                  Required: {attempt.assessmentId.passingScore}%
                </div>
              )}
            </div>

            {/* Time Spent */}
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {formatTime(attempt.timeSpent)}
              </div>
              <div className="text-sm text-gray-600 mb-2">Time Spent</div>
              <div className="text-xs text-gray-500">
                Attempt #{attempt.attemptNumber}
              </div>
            </div>

            {/* Completion */}
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {attempt.assessmentId.questions.length}
              </div>
              <div className="text-sm text-gray-600 mb-2">Questions</div>
              <div className="text-xs text-gray-500">
                All completed
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Question Review</h2>
          <div className="space-y-6">
            {attempt.assessmentId.questions.map((question, index) => {
              const answer = attempt.answers.find(a => a.questionId === question.id);
              const weight = question.weight || 1;

              return (
                <div key={question.id} className="border border-gray-200 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium mr-3">
                          Question {index + 1}
                        </span>
                        <span className="text-sm text-gray-500">
                          Weight: {weight} point{weight !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">
                        {question.question}
                      </h3>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-2">Your Answer:</div>
                    <div className="text-gray-900">
                      {answer ? (
                        Array.isArray(answer.answer) ? (
                          answer.answer.length > 0 ? (
                            <ul className="list-disc list-inside">
                              {answer.answer.map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-gray-500 italic">No selections made</span>
                          )
                        ) : (
                          answer.answer || <span className="text-gray-500 italic">No answer provided</span>
                        )
                      ) : (
                        <span className="text-gray-500 italic">No answer provided</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feedback */}
        {attempt.passed ? (
          <div className="bg-green-50 border border-green-200 rounded-3xl p-6 mb-8">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-green-900">Congratulations!</h3>
                <p className="text-green-700">You have successfully completed this assessment.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-3xl p-6 mb-8">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-yellow-900">Assessment Complete</h3>
                <p className="text-yellow-700">
                  {attempt.assessmentId.passingScore
                    ? `You needed ${attempt.assessmentId.passingScore}% to pass. Consider reviewing the material and trying again.`
                    : "Your assessment has been submitted for review."
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center space-x-4">
          <Link
            href="/dashboard"
            className="bg-white/80 text-gray-700 px-6 py-3 rounded-xl font-medium border border-gray-200 hover:bg-white hover:shadow-lg transition-all duration-300"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/dashboard/assessments"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
          >
            View All Assessments
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AssessmentResult({ params }: { params: { id: string } }) {
  return (
    <AuthGuard>
      <AssessmentResultContent params={params} />
    </AuthGuard>
  );
}