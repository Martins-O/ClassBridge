import mongoose from 'mongoose';
import Grade from '../../src/models/Grade';

describe('Grade Model', () => {
  const validGradeData = {
    studentId: new mongoose.Types.ObjectId(),
    classId: new mongoose.Types.ObjectId(),
    mentorId: new mongoose.Types.ObjectId(),
    schoolId: new mongoose.Types.ObjectId(),
    gradeType: 'assignment' as const,
    title: 'Test Assignment',
    points: 85,
    maxPoints: 100,
    weight: 0.1
  };

  describe('Schema Validation', () => {
    it('should require studentId field', () => {
      const grade = new Grade({ classId: new mongoose.Types.ObjectId(), mentorId: new mongoose.Types.ObjectId(), schoolId: new mongoose.Types.ObjectId(), gradeType: 'assignment', title: 'Test', points: 100, maxPoints: 100, weight: 0.1 });
      const error = grade.validateSync();
      expect(error?.errors.studentId).toBeDefined();
    });

    it('should require classId field', () => {
      const grade = new Grade({ studentId: new mongoose.Types.ObjectId(), mentorId: new mongoose.Types.ObjectId(), schoolId: new mongoose.Types.ObjectId(), gradeType: 'assignment', title: 'Test', points: 100, maxPoints: 100, weight: 0.1 });
      const error = grade.validateSync();
      expect(error?.errors.classId).toBeDefined();
    });

    it('should require mentorId field', () => {
      const grade = new Grade({ studentId: new mongoose.Types.ObjectId(), classId: new mongoose.Types.ObjectId(), schoolId: new mongoose.Types.ObjectId(), gradeType: 'assignment', title: 'Test', points: 100, maxPoints: 100, weight: 0.1 });
      const error = grade.validateSync();
      expect(error?.errors.mentorId).toBeDefined();
    });

    it('should require schoolId field', () => {
      const grade = new Grade({ studentId: new mongoose.Types.ObjectId(), classId: new mongoose.Types.ObjectId(), mentorId: new mongoose.Types.ObjectId(), gradeType: 'assignment', title: 'Test', points: 100, maxPoints: 100, weight: 0.1 });
      const error = grade.validateSync();
      expect(error?.errors.schoolId).toBeDefined();
    });

    it('should require gradeType field', () => {
      const grade = new Grade({ studentId: new mongoose.Types.ObjectId(), classId: new mongoose.Types.ObjectId(), mentorId: new mongoose.Types.ObjectId(), schoolId: new mongoose.Types.ObjectId(), title: 'Test', points: 100, maxPoints: 100, weight: 0.1 });
      const error = grade.validateSync();
      expect(error?.errors.gradeType).toBeDefined();
    });

    it('should require points field', () => {
      const grade = new Grade({ studentId: new mongoose.Types.ObjectId(), classId: new mongoose.Types.ObjectId(), mentorId: new mongoose.Types.ObjectId(), schoolId: new mongoose.Types.ObjectId(), gradeType: 'assignment', title: 'Test', maxPoints: 100, weight: 0.1 });
      const error = grade.validateSync();
      expect(error?.errors.points).toBeDefined();
    });

    it('should require maxPoints field', () => {
      const grade = new Grade({ studentId: new mongoose.Types.ObjectId(), classId: new mongoose.Types.ObjectId(), mentorId: new mongoose.Types.ObjectId(), schoolId: new mongoose.Types.ObjectId(), gradeType: 'assignment', title: 'Test', points: 100, weight: 0.1 });
      const error = grade.validateSync();
      expect(error?.errors.maxPoints).toBeDefined();
    });

    it('should create grade with all valid fields', () => {
      const grade = new Grade(validGradeData);
      const error = grade.validateSync();
      expect(error).toBeUndefined();
    });

    it('should accept valid grade types', () => {
      const types = ['assignment', 'quiz', 'exam', 'project', 'participation', 'final'];
      types.forEach(type => {
        const grade = new Grade({ ...validGradeData, gradeType: type as any });
        const error = grade.validateSync();
        expect(error?.errors.gradeType).toBeUndefined();
      });
    });

    it('should set default status to draft', () => {
      const grade = new Grade(validGradeData);
      expect(grade.status).toBe('draft');
    });

    it('should set default isExcused to false', () => {
      const grade = new Grade(validGradeData);
      expect(grade.isExcused).toBe(false);
    });

    it('should calculate percentage correctly', () => {
      const grade = new Grade({ ...validGradeData, points: 85, maxPoints: 100 });
      expect(grade.percentage).toBe(85);
    });

    it('should set letter grade based on percentage', () => {
      const grade = new Grade({ ...validGradeData, points: 85, maxPoints: 100 });
      expect(['A', 'B', 'C', 'D', 'F']).toContain(grade.letterGrade);
    });
  });

  describe('Methods', () => {
    it('should have calculateGrade method', () => {
      const grade = new Grade(validGradeData);
      expect(typeof grade.calculateGrade).toBe('function');
    });

    it('should have publish method', () => {
      const grade = new Grade(validGradeData);
      expect(typeof grade.publish).toBe('function');
    });

    it('should have archive method', () => {
      const grade = new Grade(validGradeData);
      expect(typeof grade.archive).toBe('function');
    });
  });

  describe('Timestamps', () => {
    it('should have createdAt field', () => {
      const grade = new Grade(validGradeData);
      expect(grade.createdAt).toBeDefined();
    });

    it('should have updatedAt field', () => {
      const grade = new Grade(validGradeData);
      expect(grade.updatedAt).toBeDefined();
    });
  });
});