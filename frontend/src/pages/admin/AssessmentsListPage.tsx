import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Eye, Edit, Plus, FileSpreadsheet } from 'lucide-react';
import { assessmentService } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import type { Assessment } from '@/types';

import { ClipboardCheck, FileText, AlertCircle, Clock, ShieldCheck, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AssessmentsListPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const getSchoolId = useAuthStore((state) => state.getSchoolId);
  const isSystemAdmin = useAuthStore((state) => state.isSystemAdmin);
  const isStudent = useAuthStore((state) => state.isStudent);

  useEffect(() => {
    async function fetchAssessments() {
      try {
        const schoolId = isSystemAdmin() ? undefined : getSchoolId();
        const { data } = await assessmentService.getAll({ limit: 100, schoolId });
        setAssessments((data as { data?: Assessment[] })?.data || []);
      } catch (error) {
        console.error('Failed to fetch assessments:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAssessments();
  }, [getSchoolId, isSystemAdmin]);

  const filteredAssessments = assessments.filter(ass =>
    ass.title.toLowerCase().includes(search.toLowerCase()) ||
    (ass.description && ass.description.toLowerCase().includes(search.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-[#064e3b] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 text-[#0f172a]">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-[#064e3b] p-8 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-[#fbbf24] flex items-center justify-center text-[#064e3b] shadow-lg">
                  <ClipboardCheck className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tight text-[#fef3c7]">Examination Control</h2>
                <p className="mt-1 text-emerald-100/90 font-medium italic">Monitor, evaluate, and track student performance</p>
              </div>
          </div>
          {!isStudent() && (
            <Link to="/assessments/create">
              <Button className="bg-[#fbbf24] hover:bg-[#d97706] text-[#064e3b] font-bold px-8 h-12 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 border-none group">
                Create Assessment
                <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          )}
        </div>
        
        {/* Background Graphic */}
        <div className="absolute right-0 top-0 h-full w-1/4 bg-white/5 blur-3xl rounded-full translate-x-20" />
      </div>

      {/* Advanced Research Tool */}
      <div className="relative group max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400 group-focus-within:text-[#064e3b] transition-colors" />
        <Input
          placeholder="Lookup assessments by title or keywords..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-14 h-16 bg-white border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-[#064e3b]/10 focus:border-[#064e3b] transition-all text-lg font-medium"
        />
      </div>

      {/* Modern Table Layout */}
      <Card className="overflow-hidden border-none shadow-2xl rounded-[2rem] bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Assessment Details</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Target Class</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Benchmarks</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Attempts</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Lifecycle</th>
                  <th className="px-8 py-5 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredAssessments.map((ass) => (
                  <tr key={ass._id} className="hover:bg-emerald-50/20 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 group-hover:bg-[#064e3b] group-hover:text-[#fef3c7] transition-all">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-black text-[#0f172a] text-lg leading-tight uppercase tracking-tight">{ass.title}</div>
                          <div className="text-xs text-slate-400 font-bold mt-1 line-clamp-1 italic max-w-[250px]">{ass.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <Badge variant="outline" className="text-slate-600 font-bold border-slate-200 rounded-lg px-3 py-1">
                          {ass.classId}
                      </Badge>
                    </td>
                    <td className="px-8 py-6 text-center">
                        <div className="inline-flex flex-col items-center">
                            <span className="font-black text-[#064e3b] text-xl tracking-tighter">{ass.passingScore}%</span>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest uppercase">Target</span>
                        </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                        <span className="px-3 py-1 bg-slate-100 rounded-lg text-slate-500 font-bold text-sm">
                            {ass.maxAttempts > 0 ? `${ass.maxAttempts} Allowed` : 'Unrestricted'}
                        </span>
                    </td>
                    <td className="px-8 py-6 text-center text-center">
                        <Badge className={cn(
                            "rounded-full px-4 py-1 font-black tracking-wide border-none",
                            ass.isActive ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        )}>
                            {ass.isActive ? 'PUBLISHED' : 'DRAFT'}
                        </Badge>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={`/assessments/${ass._id}`}>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-emerald-100 hover:text-[#064e3b]">
                            <Eye className="h-5 w-5" />
                          </Button>
                        </Link>
                        {!isStudent() && (
                          <Link to={`/assessments/${ass._id}/edit`}>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-amber-100 hover:text-amber-600">
                              <Edit className="h-5 w-5" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredAssessments.length === 0 && (
            <div className="text-center py-32 px-4 bg-slate-50/30">
                <div className="h-24 w-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-slate-100">
                    <AlertCircle className="w-12 h-12 text-slate-200" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">No academic evaluations found</h3>
                <p className="text-slate-400 font-medium max-w-[350px] mx-auto mt-2">
                  {isStudent() ? "Your instructional faculty has not yet finalized any evaluations for your current curriculum." : "It's time to build your first professional assessment and begin monitoring student progress."}
                </p>
                {!isStudent() && (
                  <Link to="/assessments/create" className="inline-block mt-10">
                    <Button className="rounded-2xl px-10 h-14 font-black bg-[#064e3b] text-[#fef3c7] shadow-xl hover:scale-105 active:scale-95 transition-all text-lg">
                        Build First Assessment
                    </Button>
                  </Link>
                )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Institutional Note */}
      <div className="flex items-center gap-3 p-6 bg-amber-50 rounded-2xl border border-amber-100 text-amber-800">
          <ShieldCheck className="h-6 w-6" />
          <p className="text-sm font-bold tracking-tight italic">
              All assessments on this platform are subject to institutional oversight and adhere to international academic standards.
          </p>
      </div>
    </div>
  );
}

export default AssessmentsListPage;
