import axios from 'axios';
import type { AuthResponse, ApiResponse, PaginatedResponse, User, School, Class, Course, Grade, Assessment } from '../types';
import { useAuthStore } from '../stores/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const refreshApi = axios.create({
            baseURL: API_BASE_URL,
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true,
          });
          const { data } = await refreshApi.post('/auth/refresh', { refreshToken });
          if (data.accessToken) {
            localStorage.setItem('accessToken', data.accessToken);
            if (data.refreshToken) {
              localStorage.setItem('refreshToken', data.refreshToken);
            }
            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
      
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export const authService = {
  login: (email: string, password: string, csrfToken?: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }, {
      headers: csrfToken ? { 'x-csrf-token': csrfToken } : {},
      withCredentials: true,
    }),
  
  register: (data: { 
    email: string; 
    password: string; 
    name: string; 
    schoolName: string;
    schoolEmail?: string;
    schoolPhone?: string;
    schoolAddress?: string;
    role?: string 
  }) =>
    api.post<AuthResponse>('/auth/register', data),
  
  logout: () => api.post('/auth/logout'),
   
  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),

  verifyEmail: (token: string) =>
    api.post<{ success: boolean; message?: string; error?: string; user?: any }>(`/auth/verify-email/${token}`),

  resendVerificationEmail: (email: string) =>
    api.post<{ success: boolean; message?: string; error?: string }>('/auth/resend-verification', { email }),
};

export const userService = {
  getAll: (params?: { page?: number; limit?: number; schoolId?: string | null; classId?: string; role?: string }) =>
    api.get<PaginatedResponse<User>>('/users', { params }),
  
  getById: (id: string) =>
    api.get<ApiResponse<User>>(`/users/${id}`),
  
  update: (id: string, data: Partial<User>) =>
    api.patch<ApiResponse<User>>(`/users/${id}`, data),
  
  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/users/${id}`),

  invite: (data: { name: string; email: string; role: string; schoolId: string }) =>
    api.post<{ success?: boolean; message: string; invitationId?: string; user?: User; isExistingUser?: boolean }>('/users/invite', data),
};

export const mentorService = {
  getInvitation: (token: string) =>
    api.get<{ invitation: any }>(`/mentors/accept-invitation/${token}`),
  
  acceptInvitation: (token: string, data: { password: string }) =>
    api.post<{ message: string; mentor: any }>(`/mentors/accept-invitation/${token}`, data),
};

export const studentService = {
  getInvitation: (token: string) =>
    api.get<{ invitation: any }>(`/students/invitation/${token}`),
  
  acceptInvitation: (data: { token: string; password: string }) =>
    api.post<{ message: string; user: any }>('/students/accept-invitation', data),
};

export const schoolService = {
  getAll: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<PaginatedResponse<School>>('/schools', { params }),
  
  getById: (id: string) =>
    api.get<ApiResponse<School>>(`/schools/${id}`),
  
  create: (data: Partial<School>) =>
    api.post<ApiResponse<School>>('/schools', data),
  
  update: (id: string, data: Partial<School>) =>
    api.patch<ApiResponse<School>>(`/schools/${id}`, data),
  
  updateStatus: (id: string, data: { status: string; reason?: string }) =>
    api.patch<ApiResponse<School>>(`/schools/${id}/status`, data),
  
  getStats: (id: string) =>
    api.get<{ success: boolean; totalUsers: number; totalClasses: number; totalCourses: number; activeStudents: number; pendingApprovals: number }>(`/schools/${id}/stats`),
  
  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/schools/${id}`),
};

export const classService = {
  getAll: (params?: { schoolId?: string; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<Class>>('/classes', { params }),
  
  getById: (id: string) =>
    api.get<ApiResponse<Class>>(`/classes/${id}`),
  
  create: (data: Partial<Class>) =>
    api.post<ApiResponse<Class>>('/classes', data),
  
  update: (id: string, data: Partial<Class>) =>
    api.patch<ApiResponse<Class>>(`/classes/${id}`, data),
  
  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/classes/${id}`),
};

export const courseService = {
  getAll: (params?: { classId?: string; schoolId?: string | null; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<Course>>('/courses', { params }),
  
  getById: (id: string) =>
    api.get<ApiResponse<Course>>(`/courses/${id}`),
  
  create: (data: Partial<Course>) =>
    api.post<ApiResponse<Course>>('/courses', data),
  
  update: (id: string, data: Partial<Course>) =>
    api.patch<ApiResponse<Course>>(`/courses/${id}`, data),
  
  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/courses/${id}`),
};

export interface AssessmentAttempt {
  _id: string;
  assessmentId: string;
  respondentId: string;
  classId: string;
  answers: any[];
  score?: number;
  isComplete: boolean;
  startedAt: string;
  completedAt?: string;
}

export const assessmentService = {
  getAll: (params?: { classId?: string; schoolId?: string | null; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<Assessment>>('/assessments', { params }),
  
  getById: (id: string) =>
    api.get<ApiResponse<Assessment>>(`/assessments/${id}`),
  
  create: (data: Partial<Assessment>) =>
    api.post<ApiResponse<Assessment>>('/assessments', data),
  
  createAttempt: (assessmentId: string, data: { respondentId: string; classId: string }) =>
    api.post<ApiResponse<AssessmentAttempt>>(`/assessments/${assessmentId}/attempt`, data),
  
  getAttempt: (attemptId: string) =>
    api.get<ApiResponse<AssessmentAttempt>>(`/assessments/attempts/${attemptId}`),
  
  updateAttempt: (attemptId: string, data: { answers: any[]; isComplete?: boolean }) =>
    api.put<ApiResponse<AssessmentAttempt>>(`/assessments/attempts/${attemptId}`, data),
  
  getAttempts: (assessmentId: string) =>
    api.get<{ success: boolean; data: AssessmentAttempt[] }>(`/assessments/${assessmentId}/attempts`),
};

export interface CourseRecord {
  classId: string;
  className: string;
  academicYear: string;
  duration: string;
  cohort: string;
  grade: string;
  credits: number;
  mentorId: string;
  mentorName: string;
  completedDate: string;
  notes?: string;
}

export interface Transcript {
  _id: string;
  studentId: string;
  schoolId: string;
  studentInfo: {
    name: string;
    email: string;
    studentNumber: string;
    enrollmentDate: string;
  };
  courseRecords: CourseRecord[];
  academicSummary: {
    totalCredits: number;
    gpa: number;
    overallGrade: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const transcriptService = {
  getAll: (params?: { studentId?: string; classId?: string; schoolId?: string | null; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<Transcript>>('/transcripts', { params }),
  
  getById: (id: string) =>
    api.get<ApiResponse<Transcript>>(`/transcripts/${id}`),
  
  create: (data: Partial<Transcript>) =>
    api.post<ApiResponse<Transcript>>('/transcripts', data),
  
  export: (id: string, format: 'pdf' | 'csv' = 'pdf') =>
    api.get(`/transcripts/${id}/export`, { params: { format }, responseType: 'blob' }),
};

export interface Approval {
  _id: string;
  schoolId: string;
  schoolName: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedBy: string;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

export const approvalService = {
  getPending: () =>
    api.get<{ success: boolean; approvals: Approval[] }>('/approvals/pending'),
  
  getPendingCount: () =>
    api.get<{ success: boolean; count: number }>('/approvals/pending/count'),
  
  getById: (id: string) =>
    api.get<{ success: boolean; approval: Approval }>(`/approvals/${id}`),
  
  approve: (id: string) =>
    api.post<{ success: boolean; message: string }>(`/approvals/${id}/approve`),
  
  reject: (id: string, reason: string) =>
    api.post<{ success: boolean; message: string }>(`/approvals/${id}/reject`, { reason }),
};

export const gradeService = {
  getAll: (params?: { studentId?: string; classId?: string }) =>
    api.get<PaginatedResponse<Grade>>('/grades', { params }),
  
  create: (data: Partial<Grade>) =>
    api.post<ApiResponse<Grade>>('/grades', data),
};

export interface AuditLog {
  _id: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export const auditService = {
  getAll: (params?: { page?: number; limit?: number; action?: string; resource?: string; userId?: string }) =>
    api.get<{ success: boolean; logs: AuditLog[]; total: number; page: number; limit: number; totalPages: number }>('/audit-logs', { params }),
  
  getRecent: (limit?: number) =>
    api.get<{ success: boolean; logs: AuditLog[] }>('/audit-logs/recent', { params: { limit } }),
};

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'assignment' | 'grade' | 'invitation';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get<{ success: boolean; notifications: Notification[]; total: number; unreadCount: number }>('/notifications', { params }),
  
  getUnreadCount: () =>
    api.get<{ success: boolean; count: number }>('/notifications/unread-count'),
  
  markAsRead: (id: string) =>
    api.patch<{ success: boolean }>(`/notifications/${id}/read`),
  
  markAllAsRead: () =>
    api.patch<{ success: boolean }>('/notifications/read-all'),

  deleteNotification: (id: string) =>
    api.delete<{ success: boolean }>(`/notifications/${id}`),
};

export interface Settings {
  general: {
    systemName: string;
    timezone: string;
    language: string;
    dateFormat: string;
  };
  notifications: {
    emailNotifications: boolean;
    approvalAlerts: boolean;
    registrationAlerts: boolean;
    dailyDigest: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    passwordExpiry: number;
  };
}

export const settingsService = {
  get: () =>
    api.get<{ settings: Settings }>('/settings'),
  
  update: (settings: Partial<Settings>) =>
    api.put<{ settings: Settings; message: string }>('/settings', settings),
};

export interface SystemStatus {
  success: boolean;
  uptime: number;
  uptimeFormatted: string;
  apiStatus: 'healthy' | 'degraded' | 'down';
  databaseStatus: 'connected' | 'disconnected';
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    cores: number;
    loadAverage: number[];
  };
  activeUsers: number;
  requestsLast24h: number;
  timestamp: string;
}

export interface SystemMetrics {
  success: boolean;
  requestsCount: number;
  errorRate: number;
  avgResponseTime: number;
  uptime: number;
  timestamp: string;
  history: Array<{
    timestamp: string;
    memoryUsed: number;
    memoryTotal: number;
    activeConnections: number;
  }>;
}

export const systemService = {
  getStatus: () =>
    api.get<SystemStatus>('/system/status'),
  
  getMetrics: () =>
    api.get<SystemMetrics>('/system/metrics'),
};

export const passwordService = {
  changePassword: (data: { currentPassword?: string; newPassword: string }) =>
    api.post<{ success: boolean; message: string }>('/auth/change-password', data),
  
  getPasswordStatus: (userId: string) =>
    api.get<{
      success: boolean;
      passwordExpired: boolean;
      passwordChangedAt: string;
      daysSinceChange: number;
      remindersSent: number;
      requirePasswordChange: boolean;
    }>(`/users/${userId}/password-status`),
  
  forcePasswordChange: (userId: string, reason?: string) =>
    api.post<{ success: boolean; message: string }>(`/users/${userId}/force-password-change`, { reason }),
  
  resetPassword: (userId: string, newPassword: string) =>
    api.post<{ success: boolean; message: string; tempPassword?: string }>(`/users/${userId}/reset-password`, { newPassword }),
};

export interface ActivityReport {
  success: boolean;
  totalLogins: number;
  totalActions: number;
  activeUsers: number;
  byRole: Record<string, number>;
  byAction: Record<string, number>;
}

export interface AuditLogReport {
  success: boolean;
  logs: Array<{
    _id: string;
    userId: string;
    userEmail: string;
    action: string;
    resource: string;
    resourceId?: string;
    ipAddress?: string;
    userAgent?: string;
    timestamp: string;
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const reportsService = {
  getAuditLogs: (params?: {
    startDate?: string;
    endDate?: string;
    action?: string;
    resource?: string;
    page?: number;
    limit?: number;
  }) =>
    api.get<AuditLogReport>('/reports/audit', { params }),
  
  getActivity: (params?: {
    startDate?: string;
    endDate?: string;
  }) =>
    api.get<ActivityReport>('/reports/activity', { params }),
  
  exportAuditLogsCsv: (params?: {
    startDate?: string;
    endDate?: string;
    action?: string;
    resource?: string;
  }) =>
    api.get('/reports/audit', { params: { ...params, format: 'csv' }, responseType: 'blob' }),
};

export interface SchoolReport {
  success: boolean;
  schoolId: string;
  schoolName: string;
  totalStudents: number;
  totalMentors: number;
  totalClasses: number;
  totalCourses: number;
  activeStudents: number;
  activeMentors: number;
  totalLogins: number;
  totalActions: number;
  byRole: Record<string, number>;
  byAction: Record<string, number>;
  recentActivity: Array<{
    _id: string;
    userId: string;
    userEmail: string;
    action: string;
    resource: string;
    timestamp: string;
  }>;
}

export const schoolReportsService = {
  getSchoolReport: (schoolId: string) =>
    api.get<SchoolReport>(`/schools/${schoolId}/report`),
  
  getSchoolActivity: (schoolId: string, params?: {
    startDate?: string;
    endDate?: string;
  }) =>
    api.get<ActivityReport>(`/schools/${schoolId}/activity`, { params }),
  
  exportSchoolAuditCsv: (schoolId: string) =>
    api.get(`/schools/${schoolId}/audit-export`, { responseType: 'blob' }),
};

export default api;