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
  school?: School;
  classes?: Class[];
  bio?: string;
  profileImage?: string;
  twoFactorEnabled?: boolean;
  emailVerified?: boolean;
  lastLoginAt?: string;
  lastLoginIP?: string;
  lastLoginDevice?: string;
  stats?: {
    gpa: number;
    academicStanding: string;
    courseCompletion: number;
    securityScore: number;
  };
  createdAt: string;
  updatedAt: string;
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
  description?: string;
  classId: string;
  className?: string;
  mentorId: string;
  mentorName?: string;
  studentIds?: string[];
  subject?: string;
  duration: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  maxStudents: number;
  syllabus?: string;
  enrolledCount?: number;
  availableSpots?: number;
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

export interface IAssessmentQuestion {
  id: string;
  type: 'rating' | 'text' | 'multiple-choice' | 'checkbox' | 'scale';
  question: string;
  description?: string;
  options?: string[];
  required: boolean;
  weight?: number;
  category?: string;
}

export interface Assessment {
  _id: string;
  title: string;
  description: string;
  questions: IAssessmentQuestion[];
  createdBy: string;
  schoolId: string;
  classIds: string[];
  targetRole: 'mentor' | 'student';
  assessorRole: 'mentor' | 'student' | 'self';
  assessmentType: 'peer' | 'mentor_to_student' | 'student_to_mentor' | 'self';
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  maxAttempts: number;
  timeLimit?: number;
  passingScore?: number;
  createdAt: string;
  updatedAt: string;
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