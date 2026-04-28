import {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canInviteRole,
  canManageRole,
  canDeleteUser,
  canRequestDelete,
  canApproveDelete,
  canApproveSchool,
  canRequestSchool,
  isSystemAdmin,
  isSchoolAdmin,
  isSchoolStaff,
  canViewAllGrades,
  canViewOwnGradesOnly,
} from '../../src/lib/permissions';
import { UserRole } from '../../src/models/User';

describe('Permissions', () => {
  describe('PERMISSIONS constant', () => {
    it('should have VIEW_GLOBAL_STATS permission', () => {
      expect(PERMISSIONS.VIEW_GLOBAL_STATS).toBe('view_global_stats');
    });

    it('should have APPROVE_SCHOOL permission', () => {
      expect(PERMISSIONS.APPROVE_SCHOOL).toBe('approve_school');
    });

    it('should have 20 permissions defined', () => {
      const permissionKeys = Object.keys(PERMISSIONS);
      expect(permissionKeys).toHaveLength(20);
    });
  });

  describe('ROLE_PERMISSIONS', () => {
    it('should grant system_admin only VIEW_GLOBAL_STATS and APPROVE_SCHOOL', () => {
      const permissions = ROLE_PERMISSIONS.system_admin;
      expect(permissions).toContain(PERMISSIONS.VIEW_GLOBAL_STATS);
      expect(permissions).toContain(PERMISSIONS.APPROVE_SCHOOL);
      expect(permissions).toHaveLength(2);
    });

    it('should grant school_admin all management permissions', () => {
      const permissions = ROLE_PERMISSIONS.school_admin;
      expect(permissions).toContain(PERMISSIONS.MANAGE_SCHOOL);
      expect(permissions).toContain(PERMISSIONS.MANAGE_USERS);
      expect(permissions).toContain(PERMISSIONS.INVITE_STUDENTS);
      expect(permissions).toContain(PERMISSIONS.DELETE_USERS);
      expect(permissions).toContain(PERMISSIONS.MANAGE_CLASSES);
      expect(permissions).toContain(PERMISSIONS.GRADE_STUDENTS);
      expect(permissions).toHaveLength(14);
    });

    it('should grant office_staff similar permissions to school_admin but no delete', () => {
      const permissions = ROLE_PERMISSIONS.office_staff;
      expect(permissions).toContain(PERMISSIONS.INVITE_STUDENTS);
      expect(permissions).not.toContain(PERMISSIONS.DELETE_USERS);
      expect(permissions).toHaveLength(13);
    });

    it('should grant admissions only INVITE_STUDENTS and VIEW_REPORTS', () => {
      const permissions = ROLE_PERMISSIONS.admissions;
      expect(permissions).toHaveLength(2);
      expect(permissions).toContain(PERMISSIONS.INVITE_STUDENTS);
      expect(permissions).toContain(PERMISSIONS.VIEW_REPORTS);
    });

    it('should grant counselor VIEW_GRADES and VIEW_ALL_TRANSCRIPTS', () => {
      const permissions = ROLE_PERMISSIONS.counselor;
      expect(permissions).toContain(PERMISSIONS.VIEW_GRADES);
      expect(permissions).toContain(PERMISSIONS.VIEW_ALL_TRANSCRIPTS);
      expect(permissions).toHaveLength(4);
    });

    it('should grant mentor MANAGE_ASSESSMENTS and GRADE_STUDENTS', () => {
      const permissions = ROLE_PERMISSIONS.mentor;
      expect(permissions).toContain(PERMISSIONS.MANAGE_ASSESSMENTS);
      expect(permissions).toContain(PERMISSIONS.GRADE_STUDENTS);
      expect(permissions).toHaveLength(4);
    });

    it('should grant student only VIEW_GRADES and TAKE_ASSESSMENT', () => {
      const permissions = ROLE_PERMISSIONS.student;
      expect(permissions).toContain(PERMISSIONS.VIEW_GRADES);
      expect(permissions).toContain(PERMISSIONS.TAKE_ASSESSMENT);
      expect(permissions).toHaveLength(4);
    });
  });

  describe('hasPermission', () => {
    it('should return true when role has permission', () => {
      expect(hasPermission('school_admin', PERMISSIONS.MANAGE_SCHOOL)).toBe(true);
    });

    it('should return false when role does not have permission', () => {
      expect(hasPermission('student', PERMISSIONS.MANAGE_SCHOOL)).toBe(false);
    });

    it('should return false for invalid role', () => {
      expect(hasPermission('invalid_role' as UserRole, PERMISSIONS.VIEW_GRADES)).toBe(false);
    });

    it('should allow system_admin to approve schools', () => {
      expect(hasPermission('system_admin', PERMISSIONS.APPROVE_SCHOOL)).toBe(true);
    });

    it('should not allow school_admin to approve schools', () => {
      expect(hasPermission('school_admin', PERMISSIONS.APPROVE_SCHOOL)).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true if role has any of the permissions', () => {
      expect(hasAnyPermission('school_admin', [PERMISSIONS.MANAGE_SCHOOL, PERMISSIONS.VIEW_GRADES])).toBe(true);
    });

    it('should return false if role has none of the permissions', () => {
      expect(hasAnyPermission('student', [PERMISSIONS.MANAGE_SCHOOL, PERMISSIONS.DELETE_USERS])).toBe(false);
    });

    it('should return true with single permission', () => {
      expect(hasAnyPermission('student', [PERMISSIONS.VIEW_GRADES])).toBe(true);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true if role has all permissions', () => {
      expect(hasAllPermissions('school_admin', [PERMISSIONS.MANAGE_SCHOOL, PERMISSIONS.VIEW_GRADES])).toBe(true);
    });

    it('should return false if role missing any permission', () => {
      expect(hasAllPermissions('student', [PERMISSIONS.VIEW_GRADES, PERMISSIONS.MANAGE_SCHOOL])).toBe(false);
    });
  });

  describe('canInviteRole', () => {
    it('should allow school_admin to invite', () => {
      expect(canInviteRole('school_admin')).toBe(true);
    });

    it('should allow office_staff to invite', () => {
      expect(canInviteRole('office_staff')).toBe(true);
    });

    it('should allow admissions to invite', () => {
      expect(canInviteRole('admissions')).toBe(true);
    });

    it('should not allow student to invite', () => {
      expect(canInviteRole('student')).toBe(false);
    });

    it('should not allow mentor to invite', () => {
      expect(canInviteRole('mentor')).toBe(false);
    });
  });

  describe('canManageRole', () => {
    it('should allow system_admin to manage any role', () => {
      expect(canManageRole('system_admin', 'school_admin')).toBe(true);
      expect(canManageRole('system_admin', 'mentor')).toBe(true);
      expect(canManageRole('system_admin', 'student')).toBe(true);
    });

    it('should allow school_admin to manage mentor', () => {
      expect(canManageRole('school_admin', 'mentor')).toBe(true);
    });

    it('should allow school_admin to manage student', () => {
      expect(canManageRole('school_admin', 'student')).toBe(true);
    });

    it('should not allow school_admin to manage system_admin', () => {
      expect(canManageRole('school_admin', 'system_admin')).toBe(false);
    });

    it('should not allow school_admin to manage school_admin', () => {
      expect(canManageRole('school_admin', 'school_admin')).toBe(false);
    });

    it('should not allow student to manage any role', () => {
      expect(canManageRole('student', 'student')).toBe(false);
    });
  });

  describe('canDeleteUser', () => {
    it('should allow school_admin to delete users', () => {
      expect(canDeleteUser('school_admin')).toBe(true);
    });

    it('should not allow office_staff to delete users', () => {
      expect(canDeleteUser('office_staff')).toBe(false);
    });

    it('should not allow mentor to delete users', () => {
      expect(canDeleteUser('mentor')).toBe(false);
    });

    it('should not allow student to delete users', () => {
      expect(canDeleteUser('student')).toBe(false);
    });
  });

  describe('canRequestDelete', () => {
    it('should allow office_staff to request delete', () => {
      expect(canRequestDelete('office_staff')).toBe(true);
    });

    it('should not allow school_admin to request delete', () => {
      expect(canRequestDelete('school_admin')).toBe(false);
    });
  });

  describe('canApproveDelete', () => {
    it('should not allow any current role to approve delete (not defined)', () => {
      expect(canApproveDelete('system_admin')).toBe(false);
      expect(canApproveDelete('school_admin')).toBe(false);
    });
  });

  describe('canApproveSchool', () => {
    it('should allow system_admin to approve school', () => {
      expect(canApproveSchool('system_admin')).toBe(true);
    });

    it('should not allow school_admin to approve school', () => {
      expect(canApproveSchool('school_admin')).toBe(false);
    });
  });

  describe('canRequestSchool', () => {
    it('should return false for all current roles', () => {
      expect(canRequestSchool('system_admin')).toBe(false);
      expect(canRequestSchool('school_admin')).toBe(false);
      expect(canRequestSchool('student')).toBe(false);
    });
  });

  describe('isSystemAdmin', () => {
    it('should return true for system_admin', () => {
      expect(isSystemAdmin('system_admin')).toBe(true);
    });

    it('should return false for other roles', () => {
      expect(isSystemAdmin('school_admin')).toBe(false);
      expect(isSystemAdmin('mentor')).toBe(false);
      expect(isSystemAdmin('student')).toBe(false);
    });
  });

  describe('isSchoolAdmin', () => {
    it('should return true for school_admin', () => {
      expect(isSchoolAdmin('school_admin')).toBe(true);
    });

    it('should return false for other roles', () => {
      expect(isSchoolAdmin('system_admin')).toBe(false);
      expect(isSchoolAdmin('mentor')).toBe(false);
      expect(isSchoolAdmin('student')).toBe(false);
    });
  });

  describe('isSchoolStaff', () => {
    it('should return true for school_admin', () => {
      expect(isSchoolStaff('school_admin')).toBe(true);
    });

    it('should return true for office_staff', () => {
      expect(isSchoolStaff('office_staff')).toBe(true);
    });

    it('should return true for admissions', () => {
      expect(isSchoolStaff('admissions')).toBe(true);
    });

    it('should return true for counselor', () => {
      expect(isSchoolStaff('counselor')).toBe(true);
    });

    it('should return true for mentor', () => {
      expect(isSchoolStaff('mentor')).toBe(true);
    });

    it('should return false for student', () => {
      expect(isSchoolStaff('student')).toBe(false);
    });

    it('should return false for system_admin', () => {
      expect(isSchoolStaff('system_admin')).toBe(false);
    });
  });

  describe('canViewAllGrades', () => {
    it('should not allow school_admin to view all grades (they have VIEW_OWN_TRANSCRIPT)', () => {
      expect(canViewAllGrades('school_admin')).toBe(false);
    });

    it('should not allow office_staff to view all grades (they have VIEW_OWN_TRANSCRIPT)', () => {
      expect(canViewAllGrades('office_staff')).toBe(false);
    });

    it('should not allow counselor to view all grades (they have VIEW_OWN_TRANSCRIPT)', () => {
      expect(canViewAllGrades('counselor')).toBe(false);
    });

    it('should not allow mentor to view all grades', () => {
      expect(canViewAllGrades('mentor')).toBe(false);
    });

    it('should not allow student to view all grades', () => {
      expect(canViewAllGrades('student')).toBe(false);
    });
  });

  describe('canViewOwnGradesOnly', () => {
    it('should allow mentor to view own grades only', () => {
      expect(canViewOwnGradesOnly('mentor')).toBe(true);
    });

    it('should allow student to view own grades only', () => {
      expect(canViewOwnGradesOnly('student')).toBe(true);
    });

    it('should not allow school_admin to view own only', () => {
      expect(canViewOwnGradesOnly('school_admin')).toBe(false);
    });

    it('should not allow office_staff to view own only', () => {
      expect(canViewOwnGradesOnly('office_staff')).toBe(false);
    });

    it('should not allow counselor to view own only', () => {
      expect(canViewOwnGradesOnly('counselor')).toBe(false);
    });
  });
});// Test coverage improvement commit
// Edge case test
