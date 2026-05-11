import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowLeft, BookOpen, Calendar, Clock, Users, CheckCircle2, Shield, FileText } from 'lucide-react';
import { courseService, classService } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils';
import type { Class } from '@/types';

const durations = ['1 week', '2 weeks', '1 month', '2 months', '3 months', '6 months'];

function calculateEndDateFromDuration(start: string, dur: string): string {
  if (!start || !dur) return '';
  const date = new Date(start);
  const match = dur.match(/^(\d+)\s*(week|weeks|month|months)$/);
  if (!match) return '';
  const num = parseInt(match[1]);
  const unit = match[2];
  if (unit.startsWith('week')) {
    date.setDate(date.getDate() + num * 7);
  } else {
    date.setMonth(date.getMonth() + num);
  }
  return date.toISOString().split('T')[0];
}

function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function CreateCoursePage() {
  const navigate = useNavigate();
  const getSchoolId = useAuthStore((state) => state.getSchoolId);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [classId, setClassId] = useState('');
  const [subject, setSubject] = useState('');
  const [duration, setDuration] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [maxStudents, setMaxStudents] = useState('30');
  const [syllabus, setSyllabus] = useState('');

  const [classes, setClasses] = useState<Class[]>([]);
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

  useEffect(() => {
    if (!duration) return;
    if (startDate) {
      const calculated = calculateEndDateFromDuration(startDate, duration);
      if (calculated) setEndDate(calculated);
    } else {
      const today = todayString();
      setStartDate(today);
      const calculated = calculateEndDateFromDuration(today, duration);
      if (calculated) setEndDate(calculated);
    }
  }, [duration]);

  useEffect(() => {
    if (!startDate || !duration) return;
    const calculated = calculateEndDateFromDuration(startDate, duration);
    if (calculated) setEndDate(calculated);
  }, [startDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!name.trim()) return setError('Course name is required.');
    if (!classId) return setError('Please select a target class.');
    if (!duration) return setError('Please select a course duration.');
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return setError('Start date must be before end date.');
    }
    setIsLoading(true);
    try {
      const { data } = await courseService.create({
        name: name.trim(),
        description: description.trim() || undefined,
        classId,
        subject: subject.trim() || undefined,
        duration,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        maxStudents: parseInt(maxStudents) || 30,
        syllabus: syllabus.trim() || undefined,
      });
      if ((data as any).message || (data as any).course) {
        setSuccess('Course created successfully!');
        setTimeout(() => navigate('/courses'), 1500);
      } else {
        setError((data as any).error || 'Failed to create course.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to create course. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-[#064e3b]" />
    </div>
  );

  if (classes.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50/60 -m-6 p-6 md:p-10">
        <div className="max-w-2xl mx-auto space-y-8">
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
            <button onClick={() => navigate('/courses')} className="flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">New Course</h1>
              <p className="text-sm text-slate-500 font-medium">Add a course to your school's academic curriculum.</p>
            </div>
          </motion.div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-slate-900 mb-2">No Classes Available</h2>
            <p className="text-sm text-slate-500 mb-6">You must create at least one class before you can create a course.</p>
            <button
              onClick={() => navigate('/classes/create')}
              className="inline-flex items-center gap-2 h-11 px-6 rounded-xl font-bold text-sm bg-[#064e3b] text-white hover:bg-[#065f46] transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Create a Class First
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 -m-6 p-6 md:p-10">
      <div className="max-w-2xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
          <button onClick={() => navigate('/courses')} className="flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">New Course</h1>
            <p className="text-sm text-slate-500 font-medium">Add a course to your school's academic curriculum.</p>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Identity card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Course Information</span>
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
                <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Course Name *</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Introduction to Physics" className="h-11 rounded-xl border-slate-200 font-medium" required />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Target Class *</Label>
                <Select value={classId} onValueChange={setClassId}>
                  <SelectTrigger className="h-11 rounded-xl border-slate-200">
                    <SelectValue placeholder="Which class is this for?">
                      {(value) => {
                        if (!value) return null;
                        const c = classes.find(c => c._id === value);
                        return c ? `${c.name} (${c.cohort})` : value;
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {classes.map(cls => (
                      <SelectItem key={cls._id} value={cls._id}>{cls.name} <span className="text-slate-400 text-xs ml-1">({cls.cohort})</span></SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Subject</Label>
                <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Physics, Mathematics" className="h-11 rounded-xl border-slate-200 font-medium" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Description</Label>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="What will students learn in this course?"
                  className="w-full min-h-[90px] px-3.5 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#064e3b]/20 focus:border-[#064e3b]"
                />
              </div>
            </div>
          </motion.div>

          {/* Schedule Card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Schedule</span>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Duration *</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger className="h-11 rounded-xl border-slate-200">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {durations.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    <Users className="w-3 h-3" /> Max Students
                  </Label>
                  <Input type="number" min="1" max="100" value={maxStudents} onChange={e => setMaxStudents(e.target.value)} className="h-11 rounded-xl border-slate-200 font-medium" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Start Date</Label>
                  <div className="relative">
                    <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="h-11 rounded-xl border-slate-200 font-medium" />
                    <Calendar className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">End Date</Label>
                  <div className="relative">
                    <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="h-11 rounded-xl border-slate-200 font-medium" />
                    <Calendar className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Syllabus Card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Syllabus</span>
            </div>
            <div className="p-6">
              <div className="space-y-1.5">
                <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Syllabus / Course Outline</Label>
                <Textarea value={syllabus} onChange={e => setSyllabus(e.target.value)}
                  placeholder="Enter the course syllabus or outline..."
                  className="rounded-xl min-h-[140px] border-slate-200 font-medium"
                />
              </div>
            </div>
          </motion.div>

          {/* Submit */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <button type="submit" disabled={isLoading || !!success}
              className={cn('w-full h-14 flex items-center justify-center gap-3 rounded-2xl font-black text-base transition-all duration-200 bg-[#064e3b] hover:bg-[#065f46] text-white shadow-xl shadow-emerald-900/20 disabled:opacity-60 disabled:cursor-not-allowed', !isLoading && !success && 'hover:-translate-y-0.5 active:translate-y-0')}>
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : success ? <><CheckCircle2 className="w-5 h-5" /> Course Created!</> : <><BookOpen className="w-5 h-5" /> Create Course</>}
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}

export default CreateCoursePage;
