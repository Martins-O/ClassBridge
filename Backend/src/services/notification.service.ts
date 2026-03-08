import { notificationRepository } from '@/repositories';

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
    type?: 'info' | 'success' | 'warning' | 'error';
  }): Promise<any> {
    return notificationRepository.create({
      ...data,
      type: data.type || 'info',
      isRead: false,
    });
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
