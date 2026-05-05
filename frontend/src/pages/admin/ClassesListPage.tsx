import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Eye, Edit } from 'lucide-react';
import { classService } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import type { Class } from '@/types';

import { Calendar, Clock, GraduationCap, Users, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ClassesListPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const getSchoolId = useAuthStore((state) => state.getSchoolId);
  const isSystemAdmin = useAuthStore((state) => state.isSystemAdmin);

  useEffect(() => {
    async function fetchClasses() {
      try {
        const schoolId = isSystemAdmin() ? undefined : getSchoolId();
        const { data } = await classService.getAll({ limit: 100, schoolId });
        setClasses((data as { data?: Class[] })?.data || []);
      } catch (error) {
        console.error('Failed to fetch classes:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchClasses();
  }, [getSchoolId, isSystemAdmin]);

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(search.toLowerCase()) ||
    (cls.cohort && cls.cohort.toLowerCase().includes(search.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-[#064e3b] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Institutional Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#064e3b] to-[#065f46] p-10 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
              <div className="h-16 w-16 rounded-2xl bg-amber-400 flex items-center justify-center text-[#064e3b] shadow-lg">
                  <GraduationCap className="h-10 w-10" />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tight text-[#fef3c7]">Academic Classes</h2>
                <p className="mt-2 text-emerald-100/80 font-medium italic">Manage cohorts, durations, and instructional sessions</p>
              </div>
          </div>
          <Link to="/classes/create">
            <Button className="bg-[#fbbf24] hover:bg-[#d97706] text-[#064e3b] font-bold px-10 h-14 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 border-none text-lg">
              Initialize New Class
            </Button>
          </Link>
        </div>
        
        {/* Background Accents */}
        <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-[-20deg] translate-x-20" />
      </div>

      {/* Modern Search */}
      <div className="relative group max-w-2xl">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400 group-focus-within:text-[#064e3b] transition-colors" />
        <Input
          placeholder="Search items by designation or cohort..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-14 h-16 bg-white border-slate-200 rounded-3xl shadow-md focus:ring-4 focus:ring-[#064e3b]/10 focus:border-[#064e3b] transition-all text-xl"
        />
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredClasses.map((cls) => (
          <Card key={cls._id} className="group overflow-hidden rounded-[2.5rem] border-none shadow-xl hover:shadow-2xl transition-all duration-300 bg-white hover:-translate-y-2">
            <div className="h-3 bg-[#064e3b]" />
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-6">
                <Badge className={cn(
                  "rounded-full px-4 py-1 font-black uppercase tracking-tighter",
                  cls.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                )}>
                  {cls.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <div className="flex gap-2">
                    <Link to={`/classes/${cls._id}/edit`}>
                        <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 hover:bg-amber-50 text-amber-600">
                            <Edit className="h-5 w-5" />
                        </Button>
                    </Link>
                </div>
              </div>

              <Link to={`/classes/${cls._id}`} className="block group/title">
                <h3 className="text-2xl font-black text-slate-900 group-hover/title:text-[#064e3b] transition-colors line-clamp-1">{cls.name}</h3>
                <p className="text-slate-400 font-bold text-sm tracking-wide mt-1 uppercase">{cls.schoolName || 'Main Campus'}</p>
              </Link>

              <div className="mt-8 space-y-4 border-t border-slate-50 pt-6 text-slate-600 font-medium">
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-emerald-600" />
                  <span>Academic Year: <span className="text-slate-900 font-bold">{cls.academicYear}</span></span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-amber-500" />
                  <span>Duration: <span className="text-slate-900 font-bold">{cls.duration}</span></span>
                </div>
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-5 w-5 text-blue-500" />
                  <span>Cohort: <span className="text-slate-900 font-bold">{cls.cohort || 'General'}</span></span>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[#064e3b]">
                      <Users className="h-5 w-5" />
                      <span className="text-lg font-black tracking-tighter">42 Enrolled</span>
                  </div>
                  <Link to={`/classes/${cls._id}`}>
                      <Button className="rounded-2xl px-6 font-bold bg-slate-900 text-white hover:bg-[#064e3b] transition-colors">
                          View Roster
                      </Button>
                  </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClasses.length === 0 && (
        <div className="text-center py-32 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <GraduationCap className="h-24 w-24 text-slate-200 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-slate-900">No classes identified</h3>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto font-medium">Capture or import your first academic session to begin operations.</p>
            <Link to="/classes/create" className="inline-block mt-10">
                <Button className="bg-[#064e3b] text-[#fef3c7] font-black h-14 px-10 rounded-2xl shadow-lg">
                    Build First Class
                </Button>
            </Link>
        </div>
      )}
    </div>
  );
}

export default ClassesListPage;