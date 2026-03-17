import { gradeRepository } from '@/repositories';
import { classRepository } from '@/repositories';

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
  }, userId: string, userRole: string): Promise<any> {
    if (userRole === 'student') {
      throw new Error('Students cannot create grades');
    }

    if (userRole === 'mentor' && data.mentorId !== userId) {
      throw new Error('You can only grade students in your classes');
    }

    return gradeRepository.create(data);
  }

  async createBulk(grades: any[], userId: string, userRole: string): Promise<any[]> {
    if (userRole === 'student') {
      throw new Error('Students cannot create grades');
    }

    if (userRole === 'mentor') {
      for (const grade of grades) {
        if (grade.mentorId !== userId) {
          throw new Error('You can only grade students in your classes');
        }
      }
    }

    return gradeRepository.createMany(grades);
  }

  async update(id: string, data: any, userId: string, userRole: string, userSchoolId?: string): Promise<any> {
    const grade = await gradeRepository.findByIdBasic(id);
    if (!grade) {
      throw new Error('Grade not found');
    }

    if (userRole === 'student') {
      throw new Error('Students cannot update grades');
    }

    if (userRole === 'mentor') {
      if (grade.mentorId?.toString() !== userId) {
        throw new Error('You can only update grades you created');
      }
    }

    if (userRole === 'school_admin' && userSchoolId) {
      if (grade.schoolId?.toString() !== userSchoolId) {
        throw new Error('You can only update grades in your school');
      }
    }

    return gradeRepository.updateById(id, data);
  }

  async delete(id: string, userId: string, userRole: string, userSchoolId?: string): Promise<boolean> {
    const grade = await gradeRepository.findByIdBasic(id);
    if (!grade) {
      throw new Error('Grade not found');
    }

    if (userRole === 'student') {
      throw new Error('Students cannot delete grades');
    }

    if (userRole === 'mentor') {
      if (grade.mentorId?.toString() !== userId) {
        throw new Error('You can only delete grades you created');
      }
    }

    if (userRole === 'school_admin' && userSchoolId) {
      if (grade.schoolId?.toString() !== userSchoolId) {
        throw new Error('You can only delete grades in your school');
      }
    }

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
