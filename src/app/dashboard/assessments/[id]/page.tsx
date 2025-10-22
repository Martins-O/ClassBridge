'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';

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
  startDate?: string;
  endDate?: string;
  maxAttempts?: number;
  timeLimit?: number;
  passingScore?: number;
  questions: Question[];
  createdAt: string;
  schoolId: {
    _id: string;
    name: string;
  };
  classIds: Array<{
    _id: string;
    name: string;
    subject?: string;
  }>;
}

interface AssessmentAttempt {
  _id: string;
  attemptNumber: number;
  startedAt: string;
  submittedAt?: string;
  timeSpent?: number;
  score?: number;
  maxScore?: number;
  percentage?: number;
  passed?: boolean;
  isComplete: boolean;
  respondentId: {
    _id: string;
    name: string;
    email: string;
  };
  assessorId: {
    _id: string;
    name: string;
    email: string;
  };
}

function AssessmentDetailContent({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [attempts, setAttempts] = useState<AssessmentAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [attemptsLoading, setAttemptsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'attempts' | 'analytics'>('overview');

  useEffect(() => {
    fetchAssessment();
    fetchAttempts();
  }, [params.id, fetchAssessment, fetchAttempts]);

  const fetchAssessment = useCallback(async () => {
    try {
      const response = await fetch(`/api/assessments/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setAssessment(data.assessment);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  const fetchAttempts = useCallback(async () => {
    try {
      const response = await fetch(`/api/assessments/${params.id}/attempts`);
      if (response.ok) {
        const data = await response.json();
        setAttempts(data.attempts);
      }
    } catch {
    } finally {
      setAttemptsLoading(false);
    }
  }, [params.id]);

  const toggleAssessmentStatus = async () => {
    if (!assessment) return;

    try {
      const response = await fetch(`/api/assessments/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !assessment.isActive }),
      });

      if (response.ok) {
        setAssessment({ ...assessment, isActive: !assessment.isActive });
      }
    } catch {
    }
  };

  const deleteAssessment = async () => {
    if (!confirm('Are you sure you want to delete this assessment? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/assessments/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/dashboard/assessments');
      } else {
        alert('Failed to delete assessment');
      }
    } catch {
      alert('Error deleting assessment');
    }
  };

  const getAssessmentTypeLabel = (type: string) => {
    const labels = {
      'peer': 'Peer Assessment',
      'mentor_to_student': 'Mentor → Student',
      'student_to_mentor': 'Student → Mentor',
      'self': 'Self Assessment'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatusColor = (assessment: Assessment) => {
    if (!assessment.isActive) return 'bg-gray-100 text-gray-800';

    const now = new Date();
    if (assessment.startDate && new Date(assessment.startDate) > now) {
      return 'bg-yellow-100 text-yellow-800';
    }
    if (assessment.endDate && new Date(assessment.endDate) < now) {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (assessment: Assessment) => {
    if (!assessment.isActive) return 'Inactive';

    const now = new Date();
    if (assessment.startDate && new Date(assessment.startDate) > now) {
      return 'Scheduled';
    }
    if (assessment.endDate && new Date(assessment.endDate) < now) {
      return 'Ended';
    }
    return 'Active';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateAnalytics = () => {
    const completedAttempts = attempts.filter(a => a.isComplete);
    const totalAttempts = attempts.length;
    const averageScore = completedAttempts.length > 0
      ? completedAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / completedAttempts.length
      : 0;
    const passRate = completedAttempts.length > 0
      ? (completedAttempts.filter(a => a.passed).length / completedAttempts.length) * 100
      : 0;

    return {
      totalAttempts,
      completedAttempts: completedAttempts.length,
      averageScore: Math.round(averageScore),
      passRate: Math.round(passRate)
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-6 text-gray-600 font-medium">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20 text-center max-w-md">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Assessment Not Found</h2>
          <p className="text-gray-600 mb-6">The assessment you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
          <Link
            href="/dashboard/assessments"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
          >
            Back to Assessments
          </Link>
        </div>
      </div>
    );
  }

  const analytics = calculateAnalytics();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20 mb-8">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <Link
                  href="/dashboard/assessments"
                  className="text-indigo-600 hover:text-indigo-800 mr-3"
                >
                  ← Back
                </Link>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(assessment)}`}>
                  {getStatusText(assessment)}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{assessment.title}</h1>
              <p className="text-gray-600 text-lg mb-4">{assessment.description}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span>Type: <strong>{getAssessmentTypeLabel(assessment.assessmentType)}</strong></span>
                <span>Target: <strong className="capitalize">{assessment.targetRole}</strong></span>
                <span>Questions: <strong>{assessment.questions.length}</strong></span>
                {assessment.timeLimit && <span>Time Limit: <strong>{assessment.timeLimit} min</strong></span>}
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={toggleAssessmentStatus}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                  assessment.isActive
                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {assessment.isActive ? 'Pause' : 'Activate'}
              </button>
              <Link
                href={`/assessment/${assessment._id}`}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
              >
                Take Assessment
              </Link>
              <button
                onClick={deleteAssessment}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-xl font-medium hover:bg-red-200 transition-all duration-300"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 mb-8">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'questions', label: 'Questions' },
              { id: 'attempts', label: 'Attempts' },
              { id: 'analytics', label: 'Analytics' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'questions' | 'attempts' | 'analytics')}
                className={`px-6 py-4 font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium">{formatDate(assessment.createdAt)}</span>
                    </div>
                    {assessment.startDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Start Date:</span>
                        <span className="font-medium">{formatDate(assessment.startDate)}</span>
                      </div>
                    )}
                    {assessment.endDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">End Date:</span>
                        <span className="font-medium">{formatDate(assessment.endDate)}</span>
                      </div>
                    )}
                    {assessment.maxAttempts && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Max Attempts:</span>
                        <span className="font-medium">{assessment.maxAttempts}</span>
                      </div>
                    )}
                    {assessment.passingScore && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Passing Score:</span>
                        <span className="font-medium">{assessment.passingScore}%</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Associated Classes</h3>
                  {assessment.classIds.length > 0 ? (
                    <div className="space-y-2">
                      {assessment.classIds.map((classItem) => (
                        <div key={classItem._id} className="bg-gray-50 rounded-lg p-3">
                          <div className="font-medium">{classItem.name}</div>
                          {classItem.subject && (
                            <div className="text-sm text-gray-600">{classItem.subject}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No classes assigned</p>
                  )}
                </div>
              </div>
            )}

            {/* Questions Tab */}
            {activeTab === 'questions' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Questions ({assessment.questions.length})</h3>
                </div>
                {assessment.questions.map((question, index) => (
                  <div key={question.id} className="border border-gray-200 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium mr-3">
                          Question {index + 1}
                        </span>
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          {question.type}
                        </span>
                        {question.required && (
                          <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs ml-2">
                            Required
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        Weight: {question.weight || 1}
                      </span>
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">{question.question}</h4>

                    {question.options && question.options.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-2">Options:</div>
                        <ul className="list-disc list-inside space-y-1">
                          {question.options.map((option, optionIndex) => (
                            <li key={optionIndex} className="text-gray-700">{option}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {(question.type === 'rating' || question.type === 'scale') && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600">
                          Scale: {question.min || 1} to {question.max || 5}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Attempts Tab */}
            {activeTab === 'attempts' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Assessment Attempts</h3>
                </div>

                {attemptsLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading attempts...</p>
                  </div>
                ) : attempts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Participant</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Attempt</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Started</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attempts.map((attempt) => (
                          <tr key={attempt._id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div>
                                <div className="font-medium">{attempt.respondentId.name}</div>
                                <div className="text-sm text-gray-600">{attempt.respondentId.email}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4">#{attempt.attemptNumber}</td>
                            <td className="py-3 px-4">{formatDate(attempt.startedAt)}</td>
                            <td className="py-3 px-4">
                              {attempt.isComplete ? (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  attempt.passed
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {attempt.passed ? 'Passed' : 'Failed'}
                                </span>
                              ) : (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  In Progress
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {attempt.isComplete && attempt.percentage !== undefined ? (
                                <span className={`font-medium ${
                                  attempt.passed ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {Math.round(attempt.percentage)}%
                                </span>
                              ) : (
                                '-'
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No attempts yet</h3>
                    <p className="text-gray-600">This assessment hasn&apos;t been taken by anyone yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Assessment Analytics</h3>

                <div className="grid md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                    <div className="text-2xl font-bold text-indigo-600">{analytics.totalAttempts}</div>
                    <div className="text-sm text-gray-600">Total Attempts</div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                    <div className="text-2xl font-bold text-green-600">{analytics.completedAttempts}</div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
                    <div className="text-2xl font-bold text-purple-600">{analytics.averageScore}%</div>
                    <div className="text-sm text-gray-600">Average Score</div>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6">
                    <div className="text-2xl font-bold text-orange-600">{analytics.passRate}%</div>
                    <div className="text-sm text-gray-600">Pass Rate</div>
                  </div>
                </div>

                {analytics.totalAttempts === 0 && (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
                    <p className="text-gray-600">Analytics will appear once people start taking this assessment.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AssessmentDetail({ params }: { params: { id: string } }) {
  return (
    <AuthGuard>
      <AssessmentDetailContent params={params} />
    </AuthGuard>
  );
}
