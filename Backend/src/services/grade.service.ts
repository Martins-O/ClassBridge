import { gradeRepository } from '@/repositories';

export interface PaginatedGrades {
  grades: any[];
  total: number;
  page: number;
  limit: number;
}

export class GradeService {
  async getAll(userId: string, userRole: string, page = 1, limit = 20): Promise<PaginatedGrades> {
    const skip = (page - 1) * limit;
    
    let grades: any[] = [];
    let total = 0;

    if (userRole === 'super_admin' || userRole === 'school_admin') {
      [grades, total] = await Promise.all([
        gradeRepository.findAllPaginated(skip, limit),
        gradeRepository.countAll()
      ]);
    } else if (userRole === 'mentor') {
      [grades, total] = await Promise.all([
        gradeRepository.findByMentorPaginated(userId, skip, limit),
        gradeRepository.countByMentor(userId)
      ]);
    } else if (userRole === 'student') {
      [grades, total] = await Promise.all([
        gradeRepository.findByStudentPaginated(userId, skip, limit),
        gradeRepository.countByStudent(userId)
      ]);
    }

    return { grades, total, page, limit };
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
