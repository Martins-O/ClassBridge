'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import Footer from '@/components/Footer';

interface Assessment {
  _id: string;
  title: string;
  description: string;
  assessmentType: 'peer' | 'mentor_to_student' | 'student_to_mentor' | 'self';
  targetRole: 'mentor' | 'student';
  assessorRole: 'mentor' | 'student' | 'self';
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  maxAttempts?: number;
  timeLimit?: number;
  passingScore?: number;
  createdAt: string;
  schoolId: {
    _id: string;
    name: string;
  };
  classIds: Array<{
    _id: string;
    name: string;
    subject?: string;
  }>;
}

function AssessmentDashboardContent() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const response = await fetch('/api/assessments');
      if (response.ok) {
        const data = await response.json();
        setAssessments(data.assessments);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const deleteAssessment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assessment?')) return;

    try {
      const response = await fetch(`/api/assessments/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAssessments(assessments.filter(a => a._id !== id));
      } else {
        alert('Failed to delete assessment');
      }
    } catch (error) {
      alert('Error deleting assessment');
    }
  };

  const toggleAssessmentStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/assessments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        setAssessments(assessments.map(a =>
          a._id === id ? { ...a, isActive: !currentStatus } : a
        ));
      }
    } catch (error) {
    }
  };

  const getAssessmentTypeLabel = (type: string) => {
    const labels = {
      'peer': 'Peer Assessment',
      'mentor_to_student': 'Mentor → Student',
      'student_to_mentor': 'Student → Mentor',
      'self': 'Self Assessment'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const filteredAssessments = assessments.filter(assessment => {
    const matchesFilter = filter === 'all' ||
      (filter === 'active' && assessment.isActive) ||
      (filter === 'inactive' && !assessment.isActive) ||
      (filter === assessment.assessmentType);

    const matchesSearch = searchTerm === '' ||
      assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (assessment: Assessment) => {
    if (!assessment.isActive) return 'bg-gray-100 text-gray-800';

    const now = new Date();
    if (assessment.startDate && new Date(assessment.startDate) > now) {
      return 'bg-yellow-100 text-yellow-800';
    }
    if (assessment.endDate && new Date(assessment.endDate) < now) {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (assessment: Assessment) => {
    if (!assessment.isActive) return 'Inactive';

    const now = new Date();
    if (assessment.startDate && new Date(assessment.startDate) > now) {
      return 'Scheduled';
    }
    if (assessment.endDate && new Date(assessment.endDate) < now) {
      return 'Ended';
    }
    return 'Active';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-6 text-gray-600 font-medium">Loading assessments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Assessment Management
            </h1>
            <p className="text-xl text-gray-600">Create and manage assessments for your classes</p>
          </div>
          <div className="flex space-x-4">
            <Link
              href="/dashboard"
              className="bg-white/80 text-gray-700 px-4 py-2 rounded-xl font-medium hover:bg-white hover:shadow-lg transition-all duration-300 border border-gray-200"
            >
              ← Back to Dashboard
            </Link>
            <Link
              href="/dashboard/assessments/create"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
            >
              Create Assessment
            </Link>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20 mb-8">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {['all', 'active', 'inactive', 'peer', 'mentor_to_student', 'student_to_mentor', 'self'].map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`min-h-11 px-2 sm:px-4 py-2 rounded-xl font-medium transition-all duration-300 touch-manipulation text-xs sm:text-sm md:text-base text-center ${
                    filter === filterType
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                  }`}
                >
                  {filterType === 'all' ? 'All' :
                   filterType === 'active' ? 'Active' :
                   filterType === 'inactive' ? 'Inactive' :
                   filterType === 'peer' ? 'Peer' :
                   filterType === 'mentor_to_student' ? 'M→S' :
                   filterType === 'student_to_mentor' ? 'S→M' :
                   filterType === 'self' ? 'Self' : filterType}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-auto sm:max-w-sm">
              <input
                type="text"
                placeholder="Search assessments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500 bg-white/50 text-sm sm:text-base"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Assessments Grid */}
        {filteredAssessments.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No assessments found</h2>
            <p className="text-gray-600 mb-8 text-lg">Create your first assessment to start evaluating performance.</p>
            <Link
              href="/dashboard/assessments/create"
              className="inline-flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Your First Assessment
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAssessments.map((assessment) => (
              <div key={assessment._id} className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{assessment.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{assessment.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(assessment)}`}>
                    {getStatusText(assessment)}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Type:</span>
                    <span className="font-medium">{getAssessmentTypeLabel(assessment.assessmentType)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Target:</span>
                    <span className="font-medium capitalize">{assessment.targetRole}</span>
                  </div>
                  {assessment.classIds.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Classes:</span>
                      <span className="font-medium">{assessment.classIds.length} class(es)</span>
                    </div>
                  )}
                  {assessment.timeLimit && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Time Limit:</span>
                      <span className="font-medium">{assessment.timeLimit} min</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Link
                    href={`/dashboard/assessments/${assessment._id}`}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 text-center min-h-11 flex items-center justify-center touch-manipulation"
                  >
                    View Details
                  </Link>
                  <div className="flex gap-2 sm:gap-1">
                    <button
                      onClick={() => toggleAssessmentStatus(assessment._id, assessment.isActive)}
                      className={`flex-1 sm:flex-none px-3 sm:px-4 py-3 rounded-xl font-medium transition-all duration-300 min-h-11 touch-manipulation text-sm ${
                        assessment.isActive
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 active:bg-yellow-300'
                          : 'bg-green-100 text-green-700 hover:bg-green-200 active:bg-green-300'
                      }`}
                    >
                      {assessment.isActive ? 'Pause' : 'Activate'}
                    </button>
                    <button
                      onClick={() => deleteAssessment(assessment._id)}
                      className="flex-1 sm:flex-none px-3 sm:px-4 py-3 bg-red-100 text-red-700 rounded-xl font-medium hover:bg-red-200 active:bg-red-300 transition-all duration-300 min-h-11 touch-manipulation text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default function AssessmentDashboard() {
  return (
    <AuthGuard>
      <AssessmentDashboardContent />
    </AuthGuard>
  );
}