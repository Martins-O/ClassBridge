'use client';

"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AssessmentLayout } from '@/components/ui/AssessmentLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import toast from 'react-hot-toast';
import { CheckCircle, Clock, AlertCircle, Save, ArrowLeft, ArrowRight, Check } from 'lucide-react';

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
  assessmentType: 'peer' | 'mentor_to_student' | 'student_to_mentor';
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

export function AssessmentTakeContent({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [attempt, setAttempt] = useState<AssessmentAttempt | null>(null);
  type Answer = {
    questionId: string;
    answer: any;
  };

  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visitedQuestions, setVisitedQuestions] = useState<Set<number>>(new Set([0]));
  const submitRef = useRef<(() => void) | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  const fetchAssessment = useCallback(async () => {
    try {
      const response = await fetch(`/api/assessments/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setAssessment(data.assessment);
        await startNewAttempt();
      } else {
        setError('Failed to load assessment');
      }
    } catch (err) {
      setError('An error occurred while loading the assessment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  const startNewAttempt = useCallback(async () => {
    try {
      const response = await fetch(`/api/assessments/${params.id}/attempts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAttempt(data.attempt);
      } else {
        throw new Error('Failed to start attempt');
      }
    } catch (err) {
      setError('Failed to start assessment attempt');
      console.error(err);
    }
  }, [params.id]);

  // Auto-save answers when they change
  const handleAnswerChange = useCallback((questionId: string, answer: any) => {
    setAnswers(prev => {
      const existingIndex = prev.findIndex(a => a.questionId === questionId);
      const newAnswers = existingIndex >= 0
        ? prev.map((a, i) => i === existingIndex ? { ...a, answer } : a)
        : [...prev, { questionId, answer }];
      
      // Auto-save with debounce
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(async () => {
        if (attempt?._id) {
          try {
            setSaving(true);
            await saveProgress();
            toast.success('Progress saved', { icon: <CheckCircle className="w-5 h-5 text-green-500" /> });
          } catch (err) {
            console.error('Failed to save progress:', err);
            toast.error('Failed to save progress');
          } finally {
            setSaving(false);
          }
        }
      }, 1000);
      
      return newAnswers;
    });
  }, [attempt?._id]);

  const navigateToQuestion = useCallback((index: number) => {
    if (!assessment) return;
    const newIndex = Math.max(0, Math.min(index, assessment.questions.length - 1));
    setCurrentQuestionIndex(newIndex);
    setVisitedQuestions(prev => new Set([...prev, newIndex]));
  }, [assessment]);

  const handlePrevious = useCallback(() => {
    navigateToQuestion(currentQuestionIndex - 1);
  }, [currentQuestionIndex, navigateToQuestion]);

  const handleNext = useCallback(() => {
    if (!assessment) return;
    
    // Validate current question if required
    const currentQuestion = assessment.questions[currentQuestionIndex];
    if (currentQuestion.required) {
      const answer = answers.find(a => a.questionId === currentQuestion.id);
      if (!answer?.answer || (Array.isArray(answer.answer) && answer.answer.length === 0)) {
        toast.error('This question is required');
        return;
      }
    }
    
    navigateToQuestion(currentQuestionIndex + 1);
  }, [assessment, currentQuestionIndex, answers, navigateToQuestion]);

  const saveProgress = useCallback(async () => {
    if (!attempt?._id) return;
    
    try {
      const response = await fetch(`/api/assessments/attempts/${attempt._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          isComplete: false,
          lastQuestion: currentQuestionIndex,
          timeSpent: assessment?.timeLimit ? (assessment.timeLimit * 60 - (timeRemaining || 0)) : undefined
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save progress');
      }
      
      return await response.json();
    } catch (err) {
      console.error('Save progress failed:', err);
      throw err;
    }
  }, [attempt?._id, answers, currentQuestionIndex, assessment?.timeLimit, timeRemaining]);

  const handleSubmit = useCallback(async () => {
    if (!attempt || !assessment) return;
    
    // Validate all required questions
    const unansweredRequired = assessment.questions.filter(q => 
      q.required && !answers.some(a => a.questionId === q.id && a.answer)
    );
    
    if (unansweredRequired.length > 0) {
      toast.error(`Please answer all required questions (${unansweredRequired.length} remaining)`);
      // Navigate to first unanswered required question
      const firstUnanswered = assessment.questions.findIndex(q => 
        unansweredRequired.some(uq => uq.id === q.id)
      );
      if (firstUnanswered >= 0) {
        setCurrentQuestionIndex(firstUnanswered);
      }
      return;
    }
    
    setSubmitting(true);
    try {
      const response = await fetch(`/api/assessments/attempts/${attempt._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          completedAt: new Date().toISOString(),
          isComplete: true,
          timeSpent: assessment.timeLimit ? (assessment.timeLimit * 60 - (timeRemaining || 0)) : undefined
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit assessment');
      }
      
      toast.success('Assessment submitted successfully!');
      router.push(`/assessment/${params.id}/result?attemptId=${attempt._id}`);
    } catch (err) {
      console.error('Submission failed:', err);
      toast.error('Failed to submit assessment. Please try again.');
      setSubmitting(false);
    }
  }, [attempt, assessment, answers, timeRemaining, params.id, router]);

  // Timer effect with warnings
  useEffect(() => {
    if (!assessment?.timeLimit || !attempt) return;

    const endTime = new Date(attempt.startedAt).getTime() + assessment.timeLimit * 60 * 1000;
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
      setTimeRemaining(remaining);
      
      // Show time warnings
      if (remaining === 300) { // 5 minutes left
        toast('5 minutes remaining!', {
          icon: <Clock className="w-5 h-5 text-yellow-500" />,
          duration: 5000
        });
      } else if (remaining === 60) { // 1 minute left
        toast('1 minute remaining!', {
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
          duration: 3000
        });
      } else if (remaining <= 0) {
        clearInterval(timer);
        toast('Time\'s up! Submitting your assessment...', {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />
        });
        submitRef.current?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [assessment, attempt]);

  // Initial data fetch and auto-save on unmount
  useEffect(() => {
    fetchAssessment();
    
    // Auto-save on window close or page unload
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (attempt?._id && answers.length > 0) {
        e.preventDefault();
        // Use sync XHR for reliable sending on page unload
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', `/api/assessments/attempts/${attempt._id}`, false);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({
          answers,
          isComplete: false,
          lastQuestion: currentQuestionIndex,
          timeSpent: assessment?.timeLimit ? (assessment.timeLimit * 60 - (timeRemaining || 0)) : undefined
        }));
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [fetchAssessment, attempt?._id, answers, currentQuestionIndex, assessment?.timeLimit, timeRemaining]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800">Loading Assessment</h2>
        <p className="text-gray-600 mt-2">Please wait while we prepare your assessment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Button 
              onClick={() => window.location.reload()}
              className="w-full"
              variant="outline"
            >
              Try Again
            </Button>
            <Button 
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Assessment not found
        </div>
      </div>
    );
  }

  const currentQuestion = assessment.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === (assessment.questions?.length || 0) - 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <AssessmentLayout title={assessment?.title || 'Assessment'}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar with question navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <div className="p-4 border-b">
                <h2 className="font-semibold text-lg">Questions</h2>
                <div className="text-sm text-gray-500 mt-1">
                  {currentQuestionIndex + 1} of {assessment.questions.length}
                </div>
              </div>
              
              <div className="p-4 grid grid-cols-5 gap-2">
                {assessment.questions.map((q, index) => {
                  const isCurrent = index === currentQuestionIndex;
                  const isAnswered = answers.some(a => a.questionId === q.id && a.answer);
                  const isVisited = visitedQuestions.has(index);
                  
                  return (
                    <button
                      key={q.id}
                      onClick={() => navigateToQuestion(index)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        isCurrent 
                          ? 'bg-blue-600 text-white' 
                          : isAnswered 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : isVisited
                              ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      aria-current={isCurrent ? 'step' : undefined}
                    >
                      {isAnswered ? <Check className="w-4 h-4" /> : index + 1}
                    </button>
                  );
                })}
              </div>
              
              {timeRemaining !== null && (
                <div className="p-4 border-t">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Time Remaining</span>
                    <span className="font-medium">
                      {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(timeRemaining / (assessment.timeLimit! * 60)) * 100}%`,
                        backgroundColor: timeRemaining < 300 ? '#ef4444' : '#2563eb' // Red if less than 5 minutes
                      }}
                    ></div>
                  </div>
                </div>
              )}
              
              <div className="p-4 border-t flex justify-between">
                <Button 
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0 || submitting}
                  variant="outline"
                  size="sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> Previous
                </Button>
                <Button 
                  onClick={isLastQuestion ? handleSubmit : handleNext}
                  disabled={submitting || (!isAnswerValid(currentQuestion, answers) && currentQuestion.required)}
                  className={isLastQuestion ? 'bg-green-600 hover:bg-green-700' : ''}
                  size="sm"
                >
                  {isLastQuestion ? (
                    submitting ? 'Submitting...' : 'Submit Assessment'
                  ) : (
                    <>
                      Next <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </Card>
            
            <div className="mt-4 text-center">
              <Button 
                onClick={saveProgress}
                disabled={saving || submitting}
                variant="ghost"
                size="sm"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                <Save className={`w-4 h-4 mr-1 ${saving ? 'animate-pulse' : ''}`} />
                {saving ? 'Saving...' : 'Save Progress'}
              </Button>
            </div>
          </div>
          
          {/* Main content */}
          <div className="lg:col-span-3">
            <Card className="mb-6">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{assessment.title}</h1>
                    {assessment.description && (
                      <p className="text-gray-600 mt-1">{assessment.description}</p>
                    )}
                  </div>
                  
                  <div className="bg-blue-50 text-blue-800 text-sm px-3 py-1 rounded-full">
                    {currentQuestion.required ? 'Required' : 'Optional'}
                  </div>
                </div>
                
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Question {currentQuestionIndex + 1}
                    </span>
                    {currentQuestion.weight && (
                      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                        {currentQuestion.weight} points
                      </span>
                    )}
                  </div>
                  
                  <h2 className="text-lg font-semibold text-gray-900">
                    {currentQuestion.question}
                  </h2>
                  
                  {currentQuestion.type === 'scale' && currentQuestion.min !== undefined && currentQuestion.max !== undefined && (
                    <div className="mt-2 text-sm text-gray-500">
                      {currentQuestion.min} (Lowest) - {currentQuestion.max} (Highest)
                    </div>
                  )}
                </div>
                
                <div className="space-y-6">
                  {renderQuestionInput(currentQuestion, answers, handleAnswerChange)}
                  
                  <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                    <Button 
                      onClick={handlePrevious}
                      disabled={currentQuestionIndex === 0 || submitting}
                      variant="outline"
                      className="lg:hidden"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" /> Previous
                    </Button>
                    
                    <div className="ml-auto">
                      <Button 
                        onClick={isLastQuestion ? handleSubmit : handleNext}
                        disabled={submitting || (!isAnswerValid(currentQuestion, answers) && currentQuestion.required)}
                        className={isLastQuestion ? 'bg-green-600 hover:bg-green-700' : ''}
                      >
                        {isLastQuestion ? (
                          submitting ? 'Submitting...' : 'Submit Assessment'
                        ) : (
                          <>
                            Next <ArrowRight className="w-4 h-4 ml-1" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Save status indicator */}
            <div className="text-center text-sm text-gray-500 mt-2">
              {saving ? (
                <span className="inline-flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                  Saving your progress...
                </span>
              ) : (
                <span className="inline-flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                  All progress is saved automatically
                </span>
              )}
            </div>
          </div>
        </div>
      </AssessmentLayout>
    </div>
  );
}

// Helper functions for rendering different question types
function renderQuestionInput(question: Question, answers: Answer[], onChange: (questionId: string, answer: any) => void) {
  const answer = answers.find(a => a.questionId === question.id)?.answer;
  
  switch (question.type) {
    case 'multiple-choice':
      return (
        <div className="space-y-2">
          {question.options?.map((option, index) => (
            <div key={index} className="flex items-center">
              <input
                type="radio"
                id={`option-${question.id}-${index}`}
                name={`question-${question.id}`}
                checked={answer === option}
                onChange={() => onChange(question.id, option)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label 
                htmlFor={`option-${question.id}-${index}`}
                className="ml-2 block text-gray-700"
              >
                {option}
              </label>
            </div>
          ))}
        </div>
      );
      
    case 'checkbox':
      const selectedOptions = Array.isArray(answer) ? answer as string[] : [];
      
      return (
        <div className="space-y-2">
          {question.options?.map((option, index) => (
            <div key={index} className="flex items-center">
              <input
                type="checkbox"
                id={`option-${question.id}-${index}`}
                checked={selectedOptions.includes(option)}
                onChange={(e) => {
                  const newValue = e.target.checked
                    ? [...selectedOptions, option]
                    : selectedOptions.filter(opt => opt !== option);
                  onChange(question.id, newValue);
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label 
                htmlFor={`option-${question.id}-${index}`}
                className="ml-2 block text-gray-700"
              >
                {option}
              </label>
            </div>
          ))}
        </div>
      );
      
    case 'text':
      return (
        <textarea
          value={answer as string || ''}
          onChange={(e) => onChange(question.id, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          rows={4}
        />
      );
      
    case 'rating':
      return (
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => onChange(question.id, rating)}
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                answer === rating 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {rating}
            </button>
          ))}
        </div>
      );
      
    case 'scale':
      const min = question.min || 1;
      const max = question.max || 10;
      
      return (
        <div className="w-full">
          <input
            type="range"
            min={min}
            max={max}
            value={answer as number || min}
            onChange={(e) => onChange(question.id, parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{min}</span>
            <span>{answer || min}</span>
            <span>{max}</span>
          </div>
        </div>
      );
      
    default:
      return null;
  }
}

// Helper function to validate answers
function isAnswerValid(question: Question, answers: Answer[]): boolean {
  if (!question.required) return true;
  
  const answer = answers.find(a => a.questionId === question.id)?.answer;
  if (answer === undefined || answer === null || answer === '') return false;
  if (Array.isArray(answer) && answer.length === 0) return false;
  
  return true;
}

// Add keyboard navigation for better accessibility
function useKeyboardNavigation() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target && 
          (e.target as HTMLElement).tagName.toLowerCase() === 'input' || 
          (e.target as HTMLElement).tagName.toLowerCase() === 'textarea' ||
          (e.target as HTMLElement).isContentEditable) {
        return; // Don't interfere with form inputs
      }
      
      if (e.key === 'ArrowLeft' || (e.key === 'p' && e.altKey)) {
        const prevButton = document.querySelector('button[aria-label="Previous question"]') as HTMLButtonElement;
        if (prevButton && !prevButton.disabled) {
          prevButton.click();
        }
      } else if (e.key === 'ArrowRight' || (e.key === 'n' && e.altKey)) {
        const nextButton = document.querySelector('button[aria-label="Next question"]') as HTMLButtonElement;
        if (nextButton && !nextButton.disabled) {
          nextButton.click();
        }
      } else if (e.key === 's' && e.altKey) {
        const saveButton = document.querySelector('button[aria-label="Save progress"]') as HTMLButtonElement;
        if (saveButton && !saveButton.disabled) {
          saveButton.click();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}

// Add this hook to your component
useKeyboardNavigation();
