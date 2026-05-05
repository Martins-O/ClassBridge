import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle2, XCircle, Building, User, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { mentorService } from '@/services/api';
import { toast } from 'sonner';

export default function MentorInvitationPage() {
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
        const response = await mentorService.getInvitation(token!);
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
      await mentorService.acceptInvitation(token!, { password });
      toast.success('Account created successfully! You can now log in.');
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
          <p className="text-gray-500 font-medium">Verifying your institutional invitation...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Invitation Error</h1>
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
      {/* Left Column: Visual/Branding */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-[#004d40] text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl" />
          <div className="absolute top-1/2 -right-48 w-96 h-96 rounded-full bg-amber-400 blur-3xl opacity-30" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-12">
            <div className="h-10 w-10 bg-amber-400 rounded-lg flex items-center justify-center font-bold text-[#004d40] text-xl">CB</div>
            <span className="text-2xl font-bold tracking-tight">ClassBridge</span>
          </div>
          
          <div className="max-w-md space-y-6">
            <Badge className="bg-amber-400/20 text-amber-400 border-amber-400/30 px-3 py-1 text-xs uppercase tracking-widest font-bold">
              Institutional Invitation
            </Badge>
            <h2 className="text-5xl font-extrabold leading-tight tracking-tight">
              Join the academic community at {invitation.schoolName}.
            </h2>
            <p className="text-emerald-100/80 text-lg leading-relaxed">
              You've been invited by <span className="text-white font-bold">{invitation.inviterName}</span> to join as a <span className="text-amber-400 font-bold">Mentor</span>. 
              Set up your secure portal access to begin managing your classes and tracking student progress.
            </p>
          </div>
        </div>

        <div className="relative z-10 pt-12 border-t border-white/10 flex items-center justify-between">
          <div className="flex -space-x-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-10 w-10 rounded-full border-2 border-[#004d40] bg-emerald-800 flex items-center justify-center text-xs font-bold">
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
          <p className="text-sm text-emerald-200/60 font-medium italic">
            Part of {invitation.schoolName}'s digital transformation.
          </p>
        </div>
      </div>

      {/* Right Column: Acceptance Form */}
      <div className="flex items-center justify-center p-8 bg-gray-50/50">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
          <div className="text-center lg:text-left space-y-2">
            <h3 className="text-2xl font-bold text-gray-900">Complete Your Setup</h3>
            <p className="text-gray-500">Secure your account with a strong password.</p>
          </div>

          <Card className="border-none shadow-xl shadow-gray-200/50 overflow-hidden">
            <div className="bg-amber-400 h-1.5 w-full" />
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm text-[#004d40]">
                    <User size={18} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Assigned Name</label>
                    <p className="font-semibold text-gray-900">{invitation.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm text-[#004d40]">
                    <Mail size={18} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Institutional Email</label>
                    <p className="font-semibold text-gray-900">{invitation.email}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="password">Create Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 h-12"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Shield size={10} />
                    Minimum 8 characters with a mix of symbols.
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
                      className="pl-10 h-12"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-[#004d40] hover:bg-[#003d33] text-white font-bold rounded-lg shadow-lg shadow-[#004d40]/10 transition-all active:scale-[0.98]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Activate Account
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-gray-400 px-6">
            By activating your account, you agree to ClassBridge's <span className="font-bold underline cursor-pointer">Terms of Service</span> and <span className="font-bold underline cursor-pointer">Data Policy</span> which applies to {invitation.schoolName}.
          </p>
        </div>
      </div>
    </div>
  );
}


