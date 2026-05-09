import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  ClipboardList,
  CheckCircle,
  AlertCircle,
  XCircle,
  Activity,
  BarChart3,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { notificationService } from '@/services/api';

const systemAdminNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Schools', href: '/schools', icon: Building2 },
  { name: 'Approvals', href: '/approvals', icon: FileText },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Students', href: '/students', icon: GraduationCap },
  { name: 'Classes', href: '/classes', icon: GraduationCap },
  { name: 'Courses', href: '/courses', icon: BookOpen },
  { name: 'Assessments', href: '/assessments', icon: ClipboardList },
  { name: 'Transcripts', href: '/transcripts', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Audit Logs', href: '/audit-logs', icon: ClipboardList },
  { name: 'System Status', href: '/system-status', icon: Activity },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
];

const schoolAdminNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Students', href: '/students', icon: GraduationCap },
  { name: 'Classes', href: '/classes', icon: GraduationCap },
  { name: 'Courses', href: '/courses', icon: BookOpen },
  { name: 'Assessments', href: '/assessments', icon: ClipboardList },
  { name: 'Transcripts', href: '/transcripts', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'School Reports', href: '/school-reports', icon: BarChart3 },
];

const mentorNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Classes', href: '/classes', icon: GraduationCap },
  { name: 'Courses', href: '/courses', icon: BookOpen },
  { name: 'Assessments', href: '/assessments', icon: ClipboardList },
  { name: 'Grades', href: '/grades', icon: FileText },
  { name: 'Transcripts', href: '/transcripts', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const studentNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Classes', href: '/classes', icon: GraduationCap },
  { name: 'My Assessments', href: '/assessments', icon: ClipboardList },
  { name: 'Transcript & Results', href: '/transcripts', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function AdminLayout() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isSystemAdmin = useAuthStore((state) => state.isSystemAdmin);
  const isSchoolAdmin = useAuthStore((state) => state.isSchoolAdmin);
  const isMentor = useAuthStore((state) => state.isMentor);
  const isStudent = useAuthStore((state) => state.isStudent);
  
  const navigation = isSystemAdmin() 
    ? systemAdminNavigation 
    : isSchoolAdmin() 
      ? schoolAdminNavigation 
      : isMentor()
        ? mentorNavigation
        : studentNavigation;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const response = await notificationService.getAll({ limit: 10 });
        if (response.data?.notifications) {
          setNotifications(response.data.notifications);
          setUnreadCount(response.data.unreadCount || 0);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    }
    fetchNotifications();
    
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-16'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {sidebarOpen && (
            <Link to="/" className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                isSystemAdmin() ? "bg-blue-600" : "bg-[#064e3b]"
              )}>
                <span className="text-white font-bold text-sm">CB</span>
              </div>
              <span className="font-semibold text-gray-900">ClassBridge</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex"
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-2 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? isSystemAdmin() 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          {sidebarOpen ? (
            <div className="flex items-center justify-between">
              <Link to="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity min-w-0">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className={cn(
                    "transition-colors",
                    isSystemAdmin() 
                      ? "bg-blue-100 text-blue-600" 
                      : isMentor() 
                        ? "bg-amber-100 text-amber-700"
                        : isStudent()
                          ? "bg-blue-100 text-blue-700"
                          : "bg-emerald-100 text-emerald-700"
                  )}>
                    {user?.name?.charAt(0) || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm min-w-0">
                  <p className="font-medium text-gray-900 truncate">{user?.name || 'User'}</p>
                  <p className="text-gray-500 capitalize truncate text-xs">
                    {isStudent() ? 'Enrolled Student' : (isMentor() ? 'Faculty Member' : (isSchoolAdmin() ? user?.schoolName : user?.role?.replace('_', ' ' )))}
                  </p>
                </div>
              </Link>
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Link to="/profile" className="hover:opacity-80 transition-opacity">
                 <Avatar className="h-9 w-9">
                  <AvatarFallback className={cn(
                      "transition-colors",
                      isSystemAdmin() ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-700"
                    )}>
                      {user?.name?.charAt(0) || 'A'}
                    </AvatarFallback>
                 </Avatar>
              </Link>
              <Button variant="ghost" size="icon" onClick={logout} className="w-full justify-center">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className={cn('transition-all duration-300', sidebarOpen ? 'pl-64' : 'pl-16')}>
        {/* Top header */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-gray-900">
              {location.pathname.startsWith('/profile') ? 'Profile' : (navigation.find(n => n.href === location.pathname || location.pathname.startsWith(n.href + '/'))?.name || 'Dashboard')}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative" ref={notificationRef}>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  <div className="p-3 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No notifications</div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {notifications.slice(0, 10).map((notif) => (
                        <Link
                          key={notif._id}
                          to={notif.link || '/approvals'}
                          className={cn(
                            "block p-3 hover:bg-gray-50",
                            !notif.isRead && "bg-blue-50"
                          )}
                          onClick={() => setShowNotifications(false)}
                        >
                          <div className="flex items-start gap-3">
                            {getNotificationIcon(notif.type)}
                            <div className="flex-1 min-w-0">
                              <p className={cn("text-sm font-medium", !notif.isRead && "font-semibold")}>
                                {notif.title}
                              </p>
                              <p className="text-xs text-gray-500 truncate">{notif.message}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(notif.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                  <Link to="/approvals" className="block p-3 border-t border-gray-200 text-center text-sm text-blue-600 hover:underline">
                    View all notifications
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;