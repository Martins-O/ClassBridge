import { NotificationService } from '../../src/services/notification.service';

jest.mock('../../src/repositories', () => ({
  __esModule: true,
  notificationRepository: {
    findByUser: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    deleteById: jest.fn(),
    countUnread: jest.fn(),
  },
}));

jest.mock('../../src/lib/socket', () => ({
  emitNotification: jest.fn(),
}));

const { notificationRepository } = require('../../src/repositories');
const { emitNotification } = require('../../src/lib/socket');

describe('NotificationService', () => {
  let notificationService: NotificationService;

  beforeEach(() => {
    notificationService = new NotificationService();
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return notifications for user', async () => {
      (notificationRepository.findByUser as jest.Mock).mockResolvedValue([{ _id: 'notif-1' }]);

      const result = await notificationService.getAll('user-1');

      expect(result).toHaveLength(1);
      expect(notificationRepository.findByUser).toHaveBeenCalledWith('user-1');
    });

    it('should return empty array if no notifications', async () => {
      (notificationRepository.findByUser as jest.Mock).mockResolvedValue([]);

      const result = await notificationService.getAll('user-1');

      expect(result).toHaveLength(0);
    });
  });

  describe('getById', () => {
    it('should return notification by id', async () => {
      (notificationRepository.findById as jest.Mock).mockResolvedValue({ _id: 'notif-1' });

      const result = await notificationService.getById('notif-1');

      expect(result).toBeDefined();
    });

    it('should return null if not found', async () => {
      (notificationRepository.findById as jest.Mock).mockResolvedValue(null);

      const result = await notificationService.getById('notif-1');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create notification and emit socket event', async () => {
      (notificationRepository.create as jest.Mock).mockResolvedValue({
        _id: 'notif-1',
        title: 'Test',
        message: 'Test message',
        type: 'info',
      });

      const result = await notificationService.create({
        userId: 'user-1',
        title: 'Test',
        message: 'Test message',
      });

      expect(result).toBeDefined();
      expect(notificationRepository.create).toHaveBeenCalled();
      expect(emitNotification).toHaveBeenCalled();
    });

    it('should use default type when not provided', async () => {
      (notificationRepository.create as jest.Mock).mockResolvedValue({
        _id: 'notif-1',
        type: 'info',
      });

      await notificationService.create({
        userId: 'user-1',
        title: 'Test',
        message: 'Test message',
      });

      expect(notificationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'info' })
      );
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      (notificationRepository.markAsRead as jest.Mock).mockResolvedValue({});

      const result = await notificationService.markAsRead('notif-1');

      expect(notificationRepository.markAsRead).toHaveBeenCalledWith('notif-1');
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read for user', async () => {
      (notificationRepository.markAllAsRead as jest.Mock).mockResolvedValue({});

      const result = await notificationService.markAllAsRead('user-1');

      expect(notificationRepository.markAllAsRead).toHaveBeenCalledWith('user-1');
    });
  });

  describe('delete', () => {
    it('should delete notification', async () => {
      (notificationRepository.deleteById as jest.Mock).mockResolvedValue(true);

      const result = await notificationService.delete('notif-1');

      expect(result).toBe(true);
    });

    it('should return false if not found', async () => {
      (notificationRepository.deleteById as jest.Mock).mockResolvedValue(false);

      const result = await notificationService.delete('notif-1');

      expect(result).toBe(false);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      (notificationRepository.countUnread as jest.Mock).mockResolvedValue(5);

      const result = await notificationService.getUnreadCount('user-1');

      expect(result).toBe(5);
    });

    it('should return 0 if no unread notifications', async () => {
      (notificationRepository.countUnread as jest.Mock).mockResolvedValue(0);

      const result = await notificationService.getUnreadCount('user-1');

      expect(result).toBe(0);
    });
  });
});