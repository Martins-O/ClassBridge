import { calculatePagination, getPaginationMetadata } from '../../src/lib/pagination';

describe('Pagination Edge Cases', () => {
  describe('calculatePagination', () => {
    it('should handle zero total', () => {
      const result = calculatePagination(0, 1, 10);
      expect(result.totalPages).toBe(0);
    });

    it('should handle zero limit', () => {
      const result = calculatePagination(100, 1, 0);
      expect(result.totalPages).toBe(0);
    });
  });

  describe('getPaginationMetadata', () => {
    it('should handle empty results', () => {
      const result = getPaginationMetadata([], 1, 10, 0);
      expect(result.totalItems).toBe(0);
    });
  });
});