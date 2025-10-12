'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Class {
  _id: string;
  name: string;
  description?: string;
  subject?: string;
  grade?: string;
  academicYear: string;
  semester?: string;
  mentorIds: Array<{ _id: string; name: string; email: string }>;
  studentIds: Array<{ _id: string; name: string; email: string }>;
  isActive: boolean;
  maxStudents?: number;
  createdAt: string;
}

interface School {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  description?: string;
  adminId: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  schoolId?: string;
}

export default function SchoolManagement() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'classes' | 'students' | 'mentors'>('overview');
  const [classes, setClasses] = useState<Class[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    schoolId: '',
    subject: '',
    grade: '',
    academicYear: '',
    semester: '',
    maxStudents: 50
  });
  const [inviteFormData, setInviteFormData] = useState({
    studentName: '',
    studentEmail: '',
    gradeLevel: '',
    studentId: '',
    selectedClasses: [] as string[],
    personalMessage: ''
  });
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [focusedField, setFocusedField] = useState('');

  const fetchUserAndSchool = useCallback(async () => {
    try {
      const userResponse = await fetch('/api/auth/me');
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData.user);

        if (userData.user.schoolId) {
          const schoolResponse = await fetch(`/api/schools/${userData.user.schoolId}`);
          if (schoolResponse.ok) {
            const schoolData = await schoolResponse.json();
            setSchool(schoolData.school);
            setFormData(prev => ({ ...prev, schoolId: userData.user.schoolId }));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user and school:', error);
    }
  }, []);

  const fetchClasses = useCallback(async () => {
    try {
      const response = await fetch('/api/classes');
      if (response.ok) {
        const data = await response.json();
        setClasses(data.classes || []);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserAndSchool();
    fetchClasses();
  }, [fetchUserAndSchool, fetchClasses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setFormData({
          name: '',
          description: '',
          schoolId: user?.schoolId || '',
          subject: '',
          grade: '',
          academicYear: '',
          semester: '',
          maxStudents: 50
        });
        fetchClasses();
      }
    } catch (error) {
      console.error('Error creating class:', error);
    }
  };

  const toggleClassStatus = async (classId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/classes/${classId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      });

      if (response.ok) {
        fetchClasses();
      }
    } catch (error) {
      console.error('Error updating class:', error);
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingInvite(true);
    setInviteError('');

    try {
      // Send invitation for each selected class
      const invitePromises = inviteFormData.selectedClasses.map(classId =>
        fetch('/api/students/invite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentEmail: inviteFormData.studentEmail,
            studentName: inviteFormData.studentName,
            classId: classId
          }),
        })
      );

      const results = await Promise.all(invitePromises);

      // Check if all invitations were successful
      const allSuccessful = results.every(response => response.ok);

      if (allSuccessful) {
        // Reset form and close modal
        setInviteFormData({
          studentName: '',
          studentEmail: '',
          gradeLevel: '',
          studentId: '',
          selectedClasses: [],
          personalMessage: ''
        });
        setShowInviteModal(false);

        // Show success message (could be replaced with a toast notification)
        const successMessage = `🎉 Invitation sent successfully to ${inviteFormData.studentEmail}! They will receive an email with instructions to join the selected classes.`;
        alert(successMessage);
      } else {
        // Handle partial or complete failure
        const failedResults = await Promise.all(
          results.map(async (response) => {
            if (!response.ok) {
              const errorData = await response.json();
              return errorData.error || 'Failed to send invitation';
            }
            return null;
          })
        );

        const errors = failedResults.filter(error => error !== null);
        setInviteError(errors.join(', '));
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      setInviteError('Failed to send invitation. Please try again.');
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  const handleClassSelection = (classId: string, checked: boolean) => {
    setInviteFormData(prev => ({
      ...prev,
      selectedClasses: checked
        ? [...prev.selectedClasses, classId]
        : prev.selectedClasses.filter(id => id !== classId)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading school dashboard...</p>
        </div>
      </div>
    );
  }

  // Check if user has access to school management
  if (!user || !['school_admin', 'super_admin'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-8">Only school administrators can access this page.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              School Management
            </h1>
            <p className="text-xl text-gray-600">
              {school ? `Manage ${school.name}` : 'Manage your school'}
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-white/80 text-gray-700 px-4 py-2 rounded-xl font-medium hover:bg-white hover:shadow-lg transition-all duration-300 border border-gray-200"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white/50 backdrop-blur-sm rounded-2xl p-2 mb-8 border border-white/20">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'classes', label: 'Classes' },
            { id: 'students', label: 'Students' },
            { id: 'mentors', label: 'Mentors' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'overview' | 'classes' | 'students' | 'mentors')}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* School Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {school && (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">School Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">School Name</h3>
                    <p className="text-gray-900">{school.name}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Email</h3>
                    <p className="text-gray-900">{school.email}</p>
                  </div>
                  {school.phone && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">Phone</h3>
                      <p className="text-gray-900">{school.phone}</p>
                    </div>
                  )}
                  {school.address && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">Address</h3>
                      <p className="text-gray-900">{school.address}</p>
                    </div>
                  )}
                  {school.website && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">Website</h3>
                      <p className="text-gray-900">{school.website}</p>
                    </div>
                  )}
                  {school.description && (
                    <div className="md:col-span-2">
                      <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
                      <p className="text-gray-900">{school.description}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{classes.length}</p>
                    <p className="text-gray-600">Total Classes</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {classes.reduce((total, cls) => total + cls.studentIds.length, 0)}
                    </p>
                    <p className="text-gray-600">Total Students</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {classes.reduce((total, cls) => total + cls.mentorIds.length, 0)}
                    </p>
                    <p className="text-gray-600">Total Mentors</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Classes Tab */}
        {activeTab === 'classes' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Manage Classes</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
              >
                Create New Class
              </button>
            </div>

            {classes.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No classes yet</h3>
                <p className="text-gray-600 mb-8 text-lg">Create your first class to start organizing students and mentors.</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  Create First Class
                </button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {classes.map((classItem) => (
                  <div key={classItem._id} className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{classItem.name}</h3>
                        {classItem.description && (
                          <p className="text-gray-600 text-sm mb-2">{classItem.description}</p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          {classItem.subject && <span>Subject: {classItem.subject}</span>}
                          {classItem.grade && <span>Grade: {classItem.grade}</span>}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {classItem.academicYear} {classItem.semester && `• ${classItem.semester}`}
                        </p>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${classItem.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50/50 rounded-xl">
                      <div className="text-center">
                        <p className="text-lg font-bold text-indigo-600">{classItem.mentorIds.length}</p>
                        <p className="text-xs text-gray-500">Mentors</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-purple-600">{classItem.studentIds.length}</p>
                        <p className="text-xs text-gray-500">Students</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <button
                        onClick={() => router.push(`/dashboard/classes/${classItem._id}`)}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
                      >
                        View Class Dashboard
                      </button>
                      <button
                        onClick={() => toggleClassStatus(classItem._id, !classItem.isActive)}
                        className={`w-full px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                          classItem.isActive
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {classItem.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Student Management</h2>
              <button
                onClick={() => setShowInviteModal(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
              >
                Invite Student
              </button>
            </div>

            {/* Student Invitation Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6 mb-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Student Invitation Process</h3>
                  <p className="text-blue-800 mb-3">Students can only join your school through invitation. Once invited:</p>
                  <ul className="space-y-1 text-blue-800">
                    <li>• Students receive an email invitation to join your school</li>
                    <li>• They create an account or link their existing account</li>
                    <li>• Students can then be added to specific classes</li>
                    <li>• Students can only access classes they are enrolled in</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Students List */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Enrolled Students</h3>
                <p className="text-gray-600 mt-1">Students who have joined your school</p>
              </div>

              <div className="p-8">
                {/* Student count summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-900">
                          {classes.reduce((total, cls) => total + cls.studentIds.length, 0)}
                        </p>
                        <p className="text-green-700 font-medium">Total Enrolled</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-900">{classes.length}</p>
                        <p className="text-blue-700 font-medium">Active Classes</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-900">
                          {classes.length > 0 ? Math.round(classes.reduce((total, cls) => total + cls.studentIds.length, 0) / classes.length) : 0}
                        </p>
                        <p className="text-purple-700 font-medium">Avg per Class</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Students table placeholder */}
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Student Management Coming Soon</h3>
                  <p className="text-gray-600 mb-6">Full student management interface will be available here.</p>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
                  >
                    Invite Your First Student
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mentors Tab */}
        {activeTab === 'mentors' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Mentor Management</h2>
            <p className="text-gray-600">Mentor management features coming soon...</p>
          </div>
        )}

        {/* Create Class Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Class</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Class Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="Mathematics 101"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="Mathematics"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Grade
                      </label>
                      <input
                        type="text"
                        value={formData.grade}
                        onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="9th Grade"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Academic Year *
                      </label>
                      <input
                        type="text"
                        value={formData.academicYear}
                        onChange={(e) => setFormData(prev => ({ ...prev, academicYear: e.target.value }))}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="2024-2025"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Semester
                      </label>
                      <input
                        type="text"
                        value={formData.semester}
                        onChange={(e) => setFormData(prev => ({ ...prev, semester: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="Fall"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Max Students
                      </label>
                      <input
                        type="number"
                        value={formData.maxStudents}
                        onChange={(e) => setFormData(prev => ({ ...prev, maxStudents: parseInt(e.target.value) }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="50"
                        min="1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500 resize-none"
                      placeholder="Brief description of the class..."
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
                    >
                      Create Class
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Student Invitation Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Invite Student to School</h2>

                <form onSubmit={handleInviteSubmit} className="space-y-6">
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-6 mb-2">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-indigo-900 mb-2 text-lg">How Student Invitations Work</h3>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                            <p className="text-indigo-800 text-sm">Students receive a professional email invitation</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                            <p className="text-indigo-800 text-sm">They create an account using the secure invitation link</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                            <p className="text-indigo-800 text-sm">Automatic enrollment in selected classes upon acceptance</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-semibold mb-3 transition-colors duration-300 ${focusedField === 'studentName' ? 'text-indigo-600' : 'text-gray-700'}`}>
                        Student Name *
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                        <input
                          type="text"
                          required
                          value={inviteFormData.studentName}
                          onChange={(e) => setInviteFormData(prev => ({ ...prev, studentName: e.target.value }))}
                          onFocus={() => setFocusedField('studentName')}
                          onBlur={() => setFocusedField('')}
                          className={`relative w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-300 text-gray-900 font-medium ${
                            focusedField === 'studentName'
                              ? 'border-indigo-500 ring-2 ring-indigo-200 scale-[1.02] shadow-lg'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          placeholder="Enter student's full name"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <svg className={`w-5 h-5 transition-all duration-300 ${focusedField === 'studentName' ? 'text-indigo-500 scale-110' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-semibold mb-3 transition-colors duration-300 ${focusedField === 'studentEmail' ? 'text-indigo-600' : 'text-gray-700'}`}>
                        Student Email *
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                        <input
                          type="email"
                          required
                          value={inviteFormData.studentEmail}
                          onChange={(e) => setInviteFormData(prev => ({ ...prev, studentEmail: e.target.value }))}
                          onFocus={() => setFocusedField('studentEmail')}
                          onBlur={() => setFocusedField('')}
                          className={`relative w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-300 text-gray-900 font-medium ${
                            focusedField === 'studentEmail'
                              ? 'border-indigo-500 ring-2 ring-indigo-200 scale-[1.02] shadow-lg'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          placeholder="student@example.com"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <svg className={`w-5 h-5 transition-all duration-300 ${focusedField === 'studentEmail' ? 'text-indigo-500 scale-110' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-semibold mb-3 transition-colors duration-300 ${focusedField === 'gradeLevel' ? 'text-indigo-600' : 'text-gray-700'}`}>
                        Grade Level
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                        <input
                          type="text"
                          value={inviteFormData.gradeLevel}
                          onChange={(e) => setInviteFormData(prev => ({ ...prev, gradeLevel: e.target.value }))}
                          onFocus={() => setFocusedField('gradeLevel')}
                          onBlur={() => setFocusedField('')}
                          className={`relative w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-300 text-gray-900 font-medium ${
                            focusedField === 'gradeLevel'
                              ? 'border-indigo-500 ring-2 ring-indigo-200 scale-[1.02] shadow-lg'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          placeholder="e.g., 9th Grade, Year 10"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <svg className={`w-5 h-5 transition-all duration-300 ${focusedField === 'gradeLevel' ? 'text-indigo-500 scale-110' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-semibold mb-3 transition-colors duration-300 ${focusedField === 'studentId' ? 'text-indigo-600' : 'text-gray-700'}`}>
                        Student ID (Optional)
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                        <input
                          type="text"
                          value={inviteFormData.studentId}
                          onChange={(e) => setInviteFormData(prev => ({ ...prev, studentId: e.target.value }))}
                          onFocus={() => setFocusedField('studentId')}
                          onBlur={() => setFocusedField('')}
                          className={`relative w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-300 text-gray-900 font-medium ${
                            focusedField === 'studentId'
                              ? 'border-indigo-500 ring-2 ring-indigo-200 scale-[1.02] shadow-lg'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          placeholder="e.g., STU2024001"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <svg className={`w-5 h-5 transition-all duration-300 ${focusedField === 'studentId' ? 'text-indigo-500 scale-110' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-3 transition-colors duration-300 ${focusedField === 'classes' ? 'text-indigo-600' : 'text-gray-700'}`}>
                      Assign to Classes (Optional)
                    </label>
                    <div className={`bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-5 border-2 transition-all duration-300 ${
                      focusedField === 'classes' ? 'border-indigo-200 ring-2 ring-indigo-100' : 'border-gray-200'
                    }`}>
                      <p className="text-sm text-gray-600 mb-4 font-medium">Select classes to enroll this student in:</p>
                      <div className="space-y-3 max-h-40 overflow-y-auto custom-scrollbar">
                        {classes.map((classItem) => (
                          <label key={classItem._id} className="group flex items-center space-x-4 p-3 bg-white rounded-lg cursor-pointer hover:bg-indigo-50 transition-all duration-200 border border-gray-100 hover:border-indigo-200 hover:shadow-md">
                            <input
                              type="checkbox"
                              checked={inviteFormData.selectedClasses.includes(classItem._id)}
                              onChange={(e) => handleClassSelection(classItem._id, e.target.checked)}
                              onFocus={() => setFocusedField('classes')}
                              onBlur={() => setFocusedField('')}
                              className="w-5 h-5 text-indigo-600 bg-white border-2 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2 transition-all duration-200"
                            />
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 group-hover:text-indigo-900 transition-colors duration-200">{classItem.name}</p>
                              <p className="text-sm text-gray-600 group-hover:text-indigo-600 transition-colors duration-200">
                                {classItem.subject} • {classItem.academicYear}
                              </p>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </label>
                        ))}
                      </div>
                      {classes.length === 0 && (
                        <div className="text-center py-8">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                          <p className="text-sm text-gray-500 font-medium">No classes available</p>
                          <p className="text-xs text-gray-400 mt-1">Create classes first to assign students</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-3 transition-colors duration-300 ${focusedField === 'personalMessage' ? 'text-indigo-600' : 'text-gray-700'}`}>
                      Personal Message (Optional)
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                      <textarea
                        rows={4}
                        value={inviteFormData.personalMessage}
                        onChange={(e) => setInviteFormData(prev => ({ ...prev, personalMessage: e.target.value }))}
                        onFocus={() => setFocusedField('personalMessage')}
                        onBlur={() => setFocusedField('')}
                        className={`relative w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-300 text-gray-900 font-medium resize-none ${
                          focusedField === 'personalMessage'
                            ? 'border-indigo-500 ring-2 ring-indigo-200 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        placeholder="Add a personal welcome message for the student..."
                      />
                      <div className="absolute bottom-3 right-3">
                        <svg className={`w-5 h-5 transition-all duration-300 ${focusedField === 'personalMessage' ? 'text-indigo-500 scale-110' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {inviteError && (
                    <div className="bg-red-50/90 border border-red-200 rounded-xl p-4 animate-in slide-in-from-top-2 duration-300 backdrop-blur-sm">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-red-800 text-sm font-semibold">Error</p>
                          <p className="text-red-700 text-sm">{inviteError}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowInviteModal(false);
                        setInviteError('');
                        setFocusedField('');
                        setInviteFormData({
                          studentName: '',
                          studentEmail: '',
                          gradeLevel: '',
                          studentId: '',
                          selectedClasses: [],
                          personalMessage: ''
                        });
                      }}
                      disabled={isSubmittingInvite}
                      className="flex-1 sm:flex-none px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingInvite || inviteFormData.selectedClasses.length === 0}
                      className="flex-1 sm:flex-none px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {isSubmittingInvite ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Sending Invitation...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          <span>Send Invitation</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}