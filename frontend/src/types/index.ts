export type { User, School, Class, Course, Grade, Assessment, AuthResponse, ApiResponse, PaginatedResponse } from './index';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams extends PaginationParams {
  search?: string;
  status?: string;
}