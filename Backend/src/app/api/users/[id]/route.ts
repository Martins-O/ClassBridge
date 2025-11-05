import { Types } from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getUserIdFromRequest } from '@/lib/session';
import { serializeUser } from '@/lib/serializeUser';
import {
  ValidationResult,
  validateString,
  validateEnum,
  validateObjectId,
  validateArray,
  sanitizeString,
} from '@/lib/validation';

const USER_ROLES = ['school_admin', 'mentor', 'student', 'super_admin'] as const;

type UserRole = (typeof USER_ROLES)[number];

const toIdString = (value: unknown): string | null => {
  if (!value) {
    return null;
  }
  if (value instanceof Types.ObjectId) {
    return value.toString();
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'object' && value !== null && '_id' in value) {
    return toIdString((value as { _id?: unknown })._id);
  }
  if (typeof value === 'object' && value !== null && 'toString' in value) {
    try {
      return String(value);
    } catch {
      return null;
    }
  }
  return null;
};

const canManageUser = (
  requester: Awaited<ReturnType<typeof User.findById>>,
  target: Awaited<ReturnType<typeof User.findById>>,
): {
  allowed: boolean;
  scope: 'self' | 'school' | 'global';
} => {
  if (!requester || !target) {
    return { allowed: false, scope: 'self' };
  }

  const requesterIdStr = toIdString(requester);
  const targetIdStr = toIdString(target);

  if (requesterIdStr && targetIdStr && requesterIdStr === targetIdStr) {
    return { allowed: true, scope: 'self' };
  }

  if ((requester as Record<string, unknown>).role === 'super_admin') {
    return { allowed: true, scope: 'global' };
  }

  const requesterRole = (requester as Record<string, unknown>).role;
  const requesterSchoolId = toIdString((requester as Record<string, unknown>).schoolId);
  const targetSchoolId = toIdString((target as Record<string, unknown>).schoolId);

  if (requesterRole === 'school_admin' && requesterSchoolId && targetSchoolId && requesterSchoolId === targetSchoolId) {
    return { allowed: true, scope: 'school' };
  }

  return { allowed: false, scope: 'self' };
};

const populateUser = (userId: Types.ObjectId | string) =>
  User.findById(userId)
    .select('-password')
    .populate('schoolId', 'name email phone address website description subscriptionType')
    .populate('classIds', 'name academicYear cohort duration isActive');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const requesterId = getUserIdFromRequest(request);
    if (!requesterId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const requester = await User.findById(requesterId);
    if (!requester) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await params;
    const target = await populateUser(id);
    if (!target) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const permission = canManageUser(requester, target);
    if (!permission.allowed) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ user: serializeUser(target) });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const requesterId = getUserIdFromRequest(request);
    if (!requesterId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const requester = await User.findById(requesterId);
    if (!requester) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await params;
    const target = await User.findById(id);
    if (!target) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const permission = canManageUser(requester, target);
    if (!permission.allowed) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const payload = await request.json().catch(() => ({}));

    const validation = new ValidationResult();

    if (payload.name !== undefined) {
      validation.errors.push(
        ...validateString(payload.name, 'name', { minLength: 2, maxLength: 100 }),
      );
    }

    if (payload.phone !== undefined) {
      validation.errors.push(...validateString(payload.phone, 'phone', { maxLength: 30 }));
    }

    if (payload.bio !== undefined) {
      validation.errors.push(...validateString(payload.bio, 'bio', { maxLength: 500 }));
    }

    if (payload.profileImage !== undefined) {
      validation.errors.push(
        ...validateString(payload.profileImage, 'profileImage', { maxLength: 500 }),
      );
    }

    if (payload.studentId !== undefined) {
      validation.errors.push(
        ...validateString(payload.studentId, 'studentId', { maxLength: 50 }),
      );
    }

    if (payload.role !== undefined) {
      validation.errors.push(
        ...validateEnum(payload.role, 'role', USER_ROLES.map((role) => role), false),
      );
    }

    if (payload.schoolId !== undefined) {
      validation.errors.push(...validateObjectId(payload.schoolId, 'schoolId', false));
    }

    if (payload.classIds !== undefined) {
      if (!Array.isArray(payload.classIds)) {
        validation.addError('classIds', 'classIds must be an array of IDs');
      } else {
        validation.errors.push(
          ...validateArray(payload.classIds, 'classIds', {
            itemValidator: (item) => validateObjectId(item, 'classId'),
          }),
        );
      }
    }

    if (payload.isActive !== undefined && typeof payload.isActive !== 'boolean') {
      validation.addError('isActive', 'isActive must be a boolean');
    }

    if (!validation.isValid()) {
      return validation.getResponse();
    }

    const permittedFields = new Set<string>();

    if (permission.scope === 'self' || permission.scope === 'school' || permission.scope === 'global') {
      ['name', 'phone', 'bio', 'profileImage'].forEach((field) => permittedFields.add(field));
    }

    if (permission.scope === 'school' || permission.scope === 'global') {
      ['isActive', 'classIds'].forEach((field) => permittedFields.add(field));
    }

    if (permission.scope === 'global') {
      ['role', 'schoolId', 'studentId'].forEach((field) => permittedFields.add(field));
    }

    const applyField = (field: string, value: unknown) => {
      if (!permittedFields.has(field)) {
        return;
      }

      switch (field) {
        case 'name':
          target.name = sanitizeString(value as string);
          break;
        case 'phone':
          target.phone = value ? sanitizeString(String(value)) : undefined;
          break;
        case 'bio':
          target.bio = value ? sanitizeString(String(value)) : undefined;
          break;
        case 'profileImage':
          target.profileImage = value ? String(value).trim() : undefined;
          break;
        case 'isActive':
          target.isActive = Boolean(value);
          break;
        case 'classIds':
          target.classIds = (value as string[]).map((clsId) => new Types.ObjectId(clsId));
          break;
        case 'role':
          target.role = value as UserRole;
          break;
        case 'schoolId':
          target.schoolId = value ? new Types.ObjectId(value as string) : undefined;
          break;
        case 'studentId':
          target.studentId = value ? sanitizeString(String(value)) : undefined;
          break;
        default:
          break;
      }
    };

    Object.entries(payload).forEach(([field, value]) => applyField(field, value));

    await target.save();

    const refreshed = await populateUser(target._id);

    return NextResponse.json({ user: serializeUser(refreshed!) });
  } catch {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
