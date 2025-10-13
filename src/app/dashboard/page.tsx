'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  schoolId?: string;
  classIds?: string[];
  isActive: boolean;
  createdAt: string;
}

interface DashboardStats {
  totalSurveys: number;
  totalResponses: number;
  totalClasses: number;
  totalSchools: number;
}

function DashboardContent() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalSurveys: 0,
    totalResponses: 0,
    totalClasses: 0,
    totalSchools: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserAndStats();
  }, []);

  const fetchUserAndStats = async () => {
    try {
      // Fetch user info
      const userResponse = await fetch('/api/auth/me');
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData.user);
      }

      // Fetch basic stats
      const [surveysRes, classesRes, schoolsRes] = await Promise.all([
        fetch('/api/surveys'),
        fetch('/api/classes'),
        fetch('/api/schools')
      ]);

      let surveys = [];
      let classes = [];
      let schools = [];

      if (surveysRes.ok) {
        const surveysData = await surveysRes.json();
        surveys = surveysData.surveys || [];
      }

      if (classesRes.ok) {
        const classesData = await classesRes.json();
        classes = classesData.classes || [];
      }

      if (schoolsRes.ok) {
        const schoolsData = await schoolsRes.json();
        schools = schoolsData.schools || [];
      }

      // Get total responses across all surveys
      let totalResponses = 0;
      for (const survey of surveys) {
        try {
          const responseRes = await fetch(`/api/responses?surveyId=${survey.uniqueId}`);
          if (responseRes.ok) {
            const responseData = await responseRes.json();
            totalResponses += responseData.responses.length;
          }
        } catch {
          console.error('Error fetching responses for survey:', survey.uniqueId);
        }
      }

      setStats({
        totalSurveys: surveys.length,
        totalResponses,
        totalClasses: classes.length,
        totalSchools: schools.length
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'super_admin': 'Super Administrator',
      'school_admin': 'School Administrator',
      'mentor': 'Mentor',
      'student': 'Student'
    };
    return roleMap[role] || role;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getQuickActions = () => {
    if (!user) return [];

    const actions = [];

    // Common actions for all users
    actions.push({
      title: 'Surveys',
      description: 'View and manage surveys',
      href: '/dashboard/surveys',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'from-blue-500 to-cyan-500'
    });

    // School and class management for admins
    if (['super_admin', 'school_admin'].includes(user.role)) {
      actions.push({
        title: 'School Management',
        description: 'Manage school and classes',
        href: '/dashboard/school',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        ),
        color: 'from-indigo-500 to-purple-500'
      });
    }

    // Mentor dashboard
    if (user.role === 'mentor') {
      actions.push({
        title: 'My Classes',
        description: 'View and manage your assigned classes',
        href: '/dashboard/mentor',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ),
        color: 'from-purple-500 to-pink-500'
      });

      actions.push({
        title: 'Grade Management',
        description: 'Create and manage student grades',
        href: '/dashboard/grades',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        ),
        color: 'from-green-500 to-emerald-500'
      });
    }

    // Student transcript access
    if (user.role === 'student') {
      actions.push({
        title: 'My Transcript',
        description: 'View your academic transcript and grades',
        href: '/dashboard/transcript',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
        color: 'from-blue-500 to-cyan-500'
      });
    }

    // School registration for new users
    if (!user.schoolId) {
      actions.push({
        title: 'Register School',
        description: 'Register your educational institution',
        href: '/register-school',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        ),
        color: 'from-green-500 to-emerald-500'
      });
    }

    return actions;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-indigo-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {getGreeting()}, {user?.name}!
          </h1>
          <p className="text-xl text-gray-600">
            Welcome to your educational platform dashboard
          </p>
          <div className="flex items-center space-x-4 mt-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
              {getRoleDisplayName(user?.role || '')}
            </span>
            {user?.schoolId && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                School Member
              </span>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSurveys}</p>
                <p className="text-gray-600">Total Surveys</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalResponses}</p>
                <p className="text-gray-600">Survey Responses</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalClasses}</p>
                <p className="text-gray-600">Active Classes</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSchools}</p>
                <p className="text-gray-600">Registered Schools</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getQuickActions().map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="group bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300`}>
                    {action.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {action.title}
                    </h3>
                  </div>
                </div>
                <p className="text-gray-600">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity / Help Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Getting Started */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Getting Started</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Create Your First Survey</h4>
                  <p className="text-gray-600 text-sm">Build and share surveys to collect responses from your audience.</p>
                </div>
              </div>

              {user?.role === 'school_admin' && (
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Set Up Your Classes</h4>
                    <p className="text-gray-600 text-sm">Organize students and mentors into classes for better management.</p>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Invite Team Members</h4>
                  <p className="text-gray-600 text-sm">Add mentors, students, and administrators to your platform.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Navigation */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Platform Features</h3>
            <div className="space-y-4">
              <Link
                href="/dashboard/surveys"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-900">Survey Management</span>
                </div>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              {['super_admin', 'school_admin'].includes(user?.role || '') && (
                <Link
                  href="/dashboard/school"
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <span className="font-medium text-gray-900">School & Classes</span>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}

              {!user?.schoolId && (
                <Link
                  href="/register-school"
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <span className="font-medium text-gray-900">Register School</span>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}