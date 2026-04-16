import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, GraduationCap, FileText, CheckCircle, Settings, Shield, Clock, AlertCircle } from 'lucide-react';
import { approvalService } from '@/services/api';
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
}

interface RecentActivity {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  type: 'school' | 'user' | 'approval';
}

export function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalSchools: 0,
    totalStudents: 0,
    totalMentors: 0,
    totalStaff: 0,
    pendingApprovals: 0,
    totalClasses: 0,
    approvedSchools: 0,
    pendingSchools: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([
    { id: '1', action: 'LOGIN', description: 'Super Admin logged in', timestamp: new Date().toISOString(), type: 'user' },
    { id: '2', action: 'SCHOOL_APPROVED', description: 'Approved school: ABC Academy', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'approval' },
    { id: '3', action: 'USER_CREATED', description: 'New user registered: John Doe', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'user' },
    { id: '4', action: 'SCHOOL_REGISTERED', description: 'New school registration: XYZ School', timestamp: new Date(Date.now() - 10800000).toISOString(), type: 'school' },
    { id: '5', action: 'LOGIN', description: 'Admin User logged in', timestamp: new Date(Date.now() - 14400000).toISOString(), type: 'user' },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, approvalsRes] = await Promise.all([
          api.get<{ stats: any }>('/stats/global'),
          approvalService.getPending(),
        ]);

        const statsData = statsRes.data?.stats;
        const approvalsData = approvalsRes.data;

        setStats({
          totalSchools: statsData?.totalSchools || 0,
          totalStudents: statsData?.totalStudents || 0,
          totalMentors: statsData?.totalMentors || 0,
          totalStaff: statsData?.totalStaff || 0,
          pendingApprovals: statsData?.pendingSchoolApprovals || 0,
          totalClasses: statsData?.totalClasses || 0,
          approvedSchools: statsData?.totalApprovedSchools || 0,
          pendingSchools: statsData?.totalPendingSchools || 0,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const statCards = [
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

  const quickActions = [
    { name: 'View Schools', href: '/schools', icon: Building2 },
    { name: 'View Approvals', href: '/approvals', icon: CheckCircle },
    { name: 'Audit Logs', href: '/audit-logs', icon: Shield },
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

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold">System Admin Dashboard</h1>
        <p className="text-blue-100 mt-1">Welcome back! Here's an overview of your system.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
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
        {/* Schools by Status */}
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

        {/* Quick Actions */}
        <Card>
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

        {/* Pending Approvals Alert */}
        {stats.pendingApprovals > 0 && (
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
          <CardDescription>Latest system events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start gap-4">
                <div
                  className={`p-2 rounded-full ${
                    activity.type === 'school'
                      ? 'bg-blue-100'
                      : activity.type === 'user'
                      ? 'bg-green-100'
                      : 'bg-yellow-100'
                  }`}
                >
                  <FileText
                    className={`h-4 w-4 ${
                      activity.type === 'school'
                        ? 'text-blue-600'
                        : activity.type === 'user'
                        ? 'text-green-600'
                        : 'text-yellow-600'
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.description}</p>
                  <p className="text-sm text-gray-500">{formatTimestamp(activity.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
          <Link to="/audit-logs" className="block mt-4 text-center text-sm text-blue-600 hover:underline">
            View All Activity →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

export default DashboardPage;