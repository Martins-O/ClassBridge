import mongoose from 'mongoose';
import { schoolRepository } from '../../src/repositories';

jest.mock('../../src/models/School', () => ({
  default: {
    findOne: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}));

const School = require('../../src/models/School').default;

describe('schoolRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('should find school by email', async () => {
      (School.findOne as jest.Mock).mockResolvedValue({ _id: 'school-1' });

      const result = await schoolRepository.findByEmail('test@school.com');

      expect(result).toBeDefined();
    });

    it('should return null if not found', async () => {
      (School.findOne as jest.Mock).mockResolvedValue(null);

      const result = await schoolRepository.findByEmail('notfound@school.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find by id', async () => {
      (School.findById as jest.Mock).mockResolvedValue({ _id: 'school-1' });

      const result = await schoolRepository.findById('school-1');

      expect(result).toBeDefined();
    });
  });

  describe('create', () => {
    it('should create school', async () => {
      (School.findOne as jest.Mock).mockResolvedValueOnce(null);
      (School.create as jest.Mock).mockResolvedValue({ _id: 'school-1' });

      const result = await schoolRepository.create({
        name: 'New School',
        email: 'new@school.com',
        adminId: new mongoose.Types.ObjectId()
      });

      expect(result).toBeDefined();
    });
  });

  describe('updateById', () => {
    it('should update school', async () => {
      (School.findByIdAndUpdate as jest.Mock).mockResolvedValue({ _id: 'school-1', name: 'Updated' });

      const result = await schoolRepository.updateById('school-1', { name: 'Updated' });

      expect(result).toBeDefined();
    });
  });

  describe('count', () => {
    it('should count schools', async () => {
      (School.countDocuments as jest.Mock).mockResolvedValue(5);

      const result = await schoolRepository.count({ status: 'approved' });

      expect(result).toBe(5);
    });
  });
});