import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';
import { userService } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Save, ArrowLeft, ShieldCheck, BadgeCheck, Camera } from 'lucide-react';
import { toast } from 'sonner';

export function EditProfilePage() {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id) return;

    setIsSubmitting(true);
    try {
      const { data } = await userService.update(user._id, formData);
      const updatedUser = (data as any).user;
      if (updatedUser) {
          setUser(updatedUser);
          toast.success('Institutional records updated successfully');
          navigate('/profile');
      }
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast.error(error.response?.data?.error || 'Validation failed during update');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in slide-in-from-bottom-4 duration-700">
      {/* Refined Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
              <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Institutional Records</h1>
              <p className="text-sm text-slate-500 font-medium">Manage your professional identity and credentials</p>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/profile')}
            className="rounded-2xl hover:bg-slate-100 font-semibold group w-fit"
          >
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Return to Profile
          </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Sidebar Quick Look */}
        <div className="lg:col-span-4 space-y-6">
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden ring-1 ring-slate-100 p-8 flex flex-col items-center text-center">
                <div className="relative group mb-6">
                    <div className="h-32 w-32 rounded-[2rem] bg-gradient-to-br from-emerald-50 to-emerald-100 text-[#064e3b] flex items-center justify-center text-4xl font-semibold border border-emerald-200">
                        {formData.name.charAt(0)}
                    </div>
                    <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-white rounded-xl shadow-lg border border-slate-100 flex items-center justify-center text-slate-500">
                        <Camera className="h-4 w-4" />
                    </div>
                </div>
                
                <div className="space-y-1 mb-6">
                    <h3 className="font-semibold text-xl text-slate-900 tracking-tight">{formData.name}</h3>
                    <p className="text-emerald-600 font-medium text-xs uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                        {user.role.replace('_', ' ')}
                    </p>
                </div>

                <div className="w-full pt-6 border-t border-slate-50 space-y-4">
                    <div className="flex items-start gap-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50 text-left">
                        <BadgeCheck className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-[11px] font-medium text-amber-900 leading-relaxed">
                            Your full legal name is used for official transcripts and certification.
                        </p>
                    </div>
                </div>
            </Card>
        </div>

        {/* Identity Form */}
        <div className="lg:col-span-8">
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden ring-1 ring-slate-100">
                <CardHeader className="p-10 pb-6 border-b border-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-slate-900 flex items-center justify-center">
                            <Save className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-semibold text-slate-900">Personal Details</CardTitle>
                            <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-widest leading-none">Identity synchronization</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-10">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 gap-8">
                            <div className="space-y-2.5">
                                <Label htmlFor="name" className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest ml-1">Full Legal Name</Label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="pl-12 h-14 bg-slate-50/50 border-slate-100 rounded-2xl focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all text-base font-medium shadow-sm"
                                        placeholder="Enter your official name"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <Label htmlFor="email" className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest ml-1">Verified Institutional Email</Label>
                                <div className="relative group opacity-80">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        className="pl-12 h-14 bg-slate-100/50 border-slate-100 rounded-2xl cursor-not-allowed font-medium text-slate-500 shadow-sm"
                                        disabled
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-2 ml-1">
                                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                    <p className="text-[10px] text-slate-400 font-semibold italic">Email modifications require registrar intervention.</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-50">
                            <Button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full h-14 rounded-2xl bg-[#064e3b] text-white font-semibold text-base hover:bg-slate-900 shadow-xl hover:shadow-emerald-900/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Synchronizing Records...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Update Institutional Profile</span>
                                        <Save className="h-4 w-4 opacity-70" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

export default EditProfilePage;
