import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowLeft, FileText, Sparkles, GraduationCap, Users, Shield, CheckCircle2 } from 'lucide-react';
import { transcriptService, classService, userService } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils';
import type { Class, User } from '@/types';

export function GenerateTranscriptPage() {
  const navigate = useNavigate();
  const getSchoolId = useAuthStore((state) => state.getSchoolId);
  const [classId, setClassId] = useState('');
  const [studentId, setStudentId] = useState('');
  
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<User[]>([]);
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
    if (!classId) {
      setStudents([]);
      setStudentId('');
      return;
    }
    async function fetchStudents() {
      try {
        const { data } = await userService.getAll({ classId, limit: 100 });
        setStudents((data as any)?.data || []);
      } catch (err) {
        console.error('Failed to fetch students:', err);
      }
    }
    fetchStudents();
  }, [classId]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!classId || !studentId) return setError('Please select both class and student.');
    setIsLoading(true);
    try {
      const cls = classes.find(c => c._id === classId);
      if (!cls) return setError('Selected class not found.');

      const courseRecord = {
        classId,
        className: cls.name,
        academicYear: cls.academicYear,
        duration: cls.duration,
        cohort: cls.cohort,
        grade: 'A',
        credits: 3,
        mentorId: cls.mentorIds?.[0] || '',
        mentorName: 'Assigned Mentor',
        completedDate: new Date().toISOString(),
      };

      const { data } = await transcriptService.create({
        studentId,
        courseRecord,
      });
      if ((data as any).transcript) {
        setSuccess('Transcript compiled and generated!');
        setTimeout(() => navigate('/transcripts'), 1500);
      } else {
        setError((data as any).error || 'Failed to generate transcript.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to generate transcript. Please try again.');
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
          <button onClick={() => navigate('/transcripts')} className="flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Generate Transcript</h1>
            <p className="text-sm text-slate-500 font-medium">Compile verified academic records for official certification.</p>
          </div>
        </motion.div>

        <form onSubmit={handleGenerate} className="space-y-5">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Compiler Parameters</span>
            </div>
            <div className="p-8 space-y-6">
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

              <div className="space-y-1.5 peer">
                <Label className="text-[10px] font-black text-[#064e4b] uppercase tracking-widest bg-[#064e4b]/5 px-2 py-0.5 rounded-md inline-block mb-1">Step 1: Academy Unit</Label>
                <Select value={classId} onValueChange={setClassId}>
                  <SelectTrigger className="h-14 rounded-2xl border-slate-200 text-lg transition-all focus:ring-[#064e4b]/10">
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-5 h-5 text-slate-400" />
                      <SelectValue placeholder="Chose academic class...">
                        {(() => {
                          if (!classId) return null;
                          const cls = classes.find(c => c._id === classId);
                          return cls ? `${cls.name} (${cls.cohort})` : classId;
                        })()}
                      </SelectValue>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-200">
                    {classes.map(cls => <SelectItem key={cls._id} value={cls._id}>{cls.name} <span className="text-slate-400 text-xs ml-1">({cls.cohort})</span></SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className={cn("space-y-1.5 transition-all duration-300", !classId ? "opacity-40 grayscale" : "opacity-100")}>
                <Label className="text-[10px] font-black text-[#064e4b] uppercase tracking-widest bg-[#064e4b]/5 px-2 py-0.5 rounded-md inline-block mb-1">Step 2: Candidate Records</Label>
                <Select value={studentId} onValueChange={setStudentId} disabled={!classId}>
                  <SelectTrigger className="h-14 rounded-2xl border-slate-200 text-lg transition-all focus:ring-[#064e4b]/10">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-slate-400" />
                      <SelectValue placeholder={classId ? "Select student candidate..." : "Select class first"}>
                        {(() => {
                          if (!studentId) return null;
                          const s = students.find(s => s._id === studentId);
                          return s ? `${s.name} (${s.email})` : studentId;
                        })()}
                      </SelectValue>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-200">
                    {students.map(s => <SelectItem key={s._id} value={s._id}>{s.name} <span className="text-slate-400 text-xs ml-1">({s.email})</span></SelectItem>)}
                    {classId && students.length === 0 && <div className="p-4 text-center text-sm text-slate-500">No student records found in this class</div>}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4">
                <button type="submit" disabled={isLoading || !!success || !studentId}
                  className={cn('w-full h-15 flex items-center justify-center gap-3 rounded-2xl font-black text-lg transition-all duration-300 bg-[#064e3b] hover:bg-[#065f46] text-white shadow-xl shadow-emerald-900/20 disabled:opacity-40 disabled:cursor-not-allowed group', !isLoading && !success && studentId && 'hover:-translate-y-0.5 active:translate-y-0')}>
                  {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : success ? <><CheckCircle2 className="w-6 h-6" /> Compiled!</> : <><Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" /> Generate Transcript</>}
                </button>
                <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-5 border-t border-slate-100 pt-5">
                  <Shield className="w-3 h-3 inline-block mr-1 -mt-0.5" />
                  Official transcripts require verified assessment records.
                </p>
              </div>
            </div>
          </motion.div>
        </form>
      </div>
    </div>
  );
}

export default GenerateTranscriptPage;
