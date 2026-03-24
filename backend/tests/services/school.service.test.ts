import { SchoolService } from '../../src/services/school.service';

const { isSystemAdmin } = require('../../src/lib/permissions');
const { schoolRepository, userRepository } = require('../../src/repositories');

jest.mock('../../src/repositories', () => ({
  __esModule: true,
  schoolRepository: {
    findAllPaginated: jest.fn(),
    countAll: jest.fn(),
    findByAdminPaginated: jest.fn(),
    countByAdmin: jest.fn(),
    findById: jest.fn(),
    findByIdBasic: jest.fn(),
    findAll: jest.fn(),
    findByAdmin: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    updateById: jest.fn(),
    deleteById: jest.fn(),
  },
  userRepository: {
    findById: jest.fn(),
    updateById: jest.fn(),
  },
}));

jest.mock('../../src/lib/permissions', () => ({
  __esModule: true,
  isSystemAdmin: jest.fn(),
}));

describe('SchoolService', () => {
  let schoolService: SchoolService;

  beforeEach(() => {
    schoolService = new SchoolService();
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all schools for system_admin', async () => {
      isSystemAdmin.mockReturnValue(true);
      (schoolRepository.findAllPaginated as jest.Mock).mockResolvedValue([{ _id: 'school-1' }]);
      (schoolRepository.countAll as jest.Mock).mockResolvedValue(1);

      const result = await schoolService.getAll('admin-1', 'system_admin', 1, 20, {});

      expect(result.schools).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should return own schools for school_admin', async () => {
      isSystemAdmin.mockReturnValue(false);
      (schoolRepository.findByAdminPaginated as jest.Mock).mockResolvedValue([{ _id: 'school-1' }]);
      (schoolRepository.countByAdmin as jest.Mock).mockResolvedValue(1);

      const result = await schoolService.getAll('admin-1', 'school_admin', 1, 20, {});

      expect(result.schools).toHaveLength(1);
      expect(schoolRepository.findByAdminPaginated).toHaveBeenCalledWith('admin-1', 0, 20, { status: 'approved' });
    });

    it('should return empty array for other roles', async () => {
      const result = await schoolService.getAll('user-1', 'student', 1, 20, {});

      expect(result.schools).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('getApprovedSchools', () => {
    it('should return approved schools with pagination', async () => {
      (schoolRepository.findAllPaginated as jest.Mock).mockResolvedValue([{ _id: 'school-1', status: 'approved' }]);
      (schoolRepository.countAll as jest.Mock).mockResolvedValue(1);

      const result = await schoolService.getApprovedSchools(1, 20, {});

      expect(result.schools).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(schoolRepository.findAllPaginated).toHaveBeenCalledWith(0, 20, { status: 'approved' });
    });
  });

  describe('getById', () => {
    it('should return school by id', async () => {
      (schoolRepository.findById as jest.Mock).mockResolvedValue({ _id: 'school-1', name: 'Test School' });

      const result = await schoolService.getById('school-1');

      expect(result).toHaveProperty('name', 'Test School');
    });
  });

  describe('getByIdBasic', () => {
    it('should return basic school info', async () => {
      (schoolRepository.findByIdBasic as jest.Mock).mockResolvedValue({ _id: 'school-1', status: 'approved' });

      const result = await schoolService.getByIdBasic('school-1');

      expect(result).toHaveProperty('status', 'approved');
    });
  });

  describe('getStatus', () => {
    it('should return school status', async () => {
      (schoolRepository.findByIdBasic as jest.Mock).mockResolvedValue({ status: 'approved', rejectionReason: undefined });

      const result = await schoolService.getStatus('school-1');

      expect(result).toHaveProperty('status', 'approved');
    });

    it('should return null if school not found', async () => {
      (schoolRepository.findByIdBasic as jest.Mock).mockResolvedValue(null);

      const result = await schoolService.getStatus('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('isApproved', () => {
    it('should return true for approved school', async () => {
      (schoolRepository.findByIdBasic as jest.Mock).mockResolvedValue({ status: 'approved' });

      const result = await schoolService.isApproved('school-1');

      expect(result).toBe(true);
    });

    it('should return false for non-approved school', async () => {
      (schoolRepository.findByIdBasic as jest.Mock).mockResolvedValue({ status: 'pending' });

      const result = await schoolService.isApproved('school-1');

      expect(result).toBe(false);
    });
  });

  describe('createDirect', () => {
    it('should create a new school and update admin', async () => {
      (schoolRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (schoolRepository.create as jest.Mock).mockResolvedValue({ _id: 'school-1', name: 'New School' });
      (userRepository.updateById as jest.Mock).mockResolvedValue({});

      const result = await schoolService.createDirect({
        name: 'New School',
        email: 'new@test.com',
        adminId: 'user-1',
        status: 'approved',
      });

      expect(result).toHaveProperty('_id', 'school-1');
      expect(userRepository.updateById).toHaveBeenCalledWith('user-1', {
        role: 'school_admin',
        schoolId: 'school-1',
        isApproved: true,
      });
    });

    it('should throw if email already exists', async () => {
      (schoolRepository.findByEmail as jest.Mock).mockResolvedValue({ email: 'existing@test.com' });

      await expect(
        schoolService.createDirect({
          name: 'New School',
          email: 'existing@test.com',
          adminId: 'user-1',
        })
      ).rejects.toThrow('School with this email already exists');
    });
  });

  describe('canAccess', () => {
    it('should allow system_admin to access any school', async () => {
      isSystemAdmin.mockReturnValue(true);

      const result = await schoolService.canAccess('admin-1', 'system_admin', 'school-1');

      expect(result).toBe(true);
    });

    it('should allow school_admin to access their own approved school', async () => {
      isSystemAdmin.mockReturnValue(false);
      (schoolRepository.findByIdBasic as jest.Mock).mockResolvedValue({ adminId: 'admin-1', status: 'approved' });

      const result = await schoolService.canAccess('admin-1', 'school_admin', 'school-1');

      expect(result).toBe(true);
    });

    it('should deny school_admin access to non-owned school', async () => {
      isSystemAdmin.mockReturnValue(false);
      (schoolRepository.findByIdBasic as jest.Mock).mockResolvedValue({ adminId: 'other-admin', status: 'approved' });

      const result = await schoolService.canAccess('admin-1', 'school_admin', 'school-1');

      expect(result).toBe(false);
    });

    it('should deny access to pending school', async () => {
      isSystemAdmin.mockReturnValue(false);
      (schoolRepository.findByIdBasic as jest.Mock).mockResolvedValue({ adminId: 'admin-1', status: 'pending' });

      const result = await schoolService.canAccess('admin-1', 'school_admin', 'school-1');

      expect(result).toBe(false);
    });

    it('should allow regular user to access school they belong to', async () => {
      isSystemAdmin.mockReturnValue(false);
      (schoolRepository.findByIdBasic as jest.Mock).mockResolvedValue({});
      (userRepository.findById as jest.Mock).mockResolvedValue({ schoolId: 'school-1' });

      const result = await schoolService.canAccess('user-1', 'student', 'school-1');

      expect(result).toBe(true);
    });
  });

  describe('update', () => {
    it('should allow system_admin to update any school', async () => {
      isSystemAdmin.mockReturnValue(true);
      (schoolRepository.findByIdBasic as jest.Mock).mockResolvedValue({ _id: 'school-1', email: 'old@test.com' });
      (schoolRepository.updateById as jest.Mock).mockResolvedValue({});

      await schoolService.update('school-1', { name: 'Updated' }, 'system_admin');

      expect(schoolRepository.updateById).toHaveBeenCalled();
    });

    it('should allow school_admin to update their own school', async () => {
      isSystemAdmin.mockReturnValue(false);
      (schoolRepository.findByIdBasic as jest.Mock).mockResolvedValue({ _id: 'school-1', email: 'test@test.com' });
      (schoolRepository.updateById as jest.Mock).mockResolvedValue({});

      await schoolService.update('school-1', { name: 'Updated' }, 'school_admin', 'school-1');

      expect(schoolRepository.updateById).toHaveBeenCalled();
    });

    it('should throw if school not found', async () => {
      (schoolRepository.findByIdBasic as jest.Mock).mockResolvedValue(null);

      await expect(
        schoolService.update('nonexistent', {}, 'system_admin')
      ).rejects.toThrow('School not found');
    });

    it('should throw if access denied', async () => {
      isSystemAdmin.mockReturnValue(false);
      (schoolRepository.findByIdBasic as jest.Mock).mockResolvedValue({ _id: 'school-1' });

      await expect(
        schoolService.update('school-1', {}, 'school_admin', 'different-school')
      ).rejects.toThrow('Access denied');
    });

    it('should throw if email already in use', async () => {
      isSystemAdmin.mockReturnValue(true);
      (schoolRepository.findByIdBasic as jest.Mock).mockResolvedValue({ _id: 'school-1', email: 'old@test.com' });
      (schoolRepository.findByEmail as jest.Mock).mockResolvedValue({ _id: 'school-2' });

      await expect(
        schoolService.update('school-1', { email: 'existing@test.com' }, 'system_admin')
      ).rejects.toThrow('Email already in use by another school');
    });
  });

  describe('delete', () => {
    it('should delete school', async () => {
      (schoolRepository.deleteById as jest.Mock).mockResolvedValue(true);

      const result = await schoolService.delete('school-1');

      expect(result).toBe(true);
    });
  });

  describe('getForUser', () => {
    it('should return all schools for system_admin', async () => {
      isSystemAdmin.mockReturnValue(true);
      (schoolRepository.findAll as jest.Mock).mockResolvedValue([{ _id: 'school-1' }]);

      const result = await schoolService.getForUser('admin-1', 'system_admin');

      expect(result).toHaveLength(1);
      expect(schoolRepository.findAll).toHaveBeenCalled();
    });

    it('should return schools for school_admin', async () => {
      isSystemAdmin.mockReturnValue(false);
      (schoolRepository.findByAdmin as jest.Mock).mockResolvedValue([{ _id: 'school-1' }]);

      const result = await schoolService.getForUser('admin-1', 'school_admin');

      expect(result).toHaveLength(1);
      expect(schoolRepository.findByAdmin).toHaveBeenCalledWith('admin-1');
    });

    it('should return empty for other roles', async () => {
      const result = await schoolService.getForUser('user-1', 'student');

      expect(result).toHaveLength(0);
    });
  });
});