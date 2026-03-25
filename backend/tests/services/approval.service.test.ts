import { ApprovalService } from '../../src/services/approval.service';

jest.mock('../../src/repositories', () => ({
  __esModule: true,
  approvalRepository: {
    findPending: jest.fn(),
    findById: jest.fn(),
    findBySchoolId: jest.fn(),
    findByRequester: jest.fn(),
    countPending: jest.fn(),
    create: jest.fn(),
    updateById: jest.fn(),
  },
  userRepository: {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    updateById: jest.fn(),
  },
  schoolRepository: {
    findByEmail: jest.fn(),
    create: jest.fn(),
    updateById: jest.fn(),
  },
  notificationRepository: {
    create: jest.fn(),
  },
}));

const { approvalRepository, userRepository, schoolRepository, notificationRepository } = require('../../src/repositories');

describe('ApprovalService', () => {
  let approvalService: ApprovalService;

  beforeEach(() => {
    approvalService = new ApprovalService();
    jest.clearAllMocks();
  });

  describe('requestSchool', () => {
    it('should create school request', async () => {
      (schoolRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (userRepository.create as jest.Mock).mockResolvedValue({ _id: 'user-1' });
      (schoolRepository.create as jest.Mock).mockResolvedValue({ _id: 'school-1' });
      (approvalRepository.create as jest.Mock).mockResolvedValue({ _id: 'approval-1' });
      (schoolRepository.updateById as jest.Mock).mockResolvedValue({});

      const result = await approvalService.requestSchool({
        name: 'New School',
        email: 'new@school.com',
        adminEmail: 'admin@school.com',
        adminName: 'Admin',
        adminPassword: 'password123',
      });

      expect(result.success).toBe(true);
      expect(result.schoolId).toBeDefined();
    });

    it('should fail if school email exists', async () => {
      (schoolRepository.findByEmail as jest.Mock).mockResolvedValue({ _id: 'school-1' });

      const result = await approvalService.requestSchool({
        name: 'New School',
        email: 'existing@school.com',
        adminEmail: 'admin@school.com',
        adminName: 'Admin',
        adminPassword: 'password123',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('getPendingApprovals', () => {
    it('should return pending approvals', async () => {
      (approvalRepository.findPending as jest.Mock).mockResolvedValue([{ _id: 'approval-1' }]);

      const result = await approvalService.getPendingApprovals();

expect(result).toHaveLength(1);
  });

  describe('rejectSchool', () => {
    it('should return error if approval not found', async () => {
      (approvalRepository.findById as jest.Mock).mockResolvedValue(null);

      const result = await approvalService.rejectSchool('approval-1', 'admin-1', 'Not approved');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Approval request not found');
    });

    it('should return error if already processed', async () => {
      (approvalRepository.findById as jest.Mock).mockResolvedValue({ status: 'approved' });

      const result = await approvalService.rejectSchool('approval-1', 'admin-1', 'Not approved');

      expect(result.success).toBe(false);
    });

    it('should reject school successfully', async () => {
      (approvalRepository.findById as jest.Mock).mockResolvedValue({
        _id: 'approval-1',
        status: 'pending',
        schoolId: 'school-1'
      });
      (approvalRepository.updateById as jest.Mock).mockResolvedValue({});
      (schoolRepository.updateById as jest.Mock).mockResolvedValue({});

      const result = await approvalService.rejectSchool('approval-1', 'admin-1', 'Not meeting standards');

      expect(result.success).toBe(true);
    });
  });

  describe('deleteApprovalRequest', () => {
    it('should return error if approval not found', async () => {
      (approvalRepository.findById as jest.Mock).mockResolvedValue(null);

      const result = await approvalService.deleteApprovalRequest('approval-1', 'admin-1');

      expect(result.success).toBe(false);
    });

    it('should delete request successfully', async () => {
      (approvalRepository.findById as jest.Mock).mockResolvedValue({ _id: 'approval-1' });
      (approvalRepository.updateById as jest.Mock).mockResolvedValue({});

      const result = await approvalService.deleteApprovalRequest('approval-1', 'admin-1');

      expect(result.success).toBe(true);
    });
  });

  describe('countPending', () => {
    it('should return pending count', async () => {
      (approvalRepository.countPending as jest.Mock).mockResolvedValue(5);

      const result = await approvalService.countPending();

      expect(result).toBe(5);
    });
  });
});

  describe('approveSchool', () => {
    it('should approve school', async () => {
      (approvalRepository.findById as jest.Mock).mockResolvedValue({ 
        _id: 'approval-1', 
        schoolId: 'school-1', 
        requestedBy: 'user-1',
        schoolName: 'Test School',
        status: 'pending'
      });
      (approvalRepository.updateById as jest.Mock).mockResolvedValue({});
      (schoolRepository.updateById as jest.Mock).mockResolvedValue({});
      (userRepository.updateById as jest.Mock).mockResolvedValue({});
      (userRepository.findById as jest.Mock).mockResolvedValue({ _id: 'user-1', email: 'admin@test.com' });
      (notificationRepository.create as jest.Mock).mockResolvedValue({});

      const result = await approvalService.approveSchool('approval-1', 'admin-1');

      expect(result.success).toBe(true);
    });

    it('should fail if approval not found', async () => {
      (approvalRepository.findById as jest.Mock).mockResolvedValue(null);

      const result = await approvalService.approveSchool('nonexistent', 'admin-1');

      expect(result.success).toBe(false);
    });
  });

  describe('rejectSchool', () => {
    it('should reject school', async () => {
      (approvalRepository.findById as jest.Mock).mockResolvedValue({ 
        _id: 'approval-1', 
        schoolId: 'school-1', 
        requestedBy: 'user-1',
        schoolName: 'Test School',
        status: 'pending'
      });
      (approvalRepository.updateById as jest.Mock).mockResolvedValue({});
      (schoolRepository.updateById as jest.Mock).mockResolvedValue({});
      (userRepository.findById as jest.Mock).mockResolvedValue({ _id: 'user-1', email: 'admin@test.com' });
      (notificationRepository.create as jest.Mock).mockResolvedValue({});

      const result = await approvalService.rejectSchool('approval-1', 'Not approved', 'admin-1');

      expect(result.success).toBe(true);
    });
  });

  describe('getPendingCount', () => {
    it('should return count', async () => {
      (approvalRepository.countPending as jest.Mock).mockResolvedValue(5);

      const result = await approvalService.getPendingCount();

      expect(result).toBe(5);
    });
  });
});