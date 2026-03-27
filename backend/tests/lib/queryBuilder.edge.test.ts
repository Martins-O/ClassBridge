import { buildQuery, applyFilters, applyPagination, applySorting } from '../../src/lib/queryBuilder';

describe('QueryBuilder Edge Cases', () => {
  describe('buildQuery', () => {
    it('should handle empty filters', () => {
      const query = buildQuery({});
      expect(query).toEqual({});
    });

    it('should handle null values in filters', () => {
      const query = buildQuery({ name: null, status: 'active' });
      expect(query.status).toBe('active');
    });
  });

  describe('applyPagination', () => {
    it('should handle zero page', () => {
      const result = applyPagination([], 0, 10);
      expect(result).toHaveLength(0);
    });

    it('should handle negative limit', () => {
      const result = applyPagination([1, 2, 3], 1, -5);
      expect(result).toHaveLength(3);
    });
  });
});