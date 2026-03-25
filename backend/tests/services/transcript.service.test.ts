import { TranscriptService } from '../../src/services/transcript.service';

jest.mock('../../src/repositories', () => ({
  __esModule: true,
  transcriptRepository: {
    findAll: jest.fn(),
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
  userRepository: {
    findById: jest.fn(),
  },
}));

jest.mock('../../src/lib/permissions', () => ({
  isSystemAdmin: jest.fn().mockReturnValue(false),
  isSchoolAdmin: jest.fn().mockReturnValue(false),
  canViewOwnGradesOnly: jest.fn().mockReturnValue(true),
  canViewAllGrades: jest.fn().mockReturnValue(false),
  canApproveDelete: jest.fn().mockReturnValue(true),
  hasPermission: jest.fn().mockReturnValue(false),
  PERMISSIONS: {
    MANAGE_TRANSCRIPTS: 'manage_transcripts',
  },
}));

const { transcriptRepository, gradeRepository } = require('../../src/repositories');
const { isSystemAdmin, isSchoolAdmin, canViewOwnGradesOnly, canViewAllGrades, hasPermission } = require('../../src/lib/permissions');

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

  describe('getAll', () => {
    it('should return all transcripts for system admin', async () => {
      (isSystemAdmin as jest.Mock).mockReturnValue(true);
      (transcriptRepository.findAll as jest.Mock).mockResolvedValue([{ _id: 'transcript-1' }]);

      const result = await transcriptService.getAll('user-1', 'system_admin');

      expect(result).toHaveLength(1);
    });

    it('should return school transcripts for school admin', async () => {
      (isSystemAdmin as jest.Mock).mockReturnValue(false);
      (isSchoolAdmin as jest.Mock).mockReturnValue(true);
      (transcriptRepository.findBySchool as jest.Mock).mockResolvedValue([{ _id: 'transcript-1' }]);

      const result = await transcriptService.getAll('user-1', 'school_admin', 'school-1');

      expect(result).toHaveLength(1);
    });

    it('should return student transcripts for student', async () => {
      (isSystemAdmin as jest.Mock).mockReturnValue(false);
      (isSchoolAdmin as jest.Mock).mockReturnValue(false);
      (transcriptRepository.findByStudent as jest.Mock).mockResolvedValue([{ _id: 'transcript-1' }]);

      const result = await transcriptService.getAll('user-1', 'student');

      expect(result).toHaveLength(1);
    });
  });

  describe('canView', () => {
    it('should allow system admin to view any transcript', async () => {
      (isSystemAdmin as jest.Mock).mockReturnValue(true);
      (transcriptRepository.findById as jest.Mock).mockResolvedValue({ _id: 'transcript-1' });

      const result = await transcriptService.canView('user-1', 'system_admin', 'transcript-1', 'school-1');

      expect(result).toBe(true);
    });

    it('should deny when transcript not found', async () => {
      (transcriptRepository.findById as jest.Mock).mockResolvedValue(null);

      const result = await transcriptService.canView('user-1', 'student', 'transcript-1');

      expect(result).toBe(false);
    });

    it('should allow school admin to view school transcripts', async () => {
      (isSystemAdmin as jest.Mock).mockReturnValue(false);
      (canViewAllGrades as jest.Mock).mockReturnValue(true);
      (transcriptRepository.findById as jest.Mock).mockResolvedValue({ _id: 'transcript-1', schoolId: 'school-1' });

      const result = await transcriptService.canView('user-1', 'school_admin', 'transcript-1', 'school-1');

      expect(result).toBe(true);
    });
  });

  describe('canCreate', () => {
    it('should allow system admin to create', async () => {
      (isSystemAdmin as jest.Mock).mockReturnValue(true);

      const result = await transcriptService.canCreate('system_admin', 'school-1', 'school-2');

      expect(result).toBe(true);
    });

    it('should allow user with permission to create', async () => {
      (isSystemAdmin as jest.Mock).mockReturnValue(false);
      (hasPermission as jest.Mock).mockReturnValue(true);

      const result = await transcriptService.canCreate('school_admin', 'school-1', 'school-1');

      expect(result).toBe(true);
    });

    it('should deny when no permission', async () => {
      (isSystemAdmin as jest.Mock).mockReturnValue(false);
      (hasPermission as jest.Mock).mockReturnValue(false);

      const result = await transcriptService.canCreate('school_admin', 'school-1', 'school-2');

      expect(result).toBe(false);
    });
  });

  describe('canUpdate', () => {
    it('should check update permissions', async () => {
      (transcriptRepository.findById as jest.Mock).mockResolvedValue({ _id: 'transcript-1', schoolId: 'school-1' });
      (isSystemAdmin as jest.Mock).mockReturnValue(false);
      (hasPermission as jest.Mock).mockReturnValue(true);

      const result = await transcriptService.canUpdate('user-1', 'school_admin', 'transcript-1', 'school-1');

      expect(result).toBe(true);
    });
  });

});