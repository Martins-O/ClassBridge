import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { userRepository } from '@/repositories';
import { schoolRepository } from '@/repositories';
import { encodeSessionToken, getSessionCookieName } from '@/lib/session';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, TokenPayload } from '@/lib/jwt';
import PasswordResetToken from '@/models/PasswordResetToken';
import RefreshToken from '@/models/RefreshToken';
import { sendEmail, generatePasswordResetEmail } from '@/lib/email';

const RESET_TOKEN_TTL_MINUTES = 60;
const SALT_ROUNDS = 12;

export class AuthService {
  async login(email: string, password: string): Promise<{ user: any; accessToken: string; refreshToken: string } | null> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshTokenDoc = generateRefreshToken(user._id.toString());
    
    await RefreshToken.create({
      userId: user._id,
      token: refreshTokenDoc.token,
      expiresAt: refreshTokenDoc.expiresAt,
      isRevoked: false
    });

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, accessToken, refreshToken: refreshTokenDoc.token };
  }

  async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | null> {
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

      const user = await userRepository.findById(decoded.userId);
      if (!user) {
        return null;
      }

      const tokenPayload: TokenPayload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role
      };

      const accessToken = generateAccessToken(tokenPayload);
      const newRefreshTokenDoc = generateRefreshToken(user._id.toString());
      
      await RefreshToken.create({
        userId: user._id,
        token: newRefreshTokenDoc.token,
        expiresAt: newRefreshTokenDoc.expiresAt,
        isRevoked: false
      });

      await RefreshToken.updateOne(
        { _id: tokenRecord._id },
        { isRevoked: true }
      );

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

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await userRepository.updateById(resetRecord.userId.toString(), { password: hashedPassword });

    resetRecord.used = true;
    await resetRecord.save();

    await PasswordResetToken.updateMany(
      { userId: resetRecord.userId, used: false },
      { $set: { used: true } },
    );

    return true;
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
