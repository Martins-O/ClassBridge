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
}

export default function ClassManagement() {
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    schoolId: '',
    academicYear: '',
    semester: '',
    duration: '',
    cohort: '',
    maxStudents: 50
  });

  const fetchSchools = useCallback(async () => {
    try {
      const response = await fetch('/api/schools');
      if (response.ok) {
        const data = await response.json();
        setSchools(data.schools || []);
        if (data.schools?.length > 0 && !formData.schoolId) {
          setFormData(prev => ({ ...prev, schoolId: data.schools[0]._id }));
        }
      }
    } catch (error) {
    }
  }, [formData.schoolId]);

  const fetchClasses = useCallback(async () => {
    try {
      const response = await fetch('/api/classes?schoolId=all');
      if (response.ok) {
        const data = await response.json();
        setClasses(data.classes || []);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchools();
    fetchClasses();
  }, [fetchSchools, fetchClasses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

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
          schoolId: schools[0]?._id || '',
          academicYear: '',
          semester: '',
          duration: '',
          cohort: '',
          maxStudents: 50
        });
        fetchClasses();
      }
    } catch (error) {
    } finally {
      setSubmitting(false);
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
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading classes...</p>
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
              Class Management
            </h1>
            <p className="text-xl text-gray-600">Manage your school classes and cohorts</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
          >
            Create Class
          </button>
        </div>

        {/* Classes Grid */}
        {classes.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No classes yet</h2>
            <p className="text-gray-600 mb-8 text-lg">Create your first class to start organizing students and mentors.</p>
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
                    {/* Class metadata */}
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

        {/* Create Class Split Screen Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 z-50 overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-pink-400/10 to-indigo-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            <div className="min-h-screen flex relative z-10">
              {/* Left Side - Information */}
              <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 relative overflow-hidden">
                {/* Information side background pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
                <div className="absolute inset-0 opacity-30">
                  <div className="w-2 h-2 bg-white/20 rounded-full absolute top-20 left-20 animate-pulse"></div>
                  <div className="w-1 h-1 bg-white/20 rounded-full absolute top-32 left-32 animate-pulse delay-500"></div>
                  <div className="w-3 h-3 bg-white/20 rounded-full absolute top-40 left-16 animate-pulse delay-1000"></div>
                  <div className="w-2 h-2 bg-white/20 rounded-full absolute bottom-32 right-20 animate-pulse delay-300"></div>
                  <div className="w-1 h-1 bg-white/20 rounded-full absolute bottom-20 right-32 animate-pulse delay-700"></div>
                </div>

                <div className="relative flex flex-col justify-center items-start p-16 text-white">
                  <div className="mb-8">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h1 className="text-4xl font-bold mb-6 leading-tight">
                      Create Your
                      <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200">
                        New Class
                      </span>
                    </h1>
                    <p className="text-xl text-indigo-100 leading-relaxed mb-8">
                      Set up a new learning environment for your students and mentors to connect and grow together.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-1">Organize Students</h3>
                        <p className="text-indigo-200 text-sm">Group learners into cohorts for better collaboration</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-1">Track Progress</h3>
                        <p className="text-indigo-200 text-sm">Monitor learning outcomes throughout the semester</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-1">Enable Mentorship</h3>
                        <p className="text-indigo-200 text-sm">Connect experienced mentors with eager learners</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Form */}
              <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white/80 backdrop-blur-sm">
                <div className="w-full max-w-md">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                      Create New Class
                    </h2>
                    <p className="text-gray-600">Set up your learning environment</p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Class Name *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          required
                          className="relative w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 hover:border-gray-300"
                          placeholder="Mathematics 101"
                        />
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        School *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                        <select
                          value={formData.schoolId}
                          onChange={(e) => setFormData(prev => ({ ...prev, schoolId: e.target.value }))}
                          required
                          className="relative w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 hover:border-gray-300"
                        >
                          <option value="">Select School</option>
                          {schools.map(school => (
                            <option key={school._id} value={school._id}>{school.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Academic Year *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                          <input
                            type="text"
                            value={formData.academicYear}
                            onChange={(e) => setFormData(prev => ({ ...prev, academicYear: e.target.value }))}
                            required
                            className="relative w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 hover:border-gray-300"
                            placeholder="2024-2025"
                          />
                        </div>
                      </div>

                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Semester *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                          <select
                            value={formData.semester}
                            onChange={(e) => setFormData(prev => ({ ...prev, semester: e.target.value }))}
                            required
                            className="relative w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 hover:border-gray-300"
                          >
                            <option value="">Select</option>
                            <option value="Fall">Fall</option>
                            <option value="Spring">Spring</option>
                            <option value="Summer">Summer</option>
                            <option value="Winter">Winter</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Duration *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                          <select
                            value={formData.duration}
                            onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                            required
                            className="relative w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 hover:border-gray-300"
                          >
                            <option value="">Select</option>
                            <option value="1 month">1 Month</option>
                            <option value="2 months">2 Months</option>
                            <option value="3 months">3 Months</option>
                            <option value="4 months">4 Months</option>
                            <option value="6 months">6 Months</option>
                            <option value="1 year">1 Year</option>
                          </select>
                        </div>
                      </div>

                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Cohort *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                          <input
                            type="text"
                            value={formData.cohort}
                            onChange={(e) => setFormData(prev => ({ ...prev, cohort: e.target.value }))}
                            required
                            className="relative w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 hover:border-gray-300"
                            placeholder="Group A"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Description
                      </label>
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                          className="relative w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 hover:border-gray-300 resize-none"
                          placeholder="Brief description of the class..."
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="group relative w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:from-indigo-700 hover:to-purple-700 hover:shadow-2xl hover:shadow-indigo-500/25 transform hover:-translate-y-1 active:translate-y-0 active:shadow-lg disabled:transform-none"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000"></div>
                      {submitting ? (
                        <div className="flex items-center justify-center space-x-2 relative z-10">
                          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="animate-pulse">Creating Class...</span>
                        </div>
                      ) : (
                        <span className="relative z-10">Create Class</span>
                      )}
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setShowCreateModal(false)}
                        className="text-gray-500 hover:text-gray-700 font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Class Details Modal */}
        {selectedClass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedClass.name}</h2>
                    <p className="text-gray-600 mt-1">
                      {selectedClass.academicYear}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedClass(null)}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Mentors and Students */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Mentors ({selectedClass.mentorIds.length})</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedClass.mentorIds.map(mentor => (
                        <div key={mentor._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-indigo-600 font-semibold text-sm">
                              {mentor.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{mentor.name}</p>
                            <p className="text-sm text-gray-500">{mentor.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Students ({selectedClass.studentIds.length})</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedClass.studentIds.map(student => (
                        <div key={student._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-purple-600 font-semibold text-sm">
                              {student.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{student.name}</p>
                            <p className="text-sm text-gray-500">{student.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => router.push(`/dashboard/classes/${selectedClass._id}`)}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
                    >
                      View Dashboard
                    </button>
                    <button
                      onClick={() => setSelectedClass(null)}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
