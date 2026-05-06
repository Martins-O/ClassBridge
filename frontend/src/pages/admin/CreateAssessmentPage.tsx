import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, ArrowLeft, ClipboardList, Settings2, Clock, CheckCircle2, Shield, Percent, Target, Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { assessmentService, classService } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils';
import type { Class, IAssessmentQuestion } from '@/types';

type QuestionType = 'rating' | 'text' | 'multiple-choice' | 'checkbox' | 'scale';

interface LocalQuestion {
  id: string;
  type: QuestionType;
  question: string;
  description: string;
  options: string[];
  required: boolean;
  weight: number;
  category: string;
}

const questionTypes: { value: QuestionType; label: string; description: string }[] = [
  { value: 'rating', label: 'Rating', description: 'Numeric rating (1-5 scale)' },
  { value: 'scale', label: 'Scale', description: 'Linear scale (e.g. 1-10)' },
  { value: 'multiple-choice', label: 'Multiple Choice', description: 'Single correct option' },
  { value: 'checkbox', label: 'Checkbox', description: 'Multiple selections allowed' },
  { value: 'text', label: 'Text Response', description: 'Open-ended text answer' },
];

function createEmptyQuestion(): LocalQuestion {
  return {
    id: crypto.randomUUID(),
    type: 'text',
    question: '',
    description: '',
    options: [],
    required: true,
    weight: 1,
    category: '',
  };
}

export function CreateAssessmentPage() {
  const navigate = useNavigate();
  const getSchoolId = useAuthStore((state) => state.getSchoolId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [targetRole, setTargetRole] = useState<'mentor' | 'student'>('student');
  const [assessorRole, setAssessorRole] = useState<'mentor' | 'student' | 'self'>('self');
  const [assessmentType, setAssessmentType] = useState<'peer' | 'mentor_to_student' | 'student_to_mentor' | 'self'>('self');
  const [passingScore, setPassingScore] = useState('70');
  const [maxAttempts, setMaxAttempts] = useState('1');
  const [timeLimit, setTimeLimit] = useState('60');

  const [classes, setClasses] = useState<Class[]>([]);
  const [questions, setQuestions] = useState<LocalQuestion[]>([createEmptyQuestion()]);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const schoolId = getSchoolId();
        const { data } = await classService.getAll({ schoolId, limit: 100 });
        setClasses((data as any)?.data || []);
      } catch (err) {
        console.error('Failed to fetch classes:', err);
      } finally {
        setIsFetching(false);
      }
    }
    fetchData();
  }, [getSchoolId]);

  const toggleQuestionExpand = (id: string) => {
    setExpandedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const updateQuestion = (id: string, updates: Partial<LocalQuestion>) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const addQuestion = () => {
    const newQ = createEmptyQuestion();
    setQuestions(prev => [...prev, newQ]);
    setExpandedQuestions(prev => new Set([...prev, newQ.id]));
  };

  const removeQuestion = (id: string) => {
    if (questions.length <= 1) return;
    setQuestions(prev => prev.filter(q => q.id !== id));
    setExpandedQuestions(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const addOption = (questionId: string) => {
    setQuestions(prev =>
      prev.map(q => q.id === questionId ? { ...q, options: [...q.options, ''] } : q)
    );
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(prev =>
      prev.map(q => q.id === questionId ? { ...q, options: q.options.filter((_, i) => i !== optionIndex) } : q)
    );
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(prev =>
      prev.map(q => q.id === questionId ? { ...q, options: q.options.map((o, i) => i === optionIndex ? value : o) } : q)
    );
  };

  const moveQuestion = (fromIndex: number, toIndex: number) => {
    setQuestions(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim()) return setError('Assessment title is required.');
    if (!description.trim()) return setError('Instructions are required.');
    if (selectedClasses.length === 0) return setError('Please select at least one target class.');
    if (questions.length === 0) return setError('At least one question is required.');

    const invalidQuestion = questions.find(q => !q.question.trim());
    if (invalidQuestion) return setError('All questions must have text.');

    const invalidOptions = questions.find(q =>
      (q.type === 'multiple-choice' || q.type === 'checkbox') &&
      (q.options.length < 2 || q.options.some(o => !o.trim()))
    );
    if (invalidOptions) return setError('Multiple-choice and checkbox questions need at least 2 options.');

    setIsLoading(true);
    try {
      const schoolId = getSchoolId();
      const apiQuestions: IAssessmentQuestion[] = questions.map(q => ({
        id: q.id,
        type: q.type,
        question: q.question.trim(),
        description: q.description.trim() || undefined,
        options: q.options.length > 0 ? q.options.map(o => o.trim()).filter(Boolean) : undefined,
        required: q.required,
        weight: q.weight || 1,
        category: q.category.trim() || undefined,
      }));

      const { data } = await assessmentService.create({
        title: title.trim(),
        description: description.trim(),
        schoolId,
        classIds: selectedClasses,
        targetRole,
        assessorRole,
        assessmentType,
        questions: apiQuestions,
        passingScore: parseInt(passingScore),
        maxAttempts: parseInt(maxAttempts),
        timeLimit: parseInt(timeLimit),
      });

      if ((data as any).success) {
        setSuccess('Assessment created and published!');
        setTimeout(() => navigate('/assessments'), 1500);
      } else {
        setError((data as any).error || 'Failed to create assessment.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to create assessment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-[#064e3b]" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/60 -m-6 p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
          <button onClick={() => navigate('/assessments')} className="flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">New Assessment</h1>
            <p className="text-sm text-slate-500 font-medium">Create and publish an evaluation for your students.</p>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Main Info Card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Assessment Scope</span>
            </div>
            <div className="p-6 space-y-5">
              <AnimatePresence>
                {error && (
                  <motion.div key="err" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                    <Shield className="w-4 h-4 mt-0.5 shrink-0" /><span>{error}</span>
                  </motion.div>
                )}
                {success && (
                  <motion.div key="ok" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /><span>{success}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1.5">
                <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Title *</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Mid-term Physics Examination" className="h-11 rounded-xl border-slate-200 font-medium" required />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Target Classes *</Label>
                <div className="space-y-2">
                  {classes.map(cls => (
                    <label key={cls._id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                      <Checkbox
                        checked={selectedClasses.includes(cls._id)}
                        onCheckedChange={checked => {
                          setSelectedClasses(prev =>
                            checked ? [...prev, cls._id] : prev.filter(id => id !== cls._id)
                          );
                        }}
                      />
                      <div>
                        <span className="font-medium text-sm">{cls.name}</span>
                        <span className="text-xs text-slate-400 ml-2">({cls.cohort})</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Instructions *</Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Provide instructions or background for students..."
                  className="rounded-xl min-h-[110px] border-slate-200 font-medium"
                  required
                />
              </div>
            </div>
          </motion.div>

          {/* Assessment Type Card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <Target className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Assessment Type</span>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Target Role</Label>
                <Select value={targetRole} onValueChange={v => setTargetRole(v as any)}>
                  <SelectTrigger className="h-11 rounded-xl border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="mentor">Mentor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Assessor Role</Label>
                <Select value={assessorRole} onValueChange={v => setAssessorRole(v as any)}>
                  <SelectTrigger className="h-11 rounded-xl border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="self">Self</SelectItem>
                    <SelectItem value="mentor">Mentor</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Assessment Type</Label>
                <Select value={assessmentType} onValueChange={v => setAssessmentType(v as any)}>
                  <SelectTrigger className="h-11 rounded-xl border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="self">Self Assessment</SelectItem>
                    <SelectItem value="peer">Peer Assessment</SelectItem>
                    <SelectItem value="mentor_to_student">Mentor to Student</SelectItem>
                    <SelectItem value="student_to_mentor">Student to Mentor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>

          {/* Configuration Card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Performance Rules</span>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Passing Score (%)</Label>
                <div className="relative group">
                  <Input type="number" min="0" max="100" value={passingScore} onChange={e => setPassingScore(e.target.value)}
                    className="h-11 rounded-xl border-slate-200 font-black pr-10 focus:ring-[#064e4b]/10" />
                  <Percent className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Max Attempts</Label>
                <div className="relative">
                  <Input type="number" min="1" max="10" value={maxAttempts} onChange={e => setMaxAttempts(e.target.value)}
                    className="h-11 rounded-xl border-slate-200 font-black" />
                  <Target className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Time Limit (Minutes)</Label>
                <div className="relative">
                  <Input type="number" min="1" max="480" value={timeLimit} onChange={e => setTimeLimit(e.target.value)}
                    className="h-11 rounded-xl border-slate-200 font-black pl-10" />
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Questions Card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Questions ({questions.length}/50)</span>
              </div>
              <button
                type="button"
                onClick={addQuestion}
                disabled={questions.length >= 50}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-bold bg-[#064e3b] text-white hover:bg-[#065f46] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Question
              </button>
            </div>
            <div className="p-6 space-y-4">
              {questions.map((q, index) => (
                <motion.div
                  key={q.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border border-slate-200 rounded-xl overflow-hidden"
                >
                  {/* Question Header */}
                  <div className="flex items-center gap-3 p-4 bg-slate-50/50 border-b border-slate-100">
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-200 text-xs font-black text-slate-600">
                      {index + 1}
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleQuestionExpand(q.id)}
                      className="flex-1 text-left font-bold text-sm text-slate-700 truncate"
                    >
                      {q.question || 'Untitled question'}
                      <span className="ml-2 text-xs font-normal text-slate-400">
                        — {questionTypes.find(t => t.value === q.type)?.label}
                        {q.required && ' • Required'}
                      </span>
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveQuestion(index, index - 1)}
                        disabled={index === 0}
                        className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-30 transition-colors"
                      >
                        <ChevronUp className="w-4 h-4 text-slate-500" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveQuestion(index, index + 1)}
                        disabled={index === questions.length - 1}
                        className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-30 transition-colors"
                      >
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeQuestion(q.id)}
                        disabled={questions.length <= 1}
                        className="p-1.5 rounded-lg hover:bg-red-100 disabled:opacity-30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleQuestionExpand(q.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        {expandedQuestions.has(q.id) ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                      </button>
                    </div>
                  </div>

                  {/* Question Body */}
                  {expandedQuestions.has(q.id) && (
                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 sm:col-span-2">
                          <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Question Type</Label>
                          <Select value={q.type} onValueChange={v => updateQuestion(q.id, { type: v as QuestionType, options: ['multiple-choice', 'checkbox'].includes(v) ? ['', ''] : [] })}>
                            <SelectTrigger className="h-11 rounded-xl border-slate-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              {questionTypes.map(t => (
                                <SelectItem key={t.value} value={t.value}>
                                  {t.label}
                                  <span className="text-xs text-slate-400 ml-2">{t.description}</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5 sm:col-span-2">
                          <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Question Text *</Label>
                          <Input
                            value={q.question}
                            onChange={e => updateQuestion(q.id, { question: e.target.value })}
                            placeholder="Enter your question here..."
                            className="h-11 rounded-xl border-slate-200 font-medium"
                            required
                          />
                        </div>

                        <div className="space-y-1.5 sm:col-span-2">
                          <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Description (Optional)</Label>
                          <Input
                            value={q.description}
                            onChange={e => updateQuestion(q.id, { description: e.target.value })}
                            placeholder="Hint or additional context..."
                            className="h-11 rounded-xl border-slate-200 font-medium"
                          />
                        </div>

                        {['multiple-choice', 'checkbox'].includes(q.type) && (
                          <div className="space-y-2 sm:col-span-2">
                            <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Options *</Label>
                            {q.options.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center text-xs font-bold text-slate-400 flex-shrink-0">
                                  {q.type === 'multiple-choice' ? String.fromCharCode(65 + optIndex) : optIndex + 1}
                                </span>
                                <Input
                                  value={option}
                                  onChange={e => updateOption(q.id, optIndex, e.target.value)}
                                  placeholder={`Option ${optIndex + 1}`}
                                  className="h-10 rounded-xl border-slate-200 text-sm"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeOption(q.id, optIndex)}
                                  disabled={q.options.length <= 2}
                                  className="p-2 rounded-lg hover:bg-red-100 disabled:opacity-30 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => addOption(q.id)}
                              className="flex items-center gap-1.5 text-xs font-bold text-[#064e3b] hover:text-[#065f46] mt-1"
                            >
                              <Plus className="w-3 h-3" /> Add Option
                            </button>
                          </div>
                        )}

                        <div className="space-y-1.5">
                          <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Weight</Label>
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            value={q.weight}
                            onChange={e => updateQuestion(q.id, { weight: parseInt(e.target.value) || 1 })}
                            className="h-11 rounded-xl border-slate-200 font-medium"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Category</Label>
                          <Input
                            value={q.category}
                            onChange={e => updateQuestion(q.id, { category: e.target.value })}
                            placeholder="e.g. technical"
                            className="h-11 rounded-xl border-slate-200 font-medium"
                          />
                        </div>

                        <div className="flex items-center gap-3 sm:col-span-2 pt-2">
                          <Checkbox
                            id={`required-${q.id}`}
                            checked={q.required}
                            onCheckedChange={checked => updateQuestion(q.id, { required: !!checked })}
                          />
                          <Label htmlFor={`required-${q.id}`} className="text-sm font-bold text-slate-700 cursor-pointer">
                            Required
                          </Label>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Submit */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <button type="submit" disabled={isLoading || !!success}
              className={cn('w-full h-14 flex items-center justify-center gap-3 rounded-2xl font-black text-base transition-all duration-200 bg-[#064e3b] hover:bg-[#065f46] text-white shadow-xl shadow-emerald-900/20 disabled:opacity-60 disabled:cursor-not-allowed', !isLoading && !success && 'hover:-translate-y-0.5 active:translate-y-0')}>
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : success ? <><CheckCircle2 className="w-5 h-5" /> Published!</> : <><ClipboardList className="w-5 h-5" /> Create & Publish Assessment</>}
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}

export default CreateAssessmentPage;
