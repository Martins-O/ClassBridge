import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, FileDown, Eye, FileText, LayoutGrid, Download, History, Award, CheckCircle2, MoreVertical, ShieldCheck } from 'lucide-react';
import { transcriptService, Transcript } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils';

export function TranscriptsListPage() {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const getSchoolId = useAuthStore((state) => state.getSchoolId);

  useEffect(() => {
    async function fetchTranscripts() {
      try {
        const schoolId = getSchoolId();
        const { data } = await transcriptService.getAll({ limit: 100, schoolId });
        setTranscripts((data as any)?.data || []);
      } catch (error) {
        console.error('Failed to fetch transcripts:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTranscripts();
  }, [getSchoolId]);

  const filteredTranscripts = transcripts.filter(t =>
    t.studentName?.toLowerCase().includes(search.toLowerCase()) ||
    t.className?.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = async (id: string, format: 'pdf' | 'csv') => {
    try {
      const response = await transcriptService.export(id, format);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transcript-${id}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to export transcript:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-[#064e3b] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* High-Impact Header */}
      <div className="relative overflow-hidden rounded-[2rem] bg-slate-900 p-10 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
              <div className="h-16 w-16 rounded-2xl bg-[#064e3b] flex items-center justify-center text-[#fbbf24] shadow-lg border border-[#064e3b]/50">
                  <Award className="h-10 w-10" />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tight text-white uppercase">Registrar Office</h2>
                <p className="mt-1 text-slate-400 font-bold tracking-widest text-xs uppercase">Official Academic Record Certification & Archival</p>
              </div>
          </div>
          <Link to="/transcripts/generate">
            <Button className="bg-[#fbbf24] hover:bg-white text-[#064e3b] font-black px-10 h-14 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 border-none text-lg">
              Generate Certification
            </Button>
          </Link>
        </div>
        
        {/* Background Visuals */}
        <div className="absolute right-0 bottom-0 opacity-10">
            <LayoutGrid className="h-64 w-64 -translate-y-12 translate-x-12" />
        </div>
      </div>

      {/* Registrar Search Tool */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400 group-focus-within:text-[#064e3b] transition-colors" />
          <Input
            placeholder="Identity Verification: Enter student name or record ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-14 h-16 bg-white border-none rounded-2xl shadow-lg focus:ring-4 focus:ring-[#064e3b]/10 transition-all text-lg font-bold"
          />
        </div>
        <div className="flex gap-2">
            <Button variant="outline" className="h-16 px-6 rounded-2xl border-none shadow-lg bg-white font-black text-slate-500 hover:text-[#064e3b]">
                <History className="h-6 w-6 mr-2" />
                Audit Logs
            </Button>
        </div>
      </div>

      {/* Record Listings */}
      <Card className="overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 italic">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Validated Student</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Academic Cohort</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Performance Index</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Archival Date</th>
                  <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredTranscripts.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center text-[#fbbf24] font-black">
                            {t.studentName?.charAt(0)}
                        </div>
                        <div className="font-black text-slate-800 text-lg tracking-tight uppercase">{t.studentName}</div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-bold text-slate-500">{t.className}</span>
                    </td>
                    <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-[#064e3b]" 
                                    style={{ width: `${(t.gpa / 4.0) * 100}%` }}
                                />
                            </div>
                            <span className="font-black text-[#0f172a]">{t.gpa.toFixed(2)}</span>
                        </div>
                    </td>
                    <td className="px-8 py-6">
                      <Badge className={cn(
                        "rounded-full px-4 py-1 font-black",
                        t.status === 'final' ? "bg-indigo-100 text-indigo-700" : "bg-amber-100 text-amber-700"
                      )}>
                        {t.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-8 py-6">
                        <div className="flex items-center gap-1.5 text-slate-400 font-bold text-sm">
                            <History className="h-4 w-4" />
                            {new Date(t.createdAt).toLocaleDateString()}
                        </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                            onClick={() => handleExport(t._id, 'pdf')} 
                            variant="ghost" 
                            size="icon" 
                            className="h-12 w-12 rounded-2xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all"
                        >
                            <FileDown className="h-6 w-6" />
                        </Button>
                        <Link to={`/transcripts/${t._id}`}>
                          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all">
                            <Eye className="h-6 w-6" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredTranscripts.length === 0 && (
            <div className="text-center py-40 bg-slate-50/20">
                <div className="h-32 w-32 bg-white rounded-[2.5rem] shadow-xl flex items-center justify-center mx-auto mb-8 border border-slate-100">
                    <FileText className="w-16 h-16 text-slate-200" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Zero archival records</h3>
                <p className="text-slate-500 font-bold mt-2 max-w-sm mx-auto uppercase tracking-widest text-xs">Awaiting primary record generation for current academic semester</p>
                <Link to="/transcripts/generate" className="inline-block mt-12">
                    <Button className="rounded-2xl px-12 h-16 font-black bg-slate-900 text-[#fbbf24] shadow-2xl hover:scale-105 transition-all text-lg">
                        Execute Generation
                    </Button>
                </Link>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Security Verification Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-8 bg-indigo-50/50 rounded-3xl border border-indigo-100">
          <div className="flex items-center gap-4">
              <ShieldCheck className="h-10 w-10 text-indigo-600" />
              <div>
                  <h4 className="font-black text-indigo-900 uppercase tracking-tight">Cryptographic Validation</h4>
                  <p className="text-indigo-700/70 text-sm font-medium">All generated transcripts are digitally signed and immutable for academic integrity.</p>
              </div>
          </div>
          <Button variant="outline" className="mt-4 sm:mt-0 rounded-xl border-indigo-200 text-indigo-700 font-bold hover:bg-indigo-100">
              Verify Document
          </Button>
      </div>
    </div>
  );
}

export default TranscriptsListPage;
