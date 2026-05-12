import { courseRepository } from '@/repositories';
import { classRepository } from '@/repositories';

export interface PaginatedCourses {
  courses: any[];
  total: number;
  page: number;
  limit: number;
}

export class CourseService {
  async getAll(userId: string, userRole: string, schoolId?: string, page = 1, limit = 20): Promise<PaginatedCourses> {
    const skip = (page - 1) * limit;
    
    let courses: any[] = [];
    let total = 0;

    if (userRole === 'system_admin') {
      [courses, total] = await Promise.all([
        courseRepository.findAllPaginated(skip, limit),
        courseRepository.countAll()
      ]);
    } else if (userRole === 'school_admin' && schoolId) {
      const classes = await classRepository.findBySchool(schoolId);
      const classIds = classes.map((c: any) => c._id);
      [courses, total] = await Promise.all([
        courseRepository.findByClassIdsPaginated(classIds, skip, limit),
        courseRepository.countByClassIds(classIds)
      ]);
    } else if (userRole === 'mentor') {
      [courses, total] = await Promise.all([
        courseRepository.findByMentorPaginated(userId, skip, limit),
        courseRepository.countByMentor(userId)
      ]);
    } else if (userRole === 'student') {
      [courses, total] = await Promise.all([
        courseRepository.findByStudentPaginated(userId, skip, limit),
        courseRepository.countByStudent(userId)
      ]);
    }

    return { courses, total, page, limit };
  }

  async getById(id: string): Promise<any> {
    return courseRepository.findById(id);
  }

  async create(data: {
    name: string;
    classId: string;
    mentorId: string;
    description?: string;
    subject?: string;
    duration?: string;
    startDate?: Date;
    endDate?: Date;
    maxStudents?: number;
    syllabus?: string;
  }, userRole: string): Promise<any> {
    const cls = await classRepository.findByIdBasic(data.classId);
    if (!cls) {
      throw new Error('Class not found');
    }

    if (userRole === 'mentor' && !cls.mentorIds.some((id: any) => id.toString() === data.mentorId)) {
      throw new Error('You can only create courses for classes you are assigned to');
    }

    return courseRepository.create(data);
  }

  async update(id: string, data: any, userId: string, userRole: string, userSchoolId?: string): Promise<any> {
    const course = await courseRepository.findByIdBasic(id);
    if (!course) {
      throw new Error('Course not found');
    }

    if (userRole === 'student') {
      throw new Error('Students cannot update courses');
    }

    if (userRole === 'mentor') {
      if (course.mentorId.toString() !== userId) {
        throw new Error('You can only update your own courses');
      }
    }

    if (userRole === 'school_admin' && userSchoolId) {
      const cls = await classRepository.findByIdBasic(course.classId);
      if (!cls || cls.schoolId.toString() !== userSchoolId) {
        throw new Error('You can only update courses in your school');
      }
    }

    return courseRepository.updateById(id, data);
  }

  async delete(id: string, userId: string, userRole: string, userSchoolId?: string): Promise<boolean> {
    const course = await courseRepository.findByIdBasic(id);
    if (!course) {
      throw new Error('Course not found');
    }

    if (userRole === 'student') {
      throw new Error('Students cannot delete courses');
    }

    if (userRole === 'mentor') {
      if (course.mentorId.toString() !== userId) {
        throw new Error('You can only delete your own courses');
      }
    }

    if (userRole === 'school_admin' && userSchoolId) {
      const cls = await classRepository.findByIdBasic(course.classId);
      if (!cls || cls.schoolId.toString() !== userSchoolId) {
        throw new Error('You can only delete courses in your school');
      }
    }
    
    return courseRepository.updateById(id, { isActive: false }).then(() => true);
  }
}

export const courseService = new CourseService();
