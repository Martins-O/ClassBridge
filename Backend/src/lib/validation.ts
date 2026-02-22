// Input validation utilities for API routes

export interface ValidationError {
  field: string;
  message: string;
}

export class ValidationResult {
  errors: ValidationError[] = [];

  addError(field: string, message: string) {
    this.errors.push({ field, message });
  }

  isValid(): boolean {
    return this.errors.length === 0;
  }

  getResponse() {
    return {
      error: 'Validation failed',
      details: this.errors,
    };
  }
}

// String validation
export const validateString = (value: unknown, field: string, options: {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
} = {}): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (options.required && (!value || typeof value !== 'string' || value.trim() === '')) {
    errors.push({ field, message: `${field} is required` });
    return errors;
  }

  if (value && typeof value !== 'string') {
    errors.push({ field, message: `${field} must be a string` });
    return errors;
  }

  if (value) {
    const strValue = value as string;
    if (options.minLength && strValue.length < options.minLength) {
      errors.push({ field, message: `${field} must be at least ${options.minLength} characters` });
    }

    if (options.maxLength && strValue.length > options.maxLength) {
      errors.push({ field, message: `${field} must be at most ${options.maxLength} characters` });
    }

    if (options.pattern && !options.pattern.test(strValue)) {
      errors.push({ field, message: `${field} has invalid format` });
    }
  }

  return errors;
};

// Email validation
export const validateEmail = (value: unknown, field: string): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!value) return errors;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (typeof value !== 'string' || !emailRegex.test(value)) {
    errors.push({ field, message: `${field} must be a valid email address` });
  }

  return errors;
};

// Enum validation
export const validateEnum = (value: unknown, field: string, allowedValues: string[]): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!value) return errors;

  if (!allowedValues.includes(value as string)) {
    errors.push({ field, message: `${field} must be one of: ${allowedValues.join(', ')}` });
  }

  return errors;
};

// ObjectId validation
export const validateObjectId = (value: unknown, field: string): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!value) return errors;

  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  if (typeof value !== 'string' || !objectIdRegex.test(value)) {
    errors.push({ field, message: `${field} must be a valid ID` });
  }

  return errors;
};

// Number validation
export const validateNumber = (value: unknown, field: string, options: {
  required?: boolean;
  min?: number;
  max?: number;
  integer?: boolean;
} = {}): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (options.required && (value === undefined || value === null)) {
    errors.push({ field, message: `${field} is required` });
    return errors;
  }

  if (value !== undefined && value !== null) {
    const num = typeof value === 'number' ? value : parseFloat(value as string);

    if (isNaN(num)) {
      errors.push({ field, message: `${field} must be a number` });
      return errors;
    }

    if (options.integer && !Number.isInteger(num)) {
      errors.push({ field, message: `${field} must be an integer` });
    }

    if (options.min !== undefined && num < options.min) {
      errors.push({ field, message: `${field} must be at least ${options.min}` });
    }

    if (options.max !== undefined && num > options.max) {
      errors.push({ field, message: `${field} must be at most ${options.max}` });
    }
  }

  return errors;
};

// Boolean validation
export const validateBoolean = (value: unknown, field: string): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!value) return errors;

  if (typeof value !== 'boolean') {
    errors.push({ field, message: `${field} must be a boolean` });
  }

  return errors;
};

// Array validation
export const validateArray = (value: unknown, field: string, options: {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  itemType?: 'string' | 'number' | 'object';
} = {}): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (options.required && (!value || !Array.isArray(value))) {
    errors.push({ field, message: `${field} is required and must be an array` });
    return errors;
  }

  if (value && !Array.isArray(value)) {
    errors.push({ field, message: `${field} must be an array` });
    return errors;
  }

  if (value && Array.isArray(value)) {
    if (options.minLength && value.length < options.minLength) {
      errors.push({ field, message: `${field} must have at least ${options.minLength} items` });
    }

    if (options.maxLength && value.length > options.maxLength) {
      errors.push({ field, message: `${field} must have at most ${options.maxLength} items` });
    }

    if (options.itemType) {
      value.forEach((item, index) => {
        if (typeof item !== options.itemType) {
          errors.push({ field, message: `${field}[${index}] must be of type ${options.itemType}` });
        }
      });
    }
  }

  return errors;
};

// Sanitization utilities
export const sanitizeString = (value: string | undefined): string => {
  if (!value) return '';
  return value.trim();
};

export const sanitizeEmail = (value: string | undefined): string => {
  if (!value) return '';
  return value.toLowerCase().trim();
};

export const sanitizeNumber = (value: unknown): number | undefined => {
  if (value === undefined || value === null) return undefined;
  const num = typeof value === 'number' ? value : parseFloat(value as string);
  return isNaN(num) ? undefined : num;
};
