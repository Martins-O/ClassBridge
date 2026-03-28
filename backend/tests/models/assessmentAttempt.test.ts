import mongoose from 'mongoose';
import AssessmentAttempt from '../../src/models/AssessmentAttempt';

describe('AssessmentAttempt Model', () => {
  const validData = {
    assessmentId: new mongoose.Types.ObjectId(),
    studentId: new mongoose.Types.ObjectId(),
    schoolId: new mongoose.Types.ObjectId()
  };

  describe('Schema Validation', () => {
    it('should require assessmentId', () => {
      const attempt = new AssessmentAttempt({ studentId: new mongoose.Types.ObjectId(), schoolId: new mongoose.Types.ObjectId() });
      const error = attempt.validateSync();
      expect(error?.errors.assessmentId).toBeDefined();
    });

    it('should require studentId', () => {
      const attempt = new AssessmentAttempt({ assessmentId: new mongoose.Types.ObjectId(), schoolId: new mongoose.Types.ObjectId() });
      const error = attempt.validateSync();
      expect(error?.errors.studentId).toBeDefined();
    });

    it('should create with valid fields', () => {
      const attempt = new AssessmentAttempt(validData);
      const error = attempt.validateSync();
      expect(error).toBeUndefined();
    });

    it('should set default status to started', () => {
      const attempt = new AssessmentAttempt(validData);
      expect(attempt.status).toBe('started');
    });
  });
});