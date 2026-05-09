import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Eye, Edit, Users } from 'lucide-react';
import { userService } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import type { User } from '@/types';

const ROLE_OPTIONS = [
  { value: 'all', label: 'All Roles' },
  { value: 'school_admin', label: 'School Admin' },
  { value: 'mentor', label: 'Mentor' },
  { value: 'student', label: 'Student' },
];

export function UsersListPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const getSchoolId = useAuthStore((state) => state.getSchoolId);
  const isSystemAdmin = useAuthStore((state) => state.isSystemAdmin);

  useEffect(() => {
    async function fetchUsers() {
      setIsLoading(true);
      setError(null);
      try {
        const schoolId = isSystemAdmin() ? undefined : getSchoolId();
        const params: any = { limit: 100 };
        if (schoolId) params.schoolId = schoolId;
        if (roleFilter !== 'all') params.role = roleFilter;
        console.log('Fetching users with params:', params);
        const { data } = await userService.getAll(params);
        console.log('API Response:', data);
        const usersData = data as { data?: User[]; success?: boolean; total?: number };
        setUsers(usersData?.data || []);
        setTotal(usersData?.total || 0);
      } catch (err: any) {
        console.error('Failed to fetch users:', err);
        setError(err.response?.data?.error || 'Failed to load users');
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsers();
  }, [getSchoolId, isSystemAdmin, roleFilter]);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-[#064e3b] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 font-bold">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="relative overflow-hidden rounded-3xl bg-[#064e3b] p-8 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-[#fef3c7]">Users Directory</h2>
            <p className="mt-2 text-emerald-100/80 font-medium">Manage and monitor institutional access and roles</p>
          </div>
          <div className="flex gap-3">
            <Link to="/students">
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 h-12 rounded-xl shadow-lg transition-all hover:scale-105 border-none">
                <Users className="w-4 h-4 mr-2" />
                All Students
              </Button>
            </Link>
            <Link to="/users/create">
              <Button className="bg-[#fbbf24] hover:bg-[#d97706] text-[#064e3b] font-bold px-8 h-12 rounded-xl shadow-lg transition-all hover:scale-105 border-none">
                Invite New User
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#064e3b] transition-colors" />
          <Input
            placeholder="Search users by name, email or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-14 bg-white border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-[#064e3b]/20 focus:border-[#064e3b] transition-all text-lg"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="h-14 w-[200px] rounded-2xl border-slate-200 font-bold">
            <SelectValue placeholder="Filter by Role" />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Users Grid/Table */}
      <Card className="overflow-hidden border-none shadow-xl rounded-3xl bg-white/70 backdrop-blur-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">User Identity</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Access Role</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Institution</th>
                  <th className="px-8 py-5 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-emerald-50/30 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-[#064e3b] font-black text-xl shadow-inner group-hover:scale-110 transition-transform">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <Link to={`/users/${user._id}`} className="block font-bold text-slate-900 group-hover:text-[#064e3b] transition-colors text-lg">
                            {user.name}
                          </Link>
                          <span className="text-sm text-slate-400 flex items-center gap-1">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <Badge className={cn(
                        "rounded-lg px-3 py-1 font-bold border-none",
                        user.role === 'system_admin' ? "bg-blue-100 text-blue-700" :
                        user.role === 'school_admin' ? "bg-emerald-100 text-emerald-700" :
                        user.role === 'mentor' ? "bg-amber-100 text-amber-700" :
                        "bg-slate-100 text-slate-700"
                      )}>
                        {user.role.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "h-2.5 w-2.5 rounded-full",
                          user.isActive ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-300"
                        )} />
                        <span className={cn("text-sm font-bold", user.isActive ? "text-emerald-600" : "text-slate-400")}>
                          {user.isActive ? 'Authorized' : 'Restricted'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-medium text-slate-500 truncate max-w-[150px] inline-block">
                        {user.schoolName || 'Global Access'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={`/users/${user._id}`}>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-emerald-100 hover:text-[#064e3b]">
                            <Eye className="h-5 w-5" />
                          </Button>
                        </Link>
                        <Link to={`/users/${user._id}/edit`}>
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
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-24 bg-slate-50/50">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-lg mb-6">
                <Search className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No members discovered</h3>
              <p className="text-slate-500 mt-2 max-w-sm mx-auto">We couldn't find any users matching your criteria. Try adjusting your search term or filters.</p>
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
      
      {/* Pagination Placeholder */}
      <div className="flex items-center justify-between text-sm text-slate-500 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <p>Displaying <span className="font-bold text-slate-900">{filteredUsers.length}</span> of <span className="font-bold text-slate-900">{total}</span> members in your institutional network</p>
          <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-lg border-slate-200" disabled>Previous</Button>
              <Button variant="outline" size="sm" className="rounded-lg border-slate-200" disabled>Next</Button>
          </div>
      </div>
    </div>
  );
}

// Utility function for conditional classes if not already available
function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}

export default UsersListPage;