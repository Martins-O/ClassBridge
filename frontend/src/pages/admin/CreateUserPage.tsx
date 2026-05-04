import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Loader2, ArrowLeft, Mail, User, Shield,
  GraduationCap, BookOpen, Briefcase, HeartHandshake,
  ClipboardList, CheckCircle2, Send
} from 'lucide-react';
import { userService } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils';

type UserRole = 'student' | 'mentor' | 'office_staff' | 'counselor' | 'admissions';

interface RoleOption {
  value: UserRole;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
}

const roleOptions: RoleOption[] = [
  {
    value: 'student',
    label: 'Student',
    description: 'Access grades, assessments, and course materials.',
    icon: <GraduationCap className="w-5 h-5" />,
    color: 'text-indigo-700',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
  },
  {
    value: 'mentor',
    label: 'Mentor',
    description: 'Grade students and manage class assessments.',
    icon: <BookOpen className="w-5 h-5" />,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  {
    value: 'office_staff',
    label: 'Office Staff',
    description: 'Manage users and perform administrative tasks.',
    icon: <Briefcase className="w-5 h-5" />,
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  {
    value: 'counselor',
    label: 'Counselor',
    description: 'View student progress and provide guidance.',
    icon: <HeartHandshake className="w-5 h-5" />,
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
  },
  {
    value: 'admissions',
    label: 'Admissions',
    description: 'Manage student enrollments and applications.',
    icon: <ClipboardList className="w-5 h-5" />,
    color: 'text-violet-700',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
  },
];

export function CreateUserPage() {
  const navigate = useNavigate();
  const getSchoolId = useAuthStore((state) => state.getSchoolId);
  const isSystemAdmin = useAuthStore((state) => state.isSystemAdmin);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const selectedRole = roleOptions.find(r => r.value === role)!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) { setError('Full name is required'); return; }
    if (!email.trim()) { setError('Email address is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const schoolId = isSystemAdmin() ? '' : (getSchoolId() || '');
      if (!schoolId) {
        setError('Your account is not associated with a school.');
        setIsLoading(false);
        return;
      }

      const { data } = await userService.invite({ name: name.trim(), email: email.trim(), role, schoolId });
      setSuccess(data.isExistingUser
        ? `${name} has been added to your school.`
        : `Invitation sent to ${email}. They'll receive an email to complete registration.`
      );
      setTimeout(() => navigate('/users'), 2500);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to send invitation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 -m-6 p-6 md:p-10">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Back button + heading */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <button
            onClick={() => navigate('/users')}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Invite a User</h1>
            <p className="text-sm text-slate-500 font-medium">Send a secure invitation link to a new member.</p>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Identity card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Identity</span>
            </div>
            <div className="p-6 space-y-5">
              {/* Feedback messages */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
                  >
                    <Shield className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700"
                  >
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{success}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-black text-slate-500 uppercase tracking-widest">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Amaka Okonkwo"
                    className="pl-10 h-11 rounded-xl border-slate-200 focus:border-[#064e3b] focus:ring-[#064e3b]/10 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-black text-slate-500 uppercase tracking-widest">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="amaka@yourschool.edu"
                    className="pl-10 h-11 rounded-xl border-slate-200 focus:border-[#064e3b] focus:ring-[#064e3b]/10 font-medium"
                    required
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Role selector card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Assign Role</span>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {roleOptions.map((option) => {
                const isSelected = role === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRole(option.value)}
                    className={cn(
                      'relative flex items-start gap-3 text-left p-4 rounded-xl border-2 transition-all duration-200',
                      isSelected
                        ? `${option.bg} ${option.border} shadow-sm`
                        : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    )}
                  >
                    <div className={cn(
                      'flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
                      isSelected ? `${option.bg} ${option.color}` : 'bg-slate-100 text-slate-400'
                    )}>
                      {option.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn('font-black text-sm', isSelected ? option.color : 'text-slate-700')}>
                        {option.label}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{option.description}</p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className={cn('absolute top-3 right-3 w-4 h-4', option.color)} />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Send button */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <button
              type="submit"
              disabled={isLoading || !!success}
              className={cn(
                'w-full h-14 flex items-center justify-center gap-3 rounded-2xl font-black text-base transition-all duration-200',
                'bg-[#064e3b] hover:bg-[#065f46] text-white shadow-xl shadow-emerald-900/20',
                'disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-[#064e3b]',
                !isLoading && !success && 'hover:-translate-y-0.5 active:translate-y-0'
              )}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : success ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Invitation Sent!
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Invitation to {selectedRole.label}
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-4">
              An account setup link will be emailed to the address provided.
            </p>
          </motion.div>

        </form>
      </div>
    </div>
  );
}

export default CreateUserPage;
