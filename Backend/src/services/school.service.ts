import { schoolRepository } from '@/repositories';
import { userRepository } from '@/repositories';

export class SchoolService {
  async getAll(userId: string, userRole: string): Promise<any[]> {
    if (userRole === 'super_admin') {
      return schoolRepository.findAll();
    } else if (userRole === 'school_admin') {
      return schoolRepository.findByAdmin(userId);
    }
    return [];
  }

  async getById(id: string): Promise<any> {
    return schoolRepository.findById(id);
  }

  async create(data: { name: string; email: string; adminId: string; phone?: string; address?: string; website?: string; description?: string }): Promise<any> {
    const existingSchool = await schoolRepository.findByEmail(data.email);
    if (existingSchool) {
      throw new Error('School with this email already exists');
    }

    const adminUser = await userRepository.findById(data.adminId);
    if (!adminUser) {
      throw new Error('Admin user not found');
    }

    const school = await schoolRepository.create({
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone,
      address: data.address,
      website: data.website,
      description: data.description,
      adminId: data.adminId,
    });

    await userRepository.updateById(data.adminId, { role: 'school_admin', schoolId: school._id });

    return school;
  }

  async update(id: string, data: any, userRole: string, userSchoolId?: string): Promise<any> {
    const school = await schoolRepository.findByIdBasic(id);
    if (!school) {
      throw new Error('School not found');
    }

    const isSuperAdmin = userRole === 'super_admin';
    const isSchoolAdmin = userRole === 'school_admin' && userSchoolId?.toString() === id;

    if (!isSuperAdmin && !isSchoolAdmin) {
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
    if (userRole === 'super_admin') {
      return schoolRepository.findAll();
    }
    if (userRole === 'school_admin') {
      return schoolRepository.findByAdmin(userId);
    }
    return [];
  }
}

export const schoolService = new SchoolService();
