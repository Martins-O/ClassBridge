import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getUserIdFromRequest } from '@/lib/session';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const userId = getUserIdFromRequest(request);
        if (!userId) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Role Check: Only Admins and Mentors can list users
        if (!['school_admin', 'super_admin', 'mentor'].includes(currentUser.role)) {
            return NextResponse.json(
                { error: 'Unauthorized access' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const roleParam = searchParams.get('role');
        const schoolId = currentUser.role === 'super_admin'
            ? searchParams.get('schoolId')
            : currentUser.schoolId;

        if (!schoolId && currentUser.role !== 'super_admin') {
            return NextResponse.json(
                { error: 'School context required' },
                { status: 400 }
            );
        }

        const query: Record<string, any> = {
            isActive: true
        };

        if (schoolId) {
            query.schoolId = schoolId;
        }

        if (roleParam) {
            query.role = roleParam;
        }

        const users = await User.find(query)
            .select('-password')
            .sort({ name: 1 })
            .limit(100); // Simple pagination cap

        return NextResponse.json({ users });
    } catch {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
