import { create } from 'zustand';
import { UserRole, Permission, ROLE_PERMISSIONS } from '@/types';

interface PermissionState {
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  isSystemAdmin: () => boolean;
  isSchoolAdmin: () => boolean;
  isSchoolStaff: () => boolean;
  isStudent: () => boolean;
  getRolePermissions: () => Permission[];
}

export const usePermissionStore = create<PermissionState>((set, get) => ({
  hasPermission: (permission: Permission) => {
    // This will be implemented with user from authStore
    return false;
  },
  
  hasAnyPermission: (permissions: Permission[]) => {
    return permissions.some((p) => get().hasPermission(p));
  },
  
  hasAllPermissions: (permissions: Permission[]) => {
    return permissions.every((p) => get().hasPermission(p));
  },
  
  hasRole: (role: UserRole) => {
    return false;
  },
  
  hasAnyRole: (roles: UserRole[]) => {
    return roles.some((r) => get().hasRole(r));
  },
  
  isSystemAdmin: () => get().hasRole('system_admin'),
  
  isSchoolAdmin: () => get().hasRole('school_admin'),
  
  isSchoolStaff: () => {
    const staffRoles: UserRole[] = ['school_admin', 'office_staff', 'admissions', 'counselor', 'mentor'];
    return get().hasAnyRole(staffRoles);
  },
  
  isStudent: () => get().hasRole('student'),
  
  getRolePermissions: () => {
    return [];
  },
}));

// Helper function to check permissions against a role
export function checkPermission(role: UserRole | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function checkAnyPermission(role: UserRole | undefined, permissions: Permission[]): boolean {
  if (!role) return false;
  return permissions.some((p) => checkPermission(role, p));
}

export function checkAllPermissions(role: UserRole | undefined, permissions: Permission[]): boolean {
  if (!role) return false;
  return permissions.every((p) => checkPermission(role, p));
}

export function checkRole(userRole: UserRole | undefined, targetRole: UserRole): boolean {
  if (!userRole) return false;
  return userRole === targetRole;
}

export function checkAnyRole(userRole: UserRole | undefined, targetRoles: UserRole[]): boolean {
  if (!userRole) return false;
  return targetRoles.includes(userRole);
}
