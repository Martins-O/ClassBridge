import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import PasswordResetToken from '@/models/PasswordResetToken';
import {
  ValidationResult,
  validateString,
  validateEmail,
  sanitizeString,
  sanitizeEmail,
  validateEnum,
} from '@/lib/validation';
import {
  encodeSessionToken,
  getSessionCookieName,
  getUserIdFromRequest,
} from '@/lib/session';
import { sendEmail, generatePasswordResetEmail } from '@/lib/email';
import { serializeUser } from '@/lib/serializeUser';

const RESET_TOKEN_TTL_MINUTES = 60;

export async function login(req: Request, res: Response) {
  try {
    await connectDB();

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const sessionToken = encodeSessionToken(user._id.toString());

    res.cookie(getSessionCookieName(), sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Failed to login' });
  }
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie(getSessionCookieName());
  return res.json({
    success: true,
    message: 'Logged out successfully',
  });
}

export async function me(req: Request, res: Response) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await User.findById(userId)
      .select('-password')
      .populate('schoolId', 'name email phone address website description subscriptionType')
      .populate('classIds', 'name academicYear cohort duration isActive');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user: serializeUser(user) });
  } catch (error) {
    console.error('Me error:', error);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
}

export async function register(req: Request, res: Response) {
  try {
    await connectDB();

    const userData = req.body;
    const validation = new ValidationResult();

    validation.errors.push(
      ...validateString(userData.name, 'name', { required: true, minLength: 2, maxLength: 100 }),
      ...validateEmail(userData.email, 'email'),
      ...validateString(userData.password, 'password', { required: true, minLength: 6, maxLength: 128 }),
    );

    if (userData.role) {
      validation.errors.push(...validateEnum(userData.role, 'role', ['student', 'mentor', 'school_admin']));
    }

    if (!validation.isValid()) {
      return res.status(400).json(validation.getResponse());
    }

    const name = sanitizeString(userData.name);
    const email = sanitizeEmail(userData.email);
    const password = userData.password;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'school_admin',
    });

    await user.save();

    return res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Failed to register user' });
  }
}

export async function requestPasswordReset(req: Request, res: Response) {
  try {
    const payload = req.body || {};
    const validation = new ValidationResult();
    validation.errors.push(...validateEmail(payload.email, 'email'));

    if (!validation.isValid()) {
      return res.status(400).json(validation.getResponse());
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

    return res.json({
      success: true,
      message: 'If an account matches the email, a reset link has been sent.',
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    return res.status(500).json({ error: 'Failed to process password reset request' });
  }
}

export async function verifyPasswordResetToken(req: Request, res: Response) {
  try {
    await connectDB();
    const { token } = req.params;

    const resetRecord = await PasswordResetToken.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    }).select('_id');

    if (!resetRecord) {
      return res.status(404).json({ valid: false });
    }

    return res.json({ valid: true });
  } catch (error) {
    console.error('Verify reset token error:', error);
    return res.status(500).json({ error: 'Failed to verify reset token' });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { token } = req.params;
    const { password } = req.body || {};

    const validation = new ValidationResult();
    validation.errors.push(...validateString(password, 'password', { required: true, minLength: 6, maxLength: 128 }));

    if (!validation.isValid()) {
      return res.status(400).json(validation.getResponse());
    }

    await connectDB();

    const resetRecord = await PasswordResetToken.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!resetRecord) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const user = await User.findById(resetRecord.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.password = await bcrypt.hash(password, 12);
    await user.save();

    resetRecord.used = true;
    await resetRecord.save();
    await PasswordResetToken.updateMany(
      { userId: resetRecord.userId, used: false },
      { $set: { used: true } },
    );

    return res.json({ success: true });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: 'Failed to reset password' });
  }
}
