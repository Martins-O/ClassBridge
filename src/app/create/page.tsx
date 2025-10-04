'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IQuestion } from '@/models/Survey';
import AuthGuard from '@/components/AuthGuard';

function CreateSurveyContent() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<IQuestion[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addQuestion = () => {
    const newQuestion: IQuestion = {
      id: Date.now().toString(),
      type: 'text',
      question: '',
      required: false
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, field: keyof IQuestion, value: string | boolean | string[]) => {
    setQuestions(questions.map(q =>
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const addOption = (questionId: string) => {
    setQuestions(questions.map(q =>
      q.id === questionId
        ? { ...q, options: [...(q.options || []), ''] }
        : q
    ));
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q =>
      q.id === questionId
        ? {
            ...q,
            options: q.options?.map((opt, idx) => idx === optionIndex ? value : opt)
          }
        : q
    ));
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(questions.map(q =>
      q.id === questionId
        ? {
            ...q,
            options: q.options?.filter((_, idx) => idx !== optionIndex)
          }
        : q
    ));
  };

  const moveQuestion = (questionId: string, direction: 'up' | 'down') => {
    const currentIndex = questions.findIndex(q => q.id === questionId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;

    const newQuestions = [...questions];
    [newQuestions[currentIndex], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[currentIndex]];
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || questions.length === 0) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/surveys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          questions
        }),
      });

      if (response.ok) {
        const survey = await response.json();
        router.push(`/dashboard`);
      } else {
        alert('Failed to create survey');
      }
    } catch (error) {
      alert('Error creating survey');
    } finally {
      setIsSubmitting(false);
    }
  };

  const questionTypeIcons = {
    text: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
      </svg>
    ),
    'multiple-choice': (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    checkbox: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    rating: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    )
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
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
        <Link
          href="/dashboard"
          className="text-gray-600 hover:text-indigo-600 transition-colors font-medium"
        >
          My Surveys
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Create New Survey
          </h1>
          <p className="text-gray-600 text-lg">Build engaging surveys that get better responses</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Survey Details */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Survey Details</span>
            </h2>

            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-3">
                  Survey Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 text-lg text-gray-900 font-semibold placeholder-gray-400"
                  placeholder="e.g., Customer Satisfaction Survey"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-3">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 resize-none text-gray-900 font-medium placeholder-gray-400"
                  rows={3}
                  placeholder="Describe what this survey is about and why responses matter..."
                />
              </div>
            </div>
          </div>

          {/* Questions Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center space-x-2">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Questions ({questions.length})</span>
              </h2>
              <button
                type="button"
                onClick={addQuestion}
                className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-2xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Question</span>
              </button>
            </div>

            {questions.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-2xl">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No questions yet</h3>
                <p className="text-gray-600 mb-4">Click &quot;Add Question&quot; to start building your survey</p>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Your First Question</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {questions.map((question, index) => (
                  <div key={question.id} className="bg-white rounded-2xl border-2 border-gray-100 p-6 hover:border-indigo-200 transition-all duration-300 group">
                    {/* Question Header */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className={`flex items-center space-x-2 px-3 py-2 rounded-xl border-2 ${
                          question.type === 'text' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                          question.type === 'multiple-choice' ? 'bg-green-50 border-green-200 text-green-700' :
                          question.type === 'checkbox' ? 'bg-purple-50 border-purple-200 text-purple-700' :
                          'bg-orange-50 border-orange-200 text-orange-700'
                        }`}>
                          {questionTypeIcons[question.type]}
                          <span className="text-sm font-bold capitalize">
                            {question.type.replace('-', ' ')}
                          </span>
                        </div>
                        {question.required && (
                          <span className="bg-red-100 text-red-700 px-2 py-1 rounded-lg text-xs font-semibold">
                            Required
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* Move buttons */}
                        <button
                          type="button"
                          onClick={() => moveQuestion(question.id, 'up')}
                          disabled={index === 0}
                          className="p-2 text-gray-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => moveQuestion(question.id, 'down')}
                          disabled={index === questions.length - 1}
                          className="p-2 text-gray-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={() => removeQuestion(question.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Question Text */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Question Text
                        </label>
                        <input
                          type="text"
                          value={question.question}
                          onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 text-gray-900 font-medium placeholder-gray-400"
                          placeholder="Enter your question here..."
                        />
                      </div>

                      {/* Question Type */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Question Type
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {(['text', 'multiple-choice', 'checkbox', 'rating'] as const).map((type) => {
                            const typeColors = {
                              text: { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-700', icon: 'text-blue-600' },
                              'multiple-choice': { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-700', icon: 'text-green-600' },
                              checkbox: { bg: 'bg-purple-50', border: 'border-purple-500', text: 'text-purple-700', icon: 'text-purple-600' },
                              rating: { bg: 'bg-orange-50', border: 'border-orange-500', text: 'text-orange-700', icon: 'text-orange-600' }
                            };
                            const colors = typeColors[type];
                            return (
                              <button
                                key={type}
                                type="button"
                                onClick={() => {
                                  // Update both type and rating config in one operation
                                  const updatedQuestion = { ...question, type };
                                  if (type === 'rating') {
                                    updatedQuestion.ratingConfig = {
                                      min: 1,
                                      max: 5,
                                      minLabel: 'Poor',
                                      maxLabel: 'Excellent'
                                    };
                                  }
                                  setQuestions(questions.map(q =>
                                    q.id === question.id ? updatedQuestion : q
                                  ));
                                }}
                                className={`p-5 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center space-y-3 transform hover:scale-105 ${
                                  question.type === type
                                    ? `${colors.border} ${colors.bg} ${colors.text} shadow-lg scale-105`
                                    : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50'
                                }`}
                              >
                                <div className={`p-2 rounded-xl ${
                                  question.type === type ? colors.bg : 'bg-gray-100'
                                }`}>
                                  <div className={question.type === type ? colors.icon : 'text-gray-500'}>
                                    {questionTypeIcons[type]}
                                  </div>
                                </div>
                                <span className="text-sm font-bold capitalize text-center leading-tight">
                                  {type.replace('-', ' ')}
                                </span>
                                {question.type === type && (
                                  <div className="w-2 h-2 bg-current rounded-full opacity-60"></div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Options for choice questions */}
                      {(question.type === 'multiple-choice' || question.type === 'checkbox') && (
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <label className="block text-sm font-semibold text-gray-700">
                              Answer Options
                            </label>
                            <button
                              type="button"
                              onClick={() => addOption(question.id)}
                              className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold flex items-center space-x-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              <span>Add Option</span>
                            </button>
                          </div>
                          <div className="space-y-3">
                            {(question.options || []).map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center space-x-3">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-sm font-semibold">
                                  {String.fromCharCode(65 + optionIndex)}
                                </div>
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 text-gray-900 font-medium placeholder-gray-400"
                                  placeholder={`Option ${optionIndex + 1}`}
                                />
                                <button
                                  type="button"
                                  onClick={() => removeOption(question.id, optionIndex)}
                                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                            {(!question.options || question.options.length === 0) && (
                              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                                <p className="text-gray-500 mb-2">No options added yet</p>
                                <button
                                  type="button"
                                  onClick={() => addOption(question.id)}
                                  className="text-indigo-600 hover:text-indigo-700 font-semibold"
                                >
                                  Add your first option
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Rating Configuration */}
                      {question.type === 'rating' && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Rating Scale Configuration
                          </label>
                          <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-2">
                                  Minimum Value
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  max="10"
                                  value={question.ratingConfig?.min || 1}
                                  onChange={(e) => {
                                    const min = parseInt(e.target.value);
                                    const max = question.ratingConfig?.max || 5;
                                    if (min < max) {
                                      updateQuestion(question.id, 'ratingConfig', {
                                        ...question.ratingConfig,
                                        min,
                                        max: Math.max(min + 1, max)
                                      });
                                    }
                                  }}
                                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 transition-all text-gray-900 font-semibold"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-2">
                                  Maximum Value
                                </label>
                                <input
                                  type="number"
                                  min="2"
                                  max="10"
                                  value={question.ratingConfig?.max || 5}
                                  onChange={(e) => {
                                    const max = parseInt(e.target.value);
                                    const min = question.ratingConfig?.min || 1;
                                    if (max > min) {
                                      updateQuestion(question.id, 'ratingConfig', {
                                        ...question.ratingConfig,
                                        min: Math.min(min, max - 1),
                                        max
                                      });
                                    }
                                  }}
                                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 transition-all text-gray-900 font-semibold"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-2">
                                  Low End Label (Optional)
                                </label>
                                <input
                                  type="text"
                                  value={question.ratingConfig?.minLabel || ''}
                                  onChange={(e) => updateQuestion(question.id, 'ratingConfig', {
                                    ...question.ratingConfig,
                                    minLabel: e.target.value
                                  })}
                                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 transition-all text-gray-900 font-semibold"
                                  placeholder="e.g., Poor, Strongly Disagree"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-2">
                                  High End Label (Optional)
                                </label>
                                <input
                                  type="text"
                                  value={question.ratingConfig?.maxLabel || ''}
                                  onChange={(e) => updateQuestion(question.id, 'ratingConfig', {
                                    ...question.ratingConfig,
                                    maxLabel: e.target.value
                                  })}
                                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 transition-all text-gray-900 font-semibold"
                                  placeholder="e.g., Excellent, Strongly Agree"
                                />
                              </div>
                            </div>
                            <div className="mt-4 p-4 bg-white rounded-xl border border-orange-200">
                              <p className="text-xs font-semibold text-gray-600 mb-2">Preview:</p>
                              <div className="flex items-center justify-between mb-2 text-xs text-gray-500">
                                <span>{question.ratingConfig?.minLabel || `${question.ratingConfig?.min || 1}`}</span>
                                <span>{question.ratingConfig?.maxLabel || `${question.ratingConfig?.max || 5}`}</span>
                              </div>
                              <div className="flex justify-center space-x-2">
                                {Array.from({ length: (question.ratingConfig?.max || 5) - (question.ratingConfig?.min || 1) + 1 }, (_, i) => (
                                  <div
                                    key={i}
                                    className="w-8 h-8 border-2 border-orange-300 rounded-lg flex items-center justify-center text-xs font-bold bg-orange-50 text-orange-600"
                                  >
                                    {(question.ratingConfig?.min || 1) + i}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Required toggle */}
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <label htmlFor={`required-${question.id}`} className="text-sm font-semibold text-gray-700">
                            Required Question
                          </label>
                          <p className="text-xs text-gray-500">Respondents must answer this question</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            id={`required-${question.id}`}
                            checked={question.required}
                            onChange={(e) => updateQuestion(question.id, 'required', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div>
                <h3 className="font-semibold text-gray-900">Ready to launch?</h3>
                <p className="text-sm text-gray-600">Your survey will be live and ready to collect responses</p>
              </div>
              <div className="flex space-x-4">
                <Link
                  href="/"
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-2xl hover:border-gray-400 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim() || questions.length === 0}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-2xl hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300"
                >
                  {isSubmitting ? (
                    <span className="flex items-center space-x-2">
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Creating...</span>
                    </span>
                  ) : (
                    'Create Survey'
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreateSurvey() {
  return (
    <AuthGuard>
      <CreateSurveyContent />
    </AuthGuard>
  );
}