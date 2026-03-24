import { getQueryParams, buildQuery } from '../../src/lib/queryBuilder';

describe('QueryBuilder', () => {
  describe('getQueryParams', () => {
    const createMockRequest = (query: Record<string, any> = {}) => ({
      query: query,
    } as any);

    describe('sort parsing', () => {
      it('should use default sort when no param', () => {
        const req = createMockRequest({});
        const result = getQueryParams(req, { defaultSort: '-name' });
        expect(result.sort).toEqual({ name: -1 });
      });

      it('should parse ascending sort', () => {
        const req = createMockRequest({ sort: 'name' });
        const result = getQueryParams(req, { allowedSortFields: ['name', 'email'] });
        expect(result.sort).toEqual({ name: 1 });
      });

      it('should parse descending sort', () => {
        const req = createMockRequest({ sort: '-email' });
        const result = getQueryParams(req, { allowedSortFields: ['name', 'email'] });
        expect(result.sort).toEqual({ email: -1 });
      });

      it('should filter out non-allowed sort fields', () => {
        const req = createMockRequest({ sort: 'invalid' });
        const result = getQueryParams(req, { allowedSortFields: ['name'] });
        expect(result.sort).toEqual({});
      });

    it('should return empty sort for non-allowed fields', () => {
      const req = createMockRequest({ sort: 'invalid' });
      const result = getQueryParams(req, { defaultSort: '-name', allowedSortFields: ['name'] });
      expect(result.sort).toEqual({});
    });
    });

    describe('filter parsing', () => {
      it('should return empty filters when no param', () => {
        const req = createMockRequest({});
        const result = getQueryParams(req);
        expect(result.filters).toEqual({});
      });

      it('should parse JSON filter', () => {
        const req = createMockRequest({ filter: JSON.stringify({ status: 'active' }) });
        const result = getQueryParams(req, { allowedFilterFields: ['status'] });
        expect(result.filters).toEqual({ status: 'active' });
      });

      it('should filter out non-allowed fields', () => {
        const req = createMockRequest({ filter: JSON.stringify({ secret: 'value' }) });
        const result = getQueryParams(req, { allowedFilterFields: ['status'] });
        expect(result.filters).toEqual({});
      });

      it('should parse key:value format', () => {
        const req = createMockRequest({ filter: 'status:active,type:admin' });
        const result = getQueryParams(req, { allowedFilterFields: ['status', 'type'] });
        expect(result.filters).toEqual({ status: 'active', type: 'admin' });
      });

      it('should handle invalid JSON gracefully', () => {
        const req = createMockRequest({ filter: 'not-valid-json' });
        const result = getQueryParams(req);
        expect(result.filters).toEqual({});
      });
    });

    describe('search parsing', () => {
      it('should return null for empty search', () => {
        const req = createMockRequest({});
        const result = getQueryParams(req);
        expect(result.search).toBeNull();
      });

      it('should return null for single character', () => {
        const req = createMockRequest({ search: 'a' });
        const result = getQueryParams(req);
        expect(result.search).toBeNull();
      });

      it('should return null for whitespace only', () => {
        const req = createMockRequest({ search: '   ' });
        const result = getQueryParams(req);
        expect(result.search).toBeNull();
      });

      it('should return search object for valid query', () => {
        const req = createMockRequest({ search: 'test' });
      const result = getQueryParams(req);
      expect(result.search).not.toBeNull();
      if (result.search) {
        expect(Array.isArray(result.search.$or)).toBe(true);
      }
      });

      it('should trim search query', () => {
        const req = createMockRequest({ search: '  test  ' });
        const result = getQueryParams(req);
        expect(result.search).not.toBeNull();
      });
    });
  });

  describe('buildQuery', () => {
    it('should return empty filters when no filters or search', () => {
      const result = buildQuery({}, null);
      expect(result).toEqual({});
    });

    it('should include filters', () => {
      const result = buildQuery({ status: 'active' }, null);
      expect(result).toEqual({ status: 'active' });
    });

    it('should include search $or', () => {
      const search = { $or: [{ name: { $regex: 'test', $options: 'i' } }] };
      const result = buildQuery({}, search);
      expect(result).toHaveProperty('$or');
      expect(result.$or).toEqual(search.$or);
    });

    it('should combine filters and search', () => {
      const filters = { status: 'active' };
      const search = { $or: [{ name: { $regex: 'test', $options: 'i' } }] };
      const result = buildQuery(filters, search);
      expect(result).toEqual({
        status: 'active',
        $or: search.$or
      });
    });

    it('should handle multiple filters', () => {
      const filters = { status: 'active', type: 'admin', verified: true };
      const result = buildQuery(filters, null);
      expect(result).toEqual(filters);
    });
  });
});