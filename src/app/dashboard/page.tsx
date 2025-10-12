'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ISurvey } from '@/models/Survey';
import { IResponse } from '@/models/Response';
import AuthGuard from '@/components/AuthGuard';

interface SurveyWithResponses extends ISurvey {
  responseCount: number;
}

function DashboardContent() {
  const [surveys, setSurveys] = useState<SurveyWithResponses[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<ISurvey | null>(null);
  const [responses, setResponses] = useState<IResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLinkCopied, setShowLinkCopied] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<IResponse | null>(null);

  useEffect(() => {
    console.log('State updated:', {
      selectedResponse,
      selectedSurvey: selectedSurvey ? 'exists' : 'null',
      hasSurveyQuestions: selectedSurvey?.questions ? 'yes' : 'no'
    });
  }, [selectedResponse, selectedSurvey]);

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
    // Generate a unique token for this respondent
    const token = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const uniqueLink = `${window.location.origin}/survey/${surveyId}/${token}`;

    // Copy to clipboard
    navigator.clipboard.writeText(uniqueLink);

    // Show a different message for unique links
    setShowLinkCopied(`unique_${surveyId}`);
    setTimeout(() => setShowLinkCopied(null), 3000);

    // Optional: Show an alert with the link for easy sharing
    alert(`Unique survey link generated and copied to clipboard!\n\nLink: ${uniqueLink}\n\nThis link is for a single respondent and can only be used once.`);
  };

  const deleteSurvey = async (surveyId: string) => {
    setDeleting(surveyId);
    try {
      const response = await fetch(`/api/surveys/${surveyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the survey from the list
        setSurveys(surveys.filter(s => s.uniqueId !== surveyId));

        // If this was the selected survey, clear the selection
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

  const getResponseRate = (responses: number) => {
    // Simulated calculation for demo purposes
    const maxViews = Math.max(responses * 3, 10);
    return Math.min(Math.round((responses / maxViews) * 100), 100);
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
          <p className="mt-6 text-gray-600 font-medium">Loading your dashboard...</p>
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
              <span>Back to Dashboard</span>
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
                  <p className="text-sm text-gray-500 font-medium">Response Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{getResponseRate(responses.length)}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Created</p>
                  <p className="text-sm font-bold text-gray-900">{formatDate(selectedSurvey.createdAt).split(',')[0]}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Survey Actions</h3>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => copyLink(selectedSurvey.uniqueId)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>{showLinkCopied === selectedSurvey.uniqueId ? 'Link Copied!' : 'Copy General Link'}</span>
                </button>

                <button
                  onClick={() => generateUniqueLink(selectedSurvey.uniqueId)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span>{showLinkCopied === `unique_${selectedSurvey.uniqueId}` ? 'Unique Link Copied!' : 'Generate Unique Link'}</span>
                </button>

                <Link
                  href={`/survey/${selectedSurvey.uniqueId}`}
                  target="_blank"
                  className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>Preview Survey</span>
                </Link>

                <button
                  onClick={() => setShowDeleteConfirm(selectedSurvey.uniqueId)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Delete Survey</span>
                </button>
              </div>
            </div>
          </div>

          {/* Responses Table */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Survey Responses</h3>
            </div>

            {responses.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">No responses yet</h4>
                <p className="text-gray-600 mb-6">Share your survey link to start collecting responses.</p>
                <button
                  onClick={() => copyLink(selectedSurvey.uniqueId)}
                  className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Copy Survey Link</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Respondent
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Submitted
                      </th>
                      {selectedSurvey.questions?.slice(0, 4).map((question, index) => (
                        <th key={question.id} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          <div className="flex items-center space-x-2">
                            <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </span>
                            <span className="truncate max-w-[150px]">{question.question}</span>
                          </div>
                        </th>
                      ))}
                      {selectedSurvey.questions && selectedSurvey.questions.length > 4 && (
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          +{selectedSurvey.questions.length - 4} more
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {responses.map((response, responseIndex) => (
                      <tr 
                        key={String(response._id)} 
                        onClick={() => {
                          console.log('Row clicked for response:', response._id);
                          console.log('Current selectedSurvey:', selectedSurvey);
                          console.log('Setting selectedResponse to:', response);
                          setSelectedResponse(response);
                          // Also set the selectedSurvey if not already set
                          if (!selectedSurvey) {
                            console.log('selectedSurvey was null, need to find and set it');
                            // Find the survey that contains this response
                            const surveyForResponse = surveys.find(s => s.uniqueId === response.surveyId);
                            if (surveyForResponse) {
                              console.log('Found survey for response:', surveyForResponse.title);
                              setSelectedSurvey(surveyForResponse);
                            }
                          }
                          console.log('selectedResponse state should be updated now');
                        }}
                        className="hover:bg-indigo-50/50 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                              #{responseIndex + 1}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {response.respondentToken?.startsWith('anonymous_')
                                  ? `Anonymous User ${responseIndex + 1}`
                                  : `Respondent ${response.respondentToken?.slice(0, 8) || responseIndex + 1}`
                                }
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {response.respondentToken?.slice(-8) || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(response.submittedAt)}
                        </td>
                        {selectedSurvey.questions?.slice(0, 4).map((question) => {
                          const answer = response.answers.find(a => a.questionId === question.id);
                          return (
                            <td key={question.id} className="px-6 py-4 text-sm text-gray-900">
                              <div className="max-w-xs">
                                {answer ? (
                                  <div className="bg-gray-50 rounded-lg px-3 py-2">
                                    <span className="block truncate">
                                      {Array.isArray(answer.answer)
                                        ? answer.answer.join(', ')
                                        : answer.answer}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 italic">No answer</span>
                                )}
                              </div>
                            </td>
                          );
                        })}
                        {selectedSurvey.questions && selectedSurvey.questions.length > 4 && (
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent row click
                                console.log('View all button clicked for response:', response._id);
                                console.log('Current selectedSurvey:', selectedSurvey);
                                console.log('Setting selectedResponse to:', response);
                                setSelectedResponse(response);
                                // Also set the selectedSurvey if not already set
                                if (!selectedSurvey) {
                                  console.log('selectedSurvey was null, need to find and set it');
                                  // Find the survey that contains this response
                                  const surveyForResponse = surveys.find(s => s.uniqueId === response.surveyId);
                                  if (surveyForResponse) {
                                    console.log('Found survey for response:', surveyForResponse.title);
                                    setSelectedSurvey(surveyForResponse);
                                  }
                                }
                                console.log('selectedResponse state should be updated now');
                              }}
                              className="text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                              View all →
                            </button>
                          </td>
                        )}
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
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                SurveyPro
              </span>
            </Link>

            {/* Navigation Tabs */}
            <div className="hidden md:flex items-center space-x-1 bg-gray-100 rounded-xl p-1">
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-lg bg-white shadow-sm text-indigo-600 font-medium transition-all duration-300"
              >
                Surveys
              </Link>
              <Link
                href="/dashboard/classes"
                className="px-4 py-2 rounded-lg text-gray-600 hover:text-indigo-600 font-medium transition-all duration-300"
              >
                Classes
              </Link>
              <Link
                href="/register-school"
                className="px-4 py-2 rounded-lg text-gray-600 hover:text-indigo-600 font-medium transition-all duration-300"
              >
                School Setup
              </Link>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <Link
                href="/create"
                className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="hidden sm:inline">Create Survey</span>
                <span className="sm:hidden">Create</span>
              </Link>

              {/* Profile/Logout */}
              <div className="relative group">
                <button className="w-10 h-10 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center hover:from-gray-200 hover:to-gray-300 transition-all duration-300">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden mt-4 flex space-x-1 bg-gray-100 rounded-xl p-1">
            <Link
              href="/dashboard"
              className="flex-1 text-center px-3 py-2 rounded-lg bg-white shadow-sm text-indigo-600 font-medium transition-all duration-300"
            >
              Surveys
            </Link>
            <Link
              href="/dashboard/classes"
              className="flex-1 text-center px-3 py-2 rounded-lg text-gray-600 hover:text-indigo-600 font-medium transition-all duration-300"
            >
              Classes
            </Link>
            <Link
              href="/register-school"
              className="flex-1 text-center px-3 py-2 rounded-lg text-gray-600 hover:text-indigo-600 font-medium transition-all duration-300"
            >
              School
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Survey Dashboard
              </h1>
              <p className="text-xl text-gray-600">Manage your surveys and analyze responses</p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/create"
                className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>New Survey</span>
              </Link>

              <Link
                href="/register-school"
                className="flex items-center space-x-2 bg-white border-2 border-indigo-200 text-indigo-600 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>Register School</span>
              </Link>

              <Link
                href="/dashboard/classes"
                className="flex items-center space-x-2 bg-white border-2 border-gray-200 text-gray-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>Manage Classes</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        {surveys.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Surveys</p>
                  <p className="text-3xl font-bold text-gray-900">{surveys.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Responses</p>
                  <p className="text-3xl font-bold text-gray-900">{getTotalResponses()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Avg Response Rate</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {surveys.length > 0
                      ? Math.round(surveys.reduce((acc, s) => acc + getResponseRate(s.responseCount), 0) / surveys.length)
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Surveys Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Surveys</h2>
            {surveys.length > 0 && (
              <div className="text-sm text-gray-500">
                {surveys.length} survey{surveys.length !== 1 ? 's' : ''} created
              </div>
            )}
          </div>

          {surveys.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No surveys yet</h3>
              <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">Get started by creating your first survey to collect valuable feedback from your audience.</p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/create"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Create Your First Survey</span>
                </Link>

                <Link
                  href="/register-school"
                  className="inline-flex items-center space-x-2 bg-white border-2 border-indigo-200 text-indigo-600 px-8 py-4 rounded-2xl font-semibold hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span>Set Up School</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {surveys.map((survey) => (
                <div key={String(survey._id)} className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/20">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors">
                      {survey.title}
                    </h3>
                    <div className={`w-2.5 h-2.5 rounded-full ${survey.responseCount > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-4">{survey.description}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gray-50/50 rounded-xl">
                    <div className="text-center">
                      <p className="text-lg font-bold text-indigo-600">{survey.responseCount}</p>
                      <p className="text-xs text-gray-500 font-medium">Responses</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-purple-600">{survey.questions?.length || 0}</p>
                      <p className="text-xs text-gray-500 font-medium">Questions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600">{getResponseRate(survey.responseCount)}%</p>
                      <p className="text-xs text-gray-500 font-medium">Rate</p>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mb-4">
                    {formatDate(survey.createdAt)}
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <button
                      onClick={() => viewSurveyResponses(survey)}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
                    >
                      View Responses
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => copyLink(survey.uniqueId)}
                        className="flex items-center justify-center space-x-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>{showLinkCopied === survey.uniqueId ? 'Copied!' : 'Copy'}</span>
                      </button>
                      <Link
                        href={`/survey/${survey.uniqueId}`}
                        target="_blank"
                        className="flex items-center justify-center space-x-1 bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-200 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>Preview</span>
                      </Link>
                    </div>
                  </div>
              </div>
            ))}
          </div>
          )}
        </div>

        {/* Help Section */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-3xl p-8 text-white mb-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-4">Need Help Getting Started?</h3>
            <p className="text-indigo-100 text-lg mb-6 max-w-2xl mx-auto">
              SurveyPro makes it easy to create surveys, manage educational institutions, and track responses.
              Whether you're an individual or running a school, we've got you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/create"
                className="inline-flex items-center space-x-2 bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Create Your First Survey</span>
              </Link>
              <Link
                href="/register-school"
                className="inline-flex items-center space-x-2 bg-white/20 text-white border-2 border-white/30 px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 backdrop-blur-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>Set Up Your School</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl p-8 max-w-md mx-4 shadow-2xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5C3.498 16.333 4.46 18 6 18z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Survey</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this survey? This action will permanently delete the survey and all its responses. This cannot be undone.
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    disabled={deleting === showDeleteConfirm}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deleteSurvey(showDeleteConfirm)}
                    disabled={deleting === showDeleteConfirm}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:transform-none"
                  >
                    {deleting === showDeleteConfirm ? (
                      <div className="flex items-center justify-center space-x-2">
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Deleting...</span>
                      </div>
                    ) : (
                      'Delete Forever'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Response Detail Modal */}
        {selectedResponse && selectedSurvey && (selectedSurvey as ISurvey).questions && (
          console.log('Modal condition met:', {
            selectedResponse: !!selectedResponse,
            selectedSurvey: !!selectedSurvey,
            hasQuestions: !!(selectedSurvey as ISurvey).questions
          }),
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-4xl w-full mx-4 my-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Response Details</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Submitted on {formatDate(selectedResponse.submittedAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedResponse(null)}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="px-8 py-6">
                {/* Respondent Info */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                      {responses.findIndex(r => r._id === selectedResponse._id) + 1}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {selectedResponse.respondentToken?.startsWith('anonymous_')
                          ? `Anonymous User ${responses.findIndex(r => r._id === selectedResponse._id) + 1}`
                          : `Respondent ${selectedResponse.respondentToken?.slice(0, 8)}`
                        }
                      </h4>
                      <p className="text-sm text-gray-600">
                        Token: {selectedResponse.respondentToken || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Questions and Answers */}
                <div className="space-y-6">
                  {(selectedSurvey as ISurvey).questions.map((question, index) => {
                    const answer = selectedResponse.answers.find(a => a.questionId === question.id);
                    return (
                      <div key={question.id} className="bg-gray-50 rounded-2xl p-6">
                        <div className="flex items-start space-x-4 mb-4">
                          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h5 className="text-lg font-semibold text-gray-900 mb-1">
                              {question.question}
                            </h5>
                            {question.description && (
                              <p className="text-sm text-gray-600 mb-3">{question.description}</p>
                            )}
                            <div className="mt-3">
                              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                {question.type === 'text' && 'Text Response'}
                                {question.type === 'single-choice' && 'Single Choice'}
                                {question.type === 'multiple-choice' && 'Multiple Choice'}
                                {question.type === 'checkbox' && 'Checkbox'}
                                {question.type === 'rating' && 'Rating'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-12">
                          {answer ? (
                            <div className="bg-white rounded-xl p-4 border-2 border-indigo-200">
                              {Array.isArray(answer.answer) ? (
                                <div className="space-y-2">
                                  {answer.answer.map((item, idx) => (
                                    <div key={idx} className="flex items-center space-x-2">
                                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                      <span className="text-gray-900 font-medium">{item}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-gray-900 font-medium whitespace-pre-wrap">{answer.answer}</p>
                              )}
                            </div>
                          ) : (
                            <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
                              <span className="text-gray-400 italic">No answer provided</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-8 py-6 rounded-b-3xl">
                <button
                  onClick={() => setSelectedResponse(null)}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}