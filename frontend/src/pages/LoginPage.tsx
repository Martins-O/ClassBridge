import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { authService } from '../services/api';
import { useAuthStore } from '../stores/auth';
import { Loader2, ShieldCheck, Mail, Lock, ArrowRight, Sparkles, Building2 } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
      setTimeout(() => setSuccess(''), 5000);
    }
  }, [location.state]);

  const handleResendVerification = async () => {
    if (!resendEmail) {
      setResendMessage('Email is required');
      setResendStatus('error');
      return;
    }
    setResendStatus('sending');
    try {
      const { data } = await authService.resendVerificationEmail(resendEmail);
      if (data.success) {
        setResendStatus('sent');
        setResendMessage('Verification email sent!');
      } else {
        setResendStatus('error');
        setResendMessage(data.error || 'Failed to send');
      }
    } catch (err: any) {
      setResendStatus('error');
      setResendMessage(err?.response?.data?.error || 'Error occurred');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { data } = await authService.login(email, password);
      if (data.success && data.accessToken && data.user) {
        login(data.user, data.accessToken, data.refreshToken || '');
        navigate('/dashboard');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'An error occurred during sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Abstract Background Decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#064e3b]/5 blur-[80px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#b45309]/5 blur-[100px]" />
        <div className="absolute top-[20%] left-[10%] w-px h-[60%] bg-gradient-to-b from-transparent via-slate-200 to-transparent" />
        <div className="absolute top-[20%] right-[10%] w-px h-[60%] bg-gradient-to-b from-transparent via-slate-200 to-transparent" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[1000px] flex flex-col md:flex-row shadow-2xl rounded-[2.5rem] overflow-hidden bg-white border border-slate-100 z-10"
      >
        {/* Left Side: Branding & Info */}
        <div className="flex-1 bg-[#064e3b] p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />
             <div className="w-full h-full bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
          </div>
          
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2 group mb-12">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-tight underline-offset-4 decoration-[#b45309]">ClassBridge</span>
            </Link>

            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-black leading-tight">
                Empowering the <br />
                <span className="text-[#d97706]">Future</span> of Learning.
              </h2>
              <p className="text-white/70 text-lg leading-relaxed max-w-sm">
                Access your institutional dashboard to manage assessments, transcripts, and academic governance.
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-12">
            <div className="flex items-center gap-4 text-sm font-medium text-white/50">
              <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#064e3b] bg-slate-200" />
                ))}
              </div>
              <span>Joined by 500+ Institutions</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex-[1.2] p-8 md:p-14 bg-white">
          <div className="max-w-sm mx-auto h-full flex flex-col justify-center">
            <div className="mb-8">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Welcome Back</h1>
              <p className="text-slate-500 font-medium">Please enter your details to sign in</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Alert variant="destructive" className="rounded-2xl border-red-100 bg-red-50/50 text-red-600">
                      <AlertDescription className="font-bold">{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-bold text-slate-700 ml-1">Work Email</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-[#064e3b] transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@institution.edu"
                      className="pl-12 h-13 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-[#064e3b]/10 focus:border-[#064e3b] transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <Label htmlFor="password" className="text-slate-700 font-bold">Password *</Label>
                    <Link to="/forgot" className="text-xs font-bold text-[#b45309] hover:underline transition-all">Forgot Password?</Link>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-[#064e3b] transition-colors" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-12 h-13 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-[#064e3b]/10 focus:border-[#064e3b] transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 px-1">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="rounded-md border-slate-300 data-[state=checked]:bg-[#064e3b] data-[state=checked]:border-[#064e3b]"
                />
                <Label htmlFor="remember" className="text-sm font-bold text-slate-500 cursor-pointer select-none">
                  Keep me signed in
                </Label>
              </div>

              <Button type="submit" className="w-full h-13 bg-[#064e3b] hover:bg-[#065f46] text-white rounded-2xl font-black text-lg shadow-xl shadow-[#064e3b]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-100 space-y-6">
               <div className="relative text-center">
                 <span className="bg-white px-4 text-xs font-black text-slate-300 uppercase tracking-widest relative z-10">Verification</span>
                 <div className="absolute inset-0 top-1/2 w-full h-px bg-slate-100" />
               </div>

               <div className="space-y-4">
                  <p className="text-xs text-center font-bold text-slate-500">Need a new verification link?</p>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="Email address"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      className="h-10 text-xs rounded-xl border-slate-200"
                    />
                    <Button 
                      variant="outline" 
                      onClick={handleResendVerification}
                      disabled={resendStatus === 'sending'}
                      className="h-10 px-4 rounded-xl font-bold text-xs border-slate-200 text-slate-700 hover:bg-slate-50"
                    >
                      {resendStatus === 'sending' ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Resend'}
                    </Button>
                  </div>
                  {resendMessage && (
                    <motion.p 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }}
                      className={`text-[10px] text-center font-black ${resendStatus === 'error' ? 'text-red-500' : 'text-[#064e3b]'}`}
                    >
                      {resendMessage}
                    </motion.p>
                  )}
               </div>

               <p className="text-center text-sm font-bold text-slate-500">
                New to ClassBridge?{' '}
                <Link to="/register" className="text-[#b45309] hover:underline decoration-2">Create an account</Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default LoginPage;
