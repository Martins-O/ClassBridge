import { create } from 'zustand';
import { storage } from '@/lib/storage';
import { User, LoginResponse } from '@/types';
import { apiClient } from '@/lib/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', {
        email,
        password,
      });

      const { user, accessToken, refreshToken } = response.data;

      // Store tokens securely
      await storage.setItemAsync('accessToken', accessToken);
      await storage.setItemAsync('refreshToken', refreshToken);
      await storage.setItemAsync('user', JSON.stringify(user));

      set({ user, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  register: async (name: string, email: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await apiClient.post<{ user: User }>('/auth/register', {
        name,
        email,
        password,
      });

      set({ isLoading: false });
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Ignore logout API errors
    }
    
    await storage.clearAuth();
    
    set({ user: null, isAuthenticated: false, error: null });
  },

  fetchUser: async () => {
    try {
      const response = await apiClient.get<{ user: User }>('/auth/me');
      const user = response.data.user;
      
      await storage.setItemAsync('user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
    } catch (error) {
      // Token might be invalid
      await get().logout();
    }
  },

  initialize: async () => {
    set({ isLoading: true });
    
    try {
      const [token, userJson] = await Promise.all([
        storage.getItemAsync('accessToken'),
        storage.getItemAsync('user'),
      ]);

      if (token && userJson) {
        const user = JSON.parse(userJson) as User;
        set({ user, isAuthenticated: true, isLoading: false });
        
        // Verify token is still valid
        await get().fetchUser();
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      await get().logout();
      set({ isLoading: false });
    }
  },
}));
