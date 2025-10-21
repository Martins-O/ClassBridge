// Input validation utilities for API routes
import { NextResponse } from 'next/server';

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
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: this.errors
      },
      { status: 400 }
    );
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

  if (value && typeof value === 'string') {
    const trimmedValue = value.trim();

    if (options.minLength && trimmedValue.length < options.minLength) {
      errors.push({ field, message: `${field} must be at least ${options.minLength} characters` });
    }

    if (options.maxLength && trimmedValue.length > options.maxLength) {
      errors.push({ field, message: `${field} must be no more than ${options.maxLength} characters` });
    }

    if (options.pattern && !options.pattern.test(trimmedValue)) {
      errors.push({ field, message: `${field} format is invalid` });
    }
  }

  return errors;
};

// Email validation
export const validateEmail = (value: unknown, field: string = 'email', required: boolean = true): ValidationError[] => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return validateString(value, field, {
    required,
    pattern: emailPattern,
    maxLength: 254
  });
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
    const numValue = Number(value);

    if (isNaN(numValue)) {
      errors.push({ field, message: `${field} must be a valid number` });
      return errors;
    }

    if (options.integer && !Number.isInteger(numValue)) {
      errors.push({ field, message: `${field} must be an integer` });
    }

    if (options.min !== undefined && numValue < options.min) {
      errors.push({ field, message: `${field} must be at least ${options.min}` });
    }

    if (options.max !== undefined && numValue > options.max) {
      errors.push({ field, message: `${field} must be no more than ${options.max}` });
    }
  }

  return errors;
};

// Array validation
export const validateArray = (value: unknown, field: string, options: {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  itemValidator?: (item: unknown, index: number) => ValidationError[];
} = {}): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (options.required && (!value || !Array.isArray(value) || value.length === 0)) {
    errors.push({ field, message: `${field} is required and must contain at least one item` });
    return errors;
  }

  if (value && !Array.isArray(value)) {
    errors.push({ field, message: `${field} must be an array` });
    return errors;
  }

  if (Array.isArray(value)) {
    if (options.minLength && value.length < options.minLength) {
      errors.push({ field, message: `${field} must contain at least ${options.minLength} items` });
    }

    if (options.maxLength && value.length > options.maxLength) {
      errors.push({ field, message: `${field} must contain no more than ${options.maxLength} items` });
    }

    if (options.itemValidator) {
      value.forEach((item, index) => {
        const itemErrors = options.itemValidator!(item, index);
        errors.push(...itemErrors.map(err => ({
          field: `${field}[${index}].${err.field}`,
          message: err.message
        })));
      });
    }
  }

  return errors;
};

// ObjectId validation (MongoDB)
export const validateObjectId = (value: unknown, field: string, required: boolean = true): ValidationError[] => {
  const errors: ValidationError[] = [];
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;

  if (required && (!value || typeof value !== 'string')) {
    errors.push({ field, message: `${field} is required` });
    return errors;
  }

  if (value && (typeof value !== 'string' || !objectIdPattern.test(value))) {
    errors.push({ field, message: `${field} must be a valid ObjectId` });
  }

  return errors;
};

// Enum validation
export const validateEnum = (value: unknown, field: string, allowedValues: string[], required: boolean = true): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (required && (!value || typeof value !== 'string')) {
    errors.push({ field, message: `${field} is required` });
    return errors;
  }

  if (value && !allowedValues.includes(value)) {
    errors.push({ field, message: `${field} must be one of: ${allowedValues.join(', ')}` });
  }

  return errors;
};

// Date validation
export const validateDate = (value: unknown, field: string, required: boolean = true): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (required && !value) {
    errors.push({ field, message: `${field} is required` });
    return errors;
  }

  if (value) {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      errors.push({ field, message: `${field} must be a valid date` });
    }
  }

  return errors;
};

// Sanitization utilities
export const sanitizeString = (value: string): string => {
  return value ? value.trim().replace(/[<>]/g, '') : '';
};

export const sanitizeEmail = (value: string): string => {
  return value ? value.trim().toLowerCase() : '';
};