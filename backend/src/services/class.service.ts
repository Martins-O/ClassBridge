import { classRepository } from '@/repositories';
import { schoolRepository } from '@/repositories';

export interface PaginatedClasses {
  classes: any[];
  total: number;
  page: number;
  limit: number;
}

export class ClassService {
  async getAll(userId: string, userRole: string, schoolId?: string, page = 1, limit = 20): Promise<PaginatedClasses> {
    const skip = (page - 1) * limit;
    
    let classes: any[] = [];
    let total = 0;

    if (userRole === 'system_admin') {
      [classes, total] = await Promise.all([
        classRepository.findAllPaginated(skip, limit),
        classRepository.countAll()
      ]);
    } else if (userRole === 'school_admin' && schoolId) {
      [classes, total] = await Promise.all([
        classRepository.findBySchoolPaginated(schoolId, skip, limit),
        classRepository.countBySchool(schoolId)
      ]);
    } else if (userRole === 'mentor') {
      [classes, total] = await Promise.all([
        classRepository.findByMentorPaginated(userId, skip, limit),
        classRepository.countByMentor(userId)
      ]);
    } else if (userRole === 'student') {
      [classes, total] = await Promise.all([
        classRepository.findByStudentPaginated(userId, skip, limit),
        classRepository.countByStudent(userId)
      ]);
    }

    return { classes, total, page, limit };
  }

  async getById(id: string): Promise<any> {
    return classRepository.findById(id);
  }

  async create(data: {
    name: string;
    schoolId: string;
    academicYear: string;
    duration: string;
    cohort: string;
    description?: string;
    subject?: string;
    grade?: string;
    semester?: string;
    mentorIds?: string[];
    studentIds?: string[];
    maxStudents?: number;
  }, userRole: string, userSchoolId?: string): Promise<any> {
    if (userRole === 'school_admin' && userSchoolId?.toString() !== data.schoolId) {
      throw new Error('You can only create classes for your own school');
    }

    const school = await schoolRepository.findByIdBasic(data.schoolId);
    if (!school) {
      throw new Error('School not found');
    }

    return classRepository.create(data);
  }

  async update(id: string, data: any, userRole: string, userSchoolId?: string): Promise<any> {
    const cls = await classRepository.findByIdBasic(id);
    if (!cls) {
      throw new Error('Class not found');
    }

    const isSystemAdmin = userRole === 'system_admin';
    const isSchoolAdmin = userRole === 'school_admin' && userSchoolId?.toString() === cls.schoolId?.toString();

    if (!isSystemAdmin && !isSchoolAdmin) {
      throw new Error('Only administrators can update classes');
    }

    return classRepository.updateById(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return classRepository.deleteById(id);
  }

  async addStudents(classId: string, studentIds: string[]): Promise<any> {
    return classRepository.addStudent(classId, studentIds);
  }

  async removeStudent(classId: string, studentId: string): Promise<any> {
    return classRepository.removeStudent(classId, studentId);
  }

  async getStudents(classId: string): Promise<any> {
    const cls = await classRepository.findById(classId);
    return cls?.studentIds || [];
  }
}

export const classService = new ClassService();
