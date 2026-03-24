import {
  ValidationResult,
  validateString,
  validateEmail,
  validateEnum,
  validateObjectId,
  validateNumber,
  validatePasswordStrength,
  validateBoolean,
  validateArray,
  sanitizeString,
  sanitizeEmail,
  sanitizeNumber,
  PASSWORD_REQUIREMENTS,
} from '../../src/lib/validation';

describe('Validation', () => {
  describe('ValidationResult', () => {
    it('should start with no errors', () => {
      const result = new ValidationResult();
      expect(result.errors).toHaveLength(0);
      expect(result.isValid()).toBe(true);
    });

    it('should add errors correctly', () => {
      const result = new ValidationResult();
      result.addError('field', 'Error message');
      expect(result.errors).toHaveLength(1);
      expect(result.isValid()).toBe(false);
    });

    it('should return correct response', () => {
      const result = new ValidationResult();
      result.addError('name', 'Name is required');
      const response = result.getResponse();
      expect(response.error).toBe('Validation failed');
      expect(response.details).toHaveLength(1);
    });
  });

  describe('validateString', () => {
    it('should return no errors for valid string', () => {
      const errors = validateString('test', 'name');
      expect(errors).toHaveLength(0);
    });

    it('should return error for required empty string', () => {
      const errors = validateString('', 'name', { required: true });
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('name is required');
    });

    it('should return error for required undefined', () => {
      const errors = validateString(undefined, 'name', { required: true });
      expect(errors).toHaveLength(1);
    });

    it('should return error for non-string value', () => {
      const errors = validateString(123, 'name');
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('name must be a string');
    });

    it('should return error for string below minLength', () => {
      const errors = validateString('ab', 'name', { minLength: 3 });
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('name must be at least 3 characters');
    });

    it('should return error for string above maxLength', () => {
      const errors = validateString('abcdefgh', 'name', { maxLength: 5 });
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('name must be at most 5 characters');
    });

    it('should return error for pattern mismatch', () => {
      const errors = validateString('abc', 'name', { pattern: /^[0-9]+$/ });
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('name has invalid format');
    });

    it('should return no errors for pattern match', () => {
      const errors = validateString('123', 'name', { pattern: /^[0-9]+$/ });
      expect(errors).toHaveLength(0);
    });
  });

  describe('validateEmail', () => {
    it('should return no errors for valid email', () => {
      const errors = validateEmail('test@example.com', 'email');
      expect(errors).toHaveLength(0);
    });

    it('should return no errors for undefined', () => {
      const errors = validateEmail(undefined, 'email');
      expect(errors).toHaveLength(0);
    });

    it('should return error for invalid email', () => {
      const errors = validateEmail('invalid', 'email');
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('email must be a valid email address');
    });

    it('should return error for email without @', () => {
      const errors = validateEmail('testexample.com', 'email');
      expect(errors).toHaveLength(1);
    });

    it('should return error for email without domain', () => {
      const errors = validateEmail('test@', 'email');
      expect(errors).toHaveLength(1);
    });
  });

  describe('validateEnum', () => {
    it('should return no errors for valid value', () => {
      const errors = validateEnum('admin', 'role', ['admin', 'user', 'guest']);
      expect(errors).toHaveLength(0);
    });

    it('should return no errors for undefined', () => {
      const errors = validateEnum(undefined, 'role', ['admin', 'user']);
      expect(errors).toHaveLength(0);
    });

    it('should return error for invalid value', () => {
      const errors = validateEnum('superadmin', 'role', ['admin', 'user']);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('role must be one of: admin, user');
    });
  });

  describe('validateObjectId', () => {
    it('should return no errors for valid 24-char hex', () => {
      const errors = validateObjectId('507f1f77bcf86cd799439011', 'id');
      expect(errors).toHaveLength(0);
    });

    it('should return no errors for undefined', () => {
      const errors = validateObjectId(undefined, 'id');
      expect(errors).toHaveLength(0);
    });

    it('should return error for invalid ID', () => {
      const errors = validateObjectId('invalid', 'id');
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('id must be a valid ID');
    });

    it('should return error for ID too short', () => {
      const errors = validateObjectId('507f1f77bcf86cd7', 'id');
      expect(errors).toHaveLength(1);
    });
  });

  describe('validateNumber', () => {
    it('should return no errors for valid number', () => {
      const errors = validateNumber(10, 'age');
      expect(errors).toHaveLength(0);
    });

    it('should return no errors for undefined', () => {
      const errors = validateNumber(undefined, 'age');
      expect(errors).toHaveLength(0);
    });

    it('should return error for required missing', () => {
      const errors = validateNumber(undefined, 'age', { required: true });
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('age is required');
    });

    it('should return error for non-number string', () => {
      const errors = validateNumber('abc', 'age');
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('age must be a number');
    });

    it('should return error for non-integer when integer required', () => {
      const errors = validateNumber(5.5, 'count', { integer: true });
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('count must be an integer');
    });

    it('should return error for number below min', () => {
      const errors = validateNumber(5, 'age', { min: 18 });
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('age must be at least 18');
    });

    it('should return error for number above max', () => {
      const errors = validateNumber(150, 'age', { max: 120 });
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('age must be at most 120');
    });
  });

  describe('validatePasswordStrength', () => {
    it('should return no errors for strong password', () => {
      const errors = validatePasswordStrength('Password1!');
      expect(errors).toHaveLength(0);
    });

    it('should return error for password too short', () => {
      const errors = validatePasswordStrength('Pass1!');
      expect(errors.some(e => e.message.includes('8 characters'))).toBe(true);
    });

    it('should return error for missing uppercase', () => {
      const errors = validatePasswordStrength('password1!');
      expect(errors.some(e => e.message.includes('uppercase'))).toBe(true);
    });

    it('should return error for missing lowercase', () => {
      const errors = validatePasswordStrength('PASSWORD1!');
      expect(errors.some(e => e.message.includes('lowercase'))).toBe(true);
    });

    it('should return error for missing number', () => {
      const errors = validatePasswordStrength('Password!');
      expect(errors.some(e => e.message.includes('number'))).toBe(true);
    });

    it('should return error for missing special char', () => {
      const errors = validatePasswordStrength('Password1');
      expect(errors.some(e => e.message.includes('special character'))).toBe(true);
    });

    it('should return no errors for undefined', () => {
      const errors = validatePasswordStrength('' as any);
      expect(errors).toHaveLength(0);
    });
  });

  describe('PASSWORD_REQUIREMENTS', () => {
    it('should have 5 requirements', () => {
      expect(PASSWORD_REQUIREMENTS).toHaveLength(5);
    });

    it('should contain character requirement', () => {
      expect(PASSWORD_REQUIREMENTS).toContain('At least 8 characters');
    });
  });

  describe('validateBoolean', () => {
    it('should return no errors for valid boolean', () => {
      const errors = validateBoolean(true, 'active');
      expect(errors).toHaveLength(0);
    });

    it('should return no errors for undefined', () => {
      const errors = validateBoolean(undefined, 'active');
      expect(errors).toHaveLength(0);
    });

    it('should return error for non-boolean', () => {
      const errors = validateBoolean('true', 'active');
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('active must be a boolean');
    });
  });

  describe('validateArray', () => {
    it('should return no errors for valid array', () => {
      const errors = validateArray(['a', 'b'], 'tags');
      expect(errors).toHaveLength(0);
    });

    it('should return no errors for undefined', () => {
      const errors = validateArray(undefined, 'tags');
      expect(errors).toHaveLength(0);
    });

    it('should return error for required missing', () => {
      const errors = validateArray(undefined, 'tags', { required: true });
      expect(errors).toHaveLength(1);
    });

    it('should return error for non-array', () => {
      const errors = validateArray('abc', 'tags');
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('tags must be an array');
    });

    it('should return error for array below minLength', () => {
      const errors = validateArray(['a'], 'tags', { minLength: 2 });
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('tags must have at least 2 items');
    });

    it('should return error for array above maxLength', () => {
      const errors = validateArray(['a', 'b', 'c'], 'tags', { maxLength: 2 });
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('tags must have at most 2 items');
    });

    it('should return error for wrong item type', () => {
      const errors = validateArray([1, 'a'], 'tags', { itemType: 'string' });
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('must be of type string');
    });
  });

  describe('sanitizeString', () => {
    it('should trim string', () => {
      expect(sanitizeString('  test  ')).toBe('test');
    });

    it('should return empty for undefined', () => {
      expect(sanitizeString(undefined)).toBe('');
    });

    it('should return empty for empty string', () => {
      expect(sanitizeString('')).toBe('');
    });
  });

  describe('sanitizeEmail', () => {
    it('should lowercase and trim', () => {
      expect(sanitizeEmail('  Test@Example.com  ')).toBe('test@example.com');
    });

    it('should return empty for undefined', () => {
      expect(sanitizeEmail(undefined)).toBe('');
    });
  });

  describe('sanitizeNumber', () => {
    it('should parse number string', () => {
      expect(sanitizeNumber('123')).toBe(123);
    });

    it('should return number as-is', () => {
      expect(sanitizeNumber(456)).toBe(456);
    });

    it('should return undefined for invalid string', () => {
      expect(sanitizeNumber('abc')).toBeUndefined();
    });

    it('should return undefined for undefined', () => {
      expect(sanitizeNumber(undefined)).toBeUndefined();
    });
  });
});