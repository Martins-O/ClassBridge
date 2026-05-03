export interface User {
  _id: string;
  email: string;
  name: string;
  role: string;
  schoolId?: string;
  schoolName?: string;
  phone?: string;
  status?: string;
  classIds: string[];
  isActive: boolean;
  isApproved: boolean;
  createdAt?: string;
}

export interface School {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  website?: string;
  description?: string;
  adminId: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended' | 'active';
  isActive: boolean;
  subscriptionType: 'basic' | 'premium' | 'enterprise' | 'free';
  maxStudents?: number;
  maxTeachers?: number;
  suspendedAt?: string;
  suspendedBy?: string;
  suspensionReason?: string;
  createdAt?: string;
}

export interface Class {
  _id: string;
  name: string;
  description?: string;
  schoolId: string;
  schoolName?: string;
  mentorIds: string[];
  studentIds: string[];
  academicYear: string;
  duration: string;
  cohort: string;
  isActive: boolean;
}

export interface Course {
  _id: string;
  name: string;
  code?: string;
  description?: string;
  category?: string;
  schoolId: string;
  schoolName?: string;
  classId: string;
  className?: string;
  credits: number;
  duration: string;
  studentIds?: string[];
  isActive: boolean;
}

export interface Grade {
  _id: string;
  studentId: string;
  classId: string;
  mentorId: string;
  schoolId: string;
  gradeType: string;
  title: string;
  points: number;
  maxPoints: number;
  percentage: number;
  letterGrade?: string;
  weight: number;
}

export interface Assessment {
  _id: string;
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
  user?: User;
  accessToken?: string;
  refreshToken?: string;
  error?: string;
  errorCode?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  total?: number;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}