import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  ArrowLeft, Edit, Trash2, Users, BookOpen,
  Calendar, Clock, GraduationCap, Award, CalendarDays,
  Building2, ChevronRight
} from 'lucide-react';
import { classService } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import type { Class } from '@/types';

export function ClassesDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cls, setCls] = useState<Class | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isMentor = useAuthStore((state) => state.isMentor);
  const isSchoolAdmin = useAuthStore((state) => state.isSchoolAdmin);
  const isSystemAdmin = useAuthStore((state) => state.isSystemAdmin);

  const canEdit = isMentor() || isSchoolAdmin() || isSystemAdmin();
  const canDelete = isSchoolAdmin() || isSystemAdmin();

  useEffect(() => {
    async function fetchClass() {
      if (!id) return;
      try {
        const response = await classService.getById(id);
        const classData = (response.data as any)?.class;
        if (classData) setCls(classData);
      } catch (error) {
        console.error('Failed to fetch class:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchClass();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await classService.delete(id);
      navigate('/classes');
    } catch (error) {
      console.error('Failed to delete class:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-[#064e3b] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!cls) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <GraduationCap className="h-16 w-16 text-slate-200" />
        <p className="text-slate-500 font-medium">Class not found</p>
        <Link to="/classes">
          <Button variant="outline" className="rounded-xl">Back to Classes</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Premium Header Banner */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#064e3b] to-[#065f46] p-10 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <Link to="/classes">
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white transition-all"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </Link>
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <Badge className={`border-none font-bold px-4 py-1 text-sm rounded-full ${cls.isActive ? 'bg-emerald-400/30 text-emerald-100' : 'bg-white/10 text-white/60'}`}>
                  {cls.isActive ? '● Active' : '○ Inactive'}
                </Badge>
                {cls.cohort && (
                  <Badge className="bg-[#fbbf24]/20 text-[#fef3c7] border-none font-bold px-4 py-1 text-sm rounded-full">
                    {cls.cohort}
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl font-black tracking-tight text-[#fef3c7]">{cls.name}</h1>
              {cls.schoolName && (
                <p className="mt-1 text-emerald-100/70 font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  {cls.schoolName}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {canEdit && (
              <Link to={`/classes/${id}/edit`}>
                <Button className="h-12 px-6 rounded-xl bg-[#fbbf24] hover:bg-[#d97706] text-[#064e3b] font-bold shadow-lg transition-all hover:scale-105 border-none">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Class
                </Button>
              </Link>
            )}
            {canDelete && (
              <Button
                className="h-12 px-6 rounded-xl border border-white/20 bg-white/10 hover:bg-red-500 hover:border-red-500 text-white font-bold transition-all"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        </div>

        {/* Visual Accents */}
        <div className="absolute top-0 right-0 h-64 w-64 bg-white/5 blur-[100px] rounded-full translate-x-32 -translate-y-32" />
        <div className="absolute bottom-0 left-0 h-32 w-32 bg-amber-400/10 blur-[60px] rounded-full -translate-x-16 translate-y-16" />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Details Card */}
        <Card className="lg:col-span-2 rounded-[2rem] border-none shadow-xl bg-white overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-[#064e3b] to-[#065f46]" />
          <CardContent className="p-8 space-y-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-[#064e3b]" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Class Details</h3>
            </div>

            {cls.description && (
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Description</p>
                <p className="text-slate-700 font-medium leading-relaxed">{cls.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <CalendarDays className="h-5 w-5 text-[#064e3b]" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Academic Year</p>
                  <p className="text-lg font-black text-slate-900">{cls.academicYear || '—'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Duration</p>
                  <p className="text-lg font-black text-slate-900">{cls.duration || '—'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Award className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Cohort</p>
                  <p className="text-lg font-black text-slate-900">{cls.cohort || '—'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Status</p>
                  <p className={`text-lg font-black ${cls.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {cls.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            {canEdit && (
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                <Link to={`/classes/${id}/edit`}>
                  <Button className="rounded-2xl bg-[#064e3b] hover:bg-[#065f46] text-white font-bold px-8 h-12 shadow-lg transition-all hover:scale-[1.02]">
                    <Edit className="h-4 w-4 mr-2" />
                    Update Class Information
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Card */}
        <div className="space-y-6">
          <Card className="rounded-[2rem] border-none shadow-xl bg-white overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-[#064e3b] to-[#065f46]" />
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-2xl bg-emerald-100 flex items-center justify-center">
                  <Award className="h-5 w-5 text-[#064e3b]" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Statistics</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-[#064e3b]" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Students</p>
                      <p className="text-2xl font-black text-slate-900">{cls.studentIds?.length || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-5 bg-amber-50 rounded-2xl border border-amber-100">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Teachers</p>
                      <p className="text-2xl font-black text-slate-900">{cls.mentorIds?.length || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ID Card */}
          <Card className="rounded-[2rem] border-none shadow-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden">
            <CardContent className="p-6">
              <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-2">Class ID</p>
              <p className="font-mono text-sm text-white/60 break-all">{id}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900">Delete Class</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-slate-700">Are you sure you want to delete <strong className="text-slate-900">{cls.name}</strong>?</p>
            <p className="text-sm text-slate-500 mt-2">This action cannot be undone. All associated data will be permanently removed.</p>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowDeleteDialog(false)}>
              Keep Class
            </Button>
            <Button variant="destructive" className="flex-1 rounded-xl" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting…' : 'Confirm Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ClassesDetailsPage;