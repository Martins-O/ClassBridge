import axios from 'axios';
import type { AuthResponse, ApiResponse, PaginatedResponse, User, School, Class, Course, Grade } from '../types';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
  getAll: (params?: { schoolId?: string }) =>
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
  getAll: (params?: { classId?: string }) =>
    api.get<PaginatedResponse<Course>>('/courses', { params }),
  
  getById: (id: string) =>
    api.get<ApiResponse<Course>>(`/courses/${id}`),
  
  create: (data: Partial<Course>) =>
    api.post<ApiResponse<Course>>('/courses', data),
  
  update: (id: string, data: Partial<Course>) =>
    api.patch<ApiResponse<Course>>(`/courses/${id}`, data),
};

export const gradeService = {
  getAll: (params?: { studentId?: string; classId?: string }) =>
    api.get<PaginatedResponse<Grade>>('/grades', { params }),
  
  create: (data: Partial<Grade>) =>
    api.post<ApiResponse<Grade>>('/grades', data),
};

export default api;