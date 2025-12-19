import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StudentInvitation from '@/models/StudentInvitation';
import User from '@/models/User';
import Class from '@/models/Class';
import { sendEmail, generateStudentInvitationEmail } from '@/lib/email';
import crypto from 'crypto';
import { getUserIdFromRequest } from '@/lib/session';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const userId = getUserIdFromRequest(request);
        if (!userId) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const user = await User.findById(userId);
        if (!user || !['school_admin', 'super_admin'].includes(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { students, classId } = await request.json();

        if (!students || !Array.isArray(students) || students.length === 0 || !classId) {
            return NextResponse.json({ error: 'Missing students array or classId' }, { status: 400 });
        }

        const classData = await Class.findById(classId).populate('schoolId');
        if (!classData) {
            return NextResponse.json({ error: 'Class not found' }, { status: 404 });
        }

        const results = {
            success: [] as string[],
            failed: [] as { email: string; error: string }[],
        };

        const school = classData.schoolId as any;

        for (const student of students) {
            const { email, name } = student;

            if (!email || !name) {
                results.failed.push({ email: email || 'unknown', error: 'Missing name or email' });
                continue;
            }

            // Basic validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                results.failed.push({ email, error: 'Invalid email format' });
                continue;
            }

            // Check if user exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                results.failed.push({ email, error: 'User already exists' });
                continue;
            }

            // Create invitation
            const token = crypto.randomUUID();
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);

            const invitation = new StudentInvitation({
                email,
                name,
                schoolId: school._id,
                classId: classId,
                invitedBy: userId,
                token: token,
                expiresAt: expiresAt
            });

            try {
                await invitation.save();

                const emailData = generateStudentInvitationEmail({
                    studentEmail: email,
                    studentName: name,
                    schoolName: school.name,
                    className: classData.name,
                    invitationToken: token,
                    inviterName: user.name
                });

                const emailSent = await sendEmail(emailData);
                if (emailSent) {
                    results.success.push(email);
                } else {
                    await StudentInvitation.findByIdAndDelete(invitation._id);
                    results.failed.push({ email, error: 'Failed to send email' });
                }
            } catch (err) {
                results.failed.push({ email, error: 'Database error' });
            }
        }

        return NextResponse.json({
            message: `Processed ${students.length} invitations`,
            results
        });

    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
