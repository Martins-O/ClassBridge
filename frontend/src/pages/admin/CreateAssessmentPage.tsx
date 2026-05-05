import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowLeft, ClipboardList, Settings2, Clock, CheckCircle2, Shield, Percent, Target, CalendarDays } from 'lucide-react';
import { assessmentService, classService } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils';
import type { Class } from '@/types';

export function CreateAssessmentPage() {
  const navigate = useNavigate();
  const getSchoolId = useAuthStore((state) => state.getSchoolId);
  const user = useAuthStore((state) => state.user);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [classId, setClassId] = useState('');
  const [passingScore, setPassingScore] = useState('70');
  const [maxAttempts, setMaxAttempts] = useState('1');
  const [duration, setDuration] = useState('60');
  
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
        console.error('Failed to fetch data:', err);
      } finally {
        setIsFetching(false);
      }
    }
    fetchData();
  }, [getSchoolId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!title.trim()) return setError('Assessment title is required.');
    if (!classId) return setError('Please select a target class.');
    setIsLoading(true);
    try {
      const schoolId = getSchoolId();
      const { data } = await assessmentService.create({
        title: title.trim(),
        description: description.trim(),
        classId,
        schoolId: schoolId || undefined,
        mentorId: user?._id,
        passingScore: parseInt(passingScore),
        maxAttempts: parseInt(maxAttempts),
        isActive: true,
      });
      if (data.success) {
        setSuccess('Assessment created and published!');
        setTimeout(() => navigate('/assessments'), 1500);
      } else {
        setError(data.error || 'Failed to create assessment.');
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
      <div className="max-w-2xl mx-auto space-y-8">
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
                <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Target Class *</Label>
                <Select value={classId} onValueChange={setClassId}>
                  <SelectTrigger className="h-11 rounded-xl border-slate-200">
                    <SelectValue placeholder="Which class is this for?" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {classes.map(cls => <SelectItem key={cls._id} value={cls._id}>{cls.name} <span className="text-slate-400 text-xs ml-1">({cls.cohort})</span></SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Instructions (Optional)</Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Provide instructions or background for students..."
                  className="rounded-xl min-h-[110px] border-slate-200 font-medium"
                />
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
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                  <Input type="number" min="1" value={maxAttempts} onChange={e => setMaxAttempts(e.target.value)}
                    className="h-11 rounded-xl border-slate-200 font-black" />
                  <Target className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Time Limit (Minutes)</Label>
                <div className="relative">
                  <Input type="number" min="1" value={duration} onChange={e => setDuration(e.target.value)}
                    className="h-11 rounded-xl border-slate-200 font-black pl-10" />
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Submit */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
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
