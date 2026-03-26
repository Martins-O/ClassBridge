import { BaseService } from '../../src/services/base.service';

jest.mock('../../src/lib/mongodb', () => ({
  withTransaction: jest.fn((fn) => fn()),
}));

jest.mock('../../src/repositories', () => ({
  __esModule: true,
  userRepository: {
    findById: jest.fn(),
    create: jest.fn(),
    updateById: jest.fn(),
    deleteById: jest.fn(),
  },
}));

describe('BaseService', () => {
  let baseService: BaseService;

  beforeEach(() => {
    baseService = new BaseService();
    jest.clearAllMocks();
  });

  describe('getModelName', () => {
    it('should return undefined for base service', () => {
      const modelName = baseService.getModelName();
      expect(modelName).toBeUndefined();
    });
  });

  describe('findById', () => {
    it('should return null when id is not provided', async () => {
      const result = await baseService.findById('');
      expect(result).toBeNull();
    });

    it('should return null when id is null', async () => {
      const result = await baseService.findById(null as any);
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should return null when data is not provided', async () => {
      const result = await baseService.create(null as any);
      expect(result).toBeNull();
    });

    it('should return null when data is empty', async () => {
      const result = await baseService.create({});
      expect(result).toBeNull();
    });
  });

  describe('updateById', () => {
    it('should return null when id is not provided', async () => {
      const result = await baseService.updateById('', {});
      expect(result).toBeNull();
    });

    it('should return null when id is null', async () => {
      const result = await baseService.updateById(null as any, {});
      expect(result).toBeNull();
    });
  });

  describe('deleteById', () => {
    it('should return null when id is not provided', async () => {
      const result = await baseService.deleteById('');
      expect(result).toBeNull();
    });

    it('should return null when id is null', async () => {
      const result = await baseService.deleteById(null as any);
      expect(result).toBeNull();
    });
  });

  describe('exists', () => {
    it('should return false when id is not provided', async () => {
      const result = await baseService.exists('');
      expect(result).toBe(false);
    });
  });

  describe('count', () => {
    it('should return 0 when query is not provided', async () => {
      const result = await baseService.count(null as any);
      expect(result).toBe(0);
    });
  });
});