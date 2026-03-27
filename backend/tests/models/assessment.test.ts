import mongoose from 'mongoose';
import Assessment from '../../src/models/Assessment';

describe('Assessment Model', () => {
  const validAssessmentData = {
    title: 'Math Quiz',
    description: 'First math quiz',
    classId: new mongoose.Types.ObjectId(),
    schoolId: new mongoose.Types.ObjectId(),
    mentorId: new mongoose.Types.ObjectId(),
    passingScore: 60,
    maxAttempts: 3
  };

  describe('Schema Validation', () => {
    it('should require title field', () => {
      const assessment = new Assessment({ classId: new mongoose.Types.ObjectId(), schoolId: new mongoose.Types.ObjectId(), mentorId: new mongoose.Types.ObjectId() });
      const error = assessment.validateSync();
      expect(error?.errors.title).toBeDefined();
    });

    it('should require classId field', () => {
      const assessment = new Assessment({ title: 'Quiz 1', schoolId: new mongoose.Types.ObjectId(), mentorId: new mongoose.Types.ObjectId() });
      const error = assessment.validateSync();
      expect(error?.errors.classId).toBeDefined();
    });

    it('should require schoolId field', () => {
      const assessment = new Assessment({ title: 'Quiz 1', classId: new mongoose.Types.ObjectId(), mentorId: new mongoose.Types.ObjectId() });
      const error = assessment.validateSync();
      expect(error?.errors.schoolId).toBeDefined();
    });

    it('should require mentorId field', () => {
      const assessment = new Assessment({ title: 'Quiz 1', classId: new mongoose.Types.ObjectId(), schoolId: new mongoose.Types.ObjectId() });
      const error = assessment.validateSync();
      expect(error?.errors.mentorId).toBeDefined();
    });

    it('should create assessment with valid fields', () => {
      const assessment = new Assessment(validAssessmentData);
      const error = assessment.validateSync();
      expect(error).toBeUndefined();
    });

    it('should set default isActive to true', () => {
      const assessment = new Assessment(validAssessmentData);
      expect(assessment.isActive).toBe(true);
    });

    it('should set default maxAttempts to 1', () => {
      const assessment = new Assessment(validAssessmentData);
      expect(assessment.maxAttempts).toBe(1);
    });
  });

  describe('Timestamps', () => {
    it('should have createdAt field', () => {
      const assessment = new Assessment(validAssessmentData);
      expect(assessment.createdAt).toBeDefined();
    });

    it('should have updatedAt field', () => {
      const assessment = new Assessment(validAssessmentData);
      expect(assessment.updatedAt).toBeDefined();
    });
  });
});