import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, GraduationCap, FileText, CheckCircle, Settings, Shield, Clock, AlertCircle, BookOpen } from 'lucide-react';
import { approvalService, auditService, schoolReportsService } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import api from '@/services/api';

interface Stats {
  totalSchools: number;
  totalStudents: number;
  totalMentors: number;
  totalStaff: number;
  pendingApprovals: number;
  totalClasses: number;
  approvedSchools: number;
  pendingSchools: number;
  totalCourses: number;
}

interface SchoolStats {
  totalStudents: number;
  totalMentors: number;
  totalClasses: number;
  totalCourses: number;
  activeStudents: number;
  activeMentors: number;
}

interface RecentActivity {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  type: 'school' | 'user' | 'approval';
}

export function DashboardPage() {
  const isSystemAdmin = useAuthStore((state) => state.isSystemAdmin);
  const isSchoolAdmin = useAuthStore((state) => state.isSchoolAdmin);
  const getSchoolId = useAuthStore((state) => state.getSchoolId);
  const user = useAuthStore((state) => state.user);
  
  const [stats, setStats] = useState<Stats>({
    totalSchools: 0,
    totalStudents: 0,
    totalMentors: 0,
    totalStaff: 0,
    pendingApprovals: 0,
    totalClasses: 0,
    approvedSchools: 0,
    pendingSchools: 0,
    totalCourses: 0,
  });
  const [schoolStats, setSchoolStats] = useState<SchoolStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        if (isSystemAdmin()) {
          const [statsRes, approvalsRes, auditRes] = await Promise.all([
            api.get<{ stats: any }>('/stats/global'),
            approvalService.getPending(),
            auditService.getRecent(5),
          ]);

          const statsData = statsRes.data?.stats;
          const auditData = auditRes.data;

          setStats({
            totalSchools: statsData?.totalSchools || 0,
            totalStudents: statsData?.totalStudents || 0,
            totalMentors: statsData?.totalMentors || 0,
            totalStaff: statsData?.totalStaff || 0,
            pendingApprovals: statsData?.pendingSchoolApprovals || 0,
            totalClasses: statsData?.totalClasses || 0,
            approvedSchools: statsData?.totalApprovedSchools || 0,
            pendingSchools: statsData?.totalPendingSchools || 0,
            totalCourses: statsData?.totalCourses || 0,
          });

          if (auditData?.logs) {
            setRecentActivity(auditData.logs.map((log: any) => ({
              id: log._id,
              action: log.action,
              description: log.description || `${log.action} on ${log.resource}`,
              timestamp: log.createdAt,
              type: log.resource as any,
            })));
          }
        } else if (isSchoolAdmin()) {
          const schoolId = getSchoolId();
          if (schoolId) {
            const reportRes = await schoolReportsService.getSchoolReport(schoolId);
            if (reportRes.data) {
              setSchoolStats({
                totalStudents: reportRes.data.totalStudents || 0,
                totalMentors: reportRes.data.totalMentors || 0,
                totalClasses: reportRes.data.totalClasses || 0,
                totalCourses: reportRes.data.totalCourses || 0,
                activeStudents: reportRes.data.activeStudents || 0,
                activeMentors: reportRes.data.activeMentors || 0,
              });
              setRecentActivity(reportRes.data.recentActivity?.slice(0, 5).map((log: any) => ({
                id: log._id,
                action: log.action,
                description: `${log.userEmail} - ${log.action}`,
                timestamp: log.timestamp,
                type: 'school' as const,
              })) || []);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [isSystemAdmin, isSchoolAdmin, getSchoolId]);

  const systemAdminStatCards = [
    {
      title: 'Total Schools',
      value: stats.totalSchools,
      icon: Building2,
      description: 'All registered schools',
      href: '/schools',
      color: 'bg-blue-500',
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals,
      icon: Clock,
      description: 'Awaiting review',
      href: '/approvals',
      color: 'bg-yellow-500',
    },
    {
      title: 'Students',
      value: stats.totalStudents,
      icon: Users,
      description: 'Active students',
      href: '/users',
      color: 'bg-green-500',
    },
    {
      title: 'Total Classes',
      value: stats.totalClasses,
      icon: GraduationCap,
      description: 'Active classes',
      href: '/classes',
      color: 'bg-purple-500',
    },
  ];

  const schoolAdminStatCards = schoolStats ? [
    {
      title: 'Students',
      value: schoolStats.totalStudents,
      icon: Users,
      description: 'Total students',
      href: '/users',
      color: 'bg-blue-500',
    },
    {
      title: 'Active Students',
      value: schoolStats.activeStudents,
      icon: CheckCircle,
      description: 'Currently active',
      href: '/users',
      color: 'bg-green-500',
    },
    {
      title: 'Mentors',
      value: schoolStats.totalMentors,
      icon: Users,
      description: 'Total mentors',
      href: '/users',
      color: 'bg-teal-500',
    },
    {
      title: 'Classes',
      value: schoolStats.totalClasses,
      icon: GraduationCap,
      description: 'Total classes',
      href: '/classes',
      color: 'bg-purple-500',
    },
    {
      title: 'Courses',
      value: schoolStats.totalCourses,
      icon: BookOpen,
      description: 'Total courses',
      href: '/courses',
      color: 'bg-orange-500',
    },
  ] : [];

  const systemAdminQuickActions = [
    { name: 'View Schools', href: '/schools', icon: Building2 },
    { name: 'View Approvals', href: '/approvals', icon: CheckCircle },
    { name: 'Audit Logs', href: '/audit-logs', icon: Shield },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const schoolAdminQuickActions = [
    { name: 'View Users', href: '/users', icon: Users },
    { name: 'View Classes', href: '/classes', icon: GraduationCap },
    { name: 'View Courses', href: '/courses', icon: BookOpen },
    { name: 'School Reports', href: '/school-reports', icon: FileText },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const formatTimestamp = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isAdmin = isSystemAdmin();
  const displayStats = isAdmin ? systemAdminStatCards : schoolAdminStatCards;
  const quickActions = isAdmin ? systemAdminQuickActions : schoolAdminQuickActions;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className={`rounded-lg p-6 text-white ${isAdmin ? 'bg-gradient-to-r from-blue-600 to-blue-800' : 'bg-gradient-to-r from-green-600 to-green-800'}`}>
        <h1 className="text-2xl font-bold">{isAdmin ? 'System Admin Dashboard' : 'School Admin Dashboard'}</h1>
        <p className={`mt-1 ${isAdmin ? 'text-blue-100' : 'text-green-100'}`}>
          {isAdmin 
            ? "Welcome back! Here's an overview of your system." 
            : `Welcome back! Here's an overview of ${user?.schoolName || 'your school'}.`
          }
        </p>
      </div>

      {/* Stats Cards */}
      <div className={`grid gap-4 ${isAdmin ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5'}`}>
        {displayStats.map((stat) => (
          <Link key={stat.title} to={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
                </div>
                <div className="mt-4">
                  <h3 className="font-medium text-gray-900">{stat.title}</h3>
                  <p className="text-sm text-gray-500">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Schools Overview</CardTitle>
              <CardDescription>Schools by status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="success">{stats.approvedSchools}</Badge>
                  <span className="text-gray-600">Approved</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="warning">{stats.pendingSchools}</Badge>
                  <span className="text-gray-600">Pending</span>
                </div>
              </div>
              <Link to="/schools" className="block mt-4 text-center text-sm text-blue-600 hover:underline">
                View All Schools →
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className={isAdmin ? '' : 'lg:col-span-3'}>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <Link key={action.name} to={action.href}>
                  <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                    <action.icon className="h-4 w-4" />
                    {action.name}
                  </button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals Alert (System Admin only) */}
        {isAdmin && stats.pendingApprovals > 0 && (
          <Card className="border-yellow-300 bg-yellow-50">
            <CardHeader className="py-3">
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="h-5 w-5" />
                Action Required
              </CardTitle>
            </CardHeader>
            <CardContent className="py-3">
              <p className="text-yellow-700">
                {stats.pendingApprovals} school{stats.pendingApprovals > 1 ? 's' : ''} awaiting approval
              </p>
              <Link
                to="/approvals"
                className="text-sm text-blue-600 hover:underline mt-2 block"
              >
                Review now →
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>{isAdmin ? 'Latest system events' : 'Latest events in your school'}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start gap-4">
                <div className="p-2 rounded-full bg-blue-100">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.description}</p>
                  <p className="text-sm text-gray-500">{formatTimestamp(activity.timestamp)}</p>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
          {isAdmin ? (
            <Link to="/audit-logs" className="block mt-4 text-center text-sm text-blue-600 hover:underline">
              View All Activity →
            </Link>
          ) : (
            <Link to="/school-reports" className="block mt-4 text-center text-sm text-blue-600 hover:underline">
              View Full Reports →
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default DashboardPage;