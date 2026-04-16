import { Request, Response } from 'express';
import connectDB from '@/lib/mongodb';
import {
  ValidationResult,
  validateString,
  validateEmail,
  sanitizeString,
  sanitizeEmail,
  validateEnum,
  validatePasswordStrength,
  PASSWORD_REQUIREMENTS,
} from '@/lib/validation';
import {
  getSessionCookieName,
  getUserIdFromRequest,
  encodeSessionToken,
} from '@/lib/session';
import { verifyAccessToken, decodeToken } from '@/lib/jwt';
import { generateTwoFactorSecret, generateQRCode, verifyTwoFactorCode, generateRecoveryCodes, verifyBackupCode } from '@/lib/twoFactor';
import { serializeUser } from '@/lib/serializeUser';
import { authService } from '@/services';
import { auditService } from '@/services/audit.service';
import { notificationService } from '@/services/notification.service';
import User from '@/models/User';
import RefreshToken from '@/models/RefreshToken';

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

    const isLockedOut = 'errorCode' in result && result.errorCode === 'ACCOUNT_LOCKED';
    if (isLockedOut) {
      return res.status(423).json({ 
        error: (result as any).error,
        errorCode: (result as any).errorCode,
        lockoutUntil: (result as any).lockoutUntil
      });
    }

    const user = (result as any).user;
    const userId = String(user._id || user.id);
    
    await auditService.logLogin(userId, email, req.ip || 'unknown', req.headers['user-agent']);
    
    res.cookie(getSessionCookieName(), encodeSessionToken(userId), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });

    return res.json({
      success: true,
      user,
      accessToken: (result as any).accessToken,
      refreshToken: (result as any).refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Failed to login' });
  }
}

export async function refreshToken(req: Request, res: Response) {
  try {
    await connectDB();

    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const result = await authService.refreshTokens(refreshToken);
    if (!result) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    if ('error' in result) {
      return res.status(401).json({ 
        error: result.error,
        errorCode: result.errorCode 
      });
    }

    const successResult = result as { accessToken: string; refreshToken: string };
    return res.json({
      accessToken: successResult.accessToken,
      refreshToken: successResult.refreshToken,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(500).json({ error: 'Failed to refresh token' });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
    const userId = req.headers['x-user-id'] as string;
    const userEmail = req.headers['x-user-email'] as string;
    
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    
    if (userId && userEmail) {
      await auditService.logLogout(userId, userEmail, req.ip || 'unknown', req.headers['user-agent']);
    }
    
    return res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.json({
      success: true,
      message: 'Logged out successfully',
    });
  }
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
      ...validateString(userData.password, 'password', { required: true, minLength: 8, maxLength: 128 }),
      ...validatePasswordStrength(userData.password),
    );

    if (userData.role) {
      validation.errors.push(...validateEnum(userData.role, 'role', ['student', 'mentor', 'school_admin']));
    }

    if (!validation.isValid()) {
      return res.status(400).json({ 
        ...validation.getResponse(),
        passwordRequirements: PASSWORD_REQUIREMENTS
      });
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
    validation.errors.push(
      ...validateString(password, 'password', { required: true, minLength: 8, maxLength: 128 }),
      ...validatePasswordStrength(password)
    );

    if (!validation.isValid()) {
      return res.status(400).json({ 
        ...validation.getResponse(),
        passwordRequirements: PASSWORD_REQUIREMENTS
      });
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

export async function setupTwoFactor(req: Request, res: Response) {
  try {
    await connectDB();

    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.twoFactorEnabled) {
      return res.status(400).json({ error: 'Two-factor authentication is already enabled' });
    }

    const twoFactorSetup = generateTwoFactorSecret(user.email);
    const qrCode = await generateQRCode(twoFactorSetup.otpauthUrl);

    await User.findByIdAndUpdate(user._id, {
      twoFactorSecret: twoFactorSetup.secret
    });

    return res.json({
      secret: twoFactorSetup.secret,
      qrCode,
      message: 'Two-factor authentication setup initiated'
    });
  } catch (error) {
    console.error('Setup 2FA error:', error);
    return res.status(500).json({ error: 'Failed to setup two-factor authentication' });
  }
}

export async function verifyTwoFactor(req: Request, res: Response) {
  try {
    await connectDB();

    const { userId, token } = req.body;

    if (!userId || !token) {
      return res.status(400).json({ error: 'User ID and token are required' });
    }

    const user = await User.findById(userId).select('+twoFactorSecret');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.twoFactorSecret) {
      return res.status(400).json({ error: 'Two-factor authentication not set up' });
    }

    const verification = verifyTwoFactorCode(user.twoFactorSecret, token);
    
    if (!verification.valid) {
      return res.status(401).json({ valid: false, error: 'Invalid verification code' });
    }

    const backupCodes = generateRecoveryCodes();
    const hashedCodes = backupCodes.map(bc => bc.hashedCode);

    await User.findByIdAndUpdate(user._id, {
      twoFactorEnabled: true,
      backupCodes: hashedCodes
    });

    return res.json({
      valid: true,
      backupCodes: backupCodes.map(bc => bc.code),
      message: 'Two-factor authentication enabled successfully'
    });
  } catch (error) {
    console.error('Verify 2FA error:', error);
    return res.status(500).json({ error: 'Failed to verify two-factor authentication' });
  }
}

export async function disableTwoFactor(req: Request, res: Response) {
  try {
    await connectDB();

    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { password, token: twoFactorToken } = req.body;

    const user = await User.findById(payload.userId).select('+twoFactorSecret');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ error: 'Two-factor authentication is not enabled' });
    }

    const bcrypt = await import('bcryptjs');
    const isPasswordValid = await bcrypt.default.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    if (twoFactorToken) {
      const verification = verifyTwoFactorCode(user.twoFactorSecret!, twoFactorToken);
      if (!verification.valid) {
        return res.status(401).json({ error: 'Invalid 2FA code' });
      }
    }

    await User.findByIdAndUpdate(user._id, {
      twoFactorEnabled: false,
      twoFactorSecret: undefined,
      backupCodes: undefined
    });

    return res.json({ success: true, message: 'Two-factor authentication disabled' });
  } catch (error) {
    console.error('Disable 2FA error:', error);
    return res.status(500).json({ error: 'Failed to disable two-factor authentication' });
  }
}

export async function changePassword(req: Request, res: Response) {
  try {
    await connectDB();

    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { currentPassword, newPassword } = req.body;

    const payload = verifyAccessToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await User.findById(payload.userId).select('+twoFactorSecret +twoFactorEnabled');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.twoFactorEnabled && !currentPassword) {
      return res.status(400).json({ error: 'Current password is required when 2FA is enabled' });
    }

    if (user.twoFactorEnabled && currentPassword) {
      const bcrypt = await import('bcryptjs');
      const isPasswordValid = await bcrypt.default.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
    }

    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.default.hash(newPassword, 12);

    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      passwordChangedAt: new Date(),
      passwordExpired: false,
      remindersSent: 0,
      requirePasswordChange: false,
    });

    await RefreshToken.deleteMany({ userId: user._id });

    return res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ error: 'Failed to change password' });
  }
}
