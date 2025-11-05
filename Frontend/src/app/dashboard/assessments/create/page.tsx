'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import Footer from '@/components/Footer';
import { PageShell } from '@/components/ui/PageShell';
import { GradientHeader } from '@/components/ui/GradientHeader';
import { Card } from '@/components/ui/Card';
import { Button, buttonClasses } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

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

interface ClassSummary {
  _id: string;
  name: string;
  subject?: string;
}

const INITIAL_QUESTION: Question = {
  id: '',
  type: 'rating',
  question: '',
  description: '',
  options: [],
  required: true,
  weight: 1,
  category: '',
};

function CreateAssessmentContent() {
  const router = useRouter();
  const { pushToast } = useToast();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [classes, setClasses] = useState<ClassSummary[]>([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [assessmentType, setAssessmentType] = useState<'peer' | 'mentor_to_student' | 'student_to_mentor' | 'self'>('mentor_to_student');
  const [targetRole, setTargetRole] = useState<'mentor' | 'student'>('student');
  const [assessorRole, setAssessorRole] = useState<'mentor' | 'student' | 'self'>('mentor');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [timeLimit, setTimeLimit] = useState('');
  const [passingScore, setPassingScore] = useState('');

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question>(INITIAL_QUESTION);

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [schoolsRes, classesRes] = await Promise.all([fetch('/api/schools'), fetch('/api/classes')]);
        if (schoolsRes.ok) {
          const schoolsData = await schoolsRes.json();
          setSchools(schoolsData.schools || []);
        }
        if (classesRes.ok) {
          const classesData = await classesRes.json();
          setClasses(classesData.classes || []);
        }
      } catch {
        pushToast({ title: 'Unable to load options', intent: 'warning' });
      }
    };
    fetchLookups();
  }, [pushToast]);

  useEffect(() => {
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

  const addQuestion = () => {
    if (!currentQuestion.question.trim()) {
      pushToast({ title: 'Question text is required', intent: 'warning' });
      return;
    }
    if ((currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'checkbox') && (!currentQuestion.options || currentQuestion.options.filter(Boolean).length < 2)) {
      pushToast({ title: 'Add at least two options', intent: 'warning' });
      return;
    }

    setQuestions((prev) => [
      ...prev,
      {
        ...currentQuestion,
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        options: currentQuestion.options?.filter(Boolean),
      },
    ]);
    setCurrentQuestion(INITIAL_QUESTION);
  };

  const removeQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((question) => question.id !== id));
  };

  const updateCurrentOption = (index: number, value: string) => {
    const options = [...(currentQuestion.options || [])];
    options[index] = value;
    setCurrentQuestion((prev) => ({ ...prev, options }));
  };

  const addOption = () => {
    setCurrentQuestion((prev) => ({ ...prev, options: [...(prev.options || []), ''] }));
  };

  const removeOption = (index: number) => {
    setCurrentQuestion((prev) => ({
      ...prev,
      options: (prev.options || []).filter((_, idx) => idx !== index),
    }));
  };

  const canPreview = useMemo(() => title && description && questions.length > 0 && schoolId, [title, description, questions, schoolId]);

  const handleSubmit = async () => {
    if (!canPreview) {
      pushToast({ title: 'Complete required fields and questions', intent: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
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
        passingScore: passingScore ? parseFloat(passingScore) : undefined,
      };
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        pushToast({ title: 'Assessment created', intent: 'success' });
        router.push('/dashboard/assessments');
      } else {
        const errorData = await response.json();
        pushToast({ title: errorData.error || 'Failed to create assessment', intent: 'danger' });
      }
    } catch {
      pushToast({ title: 'Failed to create assessment', description: 'Please try again later.', intent: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const stepHeader = useMemo(() => {
    switch (step) {
      case 1:
        return 'Describe your assessment';
      case 2:
        return 'Configure settings';
      case 3:
        return 'Design questions';
      default:
        return 'Review assessment';
    }
  }, [step]);

  return (
    <PageShell>
      <GradientHeader
        title="Create assessment"
        description="Design targeted assessments in a few guided steps."
        action={<Link href="/dashboard/assessments" className={buttonClasses({ variant: 'ghost' })}>Back to assessments</Link>}
      />

      <section className="mt-10 grid gap-6 lg:grid-cols-[1fr,2fr]">
        <Card className="border border-white/40 p-6">
          <h2 className="text-lg font-semibold text-ink-900">Progress</h2>
          <div className="mt-4 space-y-2 text-sm">
            {[1, 2, 3, 4].map((value) => (
              <button
                key={value}
                onClick={() => setStep(value)}
                className={`flex w-full items-center justify-between rounded-xl border border-white/30 px-4 py-3 text-left transition ${
                  step === value ? 'bg-brand-500/10 text-brand-700 shadow-glass' : 'bg-white/80 text-ink-500'
                }`}
              >
                <span>Step {value}</span>
                <span className="text-xs uppercase tracking-wide">{value < step ? 'Completed' : value === step ? 'Current' : 'Pending'}</span>
              </button>
            ))}
          </div>
        </Card>

        <Card className="border border-white/40 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink-900">{stepHeader}</h2>
            <span className="text-sm text-ink-400">Step {step} of 4</span>
          </div>

          <div className="mt-6 space-y-6">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-ink-500">Title *</label>
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Leadership feedback"
                    className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-ink-500">Description *</label>
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={4}
                    placeholder="Explain the purpose and expectations for participants."
                    className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-ink-500">School *</label>
                  <select
                    value={schoolId}
                    onChange={(event) => setSchoolId(event.target.value)}
                    className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
                  >
                    <option value="">Select school</option>
                    {schools.map((school) => (
                      <option key={school._id} value={school._id}>
                        {school.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-ink-500">Attach classes</label>
                  <div className="flex flex-wrap gap-2">
                    {classes.map((cls) => {
                      const selected = selectedClassIds.includes(cls._id);
                      return (
                        <button
                          key={cls._id}
                          onClick={() =>
                            setSelectedClassIds((prev) =>
                              selected ? prev.filter((id) => id !== cls._id) : [...prev, cls._id]
                            )
                          }
                          className={buttonClasses({
                            variant: selected ? 'primary' : 'secondary',
                            size: 'sm',
                          })}
                          type="button"
                        >
                          {cls.name}
                        </button>
                      );
                    })}
                    {classes.length === 0 ? <p className="text-sm text-ink-400">No classes available.</p> : null}
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-ink-500">Assessment type</label>
                    <select
                      value={assessmentType}
                      onChange={(event) => setAssessmentType(event.target.value as typeof assessmentType)}
                      className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
                    >
                      <option value="mentor_to_student">Mentor → student</option>
                      <option value="student_to_mentor">Student → mentor</option>
                      <option value="peer">Peer</option>
                      <option value="self">Self</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-ink-500">Max attempts</label>
                    <input
                      type="number"
                      min={1}
                      value={maxAttempts}
                      onChange={(event) => setMaxAttempts(Number(event.target.value))}
                      className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-ink-500">Start date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(event) => setStartDate(event.target.value)}
                      className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-ink-500">End date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(event) => setEndDate(event.target.value)}
                      className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-ink-500">Time limit (minutes)</label>
                    <input
                      type="number"
                      min={0}
                      value={timeLimit}
                      onChange={(event) => setTimeLimit(event.target.value)}
                      className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-ink-500">Passing score (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={passingScore}
                    onChange={(event) => setPassingScore(event.target.value)}
                    className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
                  />
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-ink-500">Question *</label>
                  <input
                    value={currentQuestion.question}
                    onChange={(event) => setCurrentQuestion((prev) => ({ ...prev, question: event.target.value }))}
                    placeholder="How would you rate the session?"
                    className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-ink-500">Question type</label>
                    <select
                      value={currentQuestion.type}
                      onChange={(event) => setCurrentQuestion((prev) => ({ ...prev, type: event.target.value as Question['type'], options: event.target.value === 'multiple-choice' || event.target.value === 'checkbox' ? prev.options : [] }))}
                      className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
                    >
                      <option value="rating">Rating scale</option>
                      <option value="text">Open text</option>
                      <option value="multiple-choice">Multiple choice</option>
                      <option value="checkbox">Checkbox</option>
                      <option value="scale">Linear scale</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-ink-500">Required</label>
                    <select
                      value={currentQuestion.required ? 'yes' : 'no'}
                      onChange={(event) => setCurrentQuestion((prev) => ({ ...prev, required: event.target.value === 'yes' }))}
                      className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
                    >
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </div>
                {(currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'checkbox') && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-ink-500">Options</p>
                    {(currentQuestion.options || []).map((option, index) => (
                      <div key={`${currentQuestion.id}-option-${index}`} className="flex items-center gap-2">
                        <input
                          value={option}
                          onChange={(event) => updateCurrentOption(index, event.target.value)}
                          placeholder={`Option ${index + 1}`}
                          className="flex-1 rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className={buttonClasses({ variant: 'ghost', size: 'sm' })}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <Button variant="secondary" size="sm" onClick={addOption}>
                      Add option
                    </Button>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Button onClick={addQuestion}>Add question</Button>
                  <Button variant="ghost" size="sm" onClick={() => setCurrentQuestion(INITIAL_QUESTION)}>
                    Reset
                  </Button>
                </div>
                <div className="space-y-3">
                  {questions.map((question) => (
                    <div key={question.id} className="rounded-xl border border-white/30 bg-white/80 px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-ink-800">{question.question}</p>
                          <p className="text-xs text-ink-400 capitalize">{question.type.replace('-', ' ')}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeQuestion(question.id)}
                          className={buttonClasses({ variant: 'ghost', size: 'sm' })}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  {questions.length === 0 ? <p className="text-sm text-ink-400">No questions yet.</p> : null}
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <p className="text-sm text-ink-500">Take a final look before publishing.</p>
                <div className="space-y-3 text-sm text-ink-600">
                  <p><strong>Title:</strong> {title}</p>
                  <p><strong>Description:</strong> {description}</p>
                  <p><strong>Type:</strong> {assessmentType}</p>
                  <p><strong>Questions:</strong> {questions.length}</p>
                </div>
              </>
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <Button variant="ghost" disabled={step === 1} onClick={() => setStep((prev) => Math.max(1, prev - 1))}>
              Previous
            </Button>
            {step < 4 ? (
              <Button onClick={() => setStep((prev) => Math.min(4, prev + 1))}>Next</Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Creating…' : 'Create assessment'}
              </Button>
            )}
          </div>
        </Card>
      </section>

      <Footer />
    </PageShell>
  );
}

export default function AssessmentCreatePage() {
  return (
    <AuthGuard>
      <CreateAssessmentContent />
    </AuthGuard>
  );
}
