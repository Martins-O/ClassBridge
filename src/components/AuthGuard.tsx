'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export type UserRole = 'school_admin' | 'mentor' | 'student' | 'super_admin';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  schoolId?: string;
  classIds?: string[];
}

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  requireSchool?: boolean;
}

export default function AuthGuard({ children, requiredRoles = [], requireSchool = false }: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);

        // Check role requirements
        if (requiredRoles.length > 0 && !requiredRoles.includes(data.user.role)) {
          router.push('/unauthorized');
          return;
        }

        // Check school requirement
        if (requireSchool && !data.user.schoolId) {
          router.push('/register-school');
          return;
        }
      } else {
        // Not authenticated, redirect to login
        router.push('/login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
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
          <p className="mt-6 text-gray-600 font-medium">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-12 max-w-md text-center border border-white/20">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h2>
          <p className="text-gray-600 mb-8">You need to be logged in to access this page.</p>
          <div className="space-y-4">
            <Link
              href="/login"
              className="block w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="block w-full border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:border-indigo-300 hover:text-indigo-600 transition-all duration-300"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Auth Context Provider */}
      <div className="auth-context" data-user={JSON.stringify(user)}>
        {children}
      </div>

      {/* Role-based Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                SurveyPro
              </span>
            </Link>

            <div className="flex items-center space-x-6">
              {/* School Admin Navigation */}
              {user.role === 'school_admin' && (
                <>
                  <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
                    Dashboard
                  </Link>
                  <Link href="/dashboard/classes" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
                    Classes
                  </Link>
                  <Link href="/dashboard/assessments" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
                    Assessments
                  </Link>
                  <Link href="/register-school" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
                    School Profile
                  </Link>
                </>
              )}

              {/* Mentor Navigation */}
              {user.role === 'mentor' && (
                <>
                  <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
                    Dashboard
                  </Link>
                  <Link href="/dashboard/assessments" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
                    My Assessments
                  </Link>
                  <Link href="/dashboard/students" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
                    My Students
                  </Link>
                </>
              )}

              {/* Student Navigation */}
              {user.role === 'student' && (
                <>
                  <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
                    Dashboard
                  </Link>
                  <Link href="/dashboard/assessments" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
                    My Assessments
                  </Link>
                </>
              )}

              {/* User Profile & Logout */}
              <div className="flex items-center space-x-3 bg-gray-100 rounded-xl px-3 py-2">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-red-600 transition-colors ml-2"
                  title="Logout"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}