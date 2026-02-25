import { Request, Response } from 'express';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { getUserIdFromRequest } from '@/lib/session';

// GET /api/notifications - Get user notifications
export async function getNotifications(req: Request, res: Response) {
    try {
        await connectDB();

        const userId = getUserIdFromRequest(req);
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .limit(20);

        return res.json({ notifications });
    } catch (error) {
        console.error('Failed to fetch notifications:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

// PATCH /api/notifications - Mark all as read
export async function markAllNotificationsAsRead(req: Request, res: Response) {
    try {
        await connectDB();

        const userId = getUserIdFromRequest(req);
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        await Notification.updateMany({ userId, isRead: false }, { isRead: true });

        return res.json({ message: 'Notifications marked as read' });
    } catch (error) {
        console.error('Failed to mark notifications as read:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

// PATCH /api/notifications/:id - Mark single notification as read
export async function markNotificationAsRead(req: Request, res: Response) {
    try {
        await connectDB();

        const userId = getUserIdFromRequest(req);
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const { id } = req.params;
        const notification = await Notification.findOne({ _id: id, userId });

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        notification.isRead = true;
        await notification.save();

        return res.json({ notification });
    } catch (error) {
        console.error('Failed to mark notification as read:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
