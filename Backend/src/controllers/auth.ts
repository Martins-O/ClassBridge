import { Request, Response } from 'express';
import connectDB from '@/lib/mongodb';
import {
  ValidationResult,
  validateString,
  validateEmail,
  sanitizeString,
  sanitizeEmail,
  validateEnum,
} from '@/lib/validation';
import {
  getSessionCookieName,
  getUserIdFromRequest,
} from '@/lib/session';
import { serializeUser } from '@/lib/serializeUser';
import { authService } from '@/services';

export async function login(req: Request, res: Response) {
  try {
    await connectDB();

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await authService.login(email, password);
    if (!result) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.cookie(getSessionCookieName(), result.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      user: result.user,
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

    const user = await authService.getUserWithRelations(userId);
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

    try {
      const user = await authService.register({ name, email, password: userData.password });

      return res.status(201).json({
        success: true,
        user,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        return res.status(409).json({ error: error.message });
      }
      throw error;
    }
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
    await authService.requestPasswordReset(email);

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

    const isValid = await authService.verifyPasswordResetToken(token);

    if (!isValid) {
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

    const success = await authService.resetPassword(token, password);

    if (!success) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: 'Failed to reset password' });
  }
}
