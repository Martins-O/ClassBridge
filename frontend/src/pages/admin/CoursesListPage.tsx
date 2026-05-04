import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Eye, Edit } from 'lucide-react';
import { courseService } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import type { Course } from '@/types';

import { BookOpen, BookText, Bookmark, GraduationCap, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CoursesListPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const getSchoolId = useAuthStore((state) => state.getSchoolId);
  const isSystemAdmin = useAuthStore((state) => state.isSystemAdmin);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const schoolId = isSystemAdmin() ? undefined : getSchoolId();
        const { data } = await courseService.getAll({ limit: 100, schoolId });
        setCourses((data as { data?: Course[] })?.data || []);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCourses();
  }, [getSchoolId, isSystemAdmin]);

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(search.toLowerCase()) ||
    (course.code && course.code.toLowerCase().includes(search.toLowerCase()))
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
      {/* Course Catalog Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-[#064e3b] p-10 text-white shadow-2xl transition-all duration-500">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-8">
              <div className="h-20 w-20 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-amber-400 shadow-2xl">
                  <BookOpen className="h-12 w-12" />
              </div>
              <div>
                <h2 className="text-4xl font-black tracking-tight text-[#fef3c7]">Course Catalog</h2>
                <p className="mt-2 text-emerald-100 font-bold tracking-wide italic uppercase text-sm">Curriculum management & academic excellence</p>
              </div>
          </div>
          <Link to="/courses/create">
            <Button className="bg-[#fbbf24] hover:bg-white text-[#064e3b] font-black px-10 h-16 rounded-[1.5rem] shadow-2xl transition-all hover:scale-105 active:scale-95 border-none text-xl group">
              Register Course
              <ChevronRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
        
        {/* Dynamic Pattern Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute right-0 top-0 w-64 h-64 border-[40px] border-white rounded-full translate-x-32 -translate-y-32" />
            <div className="absolute left-1/2 bottom-0 w-96 h-96 border-[60px] border-amber-400 rounded-full -translate-x-1/2 translate-y-48" />
        </div>
      </div>

      {/* Advanced Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400 group-focus-within:text-[#064e3b] transition-colors" />
          <Input
            placeholder="Explore courses by name, curriculum code or identifier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-16 h-16 bg-white border-none rounded-3xl shadow-lg ring-1 ring-slate-100 focus:ring-4 focus:ring-[#064e3b]/10 transition-all text-xl"
          />
        </div>
        <Button variant="outline" className="h-16 rounded-3xl border-none shadow-lg bg-white font-black text-slate-600 hover:text-[#064e3b] px-8">
            Advanced Filters
        </Button>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {filteredCourses.map((course) => (
          <Card key={course._id} className="group overflow-hidden rounded-[2.5rem] border-none shadow-xl hover:shadow-2xl transition-all duration-500 bg-white hover:-translate-y-1 flex flex-col sm:flex-row">
            <div className="w-full sm:w-48 bg-emerald-50 p-8 flex items-center justify-center relative overflow-hidden group-hover:bg-[#064e3b] transition-colors duration-500">
                <BookText className="h-20 w-20 text-[#064e3b] group-hover:text-[#fef3c7] transition-all duration-500 relative z-10" />
                <div className="absolute -right-4 -bottom-4 text-emerald-100/50 dark:text-emerald-900/10 font-black text-6xl group-hover:text-white/5 transition-colors duration-500 uppercase rotate-12">{course.code || 'CRS'}</div>
            </div>
            
            <CardContent className="p-8 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-2">
                    <Badge variant="outline" className="rounded-xl border-emerald-100 bg-emerald-50/50 text-emerald-700 font-black px-3 py-1">
                      {course.credits} Credits
                    </Badge>
                  </div>
                  <Badge className={cn(
                    "rounded-xl px-4 py-1 font-black tracking-wide",
                    course.isActive ? "bg-[#064e3b] text-[#fef3c7]" : "bg-slate-100 text-slate-500"
                  )}>
                    {course.isActive ? 'Live' : 'Locked'}
                  </Badge>
                </div>

                <Link to={`/courses/${course._id}`} className="block mt-2">
                  <h3 className="text-2xl font-black text-slate-900 group-hover:text-[#064e3b] transition-colors leading-tight mb-2 uppercase tracking-tight">{course.name}</h3>
                  <div className="flex items-center gap-1 text-[#fbbf24] mb-4">
                      {[...Array(5)].map((_, i) => (
                          <Bookmark key={i} className="h-3.5 w-3.5 fill-current" />
                      ))}
                      <span className="text-xs text-slate-400 font-black ml-2 uppercase tracking-widest">{course.code || 'No Code Assigned'}</span>
                  </div>
                </Link>

                <div className="grid grid-cols-2 gap-4 mt-6 border-t border-slate-50 pt-6">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Institution</p>
                        <p className="font-bold text-slate-800 text-sm truncate">{course.schoolName || 'Global Institute'}</p>
                    </div>
                    <div className="space-y-1 text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Class Assignment</p>
                        <p className="font-bold text-[#064e3b] text-sm truncate">{course.className || 'General Access'}</p>
                    </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-end gap-3 pt-6 border-t border-slate-50">
                  <Link to={`/courses/${course._id}/edit`}>
                      <Button variant="outline" className="rounded-xl font-black border-slate-100 text-slate-400 hover:text-amber-600 hover:border-amber-100 transition-all">
                        Edit Structure
                      </Button>
                  </Link>
                  <Link to={`/courses/${course._id}`}>
                      <Button className="rounded-xl font-black bg-slate-900 text-white hover:bg-[#064e3b] px-6 shadow-md transition-all active:scale-95">
                        Manage Curriculum
                      </Button>
                  </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-40 bg-white rounded-[3rem] shadow-2xl border-none">
            <div className="h-32 w-32 rounded-[2.5rem] bg-slate-50 flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Bookmark className="h-16 w-16 text-slate-200" />
            </div>
            <h3 className="text-3xl font-black text-slate-900">Catalogue is empty</h3>
            <p className="text-slate-500 mt-3 max-w-sm mx-auto font-bold text-lg">Initialize your academic curriculum by registering your first course structure.</p>
            <Link to="/courses/create" className="inline-block mt-12">
                <Button className="bg-[#fbbf24] text-[#064e3b] font-black h-16 px-12 rounded-3xl shadow-xl hover:scale-105 transition-all text-xl">
                    Register First Course
                </Button>
            </Link>
        </div>
      )}
    </div>
  );
}

export default CoursesListPage;