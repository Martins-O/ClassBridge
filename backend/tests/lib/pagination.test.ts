import { getPaginationParams, buildPagination, buildPaginationMeta } from '../../src/lib/pagination';

describe('Pagination', () => {
  describe('getPaginationParams', () => {
    const createMockRequest = (query: Record<string, any> = {}) => ({
      query: query,
    } as any);

    it('should use default values when no query params', () => {
      const req = createMockRequest({});
      const result = getPaginationParams(req, { defaultLimit: 20, maxLimit: 100 });
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.skip).toBe(0);
    });

    it('should parse valid page and limit', () => {
      const req = createMockRequest({ page: '3', limit: '10' });
      const result = getPaginationParams(req, { defaultLimit: 20, maxLimit: 100 });
      expect(result.page).toBe(3);
      expect(result.limit).toBe(10);
      expect(result.skip).toBe(20);
    });

    it('should default page to 1 for invalid values', () => {
      const req = createMockRequest({ page: '0', limit: '10' });
      const result = getPaginationParams(req, { defaultLimit: 20, maxLimit: 100 });
      expect(result.page).toBe(1);
    });

    it('should default page to 1 for negative values', () => {
      const req = createMockRequest({ page: '-5', limit: '10' });
      const result = getPaginationParams(req, { defaultLimit: 20, maxLimit: 100 });
      expect(result.page).toBe(1);
    });

    it('should default limit to defaultLimit for invalid values', () => {
      const req = createMockRequest({ page: '1', limit: '0' });
      const result = getPaginationParams(req, { defaultLimit: 20, maxLimit: 100 });
      expect(result.limit).toBe(20);
    });

    it('should cap limit at maxLimit', () => {
      const req = createMockRequest({ page: '1', limit: '500' });
      const result = getPaginationParams(req, { defaultLimit: 20, maxLimit: 100 });
      expect(result.limit).toBe(100);
    });

    it('should cap limit at maxLimit for values above max', () => {
      const req = createMockRequest({ page: '1', limit: '200' });
      const result = getPaginationParams(req, { defaultLimit: 20, maxLimit: 50 });
      expect(result.limit).toBe(50);
    });

    it('should calculate skip correctly', () => {
      const req = createMockRequest({ page: '5', limit: '10' });
      const result = getPaginationParams(req);
      expect(result.skip).toBe(40);
    });

    it('should allow custom defaultLimit', () => {
      const req = createMockRequest({});
      const result = getPaginationParams(req, { defaultLimit: 50 });
      expect(result.limit).toBe(50);
    });

    it('should handle non-numeric string values', () => {
      const req = createMockRequest({ page: 'abc', limit: 'xyz' });
      const result = getPaginationParams(req, { defaultLimit: 20, maxLimit: 100 });
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });
  });

  describe('buildPagination', () => {
    it('should build pagination with correct metadata', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const result = buildPagination(data, 100, 1, 20);

      expect(result.data).toEqual(data);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(20);
      expect(result.pagination.total).toBe(100);
      expect(result.pagination.totalPages).toBe(5);
      expect(result.pagination.hasNext).toBe(true);
      expect(result.pagination.hasPrev).toBe(false);
    });

    it('should handle first page correctly', () => {
      const result = buildPagination([], 0, 1, 20);

      expect(result.pagination.hasNext).toBe(false);
      expect(result.pagination.hasPrev).toBe(false);
      expect(result.pagination.totalPages).toBe(0);
    });

    it('should handle middle page correctly', () => {
      const result = buildPagination([], 100, 3, 20);

      expect(result.pagination.hasNext).toBe(true);
      expect(result.pagination.hasPrev).toBe(true);
      expect(result.pagination.totalPages).toBe(5);
    });

    it('should handle last page correctly', () => {
      const result = buildPagination([], 100, 5, 20);

      expect(result.pagination.hasNext).toBe(false);
      expect(result.pagination.hasPrev).toBe(true);
    });

    it('should handle zero total', () => {
      const result = buildPagination([], 0, 1, 20);

      expect(result.pagination.totalPages).toBe(0);
      expect(result.pagination.hasNext).toBe(false);
      expect(result.pagination.hasPrev).toBe(false);
    });

    it('should handle exact division', () => {
      const result = buildPagination([], 100, 2, 20);

      expect(result.pagination.totalPages).toBe(5);
    });

    it('should handle non-exact division', () => {
      const result = buildPagination([], 105, 2, 20);

      expect(result.pagination.totalPages).toBe(6);
    });
  });

  describe('buildPaginationMeta', () => {
    it('should build metadata with hasNext true', () => {
      const meta = buildPaginationMeta(2, 20, 100);
      expect(meta.hasNext).toBe(true);
      expect(meta.hasPrev).toBe(true);
    });

    it('should build metadata with hasNext false', () => {
      const meta = buildPaginationMeta(5, 20, 100);
      expect(meta.hasNext).toBe(false);
      expect(meta.hasPrev).toBe(true);
    });

    it('should build metadata for first page', () => {
      const meta = buildPaginationMeta(1, 20, 100);
      expect(meta.hasNext).toBe(true);
      expect(meta.hasPrev).toBe(false);
    });

    it('should include all required fields', () => {
      const meta = buildPaginationMeta(1, 20, 100);
      expect(meta).toHaveProperty('page');
      expect(meta).toHaveProperty('limit');
      expect(meta).toHaveProperty('total');
      expect(meta).toHaveProperty('totalPages');
      expect(meta).toHaveProperty('hasNext');
      expect(meta).toHaveProperty('hasPrev');
    });
  });
});