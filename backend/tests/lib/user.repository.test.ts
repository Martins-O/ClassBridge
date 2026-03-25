import mongoose from 'mongoose';
import { userRepository } from '../../src/repositories';

jest.mock('../../src/models/User', () => ({
  default: {
    findOne: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
  },
}));

const User = require('../../src/models/User').default;

describe('userRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      (User.findOne as jest.Mock).mockResolvedValue({ _id: 'user-1', email: 'test@test.com' });

      const result = await userRepository.findByEmail('test@test.com');

      expect(result).toBeDefined();
      expect(User.findOne).toHaveBeenCalled();
    });

    it('should return null if not found', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const result = await userRepository.findByEmail('notfound@test.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      (User.findById as jest.Mock).mockResolvedValue({ _id: 'user-1' });

      const result = await userRepository.findById('user-1');

      expect(result).toBeDefined();
    });

    it('should return null for invalid id', async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);

      const result = await userRepository.findById('invalid');

      expect(result).toBeNull();
    });
  });

  describe('find', () => {
    it('should find users with query', async () => {
      (User.find as jest.Mock).mockReturnValue({ sort: jest.fn().mockReturnValue({ limit: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([{ _id: 'user-1' }]) }) }) });

      const result = await userRepository.find({ role: 'student' });

      expect(result).toHaveLength(1);
    });
  });

  describe('create', () => {
    it('should create user', async () => {
      (User.findOne as jest.Mock).mockResolvedValueOnce(null);
      (User.create as jest.Mock).mockResolvedValue({ _id: 'user-1' });

      const result = await userRepository.create({
        email: 'new@test.com',
        password: 'password123',
        name: 'New User',
        role: 'student'
      });

      expect(result).toBeDefined();
    });
  });

  describe('updateById', () => {
    it('should update user', async () => {
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue({ _id: 'user-1', name: 'Updated' });

      const result = await userRepository.updateById('user-1', { name: 'Updated' });

      expect(result).toBeDefined();
    });
  });

  describe('deleteById', () => {
    it('should delete user', async () => {
      (User.findByIdAndDelete as jest.Mock).mockResolvedValue({ _id: 'user-1' });

      const result = await userRepository.deleteById('user-1');

      expect(result).toBeDefined();
    });
  });

  describe('count', () => {
    it('should count users', async () => {
      (User.countDocuments as jest.Mock).mockResolvedValue(10);

      const result = await userRepository.count({ role: 'student' });

      expect(result).toBe(10);
    });
  });
});