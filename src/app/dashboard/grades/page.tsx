'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  schoolId: string;
}

interface Student {
  _id: string;
  name: string;
  email: string;
  studentId: string;
}

interface ClassData {
  _id: string;
  name: string;
  academicYear: string;
  duration: string;
  cohort: string;
  mentorIds?: string[];
  students?: Student[];
}

interface Grade {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
    studentId: string;
  };
  classId: {
    _id: string;
    name: string;
    academicYear: string;
  };
  gradeType: string;
  title: string;
  points: number;
  maxPoints: number;
  percentage: number;
  letterGrade: string;
  weight: number;
  gradedDate: string;
  comments?: string;
  status: string;
}

function GradesDashboardContent() {
  const [, setUser] = useState<User | null>(null);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'create' | 'manage'>('overview');
  const [gradeFormData, setGradeFormData] = useState({
    studentId: '',
    classId: '',
    gradeType: 'assignment',
    title: '',
    description: '',
    points: '',
    maxPoints: '',
    weight: '0.1',
    comments: '',
    dueDate: ''
  });

  const router = useRouter();

  const fetchUserAndClasses = useCallback(async () => {
    try {
      const userResponse = await fetch('/api/auth/me');
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData.user);

        // Only mentors and admins can access grades
        if (!['mentor', 'school_admin', 'super_admin'].includes(userData.user.role)) {
          router.push('/dashboard');
          return;
        }

        // Fetch classes
        const classResponse = await fetch('/api/classes');
        if (classResponse.ok) {
          const classData = await classResponse.json();
          let userClasses = classData.classes || [];

          // Filter classes based on user role
          if (userData.user.role === 'mentor') {
            userClasses = userClasses.filter((cls: ClassData) =>
              cls.mentorIds?.includes(userData.user._id)
            );
          }

          setClasses(userClasses);

          // Set first class as selected if any
          if (userClasses.length > 0) {
            setSelectedClassId(userClasses[0]._id);
            setGradeFormData(prev => ({ ...prev, classId: userClasses[0]._id }));
          }
        }
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchGrades = useCallback(async () => {
    if (!selectedClassId) return;

    try {
      const response = await fetch(`/api/grades?classId=${selectedClassId}`);
      if (response.ok) {
        const data = await response.json();
        setGrades(data.grades || []);
      }
    } catch {
    }
  }, [selectedClassId]);

  const fetchClassStudents = useCallback(async () => {
    if (!selectedClassId) return;

    try {
      const response = await fetch(`/api/classes/${selectedClassId}/students`);
      if (response.ok) {
        const data = await response.json();
        setClasses(prev =>
          prev.map(cls =>
            cls._id === selectedClassId
              ? { ...cls, students: data.students }
              : cls
          )
        );
      }
    } catch {
    }
  }, [selectedClassId]);

  useEffect(() => {
    fetchUserAndClasses();
  }, [fetchUserAndClasses]);

  useEffect(() => {
    if (selectedClassId) {
      fetchGrades();
      fetchClassStudents();
    }
  }, [selectedClassId, fetchGrades, fetchClassStudents]);

  const handleCreateGrade = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!gradeFormData.studentId || !gradeFormData.classId) {
      alert('Please select a student and class');
      return;
    }

    try {
      const response = await fetch('/api/grades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...gradeFormData,
          points: parseFloat(gradeFormData.points),
          maxPoints: parseFloat(gradeFormData.maxPoints),
          weight: parseFloat(gradeFormData.weight),
          dueDate: gradeFormData.dueDate ? new Date(gradeFormData.dueDate) : undefined
        }),
      });

      if (response.ok) {
        // Reset form and close modal
        setGradeFormData({
          studentId: '',
          classId: selectedClassId,
          gradeType: 'assignment',
          title: '',
          description: '',
          points: '',
          maxPoints: '',
          weight: '0.1',
          comments: '',
          dueDate: ''
        });
        setShowGradeModal(false);

        // Refresh grades
        fetchGrades();

        alert('✅ Grade created successfully!');
      } else {
        const errorData = await response.json();
        alert(`❌ Error: ${errorData.error}`);
      }
    } catch {
      alert('❌ Failed to create grade. Please try again.');
    }
  };

  const selectedClass = classes.find(cls => cls._id === selectedClassId);
  const classGrades = grades.filter(grade => grade.classId._id === selectedClassId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-indigo-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading grades dashboard...</p>
        </div>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">No Classes Available</h1>
            <p className="text-gray-600 mb-6">You need to be assigned to classes before you can manage grades.</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Grade Management
              </h1>
              <p className="text-xl text-gray-600">Manage student grades and assessments</p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Class Selector */}
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
              >
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name} ({cls.academicYear})
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowGradeModal(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Grade</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-2 mt-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'manage'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Grade Book
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && selectedClass && (
          <div className="space-y-8">
            {/* Class Information */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Class Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{selectedClass.students?.length || 0}</p>
                  <p className="text-gray-600">Students Enrolled</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{classGrades.length}</p>
                  <p className="text-gray-600">Total Grades</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {classGrades.length > 0
                      ? (classGrades.reduce((sum, grade) => sum + grade.percentage, 0) / classGrades.length).toFixed(1)
                      : '0'
                    }%
                  </p>
                  <p className="text-gray-600">Class Average</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-indigo-50 rounded-xl">
                <h3 className="font-semibold text-indigo-900 mb-2">{selectedClass.name}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-indigo-600 font-medium">Academic Year:</span>
                    <p className="text-indigo-800">{selectedClass.academicYear}</p>
                  </div>
                  <div>
                    <span className="text-indigo-600 font-medium">Duration:</span>
                    <p className="text-indigo-800">{selectedClass.duration}</p>
                  </div>
                  <div>
                    <span className="text-indigo-600 font-medium">Cohort:</span>
                    <p className="text-indigo-800">{selectedClass.cohort}</p>
                  </div>
                  <div>
                    <span className="text-indigo-600 font-medium">Status:</span>
                    <p className="text-indigo-800">Active</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Grades */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Grades</h2>
              {classGrades.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No grades recorded yet</h3>
                  <p className="text-gray-600 mb-6">Start grading student assignments and assessments.</p>
                  <button
                    onClick={() => setShowGradeModal(true)}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                  >
                    Add First Grade
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {classGrades.slice(0, 5).map((grade) => (
                    <div key={grade._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-semibold text-gray-900">{grade.studentId.name}</p>
                            <p className="text-sm text-gray-600">{grade.title}</p>
                          </div>
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                            {grade.gradeType}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-900">{grade.letterGrade}</p>
                        <p className="text-sm text-gray-600">{grade.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Grade Management Tab */}
        {activeTab === 'manage' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Grade Book</h2>

            {classGrades.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No grades available</h3>
                <p className="text-gray-600">Add grades to see the complete grade book here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Student</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Assignment</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Score</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Grade</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classGrades.map((grade) => (
                      <tr key={grade._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-semibold text-gray-900">{grade.studentId.name}</p>
                            <p className="text-sm text-gray-600">{grade.studentId.studentId}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-medium text-gray-900">{grade.title}</p>
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium capitalize">
                            {grade.gradeType}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <p className="font-semibold">{grade.points}/{grade.maxPoints}</p>
                          <p className="text-sm text-gray-600">{grade.percentage.toFixed(1)}%</p>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                            {grade.letterGrade}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-700">
                          {new Date(grade.gradedDate).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button className="text-indigo-600 hover:text-indigo-800 font-medium">
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Create Grade Modal */}
        {showGradeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Grade</h2>

                <form onSubmit={handleCreateGrade} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Student *
                      </label>
                      <select
                        value={gradeFormData.studentId}
                        onChange={(e) => setGradeFormData(prev => ({ ...prev, studentId: e.target.value }))}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="">Select Student</option>
                        {selectedClass?.students?.map((student) => (
                          <option key={student._id} value={student._id}>
                            {student.name} ({student.studentId})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Grade Type *
                      </label>
                      <select
                        value={gradeFormData.gradeType}
                        onChange={(e) => setGradeFormData(prev => ({ ...prev, gradeType: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="assignment">Assignment</option>
                        <option value="quiz">Quiz</option>
                        <option value="exam">Exam</option>
                        <option value="project">Project</option>
                        <option value="participation">Participation</option>
                        <option value="final">Final Grade</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={gradeFormData.title}
                      onChange={(e) => setGradeFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Assignment 1, Midterm Exam, etc."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Points Earned *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={gradeFormData.points}
                        onChange={(e) => setGradeFormData(prev => ({ ...prev, points: e.target.value }))}
                        required
                        min="0"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="85"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Max Points *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={gradeFormData.maxPoints}
                        onChange={(e) => setGradeFormData(prev => ({ ...prev, maxPoints: e.target.value }))}
                        required
                        min="0.1"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Weight
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={gradeFormData.weight}
                        onChange={(e) => setGradeFormData(prev => ({ ...prev, weight: e.target.value }))}
                        min="0"
                        max="1"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="0.1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Comments
                    </label>
                    <textarea
                      value={gradeFormData.comments}
                      onChange={(e) => setGradeFormData(prev => ({ ...prev, comments: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500 resize-none"
                      placeholder="Optional feedback for the student..."
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowGradeModal(false)}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
                    >
                      Add Grade
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

export default function GradesDashboard() {
  return (
    <AuthGuard>
      <GradesDashboardContent />
    </AuthGuard>
  );
}
