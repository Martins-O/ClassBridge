import mongoose from 'mongoose';
import StudentInvitation from '../../src/models/StudentInvitation';

describe('StudentInvitation Model', () => {
  const validData = {
    email: 'student@test.com',
    schoolId: new mongoose.Types.ObjectId(),
    invitedBy: new mongoose.Types.ObjectId()
  };

  describe('Schema Validation', () => {
    it('should require email', () => {
      const inv = new StudentInvitation({ schoolId: new mongoose.Types.ObjectId(), invitedBy: new mongoose.Types.ObjectId() });
      const error = inv.validateSync();
      expect(error?.errors.email).toBeDefined();
    });

    it('should require schoolId', () => {
      const inv = new StudentInvitation({ email: 'student@test.com', invitedBy: new mongoose.Types.ObjectId() });
      const error = inv.validateSync();
      expect(error?.errors.schoolId).toBeDefined();
    });

    it('should create with valid fields', () => {
      const inv = new StudentInvitation(validData);
      const error = inv.validateSync();
      expect(error).toBeUndefined();
    });

    it('should set default status to pending', () => {
      const inv = new StudentInvitation(validData);
      expect(inv.status).toBe('pending');
    });
  });
});