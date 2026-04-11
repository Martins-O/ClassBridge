import { Request, Response } from 'express';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { getUserIdFromRequest } from '@/lib/session';
import { getPaginationParams } from '@/lib/pagination';
import { sendSuccess, sendError, sendPaginated } from '@/lib/apiResponse';

export async function getUnreadCount(req: Request, res: Response) {
    try {
        await connectDB();

        const userId = getUserIdFromRequest(req);
        if (!userId) {
            return sendError(res, 'Authentication required', 401, 'AUTH_REQUIRED');
        }

        const count = await Notification.countDocuments({ userId, isRead: false });
        return sendSuccess(res, { count });
    } catch (error) {
        console.error('Failed to get unread count:', error);
        return sendError(res, 'Internal server error', 500);
    }
}

export async function getNotifications(req: Request, res: Response) {
    try {
        await connectDB();

        const userId = getUserIdFromRequest(req);
        if (!userId) {
            return sendError(res, 'Authentication required', 401, 'AUTH_REQUIRED');
        }

        const { page, limit, skip } = getPaginationParams(req, { defaultLimit: 20, maxLimit: 50 });
        
        const [notifications, total, unreadCount] = await Promise.all([
            Notification.find({ userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Notification.countDocuments({ userId }),
            Notification.countDocuments({ userId, isRead: false })
        ]);

        return res.status(200).json({
            success: true,
            notifications,
            unreadCount,
            meta: {
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1
                }
            }
        });
    } catch (error) {
        console.error('Failed to fetch notifications:', error);
        return sendError(res, 'Internal server error', 500);
    }
}

export async function markAllNotificationsAsRead(req: Request, res: Response) {
    try {
        await connectDB();

        const userId = getUserIdFromRequest(req);
        if (!userId) {
            return sendError(res, 'Authentication required', 401, 'AUTH_REQUIRED');
        }

        await Notification.updateMany({ userId, isRead: false }, { isRead: true });

        return sendSuccess(res, { message: 'Notifications marked as read' });
    } catch (error) {
        console.error('Failed to mark notifications as read:', error);
        return sendError(res, 'Internal server error', 500);
    }
}

export async function markNotificationAsRead(req: Request, res: Response) {
    try {
        await connectDB();

        const userId = getUserIdFromRequest(req);
        if (!userId) {
            return sendError(res, 'Authentication required', 401, 'AUTH_REQUIRED');
        }

        const { id } = req.params;
        const notification = await Notification.findOne({ _id: id, userId });

        if (!notification) {
            return sendError(res, 'Notification not found', 404, 'NOT_FOUND');
        }

        notification.isRead = true;
        await notification.save();

        return sendSuccess(res, notification);
    } catch (error) {
        console.error('Failed to mark notification as read:', error);
        return sendError(res, 'Internal server error', 500);
    }
}

export async function deleteNotification(req: Request, res: Response) {
    try {
        await connectDB();

        const userId = getUserIdFromRequest(req);
        if (!userId) {
            return sendError(res, 'Authentication required', 401, 'AUTH_REQUIRED');
        }

        const { id } = req.params;
        const result = await Notification.deleteOne({ _id: id, userId });

        if (result.deletedCount === 0) {
            return sendError(res, 'Notification not found', 404, 'NOT_FOUND');
        }

        return sendSuccess(res, { message: 'Notification deleted' });
    } catch (error) {
        console.error('Failed to delete notification:', error);
        return sendError(res, 'Internal server error', 500);
    }
}
