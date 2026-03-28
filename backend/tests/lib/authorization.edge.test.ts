import { checkAuthorization, checkPermissions, checkRole } from '../../src/lib/authorization';

describe('Authorization Edge Cases', () => {
  describe('checkAuthorization', () => {
    it('should handle null user', () => {
      expect(checkAuthorization(null as any, 'action')).toBe(false);
    });

    it('should handle null action', () => {
      expect(checkAuthorization({ role: 'admin' }, null as any)).toBe(false);
    });
  });

  describe('checkPermissions', () => {
    it('should handle empty permissions', () => {
      expect(checkPermissions('admin', [])).toBe(false);
    });
  });

  describe('checkRole', () => {
    it('should handle null role', () => {
      expect(checkRole(null as any, 'admin')).toBe(false);
    });
  });
});