import mongoose from 'mongoose';
import AuditLog from '../../src/models/AuditLog';

describe('AuditLog Model', () => {
  const validAuditLogData = {
    userId: new mongoose.Types.ObjectId(),
    action: 'user.login',
    schoolId: new mongoose.Types.ObjectId(),
    details: { ip: '127.0.0.1' }
  };

  describe('Schema Validation', () => {
    it('should require userId field', () => {
      const auditLog = new AuditLog({ action: 'user.login' });
      const error = auditLog.validateSync();
      expect(error?.errors.userId).toBeDefined();
    });

    it('should require action field', () => {
      const auditLog = new AuditLog({ userId: new mongoose.Types.ObjectId() });
      const error = auditLog.validateSync();
      expect(error?.errors.action).toBeDefined();
    });

    it('should create audit log with valid fields', () => {
      const auditLog = new AuditLog(validAuditLogData);
      const error = auditLog.validateSync();
      expect(error).toBeUndefined();
    });

    it('should set default timestamp', () => {
      const auditLog = new AuditLog(validAuditLogData);
      expect(auditLog.timestamp).toBeDefined();
    });
  });

  describe('Timestamps', () => {
    it('should have createdAt field', () => {
      const auditLog = new AuditLog(validAuditLogData);
      expect(auditLog.createdAt).toBeDefined();
    });
  });
});