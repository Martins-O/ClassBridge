import { notificationRepository } from '@/repositories';
import { emitNotification } from '@/lib/socket';

export class NotificationService {
  async getAll(userId: string): Promise<any[]> {
    return notificationRepository.findByUser(userId);
  }

  async getById(id: string): Promise<any> {
    return notificationRepository.findById(id);
  }

  async create(data: {
    userId: string;
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error' | 'assignment' | 'grade' | 'invitation';
    link?: string;
  }): Promise<any> {
    const notification = await notificationRepository.create({
      ...data,
      type: data.type || 'info',
      isRead: false,
    });

    emitNotification(data.userId, {
      id: notification._id?.toString() || '',
      title: notification.title,
      message: notification.message,
      type: notification.type,
      link: notification.link,
      createdAt: notification.createdAt
    });

    return notification;
  }

  async markAsRead(id: string): Promise<any> {
    return notificationRepository.markAsRead(id);
  }

  async markAllAsRead(userId: string): Promise<any> {
    return notificationRepository.markAllAsRead(userId);
  }

  async delete(id: string): Promise<boolean> {
    return notificationRepository.deleteById(id);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return notificationRepository.countUnread(userId);
  }
}

export const notificationService = new NotificationService();
