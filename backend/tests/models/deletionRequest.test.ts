import mongoose from 'mongoose';
import DeletionRequest from '../../src/models/DeletionRequest';

describe('DeletionRequest Model', () => {
  const validData = {
    userId: new mongoose.Types.ObjectId(),
    requestedBy: new mongoose.Types.ObjectId(),
    schoolId: new mongoose.Types.ObjectId(),
    reason: 'User left school'
  };

  describe('Schema Validation', () => {
    it('should require userId field', () => {
      const req = new DeletionRequest({ requestedBy: new mongoose.Types.ObjectId(), schoolId: new mongoose.Types.ObjectId() });
      const error = req.validateSync();
      expect(error?.errors.userId).toBeDefined();
    });

    it('should require requestedBy field', () => {
      const req = new DeletionRequest({ userId: new mongoose.Types.ObjectId(), schoolId: new mongoose.Types.ObjectId() });
      const error = req.validateSync();
      expect(error?.errors.requestedBy).toBeDefined();
    });

    it('should create with valid fields', () => {
      const req = new DeletionRequest(validData);
      const error = req.validateSync();
      expect(error).toBeUndefined();
    });

    it('should set default status to pending', () => {
      const req = new DeletionRequest(validData);
      expect(req.status).toBe('pending');
    });
  });
});