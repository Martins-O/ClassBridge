'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ISurvey } from '@/models/Survey';
import { IResponse } from '@/models/Response';
import AuthGuard from '@/components/AuthGuard';

interface SurveyWithResponses extends ISurvey {
  responseCount: number;
}

function SurveysContent() {
  const [surveys, setSurveys] = useState<SurveyWithResponses[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<ISurvey | null>(null);
  const [responses, setResponses] = useState<IResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLinkCopied, setShowLinkCopied] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<IResponse | null>(null);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      const response = await fetch('/api/surveys');
      if (response.ok) {
        const data = await response.json();

        // Fetch response counts for each survey
        const surveysWithCounts = await Promise.all(
          data.surveys.map(async (survey: ISurvey) => {
            const responseRes = await fetch(`/api/responses?surveyId=${survey.uniqueId}`);
            if (responseRes.ok) {
              const responseData = await responseRes.json();
              return { ...survey, responseCount: responseData.responses.length };
            }
            return { ...survey, responseCount: 0 };
          })
        );

        setSurveys(surveysWithCounts);
      }
    } catch (error) {
      console.error('Error fetching surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResponses = async (surveyId: string) => {
    try {
      const response = await fetch(`/api/responses?surveyId=${surveyId}`);
      if (response.ok) {
        const data = await response.json();
        setResponses(data.responses);
      }
    } catch (error) {
      console.error('Error fetching responses:', error);
    }
  };

  const viewSurveyResponses = async (survey: ISurvey) => {
    setSelectedSurvey(survey);
    await fetchResponses(survey.uniqueId);
  };

  const copyLink = (surveyId: string) => {
    const link = `${window.location.origin}/survey/${surveyId}`;
    navigator.clipboard.writeText(link);
    setShowLinkCopied(surveyId);
    setTimeout(() => setShowLinkCopied(null), 2000);
  };

  const generateUniqueLink = (surveyId: string) => {
    const token = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const uniqueLink = `${window.location.origin}/survey/${surveyId}/${token}`;

    navigator.clipboard.writeText(uniqueLink);
    setShowLinkCopied(`unique_${surveyId}`);
    setTimeout(() => setShowLinkCopied(null), 3000);

    alert(`Unique survey link generated and copied to clipboard!\n\nLink: ${uniqueLink}\n\nThis link is for a single respondent and can only be used once.`);
  };

  const deleteSurvey = async (surveyId: string) => {
    setDeleting(surveyId);
    try {
      const response = await fetch(`/api/surveys/${surveyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSurveys(surveys.filter(s => s.uniqueId !== surveyId));

        if (selectedSurvey?.uniqueId === surveyId) {
          setSelectedSurvey(null);
          setResponses([]);
        }

        alert('Survey deleted successfully!');
      } else {
        alert('Failed to delete survey');
      }
    } catch (error) {
      console.error('Error deleting survey:', error);
      alert('Error deleting survey');
    } finally {
      setDeleting(null);
      setShowDeleteConfirm(null);
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTotalResponses = () => {
    return surveys.reduce((total, survey) => total + survey.responseCount, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-indigo-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading surveys...</p>
        </div>
      </div>
    );
  }

  if (selectedSurvey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <button
              onClick={() => setSelectedSurvey(null)}
              className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Surveys</span>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6">
          {/* Survey Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {selectedSurvey.title}
            </h1>
            <p className="text-gray-600 text-lg">{selectedSurvey.description}</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Responses</p>
                  <p className="text-2xl font-bold text-gray-900">{responses.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Questions</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedSurvey.questions?.length || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Created</p>
                  <p className="text-sm font-bold text-gray-900">{formatDate(selectedSurvey.createdAt)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Status</p>
                  <p className="text-sm font-bold text-green-600">Active</p>
                </div>
              </div>
            </div>
          </div>

          {/* Responses Table */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Survey Responses</h2>
              <p className="text-gray-600 mt-1">View and analyze all responses to this survey</p>
            </div>

            {responses.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No responses yet</h3>
                <p className="text-gray-600">Share your survey to start collecting responses.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Response ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted At
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {responses.map((response) => (
                      <tr key={response._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                          {response._id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(response.submittedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <button
                            onClick={() => setSelectedResponse(response)}
                            className="text-indigo-600 hover:text-indigo-900 font-medium"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Survey Management
            </h1>
            <p className="text-xl text-gray-600">Create, manage, and analyze your surveys</p>
          </div>
          <div className="flex space-x-4">
            <Link
              href="/dashboard"
              className="bg-white/80 text-gray-700 px-4 py-2 rounded-xl font-medium hover:bg-white hover:shadow-lg transition-all duration-300 border border-gray-200"
            >
              ← Back to Dashboard
            </Link>
            <Link
              href="/create-survey"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
            >
              Create New Survey
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{surveys.length}</p>
                <p className="text-gray-600">Total Surveys</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{getTotalResponses()}</p>
                <p className="text-gray-600">Total Responses</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {surveys.length > 0 ? Math.round(getTotalResponses() / surveys.length) : 0}
                </p>
                <p className="text-gray-600">Avg. Responses</p>
              </div>
            </div>
          </div>
        </div>

        {/* Surveys Grid */}
        {surveys.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No surveys yet</h2>
            <p className="text-gray-600 mb-8 text-lg">Create your first survey to start collecting responses from your audience.</p>
            <Link
              href="/create-survey"
              className="inline-flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Your First Survey
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {surveys.map((survey) => (
              <div key={survey.uniqueId} className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{survey.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{survey.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50/50 rounded-xl">
                  <div className="text-center">
                    <p className="text-lg font-bold text-indigo-600">{survey.responseCount}</p>
                    <p className="text-xs text-gray-500">Responses</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-purple-600">{survey.questions?.length || 0}</p>
                    <p className="text-xs text-gray-500">Questions</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => viewSurveyResponses(survey)}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
                  >
                    View Responses
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => copyLink(survey.uniqueId)}
                      className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                    >
                      {showLinkCopied === survey.uniqueId ? 'Copied!' : 'Copy Link'}
                    </button>
                    <button
                      onClick={() => generateUniqueLink(survey.uniqueId)}
                      className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                    >
                      {showLinkCopied === `unique_${survey.uniqueId}` ? 'Generated!' : 'Unique Link'}
                    </button>
                  </div>

                  <button
                    onClick={() => setShowDeleteConfirm(survey.uniqueId)}
                    disabled={deleting === survey.uniqueId}
                    className="w-full px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
                  >
                    {deleting === survey.uniqueId ? 'Deleting...' : 'Delete Survey'}
                  </button>
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  Created: {formatDate(survey.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-md w-full mx-4 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Survey</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this survey? This action cannot be undone and all responses will be lost.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteSurvey(showDeleteConfirm)}
                  className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Surveys() {
  return (
    <AuthGuard>
      <SurveysContent />
    </AuthGuard>
  );
}