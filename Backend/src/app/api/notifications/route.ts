import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { getUserIdFromRequest } from '@/lib/session';

// GET /api/notifications - Get user notifications
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const userId = getUserIdFromRequest(request);
        if (!userId) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .limit(20);

        return NextResponse.json({ notifications });
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH /api/notifications - Mark all as read
export async function PATCH(request: NextRequest) {
    try {
        await connectDB();

        const userId = getUserIdFromRequest(request);
        if (!userId) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        await Notification.updateMany({ userId, isRead: false }, { isRead: true });

        return NextResponse.json({ message: 'Notifications marked as read' });
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
