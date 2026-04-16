import { schoolRepository } from '@/repositories';
import { userRepository } from '@/repositories';
import { isSystemAdmin } from '@/lib/permissions';
import { UserRole } from '@/models/User';
import User from '@/models/User';
import ClassModel from '@/models/Class';
import Course from '@/models/Course';
import mongoose from 'mongoose';

export interface PaginatedSchools {
  schools: any[];
  total: number;
  page: number;
  limit: number;
}

export class SchoolService {
  async getAll(userId: string, userRole: string, page = 1, limit = 20, query: Record<string, any> = {}): Promise<PaginatedSchools> {
    const skip = (page - 1) * limit;
    
    if (isSystemAdmin(userRole as UserRole)) {
      const [schools, total] = await Promise.all([
        schoolRepository.findAllPaginated(skip, limit, query),
        schoolRepository.countAll(query)
      ]);
      return { schools, total, page, limit };
    } else if (userRole === 'school_admin') {
      const [schools, total] = await Promise.all([
        schoolRepository.findByAdminPaginated(userId, skip, limit, { ...query, status: 'approved' }),
        schoolRepository.countByAdmin(userId, { ...query, status: 'approved' })
      ]);
      return { schools, total, page, limit };
    }
    return { schools: [], total: 0, page, limit };
  }

  async getApprovedSchools(page = 1, limit = 20, query: Record<string, any> = {}): Promise<PaginatedSchools> {
    const skip = (page - 1) * limit;
    const [schools, total] = await Promise.all([
      schoolRepository.findAllPaginated(skip, limit, { ...query, status: 'approved' }),
      schoolRepository.countAll({ ...query, status: 'approved' })
    ]);
    return { schools, total, page, limit };
  }

  async getById(id: string): Promise<any> {
    return schoolRepository.findById(id);
  }

  async getByIdBasic(id: string): Promise<any> {
    return schoolRepository.findByIdBasic(id);
  }

  async getStatus(id: string): Promise<{ status: string; rejectionReason?: string } | null> {
    const school = await schoolRepository.findByIdBasic(id);
    if (!school) return null;
    return {
      status: school.status,
      rejectionReason: school.rejectionReason
    };
  }

  async isApproved(id: string): Promise<boolean> {
    const school = await schoolRepository.findByIdBasic(id);
    return school?.status === 'approved';
  }

  async createDirect(data: {
    name: string;
    email: string;
    adminId: string;
    phone?: string;
    address?: string;
    website?: string;
    description?: string;
    status?: 'pending' | 'approved' | 'rejected';
  }): Promise<any> {
    const existingSchool = await schoolRepository.findByEmail(data.email);
    if (existingSchool) {
      throw new Error('School with this email already exists');
    }

    const school = await schoolRepository.create({
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone,
      address: data.address,
      website: data.website,
      description: data.description,
      adminId: data.adminId,
      status: data.status || 'approved',
    });

    await userRepository.updateById(data.adminId, {
      role: 'school_admin',
      schoolId: school._id,
      isApproved: data.status === 'approved'
    });

    return school;
  }

  async canAccess(userId: string, userRole: string, schoolId: string): Promise<boolean> {
    if (isSystemAdmin(userRole as UserRole)) return true;
    
    if (userRole === 'school_admin') {
      const school = await schoolRepository.findByIdBasic(schoolId);
      if (!school) return false;
      return school.adminId?.toString() === userId && school.status === 'approved';
    }

    const user = await userRepository.findById(userId);
    if (!user) return false;
    return user.schoolId?.toString() === schoolId;
  }

  async update(id: string, data: any, userRole: string, userSchoolId?: string): Promise<any> {
    const school = await schoolRepository.findByIdBasic(id);
    if (!school) {
      throw new Error('School not found');
    }

    const isAdmin = isSystemAdmin(userRole as UserRole);
    const isSchoolAdmin = userRole === 'school_admin' && userSchoolId?.toString() === id;

    if (!isAdmin && !isSchoolAdmin) {
      throw new Error('Access denied');
    }

    if (data.email && data.email !== school.email) {
      const existingSchool = await schoolRepository.findByEmail(data.email);
      if (existingSchool) {
        throw new Error('Email already in use by another school');
      }
    }

    return schoolRepository.updateById(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return schoolRepository.deleteById(id);
  }

  async getForUser(userId: string, userRole: string): Promise<any[]> {
    if (isSystemAdmin(userRole as UserRole)) {
      return schoolRepository.findAll();
    }
    if (userRole === 'school_admin') {
      return schoolRepository.findByAdmin(userId);
    }
    return [];
  }

  async updateStatus(id: string, status: 'active' | 'suspended', suspendedBy: string, reason?: string): Promise<any> {
    const school = await schoolRepository.findByIdBasic(id);
    if (!school) {
      return null;
    }

    const updateData: any = {
      status,
      isActive: status === 'active',
    };

    if (status === 'suspended') {
      updateData.suspendedAt = new Date();
      updateData.suspendedBy = new mongoose.Types.ObjectId(suspendedBy);
      updateData.suspensionReason = reason;
    } else {
      updateData.suspendedAt = undefined;
      updateData.suspendedBy = undefined;
      updateData.suspensionReason = undefined;
    }

    return schoolRepository.updateById(id, updateData);
  }

  async getSchoolStats(id: string): Promise<{
    totalUsers: number;
    totalClasses: number;
    totalCourses: number;
    activeStudents: number;
    pendingApprovals: number;
  }> {
    const [totalUsers, totalClasses, totalCourses, activeStudents, pendingApprovals] = await Promise.all([
      User.countDocuments({ schoolId: new mongoose.Types.ObjectId(id) }),
      ClassModel.countDocuments({ schoolId: new mongoose.Types.ObjectId(id) }),
      Course.countDocuments({ schoolId: new mongoose.Types.ObjectId(id) }),
      User.countDocuments({ schoolId: new mongoose.Types.ObjectId(id), role: 'student', isActive: true }),
      User.countDocuments({ schoolId: new mongoose.Types.ObjectId(id), isApproved: false, role: { $ne: 'system_admin' } }),
    ]);

    return {
      totalUsers,
      totalClasses,
      totalCourses,
      activeStudents,
      pendingApprovals,
    };
  }
}

export const schoolService = new SchoolService();
