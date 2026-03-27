import mongoose from 'mongoose';
import User, { IUser, UserRole } from '../../src/models/User';

describe('User Model', () => {
  describe('Schema Validation', () => {
    it('should require email field', () => {
      const user = new User({ password: 'password123', name: 'Test User', role: 'student' });
      const error = user.validateSync();
      expect(error?.errors.email).toBeDefined();
    });

    it('should require password field', () => {
      const user = new User({ email: 'test@test.com', name: 'Test User', role: 'student' });
      const error = user.validateSync();
      expect(error?.errors.password).toBeDefined();
    });

    it('should require name field', () => {
      const user = new User({ email: 'test@test.com', password: 'password123', role: 'student' });
      const error = user.validateSync();
      expect(error?.errors.name).toBeDefined();
    });

    it('should require role field', () => {
      const user = new User({ email: 'test@test.com', password: 'password123', name: 'Test User' });
      const error = user.validateSync();
      expect(error?.errors.role).toBeDefined();
    });

    it('should accept valid email format', () => {
      const user = new User({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'student'
      });
      const error = user.validateSync();
      expect(error?.errors.email).toBeUndefined();
    });

    it('should reject invalid email format', () => {
      const user = new User({
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User',
        role: 'student'
      });
      const error = user.validateSync();
      expect(error?.errors.email).toBeDefined();
    });

    it('should validate password minimum length', () => {
      const user = new User({
        email: 'test@test.com',
        password: 'short',
        name: 'Test User',
        role: 'student'
      });
      const error = user.validateSync();
      expect(error?.errors.password).toBeDefined();
    });

    it('should accept valid roles', () => {
      const validRoles: UserRole[] = ['system_admin', 'school_admin', 'mentor', 'student', 'admissions', 'counselor', 'office_staff'];
      validRoles.forEach(role => {
        const user = new User({
          email: `test-${role}@test.com`,
          password: 'password123',
          name: 'Test User',
          role
        });
        const error = user.validateSync();
        expect(error?.errors.role).toBeUndefined();
      });
    });

    it('should set default values', () => {
      const user = new User({
        email: 'test@test.com',
        password: 'password123',
        name: 'Test User',
        role: 'student'
      });
      
      expect(user.isActive).toBe(false);
      expect(user.isApproved).toBe(false);
      expect(user.twoFactorEnabled).toBe(false);
      expect(user.failedLoginAttempts).toBe(0);
      expect(user.deletionRequested).toBe(false);
      expect(user.classIds).toEqual([]);
    });

    it('should store email in lowercase', () => {
      const user = new User({
        email: 'TEST@TEST.COM',
        password: 'password123',
        name: 'Test User',
        role: 'student'
      });
      expect(user.email).toBe('test@test.com');
    });

    it('should trim email whitespace', () => {
      const user = new User({
        email: '  test@test.com  ',
        password: 'password123',
        name: 'Test User',
        role: 'student'
      });
      expect(user.email).toBe('test@test.com');
    });
  });

  describe('Virtuals', () => {
    it('should have isStudent virtual', () => {
      const user = new User({
        email: 'test@test.com',
        password: 'password123',
        name: 'Test User',
        role: 'student'
      });
      expect(user.isStudent).toBe(true);
    });

    it('should have isMentor virtual', () => {
      const user = new User({
        email: 'test@test.com',
        password: 'password123',
        name: 'Test User',
        role: 'mentor'
      });
      expect(user.isMentor).toBe(true);
    });

    it('should have isSchoolAdmin virtual', () => {
      const user = new User({
        email: 'test@test.com',
        password: 'password123',
        name: 'Test User',
        role: 'school_admin'
      });
      expect(user.isSchoolAdmin).toBe(true);
    });

    it('should have isSystemAdmin virtual', () => {
      const user = new User({
        email: 'test@test.com',
        password: 'password123',
        name: 'Test User',
        role: 'system_admin'
      });
      expect(user.isSystemAdmin).toBe(true);
    });
  });

  describe('Methods', () => {
    it('should have comparePassword method', async () => {
      const user = new User({
        email: 'test@test.com',
        password: 'password123',
        name: 'Test User',
        role: 'student'
      });
      
      expect(typeof user.comparePassword).toBe('function');
    });

    it('should have toPublicJSON method', () => {
      const user = new User({
        email: 'test@test.com',
        password: 'password123',
        name: 'Test User',
        role: 'student'
      });
      
      expect(typeof user.toPublicJSON).toBe('function');
    });
  });
});