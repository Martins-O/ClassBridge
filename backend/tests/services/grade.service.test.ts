import { GradeService } from '../../src/services/grade.service';
import { gradeRepository, classRepository } from '../../src/repositories';

jest.mock('../../src/repositories', () => ({
  __esModule: true,
  gradeRepository: {
    findAllPaginated: jest.fn(),
    countAll: jest.fn(),
    findByMentorPaginated: jest.fn(),
    countByMentor: jest.fn(),
    findByStudentPaginated: jest.fn(),
    countByStudent: jest.fn(),
    findById: jest.fn(),
    findByIdBasic: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    updateById: jest.fn(),
    deleteById: jest.fn(),
    findByStudent: jest.fn(),
    findByCourse: jest.fn(),
    findByClass: jest.fn(),
  },
  classRepository: {
    findById: jest.fn(),
  },
}));

describe('GradeService', () => {
  let gradeService: GradeService;

  beforeEach(() => {
    gradeService = new GradeService();
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all grades for system_admin', async () => {
      (gradeRepository.findAllPaginated as jest.Mock).mockResolvedValue([{ _id: 'grade-1' }]);
      (gradeRepository.countAll as jest.Mock).mockResolvedValue(1);

      const result = await gradeService.getAll('admin-1', 'system_admin', 1, 20);

      expect(result.grades).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should return all grades for school_admin', async () => {
      (gradeRepository.findAllPaginated as jest.Mock).mockResolvedValue([{ _id: 'grade-1' }]);
      (gradeRepository.countAll as jest.Mock).mockResolvedValue(1);

      const result = await gradeService.getAll('admin-1', 'school_admin', 1, 20);

      expect(result.grades).toHaveLength(1);
    });

    it('should return grades for mentor', async () => {
      (gradeRepository.findByMentorPaginated as jest.Mock).mockResolvedValue([{ _id: 'grade-1' }]);
      (gradeRepository.countByMentor as jest.Mock).mockResolvedValue(1);

      const result = await gradeService.getAll('mentor-1', 'mentor', 1, 20);

      expect(result.grades).toHaveLength(1);
      expect(gradeRepository.findByMentorPaginated).toHaveBeenCalledWith('mentor-1', 0, 20);
    });

    it('should return grades for student', async () => {
      (gradeRepository.findByStudentPaginated as jest.Mock).mockResolvedValue([{ _id: 'grade-1' }]);
      (gradeRepository.countByStudent as jest.Mock).mockResolvedValue(1);

      const result = await gradeService.getAll('student-1', 'student', 1, 20);

      expect(result.grades).toHaveLength(1);
      expect(gradeRepository.findByStudentPaginated).toHaveBeenCalledWith('student-1', 0, 20);
    });
  });

  describe('getById', () => {
    it('should return grade by id', async () => {
      (gradeRepository.findById as jest.Mock).mockResolvedValue({ _id: 'grade-1', grade: 'A' });

      const result = await gradeService.getById('grade-1');

      expect(result).toHaveProperty('grade', 'A');
    });
  });

  describe('create', () => {
    const gradeData = {
      studentId: 'student-1',
      courseId: 'course-1',
      classId: 'class-1',
      mentorId: 'mentor-1',
      academicYear: '2024',
      semester: 'Fall',
      grade: 'A',
      score: 95,
    };

    it('should create grade for school_admin', async () => {
      (gradeRepository.create as jest.Mock).mockResolvedValue({ _id: 'grade-1' });

      const result = await gradeService.create(gradeData, 'admin-1', 'school_admin');

      expect(result).toHaveProperty('_id');
    });

    it('should create grade for mentor', async () => {
      (gradeRepository.create as jest.Mock).mockResolvedValue({ _id: 'grade-1' });

      const result = await gradeService.create(gradeData, 'mentor-1', 'mentor');

      expect(result).toHaveProperty('_id');
    });

    it('should throw if student tries to create grade', async () => {
      await expect(
        gradeService.create(gradeData, 'student-1', 'student')
      ).rejects.toThrow('Students cannot create grades');
    });

    it('should throw if mentor tries to grade for other mentor', async () => {
      await expect(
        gradeService.create({ ...gradeData, mentorId: 'other-mentor' }, 'mentor-1', 'mentor')
      ).rejects.toThrow('You can only grade students in your classes');
    });
  });

  describe('createBulk', () => {
    const grades = [
      { studentId: 'student-1', courseId: 'course-1', classId: 'class-1', mentorId: 'mentor-1', academicYear: '2024', grade: 'A' },
      { studentId: 'student-2', courseId: 'course-1', classId: 'class-1', mentorId: 'mentor-1', academicYear: '2024', grade: 'B' },
    ];

    it('should create bulk grades for school_admin', async () => {
      (gradeRepository.createMany as jest.Mock).mockResolvedValue([{ _id: 'grade-1' }, { _id: 'grade-2' }]);

      const result = await gradeService.createBulk(grades, 'admin-1', 'school_admin');

      expect(result).toHaveLength(2);
    });

    it('should throw if student tries to create bulk grades', async () => {
      await expect(
        gradeService.createBulk(grades, 'student-1', 'student')
      ).rejects.toThrow('Students cannot create grades');
    });

    it('should throw if mentor includes grades from other mentors', async () => {
      const invalidGrades = [
        { ...grades[0], mentorId: 'other-mentor' },
      ];

      await expect(
        gradeService.createBulk(invalidGrades, 'mentor-1', 'mentor')
      ).rejects.toThrow('You can only grade students in your classes');
    });
  });

  describe('update', () => {
    it('should update grade for system_admin', async () => {
      (gradeRepository.findByIdBasic as jest.Mock).mockResolvedValue({ _id: 'grade-1', mentorId: 'mentor-1', schoolId: 'school-1' });
      (gradeRepository.updateById as jest.Mock).mockResolvedValue({ _id: 'grade-1', grade: 'A+' });

      const result = await gradeService.update('grade-1', { grade: 'A+' }, 'admin-1', 'system_admin', 'school-1');

      expect(result).toHaveProperty('grade', 'A+');
    });

    it('should update grade for school_admin in same school', async () => {
      (gradeRepository.findByIdBasic as jest.Mock).mockResolvedValue({ _id: 'grade-1', mentorId: 'mentor-1', schoolId: 'school-1' });
      (gradeRepository.updateById as jest.Mock).mockResolvedValue({ _id: 'grade-1', grade: 'B' });

      const result = await gradeService.update('grade-1', { grade: 'B' }, 'admin-1', 'school_admin', 'school-1');

      expect(result).toHaveProperty('grade', 'B');
    });

    it('should throw if student tries to update grade', async () => {
      (gradeRepository.findByIdBasic as jest.Mock).mockResolvedValue({ _id: 'grade-1' });

      await expect(
        gradeService.update('grade-1', { grade: 'A' }, 'student-1', 'student')
      ).rejects.toThrow('Students cannot update grades');
    });

    it('should throw if mentor tries to update grade they did not create', async () => {
      (gradeRepository.findByIdBasic as jest.Mock).mockResolvedValue({ _id: 'grade-1', mentorId: 'other-mentor' });

      await expect(
        gradeService.update('grade-1', { grade: 'A' }, 'mentor-1', 'mentor')
      ).rejects.toThrow('You can only update grades you created');
    });

    it('should throw if school_admin tries to update grade in different school', async () => {
      (gradeRepository.findByIdBasic as jest.Mock).mockResolvedValue({ _id: 'grade-1', schoolId: 'school-2' });

      await expect(
        gradeService.update('grade-1', { grade: 'A' }, 'admin-1', 'school_admin', 'school-1')
      ).rejects.toThrow('You can only update grades in your school');
    });

    it('should throw if grade not found', async () => {
      (gradeRepository.findByIdBasic as jest.Mock).mockResolvedValue(null);

      await expect(
        gradeService.update('nonexistent', { grade: 'A' }, 'admin-1', 'system_admin')
      ).rejects.toThrow('Grade not found');
    });
  });

  describe('delete', () => {
    it('should delete grade for system_admin', async () => {
      (gradeRepository.findByIdBasic as jest.Mock).mockResolvedValue({ _id: 'grade-1' });
      (gradeRepository.deleteById as jest.Mock).mockResolvedValue(true);

      const result = await gradeService.delete('grade-1', 'admin-1', 'system_admin');

      expect(result).toBe(true);
    });

    it('should throw if student tries to delete grade', async () => {
      (gradeRepository.findByIdBasic as jest.Mock).mockResolvedValue({ _id: 'grade-1' });

      await expect(
        gradeService.delete('grade-1', 'student-1', 'student')
      ).rejects.toThrow('Students cannot delete grades');
    });

    it('should throw if mentor tries to delete grade they did not create', async () => {
      (gradeRepository.findByIdBasic as jest.Mock).mockResolvedValue({ _id: 'grade-1', mentorId: 'other-mentor' });

      await expect(
        gradeService.delete('grade-1', 'mentor-1', 'mentor')
      ).rejects.toThrow('You can only delete grades you created');
    });

    it('should throw if grade not found', async () => {
      (gradeRepository.findByIdBasic as jest.Mock).mockResolvedValue(null);

      await expect(
        gradeService.delete('nonexistent', 'admin-1', 'system_admin')
      ).rejects.toThrow('Grade not found');
    });
  });

  describe('getByStudent', () => {
    it('should return grades for a student', async () => {
      (gradeRepository.findByStudent as jest.Mock).mockResolvedValue([{ _id: 'grade-1' }]);

      const result = await gradeService.getByStudent('student-1');

      expect(result).toHaveLength(1);
    });
  });

  describe('getByCourse', () => {
    it('should return grades for a course', async () => {
      (gradeRepository.findByCourse as jest.Mock).mockResolvedValue([{ _id: 'grade-1' }]);

      const result = await gradeService.getByCourse('course-1');

      expect(result).toHaveLength(1);
    });
  });

  describe('getByClass', () => {
    it('should return grades for a class', async () => {
      (gradeRepository.findByClass as jest.Mock).mockResolvedValue([{ _id: 'grade-1' }]);

      const result = await gradeService.getByClass('class-1');

      expect(result).toHaveLength(1);
    });
  });
});