import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Loader2, ChevronLeft, ChevronRight, Check, School, User, ArrowRight, ShieldCheck, Mail, Lock, Phone, MapPin } from 'lucide-react';
import { authService } from '../services/api';

interface FormData {
  schoolName: string;
  schoolEmail: string;
  schoolPhone: string;
  schoolAddress: string;
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

const initialFormData: FormData = {
  schoolName: '',
  schoolEmail: '',
  schoolPhone: '',
  schoolAddress: '',
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
};

export function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (currentStep: number): boolean => {
    setError('');
    if (currentStep === 1) {
      if (!formData.schoolName.trim()) { setError('School Name is required'); return false; }
      if (!formData.schoolEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.schoolEmail)) { setError('Valid School Email is required'); return false; }
    }
    if (currentStep === 2) {
      if (!formData.fullName.trim()) { setError('Full Name is required'); return false; }
      if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { setError('Valid Admin Email is required'); return false; }
      if (formData.password.length < 8) { setError('Password must be at least 8 characters'); return false; }
      if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return false; }
    }
    return true;
  };

  const handleNext = () => { if (validateStep(step)) setStep(prev => Math.min(prev + 1, 3)); };
  const handleBack = () => { setStep(prev => Math.max(prev - 1, 1)); setError(''); };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    setIsLoading(true);
    try {
      const { data } = await authService.register({
        email: formData.email,
        password: formData.password,
        name: formData.fullName,
        schoolName: formData.schoolName,
        schoolEmail: formData.schoolEmail,
        schoolPhone: formData.schoolPhone || undefined,
        schoolAddress: formData.schoolAddress || undefined,
      });
      if (data.success) {
        navigate('/login', { state: { message: 'Registration successful! Verification email sent.' } });
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const progressValue = (step / 3) * 100;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[60%] h-[60%] rounded-full bg-[#064e3b]/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] rounded-full bg-[#b45309]/5 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[1100px] flex flex-col lg:flex-row shadow-2xl rounded-[3rem] overflow-hidden bg-white border border-slate-100 z-10"
      >
        {/* Left Side: Steps Progress & Intro */}
        <div className="lg:w-[400px] bg-[#064e3b] p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.2)_0%,transparent_100%)] bg-[size:200px_200px]" />
          
          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-2 mb-16">
              <ShieldCheck className="w-8 h-8 text-[#d97706]" />
              <span className="text-2xl font-black">ClassBridge</span>
            </Link>

            <div className="space-y-12">
              {[
                { step: 1, title: 'School Context', desc: 'Identify your institution', icon: <School className="w-5 h-5" /> },
                { step: 2, title: 'Ownership', desc: 'Secure admin account', icon: <User className="w-5 h-5" /> },
                { step: 3, title: 'Confirmation', desc: 'Review and finalize', icon: <Check className="w-5 h-5" /> },
              ].map((s, i) => (
                <div key={i} className="flex gap-6 items-start">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all ${
                    step === s.step ? 'bg-white text-[#064e3b] scale-110 shadow-lg shadow-white/20' : 
                    step > s.step ? 'bg-white/20 text-white' : 'bg-transparent border border-white/20 text-white/40'
                  }`}>
                    {step > s.step ? <Check className="w-5 h-5" /> : s.icon}
                  </div>
                  <div>
                    <h3 className={`font-black tracking-tight ${step === s.step ? 'text-white' : 'text-white/40'}`}>{s.title}</h3>
                    <p className={`text-sm font-bold ${step === s.step ? 'text-white/70' : 'text-white/20'}`}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 pt-10 border-t border-white/10">
            <p className="text-sm font-bold text-white/50 leading-relaxed">
              Standardizing academic governance with secure, verifiable records.
            </p>
          </div>
        </div>

        {/* Right Side: Form Content */}
        <div className="flex-1 p-10 lg:p-16 relative">
          <div className="max-w-md mx-auto">
            <div className="mb-10">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Institutional Onboarding</h2>
              <p className="text-slate-500 font-bold mt-2">Let's set up your school's workspace</p>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {error && (
                  <Alert variant="destructive" className="rounded-2xl border-red-100 bg-red-50 text-red-600">
                    <AlertDescription className="font-bold">{error}</AlertDescription>
                  </Alert>
                )}

                {step === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <Label className="font-bold text-slate-700 ml-1">Official School Name</Label>
                       <div className="relative group">
                         <School className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-[#064e3b] transition-colors" />
                         <Input value={formData.schoolName} onChange={(e) => updateField('schoolName', e.target.value)} placeholder="e.g. St. Peters Model College" className="pl-12 h-13 rounded-2xl bg-slate-50 border-slate-200" required />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <Label className="font-bold text-slate-700 ml-1">Academic Email</Label>
                       <div className="relative group">
                         <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-[#064e3b] transition-colors" />
                         <Input type="email" value={formData.schoolEmail} onChange={(e) => updateField('schoolEmail', e.target.value)} placeholder="office@stpeters.edu" className="pl-12 h-13 rounded-2xl bg-slate-50 border-slate-200" required />
                       </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div className="space-y-2">
                        <Label className="font-bold text-slate-700 ml-1">Phone</Label>
                        <div className="relative group">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-[#064e3b] transition-colors" />
                          <Input value={formData.schoolPhone} onChange={(e) => updateField('schoolPhone', e.target.value)} placeholder="+1 234..." className="pl-12 h-13 rounded-2xl bg-slate-50 border-slate-200" />
                        </div>
                       </div>
                       <div className="space-y-2">
                        <Label className="font-bold text-slate-700 ml-1">Location</Label>
                        <div className="relative group">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-[#064e3b] transition-colors" />
                          <Input value={formData.schoolAddress} onChange={(e) => updateField('schoolAddress', e.target.value)} placeholder="City, Country" className="pl-12 h-13 rounded-2xl bg-slate-50 border-slate-200" />
                        </div>
                       </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <Label className="font-bold text-slate-700 ml-1">Head of Admin Name</Label>
                       <div className="relative group">
                         <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-[#064e3b] transition-colors" />
                         <Input value={formData.fullName} onChange={(e) => updateField('fullName', e.target.value)} placeholder="John Doe" className="pl-12 h-13 rounded-2xl bg-slate-50 border-slate-200" required />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <Label className="font-bold text-slate-700 ml-1">Work Email</Label>
                       <div className="relative group">
                         <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-[#064e3b] transition-colors" />
                         <Input type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} placeholder="admin@stpeters.edu" className="pl-12 h-13 rounded-2xl bg-slate-50 border-slate-200" required />
                       </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div className="space-y-2">
                        <Label className="font-bold text-slate-700 ml-1">Password</Label>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-[#064e3b] transition-colors" />
                          <Input type="password" value={formData.password} onChange={(e) => updateField('password', e.target.value)} placeholder="••••••••" className="pl-12 h-13 rounded-2xl bg-slate-50 border-slate-200" />
                        </div>
                       </div>
                       <div className="space-y-2">
                        <Label className="font-bold text-slate-700 ml-1">Confirm</Label>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-[#064e3b] transition-colors" />
                          <Input type="password" value={formData.confirmPassword} onChange={(e) => updateField('confirmPassword', e.target.value)} placeholder="••••••••" className="pl-12 h-13 rounded-2xl bg-slate-50 border-slate-200" />
                        </div>
                       </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div className="p-5 rounded-[2rem] bg-slate-50 border border-slate-100 flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">School</span>
                          <span className="font-black text-slate-800">{formData.schoolName}</span>
                          <span className="text-xs font-bold text-slate-500">{formData.schoolEmail}</span>
                       </div>
                       <div className="p-5 rounded-[2rem] bg-slate-50 border border-slate-100 flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Administrator</span>
                          <span className="font-black text-slate-800">{formData.fullName}</span>
                          <span className="text-xs font-bold text-slate-500">{formData.email}</span>
                       </div>
                    </div>
                    <div className="flex items-center gap-3 p-5 rounded-[2rem] bg-[#064e3b]/5 border border-[#064e3b]/10 group">
                      <Checkbox id="terms" checked={formData.acceptTerms} onCheckedChange={(checked) => updateField('acceptTerms', checked as boolean)} className="rounded-lg" />
                      <Label htmlFor="terms" className="text-sm font-bold text-slate-600 cursor-pointer">
                        I agree to the <a href="#" className="text-[#b45309] underline">Terms and Professional Standards</a>
                      </Label>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between gap-4">
               {step > 1 ? (
                 <Button variant="ghost" onClick={handleBack} className="h-13 px-8 rounded-2xl font-black text-slate-600 group">
                   <ChevronLeft className="mr-2 w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                   Back
                 </Button>
               ) : (
                 <Link to="/login" className="text-sm font-bold text-slate-500 hover:text-[#064e3b] transition-all px-2">
                   Already have a school? <span className="text-[#064e3b] underline">Sign In</span>
                 </Link>
               )}

               <Button 
                onClick={step === 3 ? handleSubmit : handleNext} 
                className="h-13 px-10 rounded-2xl bg-[#064e3b] hover:bg-[#065f46] text-white font-black text-lg shadow-xl shadow-[#064e3b]/20 group transition-all"
                disabled={isLoading || (step === 3 && !formData.acceptTerms)}
               >
                 {isLoading ? <Loader2 className="animate-spin w-6 h-6" /> : (
                   step === 3 ? 'Finalize Onboarding' : 'Continue'
                 )}
                 {step < 3 && !isLoading && <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />}
               </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default RegisterPage;
