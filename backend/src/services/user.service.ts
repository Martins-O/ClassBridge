import { userRepository } from '@/repositories';
import { schoolService } from '@/services/school.service';
import RefreshToken from '@/models/RefreshToken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export class UserService {
  async getById(id: string): Promise<any> {
    return userRepository.findById(id);
  }

  async getByIdWithPassword(id: string): Promise<any> {
    return userRepository.findByIdWithPassword(id);
  }

  async getAll(): Promise<any[]> {
    return userRepository.findAll();
  }

  async getBySchool(schoolId: string, includeInactive = false): Promise<any[]> {
    const query: any = { schoolId };
    if (!includeInactive) {
      query.isActive = true;
    }
    return userRepository.findBySchool(schoolId);
  }

  async getMentorsBySchool(schoolId: string): Promise<any[]> {
    return userRepository.findMentorsBySchool(schoolId);
  }

  async getStudentsBySchool(schoolId: string): Promise<any[]> {
    return userRepository.findStudentsBySchool(schoolId);
  }

  async getStudentsByClass(classId: string): Promise<any[]> {
    return userRepository.findStudentsByClass(classId);
  }

  async update(id: string, data: any): Promise<any> {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 12);
    }
    return userRepository.updateById(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return userRepository.deleteById(id);
  }

  async addClassToUser(userId: string, classId: string): Promise<any> {
    return userRepository.addClassToUser(userId, classId);
  }

  async removeClassFromUser(userId: string, classId: string): Promise<any> {
    return userRepository.removeClassFromUser(userId, classId);
  }

  async count(query: any = {}): Promise<number> {
    return userRepository.count(query);
  }

  async isDeletionPending(userId: string): Promise<boolean> {
    const user = await userRepository.findById(userId);
    return user?.deletionRequested === true;
  }

  async canAccess(userId: string, targetUserId: string): Promise<boolean> {
    const [user, target] = await Promise.all([
      userRepository.findById(userId),
      userRepository.findById(targetUserId)
    ]);

    if (!user || !target) return false;

    if (user._id.toString() === target._id.toString()) return true;

    if (user.role === 'system_admin') return true;

    if (user.role === 'school_admin' && target.schoolId?.toString() === user.schoolId?.toString()) {
      return true;
    }

    return false;
  }

  async canManage(userId: string, targetUserId: string): Promise<boolean> {
    const [user, target] = await Promise.all([
      userRepository.findById(userId),
      userRepository.findById(targetUserId)
    ]);

    if (!user || !target) return false;

    if (user.role === 'system_admin') return true;

    if (user.role === 'school_admin' && target.schoolId?.toString() === user.schoolId?.toString()) {
      if (target.role === 'system_admin' || target.role === 'school_admin') return false;
      return true;
    }

    return false;
  }

  async getActiveUsersBySchool(schoolId: string): Promise<any[]> {
    return userRepository.findAll({ schoolId, isActive: true, deletionRequested: false });
  }

  async getActiveStudentCount(schoolId: string): Promise<number> {
    return userRepository.count({ schoolId, role: 'student', isActive: true });
  }

  async getActiveMentorCount(schoolId: string): Promise<number> {
    return userRepository.count({ schoolId, role: 'mentor', isActive: true });
  }

  async forcePasswordChange(userId: string, adminId: string, reason?: string): Promise<any> {
    const user = await userRepository.findById(userId);
    if (!user) return null;

    await RefreshToken.deleteMany({ userId });

    return userRepository.updateById(userId, {
      requirePasswordChange: true,
      passwordExpired: false,
      remindersSent: 0,
    });
  }

  async resetPassword(userId: string, newPassword: string): Promise<string | null> {
    const user = await userRepository.findById(userId);
    if (!user) return null;

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    await RefreshToken.deleteMany({ userId });

    await userRepository.updateById(userId, {
      password: hashedPassword,
      passwordChangedAt: new Date(),
      passwordExpired: false,
      remindersSent: 0,
      requirePasswordChange: false,
    });

    return newPassword;
  }
}

export const userService = new UserService();
