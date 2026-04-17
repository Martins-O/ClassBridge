import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  
  isSystemAdmin: () => boolean;
  isSchoolAdmin: () => boolean;
  isMentor: () => boolean;
  isStudent: () => boolean;
  getSchoolId: () => string | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      login: (user, accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        set({ 
          user, 
          accessToken, 
          refreshToken, 
          isAuthenticated: true 
        });
      },
      
      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ 
          user: null, 
          accessToken: null, 
          refreshToken: null, 
          isAuthenticated: false 
        });
      },
      
      isSystemAdmin: () => {
        const user = get().user;
        return user?.role === 'system_admin';
      },
      
      isSchoolAdmin: () => {
        const user = get().user;
        return user?.role === 'school_admin';
      },
      
      isMentor: () => {
        const user = get().user;
        return user?.role === 'mentor';
      },
      
      isStudent: () => {
        const user = get().user;
        return user?.role === 'student';
      },
      
      getSchoolId: () => {
        const user = get().user;
        return user?.schoolId || null;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);