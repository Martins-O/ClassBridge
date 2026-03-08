import { gradeRepository } from '@/repositories';

export class GradeService {
  async getAll(userId: string, userRole: string): Promise<any[]> {
    if (userRole === 'super_admin' || userRole === 'school_admin') {
      return gradeRepository.findAll();
    } else if (userRole === 'mentor') {
      return gradeRepository.findAll({ mentorId: userId });
    } else if (userRole === 'student') {
      return gradeRepository.findByStudent(userId);
    }
    return [];
  }

  async getById(id: string): Promise<any> {
    return gradeRepository.findById(id);
  }

  async create(data: {
    studentId: string;
    courseId: string;
    classId: string;
    mentorId: string;
    academicYear: string;
    semester?: string;
    grade: string;
    score?: number;
    comments?: string;
  }): Promise<any> {
    return gradeRepository.create(data);
  }

  async createBulk(grades: any[]): Promise<any[]> {
    return gradeRepository.createMany(grades);
  }

  async update(id: string, data: any): Promise<any> {
    return gradeRepository.updateById(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return gradeRepository.deleteById(id);
  }

  async getByStudent(studentId: string): Promise<any[]> {
    return gradeRepository.findByStudent(studentId);
  }

  async getByCourse(courseId: string): Promise<any[]> {
    return gradeRepository.findByCourse(courseId);
  }

  async getByClass(classId: string): Promise<any[]> {
    return gradeRepository.findByClass(classId);
  }
}

export const gradeService = new GradeService();
