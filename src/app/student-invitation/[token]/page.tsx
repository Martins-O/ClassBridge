'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';

interface InvitationDetails {
  email: string;
  name: string;
  school: {
    name: string;
    id: string;
  };
  class: {
    name: string;
    id: string;
    subject?: string;
    grade?: string;
  };
  inviter: {
    name: string;
    role: string;
  };
  expiresAt: string;
  createdAt: string;
}

export default function StudentInvitationPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const { pushToast } = useToast();

  const [invitationDetails, setInvitationDetails] = useState<InvitationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAccepting, setIsAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState('');

  useEffect(() => {
    const fetchInvitationDetails = async () => {
      try {
        const response = await fetch(`/api/students/invitation/${token}`);

        if (response.ok) {
          const data = await response.json();
          setInvitationDetails(data.invitation);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to load invitation details');
        }
      } catch {
        setError('An error occurred while loading the invitation');
      } finally {
        setLoading(false);
      }
    };

    fetchInvitationDetails();
  }, [token]);


  const handleAcceptInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    setAcceptError('');

    // Validate passwords
    if (password.length < 6) {
      setAcceptError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setAcceptError('Passwords do not match');
      return;
    }

    setIsAccepting(true);

    try {
      const response = await fetch('/api/students/accept-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          password: password
        }),
      });

      if (response.ok) {
        // Show success message and redirect to login
        pushToast({ title: 'Welcome aboard!', description: 'Your student account is ready.', intent: 'success' });
        router.push('/login');
      } else {
        const errorData = await response.json();
        setAcceptError(errorData.error || 'Failed to accept invitation');
      }
    } catch {
      setAcceptError('An error occurred while accepting the invitation');
    } finally {
      setIsAccepting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'school_admin': return 'School Administrator';
      case 'mentor': return 'Mentor';
      default: return role;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invitation details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Invitation Error</h2>
            <p className="text-gray-600 mb-8">{error}</p>
            <Link
              href="/login"
              className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!invitationDetails) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold mb-2">You&apos;re Invited!</h1>
              <p className="text-indigo-100">Join your class and start learning</p>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Invitation Details */}
              <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Invitation Details</h2>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Student Name:</span>
                    <span className="font-semibold text-gray-900">{invitationDetails.name}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-semibold text-gray-900">{invitationDetails.email}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">School:</span>
                    <span className="font-semibold text-gray-900">{invitationDetails.school.name}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Class:</span>
                    <span className="font-semibold text-gray-900">
                      {invitationDetails.class.name}
                      {invitationDetails.class.subject && ` (${invitationDetails.class.subject})`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Invited by:</span>
                    <span className="font-semibold text-gray-900">
                      {invitationDetails.inviter.name} ({getRoleDisplayName(invitationDetails.inviter.role)})
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Expires:</span>
                    <span className="font-semibold text-red-600">{formatDate(invitationDetails.expiresAt)}</span>
                  </div>
                </div>
              </div>

              {/* Account Creation Form */}
              <form onSubmit={handleAcceptInvitation} className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Create Your Student Account</h3>
                  <p className="text-gray-600 mb-6">
                    Set up your password to create your student account and join the class.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Enter your password (min. 6 characters)"
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Confirm your password"
                    minLength={6}
                  />
                </div>

                {acceptError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-red-700 text-sm">{acceptError}</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/login"
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 transition-colors text-center"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={isAccepting}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:transform-none"
                  >
                    {isAccepting ? 'Creating Account...' : 'Accept Invitation & Create Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
