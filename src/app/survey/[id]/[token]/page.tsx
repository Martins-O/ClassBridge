'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ISurvey } from '@/models/Survey';
import { IAnswer, IResponse } from '@/models/Response';

export default function TokenSurveyResponse() {
  const params = useParams();
  const router = useRouter();
  const [survey, setSurvey] = useState<ISurvey | null>(null);
  const [answers, setAnswers] = useState<{ [key: string]: string | string[] }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [existingResponse, setExistingResponse] = useState<IResponse | null>(null);
  const [showValidationErrors, setShowValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    fetchSurveyAndResponse();
  }, [params.id, params.token]);

  const fetchSurveyAndResponse = async () => {
    try {
      // Fetch survey
      const surveyResponse = await fetch(`/api/surveys/${params.id}`);
      if (surveyResponse.ok) {
        const surveyData = await surveyResponse.json();
        setSurvey(surveyData.survey);
      } else {
        alert('Survey not found');
        router.push('/');
        return;
      }

      // Check if this token already has a response
      const responseCheck = await fetch(`/api/responses/check?surveyId=${params.id}&token=${params.token}`);
      if (responseCheck.ok) {
        const responseData = await responseCheck.json();
        if (responseData.exists) {
          setExistingResponse(responseData.response);
          setIsSubmitted(true);
        }
      }
    } catch (error) {
      console.error('Error loading survey:', error);
      alert('Error loading survey');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId: string, answer: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));

    // Remove validation error for this question
    setShowValidationErrors(prev => prev.filter(id => id !== questionId));
  };

  const validateAndProceed = () => {
    if (!survey) return;

    const requiredQuestions = survey.questions.filter(q => q.required);
    const missingAnswers = requiredQuestions.filter(q => {
      const answer = answers[q.id];
      return !answer || answer === '' || (Array.isArray(answer) && answer.length === 0);
    });

    if (missingAnswers.length > 0) {
      setShowValidationErrors(missingAnswers.map(q => q.id));
      return;
    }

    handleSubmit();
  };

  const handleSubmit = async () => {
    if (!survey) return;

    setIsSubmitting(true);
    try {
      const formattedAnswers: IAnswer[] = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer
      }));

      const response = await fetch('/api/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          surveyId: survey.uniqueId,
          respondentToken: params.token,
          answers: formattedAnswers
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        // Refresh to show the submitted response
        fetchSurveyAndResponse();
      } else {
        alert('Failed to submit response');
      }
    } catch (error) {
      alert('Error submitting response');
    } finally {
      setIsSubmitting(false);
    }
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
          <p className="mt-6 text-gray-600 font-medium">Loading your survey...</p>
        </div>
      </div>
    );
  }

  if (isSubmitted && existingResponse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center mb-8 pt-8">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
              Response Submitted
            </h1>
            <p className="text-gray-600 text-lg mb-8">
              Thank you for completing this survey. Here&apos;s what you submitted:
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">{survey?.title}</h2>

            <div className="space-y-6">
              {survey?.questions.map((question, index) => {
                const answer = existingResponse.answers.find((a: IAnswer) => a.questionId === question.id);
                return (
                  <div key={question.id} className="border-b border-gray-200 pb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {index + 1}. {question.question}
                    </h3>
                    {question.description && (
                      <p className="text-gray-600 text-sm mb-3 leading-relaxed">{question.description}</p>
                    )}
                    <div className="text-gray-700">
                      {question.type === 'single-choice' || question.type === 'multiple-choice' || question.type === 'text' || question.type === 'rating' ? (
                        <p className="bg-gray-50 p-3 rounded-lg">{answer?.answer}</p>
                      ) : question.type === 'checkbox' ? (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          {Array.isArray(answer?.answer) ? answer.answer.join(', ') : answer?.answer}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Submitted on {new Date(existingResponse.submittedAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Responses cannot be edited after submission.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-12 max-w-md text-center border border-white/20">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5C3.498 16.333 4.46 18 6 18z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Survey Not Found</h2>
          <p className="text-gray-600 mb-8">The survey link you&apos;re looking for doesn&apos;t exist or may have been removed.</p>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  // Render the survey form (same as before but simpler since we know it's not submitted)
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-medium">Back</span>
            </Link>
            <div className="text-sm text-gray-600">
              Personal Survey Link
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Survey Header */}
        <div className="text-center mb-12 pt-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            {survey.title}
          </h1>
          {survey.description && (
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {survey.description}
            </p>
          )}
          <div className="mt-6 text-sm text-indigo-600 bg-indigo-50 inline-block px-4 py-2 rounded-full">
            🔐 Personal Survey Link - Your responses are private
          </div>
        </div>

        {/* Questions - using same render logic as original */}
        <div className="space-y-8">
          {survey.questions.map((question, index) => {
            const hasError = showValidationErrors.includes(question.id);
            const isAnswered = answers[question.id] && answers[question.id] !== '' && (!Array.isArray(answers[question.id]) || (answers[question.id] as string[]).length > 0);

            return (
              <div
                key={question.id}
                className={`bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border transition-all duration-300 ${
                  hasError
                    ? 'border-red-300 bg-red-50/50'
                    : isAnswered
                    ? 'border-green-300 bg-green-50/30'
                    : 'border-white/20 hover:border-indigo-200'
                }`}
              >
                <div className="mb-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-sm ${
                      isAnswered ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                    }`}>
                      {isAnswered ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 leading-relaxed">
                        {question.question}
                        {question.required && <span className="text-red-500 ml-2">*</span>}
                      </h3>
                      {question.description && (
                        <p className="text-gray-600 text-sm mb-3 leading-relaxed">{question.description}</p>
                      )}
                      {hasError && (
                        <p className="text-red-600 text-sm font-medium">This question is required</p>
                      )}
                    </div>
                  </div>

                  {/* Question Input - Same logic as original survey page */}
                  <div className="ml-14">
                    {question.type === 'text' && (
                      <div className="relative">
                        <textarea
                          value={answers[question.id] as string || ''}
                          onChange={(e) => handleAnswer(question.id, e.target.value)}
                          className={`w-full px-6 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 transition-all duration-300 resize-none text-gray-900 font-medium ${
                            hasError
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                              : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-200'
                          }`}
                          rows={4}
                          placeholder="Share your thoughts here..."
                        />
                        <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                          {(answers[question.id] as string || '').length} characters
                        </div>
                      </div>
                    )}

                    {question.type === 'single-choice' && (
                      <div className="space-y-3">
                        {question.options?.map((option, optionIndex) => (
                          <label
                            key={optionIndex}
                            className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 group hover:bg-indigo-50 ${
                              answers[question.id] === option
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-gray-200 hover:border-indigo-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name={question.id}
                              value={option}
                              checked={answers[question.id] === option}
                              onChange={(e) => handleAnswer(question.id, e.target.value)}
                              className="sr-only"
                            />
                            <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                              answers[question.id] === option
                                ? 'border-indigo-500 bg-indigo-500'
                                : 'border-gray-300 group-hover:border-indigo-400'
                            }`}>
                              {answers[question.id] === option && (
                                <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                              )}
                            </div>
                            <span className={`text-lg font-medium ${
                              answers[question.id] === option ? 'text-indigo-900' : 'text-gray-700'
                            }`}>
                              {option}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}

                    {question.type === 'multiple-choice' && (
                      <div className="space-y-3">
                        {question.options?.map((option, optionIndex) => (
                          <label
                            key={optionIndex}
                            className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 group hover:bg-indigo-50 ${
                              answers[question.id] === option
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-gray-200 hover:border-indigo-300'
                            }`}
                          >
                            <div className="relative">
                              <input
                                type="radio"
                                name={question.id}
                                value={option}
                                checked={answers[question.id] === option}
                                onChange={(e) => handleAnswer(question.id, e.target.value)}
                                className="sr-only"
                              />
                              <div className={`w-5 h-5 border-2 rounded-full transition-all duration-300 ${
                                answers[question.id] === option
                                  ? 'border-indigo-500 bg-indigo-500'
                                  : 'border-gray-300 group-hover:border-indigo-400'
                              }`}>
                                {answers[question.id] === option && (
                                  <div className="w-1.5 h-1.5 bg-white rounded-full mx-auto mt-1.5"></div>
                                )}
                              </div>
                            </div>
                            <span className="ml-4 text-gray-700 font-medium flex-1">{option}</span>
                            <div className={`w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-sm font-semibold flex items-center justify-center ${
                              answers[question.id] === option ? 'bg-indigo-100 text-indigo-600' : ''
                            }`}>
                              {String.fromCharCode(65 + optionIndex)}
                            </div>
                          </label>
                        ))}
                      </div>
                    )}

                    {question.type === 'checkbox' && (
                      <div className="space-y-3">
                        {question.options?.map((option, optionIndex) => {
                          const isChecked = (answers[question.id] as string[] || []).includes(option);
                          return (
                            <label
                              key={optionIndex}
                              className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 group hover:bg-indigo-50 ${
                                isChecked
                                  ? 'border-indigo-500 bg-indigo-50'
                                  : 'border-gray-200 hover:border-indigo-300'
                              }`}
                            >
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  value={option}
                                  checked={isChecked}
                                  onChange={(e) => {
                                    const currentAnswers = answers[question.id] as string[] || [];
                                    if (e.target.checked) {
                                      handleAnswer(question.id, [...currentAnswers, option]);
                                    } else {
                                      handleAnswer(question.id, currentAnswers.filter(a => a !== option));
                                    }
                                  }}
                                  className="sr-only"
                                />
                                <div className={`w-5 h-5 border-2 rounded transition-all duration-300 ${
                                  isChecked
                                    ? 'border-indigo-500 bg-indigo-500'
                                    : 'border-gray-300 group-hover:border-indigo-400'
                                }`}>
                                  {isChecked && (
                                    <svg className="w-3 h-3 text-white mx-auto mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                              </div>
                              <span className="ml-4 text-gray-700 font-medium flex-1">{option}</span>
                              <div className={`w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-sm font-semibold flex items-center justify-center ${
                                isChecked ? 'bg-indigo-100 text-indigo-600' : ''
                              }`}>
                                {String.fromCharCode(65 + optionIndex)}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {question.type === 'rating' && (
                      <div>
                        {(question.ratingConfig?.minLabel || question.ratingConfig?.maxLabel) && (
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-gray-500">
                              {question.ratingConfig?.minLabel || question.ratingConfig?.min || 1}
                            </span>
                            <span className="text-sm text-gray-500">
                              {question.ratingConfig?.maxLabel || question.ratingConfig?.max || 5}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-center space-x-3 flex-wrap">
                          {Array.from({
                            length: (question.ratingConfig?.max || 5) - (question.ratingConfig?.min || 1) + 1
                          }, (_, i) => {
                            const rating = (question.ratingConfig?.min || 1) + i;
                            const isSelected = answers[question.id] === rating.toString();
                            return (
                              <button
                                key={rating}
                                type="button"
                                onClick={() => handleAnswer(question.id, rating.toString())}
                                className={`w-16 h-16 rounded-2xl border-2 font-bold text-lg transition-all duration-300 transform hover:scale-110 mb-2 ${
                                  isSelected
                                    ? 'border-indigo-500 bg-indigo-500 text-white shadow-lg'
                                    : 'border-gray-300 text-gray-600 hover:border-indigo-400 hover:bg-indigo-50'
                                }`}
                              >
                                {rating}
                              </button>
                            );
                          })}
                        </div>
                        {answers[question.id] && (
                          <div className="text-center mt-4">
                            <span className="text-sm text-indigo-600 font-medium">
                              You rated: {answers[question.id]}/{question.ratingConfig?.max || 5}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit Section */}
        <div className="mt-12 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to submit?</h3>
            <p className="text-gray-600 mb-8">Thank you for taking the time to complete this survey!</p>

            <button
              onClick={validateAndProceed}
              disabled={isSubmitting}
              className="inline-flex items-center space-x-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-12 py-4 rounded-2xl font-semibold hover:shadow-2xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300 text-lg"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Submitting Response...</span>
                </>
              ) : (
                <>
                  <span>Submit Response</span>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>

            {showValidationErrors.length > 0 && (
              <p className="text-red-600 text-sm mt-4 font-medium">
                Please answer all required questions before submitting
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}