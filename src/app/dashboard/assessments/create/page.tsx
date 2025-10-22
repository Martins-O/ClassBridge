'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';

interface Question {
  id: string;
  type: 'rating' | 'text' | 'multiple-choice' | 'checkbox' | 'scale';
  question: string;
  description?: string;
  options?: string[];
  required: boolean;
  weight?: number;
  category?: string;
}

interface School {
  _id: string;
  name: string;
}

interface Class {
  _id: string;
  name: string;
  subject?: string;
}

function CreateAssessmentContent() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);

  // Assessment basic info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [assessmentType, setAssessmentType] = useState<'peer' | 'mentor_to_student' | 'student_to_mentor' | 'self'>('mentor_to_student');
  const [targetRole, setTargetRole] = useState<'mentor' | 'student'>('student');
  const [assessorRole, setAssessorRole] = useState<'mentor' | 'student' | 'self'>('mentor');

  // Assessment settings
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [timeLimit, setTimeLimit] = useState('');
  const [passingScore, setPassingScore] = useState('');

  // Questions
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    id: '',
    type: 'rating',
    question: '',
    description: '',
    options: [],
    required: true,
    weight: 1,
    category: ''
  });

  useEffect(() => {
    fetchSchoolsAndClasses();
  }, []);

  useEffect(() => {
    // Update roles based on assessment type
    switch (assessmentType) {
      case 'mentor_to_student':
        setTargetRole('student');
        setAssessorRole('mentor');
        break;
      case 'student_to_mentor':
        setTargetRole('mentor');
        setAssessorRole('student');
        break;
      case 'peer':
        setTargetRole('student');
        setAssessorRole('student');
        break;
      case 'self':
        setTargetRole('student');
        setAssessorRole('self');
        break;
    }
  }, [assessmentType]);

  const fetchSchoolsAndClasses = async () => {
    try {
      const [schoolsRes, classesRes] = await Promise.all([
        fetch('/api/schools'),
        fetch('/api/classes')
      ]);

      if (schoolsRes.ok) {
        const schoolsData = await schoolsRes.json();
        setSchools(schoolsData.schools);
      }

      if (classesRes.ok) {
        const classesData = await classesRes.json();
        setClasses(classesData.classes);
      }
    } catch {
    }
  };

  const addQuestion = () => {
    if (!currentQuestion.question.trim()) return;

    const question: Question = {
      ...currentQuestion,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };

    setQuestions([...questions, question]);
    setCurrentQuestion({
      id: '',
      type: 'rating',
      question: '',
      description: '',
      options: [],
      required: true,
      weight: 1,
      category: ''
    });
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const addOption = () => {
    setCurrentQuestion({
      ...currentQuestion,
      options: [...(currentQuestion.options || []), '']
    });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(currentQuestion.options || [])];
    newOptions[index] = value;
    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions
    });
  };

  const removeOption = (index: number) => {
    const newOptions = (currentQuestion.options || []).filter((_, i) => i !== index);
    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions
    });
  };

  const handleSubmit = async () => {
    if (!title || !description || questions.length === 0 || !schoolId) {
      alert('Please fill in all required fields and add at least one question');
      return;
    }

    setLoading(true);

    try {
      const assessmentData = {
        title,
        description,
        questions,
        schoolId,
        classIds: selectedClassIds,
        targetRole,
        assessorRole,
        assessmentType,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        maxAttempts: maxAttempts || 1,
        timeLimit: timeLimit ? parseInt(timeLimit) : undefined,
        passingScore: passingScore ? parseFloat(passingScore) : undefined
      };

      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assessmentData),
      });

      if (response.ok) {
        router.push('/dashboard/assessments');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to create assessment');
      }
    } catch {
      alert('An error occurred while creating the assessment');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Assessment Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Enter assessment title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Describe the purpose and instructions for this assessment"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Assessment Type *
              </label>
              <select
                value={assessmentType}
                onChange={(e) => setAssessmentType(e.target.value as 'peer' | 'mentor_to_student' | 'student_to_mentor' | 'self')}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="mentor_to_student">Mentor evaluating Student</option>
                <option value="student_to_mentor">Student evaluating Mentor</option>
                <option value="peer">Peer Assessment (Student to Student)</option>
                <option value="self">Self Assessment</option>
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  School *
                </label>
                <select
                  value={schoolId}
                  onChange={(e) => setSchoolId(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select a school</option>
                  {schools.map((school) => (
                    <option key={school._id} value={school._id}>
                      {school.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Classes (Optional)
                </label>
                <select
                  multiple
                  value={selectedClassIds}
                  onChange={(e) => setSelectedClassIds(Array.from(e.target.selectedOptions, option => option.value))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                  size={4}
                >
                  {classes
                    .filter(cls => !schoolId || cls._id === schoolId)
                    .map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name} {cls.subject && `(${cls.subject})`}
                      </option>
                    ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple classes</p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  End Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Max Attempts
                </label>
                <input
                  type="number"
                  min="1"
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Time Limit (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="No limit"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Passing Score (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={passingScore}
                  onChange={(e) => setPassingScore(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="No requirement"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Add Question Form */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Question</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Question Type
                    </label>
                    <select
                      value={currentQuestion.type}
                      onChange={(e) => setCurrentQuestion({
                        ...currentQuestion,
                        type: e.target.value as 'multiple-choice' | 'checkbox' | 'text' | 'rating' | 'scale',
                        options: ['multiple-choice', 'checkbox'].includes(e.target.value) ? [''] : []
                      })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="rating">Rating Scale</option>
                      <option value="scale">Numeric Scale</option>
                      <option value="multiple-choice">Multiple Choice</option>
                      <option value="checkbox">Checkbox (Multiple Select)</option>
                      <option value="text">Text Response</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category (Optional)
                    </label>
                    <input
                      type="text"
                      value={currentQuestion.category || ''}
                      onChange={(e) => setCurrentQuestion({
                        ...currentQuestion,
                        category: e.target.value
                      })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="e.g., Communication, Technical Skills"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Question Text *
                  </label>
                  <textarea
                    value={currentQuestion.question}
                    onChange={(e) => setCurrentQuestion({
                      ...currentQuestion,
                      question: e.target.value
                    })}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Enter your question"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={currentQuestion.description || ''}
                    onChange={(e) => setCurrentQuestion({
                      ...currentQuestion,
                      description: e.target.value
                    })}
                    rows={2}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Additional instructions or context"
                  />
                </div>

                {['multiple-choice', 'checkbox'].includes(currentQuestion.type) && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Options *
                    </label>
                    <div className="space-y-2">
                      {(currentQuestion.options || []).map((option, index) => (
                        <div key={index} className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateOption(index, e.target.value)}
                            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500 min-h-11"
                            placeholder={`Option ${index + 1}`}
                          />
                          <button
                            type="button"
                            onClick={() => removeOption(index)}
                            className="w-full sm:w-auto px-3 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 active:bg-red-300 min-h-11 touch-manipulation"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addOption}
                        className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-indigo-300 hover:text-indigo-600 min-h-11 touch-manipulation"
                      >
                        + Add Option
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={currentQuestion.required}
                        onChange={(e) => setCurrentQuestion({
                          ...currentQuestion,
                          required: e.target.checked
                        })}
                        className="rounded"
                      />
                      <span className="text-sm font-semibold text-gray-700">Required Question</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Weight
                    </label>
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={currentQuestion.weight || 1}
                      onChange={(e) => setCurrentQuestion({
                        ...currentQuestion,
                        weight: parseFloat(e.target.value) || 1
                      })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addQuestion}
                  className="w-full min-h-11 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 touch-manipulation"
                >
                  Add Question
                </button>
              </div>
            </div>

            {/* Questions List */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Questions ({questions.length})
              </h3>

              {questions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No questions added yet. Add your first question above.
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <div key={question.id} className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="flex flex-col sm:flex-row justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center flex-wrap gap-2 mb-2">
                            <span className="text-sm font-medium text-indigo-600">Q{index + 1}</span>
                            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{question.type}</span>
                            {question.category && (
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                {question.category}
                              </span>
                            )}
                            {question.required && (
                              <span className="text-xs text-red-600">Required</span>
                            )}
                            <span className="text-xs text-gray-500">Weight: {question.weight}</span>
                          </div>
                          <p className="font-medium text-gray-900 mb-1">{question.question}</p>
                          {question.description && (
                            <p className="text-sm text-gray-600 mb-2">{question.description}</p>
                          )}
                          {question.options && question.options.length > 0 && (
                            <div className="text-sm text-gray-600">
                              Options: {question.options.join(', ')}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => removeQuestion(question.id)}
                          className="w-full sm:w-auto sm:ml-4 min-h-11 px-4 py-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 active:bg-red-300 text-sm touch-manipulation"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Create Assessment
            </h1>
            <p className="text-xl text-gray-600">Build a new assessment for your students</p>
          </div>
          <Link
            href="/dashboard/assessments"
            className="bg-white/80 text-gray-700 px-4 py-2 rounded-xl font-medium hover:bg-white hover:shadow-lg transition-all duration-300 border border-gray-200"
          >
            ← Back to Assessments
          </Link>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= stepNumber
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-16 h-1 ${
                    step > stepNumber ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mb-4">
          <div className="text-sm text-gray-600">
            {step === 1 && 'Basic Information'}
            {step === 2 && 'Assessment Settings'}
            {step === 3 && 'Questions'}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20">
          {renderStep()}

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-11 touch-manipulation"
            >
              Previous
            </button>

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 min-h-11 touch-manipulation"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || questions.length === 0}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-h-11 touch-manipulation"
              >
                {loading ? 'Creating...' : 'Create Assessment'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreateAssessment() {
  return (
    <AuthGuard>
      <CreateAssessmentContent />
    </AuthGuard>
  );
}
