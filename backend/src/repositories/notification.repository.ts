import Notification from '@/models/Notification';

export class NotificationRepository {
  async findById(id: string): Promise<any> {
    return Notification.findById(id).lean();
  }

  async findAll(query: any = {}): Promise<any[]> {
    return Notification.find(query).sort({ createdAt: -1 }).lean();
  }

  async findByUser(userId: string): Promise<any[]> {
    return Notification.find({ userId }).sort({ createdAt: -1 }).lean();
  }

  async create(data: any): Promise<any> {
    const notification = new Notification(data);
    return notification.save();
  }

  async markAsRead(id: string): Promise<any> {
    return Notification.findByIdAndUpdate(id, { isRead: true }, { new: true }).lean();
  }

  async markAllAsRead(userId: string): Promise<any> {
    return Notification.updateMany({ userId, isRead: false }, { isRead: true }).lean();
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await Notification.findByIdAndDelete(id);
    return !!result;
  }

  async countUnread(userId: string): Promise<number> {
    return Notification.countDocuments({ userId, isRead: false });
  }
}

export const notificationRepository = new NotificationRepository();
