'use client';

import { useState, useEffect, useCallback } from 'react';

interface Class {
  _id: string;
  name: string;
  description?: string;
  subject?: string;
  grade?: string;
  academicYear: string;
  semester?: string;
  teacherIds: Array<{ _id: string; name: string; email: string }>;
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
  const [classes, setClasses] = useState<Class[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
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
      console.error('Error fetching schools:', error);
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
      console.error('Error fetching classes:', error);
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
                    <p className="text-lg font-bold text-indigo-600">{classItem.teacherIds.length}</p>
                    <p className="text-xs text-gray-500">Teachers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-purple-600">{classItem.studentIds.length}</p>
                    <p className="text-xs text-gray-500">Students</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedClass(classItem)}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
                  >
                    Manage Class
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
                        School *
                      </label>
                      <select
                        value={formData.schoolId}
                        onChange={(e) => setFormData(prev => ({ ...prev, schoolId: e.target.value }))}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="">Select School</option>
                        {schools.map(school => (
                          <option key={school._id} value={school._id}>{school.name}</option>
                        ))}
                      </select>
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

        {/* Class Details Modal */}
        {selectedClass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedClass.name}</h2>
                    <p className="text-gray-600 mt-1">
                      {selectedClass.subject && `${selectedClass.subject} • `}
                      {selectedClass.grade && `Grade ${selectedClass.grade} • `}
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

                {/* Teachers and Students */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Teachers ({selectedClass.teacherIds.length})</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedClass.teacherIds.map(teacher => (
                        <div key={teacher._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-indigo-600 font-semibold text-sm">
                              {teacher.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{teacher.name}</p>
                            <p className="text-sm text-gray-500">{teacher.email}</p>
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
                  <div className="flex justify-end">
                    <button
                      onClick={() => setSelectedClass(null)}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
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
