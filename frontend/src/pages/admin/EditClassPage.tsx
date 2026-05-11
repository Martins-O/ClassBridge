import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowLeft, GraduationCap, Users, CalendarDays, CheckCircle2, Shield } from 'lucide-react';
import { classService, userService } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils';
import type { User } from '@/types';

const DURATIONS = ['1 month', '2 months', '3 months', '4 months', '6 months', '1 year', '2 years'];
const ACADEMIC_YEARS = ['2023/2024', '2024/2025', '2025/2026', '2026/2027'];

export function EditClassPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const getSchoolId = useAuthStore((state) => state.getSchoolId);

  const [name, setName] = useState('');
  const [cohort, setCohort] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [duration, setDuration] = useState('');
  const [mentorId, setMentorId] = useState('');
  const [description, setDescription] = useState('');

  const [mentors, setMentors] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      try {
        const schoolId = getSchoolId();
        const [classRes, usersRes] = await Promise.all([
          classService.getById(id),
          userService.getAll({ schoolId, role: 'mentor', limit: 100 }),
        ]);
        const cls = (classRes.data as any)?.class;
        if (cls) {
          setName(cls.name || '');
          setCohort(cls.cohort || '');
          setAcademicYear(cls.academicYear || '');
          setDuration(cls.duration || '');
          setDescription(cls.description || '');
          if (cls.mentorIds?.length) setMentorId(cls.mentorIds[0]?._id || cls.mentorIds[0] || '');
        }
        setMentors((usersRes.data as any)?.data || []);
      } catch (e) {
        console.error('Failed to load class data:', e);
        setError('Failed to load class information.');
      } finally {
        setIsFetching(false);
      }
    }
    fetchData();
  }, [id, getSchoolId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!name.trim()) return setError('Class name is required.');
    if (!academicYear) return setError('Academic year is required.');
    if (!duration) return setError('Duration is required.');
    if (!cohort.trim()) return setError('Cohort identifier is required.');
    setIsLoading(true);
    try {
      const { data } = await classService.update(id!, {
        name: name.trim(),
        cohort: cohort.trim(),
        academicYear,
        duration,
        mentorIds: mentorId ? [mentorId] : [],
        description: description.trim() || undefined,
      } as any);
      if ((data as any).success) {
        setSuccess('Class updated successfully!');
        setTimeout(() => navigate(`/classes/${id}`), 1500);
      } else {
        setError((data as any).error || 'Failed to update class.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to update class. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-10 h-10 animate-spin text-[#064e3b]" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/60 -m-6 p-6 md:p-10">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/classes/${id}`)}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Edit Class</h1>
            <p className="text-sm text-slate-500 font-medium">Update the academic class information below.</p>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic Info Card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Class Details</span>
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
                <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Class Name *</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Senior Secondary 3A"
                  className="h-11 rounded-xl border-slate-200 font-medium" required />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Cohort</Label>
                <Input value={cohort} onChange={e => setCohort(e.target.value)} placeholder="e.g. Cohort 2025, Set A, Batch 1"
                  className="h-11 rounded-xl border-slate-200 font-medium" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Description (Optional)</Label>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Optional notes about this class..."
                  className="w-full min-h-[90px] px-3.5 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#064e3b]/20 focus:border-[#064e3b]"
                />
              </div>
            </div>
          </motion.div>

          {/* Schedule Card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Schedule</span>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Academic Year *</Label>
                <Select value={academicYear} onValueChange={setAcademicYear}>
                  <SelectTrigger className="h-11 rounded-xl border-slate-200"><SelectValue placeholder="Select year" /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {ACADEMIC_YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Duration *</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger className="h-11 rounded-xl border-slate-200"><SelectValue placeholder="Select duration" /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {DURATIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>

          {/* Mentor Card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Assign Mentor</span>
            </div>
            <div className="p-6">
              <Select value={mentorId} onValueChange={setMentorId}>
                <SelectTrigger className="h-11 rounded-xl border-slate-200">
                  <SelectValue placeholder={mentors.length ? 'Choose a mentor (optional)' : 'No mentors available'}>
                    {(value) => {
                      if (!value) return null;
                      const m = mentors.find(mm => mm._id === value);
                      return m ? `${m.name} (${m.email})` : value;
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {mentors.map(m => (
                    <SelectItem key={m._id} value={m._id}>
                      {m.name} <span className="text-slate-400 text-xs ml-1">({m.email})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-3">Mentors can be changed at any time.</p>
            </div>
          </motion.div>

          {/* Submit */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <button type="submit" disabled={isLoading || !!success}
              className={cn(
                'w-full h-14 flex items-center justify-center gap-3 rounded-2xl font-black text-base transition-all duration-200 bg-[#064e3b] hover:bg-[#065f46] text-white shadow-xl shadow-emerald-900/20 disabled:opacity-60 disabled:cursor-not-allowed',
                !isLoading && !success && 'hover:-translate-y-0.5 active:translate-y-0'
              )}>
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" />
                : success ? <><CheckCircle2 className="w-5 h-5" /> Class Updated!</>
                : <><GraduationCap className="w-5 h-5" /> Save Changes</>}
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}

export default EditClassPage;
