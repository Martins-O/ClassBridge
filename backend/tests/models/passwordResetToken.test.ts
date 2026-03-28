import mongoose from 'mongoose';
import PasswordResetToken from '../../src/models/PasswordResetToken';

describe('PasswordResetToken Model', () => {
  const validData = {
    userId: new mongoose.Types.ObjectId(),
    token: 'reset-token-123',
    expiresAt: new Date(Date.now() + 3600000)
  };

  describe('Schema Validation', () => {
    it('should require userId', () => {
      const token = new PasswordResetToken({ token: 'token123', expiresAt: new Date() });
      const error = token.validateSync();
      expect(error?.errors.userId).toBeDefined();
    });

    it('should require token', () => {
      const token = new PasswordResetToken({ userId: new mongoose.Types.ObjectId(), expiresAt: new Date() });
      const error = token.validateSync();
      expect(error?.errors.token).toBeDefined();
    });

    it('should create with valid fields', () => {
      const token = new PasswordResetToken(validData);
      const error = token.validateSync();
      expect(error).toBeUndefined();
    });

    it('should set default used to false', () => {
      const token = new PasswordResetToken(validData);
      expect(token.used).toBe(false);
    });
  });
});