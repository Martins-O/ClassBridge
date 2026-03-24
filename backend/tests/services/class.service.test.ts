import { ClassService } from '../../src/services/class.service';

jest.mock('../../src/repositories', () => ({
  __esModule: true,
  classRepository: {
    findAllPaginated: jest.fn(),
    countAll: jest.fn(),
    findBySchoolPaginated: jest.fn(),
    countBySchool: jest.fn(),
    findByMentorPaginated: jest.fn(),
    countByMentor: jest.fn(),
    findByStudentPaginated: jest.fn(),
    countByStudent: jest.fn(),
    findById: jest.fn(),
    findByIdBasic: jest.fn(),
    create: jest.fn(),
    updateById: jest.fn(),
    deleteById: jest.fn(),
    addStudent: jest.fn(),
    removeStudent: jest.fn(),
  },
  schoolRepository: {
    findByIdBasic: jest.fn(),
  },
}));

const { classRepository, schoolRepository } = require('../../src/repositories');

describe('ClassService', () => {
  let classService: ClassService;

  beforeEach(() => {
    classService = new ClassService();
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all classes for system_admin', async () => {
      (classRepository.findAllPaginated as jest.Mock).mockResolvedValue([{ _id: 'class-1' }]);
      (classRepository.countAll as jest.Mock).mockResolvedValue(1);

      const result = await classService.getAll('admin-1', 'system_admin', undefined, 1, 20);

      expect(result.classes).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should return classes for school_admin', async () => {
      (classRepository.findBySchoolPaginated as jest.Mock).mockResolvedValue([{ _id: 'class-1' }]);
      (classRepository.countBySchool as jest.Mock).mockResolvedValue(1);

      const result = await classService.getAll('admin-1', 'school_admin', 'school-1', 1, 20);

      expect(result.classes).toHaveLength(1);
    });

    it('should return classes for mentor', async () => {
      (classRepository.findByMentorPaginated as jest.Mock).mockResolvedValue([{ _id: 'class-1' }]);
      (classRepository.countByMentor as jest.Mock).mockResolvedValue(1);

      const result = await classService.getAll('mentor-1', 'mentor', undefined, 1, 20);

      expect(result.classes).toHaveLength(1);
      expect(classRepository.findByMentorPaginated).toHaveBeenCalledWith('mentor-1', 0, 20);
    });

    it('should return classes for student', async () => {
      (classRepository.findByStudentPaginated as jest.Mock).mockResolvedValue([{ _id: 'class-1' }]);
      (classRepository.countByStudent as jest.Mock).mockResolvedValue(1);

      const result = await classService.getAll('student-1', 'student', undefined, 1, 20);

      expect(result.classes).toHaveLength(1);
    });

    it('should return empty for other roles', async () => {
      const result = await classService.getAll('user-1', 'admissions', undefined, 1, 20);

      expect(result.classes).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('getById', () => {
    it('should return class by id', async () => {
      (classRepository.findById as jest.Mock).mockResolvedValue({ _id: 'class-1', name: 'Test Class' });

      const result = await classService.getById('class-1');

      expect(result).toHaveProperty('name', 'Test Class');
    });
  });

  describe('create', () => {
    const classData = {
      name: 'New Class',
      schoolId: 'school-1',
      academicYear: '2024',
      duration: 'semester',
      cohort: 'Fall 2024',
    };

    it('should create class for school_admin', async () => {
      (schoolRepository.findByIdBasic as jest.Mock).mockResolvedValue({ _id: 'school-1' });
      (classRepository.create as jest.Mock).mockResolvedValue({ _id: 'class-1', ...classData });

      const result = await classService.create(classData, 'school_admin', 'school-1');

      expect(result).toHaveProperty('_id');
    });

    it('should throw if school not found', async () => {
      (schoolRepository.findByIdBasic as jest.Mock).mockResolvedValue(null);

      await expect(
        classService.create(classData, 'school_admin', 'school-1')
      ).rejects.toThrow('School not found');
    });

    it('should throw if school_admin tries to create for different school', async () => {
      await expect(
        classService.create({ ...classData, schoolId: 'school-2' }, 'school_admin', 'school-1')
      ).rejects.toThrow('You can only create classes for your own school');
    });

    it('should allow system_admin to create', async () => {
      (schoolRepository.findByIdBasic as jest.Mock).mockResolvedValue({ _id: 'school-1' });
      (classRepository.create as jest.Mock).mockResolvedValue({ _id: 'class-1', ...classData });

      const result = await classService.create(classData, 'system_admin', undefined);

      expect(result).toHaveProperty('name');
    });
  });

  describe('update', () => {
    it('should update class for system_admin', async () => {
      (classRepository.findByIdBasic as jest.Mock).mockResolvedValue({ _id: 'class-1', schoolId: 'school-1' });
      (classRepository.updateById as jest.Mock).mockResolvedValue({ _id: 'class-1', name: 'Updated' });

      const result = await classService.update('class-1', { name: 'Updated' }, 'system_admin');

      expect(result).toHaveProperty('name', 'Updated');
    });

    it('should update class for school_admin in same school', async () => {
      (classRepository.findByIdBasic as jest.Mock).mockResolvedValue({ _id: 'class-1', schoolId: 'school-1' });
      (classRepository.updateById as jest.Mock).mockResolvedValue({ _id: 'class-1', name: 'Updated' });

      const result = await classService.update('class-1', { name: 'Updated' }, 'school_admin', 'school-1');

      expect(result).toHaveProperty('name', 'Updated');
    });

    it('should throw if class not found', async () => {
      (classRepository.findByIdBasic as jest.Mock).mockResolvedValue(null);

      await expect(
        classService.update('nonexistent', {}, 'system_admin')
      ).rejects.toThrow('Class not found');
    });

    it('should throw if school_admin tries to update different school', async () => {
      (classRepository.findByIdBasic as jest.Mock).mockResolvedValue({ _id: 'class-1', schoolId: 'school-2' });

      await expect(
        classService.update('class-1', {}, 'school_admin', 'school-1')
      ).rejects.toThrow('Only administrators can update classes');
    });
  });

  describe('delete', () => {
    it('should delete class', async () => {
      (classRepository.deleteById as jest.Mock).mockResolvedValue(true);

      const result = await classService.delete('class-1');

      expect(result).toBe(true);
    });
  });

  describe('addStudents', () => {
    it('should add students to class', async () => {
      (classRepository.addStudent as jest.Mock).mockResolvedValue({ _id: 'class-1' });

      const result = await classService.addStudents('class-1', ['student-1', 'student-2']);

      expect(classRepository.addStudent).toHaveBeenCalledWith('class-1', ['student-1', 'student-2']);
    });
  });

  describe('removeStudent', () => {
    it('should remove student from class', async () => {
      (classRepository.removeStudent as jest.Mock).mockResolvedValue({ _id: 'class-1' });

      const result = await classService.removeStudent('class-1', 'student-1');

      expect(classRepository.removeStudent).toHaveBeenCalledWith('class-1', 'student-1');
    });
  });

  describe('getStudents', () => {
    it('should return students for class', async () => {
      (classRepository.findById as jest.Mock).mockResolvedValue({ studentIds: ['student-1', 'student-2'] });

      const result = await classService.getStudents('class-1');

      expect(result).toHaveLength(2);
    });

    it('should return empty array if class not found', async () => {
      (classRepository.findById as jest.Mock).mockResolvedValue(null);

      const result = await classService.getStudents('nonexistent');

      expect(result).toEqual([]);
    });
  });
});