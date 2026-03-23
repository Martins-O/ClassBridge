import { mock } from 'jest-mock-extended';
import { UserRole } from '../src/models/User';

export const mockUser = (overrides: Partial<{
  _id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  schoolId: string | undefined;
  isActive: boolean;
  isApproved: boolean;
  failedLoginAttempts: number;
  lockoutUntil: Date | undefined;
  deletionRequested: boolean;
  studentId: string | undefined;
}> = {}) => ({
  _id: 'user-id-123',
  email: 'test@example.com',
  password: 'hashedPassword123',
  name: 'Test User',
  role: 'student' as UserRole,
  schoolId: undefined,
  isActive: true,
  isApproved: false,
  failedLoginAttempts: 0,
  lockoutUntil: undefined,
  deletionRequested: false,
  studentId: undefined,
  ...overrides,
});

export const mockSchool = (overrides: Partial<{
  _id: string;
  name: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason: string | undefined;
  adminId: string;
}> = {}) => ({
  _id: 'school-id-123',
  name: 'Test School',
  email: 'school@test.com',
  status: 'approved' as const,
  rejectionReason: undefined,
  adminId: 'admin-id-123',
  ...overrides,
});

export const mockRefreshToken = (overrides: Partial<{
  _id: string;
  userId: string;
  token: string;
  tokenFamily: string;
  expiresAt: Date;
  isRevoked: boolean;
  isUsed: boolean;
}> = {}) => ({
  _id: 'token-id-123',
  userId: 'user-id-123',
  token: 'refresh-token-123',
  tokenFamily: 'token-family-123',
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  isRevoked: false,
  isUsed: false,
  ...overrides,
});

export const mockGrade = (overrides: Partial<{
  _id: string;
  studentId: string;
  courseId: string;
  classId: string;
  mentorId: string;
  academicYear: string;
  semester: string | undefined;
  grade: string;
  score: number | undefined;
  comments: string | undefined;
}> = {}) => ({
  _id: 'grade-id-123',
  studentId: 'student-id-123',
  courseId: 'course-id-123',
  classId: 'class-id-123',
  mentorId: 'mentor-id-123',
  academicYear: '2024',
  semester: 'Fall',
  grade: 'A',
  score: 95,
  comments: 'Excellent work',
  ...overrides,
});

export const mockClass = (overrides: Partial<{
  _id: string;
  name: string;
  schoolId: string;
  mentorIds: string[];
  studentIds: string[];
  academicYear: string;
  isActive: boolean;
}> = {}) => ({
  _id: 'class-id-123',
  name: 'Test Class',
  schoolId: 'school-id-123',
  mentorIds: ['mentor-id-123'],
  studentIds: ['student-id-123'],
  academicYear: '2024',
  isActive: true,
  ...overrides,
});

export const mockCourse = (overrides: Partial<{
  _id: string;
  name: string;
  classId: string;
  mentorId: string;
  schoolId: string;
  maxStudents: number;
  isActive: boolean;
}> = {}) => ({
  _id: 'course-id-123',
  name: 'Test Course',
  classId: 'class-id-123',
  mentorId: 'mentor-id-123',
  schoolId: 'school-id-123',
  maxStudents: 30,
  isActive: true,
  ...overrides,
});

export const createMockUserRepository = () => mock<UserRepositoryInterface>({
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  find: jest.fn(),
  findBySchoolId: jest.fn(),
});

export const createMockSchoolRepository = () => mock<SchoolRepositoryInterface>({
  findById: jest.fn(),
  findByIdBasic: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  find: jest.fn(),
});

export const createMockGradeRepository = () => mock<GradeRepositoryInterface>({
  findById: jest.fn(),
  findByStudentId: jest.fn(),
  findByClassId: jest.fn(),
  create: jest.fn(),
  createBulk: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  find: jest.fn(),
});

export interface UserRepositoryInterface {
  findById: jest.Mock;
  findByEmail: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  find: jest.Mock;
  findBySchoolId: jest.Mock;
}

export interface SchoolRepositoryInterface {
  findById: jest.Mock;
  findByIdBasic: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  find: jest.Mock;
}

export interface GradeRepositoryInterface {
  findById: jest.Mock;
  findByStudentId: jest.Mock;
  findByClassId: jest.Mock;
  create: jest.Mock;
  createBulk: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  find: jest.Mock;
}