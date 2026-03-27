import mongoose from 'mongoose';
import School, { ISchool, SchoolStatus } from '../../src/models/School';

describe('School Model', () => {
  describe('Schema Validation', () => {
    it('should require name field', () => {
      const school = new School({ email: 'test@school.com', adminId: new mongoose.Types.ObjectId() });
      const error = school.validateSync();
      expect(error?.errors.name).toBeDefined();
    });

    it('should require email field', () => {
      const school = new School({ name: 'Test School', adminId: new mongoose.Types.ObjectId() });
      const error = school.validateSync();
      expect(error?.errors.email).toBeDefined();
    });

    it('should require adminId field', () => {
      const school = new School({ name: 'Test School', email: 'test@school.com' });
      const error = school.validateSync();
      expect(error?.errors.adminId).toBeDefined();
    });

    it('should accept valid email format', () => {
      const school = new School({
        name: 'Test School',
        email: 'admin@school.com',
        adminId: new mongoose.Types.ObjectId()
      });
      const error = school.validateSync();
      expect(error?.errors.email).toBeUndefined();
    });

    it('should reject invalid email format', () => {
      const school = new School({
        name: 'Test School',
        email: 'invalid-email',
        adminId: new mongoose.Types.ObjectId()
      });
      const error = school.validateSync();
      expect(error?.errors.email).toBeDefined();
    });

    it('should set default status to pending', () => {
      const school = new School({
        name: 'Test School',
        email: 'test@school.com',
        adminId: new mongoose.Types.ObjectId()
      });
      expect(school.status).toBe('pending');
    });

    it('should set default isActive to false', () => {
      const school = new School({
        name: 'Test School',
        email: 'test@school.com',
        adminId: new mongoose.Types.ObjectId()
      });
      expect(school.isActive).toBe(false);
    });

    it('should set default subscriptionType to basic', () => {
      const school = new School({
        name: 'Test School',
        email: 'test@school.com',
        adminId: new mongoose.Types.ObjectId()
      });
      expect(school.subscriptionType).toBe('basic');
    });

    it('should store email in lowercase', () => {
      const school = new School({
        name: 'Test School',
        email: 'ADMIN@SCHOOL.COM',
        adminId: new mongoose.Types.ObjectId()
      });
      expect(school.email).toBe('admin@school.com');
    });

    it('should accept valid subscription types', () => {
      const subscriptions = ['basic', 'premium', 'enterprise'] as const;
      subscriptions.forEach(sub => {
        const school = new School({
          name: 'Test School',
          email: `test-${sub}@school.com`,
          adminId: new mongoose.Types.ObjectId(),
          subscriptionType: sub
        });
        const error = school.validateSync();
        expect(error?.errors.subscriptionType).toBeUndefined();
      });
    });

    it('should accept valid statuses', () => {
      const statuses: SchoolStatus[] = ['pending', 'approved', 'rejected'];
      statuses.forEach(status => {
        const school = new School({
          name: 'Test School',
          email: `test-${status}@school.com`,
          adminId: new mongoose.Types.ObjectId(),
          status
        });
        const error = school.validateSync();
        expect(error?.errors.status).toBeUndefined();
      });
    });
  });

  describe('Indexes', () => {
    it('should have unique index on email', () => {
      const emailIndex = SchoolSchema.indexes().find(idx => 
        Array.isArray(idx[0]) && idx[0].includes('email') && idx[1]?.unique
      );
      expect(emailIndex).toBeDefined();
    });
  });

  describe('Timestamps', () => {
    it('should have createdAt field', () => {
      const school = new School({
        name: 'Test School',
        email: 'test@school.com',
        adminId: new mongoose.Types.ObjectId()
      });
      expect(school.createdAt).toBeDefined();
    });

    it('should have updatedAt field', () => {
      const school = new School({
        name: 'Test School',
        email: 'test@school.com',
        adminId: new mongoose.Types.ObjectId()
      });
      expect(school.updatedAt).toBeDefined();
    });
  });
});