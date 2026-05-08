import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Plus, Search, Filter, Trash2, Edit, GraduationCap, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface Grade {
  _id: string;
  studentId: { _id: string; name: string; email: string; studentId?: string };
  classId: { _id: string; name: string };
  courseId?: { _id: string; name: string };
  mentorId: string;
  academicYear: string;
  semester?: string;
  grade: string;
  score?: number;
  comments?: string;
  createdAt: string;
}

interface Class {
  _id: string;
  name: string;
  academicYear: string;
}

interface Student {
  _id: string;
  name: string;
  email: string;
  studentId?: string;
}

export function GradesListPage() {
  const user = useAuthStore((state) => state.user);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [newGrade, setNewGrade] = useState({
    studentId: '',
    classId: '',
    academicYear: new Date().getFullYear().toString(),
    semester: '',
    grade: '',
    score: '',
    comments: '',
  });

  useEffect(() => {
    fetchGrades();
    fetchClasses();
  }, []);

  useEffect(() => {
    if (newGrade.classId) {
      fetchStudentsByClass(newGrade.classId);
    }
  }, [newGrade.classId]);

  const fetchGrades = async () => {
    try {
      const { data } = await api.get('/grades');
      setGrades(data.data || []);
    } catch (err) {
      console.error('Failed to fetch grades:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const { data } = await api.get('/classes', { params: { limit: 100 } });
      setClasses(data.data || []);
    } catch (err) {
      console.error('Failed to fetch classes:', err);
    }
  };

  const fetchStudentsByClass = async (classId: string) => {
    try {
      const { data } = await api.get(`/classes/${classId}/students`);
      setStudents(data.students || []);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    }
  };

  const handleCreateGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const payload = {
        studentId: newGrade.studentId,
        classId: newGrade.classId,
        academicYear: newGrade.academicYear,
        semester: newGrade.semester || undefined,
        grade: newGrade.grade,
        score: newGrade.score ? parseFloat(newGrade.score) : undefined,
        comments: newGrade.comments || undefined,
      };

      await api.post('/grades', payload);
      setIsCreateOpen(false);
      setNewGrade({
        studentId: '',
        classId: '',
        academicYear: new Date().getFullYear().toString(),
        semester: '',
        grade: '',
        score: '',
        comments: '',
      });
      fetchGrades();
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to create grade');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteGrade = async (id: string) => {
    if (!confirm('Are you sure you want to delete this grade?')) return;
    try {
      await api.delete(`/grades/${id}`);
      setGrades(prev => prev.filter(g => g._id !== id));
    } catch (err) {
      console.error('Failed to delete grade:', err);
    }
  };

  const filteredGrades = grades.filter(grade => {
    const matchesSearch = !searchQuery ||
      grade.studentId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grade.studentId?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grade.classId?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = !filterClass || grade.classId?._id === filterClass;
    return matchesSearch && matchesClass;
  });

  const canCreateGrade = user?.role === 'mentor' || user?.role === 'school_admin' || user?.role === 'system_admin';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Grades</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {user?.role === 'mentor' ? 'View and manage grades for your students' : 'View all grades'}
          </p>
        </div>
        {canCreateGrade && (
          <Button onClick={() => setIsCreateOpen(true)} className="bg-[#064e3b] hover:bg-[#065f46]">
            <Plus className="w-4 h-4 mr-2" />
            Add Grade
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by student or class..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterClass} onValueChange={setFilterClass}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Classes</SelectItem>
            {classes.map(cls => (
              <SelectItem key={cls._id} value={cls._id}>{cls.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grades Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#064e3b]" />
        </div>
      ) : filteredGrades.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <GraduationCap className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <p>No grades found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">Student</th>
                <th className="text-left px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">Class</th>
                <th className="text-left px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">Grade</th>
                <th className="text-left px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">Score</th>
                <th className="text-left px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">Date</th>
                {canCreateGrade && <th className="text-right px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGrades.map(grade => (
                <tr key={grade._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{grade.studentId?.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-500">{grade.studentId?.email || ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-700">{grade.classId?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-400">{grade.academicYear}{grade.semester ? ` - ${grade.semester}` : ''}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      'inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold',
                      grade.grade?.startsWith('A') ? 'bg-emerald-100 text-emerald-700' :
                      grade.grade?.startsWith('B') ? 'bg-blue-100 text-blue-700' :
                      grade.grade?.startsWith('C') ? 'bg-amber-100 text-amber-700' :
                      grade.grade?.startsWith('D') ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    )}>
                      {grade.grade || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {grade.score !== undefined ? (
                      <span className="text-sm font-medium text-slate-700">{grade.score}%</span>
                    ) : (
                      <span className="text-sm text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-500">
                      {new Date(grade.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  {canCreateGrade && (
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteGrade(grade._id)}
                        className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Grade Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Grade</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateGrade} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Class *</Label>
              <Select value={newGrade.classId} onValueChange={(v) => setNewGrade(prev => ({ ...prev, classId: v, studentId: '' }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(cls => (
                    <SelectItem key={cls._id} value={cls._id}>{cls.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Student *</Label>
              <Select value={newGrade.studentId} onValueChange={(v) => setNewGrade(prev => ({ ...prev, studentId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map(s => (
                    <SelectItem key={s._id} value={s._id}>{s.name} ({s.email})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Academic Year *</Label>
                <Input
                  value={newGrade.academicYear}
                  onChange={(e) => setNewGrade(prev => ({ ...prev, academicYear: e.target.value }))}
                  placeholder="2026"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Semester</Label>
                <Select value={newGrade.semester} onValueChange={(v) => setNewGrade(prev => ({ ...prev, semester: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fall">Fall</SelectItem>
                    <SelectItem value="Spring">Spring</SelectItem>
                    <SelectItem value="Summer">Summer</SelectItem>
                    <SelectItem value="Winter">Winter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Letter Grade *</Label>
                <Select value={newGrade.grade} onValueChange={(v) => setNewGrade(prev => ({ ...prev, grade: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="C+">C+</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="C-">C-</SelectItem>
                    <SelectItem value="D+">D+</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                    <SelectItem value="D-">D-</SelectItem>
                    <SelectItem value="F">F</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Score (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={newGrade.score}
                  onChange={(e) => setNewGrade(prev => ({ ...prev, score: e.target.value }))}
                  placeholder="85"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Comments</Label>
              <Input
                value={newGrade.comments}
                onChange={(e) => setNewGrade(prev => ({ ...prev, comments: e.target.value }))}
                placeholder="Optional feedback for the student"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating} className="bg-[#064e3b] hover:bg-[#065f46]">
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Grade'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default GradesListPage;