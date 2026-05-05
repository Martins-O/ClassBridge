import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { compareTwoStrings } from 'string-similarity';
import { userRepository, schoolRepository, notificationRepository } from '@/repositories';
import { encodeSessionToken, getSessionCookieName } from '@/lib/session';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, TokenPayload } from '@/lib/jwt';
import PasswordResetToken from '@/models/PasswordResetToken';
import RefreshToken from '@/models/RefreshToken';
import EmailVerificationToken from '@/models/EmailVerificationToken';
import User from '@/models/User';
import School from '@/models/School';
import SchoolApproval from '@/models/SchoolApproval';
import { sendEmail, generatePasswordResetEmail, generateSchoolRegistrationSubmittedEmail, generateNewSchoolRegistrationAdminEmail, generateEmailVerificationEmail, generateSchoolApprovedNotificationEmail } from '@/lib/email';
import { withTransaction } from '@/lib/mongodb';
import { BaseService } from './base.service';
import { createAuditLog } from '@/lib/auditLogger';

const RESET_TOKEN_TTL_MINUTES = 60;
const SALT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;
const PASSWORD_EXPIRY_DAYS = 90;

export class AuthService extends BaseService {
  private readonly MAX_CONCURRENT_SESSIONS = 5;

  async login(email: string, password: string, ip?: string, userAgent?: string): Promise<{
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

    // Check if email is verified
    if (!user.emailVerified) {
      return {
        error: 'Please verify your email before logging in. Check your inbox for the verification link.',
        errorCode: 'EMAIL_NOT_VERIFIED'
      };
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

    // Check if password has expired (90 days)
    if (user.passwordChangedAt) {
      const passwordAge = (Date.now() - new Date(user.passwordChangedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (passwordAge > PASSWORD_EXPIRY_DAYS) {
        return {
          error: 'Your password has expired. Please reset your password to continue.',
          errorCode: 'PASSWORD_EXPIRED'
        };
      }
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
      if (school && school.status === 'suspended') {
        return {
          error: `Your school has been suspended. Reason: ${school.suspensionReason || 'No reason provided'}`,
          errorCode: 'SCHOOL_SUSPENDED'
        };
      }
    }

    // Enforce concurrent session limit
    const activeSessions = await RefreshToken.countDocuments({
      userId: user._id,
      isRevoked: false,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    if (activeSessions >= this.MAX_CONCURRENT_SESSIONS) {
      // Revoke oldest session
      const oldestSession = await RefreshToken.findOne({
        userId: user._id,
        isRevoked: false,
        isUsed: false,
        expiresAt: { $gt: new Date() }
      }).sort({ createdAt: 1 });

      if (oldestSession) {
        await RefreshToken.findByIdAndUpdate(oldestSession._id, { isRevoked: true });
      }
    }

    const schoolStatus = user.schoolId
      ? (await schoolRepository.findByIdBasic(user.schoolId.toString()))?.status
      : undefined;

    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
      name: user.name,
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

    // Update login info (IP, device, timestamp)
    await this.updateLoginInfo(user._id.toString(), ip, userAgent);

    // Audit log for successful login
    await createAuditLog({
      userId: user._id.toString(),
      userEmail: user.email,
      action: 'login',
      resource: 'auth',
      details: { method: 'password', ip, userAgent },
      ipAddress: ip,
      userAgent,
    });

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, accessToken, refreshToken: refreshTokenDoc.token };
  }

  async refreshTokens(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  } | {
    error: string;
    errorCode: string;
  } | null> {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      const tokenJti = decoded.jti;

      const tokenRecord = await RefreshToken.findOne({
        token: refreshToken,
        isRevoked: false,
        expiresAt: { $gt: new Date() }
      });

      if (!tokenRecord) {
        return null;
      }

      // If token is already used, it's a reuse attack
      if (tokenRecord.isUsed) {
        // Invalidate entire token family
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
        name: user.name,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId?.toString(),
        schoolApproved: user.isApproved,
        schoolStatus: schoolStatus
      };

      const accessToken = generateAccessToken(tokenPayload);
      const newRefreshTokenDoc = generateRefreshToken(user._id.toString());

      await withTransaction(async (session) => {
        // Mark old token as used
        await RefreshToken.findByIdAndUpdate(tokenRecord._id, {
          isUsed: true,
          isRevoked: true
        }, { session });

        // Create new token in same family
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

  async logout(refreshToken: string, userId?: string, userEmail?: string, ip?: string, userAgent?: string): Promise<void> {
    if (refreshToken) {
      await RefreshToken.updateOne(
        { token: refreshToken },
        { isRevoked: true }
      );
    }

    // Audit log for logout
    if (userId && userEmail) {
      await createAuditLog({
        userId,
        userEmail,
        action: 'logout',
        resource: 'auth',
        details: { method: 'token', ip, userAgent },
        ipAddress: ip,
        userAgent,
      });
    }
  }

  async register(data: { name: string; email: string; password: string; schoolName?: string; role?: string }): Promise<any> {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    let user: any;
    let school: any;

    if (data.schoolName) {
      // First check exact match (case-insensitive)
      const existingSchool = await School.findOne({ name: { $regex: new RegExp(`^${data.schoolName}$`, 'i') } });
      if (existingSchool) {
        throw new Error('A school with this name already exists. Please choose a different name.');
      }

      // Fuzzy match check for similar school names
      const allSchools = await School.find({}, 'name');
      for (const schoolDoc of allSchools) {
        const similarity = compareTwoStrings(
          data.schoolName.toLowerCase().replace(/\s+/g, ''),
          schoolDoc.name.toLowerCase().replace(/\s+/g, '')
        );
        if (similarity > 0.85) {
          throw new Error(`A similar school "${schoolDoc.name}" already exists. Please check the name or contact support if this is a different school.`);
        }
      }

      user = await User.create({
        name: data.name,
        email: data.email.toLowerCase(),
        password: hashedPassword,
        role: 'school_admin',
        isActive: true,
        isApproved: true,
        emailVerified: false,
      });

      school = await School.create({
        name: data.schoolName,
        email: data.email.toLowerCase(),
        adminId: user._id,
        status: 'approved',
        isActive: true,
      });

      await SchoolApproval.create({
        schoolId: school._id,
        schoolName: data.schoolName,
        schoolEmail: data.email.toLowerCase(),
        requestedBy: user._id,
        adminName: data.name,
        status: 'approved',
        approvedAt: new Date(),
      });

      user.schoolId = school._id;
      await user.save();

      // Generate email verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await EmailVerificationToken.create({
        userId: user._id,
        token: verificationToken,
        expiresAt,
      });

      // Send verification email
      await sendEmail(generateEmailVerificationEmail({
        recipientEmail: data.email.toLowerCase(),
        recipientName: data.name,
        verificationToken,
        schoolName: data.schoolName,
      }));

    } else {
      user = await User.create({
        name: data.name,
        email: data.email.toLowerCase(),
        password: hashedPassword,
        role: 'pending_school_admin',
        isActive: false,
        isApproved: false,
        emailVerified: false,
      });

      // Generate email verification token for non-school users too
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await EmailVerificationToken.create({
        userId: user._id,
        token: verificationToken,
        expiresAt,
      });

      await sendEmail(generateEmailVerificationEmail({
        recipientEmail: data.email.toLowerCase(),
        recipientName: data.name,
        verificationToken,
      }));
    }

    if (data.schoolName) {
      const systemAdmins = await User.find({ role: 'system_admin' });
      for (const admin of systemAdmins) {
        await notificationRepository.create({
          userId: admin._id,
          title: 'New School Registered (Auto-Approved)',
          message: `New school "${data.schoolName}" has registered and was automatically approved.`,
          type: 'new_registration',
        });
      }
    }

    const { password: _, ...userWithoutPassword } = user.toObject ? user.toObject() : user;
    return userWithoutPassword;
  }

  async verifyEmail(token: string): Promise<{ success: boolean; error?: string; user?: any }> {
    const verificationRecord = await EmailVerificationToken.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    }).populate('userId');

    if (!verificationRecord) {
      return { success: false, error: 'Invalid or expired verification token' };
    }

    const user = verificationRecord.userId as any;

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    await withTransaction(async (session) => {
      await User.findByIdAndUpdate(
        user._id,
        {
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
        { session }
      );

      await EmailVerificationToken.findByIdAndUpdate(
        verificationRecord._id,
        { used: true },
        { session }
      );
    });

    // If this is a school admin, notify system admins that email is verified
    if (user.role === 'school_admin' && user.schoolId) {
      const systemAdmins = await User.find({ role: 'system_admin' });
      for (const admin of systemAdmins) {
        await notificationRepository.create({
          userId: admin._id,
          title: 'New School Registered',
          message: `School "${user.name}" has registered and was automatically approved.`,
          type: 'new_registration',
        });

        const school = await School.findById(user.schoolId);
        if (school) {
          try {
            await sendEmail(generateNewSchoolRegistrationAdminEmail({
              recipientEmail: admin.email,
              recipientName: admin.name,
              schoolName: school.name,
              adminEmail: user.email,
              adminName: user.name,
              registrationDate: new Date(),
            }));
          } catch (emailErr) {
            console.error(`Failed to send notification email to admin ${admin.email}:`, emailErr);
          }
        }
      }

      // Send confirmation email to the user
      try {
        const schoolDoc = await School.findById(user.schoolId);
        await sendEmail(generateSchoolApprovedNotificationEmail({
          recipientEmail: user.email,
          recipientName: user.name,
          schoolName: schoolDoc?.name || 'Your School',
        }));
      } catch (emailErr) {
        console.error(`Failed to send confirmation email to user ${user.email}:`, emailErr);
      }
    }

    const { password: _, ...userWithoutPassword } = user.toObject ? user.toObject() : user;
    return { success: true, user: userWithoutPassword };
  }

  async resendVerificationEmail(email: string): Promise<{ success: boolean; error?: string }> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // Don't reveal user doesn't exist
      return { success: true };
    }

    if (user.emailVerified) {
      return { success: false, error: 'Email is already verified' };
    }

    // Invalidate old tokens
    await EmailVerificationToken.updateMany(
      { userId: user._id, used: false },
      { $set: { used: true } }
    );

    // Create new token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await EmailVerificationToken.create({
      userId: user._id,
      token: verificationToken,
      expiresAt,
    });

    // Get school name if applicable
    let schoolName: string | undefined;
    if (user.schoolId) {
      const school = await School.findById(user.schoolId);
      schoolName = school?.name;
    }

    await sendEmail(generateEmailVerificationEmail({
      recipientEmail: user.email,
      recipientName: user.name,
      verificationToken,
      schoolName,
    }));

    return { success: true };
  }

  async updateLoginInfo(userId: string, ip?: string, userAgent?: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      lastLoginAt: new Date(),
      lastLoginIP: ip,
      lastLoginDevice: userAgent,
    });
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

  async resetPassword(token: string, newPassword: string, ip?: string, userAgent?: string): Promise<boolean> {
    const resetRecord = await PasswordResetToken.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!resetRecord) {
      return false;
    }

    try {
      const user = await User.findById(resetRecord.userId);

      await withTransaction(async (session) => {
        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

        await User.findByIdAndUpdate(
          resetRecord.userId,
          {
            password: hashedPassword,
            passwordChangedAt: new Date(),
            passwordExpired: false,
            requirePasswordChange: false
          },
          { session }
        );

        await PasswordResetToken.updateMany(
          { userId: resetRecord.userId },
          { $set: { used: true } },
          { session }
        );
      });

      // Audit log for password reset
      if (user?._id && user?.email) {
        await createAuditLog({
          userId: user._id.toString(),
          userEmail: user.email,
          action: 'update',
          resource: 'password',
          details: { method: 'reset', ip, userAgent },
          ipAddress: ip,
          userAgent,
        });
      }

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
