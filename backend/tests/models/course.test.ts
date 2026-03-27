import mongoose from 'mongoose';
import Course from '../../src/models/Course';

describe('Course Model', () => {
  describe('Schema Validation', () => {
    it('should require name field', () => {
      const course = new Course({ schoolId: new mongoose.Types.ObjectId() });
      const error = course.validateSync();
      expect(error?.errors.name).toBeDefined();
    });

    it('should require schoolId field', () => {
      const course = new Course({ name: 'Mathematics' });
      const error = course.validateSync();
      expect(error?.errors.schoolId).toBeDefined();
    });

    it('should create course with all fields', () => {
      const course = new Course({
        name: 'Mathematics',
        description: 'Introduction to Math',
        schoolId: new mongoose.Types.ObjectId(),
        credits: 3,
        duration: '1 semester'
      });
      const error = course.validateSync();
      expect(error).toBeUndefined();
    });

    it('should set default isActive to true', () => {
      const course = new Course({
        name: 'Mathematics',
        schoolId: new mongoose.Types.ObjectId()
      });
      expect(course.isActive).toBe(true);
    });

    it('should validate credits range', () => {
      const course = new Course({
        name: 'Mathematics',
        schoolId: new mongoose.Types.ObjectId(),
        credits: 0
      });
      const error = course.validateSync();
      expect(error?.errors.credits).toBeDefined();
    });

    it('should accept valid credits', () => {
      const course = new Course({
        name: 'Mathematics',
        schoolId: new mongoose.Types.ObjectId(),
        credits: 4
      });
      const error = course.validateSync();
      expect(error).toBeUndefined();
    });
  });

  describe('Virtual Properties', () => {
    it('should have enrollmentCount virtual', () => {
      const course = new Course({
        name: 'Mathematics',
        schoolId: new mongoose.Types.ObjectId()
      });
      expect(course.enrollmentCount).toBe(0);
    });
  });

  describe('Methods', () => {
    it('should have enrollStudent method', () => {
      const course = new Course({
        name: 'Mathematics',
        schoolId: new mongoose.Types.ObjectId()
      });
      expect(typeof course.enrollStudent).toBe('function');
    });

    it('should have unenrollStudent method', () => {
      const course = new Course({
        name: 'Mathematics',
        schoolId: new mongoose.Types.ObjectId()
      });
      expect(typeof course.unenrollStudent).toBe('function');
    });
  });

  describe('Timestamps', () => {
    it('should have createdAt field', () => {
      const course = new Course({
        name: 'Mathematics',
        schoolId: new mongoose.Types.ObjectId()
      });
      expect(course.createdAt).toBeDefined();
    });

    it('should have updatedAt field', () => {
      const course = new Course({
        name: 'Mathematics',
        schoolId: new mongoose.Types.ObjectId()
      });
      expect(course.updatedAt).toBeDefined();
    });
  });
});