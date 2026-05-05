import { useAuthStore } from '@/stores/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { User, Mail, Shield, Building, Calendar, Edit, ChevronRight, Camera, BadgeCheck, ShieldCheck, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
      {/* Premium Profile Header */}
      <div className="relative group">
        <div className="h-72 w-full rounded-[2.5rem] bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#042f24] shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-400/10 blur-[100px] rounded-full" />
            
            <div className="absolute bottom-10 right-10 flex items-center gap-3">
                <Badge className="bg-white/10 backdrop-blur-md text-emerald-100 font-medium px-5 py-1.5 rounded-full border border-white/10 text-xs tracking-wider shadow-xl">
                    INSTITUTIONAL MEMBER
                </Badge>
                <div className="h-10 w-10 rounded-full bg-emerald-500/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
                    <ShieldCheck className="h-5 w-5 text-emerald-400" />
                </div>
            </div>
        </div>
        
        <div className="absolute -bottom-12 left-12 flex flex-col md:flex-row items-end gap-8">
            <div className="relative">
                <div className="h-44 w-44 rounded-[2.5rem] bg-white p-2.5 shadow-2xl ring-1 ring-slate-100">
                    <div className="h-full w-full rounded-[2rem] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center text-[#064e3b] text-5xl font-semibold border border-slate-200">
                        {user.name.charAt(0)}
                    </div>
                </div>
                <button className="absolute bottom-3 right-3 h-11 w-11 bg-white rounded-2xl flex items-center justify-center text-slate-600 shadow-xl border border-slate-100 hover:text-[#064e3b] hover:scale-105 transition-all">
                    <Camera className="h-5 w-5" />
                </button>
            </div>
            <div className="pb-4 space-y-1">
                <div className="flex items-center gap-3">
                    <h1 className="text-4xl font-semibold text-slate-900 tracking-tight">{user.name}</h1>
                    <BadgeCheck className="h-6 w-6 text-blue-500" />
                </div>
                <div className="flex items-center gap-2 text-slate-500 font-medium bg-slate-50 px-3 py-1 rounded-full border border-slate-100 w-fit">
                    <Mail className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm">{user.email}</span>
                </div>
            </div>
        </div>
      </div>

      <div className="pt-24 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation / Info Sidebar */}
        <div className="lg:col-span-4 space-y-6">
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white sticky top-24 overflow-hidden ring-1 ring-slate-100">
                <CardContent className="p-10 space-y-8">
                    <div>
                        <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] mb-6">Security Clearance</h3>
                        
                        <div className="space-y-6">
                            {[
                                { icon: Shield, label: 'Account Authority', value: user.role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '), color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                { icon: Building, label: 'Primary Institution', value: user.schoolName || 'Central Registry', color: 'text-blue-600', bg: 'bg-blue-50' },
                                { icon: Calendar, label: 'Matriculation Date', value: new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), color: 'text-amber-600', bg: 'bg-amber-50' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 group">
                                    <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110", item.bg, item.color)}>
                                        <item.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-medium text-slate-400 leading-none mb-1">{item.label}</p>
                                        <p className="text-sm font-semibold text-slate-800">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4">
                        <Link to="/profile/edit">
                            <Button className="w-full h-14 rounded-2xl bg-slate-900 font-semibold hover:bg-[#064e3b] shadow-xl hover:shadow-emerald-900/10 transition-all active:scale-95 group">
                                Update Academic Records
                                <Edit className="ml-3 h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Deep Identity Profile */}
        <div className="lg:col-span-8 space-y-8">
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden ring-1 ring-slate-100">
                <CardHeader className="px-10 pt-10 pb-6 border-b border-slate-50">
                    <CardTitle className="text-xl font-semibold text-slate-900 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                            <User className="h-4 w-4 text-emerald-600" />
                        </div>
                        Official Identification
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                        {[
                            { label: 'Full Academic Name', value: user.name },
                            { label: 'Secondary Email', value: user.email },
                            { label: 'Matric Number / ID', value: user._id, mono: true },
                            { label: 'Matriculation Status', value: 'Authorized & Active', status: true }
                        ].map((field, i) => (
                            <div key={i} className="space-y-1.5 group">
                                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest leading-none ml-1 group-hover:text-emerald-600 transition-colors">{field.label}</p>
                                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group-hover:bg-white group-hover:border-emerald-100 group-hover:shadow-lg group-hover:shadow-emerald-900/5 transition-all">
                                    {field.status ? (
                                        <div className="flex items-center gap-2.5">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                            <span className="text-base font-semibold text-emerald-700">{field.value}</span>
                                        </div>
                                    ) : (
                                        <p className={cn("text-base font-semibold text-slate-700", field.mono && "font-mono text-sm tracking-tight")}>
                                            {field.value}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { 
                        label: 'Academic Standing', 
                        value: user.stats?.academicStanding || (user.role === 'student' ? 'Good Standing' : 'Faculty Member'), 
                        desc: user.role === 'student' ? `Current GPA: ${user.stats?.gpa || '0.00'}` : 'Institutional Authority', 
                        bg: 'bg-emerald-600' 
                    },
                    { 
                        label: 'Course Completion', 
                        value: `${user.stats?.courseCompletion || 0}%`, 
                        desc: 'Current Course Load Progress', 
                        bg: 'bg-slate-900' 
                    },
                    { 
                        label: 'Security Score', 
                        value: (user.stats?.securityScore || 0) >= 80 ? 'High' : (user.stats?.securityScore || 0) >= 60 ? 'Medium' : 'Low', 
                        desc: `System Trust Rating: ${user.stats?.securityScore || 0}%`, 
                        bg: 'bg-emerald-800' 
                    }
                ].map((stat, i) => (
                    <Card key={i} className={cn("rounded-[2rem] border-none shadow-xl p-8 text-white relative overflow-hidden", stat.bg)}>
                        <div className="relative z-10">
                            <p className="text-[10px] font-medium text-white/60 uppercase tracking-widest mb-1">{stat.label}</p>
                            <h4 className="text-2xl font-semibold mb-2">{stat.value}</h4>
                            <p className="text-xs text-white/50">{stat.desc}</p>
                        </div>
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Award className="h-16 w-16 -mr-4 -mt-4 rotate-12" />
                        </div>
                    </Card>
                ))}
            </div>

            <Card className="rounded-[2.5rem] border-none shadow-2xl bg-[#064e3b] text-white overflow-hidden relative">
                <CardContent className="p-12 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="space-y-3">
                            <h3 className="text-3xl font-semibold text-emerald-100 tracking-tight">Institutional Integrity</h3>
                            <p className="text-emerald-100/60 font-medium max-w-md text-sm leading-relaxed">
                                Your account is protected by mandatory two-factor authentication and institutional-grade encryption. All academic actions are logged for audit transparency.
                            </p>
                        </div>
                        <Link to="/settings" className="shrink-0">
                            <Button variant="outline" className="bg-white/10 border-white/20 text-white rounded-2xl h-14 px-8 font-semibold hover:bg-white/20 backdrop-blur-lg">
                                Security Portal <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </CardContent>
                
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 h-64 w-64 bg-emerald-400/10 blur-[80px] rounded-full translate-x-32 -translate-y-32" />
            </Card>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
