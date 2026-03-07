import { UserRole } from '../models/User';

export type { UserRole };

export interface IUser {
  _id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  schoolId?: string;
  classIds: string[];
  studentId?: string;
  isActive: boolean;
  profileImage?: string;
  phone?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDTO {
  email: string;
  password?: string;
  name: string;
  role?: UserRole;
  schoolId?: string;
  classIds?: string[];
  studentId?: string;
  isActive?: boolean;
  profileImage?: string;
  phone?: string;
  bio?: string;
}

export interface ISchool {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  description?: string;
  adminId: string;
  subscriptionType?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IClass {
  _id: string;
  name: string;
  description?: string;
  subject?: string;
  grade?: string;
  academicYear: string;
  semester?: string;
  cohort?: string;
  duration?: string;
  schoolId: string;
  mentorIds: string[];
  studentIds: string[];
  isActive: boolean;
  maxStudents?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICourse {
  _id: string;
  name: string;
  description?: string;
  classId: string;
  mentorId: string;
  subject?: string;
  duration?: string;
  startDate?: Date;
  endDate?: Date;
  maxStudents: number;
  syllabus?: string;
  isActive: boolean;
  studentIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IAssessment {
  _id: string;
  title: string;
  description?: string;
  classId: string;
  courseId?: string;
  mentorId: string;
  academicYear: string;
  semester?: string;
  assessmentType: 'peer' | 'mentor_to_student' | 'student_to_mentor' | 'self';
  questions: IAssessmentQuestion[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAssessmentQuestion {
  question: string;
  type: 'multiple-choice' | 'checkbox' | 'text' | 'rating' | 'scale';
  options?: string[];
  required?: boolean;
}

export interface IAssessmentAttempt {
  _id: string;
  assessmentId: string;
  studentId: string;
  responses: IAssessmentResponse[];
  score?: number;
  isSubmitted: boolean;
  startedAt: Date;
  submittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAssessmentResponse {
  questionId: string;
  answer: string | string[] | number;
}

export interface IGrade {
  _id: string;
  studentId: string;
  courseId: string;
  classId: string;
  mentorId: string;
  academicYear: string;
  semester?: string;
  grade: string;
  score?: number;
  comments?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITranscript {
  _id: string;
  studentId: string;
  schoolId: string;
  academicYear: string;
  semester?: string;
  courses: ITranscriptCourse[];
  overallGPA?: number;
  issuedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITranscriptCourse {
  courseId: string;
  courseName: string;
  grade: string;
  score?: number;
  credits?: number;
}

export interface INotification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: Date;
}

export interface IMentorInvitation {
  _id: string;
  email: string;
  schoolId: string;
  name: string;
  token: string;
  expiresAt: Date;
  accepted: boolean;
  createdAt: Date;
}

export interface IStudentInvitation {
  _id: string;
  email: string;
  classId: string;
  name: string;
  token: string;
  expiresAt: Date;
  accepted: boolean;
  createdAt: Date;
}

export interface IPasswordResetToken {
  _id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

export type ApiResponse<T = unknown> = {
  success?: boolean;
  message?: string;
  error?: string;
  details?: unknown[];
} & Record<string, T | undefined>;

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
