import axios from 'axios';
import type { AuthResponse, ApiResponse, PaginatedResponse, User, School, Class, Course, Grade } from '../types';
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
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),
  
  register: (data: { email: string; password: string; name: string; schoolName?: string; role?: string }) =>
    api.post<AuthResponse>('/auth/register', data),
  
  logout: () => api.post('/auth/logout'),
  
  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
};

export const userService = {
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get<PaginatedResponse<User>>('/users', { params }),
  
  getById: (id: string) =>
    api.get<ApiResponse<User>>(`/users/${id}`),
  
  update: (id: string, data: Partial<User>) =>
    api.patch<ApiResponse<User>>(`/users/${id}`, data),
  
  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/users/${id}`),
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
  getAll: (params?: { classId?: string; page?: number; limit?: number }) =>
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

export default api;