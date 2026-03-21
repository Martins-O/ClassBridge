import { useMemo } from 'react';
import { useAuthStore } from '@/stores';
import { Permission, UserRole, ROLE_PERMISSIONS, PERMISSIONS } from '@/types';
import { checkPermission, checkAnyPermission, checkAllPermissions, checkRole, checkAnyRole } from '@/stores/permissionStore';

export function usePermission() {
  const user = useAuthStore((state) => state.user);
  const role = user?.role;

  return useMemo(() => ({
    hasPermission: (permission: Permission) => checkPermission(role, permission),
    hasAnyPermission: (permissions: Permission[]) => checkAnyPermission(role, permissions),
    hasAllPermissions: (permissions: Permission[]) => checkAllPermissions(role, permissions),
    hasRole: (targetRole: UserRole) => checkRole(role, targetRole),
    hasAnyRole: (targetRoles: UserRole[]) => checkAnyRole(role, targetRoles),
    permissions: role ? ROLE_PERMISSIONS[role] : [],
    role,
  }), [role]);
}

export function useIsSystemAdmin(): boolean {
  const role = useAuthStore((state) => state.user?.role);
  return role === 'system_admin';
}

export function useIsSchoolAdmin(): boolean {
  const role = useAuthStore((state) => state.user?.role);
  return role === 'school_admin';
}

export function useIsStudent(): boolean {
  const role = useAuthStore((state) => state.user?.role);
  return role === 'student';
}

export function useIsSchoolStaff(): boolean {
  const role = useAuthStore((state) => state.user?.role);
  const staffRoles: UserRole[] = ['school_admin', 'office_staff', 'admissions', 'counselor', 'mentor'];
  return role ? staffRoles.includes(role) : false;
}

export function useCanDeleteUsers(): boolean {
  const role = useAuthStore((state) => state.user?.role);
  return checkPermission(role, PERMISSIONS.DELETE_USERS);
}

export function useCanManageAssessments(): boolean {
  const role = useAuthStore((state) => state.user?.role);
  return checkPermission(role, PERMISSIONS.MANAGE_ASSESSMENTS);
}

export function useCanGradeStudents(): boolean {
  const role = useAuthStore((state) => state.user?.role);
  return checkPermission(role, PERMISSIONS.GRADE_STUDENTS);
}
