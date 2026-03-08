import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { userRepository } from '@/repositories';
import { schoolRepository } from '@/repositories';
import { encodeSessionToken, getSessionCookieName } from '@/lib/session';
import PasswordResetToken from '@/models/PasswordResetToken';
import { sendEmail, generatePasswordResetEmail } from '@/lib/email';

const RESET_TOKEN_TTL_MINUTES = 60;
const SALT_ROUNDS = 12;

export class AuthService {
  async login(email: string, password: string): Promise<{ user: any; sessionToken: string } | null> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    const sessionToken = encodeSessionToken(user._id.toString());

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, sessionToken };
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
