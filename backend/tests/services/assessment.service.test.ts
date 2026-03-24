import { AssessmentService } from '../../src/services/assessment.service';

jest.mock('../../src/repositories', () => ({
  __esModule: true,
  assessmentRepository: {
    findAll: jest.fn(),
    findByMentor: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    updateById: jest.fn(),
    deleteById: jest.fn(),
  },
  assessmentAttemptRepository: {
    findByAssessment: jest.fn(),
    create: jest.fn(),
    updateById: jest.fn(),
    findById: jest.fn(),
  },
}));

const { assessmentRepository, assessmentAttemptRepository } = require('../../src/repositories');

describe('AssessmentService', () => {
  let assessmentService: AssessmentService;

  beforeEach(() => {
    assessmentService = new AssessmentService();
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all assessments for system_admin', async () => {
      (assessmentRepository.findAll as jest.Mock).mockResolvedValue([{ _id: 'assessment-1' }]);

      const result = await assessmentService.getAll('admin-1', 'system_admin');

      expect(result).toHaveLength(1);
    });

    it('should return all assessments for school_admin', async () => {
      (assessmentRepository.findAll as jest.Mock).mockResolvedValue([{ _id: 'assessment-1' }]);

      const result = await assessmentService.getAll('admin-1', 'school_admin');

      expect(result).toHaveLength(1);
    });

    it('should return assessments for mentor', async () => {
      (assessmentRepository.findByMentor as jest.Mock).mockResolvedValue([{ _id: 'assessment-1' }]);

      const result = await assessmentService.getAll('mentor-1', 'mentor');

      expect(result).toHaveLength(1);
    });

    it('should return empty for student', async () => {
      const result = await assessmentService.getAll('student-1', 'student');

      expect(result).toHaveLength(0);
    });
  });

  describe('getById', () => {
    it('should return assessment by id', async () => {
      (assessmentRepository.findById as jest.Mock).mockResolvedValue({ _id: 'assessment-1', title: 'Test' });

      const result = await assessmentService.getById('assessment-1');

      expect(result).toHaveProperty('title', 'Test');
    });
  });

  describe('create', () => {
    it('should create assessment', async () => {
      (assessmentRepository.create as jest.Mock).mockResolvedValue({ _id: 'assessment-1' });

      const result = await assessmentService.create({
        title: 'Test Assessment',
        classId: 'class-1',
        mentorId: 'mentor-1',
        academicYear: '2024',
        assessmentType: 'peer',
        questions: [],
      });

      expect(result).toHaveProperty('_id');
    });
  });

  describe('update', () => {
    it('should update assessment', async () => {
      (assessmentRepository.updateById as jest.Mock).mockResolvedValue({ _id: 'assessment-1', title: 'Updated' });

      const result = await assessmentService.update('assessment-1', { title: 'Updated' });

      expect(result).toHaveProperty('title', 'Updated');
    });
  });

  describe('delete', () => {
    it('should delete assessment', async () => {
      (assessmentRepository.deleteById as jest.Mock).mockResolvedValue(true);

      const result = await assessmentService.delete('assessment-1');

      expect(result).toBe(true);
    });
  });

  describe('getAttempts', () => {
    it('should return attempts for assessment', async () => {
      (assessmentAttemptRepository.findByAssessment as jest.Mock).mockResolvedValue([{ _id: 'attempt-1' }]);

      const result = await assessmentService.getAttempts('assessment-1');

      expect(result).toHaveLength(1);
    });
  });

  describe('createAttempt', () => {
    it('should create attempt', async () => {
      (assessmentAttemptRepository.create as jest.Mock).mockResolvedValue({ _id: 'attempt-1' });

      const result = await assessmentService.createAttempt({
        assessmentId: 'assessment-1',
        studentId: 'student-1',
      });

      expect(result).toHaveProperty('_id');
    });
  });

  describe('updateAttempt', () => {
    it('should update attempt', async () => {
      (assessmentAttemptRepository.updateById as jest.Mock).mockResolvedValue({ _id: 'attempt-1' });

      const result = await assessmentService.updateAttempt('attempt-1', { isSubmitted: true });

      expect(result).toHaveProperty('_id');
    });
  });

  describe('getAttempt', () => {
    it('should return attempt by id', async () => {
      (assessmentAttemptRepository.findById as jest.Mock).mockResolvedValue({ _id: 'attempt-1' });

      const result = await assessmentService.getAttempt('attempt-1');

      expect(result).toHaveProperty('_id');
    });
  });
});