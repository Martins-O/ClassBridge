'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  studentId?: string;
}

interface CourseRecord {
  _id: string;
  classId: string;
  className: string;
  academicYear: string;
  duration: string;
  cohort: string;
  grade: string;
  credits: number;
  mentorName: string;
  completedDate: string;
  notes?: string;
}

interface AcademicSummary {
  totalCredits: number;
  gpa: number;
  overallGrade: string;
}

interface Transcript {
  _id: string;
  studentInfo: {
    name: string;
    email: string;
    studentNumber: string;
    enrollmentDate: string;
  };
  courseRecords: CourseRecord[];
  academicSummary: AcademicSummary;
  generatedAt: string;
  lastUpdated: string;
}

function TranscriptDashboardContent() {
  const [, setUser] = useState<User | null>(null);
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const fetchUserAndTranscript = useCallback(async () => {
    try {
      // Fetch user info
      const userResponse = await fetch('/api/auth/me');
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData.user);

        // Fetch transcript based on user role
        let transcriptResponse;
        if (userData.user.role === 'student') {
          transcriptResponse = await fetch('/api/transcripts');
        } else {
          // For non-students, redirect to appropriate dashboard
          router.push('/dashboard');
          return;
        }

        if (transcriptResponse?.ok) {
          const transcriptData = await transcriptResponse.json();
          if (transcriptData.transcripts && transcriptData.transcripts.length > 0) {
            setTranscript(transcriptData.transcripts[0]);
          }
        }
      }
    } catch {
      setError('Failed to load transcript');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUserAndTranscript();
  }, [fetchUserAndTranscript]);

  const getGradeColor = (grade: string) => {
    switch (grade.charAt(0)) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-orange-600 bg-orange-100';
      case 'F': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getGPAColor = (gpa: number) => {
    if (gpa >= 3.7) return 'text-green-600';
    if (gpa >= 3.0) return 'text-blue-600';
    if (gpa >= 2.0) return 'text-yellow-600';
    if (gpa >= 1.0) return 'text-orange-600';
    return 'text-red-600';
  };

  const exportTranscript = async () => {
    try {
      // This would typically generate a PDF or print-friendly view
      window.print();
    } catch {
      alert('Failed to export transcript');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading your transcript...</p>
        </div>
      </div>
    );
  }

  if (error || !transcript) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">No Transcript Available</h1>
            <p className="text-gray-600 mb-6">
              {error || 'Your academic transcript has not been generated yet. Complete some courses to see your transcript here.'}
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Academic Transcript
              </h1>
              <p className="text-xl text-gray-600">Your complete academic record</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={exportTranscript}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Student Information Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <p className="text-lg font-medium text-gray-900">{transcript.studentInfo.name}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Student ID</label>
              <p className="text-lg font-medium text-gray-900">{transcript.studentInfo.studentNumber}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <p className="text-lg font-medium text-gray-900">{transcript.studentInfo.email}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Enrollment Date</label>
              <p className="text-lg font-medium text-gray-900">
                {new Date(transcript.studentInfo.enrollmentDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Academic Summary Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Academic Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-gray-900">{transcript.academicSummary.totalCredits}</p>
              <p className="text-gray-600">Total Credits</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className={`text-3xl font-bold ${getGPAColor(transcript.academicSummary.gpa)}`}>
                {transcript.academicSummary.gpa.toFixed(2)}
              </p>
              <p className="text-gray-600">GPA</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-gray-900">{transcript.academicSummary.overallGrade}</p>
              <p className="text-gray-600">Standing</p>
            </div>
          </div>
        </div>

        {/* Course Records */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Course History</h2>

          {transcript.courseRecords.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No completed courses yet</h3>
              <p className="text-gray-600">Your completed courses will appear here once mentors submit final grades.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Course</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Academic Year</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Duration</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Mentor</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Grade</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Credits</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {transcript.courseRecords.map((record) => (
                    <tr key={record._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-semibold text-gray-900">{record.className}</p>
                          <p className="text-sm text-gray-600">{record.cohort}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-700">{record.academicYear}</td>
                      <td className="py-4 px-4 text-gray-700">{record.duration}</td>
                      <td className="py-4 px-4 text-gray-700">{record.mentorName}</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getGradeColor(record.grade)}`}>
                          {record.grade}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center font-semibold text-gray-900">{record.credits}</td>
                      <td className="py-4 px-4 text-gray-700">
                        {new Date(record.completedDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Transcript generated on {new Date(transcript.generatedAt).toLocaleDateString()}</p>
          <p>Last updated on {new Date(transcript.lastUpdated).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}

export default function TranscriptDashboard() {
  return (
    <AuthGuard>
      <TranscriptDashboardContent />
    </AuthGuard>
  );
}
