import { z } from 'zod';

const passwordSchema = z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least 1 uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least 1 lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least 1 number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least 1 special character');

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters')
});

export const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address'),
    password: passwordSchema,
    schoolName: z.string().min(2, 'School name must be at least 2 characters').max(200),
    role: z.enum(['student', 'mentor', 'school_admin']).optional()
});

export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required')
});

export const schoolCreateSchema = z.object({
    name: z.string().min(1, 'Name is required').max(200),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    address: z.string().optional(),
    website: z.string().url().optional().or(z.literal('')),
    description: z.string().optional(),
    adminId: z.string().min(1, 'Admin ID is required')
});

export const schoolUpdateSchema = z.object({
    name: z.string().min(1).max(200).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    website: z.string().url().optional().or(z.literal('')),
    description: z.string().optional(),
    isActive: z.boolean().optional()
});

export const classCreateSchema = z.object({
    name: z.string().min(1, 'Name is required').max(200),
    description: z.string().optional(),
    schoolId: z.string().min(1, 'School ID is required'),
    academicYear: z.string().min(1, 'Academic year is required'),
    duration: z.string().min(1, 'Duration is required'),
    cohort: z.string().min(1, 'Cohort is required'),
    subject: z.string().optional(),
    grade: z.string().optional(),
    semester: z.string().optional(),
    maxStudents: z.number().int().positive().optional(),
    mentorIds: z.array(z.string()).optional(),
    studentIds: z.array(z.string()).optional()
});

export const classUpdateSchema = z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().optional(),
    subject: z.string().optional(),
    grade: z.string().optional(),
    semester: z.string().optional(),
    maxStudents: z.number().int().positive().optional(),
    isActive: z.boolean().optional()
});

export const courseCreateSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    description: z.string().optional(),
    classId: z.string().min(1, 'Class ID is required'),
    subject: z.string().optional(),
    duration: z.enum(['1 week', '2 weeks', '1 month', '2 months', '3 months', '6 months']),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    maxStudents: z.number().int().positive().optional(),
    syllabus: z.string().optional()
});

export const courseUpdateSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().optional(),
    subject: z.string().optional(),
    duration: z.enum(['1 week', '2 weeks', '1 month', '2 months', '3 months', '6 months']).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    maxStudents: z.number().int().positive().optional(),
    syllabus: z.string().optional(),
    isActive: z.boolean().optional()
});

export const gradeCreateSchema = z.object({
    studentId: z.string().min(1, 'Student ID is required'),
    classId: z.string().min(1, 'Class ID is required'),
    gradeType: z.enum(['assignment', 'quiz', 'exam', 'project', 'participation', 'final']),
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().optional(),
    points: z.number().min(0, 'Points cannot be negative'),
    maxPoints: z.number().positive('Max points must be positive'),
    weight: z.number().min(0).max(1).optional(),
    dueDate: z.string().datetime().optional(),
    comments: z.string().optional()
});

export const gradeUpdateSchema = z.object({
    points: z.number().min(0).optional(),
    maxPoints: z.number().positive().optional(),
    weight: z.number().min(0).max(1).optional(),
    comments: z.string().optional(),
    status: z.enum(['draft', 'published', 'archived']).optional()
});

export const userUpdateSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    phone: z.string().optional(),
    bio: z.string().optional(),
    profileImage: z.string().url().optional()
});

export const passwordResetRequestSchema = z.object({
    email: z.string().email('Invalid email address')
});

export const passwordResetSchema = z.object({
    password: passwordSchema
});

export const twoFactorSetupSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
    token: z.string().min(1, 'Token is required')
});

export const twoFactorDisableSchema = z.object({
    password: z.string().min(1, 'Password is required'),
    token: z.string().optional()
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type SchoolCreateInput = z.infer<typeof schoolCreateSchema>;
export type SchoolUpdateInput = z.infer<typeof schoolUpdateSchema>;
export type ClassCreateInput = z.infer<typeof classCreateSchema>;
export type ClassUpdateInput = z.infer<typeof classUpdateSchema>;
export type CourseCreateInput = z.infer<typeof courseCreateSchema>;
export type CourseUpdateInput = z.infer<typeof courseUpdateSchema>;
export type GradeCreateInput = z.infer<typeof gradeCreateSchema>;
export type GradeUpdateInput = z.infer<typeof gradeUpdateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
