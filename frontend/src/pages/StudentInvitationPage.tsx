import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle2, XCircle, Building, User, Mail, Lock, Loader2, ArrowRight, BookOpen, GraduationCap } from 'lucide-react';
import { studentService } from '@/services/api';
import { toast } from 'sonner';

export default function StudentInvitationPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function verifyToken() {
      try {
        const response = await studentService.getInvitation(token!);
        setInvitation(response.data.invitation);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Invalid or expired invitation token.');
      } finally {
        setIsLoading(false);
      }
    }
    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      await studentService.acceptInvitation({ token: token!, password });
      toast.success('Your student account is now active! Please log in.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to accept invitation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-gray-500 font-medium tracking-tight">Verifying your student enrollment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full border-none shadow-2xl overflow-hidden">
          <div className="bg-red-600 h-2 w-full" />
          <CardContent className="pt-8 pb-10 px-8 text-center space-y-6">
            <div className="bg-red-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto ring-8 ring-red-50/50">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">Enrollment Link Error</h1>
              <p className="text-gray-500 leading-relaxed">{error}</p>
            </div>
            <Button 
              variant="outline" 
              className="w-full py-6 transition-all hover:bg-gray-50"
              onClick={() => navigate('/login')}
            >
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Right Column (Mobile First): Acceptance Form */}
      <div className="order-2 lg:order-1 flex items-center justify-center p-8 bg-gray-50/50">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
          <div className="text-center lg:text-left space-y-2">
            <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">Student Enrollment</h3>
            <p className="text-gray-500">Create your password to access your learning portal.</p>
          </div>

          <Card className="border-none shadow-xl shadow-gray-200/50 overflow-hidden">
            <div className="bg-[#004d40] h-1.5 w-full" />
            <CardContent className="p-8 space-y-8">
              <div className="p-5 bg-[#004d40]/5 rounded-2xl border border-[#004d40]/10 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0 border border-gray-100">
                    <GraduationCap className="text-[#004d40]" size={24} />
                  </div>
                  <div className="overflow-hidden">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#004d40]/60 block">Student Record</label>
                    <p className="font-bold text-gray-900 text-lg truncate">{invitation.name}</p>
                    <p className="text-sm text-gray-500 truncate">{invitation.email}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-[#004d40]/10 grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Class / Group</label>
                    <p className="font-semibold text-gray-700 text-sm">{invitation.class?.name}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Institution</label>
                    <p className="font-semibold text-gray-700 text-sm truncate">{invitation.school?.name}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="password">Set Portal Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 h-14 bg-gray-50/50"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 flex items-center gap-1.5 pl-1">
                    <Shield size={12} className="text-emerald-500" />
                    Minimum 8 characters. Use a mix of letters and numbers.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 h-14 bg-gray-50/50"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-14 bg-[#004d40] hover:bg-[#003d33] text-white font-bold rounded-xl shadow-lg shadow-[#004d40]/20 transition-all active:scale-[0.98]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      Access Learning Portal
                      <ArrowRight size={18} />
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center space-y-4">
            <p className="text-xs text-gray-400 px-6">
              Having trouble? Contact the administration at <span className="text-[#004d40] font-bold underline">{invitation.school?.name}</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Left Column (Desktop Only): Branding/Visual */}
      <div className="hidden lg:flex order-1 lg:order-2 flex-col justify-between p-16 bg-gradient-to-br from-[#004d40] to-[#002d25] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-400 rounded-full blur-[120px] -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-400 rounded-full blur-[100px] -ml-24 -mb-24" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-24">
            <GraduationCap className="h-10 w-10 text-amber-400" strokeWidth={2.5} />
            <span className="text-3xl font-black tracking-tighter uppercase italic">ClassBridge</span>
          </div>
          
          <div className="max-w-md space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20">
              <CheckCircle2 size={14} className="text-amber-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Verified Enrollment</span>
            </div>
            
            <h2 className="text-6xl font-black leading-[1.1] tracking-tight">
              Begin your learning journey.
            </h2>
            
            <div className="space-y-6 pt-4">
              <p className="text-emerald-100/70 text-xl leading-relaxed">
                Welcome to <span className="text-white font-bold">{invitation.school?.name}</span>. 
                You have been enrolled in <span className="text-amber-400 font-bold">{invitation.class?.name}</span>.
              </p>
              
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <User size={24} className="text-amber-400" />
                </div>
                <div>
                  <p className="text-white font-bold leading-none">{invitation.inviter?.name}</p>
                  <p className="text-emerald-200/50 text-xs mt-1 uppercase tracking-wider font-bold">Your Registrar</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 py-10 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-sm font-bold text-emerald-100/40 uppercase tracking-widest">Portal Version 4.0</span>
          </div>
          <BookOpen className="h-6 w-6 text-emerald-100/20" />
        </div>
      </div>
    </div>
  );
}
