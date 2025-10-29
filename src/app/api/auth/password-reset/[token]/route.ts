import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import PasswordResetToken from '@/models/PasswordResetToken';
import {
  ValidationResult,
  validateString,
} from '@/lib/validation';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    await connectDB();

    const { token } = await params;
    const resetRecord = await PasswordResetToken.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    }).select('_id');

    if (!resetRecord) {
      return NextResponse.json({ valid: false }, { status: 404 });
    }

    return NextResponse.json({ valid: true });
  } catch {
    return NextResponse.json({ error: 'Failed to verify reset token' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const body = await request.json().catch(() => ({}));

    const validation = new ValidationResult();
    validation.errors.push(...validateString(body.password, 'password', { required: true, minLength: 6, maxLength: 128 }));

    if (!validation.isValid()) {
      return validation.getResponse();
    }

    await connectDB();

    const { token } = await params;
    const resetRecord = await PasswordResetToken.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!resetRecord) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }

    const user = await User.findById(resetRecord.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(body.password, 12);
    user.password = hashedPassword;
    await user.save();

    resetRecord.used = true;
    await resetRecord.save();
    await PasswordResetToken.updateMany(
      { userId: resetRecord.userId, used: false },
      { $set: { used: true } },
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
