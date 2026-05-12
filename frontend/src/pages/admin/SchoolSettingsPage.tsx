import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';
import { schoolService } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Mail, Phone, MapPin, Globe, Save, ArrowLeft, Camera, ShieldCheck, Info } from 'lucide-react';
import { toast } from 'sonner';
import { School } from '@/types';

export function SchoolSettingsPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    website: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const schoolId = useAuthStore.getState().getSchoolId();

  useEffect(() => {
    async function fetchSchool() {
      if (!schoolId) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await schoolService.getById(schoolId);
        const school = (response.data as any)?.data;
        if (school) {
          setFormData({
            name: school.name || '',
            email: school.email || '',
            phone: school.phone || '',
            address: school.address || '',
            city: school.city || '',
            state: school.state || '',
            website: school.website || '',
            description: school.description || '',
          });
        }
      } catch (error) {
        console.error('Failed to fetch school settings:', error);
        toast.error('Failed to load institutional records');
      } finally {
        setIsLoading(false);
      }
    }
    fetchSchool();
  }, [schoolId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolId) return;

    setIsSubmitting(true);
    try {
      await schoolService.update(schoolId, formData);
      toast.success('Institutional profile updated successfully');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Failed to update school settings:', error);
      toast.error(error.response?.data?.error || 'Validation failed during update');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-10 w-10 border-4 border-[#064e3b] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight text-emerald-950">Institutional Profile</h1>
          <p className="text-sm text-slate-500 font-medium">Manage your school's official identity and public records</p>
        </div>
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard')}
          className="rounded-2xl hover:bg-slate-100 font-semibold group w-fit"
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Dashboard Overview
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden ring-1 ring-slate-100 p-8 flex flex-col items-center text-center">
            <div className="relative group mb-6">
              <div className="h-32 w-32 rounded-[2rem] bg-gradient-to-br from-emerald-50 to-emerald-100 text-[#064e3b] flex items-center justify-center text-4xl font-semibold border border-emerald-200">
                {formData.name?.charAt(0) || <Building2 className="h-12 w-12" />}
              </div>
              <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-white rounded-xl shadow-lg border border-slate-100 flex items-center justify-center text-slate-500">
                <Camera className="h-4 w-4" />
              </div>
            </div>
            
            <div className="space-y-1 mb-6 w-full">
              <h3 className="font-semibold text-xl text-slate-900 tracking-tight truncate">{formData.name || 'Unnamed Institution'}</h3>
              <p className="text-emerald-600 font-medium text-[10px] uppercase tracking-[0.2em] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 mx-auto w-fit">
                Institutional Profile
              </p>
            </div>

            <div className="w-full pt-6 border-t border-slate-50 space-y-4">
              <div className="flex items-start gap-3 bg-[#064e3b]/5 p-4 rounded-2xl border border-[#064e3b]/10 text-left">
                <Info className="h-5 w-5 text-[#064e3b] shrink-0 mt-0.5" />
                <p className="text-[11px] font-medium text-[#064e3b] leading-relaxed">
                  Transparency and accuracy of your school's information builds trust with the academic community.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Form Details */}
        <div className="lg:col-span-8 space-y-8">
          <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden ring-1 ring-slate-100">
            <CardHeader className="p-10 pb-6 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-[#064e3b] flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-slate-900">Identification & Branding</CardTitle>
                  <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-widest leading-none">Official Identity Synchronization</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2.5">
                  <Label htmlFor="name" className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest ml-1">Institution Name</Label>
                  <div className="relative group">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[#064e3b] transition-colors" />
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-12 h-14 bg-slate-50 border-slate-100 rounded-2xl focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all text-base font-medium shadow-sm"
                      placeholder="School Name"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="email" className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest ml-1">Official Registry Email</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[#064e3b] transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-12 h-14 bg-slate-50 border-slate-100 rounded-2xl focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all text-base font-medium shadow-sm"
                      placeholder="Email"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="phone" className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest ml-1">Contact Hotline</Label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[#064e3b] transition-colors" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="pl-12 h-14 bg-slate-50 border-slate-100 rounded-2xl focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all text-base font-medium shadow-sm"
                      placeholder="Phone"
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="website" className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest ml-1">Public Portal URL</Label>
                  <div className="relative group">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[#064e3b] transition-colors" />
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="pl-12 h-14 bg-slate-50 border-slate-100 rounded-2xl focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all text-base font-medium shadow-sm"
                      placeholder="Website"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="description" className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest ml-1">Institutional Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell us about your institution..."
                  className="min-h-[120px] bg-slate-50 border-slate-100 rounded-2xl p-4 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all text-base font-medium"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden ring-1 ring-slate-100">
            <CardHeader className="p-10 pb-6 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-slate-900 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-slate-900">Geographic Location</CardTitle>
                  <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-widest leading-none">Global Presence Registry</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="space-y-2.5">
                <Label htmlFor="address" className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest ml-1">Street Address</Label>
                <div className="relative group">
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="h-14 bg-slate-50 border-slate-100 rounded-2xl focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all text-base font-medium shadow-sm"
                    placeholder="Street Address"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2.5">
                  <Label htmlFor="city" className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest ml-1">City / Region</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="h-14 bg-slate-50 border-slate-100 rounded-2xl focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all text-base font-medium shadow-sm"
                    placeholder="City"
                  />
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="state" className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest ml-1">State / Province</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="h-14 bg-slate-50 border-slate-100 rounded-2xl focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all text-base font-medium shadow-sm"
                    placeholder="State"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-none shadow-2xl bg-[#064e3b] text-white overflow-hidden relative">
            <CardContent className="p-12 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6 text-emerald-400" />
                  Apply Changes
                </h3>
                <p className="text-emerald-100/60 font-medium text-sm">Synchronize your school's data with the global ClassBridge registry.</p>
              </div>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-white text-[#064e3b] hover:bg-emerald-50 h-16 px-10 rounded-2xl font-bold text-lg shadow-xl active:scale-[0.98] transition-all min-w-[200px]"
              >
                {isSubmitting ? 'Synchronizing...' : 'Save Records'}
                {!isSubmitting && <Save className="ml-3 h-5 w-5" />}
              </Button>
            </CardContent>
            <div className="absolute top-0 right-0 h-64 w-64 bg-emerald-400/10 blur-[80px] rounded-full translate-x-32 -translate-y-32" />
          </Card>
        </div>
      </form>
    </div>
  );
}

export default SchoolSettingsPage;
