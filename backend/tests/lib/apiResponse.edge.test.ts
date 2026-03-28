import { createApiResponse, createErrorResponse, createPaginatedResponse } from '../../src/lib/apiResponse';

describe('API Response Edge Cases', () => {
  describe('createApiResponse', () => {
    it('should handle null data', () => {
      const response = createApiResponse(null, true, 'No data');
      expect(response.success).toBe(true);
    });
  });

  describe('createErrorResponse', () => {
    it('should handle empty message', () => {
      const response = createErrorResponse('');
      expect(response.error).toBe('');
    });
  });

  describe('createPaginatedResponse', () => {
    it('should handle empty data', () => {
      const response = createPaginatedResponse([], 1, 10, 0);
      expect(response.data).toHaveLength(0);
    });
  });
});