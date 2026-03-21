import { transcriptRepository } from '@/repositories';
import { userRepository } from '@/repositories';
import { hasPermission, canViewOwnGradesOnly, canViewAllGrades, isSystemAdmin, isSchoolAdmin, PERMISSIONS } from '@/lib/permissions';
import { UserRole } from '@/models/User';

export class TranscriptService {
  async getAll(userId: string, userRole: string, schoolId?: string): Promise<any[]> {
    if (isSystemAdmin(userRole as UserRole)) {
      return transcriptRepository.findAll();
    } else if (isSchoolAdmin(userRole as UserRole) && schoolId) {
      return transcriptRepository.findBySchool(schoolId);
    } else if (userRole === 'counselor' && schoolId) {
      return transcriptRepository.findBySchool(schoolId);
    } else if (canViewOwnGradesOnly(userRole as UserRole)) {
      return transcriptRepository.findByStudent(userId);
    }
    return [];
  }

  async getById(id: string): Promise<any> {
    return transcriptRepository.findById(id);
  }

  async canView(userId: string, userRole: string, transcriptId: string, schoolId?: string): Promise<boolean> {
    const transcript = await transcriptRepository.findById(transcriptId);
    if (!transcript) return false;

    if (isSystemAdmin(userRole as UserRole)) return true;

    if (canViewAllGrades(userRole as UserRole) && transcript.schoolId?.toString() === schoolId) {
      return true;
    }

    if (canViewOwnGradesOnly(userRole as UserRole) && transcript.studentId?.toString() === userId) {
      return true;
    }

    return false;
  }

  async canCreate(userRole: string, schoolId: string, targetSchoolId: string): Promise<boolean> {
    if (isSystemAdmin(userRole as UserRole)) return true;
    if (hasPermission(userRole as UserRole, PERMISSIONS.MANAGE_TRANSCRIPTS) && schoolId === targetSchoolId) {
      return true;
    }
    return false;
  }

  async canUpdate(userId: string, userRole: string, transcriptId: string, schoolId?: string): Promise<boolean> {
    const transcript = await transcriptRepository.findById(transcriptId);
    if (!transcript) return false;

    if (isSystemAdmin(userRole as UserRole)) return true;

    if (hasPermission(userRole as UserRole, PERMISSIONS.MANAGE_TRANSCRIPTS) && transcript.schoolId?.toString() === schoolId) {
      return true;
    }

    return false;
  }

  async canDelete(userId: string, userRole: string, transcriptId: string, schoolId?: string): Promise<boolean> {
    const transcript = await transcriptRepository.findById(transcriptId);
    if (!transcript) return false;

    if (isSystemAdmin(userRole as UserRole)) return true;

    if (isSchoolAdmin(userRole as UserRole) && transcript.schoolId?.toString() === schoolId) {
      return true;
    }

    return false;
  }

  async create(data: {
    studentId: string;
    schoolId: string;
    academicYear: string;
    courses: any[];
    semester?: string;
    overallGPA?: number;
  }): Promise<any> {
    return transcriptRepository.create({
      ...data,
      issuedAt: new Date(),
    });
  }

  async update(id: string, data: any): Promise<any> {
    return transcriptRepository.updateById(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return transcriptRepository.deleteById(id);
  }

  async getByStudent(studentId: string): Promise<any[]> {
    return transcriptRepository.findByStudent(studentId);
  }

  async getBySchool(schoolId: string): Promise<any[]> {
    return transcriptRepository.findBySchool(schoolId);
  }
}

export const transcriptService = new TranscriptService();
