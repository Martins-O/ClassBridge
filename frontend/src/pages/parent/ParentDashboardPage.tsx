import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, UserPlus, Users, Trash2, GraduationCap, BarChart3 } from 'lucide-react';
import { notificationService } from '@/services/api';
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

interface Child {
  _id: string;
  name: string;
  email: string;
  studentId: string;
  relationship: string;
  isPrimary: boolean;
}

export function ParentDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [studentEmail, setStudentEmail] = useState('');
  const [relationship, setRelationship] = useState('guardian');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchChildren = async () => {
    try {
      const { data } = await api.get('/parents/children');
      setChildren(data.children || []);
    } catch (err) {
      console.error('Failed to fetch children:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsAdding(true);
    try {
      const { data } = await api.post('/parents/children', {
        studentEmail,
        relationship,
      });
      setSuccess(data.message);
      setStudentEmail('');
      fetchChildren();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to add child');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveChild = async (childId: string) => {
    try {
      await api.delete(`/parents/children/${childId}`);
      setChildren(prev => prev.filter(c => c._id !== childId));
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to remove child');
    }
  };

  if (user?.role !== 'parent') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900">Access Denied</h2>
          <p className="text-sm text-slate-500 mt-2">Only parents can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Parent Dashboard</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Monitor your children's academic progress.</p>
      </motion.div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">{success}</div>
      )}

      {/* Add Child Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Add Child</span>
        </div>
        <form onSubmit={handleAddChild} className="p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Student Email</Label>
              <Input
                type="email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="student@school.edu"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Relationship</Label>
              <Select value={relationship} onValueChange={setRelationship}>
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mother">Mother</SelectItem>
                  <SelectItem value="father">Father</SelectItem>
                  <SelectItem value="guardian">Guardian</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" disabled={isAdding} className="w-full">
            {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Child'}
          </Button>
        </form>
      </div>

      {/* Children List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">My Children</span>
        </div>
        <div className="divide-y divide-slate-100">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : children.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">No children added yet</div>
          ) : (
            children.map(child => (
              <div key={child._id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{child.name}</p>
                    <p className="text-xs text-slate-500">{child.email} • {child.relationship}{child.isPrimary ? ' (Primary)' : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a href={`/parent/children/${child._id}/grades`} className="p-2 rounded-lg hover:bg-slate-100">
                    <BarChart3 className="w-4 h-4 text-slate-500" />
                  </a>
                  <button
                    onClick={() => handleRemoveChild(child._id)}
                    className="p-2 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ParentDashboardPage;
