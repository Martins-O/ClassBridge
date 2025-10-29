import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import PasswordResetToken from '@/models/PasswordResetToken';
import { sendEmail, generatePasswordResetEmail } from '@/lib/email';
import {
  ValidationResult,
  validateEmail,
  sanitizeEmail,
} from '@/lib/validation';

const RESET_TOKEN_TTL_MINUTES = 60;

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json().catch(() => ({}));

    const validation = new ValidationResult();
    validation.errors.push(...validateEmail(payload.email, 'email'));

    if (!validation.isValid()) {
      return validation.getResponse();
    }

    await connectDB();

    const email = sanitizeEmail(payload.email);
    const user = await User.findOne({ email });

    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

      await PasswordResetToken.updateMany({ userId: user._id, used: false }, { $set: { used: true } });
      await PasswordResetToken.create({ userId: user._id, token, expiresAt });

      const emailPayload = generatePasswordResetEmail({
        recipientEmail: user.email,
        recipientName: user.name,
        resetToken: token,
      });

      await sendEmail(emailPayload);
    }

    return NextResponse.json({
      success: true,
      message: 'If an account matches the email, a reset link has been sent.',
    });
  } catch {
    return NextResponse.json({ error: 'Failed to process password reset request' }, { status: 500 });
  }
}
