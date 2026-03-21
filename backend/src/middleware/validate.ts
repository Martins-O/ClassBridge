import { Request, Response, NextFunction } from 'express';
import { ValidationResult, validateString, validateEmail, validateEnum, validateNumber, validateBoolean, validateArray } from '@/lib/validation';

export interface ValidationSchema {
  [key: string]: {
    required?: boolean;
    type: 'string' | 'email' | 'number' | 'boolean' | 'enum' | 'array' | 'object';
    options?: {
      minLength?: number;
      maxLength?: number;
      min?: number;
      max?: number;
      allowedValues?: string[];
      minItems?: number;
      maxItems?: number;
    };
  };
}

export function validate(schema: ValidationSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = new ValidationResult();
    const body = req.body || {};

    for (const [field, rules] of Object.entries(schema)) {
      const value = body[field];

      if (rules.required && (value === undefined || value === null || value === '')) {
        result.addError(field, `${field} is required`);
        continue;
      }

      if (value === undefined || value === null) {
        continue;
      }

      switch (rules.type) {
        case 'string': {
          const errors = validateString(value, field, {
            required: rules.required,
            minLength: rules.options?.minLength,
            maxLength: rules.options?.maxLength,
          });
          result.errors.push(...errors);
          break;
        }

        case 'email': {
          const errors = validateEmail(value, field);
          result.errors.push(...errors);
          break;
        }

        case 'number': {
          const errors = validateNumber(value, field, {
            required: rules.required,
            min: rules.options?.min,
            max: rules.options?.max,
          });
          result.errors.push(...errors);
          break;
        }

        case 'boolean': {
          const errors = validateBoolean(value, field);
          result.errors.push(...errors);
          break;
        }

        case 'enum': {
          const errors = validateEnum(value, field, rules.options?.allowedValues || []);
          result.errors.push(...errors);
          break;
        }

        case 'array': {
          const errors = validateArray(value, field, {
            required: rules.required,
            minLength: rules.options?.minItems,
            maxLength: rules.options?.maxItems,
          });
          result.errors.push(...errors);
          break;
        }
      }
    }

    if (!result.isValid()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.errors,
      });
    }

    next();
  };
}

export const schemas = {
  login: {
    email: { required: true, type: 'email' },
    password: { required: true, type: 'string', options: { minLength: 6 } },
  },

  registerSchool: {
    name: { required: true, type: 'string', options: { minLength: 2, maxLength: 100 } },
    email: { required: true, type: 'email' },
    password: { required: true, type: 'string', options: { minLength: 8 } },
    phone: { required: false, type: 'string' },
    address: { required: false, type: 'string' },
  },

  createClass: {
    name: { required: true, type: 'string', options: { minLength: 2, maxLength: 100 } },
    academicYear: { required: true, type: 'string' },
    duration: { required: true, type: 'string' },
    cohort: { required: false, type: 'string' },
    maxStudents: { required: false, type: 'number', options: { min: 1, max: 100 } },
  },

  createCourse: {
    name: { required: true, type: 'string', options: { minLength: 2, maxLength: 100 } },
    classId: { required: true, type: 'string' },
    mentorId: { required: true, type: 'string' },
    description: { required: false, type: 'string' },
  },

  createGrade: {
    studentId: { required: true, type: 'string' },
    courseId: { required: true, type: 'string' },
    classId: { required: true, type: 'string' },
    mentorId: { required: true, type: 'string' },
    academicYear: { required: true, type: 'string' },
    grade: { required: true, type: 'string' },
    score: { required: false, type: 'number', options: { min: 0, max: 100 } },
  },

  inviteUser: {
    email: { required: true, type: 'email' },
    name: { required: true, type: 'string', options: { minLength: 2 } },
    role: {
      required: false,
      type: 'enum',
      options: { allowedValues: ['admissions', 'counselor', 'office_staff', 'mentor', 'student'] },
    },
  },

  passwordReset: {
    email: { required: true, type: 'email' },
  },

  passwordChange: {
    newPassword: { required: true, type: 'string', options: { minLength: 8 } },
  },
};
