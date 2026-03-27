import mongoose from 'mongoose';
import Notification from '../../src/models/Notification';

describe('Notification Model', () => {
  const validNotificationData = {
    userId: new mongoose.Types.ObjectId(),
    title: 'Test Notification',
    message: 'This is a test notification'
  };

  describe('Schema Validation', () => {
    it('should require userId field', () => {
      const notification = new Notification({ title: 'Test', message: 'Test message' });
      const error = notification.validateSync();
      expect(error?.errors.userId).toBeDefined();
    });

    it('should require title field', () => {
      const notification = new Notification({ userId: new mongoose.Types.ObjectId(), message: 'Test message' });
      const error = notification.validateSync();
      expect(error?.errors.title).toBeDefined();
    });

    it('should require message field', () => {
      const notification = new Notification({ userId: new mongoose.Types.ObjectId(), title: 'Test' });
      const error = notification.validateSync();
      expect(error?.errors.message).toBeDefined();
    });

    it('should create notification with valid fields', () => {
      const notification = new Notification(validNotificationData);
      const error = notification.validateSync();
      expect(error).toBeUndefined();
    });

    it('should set default isRead to false', () => {
      const notification = new Notification(validNotificationData);
      expect(notification.isRead).toBe(false);
    });

    it('should accept valid notification types', () => {
      const types = ['info', 'success', 'warning', 'error', 'assignment', 'grade', 'invitation'];
      types.forEach(type => {
        const notification = new Notification({ ...validNotificationData, type: type as any });
        const error = notification.validateSync();
        expect(error?.errors.type).toBeUndefined();
      });
    });
  });

  describe('Timestamps', () => {
    it('should have createdAt field', () => {
      const notification = new Notification(validNotificationData);
      expect(notification.createdAt).toBeDefined();
    });

    it('should have updatedAt field', () => {
      const notification = new Notification(validNotificationData);
      expect(notification.updatedAt).toBeDefined();
    });
  });
});