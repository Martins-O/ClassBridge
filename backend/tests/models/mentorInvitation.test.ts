import mongoose from 'mongoose';
import MentorInvitation from '../../src/models/MentorInvitation';

describe('MentorInvitation Model', () => {
  const validData = {
    email: 'mentor@test.com',
    schoolId: new mongoose.Types.ObjectId(),
    invitedBy: new mongoose.Types.ObjectId()
  };

  describe('Schema Validation', () => {
    it('should require email', () => {
      const inv = new MentorInvitation({ schoolId: new mongoose.Types.ObjectId(), invitedBy: new mongoose.Types.ObjectId() });
      const error = inv.validateSync();
      expect(error?.errors.email).toBeDefined();
    });

    it('should require schoolId', () => {
      const inv = new MentorInvitation({ email: 'mentor@test.com', invitedBy: new mongoose.Types.ObjectId() });
      const error = inv.validateSync();
      expect(error?.errors.schoolId).toBeDefined();
    });

    it('should create with valid fields', () => {
      const inv = new MentorInvitation(validData);
      const error = inv.validateSync();
      expect(error).toBeUndefined();
    });

    it('should set default status to pending', () => {
      const inv = new MentorInvitation(validData);
      expect(inv.status).toBe('pending');
    });
  });
});