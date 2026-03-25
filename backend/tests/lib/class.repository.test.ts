import mongoose from 'mongoose';
import { classRepository } from '../../src/repositories';

jest.mock('../../src/models/Class', () => ({
  default: {
    findById: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}));

const Class = require('../../src/models/Class').default;

describe('classRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should find class by id', async () => {
      (Class.findById as jest.Mock).mockResolvedValue({ _id: 'class-1' });

      const result = await classRepository.findById('class-1');

      expect(result).toBeDefined();
    });
  });

  describe('findBySchool', () => {
    it('should find classes by school', async () => {
      (Class.find as jest.Mock).mockReturnValue({ sort: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([{ _id: 'class-1' }]) }) });

      const result = await classRepository.findBySchool('school-1');

      expect(result).toHaveLength(1);
    });
  });

  describe('create', () => {
    it('should create class', async () => {
      (Class.create as jest.Mock).mockResolvedValue({ _id: 'class-1' });

      const result = await classRepository.create({
        name: 'Math 101',
        schoolId: 'school-1'
      });

      expect(result).toBeDefined();
    });
  });

  describe('updateById', () => {
    it('should update class', async () => {
      (Class.findByIdAndUpdate as jest.Mock).mockResolvedValue({ _id: 'class-1', name: 'Updated' });

      const result = await classRepository.updateById('class-1', { name: 'Updated' });

      expect(result).toBeDefined();
    });
  });
});