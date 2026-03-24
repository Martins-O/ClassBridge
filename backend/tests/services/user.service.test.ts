import { UserService } from '../../src/services/user.service';
import { userRepository } from '../../src/repositories';

jest.mock('../../src/repositories', () => ({
  __esModule: true,
  userRepository: {
    findById: jest.fn(),
    findByIdWithPassword: jest.fn(),
    findAll: jest.fn(),
    findBySchool: jest.fn(),
    findMentorsBySchool: jest.fn(),
    findStudentsBySchool: jest.fn(),
    findStudentsByClass: jest.fn(),
    updateById: jest.fn(),
    deleteById: jest.fn(),
    addClassToUser: jest.fn(),
    removeClassFromUser: jest.fn(),
    count: jest.fn(),
  },
}));

jest.mock('../../src/services/school.service', () => ({
  __esModule: true,
  schoolService: {
    getById: jest.fn(),
  },
}));

jest.mock('bcryptjs', () => ({
  __esModule: true,
  default: {
    hash: jest.fn().mockResolvedValue('hashed-password'),
  },
}));

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    jest.clearAllMocks();
  });

  describe('getById', () => {
    it('should return user by id', async () => {
      const mockUser = { _id: 'user-1', name: 'Test User', email: 'test@example.com' };
      (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.getById('user-1');

      expect(result).toEqual(mockUser);
      expect(userRepository.findById).toHaveBeenCalledWith('user-1');
    });

    it('should return undefined for non-existent user', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue(null);

      const result = await userService.getById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getByIdWithPassword', () => {
    it('should return user with password', async () => {
      const mockUser = { _id: 'user-1', password: 'hashed-pw' };
      (userRepository.findByIdWithPassword as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.getByIdWithPassword('user-1');

      expect(result).toEqual(mockUser);
    });
  });

  describe('getAll', () => {
    it('should return all users', async () => {
      const mockUsers = [{ _id: 'user-1' }, { _id: 'user-2' }];
      (userRepository.findAll as jest.Mock).mockResolvedValue(mockUsers);

      const result = await userService.getAll();

      expect(result).toEqual(mockUsers);
    });
  });

  describe('getBySchool', () => {
    it('should return active users by school', async () => {
      const mockUsers = [{ _id: 'user-1', schoolId: 'school-1' }];
      (userRepository.findBySchool as jest.Mock).mockResolvedValue(mockUsers);

      const result = await userService.getBySchool('school-1');

      expect(result).toEqual(mockUsers);
      expect(userRepository.findBySchool).toHaveBeenCalledWith('school-1');
    });

    it('should include inactive users when flag is true', async () => {
      (userRepository.findBySchool as jest.Mock).mockResolvedValue([]);

      await userService.getBySchool('school-1', true);

      expect(userRepository.findBySchool).toHaveBeenCalledWith('school-1');
    });
  });

  describe('getMentorsBySchool', () => {
    it('should return mentors for a school', async () => {
      const mockMentors = [{ _id: 'mentor-1', role: 'mentor' }];
      (userRepository.findMentorsBySchool as jest.Mock).mockResolvedValue(mockMentors);

      const result = await userService.getMentorsBySchool('school-1');

      expect(result).toEqual(mockMentors);
    });
  });

  describe('getStudentsBySchool', () => {
    it('should return students for a school', async () => {
      const mockStudents = [{ _id: 'student-1', role: 'student' }];
      (userRepository.findStudentsBySchool as jest.Mock).mockResolvedValue(mockStudents);

      const result = await userService.getStudentsBySchool('school-1');

      expect(result).toEqual(mockStudents);
    });
  });

  describe('getStudentsByClass', () => {
    it('should return students for a class', async () => {
      const mockStudents = [{ _id: 'student-1', classIds: ['class-1'] }];
      (userRepository.findStudentsByClass as jest.Mock).mockResolvedValue(mockStudents);

      const result = await userService.getStudentsByClass('class-1');

      expect(result).toEqual(mockStudents);
    });
  });

  describe('update', () => {
    it('should update user without hashing password if not provided', async () => {
      (userRepository.updateById as jest.Mock).mockResolvedValue({ _id: 'user-1', name: 'Updated' });

      const result = await userService.update('user-1', { name: 'Updated' });

      expect(result).toHaveProperty('name', 'Updated');
    });

    it('should hash password before updating', async () => {
      (userRepository.updateById as jest.Mock).mockResolvedValue({ _id: 'user-1' });

      await userService.update('user-1', { password: 'newpassword' });

      expect(userRepository.updateById).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({ password: 'hashed-password' })
      );
    });
  });

  describe('delete', () => {
    it('should return true on successful deletion', async () => {
      (userRepository.deleteById as jest.Mock).mockResolvedValue(true);

      const result = await userService.delete('user-1');

      expect(result).toBe(true);
    });

    it('should return false if user not found', async () => {
      (userRepository.deleteById as jest.Mock).mockResolvedValue(false);

      const result = await userService.delete('nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('addClassToUser', () => {
    it('should add class to user', async () => {
      (userRepository.addClassToUser as jest.Mock).mockResolvedValue({ _id: 'user-1' });

      const result = await userService.addClassToUser('user-1', 'class-1');

      expect(userRepository.addClassToUser).toHaveBeenCalledWith('user-1', 'class-1');
    });
  });

  describe('removeClassFromUser', () => {
    it('should remove class from user', async () => {
      (userRepository.removeClassFromUser as jest.Mock).mockResolvedValue({ _id: 'user-1' });

      const result = await userService.removeClassFromUser('user-1', 'class-1');

      expect(userRepository.removeClassFromUser).toHaveBeenCalledWith('user-1', 'class-1');
    });
  });

  describe('count', () => {
    it('should return user count', async () => {
      (userRepository.count as jest.Mock).mockResolvedValue(10);

      const result = await userService.count({ role: 'student' });

      expect(result).toBe(10);
    });
  });

  describe('isDeletionPending', () => {
    it('should return true if deletion is pending', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue({ deletionRequested: true });

      const result = await userService.isDeletionPending('user-1');

      expect(result).toBe(true);
    });

    it('should return false if deletion is not pending', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue({ deletionRequested: false });

      const result = await userService.isDeletionPending('user-1');

      expect(result).toBe(false);
    });
  });

  describe('canAccess', () => {
    it('should allow self-access', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue({ _id: 'user-1', role: 'student' });

      const result = await userService.canAccess('user-1', 'user-1');

      expect(result).toBe(true);
    });

    it('should allow system_admin to access any user', async () => {
      (userRepository.findById as jest.Mock)
        .mockResolvedValueOnce({ _id: 'admin-1', role: 'system_admin' })
        .mockResolvedValueOnce({ _id: 'user-2', role: 'student' });

      const result = await userService.canAccess('admin-1', 'user-2');

      expect(result).toBe(true);
    });

    it('should allow school_admin to access users in same school', async () => {
      (userRepository.findById as jest.Mock)
        .mockResolvedValueOnce({ _id: 'admin-1', role: 'school_admin', schoolId: 'school-1' })
        .mockResolvedValueOnce({ _id: 'user-2', role: 'student', schoolId: 'school-1' });

      const result = await userService.canAccess('admin-1', 'user-2');

      expect(result).toBe(true);
    });

    it('should deny school_admin access to users in different school', async () => {
      (userRepository.findById as jest.Mock)
        .mockResolvedValueOnce({ _id: 'admin-1', role: 'school_admin', schoolId: 'school-1' })
        .mockResolvedValueOnce({ _id: 'user-2', role: 'student', schoolId: 'school-2' });

      const result = await userService.canAccess('admin-1', 'user-2');

      expect(result).toBe(false);
    });

    it('should deny non-admin to access other users', async () => {
      (userRepository.findById as jest.Mock)
        .mockResolvedValueOnce({ _id: 'user-1', role: 'student', schoolId: 'school-1' })
        .mockResolvedValueOnce({ _id: 'user-2', role: 'student', schoolId: 'school-1' });

      const result = await userService.canAccess('user-1', 'user-2');

      expect(result).toBe(false);
    });
  });

  describe('canManage', () => {
    it('should allow system_admin to manage any user', async () => {
      (userRepository.findById as jest.Mock)
        .mockResolvedValueOnce({ _id: 'admin-1', role: 'system_admin' })
        .mockResolvedValueOnce({ _id: 'user-2', role: 'mentor' });

      const result = await userService.canManage('admin-1', 'user-2');

      expect(result).toBe(true);
    });

    it('should allow school_admin to manage same-school users (except admins)', async () => {
      (userRepository.findById as jest.Mock)
        .mockResolvedValueOnce({ _id: 'admin-1', role: 'school_admin', schoolId: 'school-1' })
        .mockResolvedValueOnce({ _id: 'mentor-1', role: 'mentor', schoolId: 'school-1' });

      const result = await userService.canManage('admin-1', 'mentor-1');

      expect(result).toBe(true);
    });

    it('should deny school_admin to manage system_admin', async () => {
      (userRepository.findById as jest.Mock)
        .mockResolvedValueOnce({ _id: 'admin-1', role: 'school_admin', schoolId: 'school-1' })
        .mockResolvedValueOnce({ _id: 'sys-admin', role: 'system_admin' });

      const result = await userService.canManage('admin-1', 'sys-admin');

      expect(result).toBe(false);
    });

    it('should deny school_admin to manage another school_admin', async () => {
      (userRepository.findById as jest.Mock)
        .mockResolvedValueOnce({ _id: 'admin-1', role: 'school_admin', schoolId: 'school-1' })
        .mockResolvedValueOnce({ _id: 'admin-2', role: 'school_admin', schoolId: 'school-2' });

      const result = await userService.canManage('admin-1', 'admin-2');

      expect(result).toBe(false);
    });
  });

  describe('getActiveUsersBySchool', () => {
    it('should return active users excluding pending deletion', async () => {
      (userRepository.findAll as jest.Mock).mockResolvedValue([]);

      await userService.getActiveUsersBySchool('school-1');

      expect(userRepository.findAll).toHaveBeenCalledWith({
        schoolId: 'school-1',
        isActive: true,
        deletionRequested: false,
      });
    });
  });

  describe('getActiveStudentCount', () => {
    it('should return count of active students', async () => {
      (userRepository.count as jest.Mock).mockResolvedValue(50);

      const result = await userService.getActiveStudentCount('school-1');

      expect(result).toBe(50);
      expect(userRepository.count).toHaveBeenCalledWith({
        schoolId: 'school-1',
        role: 'student',
        isActive: true,
      });
    });
  });

  describe('getActiveMentorCount', () => {
    it('should return count of active mentors', async () => {
      (userRepository.count as jest.Mock).mockResolvedValue(10);

      const result = await userService.getActiveMentorCount('school-1');

      expect(result).toBe(10);
      expect(userRepository.count).toHaveBeenCalledWith({
        schoolId: 'school-1',
        role: 'mentor',
        isActive: true,
      });
    });
  });
});