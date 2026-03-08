import { transcriptRepository } from '@/repositories';

export class TranscriptService {
  async getAll(userId: string, userRole: string, schoolId?: string): Promise<any[]> {
    if (userRole === 'super_admin') {
      return transcriptRepository.findAll();
    } else if (userRole === 'school_admin' && schoolId) {
      return transcriptRepository.findBySchool(schoolId);
    } else if (userRole === 'student') {
      return transcriptRepository.findByStudent(userId);
    }
    return [];
  }

  async getById(id: string): Promise<any> {
    return transcriptRepository.findById(id);
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
}

export const transcriptService = new TranscriptService();
