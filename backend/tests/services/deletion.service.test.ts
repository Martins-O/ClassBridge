import { DeletionService } from '../../src/services/deletion.service';

jest.mock('../../src/repositories', () => ({
  __esModule: true,
  deletionRequestRepository: {
    findPending: jest.fn(),
    findById: jest.fn(),
    existsPendingForUser: jest.fn(),
    create: jest.fn(),
    updateById: jest.fn(),
  },
  userRepository: {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    updateById: jest.fn(),
  },
  notificationRepository: {
    create: jest.fn(),
  },
}));

jest.mock('../../src/lib/permissions', () => ({
  isSystemAdmin: jest.fn().mockReturnValue(false),
  isSchoolAdmin: jest.fn().mockReturnValue(true),
  canApproveDelete: jest.fn().mockReturnValue(true),
}));

jest.mock('../../src/models/User', () => ({
  UserRole: {
    STUDENT: 'student',
    MENTOR: 'mentor',
    SCHOOL_ADMIN: 'school_admin',
    SUPER_ADMIN: 'super_admin',
  },
}));

const { deletionRequestRepository, userRepository, notificationRepository } = require('../../src/repositories');
const { isSystemAdmin, isSchoolAdmin, canApproveDelete } = require('../../src/lib/permissions');

describe('DeletionService', () => {
  let deletionService: DeletionService;

  beforeEach(() => {
    deletionService = new DeletionService();
    jest.clearAllMocks();
  });

  describe('requestDeletion', () => {
    it('should return error if user not found', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue(null);

      const result = await deletionService.requestDeletion({
        userId: 'user-1',
        requestedBy: 'admin-1',
        schoolId: 'school-1',
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('User not found');
    });

    it('should return error if deletion already requested', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue({
        _id: 'user-1',
        deletionRequested: true,
      });

      const result = await deletionService.requestDeletion({
        userId: 'user-1',
        requestedBy: 'admin-1',
        schoolId: 'school-1',
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('A deletion request already exists for this user');
    });

    it('should return error if pending request exists', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue({
        _id: 'user-1',
        deletionRequested: false,
      });
      (deletionRequestRepository.existsPendingForUser as jest.Mock).mockResolvedValue(true);

      const result = await deletionService.requestDeletion({
        userId: 'user-1',
        requestedBy: 'admin-1',
        schoolId: 'school-1',
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('A deletion request is already pending for this user');
    });

    it('should return error if requesting own deletion', async () => {
      const result = await deletionService.requestDeletion({
        userId: 'user-1',
        requestedBy: 'user-1',
        schoolId: 'school-1',
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('You cannot request your own deletion');
    });

    it('should return error if requester not found', async () => {
      (userRepository.findById as jest.Mock)
        .mockResolvedValueOnce({ _id: 'user-1', deletionRequested: false })
        .mockResolvedValueOnce(null);

      const result = await deletionService.requestDeletion({
        userId: 'user-1',
        requestedBy: 'admin-1',
        schoolId: 'school-1',
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Requester not found');
    });

    it('should return error if different school', async () => {
      (userRepository.findById as jest.Mock)
        .mockResolvedValueOnce({ _id: 'user-1', deletionRequested: false, schoolId: 'school-1' })
        .mockResolvedValueOnce({ _id: 'admin-1', schoolId: 'school-2' });

      const result = await deletionService.requestDeletion({
        userId: 'user-1',
        requestedBy: 'admin-1',
        schoolId: 'school-1',
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('You can only request deletion of users in your school');
    });
  });

  describe('getPendingDeletions', () => {
    it('should return pending deletions', async () => {
      (deletionRequestRepository.findPending as jest.Mock).mockResolvedValue([{ _id: 'req-1' }]);

      const result = await deletionService.getPendingDeletions();

      expect(result).toHaveLength(1);
      expect(deletionRequestRepository.findPending).toHaveBeenCalled();
    });
  });

  describe('approveDeletion', () => {
    it('should return error if request not found', async () => {
      (deletionRequestRepository.findById as jest.Mock).mockResolvedValue(null);

      const result = await deletionService.approveDeletion('req-1', 'admin-1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Deletion request not found');
    });

    it('should return error if request already processed', async () => {
      (deletionRequestRepository.findById as jest.Mock).mockResolvedValue({ status: 'approved' });

      const result = await deletionService.approveDeletion('req-1', 'admin-1');

      expect(result.success).toBe(false);
    });
  });

  describe('rejectDeletion', () => {
    it('should return error if request not found', async () => {
      (deletionRequestRepository.findById as jest.Mock).mockResolvedValue(null);

      const result = await deletionService.rejectDeletion('req-1', 'admin-1', 'Not approved');

      expect(result.success).toBe(false);
    });
  });
});