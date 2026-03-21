import { UserRole } from '@/models/User';

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

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  system_admin: [
    PERMISSIONS.VIEW_GLOBAL_STATS,
    PERMISSIONS.APPROVE_SCHOOL,
  ],
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
  admissions: [
    PERMISSIONS.INVITE_STUDENTS,
    PERMISSIONS.VIEW_REPORTS,
  ],
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

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

export function canInviteRole(inviterRole: UserRole): boolean {
  return hasAnyPermission(inviterRole, [PERMISSIONS.INVITE_STUDENTS, PERMISSIONS.INVITE_STAFF]);
}

export function canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
  if (managerRole === 'system_admin') return true;
  if (managerRole === 'school_admin') {
    return !['system_admin', 'school_admin'].includes(targetRole);
  }
  return false;
}

export function canDeleteUser(deleterRole: UserRole): boolean {
  return hasPermission(deleterRole, PERMISSIONS.DELETE_USERS);
}

export function canRequestDelete(requesterRole: UserRole): boolean {
  return hasPermission(requesterRole, PERMISSIONS.REQUEST_DELETE);
}

export function canApproveDelete(approverRole: UserRole): boolean {
  return hasPermission(approverRole, PERMISSIONS.APPROVE_DELETE);
}

export function canApproveSchool(role: UserRole): boolean {
  return hasPermission(role, PERMISSIONS.APPROVE_SCHOOL);
}

export function canRequestSchool(role: UserRole): boolean {
  return hasPermission(role, PERMISSIONS.REQUEST_SCHOOL);
}

export function isSystemAdmin(role: UserRole): boolean {
  return role === 'system_admin';
}

export function isSchoolAdmin(role: UserRole): boolean {
  return role === 'school_admin';
}

export function isSchoolStaff(role: UserRole): boolean {
  return ['school_admin', 'office_staff', 'admissions', 'counselor', 'mentor'].includes(role);
}

export function canViewAllGrades(role: UserRole): boolean {
  return hasPermission(role, PERMISSIONS.VIEW_GRADES) && 
         !hasAllPermissions(role, [PERMISSIONS.VIEW_GRADES, PERMISSIONS.VIEW_OWN_TRANSCRIPT]);
}

export function canViewOwnGradesOnly(role: UserRole): boolean {
  return hasAllPermissions(role, [PERMISSIONS.VIEW_GRADES, PERMISSIONS.VIEW_OWN_TRANSCRIPT]) &&
         !['school_admin', 'office_staff', 'counselor'].includes(role);
}
