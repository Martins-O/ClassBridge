import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Eye, Edit, Mail, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { userService } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import type { User } from '@/types';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending Approval' },
];

const CLASS_OPTIONS = [
  { value: 'all', label: 'All Classes' },
];

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

function getRoleBadgeClass(role: string) {
  switch (role) {
    case 'system_admin': return 'bg-blue-100 text-blue-700';
    case 'school_admin': return 'bg-emerald-100 text-emerald-700';
    case 'mentor': return 'bg-amber-100 text-amber-700';
    case 'student': return 'bg-purple-100 text-purple-700';
    default: return 'bg-slate-100 text-slate-700';
  }
}

export function StudentsListPage() {
  const [students, setStudents] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const getSchoolId = useAuthStore((state) => state.getSchoolId);
  const isSystemAdmin = useAuthStore((state) => state.isSystemAdmin);

  useEffect(() => {
    async function fetchStudents() {
      setIsLoading(true);
      try {
        const schoolId = isSystemAdmin() ? undefined : getSchoolId();
        const params: any = { limit: 100, role: 'student' };
        if (schoolId) params.schoolId = schoolId;
        if (statusFilter !== 'all') {
          if (statusFilter === 'active') params.isActive = true;
          if (statusFilter === 'inactive') params.isActive = false;
          if (statusFilter === 'pending') params.isApproved = false;
        }
        const { data } = await userService.getAll(params);
        setStudents((data as { data?: User[] })?.data || []);
        setTotal((data as any).total || 0);
      } catch (error) {
        console.error('Failed to fetch students:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStudents();
  }, [getSchoolId, isSystemAdmin, statusFilter]);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(search.toLowerCase()) ||
    student.email.toLowerCase().includes(search.toLowerCase()) ||
    student.studentId?.toLowerCase().includes(search.toLowerCase())
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-white">Students Management</h2>
            <p className="mt-2 text-purple-100/80 font-medium">View and manage all enrolled students</p>
          </div>
          <div className="flex gap-3">
            <Link to="/students/invitations">
              <Button className="bg-white/20 hover:bg-white/30 text-white font-bold px-6 h-12 rounded-xl shadow-lg transition-all border border-white/20 backdrop-blur-sm">
                <Mail className="w-4 h-4 mr-2" />
                Invitations
              </Button>
            </Link>
            <Link to="/students/create">
              <Button className="bg-white text-purple-700 hover:bg-purple-50 font-bold px-6 h-12 rounded-xl shadow-lg transition-all hover:scale-105 border-none">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Student
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
          <Input
            placeholder="Search by name, email, or student ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-14 bg-white border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-lg"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-14 w-[200px] rounded-2xl border-slate-200 font-bold">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-hidden border-none shadow-xl rounded-3xl bg-white/70 backdrop-blur-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Student</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Student ID</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Class</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Verified</th>
                  <th className="px-8 py-5 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-purple-50/30 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-700 font-black text-xl shadow-inner group-hover:scale-110 transition-transform">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <span className="block font-bold text-slate-900 group-hover:text-purple-600 transition-colors text-lg">
                            {student.name}
                          </span>
                          <span className="text-sm text-slate-400">{student.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-medium text-slate-600 font-mono">
                        {student.studentId || 'N/A'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-wrap gap-1">
                        {student.classIds && student.classIds.length > 0 ? (
                          student.classIds.map((cls: any) => (
                            <Badge key={cls._id || cls} className="bg-indigo-100 text-indigo-700 border-none font-medium text-xs">
                              {cls.name || cls}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-slate-400">No class assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "h-2.5 w-2.5 rounded-full",
                          student.isActive ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-300"
                        )} />
                        <span className={cn("text-sm font-bold", student.isActive ? "text-emerald-600" : "text-slate-400")}>
                          {student.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {student.emailVerified ? (
                        <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600">
                          <CheckCircle className="w-4 h-4" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-sm font-bold text-amber-600">
                          <AlertCircle className="w-4 h-4" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={`/students/${student._id}`}>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-purple-100 hover:text-purple-600">
                            <Eye className="h-5 w-5" />
                          </Button>
                        </Link>
                        <Link to={`/students/${student._id}/edit`}>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-amber-100 hover:text-amber-600">
                            <Edit className="h-5 w-5" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredStudents.length === 0 && (
            <div className="text-center py-24 bg-slate-50/50">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-purple-100 shadow-lg mb-6">
                <Search className="h-10 w-10 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No students found</h3>
              <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                {search ? 'No students match your search criteria.' : 'No students enrolled in your school yet.'}
              </p>
              <Button 
                variant="outline" 
                onClick={() => setSearch('')}
                className="mt-8 rounded-xl border-slate-200"
              >
                Clear Search & Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="flex items-center justify-between text-sm text-slate-500 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <p>Displaying <span className="font-bold text-slate-900">{filteredStudents.length}</span> of <span className="font-bold text-slate-900">{total}</span> students</p>
        <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-lg border-slate-200" disabled>Previous</Button>
            <Button variant="outline" size="sm" className="rounded-lg border-slate-200" disabled>Next</Button>
        </div>
      </div>
    </div>
  );
}

export default StudentsListPage;