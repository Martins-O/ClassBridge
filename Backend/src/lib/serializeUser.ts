import { Types } from 'mongoose';

type SerializableDocument = {
  toObject?: (options?: unknown) => Record<string, unknown>;
  [key: string]: unknown;
};

const getNestedId = (value: unknown): string | null => {
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
    return getNestedId((value as { _id?: unknown })._id);
  }
  return null;
};

const normaliseDoc = (input: SerializableDocument | Record<string, unknown>) => {
  if (input) {
    const candidate = (input as SerializableDocument).toObject;
    if (typeof candidate === 'function') {
      return candidate.call(input, { getters: true, virtuals: false });
    }
  }
  return input;
};

const sanitise = (value: unknown) => (value === undefined ? null : value);

const getProp = (obj: Record<string, unknown> | null, key: string) =>
  (obj && key in obj ? obj[key] : null);

export interface SerializedUser {
  id: string | null;
  name?: unknown;
  email?: unknown;
  role?: unknown;
  school: {
    id: string | null;
    name?: unknown;
    email?: unknown;
    phone?: unknown;
    address?: unknown;
    website?: unknown;
    description?: unknown;
    subscriptionType?: unknown;
  } | null;
  classes: Array<{
    id: string | null;
    name?: unknown;
    academicYear?: unknown;
    cohort?: unknown;
    duration?: unknown;
    isActive?: unknown;
  }>;
  profileImage?: unknown;
  phone?: unknown;
  bio?: unknown;
  studentId?: unknown;
  isActive?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
  [key: string]: unknown;
}

export const serializeUser = (
  userDoc: SerializableDocument | Record<string, unknown>,
): SerializedUser => {
  const raw = normaliseDoc(userDoc) as Record<string, unknown>;

  const {
    _id,
    id,
    password: _password,
    schoolId,
    classIds,
    ...rest
  } = raw;

  const schoolRaw = schoolId
    ? (normaliseDoc(schoolId as Record<string, unknown>) as Record<string, unknown>)
    : null;

  const classesArray = Array.isArray(classIds) ? classIds : [];

  return {
    id: (id as string | undefined) ?? getNestedId(_id),
    ...rest,
    school: schoolRaw
      ? {
          id: getNestedId(schoolRaw),
          name: sanitise(getProp(schoolRaw, 'name')),
          email: sanitise(getProp(schoolRaw, 'email')),
          phone: sanitise(getProp(schoolRaw, 'phone')),
          address: sanitise(getProp(schoolRaw, 'address')),
          website: sanitise(getProp(schoolRaw, 'website')),
          description: sanitise(getProp(schoolRaw, 'description')),
          subscriptionType: sanitise(getProp(schoolRaw, 'subscriptionType')),
      }
      : null,
    classes: classesArray.map((cls) => {
      const data = normaliseDoc(cls as Record<string, unknown>) as Record<string, unknown>;
      return {
        id: getNestedId(data),
        name: sanitise(getProp(data, 'name')),
        academicYear: sanitise(getProp(data, 'academicYear')),
        cohort: sanitise(getProp(data, 'cohort')),
        duration: sanitise(getProp(data, 'duration')),
        isActive: sanitise(getProp(data, 'isActive')),
      };
    }),
  };
};
