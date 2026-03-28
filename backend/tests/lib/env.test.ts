import { getenv, requireEnv, getEnvOrDefault } from '../../src/lib/env';

describe('Environment Edge Cases', () => {
  describe('getenv', () => {
    it('should return undefined for non-existent key', () => {
      expect(getenv('NON_EXISTENT_KEY_12345')).toBeUndefined();
    });
  });

  describe('requireEnv', () => {
    it('should throw for non-existent key', () => {
      expect(() => requireEnv('NON_EXISTENT_KEY_12345')).toThrow();
    });
  });

  describe('getEnvOrDefault', () => {
    it('should return default for non-existent key', () => {
      expect(getEnvOrDefault('NON_EXISTENT_KEY_12345', 'default')).toBe('default');
    });
  });
});