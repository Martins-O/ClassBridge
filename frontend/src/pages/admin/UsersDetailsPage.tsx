import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  ArrowLeft, Edit, Trash2, Mail, Phone, Building, Calendar, 
  Shield, CheckCircle2, XCircle, Clock, MapPin, Globe, 
  User as UserIcon, BookOpen, Fingerprint, Activity,
  Smartphone, Monitor, Globe as GlobeIcon, Key
} from 'lucide-react';
import { userService } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import type { User } from '@/types';
import { format } from 'date-fns';

export function UsersDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      if (!id) return;
      try {
        const response = await userService.getById(id);
        const userData = (response.data as any)?.user;
        if (userData) setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await userService.delete(id);
      navigate('/users');
    } catch (error) {
      console.error('Failed to delete user:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">User not found</p>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadge = (role: string) => {
    const roles: Record<string, { color: string, icon: any }> = {
      system_admin: { color: 'bg-red-50 text-red-700 border-red-200', icon: Shield },
      school_admin: { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Building },
      mentor: { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: UserIcon },
      student: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: BookOpen },
    };
    const config = roles[role] || { color: 'bg-gray-50 text-gray-700 border-gray-200', icon: UserIcon };
    const Icon = config.icon;
    
    return (
      <Badge variant="outline" className={`${config.color} flex items-center gap-1.5 px-3 py-1 font-semibold`}>
        <Icon size={14} />
        {role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
      </Badge>
    );
  };

  const getStatusBadge = (active: boolean) => {
    return active ? (
      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1.5 px-3 py-1">
        <CheckCircle2 size={14} />
        Active
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1.5 px-3 py-1">
        <XCircle size={14} />
        Inactive
      </Badge>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header with Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/users')}
            className="hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-5">
            <div className="relative">
              <Avatar className="h-20 w-20 ring-4 ring-white shadow-xl">
                <AvatarImage src={user.profileImage} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-primary-light to-primary text-white font-bold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white ${user.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{user.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {getRoleBadge(user.role)}
                {getStatusBadge(user.isActive)}
                {user.emailVerified && (
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                    <Fingerprint size={12} className="mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 self-end md:self-center">
          {useAuthStore.getState().isSystemAdmin() && (
            <Link to={`/users/${user._id}/edit`}>
              <Button className="bg-primary hover:bg-primary-dark text-white px-6">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </Link>
          )}
          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Details & Bio */}
        <div className="lg:col-span-8 space-y-8">
          {/* About Section */}
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserIcon className="text-primary" size={20} />
                General Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="group">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">Full Name</label>
                    <p className="text-gray-900 font-medium text-lg">{user.name}</p>
                  </div>
                  <div className="group">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">Email Address</label>
                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                      <Mail size={16} className="text-gray-400" />
                      {user.email}
                    </div>
                  </div>
                  <div className="group">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">Phone Number</label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <Phone size={16} className="text-gray-400" />
                      {user.phone || <span className="text-gray-400 italic">No phone provided</span>}
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="group">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">Bio / Information</label>
                    <p className="text-gray-700 leading-relaxed">
                      {user.bio || "No biographical information has been added yet for this user. Administrators can add a bio to provide more context about the user's role and background."}
                    </p>
                  </div>
                  <div className="group">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">Institutional Status</label>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${user.isApproved ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <p className="font-medium">{user.isApproved ? 'Fully Approved' : 'Pending Approval'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Institutional Context */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building className="text-amber-500" size={18} />
                  School Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user.school ? (
                  <div className="space-y-4 pt-2">
                    <h3 className="font-bold text-gray-900 text-lg">{user.school.name}</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-gray-400" />
                        {user.school.email}
                      </div>
                      {user.school.website && (
                        <div className="flex items-center gap-2 text-blue-600 hover:underline">
                          <Globe size={14} />
                          <a href={user.school.website.startsWith('http') ? user.school.website : `https://${user.school.website}`} target="_blank" rel="noopener noreferrer">
                            {user.school.website}
                          </a>
                        </div>
                      )}
                      {user.school.phone && (
                        <div className="flex items-center gap-2">
                          <Smartphone size={14} className="text-gray-400" />
                          {user.school.phone}
                        </div>
                      )}
                      {user.school.address && (
                        <div className="flex items-start gap-2">
                          <MapPin size={14} className="text-gray-400 mt-0.5" />
                          <span className="leading-tight">{user.school.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center">
                    <p className="text-gray-400 italic">No school associated</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="text-emerald-500" size={18} />
                  Academic Context
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Classes Assigned</label>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {user.classes && user.classes.length > 0 ? (
                        user.classes.map((cls: any) => (
                          <Badge key={cls.id} variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none px-2 py-0.5">
                            {cls.name}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 italic py-1">No active class assignments</p>
                      )}
                    </div>
                  </div>
                  {user.studentId && (
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Student ID Number</label>
                      <p className="text-gray-900 font-mono font-medium mt-1 uppercase tracking-wider">{user.studentId}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column: Security & Activity */}
        <div className="lg:col-span-4 space-y-6">
          {/* Security & Access Card */}
          <Card className="border-none shadow-sm bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Shield className="text-blue-400" size={20} />
                Security & Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-3">
                  <Smartphone className="text-blue-400" size={20} />
                  <div>
                    <p className="text-xs text-white/50">2FA Authentication</p>
                    <p className="text-sm font-semibold">{user.twoFactorEnabled ? 'Enabled' : 'Disabled'}</p>
                  </div>
                </div>
                {user.twoFactorEnabled ? (
                  <CheckCircle2 size={18} className="text-emerald-400" />
                ) : (
                  <XCircle size={18} className="text-white/20" />
                )}
              </div>

              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-3">
                  <GlobeIcon className="text-emerald-400" size={20} />
                  <div>
                    <p className="text-xs text-white/50">Email Verification</p>
                    <p className="text-sm font-semibold">{user.emailVerified ? 'Verified' : 'Unverified'}</p>
                  </div>
                </div>
                {user.emailVerified ? (
                  <CheckCircle2 size={18} className="text-emerald-400" />
                ) : (
                  <XCircle size={18} className="text-white/20" />
                )}
              </div>

              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-3">
                  <Key className="text-amber-400" size={20} />
                  <div>
                    <p className="text-xs text-white/50">Password Policy</p>
                    <p className="text-sm font-semibold">{user.requirePasswordChange ? 'Change Required' : 'Standard'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Log Card */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="text-primary" size={18} />
                Recent History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 py-4">
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
                  <div className="w-0.5 h-full bg-gray-100 my-1" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Last Login Detected</p>
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                    <Clock size={10} />
                    {user.lastLoginAt ? format(new Date(user.lastLoginAt), 'MMM dd, yyyy @ HH:mm') : 'Never logged in'}
                  </p>
                  {user.lastLoginIP && (
                    <p className="text-[10px] font-mono text-gray-400 mt-1 bg-gray-50 px-1.5 py-0.5 rounded w-fit">
                      IP: {user.lastLoginIP}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-blue-500 ring-4 ring-blue-50" />
                  <div className="w-0.5 h-full bg-gray-100 my-1" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Profile Updated</p>
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                    <Clock size={10} />
                    {format(new Date(user.updatedAt), 'MMM dd, yyyy @ HH:mm')}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-gray-400 ring-4 ring-gray-100" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Account Created</p>
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                    <Calendar size={10} />
                    {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Last Known Device */}
          {user.lastLoginDevice && (
            <Card className="border-none shadow-sm bg-gray-50/50">
              <CardContent className="p-4 flex items-center gap-3">
                <Monitor className="text-gray-400" size={20} />
                <div className="overflow-hidden">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Last Known Device</p>
                  <p className="text-xs text-gray-600 truncate">{user.lastLoginDevice}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete System User</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700">Are you sure you want to delete <strong>{user.name}</strong>?</p>
            <p className="text-sm text-gray-500 mt-2">This will permanently remove the user from ClassBridge and revoke all access. This action cannot be reversed.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" className="flex-1" onClick={() => setShowDeleteDialog(false)}>
              Keep User
            </Button>
            <Button variant="destructive" className="flex-1" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Confirm Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default UsersDetailsPage;