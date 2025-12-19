import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { getUserIdFromRequest } from '@/lib/session';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();

        const userId = getUserIdFromRequest(request);
        if (!userId) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const { id } = await params;
        const notification = await Notification.findOne({ _id: id, userId });

        if (!notification) {
            return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
        }

        notification.isRead = true;
        await notification.save();

        return NextResponse.json({ notification });
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
