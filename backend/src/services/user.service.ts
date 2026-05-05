import { userRepository } from '@/repositories';
import RefreshToken from '@/models/RefreshToken';
import { gradeRepository } from '@/repositories/grade.repository';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export class UserService {
  async getById(id: string): Promise<any> {
    const user = await userRepository.findById(id);
    if (!user) return null;
    
    // Asynchronously update stats to keep data fresh without blocking significantly
    // In a production app, this might be triggered by events rather than every getById
    this.calculateUserStats(id).catch(err => console.error('Failed to update stats:', err));
    
    return user;
  }

  async calculateUserStats(userId: string): Promise<any> {
    const user = await userRepository.findById(userId);
    if (!user) return null;

    let gpa = 0;
    let academicStanding = 'Good Standing';
    let courseCompletion = 0;
    let securityScore = 50;

    // Only students have GPA/Course stats
    if (user.role === 'student') {
        const grades = await gradeRepository.findByStudent(userId);
        if (grades.length > 0) {
            const gpaValues: Record<string, number> = { 
                'A+': 4.0, 'A': 4.0, 'A-': 3.7, 
                'B+': 3.3, 'B': 3.0, 'B-': 2.7, 
                'C+': 2.3, 'C': 2.0, 'C-': 1.7, 
                'D+': 1.3, 'D': 1.0, 'F': 0.0 
            };
            
            const sum = grades.reduce((acc: number, g: any) => {
                const gradeStr = (g.grade || '').toUpperCase();
                return acc + (gpaValues[gradeStr] || 0);
            }, 0);
            
            gpa = Number((sum / grades.length).toFixed(2));
            
            if (gpa >= 3.7) academicStanding = 'Principal’s Honor List';
            else if (gpa >= 3.5) academicStanding = 'Dean’s Honor List';
            else if (gpa < 2.0) academicStanding = 'Academic Probation';
        }

        const totalClasses = user.classIds?.length || 0;
        const completedCourses = grades.length; 
        courseCompletion = totalClasses > 0 ? Math.min(100, Math.round((completedCourses / totalClasses) * 100)) : 0;
    }

    // Security Score for everyone
    if (user.twoFactorEnabled) securityScore += 25;
    if (user.emailVerified) securityScore += 15;
    
    const passwordAgeDays = (Date.now() - new Date(user.passwordChangedAt || user.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (passwordAgeDays < 90) securityScore += 10;

    const stats = { gpa, academicStanding, courseCompletion, securityScore };
    await userRepository.updateById(userId, { stats });
    
    return stats;
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

  async update(id: string, data: any, userRole: string): Promise<any> {
    // Define allowed fields per role
    const isSystemAdmin = userRole === 'system_admin';
    const isSchoolAdmin = userRole === 'school_admin';
    
    let allowedFields: string[];
    if (isSystemAdmin) {
      allowedFields = Object.keys(data); // System admin can update anything
    } else if (isSchoolAdmin) {
      // School admin can update basic user fields but not role/schoolId for non-admins
      allowedFields = ['name', 'email', 'password', 'phone', 'bio', 'profileImage', 'classIds'];
    } else {
      // Regular users can only update their own basic info
      allowedFields = ['name', 'email', 'password', 'phone', 'bio', 'profileImage'];
    }

    // Filter data to only allowed fields
    const filteredData: any = {};
    for (const key of allowedFields) {
      if (key in data) {
        filteredData[key] = data[key];
      }
    }

    if (filteredData.password) {
      filteredData.password = await bcrypt.hash(filteredData.password, 12);
    }
    
    return userRepository.updateById(id, filteredData);
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
