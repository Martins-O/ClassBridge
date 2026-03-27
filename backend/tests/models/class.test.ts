import mongoose from 'mongoose';
import Class from '../../src/models/Class';

describe('Class Model', () => {
  describe('Schema Validation', () => {
    it('should require name field', () => {
      const cls = new Class({ schoolId: new mongoose.Types.ObjectId() });
      const error = cls.validateSync();
      expect(error?.errors.name).toBeDefined();
    });

    it('should require schoolId field', () => {
      const cls = new Class({ name: 'Math 101' });
      const error = cls.validateSync();
      expect(error?.errors.schoolId).toBeDefined();
    });

    it('should create class with all fields', () => {
      const cls = new Class({
        name: 'Math 101',
        description: 'Introduction to Mathematics',
        schoolId: new mongoose.Types.ObjectId(),
        academicYear: '2024',
        duration: '1 semester',
        cohort: 'Spring 2024'
      });
      const error = cls.validateSync();
      expect(error).toBeUndefined();
    });

    it('should set default isActive to true', () => {
      const cls = new Class({
        name: 'Math 101',
        schoolId: new mongoose.Types.ObjectId()
      });
      expect(cls.isActive).toBe(true);
    });

    it('should have empty arrays for mentorIds and studentIds by default', () => {
      const cls = new Class({
        name: 'Math 101',
        schoolId: new mongoose.Types.ObjectId()
      });
      expect(cls.mentorIds).toEqual([]);
      expect(cls.studentIds).toEqual([]);
    });

    it('should accept valid academic year format', () => {
      const cls = new Class({
        name: 'Math 101',
        schoolId: new mongoose.Types.ObjectId(),
        academicYear: '2024'
      });
      const error = cls.validateSync();
      expect(error?.errors.academicYear).toBeUndefined();
    });

    it('should accept valid duration', () => {
      const cls = new Class({
        name: 'Math 101',
        schoolId: new mongoose.Types.ObjectId(),
        duration: '3 months'
      });
      const error = cls.validateSync();
      expect(error?.errors.duration).toBeUndefined();
    });
  });

  describe('Virtual Properties', () => {
    it('should have mentorCount virtual', () => {
      const cls = new Class({
        name: 'Math 101',
        schoolId: new mongoose.Types.ObjectId()
      });
      expect(cls.mentorCount).toBe(0);
    });

    it('should have studentCount virtual', () => {
      const cls = new Class({
        name: 'Math 101',
        schoolId: new mongoose.Types.ObjectId()
      });
      expect(cls.studentCount).toBe(0);
    });
  });

  describe('Methods', () => {
    it('should have addMentor method', () => {
      const cls = new Class({
        name: 'Math 101',
        schoolId: new mongoose.Types.ObjectId()
      });
      expect(typeof cls.addMentor).toBe('function');
    });

    it('should have removeMentor method', () => {
      const cls = new Class({
        name: 'Math 101',
        schoolId: new mongoose.Types.ObjectId()
      });
      expect(typeof cls.removeMentor).toBe('function');
    });

    it('should have addStudent method', () => {
      const cls = new Class({
        name: 'Math 101',
        schoolId: new mongoose.Types.ObjectId()
      });
      expect(typeof cls.addStudent).toBe('function');
    });

    it('should have removeStudent method', () => {
      const cls = new Class({
        name: 'Math 101',
        schoolId: new mongoose.Types.ObjectId()
      });
      expect(typeof cls.removeStudent).toBe('function');
    });
  });

  describe('Timestamps', () => {
    it('should have createdAt field', () => {
      const cls = new Class({
        name: 'Math 101',
        schoolId: new mongoose.Types.ObjectId()
      });
      expect(cls.createdAt).toBeDefined();
    });

    it('should have updatedAt field', () => {
      const cls = new Class({
        name: 'Math 101',
        schoolId: new mongoose.Types.ObjectId()
      });
      expect(cls.updatedAt).toBeDefined();
    });
  });
});