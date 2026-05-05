import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowLeft, BookOpen, Hash, Star, CheckCircle2, Shield } from 'lucide-react';
import { courseService } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils';

type CourseType = 'core' | 'elective' | 'advanced_placement' | 'honors' | 'remedial';

interface TypeOption {
  value: CourseType;
  label: string;
  description: string;
  color: string;
  bg: string;
  border: string;
}

const typeOptions: TypeOption[] = [
  { value: 'core', label: 'Core', description: 'Mandatory for all students.', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  { value: 'elective', label: 'Elective', description: 'Student-chosen optional course.', color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200' },
  { value: 'advanced_placement', label: 'Advanced Placement', description: 'College-level rigour.', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { value: 'honors', label: 'Honors', description: 'Accelerated academic track.', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  { value: 'remedial', label: 'Remedial', description: 'Support for struggling students.', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
];

export function CreateCoursePage() {
  const navigate = useNavigate();
  const getSchoolId = useAuthStore((state) => state.getSchoolId);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [credits, setCredits] = useState('3');
  const [courseType, setCourseType] = useState<CourseType>('core');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!name.trim()) return setError('Course name is required.');
    if (!code.trim()) return setError('Course code is required.');
    setIsLoading(true);
    try {
      const schoolId = getSchoolId();
      const { data } = await courseService.create({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim() || undefined,
        credits: credits ? parseInt(credits) : undefined,
        category: courseType,
        schoolId: schoolId || undefined,
      });
      if ((data as any).success) {
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

  const selectedType = typeOptions.find(t => t.value === courseType)!;

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
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Advanced Mathematics" className="h-11 rounded-xl border-slate-200 font-medium" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    <Hash className="w-3 h-3 inline-block mr-1 -mt-px" />Course Code *
                  </Label>
                  <Input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="MATH101" maxLength={10}
                    className="h-11 rounded-xl border-slate-200 font-black tracking-widest uppercase" required />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Credits</Label>
                  <div className="relative">
                    <Input type="number" min="1" max="10" value={credits} onChange={e => setCredits(e.target.value)} className="h-11 rounded-xl border-slate-200 font-black" />
                    <Star className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Description (Optional)</Label>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="What will students learn in this course?"
                  className="w-full min-h-[90px] px-3.5 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#064e3b]/20 focus:border-[#064e3b]"
                />
              </div>
            </div>
          </motion.div>

          {/* Course Type Card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <Star className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Course Type</span>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {typeOptions.map(opt => {
                const isSelected = courseType === opt.value;
                return (
                  <button key={opt.value} type="button" onClick={() => setCourseType(opt.value)}
                    className={cn('relative flex items-start gap-3 text-left p-4 rounded-xl border-2 transition-all duration-200',
                      isSelected ? `${opt.bg} ${opt.border} shadow-sm` : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50')}>
                    <div className={cn('flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black transition-colors', isSelected ? `${opt.bg} ${opt.color}` : 'bg-slate-100 text-slate-400')}>
                      {opt.label.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn('font-black text-sm', isSelected ? opt.color : 'text-slate-700')}>{opt.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{opt.description}</p>
                    </div>
                    {isSelected && <CheckCircle2 className={cn('absolute top-3 right-3 w-4 h-4', opt.color)} />}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Submit */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
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
