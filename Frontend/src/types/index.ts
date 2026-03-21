// User Roles
export type UserRole = 
  | 'system_admin' 
  | 'school_admin' 
  | 'office_staff' 
  | 'admissions' 
  | 'counselor' 
  | 'mentor' 
  | 'student';

// Permissions
export const PERMISSIONS = {
  VIEW_GLOBAL_STATS: 'view_global_stats',
  APPROVE_SCHOOL: 'approve_school',
  REQUEST_SCHOOL: 'request_school',
  MANAGE_SCHOOL: 'manage_school',
  MANAGE_USERS: 'manage_users',
  INVITE_STUDENTS: 'invite_students',
  INVITE_STAFF: 'invite_staff',
  DELETE_USERS: 'delete_users',
  REQUEST_DELETE: 'request_delete',
  APPROVE_DELETE: 'approve_delete',
  MANAGE_CLASSES: 'manage_classes',
  MANAGE_COURSES: 'manage_courses',
  MANAGE_ASSESSMENTS: 'manage_assessments',
  TAKE_ASSESSMENT: 'take_assessment',
  VIEW_GRADES: 'view_grades',
  GRADE_STUDENTS: 'grade_students',
  VIEW_REPORTS: 'view_reports',
  MANAGE_TRANSCRIPTS: 'manage_transcripts',
  VIEW_ALL_TRANSCRIPTS: 'view_all_transcripts',
  VIEW_OWN_TRANSCRIPT: 'view_own_transcript',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Role Permission Mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  system_admin: [PERMISSIONS.VIEW_GLOBAL_STATS, PERMISSIONS.APPROVE_SCHOOL],
  school_admin: [
    PERMISSIONS.MANAGE_SCHOOL,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.INVITE_STUDENTS,
    PERMISSIONS.INVITE_STAFF,
    PERMISSIONS.DELETE_USERS,
    PERMISSIONS.MANAGE_CLASSES,
    PERMISSIONS.MANAGE_COURSES,
    PERMISSIONS.MANAGE_ASSESSMENTS,
    PERMISSIONS.TAKE_ASSESSMENT,
    PERMISSIONS.VIEW_GRADES,
    PERMISSIONS.GRADE_STUDENTS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.MANAGE_TRANSCRIPTS,
    PERMISSIONS.VIEW_ALL_TRANSCRIPTS,
    PERMISSIONS.VIEW_OWN_TRANSCRIPT,
  ],
  office_staff: [
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.INVITE_STUDENTS,
    PERMISSIONS.INVITE_STAFF,
    PERMISSIONS.REQUEST_DELETE,
    PERMISSIONS.MANAGE_CLASSES,
    PERMISSIONS.MANAGE_COURSES,
    PERMISSIONS.MANAGE_ASSESSMENTS,
    PERMISSIONS.TAKE_ASSESSMENT,
    PERMISSIONS.VIEW_GRADES,
    PERMISSIONS.GRADE_STUDENTS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.MANAGE_TRANSCRIPTS,
    PERMISSIONS.VIEW_ALL_TRANSCRIPTS,
    PERMISSIONS.VIEW_OWN_TRANSCRIPT,
  ],
  admissions: [PERMISSIONS.INVITE_STUDENTS, PERMISSIONS.VIEW_REPORTS],
  counselor: [
    PERMISSIONS.VIEW_GRADES,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_ALL_TRANSCRIPTS,
    PERMISSIONS.VIEW_OWN_TRANSCRIPT,
  ],
  mentor: [
    PERMISSIONS.MANAGE_ASSESSMENTS,
    PERMISSIONS.TAKE_ASSESSMENT,
    PERMISSIONS.VIEW_GRADES,
    PERMISSIONS.GRADE_STUDENTS,
    PERMISSIONS.VIEW_OWN_TRANSCRIPT,
  ],
  student: [
    PERMISSIONS.VIEW_GRADES,
    PERMISSIONS.TAKE_ASSESSMENT,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_OWN_TRANSCRIPT,
  ],
};

// User interface
export interface User {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  schoolId?: string | { _id: string; name: string };
  studentId?: string;
  phone?: string;
  bio?: string;
  profileImage?: string;
  isActive: boolean;
  isApproved: boolean;
  schoolStatus?: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

// School interface
export interface School {
  _id: string;
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
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Navigation types
export type RootStackParamList = {
  Home: undefined;
  Auth: undefined;
  Login: undefined;
  Register: undefined;
  RegisterSchool: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  RegisterSchool: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Assessments: undefined;
  Grades: undefined;
  Profile: undefined;
};

export type DashboardStackParamList = {
  Dashboard: undefined;
  Classes: undefined;
  Courses: undefined;
  Students: undefined;
  Mentors: undefined;
  Approvals: undefined;
  DeletionRequests: undefined;
  Settings: undefined;
};
