import { CourseService } from '../../src/services/course.service';

jest.mock('../../src/repositories', () => ({
  __esModule: true,
  courseRepository: {
    findAllPaginated: jest.fn(),
    countAll: jest.fn(),
    findByClassIdsPaginated: jest.fn(),
    countByClassIds: jest.fn(),
    findByMentorPaginated: jest.fn(),
    countByMentor: jest.fn(),
    findByStudentPaginated: jest.fn(),
    countByStudent: jest.fn(),
    findById: jest.fn(),
    findByIdBasic: jest.fn(),
    create: jest.fn(),
    updateById: jest.fn(),
  },
  classRepository: {
    findBySchool: jest.fn(),
    findByIdBasic: jest.fn(),
  },
}));

const { courseRepository, classRepository } = require('../../src/repositories');

describe('CourseService', () => {
  let courseService: CourseService;

  beforeEach(() => {
    courseService = new CourseService();
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all courses for system_admin', async () => {
      (courseRepository.findAllPaginated as jest.Mock).mockResolvedValue([{ _id: 'course-1' }]);
      (courseRepository.countAll as jest.Mock).mockResolvedValue(1);

      const result = await courseService.getAll('admin-1', 'system_admin', undefined, 1, 20);

      expect(result.courses).toHaveLength(1);
    });

    it('should return courses for school_admin', async () => {
      (classRepository.findBySchool as jest.Mock).mockResolvedValue([{ _id: 'class-1' }]);
      (courseRepository.findByClassIdsPaginated as jest.Mock).mockResolvedValue([{ _id: 'course-1' }]);
      (courseRepository.countByClassIds as jest.Mock).mockResolvedValue(1);

      const result = await courseService.getAll('admin-1', 'school_admin', 'school-1', 1, 20);

      expect(result.courses).toHaveLength(1);
    });

    it('should return courses for mentor', async () => {
      (courseRepository.findByMentorPaginated as jest.Mock).mockResolvedValue([{ _id: 'course-1' }]);
      (courseRepository.countByMentor as jest.Mock).mockResolvedValue(1);

      const result = await courseService.getAll('mentor-1', 'mentor', undefined, 1, 20);

      expect(result.courses).toHaveLength(1);
    });

    it('should return courses for student', async () => {
      (courseRepository.findByStudentPaginated as jest.Mock).mockResolvedValue([{ _id: 'course-1' }]);
      (courseRepository.countByStudent as jest.Mock).mockResolvedValue(1);

      const result = await courseService.getAll('student-1', 'student', undefined, 1, 20);

      expect(result.courses).toHaveLength(1);
    });
  });

  describe('getById', () => {
    it('should return course by id', async () => {
      (courseRepository.findById as jest.Mock).mockResolvedValue({ _id: 'course-1', name: 'Math' });

      const result = await courseService.getById('course-1');

      expect(result).toHaveProperty('name', 'Math');
    });
  });

  describe('create', () => {
    const courseData = {
      name: 'Math 101',
      classId: 'class-1',
      mentorId: 'mentor-1',
    };

    it('should create course', async () => {
      (classRepository.findByIdBasic as jest.Mock).mockResolvedValue({ _id: 'class-1', mentorIds: ['mentor-1'] });
      (courseRepository.create as jest.Mock).mockResolvedValue({ _id: 'course-1', ...courseData });

      const result = await courseService.create(courseData, 'mentor');

      expect(result).toHaveProperty('_id');
    });

    it('should throw if class not found', async () => {
      (classRepository.findByIdBasic as jest.Mock).mockResolvedValue(null);

      await expect(
        courseService.create(courseData, 'mentor')
      ).rejects.toThrow('Class not found');
    });

    it('should throw if mentor not assigned to class', async () => {
      (classRepository.findByIdBasic as jest.Mock).mockResolvedValue({ _id: 'class-1', mentorIds: ['other-mentor'] });

      await expect(
        courseService.create(courseData, 'mentor')
      ).rejects.toThrow('You can only create courses for classes you are assigned to');
    });
  });

  describe('update', () => {
    it('should update course for system_admin', async () => {
      (courseRepository.findByIdBasic as jest.Mock).mockResolvedValue({ _id: 'course-1', mentorId: 'mentor-1', classId: 'class-1' });
      (courseRepository.updateById as jest.Mock).mockResolvedValue({ _id: 'course-1', name: 'Updated' });

      const result = await courseService.update('course-1', { name: 'Updated' }, 'user-1', 'system_admin');

      expect(result).toHaveProperty('name', 'Updated');
    });

    it('should throw if student tries to update', async () => {
      (courseRepository.findByIdBasic as jest.Mock).mockResolvedValue({ _id: 'course-1' });

      await expect(
        courseService.update('course-1', {}, 'student-1', 'student')
      ).rejects.toThrow('Students cannot update courses');
    });

    it('should throw if mentor tries to update others course', async () => {
      (courseRepository.findByIdBasic as jest.Mock).mockResolvedValue({ _id: 'course-1', mentorId: 'other-mentor', classId: 'class-1' });

      await expect(
        courseService.update('course-1', {}, 'mentor-1', 'mentor')
      ).rejects.toThrow('You can only update your own courses');
    });

    it('should throw if school_admin tries to update different school course', async () => {
      (courseRepository.findByIdBasic as jest.Mock).mockResolvedValue({ _id: 'course-1', mentorId: 'mentor-1', classId: 'class-1' });
      (classRepository.findByIdBasic as jest.Mock).mockResolvedValue({ _id: 'class-1', schoolId: 'school-2' });

      await expect(
        courseService.update('course-1', {}, 'admin-1', 'school_admin', 'school-1')
      ).rejects.toThrow('You can only update courses in your school');
    });
  });

  describe('delete', () => {
    it('should delete course for system_admin', async () => {
      (courseRepository.findByIdBasic as jest.Mock).mockResolvedValue({ _id: 'course-1' });
      (courseRepository.updateById as jest.Mock).mockResolvedValue({});

      const result = await courseService.delete('course-1', 'admin-1', 'system_admin');

      expect(result).toBe(true);
    });

    it('should throw if student tries to delete', async () => {
      (courseRepository.findByIdBasic as jest.Mock).mockResolvedValue({ _id: 'course-1' });

      await expect(
        courseService.delete('course-1', 'student-1', 'student')
      ).rejects.toThrow('Students cannot delete courses');
    });

    it('should throw if mentor tries to delete others course', async () => {
      (courseRepository.findByIdBasic as jest.Mock).mockResolvedValue({ _id: 'course-1', mentorId: 'other-mentor', classId: 'class-1' });

      await expect(
        courseService.delete('course-1', 'mentor-1', 'mentor')
      ).rejects.toThrow('You can only delete your own courses');
    });
  });
});