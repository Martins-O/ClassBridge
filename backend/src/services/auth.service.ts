import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { userRepository, schoolRepository } from '@/repositories';
import { encodeSessionToken, getSessionCookieName } from '@/lib/session';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, TokenPayload } from '@/lib/jwt';
import PasswordResetToken from '@/models/PasswordResetToken';
import RefreshToken from '@/models/RefreshToken';
import User from '@/models/User';
import { sendEmail, generatePasswordResetEmail } from '@/lib/email';
import { withTransaction } from '@/lib/mongodb';
import { BaseService } from './base.service';

const RESET_TOKEN_TTL_MINUTES = 60;
const SALT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

export class AuthService extends BaseService {
  async login(email: string, password: string): Promise<{ 
    user: any; 
    accessToken: string; 
    refreshToken: string 
  } | { 
    error: string; 
    errorCode: string;
    lockoutUntil?: Date;
  } | null> {
    const user = await userRepository.findByEmail(email);
    
    if (!user) {
      return null;
    }

    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      return {
        error: `Account is locked. Try again after ${Math.ceil((user.lockoutUntil.getTime() - Date.now()) / 60000)} minutes.`,
        errorCode: 'ACCOUNT_LOCKED',
        lockoutUntil: user.lockoutUntil
      };
    }

    if (user.deletionRequested) {
      return {
        error: 'Your account has a pending deletion request.',
        errorCode: 'ACCOUNT_PENDING_DELETION'
      };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const failedAttempts = (user.failedLoginAttempts || 0) + 1;
      const shouldLockout = failedAttempts >= MAX_FAILED_ATTEMPTS;
      const lockoutUntil = shouldLockout 
        ? new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000)
        : undefined;

      await User.findByIdAndUpdate(user._id, {
        failedLoginAttempts: failedAttempts,
        lastFailedLogin: new Date(),
        ...(shouldLockout && { lockoutUntil })
      });

      if (shouldLockout) {
        return {
          error: `Too many failed attempts. Account locked for ${LOCKOUT_DURATION_MINUTES} minutes.`,
          errorCode: 'ACCOUNT_LOCKED',
          lockoutUntil
        };
      }

      return null;
    }

    if (user.failedLoginAttempts > 0 || user.lockoutUntil) {
      await User.findByIdAndUpdate(user._id, {
        failedLoginAttempts: 0,
        lockoutUntil: undefined,
        lastFailedLogin: undefined
      });
    }

    if (user.role === 'school_admin' && user.schoolId) {
      const school = await schoolRepository.findByIdBasic(user.schoolId.toString());
      if (school && school.status === 'pending') {
        return {
          error: 'Your school is pending approval from the system administrator.',
          errorCode: 'SCHOOL_PENDING_APPROVAL'
        };
      }
      if (school && school.status === 'rejected') {
        return {
          error: `Your school registration has been rejected. Reason: ${school.rejectionReason || 'No reason provided'}`,
          errorCode: 'SCHOOL_REJECTED'
        };
      }
    }

    const schoolStatus = user.schoolId 
      ? (await schoolRepository.findByIdBasic(user.schoolId.toString()))?.status
      : undefined;

    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      schoolId: user.schoolId?.toString(),
      schoolApproved: user.isApproved,
      schoolStatus
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshTokenDoc = generateRefreshToken(user._id.toString());
    const tokenFamily = uuidv4();
    
    await RefreshToken.create({
      userId: user._id,
      token: refreshTokenDoc.token,
      tokenFamily,
      expiresAt: refreshTokenDoc.expiresAt,
      isRevoked: false,
      isUsed: false
    });

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, accessToken, refreshToken: refreshTokenDoc.token };
  }

  async refreshTokens(refreshToken: string): Promise<{ 
    accessToken: string; 
    refreshToken: string 
  } | { 
    error: string; 
    errorCode: string 
  } | null> {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      
      const tokenRecord = await RefreshToken.findOne({
        token: refreshToken,
        isRevoked: false,
        expiresAt: { $gt: new Date() }
      });

      if (!tokenRecord) {
        return null;
      }

      if (tokenRecord.isUsed) {
        await RefreshToken.updateMany(
          { tokenFamily: tokenRecord.tokenFamily },
          { isRevoked: true }
        );
        await User.findByIdAndUpdate(decoded.userId, { isActive: false });
        return { error: 'Token reuse detected. All sessions have been terminated.', errorCode: 'TOKEN_REUSE_DETECTED' };
      }

      const user = await userRepository.findById(decoded.userId);
      if (!user) {
        return null;
      }

      const schoolStatus = user.schoolId 
        ? (await schoolRepository.findByIdBasic(user.schoolId.toString()))?.status
        : undefined;

      const tokenPayload: TokenPayload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        schoolId: user.schoolId?.toString(),
        schoolApproved: user.isApproved,
        schoolStatus
      };

      const accessToken = generateAccessToken(tokenPayload);
      const newRefreshTokenDoc = generateRefreshToken(user._id.toString());
      
      await withTransaction(async (session) => {
        await RefreshToken.findByIdAndUpdate(tokenRecord._id, {
          isUsed: true,
          isRevoked: true
        }, { session });

        await RefreshToken.create([{
          userId: user._id,
          token: newRefreshTokenDoc.token,
          tokenFamily: tokenRecord.tokenFamily,
          expiresAt: newRefreshTokenDoc.expiresAt,
          isRevoked: false,
          isUsed: false
        }], { session });
      });

      return { accessToken, refreshToken: newRefreshTokenDoc.token };
    } catch {
      return null;
    }
  }

  async logout(refreshToken: string): Promise<void> {
    if (refreshToken) {
      await RefreshToken.updateOne(
        { token: refreshToken },
        { isRevoked: true }
      );
    }
  }

  async register(data: { name: string; email: string; password: string; role?: string }): Promise<any> {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = await userRepository.create({
      name: data.name,
      email: data.email.toLowerCase(),
      password: hashedPassword,
      role: 'school_admin',
      isActive: true,
      isApproved: false,
    });

    const { password: _, ...userWithoutPassword } = user.toObject ? user.toObject() : user;
    return userWithoutPassword;
  }

  async requestPasswordReset(email: string): Promise<boolean> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return false;
    }

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

    return true;
  }

  async verifyPasswordResetToken(token: string): Promise<boolean> {
    const resetRecord = await PasswordResetToken.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    }).select('_id');

    return !!resetRecord;
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const resetRecord = await PasswordResetToken.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!resetRecord) {
      return false;
    }

    try {
      await withTransaction(async (session) => {
        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
        
        await User.findByIdAndUpdate(
          resetRecord.userId,
          { password: hashedPassword },
          { session }
        );

        await PasswordResetToken.updateMany(
          { userId: resetRecord.userId },
          { $set: { used: true } },
          { session }
        );
      });

      return true;
    } catch (error) {
      console.error('Password reset failed:', error);
      return false;
    }
  }

  async getUserById(userId: string): Promise<any> {
    const user = await userRepository.findById(userId);
    if (!user) {
      return null;
    }
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getUserWithRelations(userId: string): Promise<any> {
    const user = await userRepository.findById(userId);
    if (!user) return null;
    
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export const authService = new AuthService();
