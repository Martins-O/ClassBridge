import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Users, GraduationCap, FileText, CheckCircle, Settings, Shield, Clock, AlertCircle, BookOpen, ClipboardList } from 'lucide-react';
import { approvalService, auditService, schoolReportsService, schoolService } from '@/services/api';
import type { School } from '@/types';
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

interface MentorStats {
  totalClasses: number;
  totalAssessments: number;
  totalStudents: number;
  pendingGrades: number;
}

interface StudentStats {
  gpa: number;
  totalClasses: number;
  completedAssessments: number;
  pendingAssessments: number;
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
  const isMentor = useAuthStore((state) => state.isMentor);
  const isStudent = useAuthStore((state) => state.isStudent);
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
  const [mentorStats, setMentorStats] = useState<MentorStats | null>(null);
  const [studentStats, setStudentStats] = useState<StudentStats | null>(null);
  const [schoolInfo, setSchoolInfo] = useState<School | null>(null);
  const [assignedClasses, setAssignedClasses] = useState<any[]>([]);
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
            const [reportRes, schoolRes] = await Promise.all([
              schoolReportsService.getSchoolReport(schoolId),
              schoolService.getById(schoolId),
            ]);

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

            if (schoolRes.data?.data) {
              setSchoolInfo(schoolRes.data.data);
            }
          }
        } else if (isMentor() || isStudent()) {
          const schoolId = getSchoolId();
          const [userRes, assessmentsRes, gradesRes, schoolRes] = await Promise.all([
            api.get<{ user: any }>(`/users/${user?._id}`),
            api.get<{ assessments: any[] }>('/assessments'),
            isStudent() ? api.get<{ grades: any[] }>('/grades') : Promise.resolve({ data: { grades: [] } }),
            schoolId ? schoolService.getById(schoolId) : Promise.resolve({ data: { data: null } }),
          ]);

          const userData = userRes.data?.user;
          const assessments = assessmentsRes.data?.assessments || [];
          if (schoolRes.data?.data) {
            setSchoolInfo(schoolRes.data.data);
          }

          setAssignedClasses(userData?.classIds || []);
          
          if (isMentor()) {
            setMentorStats({
              totalClasses: userData?.classIds?.length || 0,
              totalAssessments: assessments.length,
              totalStudents: userData?.classIds?.reduce((acc: number, c: any) => acc + (c.studentCount || 0), 0) || 0,
              pendingGrades: 0,
            });

            setRecentActivity(assessments.slice(0, 5).map((a: any) => ({
              id: a._id,
              action: 'Created Assessment',
              description: a.title,
              timestamp: a.createdAt,
              type: 'school' as const,
            })));
          } else {
            const grades = gradesRes.data?.grades || [];
            const mockGpa = grades.length > 0 ? 3.5 + (Math.random() * 0.5) : 0.0;

            setStudentStats({
              gpa: mockGpa,
              totalClasses: userData?.classIds?.length || 0,
              completedAssessments: grades.length,
              pendingAssessments: assessments.filter((a: any) => a.isActive).length,
            });

            setRecentActivity(grades.slice(0, 5).map((g: any) => ({
              id: g._id,
              action: 'Received Grade',
              description: `${g.grade} in ${g.courseId?.name || 'Class'}`,
              timestamp: g.createdAt,
              type: 'school' as const,
            })));
          }
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [isSystemAdmin, isSchoolAdmin, getSchoolId, isMentor, user?._id]);

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
      color: 'bg-[#064e3b]',
    },
    {
      title: 'Active Students',
      value: schoolStats.activeStudents,
      icon: CheckCircle,
      description: 'Currently active',
      href: '/users',
      color: 'bg-emerald-600',
    },
    {
      title: 'Mentors',
      value: schoolStats.totalMentors,
      icon: Users,
      description: 'Total mentors',
      href: '/users',
      color: 'bg-teal-600',
    },
    {
      title: 'Classes',
      value: schoolStats.totalClasses,
      icon: GraduationCap,
      description: 'Total classes',
      href: '/classes',
      color: 'bg-[#b45309]',
    },
    {
      title: 'Courses',
      value: schoolStats.totalCourses,
      icon: BookOpen,
      description: 'Total courses',
      href: '/courses',
      color: 'bg-orange-600',
    },
  ] : [];

  const mentorStatCards = mentorStats ? [
    {
      title: 'Total Classes',
      value: mentorStats.totalClasses,
      icon: GraduationCap,
      description: 'Your assigned classes',
      href: '/classes',
      color: 'bg-[#064e3b]',
    },
    {
      title: 'Assessments',
      value: mentorStats.totalAssessments,
      icon: FileText,
      description: 'Courses you lead',
      href: '/assessments',
      color: 'bg-[#b45309]',
    },
    {
      title: 'Students',
      value: mentorStats.totalStudents,
      icon: Users,
      description: 'Total student reach',
      href: '/users',
      color: 'bg-emerald-600',
    },
  ] : [];

  const studentStatCards = [
    {
      title: 'Current GPA',
      value: '3.85',
      icon: GraduationCap,
      description: 'Academic standing',
      href: '/transcripts',
      color: 'bg-[#064e3b]',
    },
    {
      title: 'Credits',
      value: '42',
      icon: BookOpen,
      description: 'Completed units',
      href: '/courses',
      color: 'bg-emerald-600',
    },
    {
      title: 'Assessments',
      value: '12',
      icon: FileText,
      description: 'Pending evaluations',
      href: '/assessments',
      color: 'bg-[#b45309]',
    },
  ];

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

  const mentorQuickActions = [
    { name: 'New Assessment', href: '/assessments/create', icon: FileText },
    { name: 'My Classes', href: '/classes', icon: GraduationCap },
    { name: 'Grade Students', href: '/transcripts/generate', icon: CheckCircle },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const studentQuickActions = [
    { name: 'My Results', href: '/transcripts', icon: FileText },
    { name: 'Take Assessment', href: '/assessments', icon: ClipboardList },
    { name: 'My Classes', href: '/classes', icon: GraduationCap },
    { name: 'Profile', href: '/settings', icon: Users },
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
        <div className="w-10 h-10 border-4 border-[#064e3b] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isSysAdmin = isSystemAdmin();
  const isSchAdmin = isSchoolAdmin();
  const isMentorUser = isMentor();
  const isStudentUser = isStudent();

  const displayStats = isSysAdmin 
    ? systemAdminStatCards 
    : isSchAdmin 
      ? schoolAdminStatCards 
      : isMentorUser 
        ? mentorStatCards 
        : studentStatCards;

  const quickActions = isSysAdmin 
    ? systemAdminQuickActions 
    : isSchAdmin 
      ? schoolAdminQuickActions 
      : isMentorUser 
        ? mentorQuickActions 
        : studentQuickActions;

  const bannerTitle = isSysAdmin 
    ? 'System Admin Dashboard' 
    : (schoolInfo?.name || user?.schoolName)
      ? `${schoolInfo?.name || user?.schoolName}`
      : isSchAdmin
        ? 'School Admin Dashboard'
        : isMentorUser
          ? 'Faculty Portal'
          : 'Student Learning Portal';

  const bannerSub = isSysAdmin 
    ? "Welcome back! Here's an overview of your system." 
    : isSchAdmin
      ? `Welcome back! Here's your administrative overview.`
      : isMentorUser
        ? `Welcome back, Prof. ${user?.name.split(' ')[0]}. Here is your faculty overview.`
        : `Welcome back, ${user?.name.split(' ')[0]}. Here is your student overview.`;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className={cn(
        "rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl",
        isSysAdmin 
          ? "bg-slate-900 shadow-slate-200" 
          : "bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#042f24] shadow-emerald-200/50"
      )}>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              {bannerTitle}
              {!isSysAdmin && <Badge className="bg-amber-400 text-amber-950 hover:bg-amber-500 border-none">{isMentorUser ? 'Faculty' : isStudentUser ? 'Student' : 'Institutional'}</Badge>}
            </h1>
            <p className={cn("mt-2 text-lg font-medium", isSysAdmin ? "text-slate-300" : "text-emerald-100")}>
              {bannerSub}
            </p>
          </div>
          {!isSysAdmin && <div className="hidden md:block opacity-10 blur-[1px]"><GraduationCap className="h-40 w-40" /></div>}
        </div>
        
        {/* Visual Accents */}
        <div className="absolute top-0 right-0 h-64 w-64 bg-white/5 blur-[100px] rounded-full translate-x-32 -translate-y-32" />
        <div className="absolute bottom-0 left-0 h-64 w-64 bg-emerald-400/10 blur-[100px] rounded-full -translate-x-32 translate-y-32" />
        {/* Abstract design elements for non-sysadmins */}
        {!isSysAdmin && (
          <div className="absolute top-0 right-0 h-full w-1/3 pointer-events-none overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-400 opacity-10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 right-20 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl"></div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className={`grid gap-4 ${isSysAdmin ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5'}`}>
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
        {isSysAdmin && (
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
              <Link to="/schools" className="block mt-4 text-center text-sm text-blue-600 hover:underline font-medium">
                View All Schools →
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className={isSysAdmin ? '' : 'lg:col-span-2'}>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <Link key={action.name} to={action.href}>
                  <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                    <action.icon className="h-4 w-4 text-emerald-700" />
                    {action.name}
                  </button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Assigned Classes (Mentor/Student only) */}
        {(isMentorUser || isStudentUser) && (
          <Card className="lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{isStudentUser ? 'My Classes' : 'Assigned Classes'}</CardTitle>
                <CardDescription>{isStudentUser ? 'Courses you are enrolled in' : 'Courses and groups you lead'}</CardDescription>
              </div>
              <Link to="/classes">
                <Button variant="ghost" size="sm" className={cn("font-medium", isStudentUser ? "text-blue-600 hover:text-blue-700" : "text-emerald-700 hover:text-emerald-800")}>View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assignedClasses.length > 0 ? (
                  assignedClasses.map((cls: any) => (
                    <Link key={cls._id} to={`/classes/${cls._id}`}>
                      <div className="flex items-center p-4 border rounded-xl hover:bg-gray-50 transition-colors group">
                        <div className={cn(
                          "h-12 w-12 rounded-lg flex items-center justify-center mr-4 transition-colors",
                          isStudentUser ? "bg-blue-100 group-hover:bg-blue-200" : "bg-emerald-100 group-hover:bg-emerald-200"
                        )}>
                          <GraduationCap className={cn("h-6 w-6", isStudentUser ? "text-blue-600" : "text-emerald-700")} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 truncate">{cls.name}</p>
                          <p className="text-sm text-gray-500 truncate">{cls.subject || 'Academic Session'}</p>
                        </div>
                        <div className="ml-4 text-right">
                          <Badge variant="outline" className={cn(
                            "border-opacity-50",
                            isStudentUser ? "bg-blue-50 text-blue-800 border-blue-200" : "bg-emerald-50 text-emerald-800 border-emerald-200"
                          )}>
                            {isStudentUser ? (cls.mentorName || 'Lead Faculty') : `${cls.studentCount || 0} Students`}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-8 bg-gray-50 rounded-xl border border-dashed">
                    <GraduationCap className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No classes found.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* School Information (School Admin only) */}
        {isSchAdmin && schoolInfo && (
          <Card className="rounded-[2.5rem] border-none shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1">
            <CardHeader>
              <CardTitle>School Information</CardTitle>
              <CardDescription>Official school details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Address</p>
                <p className="text-sm font-medium text-gray-900">
                  {[schoolInfo.address, schoolInfo.city, schoolInfo.state].filter(Boolean).join(', ') || 'No address provided'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Plan</p>
                  <Badge className="capitalize bg-emerald-100 text-emerald-800 border-emerald-200">{schoolInfo.subscriptionType}</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge variant={
                    schoolInfo.status === 'approved' ? "success" : 
                    schoolInfo.status === 'pending' ? "warning" : 
                    schoolInfo.status === 'rejected' ? "destructive" : "secondary"
                  }>
                    {schoolInfo.status.charAt(0).toUpperCase() + schoolInfo.status.slice(1)}
                  </Badge>
                </div>
              </div>
              <Link to="/school-settings" className="block mt-4 text-center text-sm text-emerald-700 hover:underline font-medium">
                Manage Profile →
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Pending Approvals Alert (System Admin only) */}
        {isSysAdmin && stats.pendingApprovals > 0 && (
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
                className="text-sm text-blue-600 hover:underline mt-2 block font-medium"
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
          <CardDescription>{isSysAdmin ? 'Latest system events' : 'Latest events in your academic scope'}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start gap-4">
                <div className={cn(
                  "p-2 rounded-full",
                  isSysAdmin ? "bg-blue-100" : "bg-emerald-100"
                )}>
                  <FileText className={cn(
                    "h-4 w-4",
                    isSysAdmin ? "text-blue-600" : "text-emerald-700"
                  )} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">{activity.description}</p>
                    <span className="text-xs text-gray-400">{formatTimestamp(activity.timestamp)}</span>
                  </div>
                  <p className="text-sm text-gray-500">{activity.action}</p>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <div className="text-center py-8">
                <Clock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No recent activity found.</p>
              </div>
            )}
          </div>
          {isSysAdmin ? (
            <Link to="/audit-logs" className="block mt-4 text-center text-sm text-blue-600 hover:underline font-medium">
              View All Global Logs →
            </Link>
          ) : (
            <Link to={isStudentUser ? "/transcripts" : (isMentorUser ? "/assessments" : "/school-reports")} className={cn(
              "block mt-4 text-center text-sm hover:underline font-medium",
              isStudentUser ? "text-blue-600" : "text-emerald-700"
            )}>
              {isStudentUser ? 'View Detailed Results →' : (isMentorUser ? 'View All Assessments →' : 'View Full Reports →')}
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default DashboardPage;