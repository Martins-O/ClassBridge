export interface User {
  id: string;
  email: string;
  name: string;
  role: 'system_admin' | 'school_admin' | 'mentor' | 'student' | 'admissions' | 'counselor' | 'office_staff';
  schoolId?: string;
  classIds: string[];
  isActive: boolean;
  isApproved: boolean;
}

export interface School {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  description?: string;
  adminId: string;
  status: 'pending' | 'approved' | 'rejected';
  isActive: boolean;
  subscriptionType: 'basic' | 'premium' | 'enterprise';
}

export interface Class {
  id: string;
  name: string;
  description?: string;
  schoolId: string;
  mentorIds: string[];
  studentIds: string[];
  academicYear: string;
  duration: string;
  cohort: string;
  isActive: boolean;
}

export interface Course {
  id: string;
  name: string;
  description?: string;
  schoolId: string;
  classId: string;
  credits: number;
  duration: string;
  isActive: boolean;
}

export interface Grade {
  id: string;
  studentId: string;
  classId: string;
  mentorId: string;
  schoolId: string;
  gradeType: 'assignment' | 'quiz' | 'exam' | 'project' | 'participation' | 'final';
  title: string;
  points: number;
  maxPoints: number;
  percentage: number;
  letterGrade?: string;
  weight: number;
}

export interface Assessment {
  id: string;
  title: string;
  description?: string;
  classId: string;
  schoolId: string;
  mentorId: string;
  passingScore: number;
  maxAttempts: number;
  isActive: boolean;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
  error?: string;
  errorCode?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}