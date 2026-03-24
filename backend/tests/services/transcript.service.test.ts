import { TranscriptService } from '../../src/services/transcript.service';

jest.mock('../../src/repositories', () => ({
  __esModule: true,
  transcriptRepository: {
    findByStudent: jest.fn(),
    findBySchool: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    createBulk: jest.fn(),
    updateById: jest.fn(),
    deleteById: jest.fn(),
  },
  gradeRepository: {
    findByStudent: jest.fn(),
  },
}));

const { transcriptRepository, gradeRepository } = require('../../src/repositories');

describe('TranscriptService', () => {
  let transcriptService: TranscriptService;

  beforeEach(() => {
    transcriptService = new TranscriptService();
    jest.clearAllMocks();
  });

  describe('getByStudent', () => {
    it('should return transcripts for student', async () => {
      (transcriptRepository.findByStudent as jest.Mock).mockResolvedValue([
        { _id: 'transcript-1', studentId: 'student-1' }
      ]);

      const result = await transcriptService.getByStudent('student-1');

      expect(result).toHaveLength(1);
    });
  });

  describe('getBySchool', () => {
    it('should return transcripts for school', async () => {
      (transcriptRepository.findBySchool as jest.Mock).mockResolvedValue([
        { _id: 'transcript-1', schoolId: 'school-1' }
      ]);

      const result = await transcriptService.getBySchool('school-1');

      expect(result).toHaveLength(1);
    });
  });

  describe('getById', () => {
    it('should return transcript by id', async () => {
      (transcriptRepository.findById as jest.Mock).mockResolvedValue({ _id: 'transcript-1' });

      const result = await transcriptService.getById('transcript-1');

      expect(result).toHaveProperty('_id');
    });
  });

  describe('create', () => {
    it('should create transcript', async () => {
      (transcriptRepository.create as jest.Mock).mockResolvedValue({ _id: 'transcript-1' });

      const result = await transcriptService.create({
        studentId: 'student-1',
        schoolId: 'school-1',
        academicYear: '2024',
        semester: 'Fall',
        courses: [],
      });

      expect(result).toHaveProperty('_id');
    });
  });

  describe('update', () => {
    it('should update transcript', async () => {
      (transcriptRepository.updateById as jest.Mock).mockResolvedValue({ _id: 'transcript-1' });

      const result = await transcriptService.update('transcript-1', { courses: [] });

      expect(result).toHaveProperty('_id');
    });
  });

  describe('delete', () => {
    it('should delete transcript', async () => {
      (transcriptRepository.deleteById as jest.Mock).mockResolvedValue(true);

      const result = await transcriptService.delete('transcript-1');

      expect(result).toBe(true);
    });
  });

});