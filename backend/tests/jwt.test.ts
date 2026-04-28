jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mock-uuid-123'),
}));

import { generateAccessToken, verifyAccessToken, generateRefreshToken, verifyRefreshToken, TokenPayload } from '../src/lib/jwt';

describe('JWT Authentication', () => {
const testPayload: TokenPayload = {
  userId: '507f1f77bcf86cd799439011',
  name: 'Test User',
  email: 'test@example.com',
  role: 'student' as const,
};

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const token = generateAccessToken(testPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid access token', () => {
      const token = generateAccessToken(testPayload);
      const decoded = verifyAccessToken(token);
      expect(decoded.userId).toBe(testPayload.userId);
      expect(decoded.email).toBe(testPayload.email);
      expect(decoded.role).toBe(testPayload.role);
    });

    it('should throw on invalid token', () => {
      expect(() => verifyAccessToken('invalid-token')).toThrow();
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const refreshToken = generateRefreshToken(testPayload.userId);
      expect(refreshToken).toBeDefined();
      expect(refreshToken.token).toBeDefined();
      expect(refreshToken.userId).toBe(testPayload.userId);
      expect(refreshToken.expiresAt).toBeInstanceOf(Date);
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', () => {
      const refreshToken = generateRefreshToken(testPayload.userId);
      const decoded = verifyRefreshToken(refreshToken.token);
      expect(decoded.userId).toBe(testPayload.userId);
    });

    it('should throw on invalid token', () => {
      expect(() => verifyRefreshToken('invalid-token')).toThrow();
    });
  });
});
