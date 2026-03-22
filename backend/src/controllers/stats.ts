import { Request, Response } from 'express';
import { Types } from 'mongoose';
import connectDB from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth';
import { getFromCache, setToCache, buildCacheKey } from '@/lib/cache';
import User from '@/models/User';
import School from '@/models/School';
import Class from '@/models/Class';
import Assessment from '@/models/Assessment';
import AssessmentAttempt from '@/models/AssessmentAttempt';
import Grade from '@/models/Grade';
import { isSystemAdmin } from '@/lib/permissions';
import { UserRole } from '@/models/User';
import SchoolApproval from '@/models/SchoolApproval';
import DeletionRequest from '@/models/DeletionRequest';

interface GlobalStats {
  totalClasses: number;
  totalSchools: number;
  totalApprovedSchools: number;
  totalPendingSchools: number;
  totalStudents: number;
  totalMentors: number;
  totalStaff: number;
  pendingSchoolApprovals: number;
  pendingDeletionRequests: number;
}

interface DashboardStats {
  totalClasses: number;
  totalSchools: number;
  totalStudents: number;
  totalMentors: number;
}

interface StudentStats {
  myClasses: number;
  pendingAssessments: number;
  completedAssessments: number;
  averageGrade: number;
}

type PossibleId = Types.ObjectId | string | null | undefined;

const EMPTY_STATS: DashboardStats = {
  totalClasses: 0,
  totalSchools: 0,
  totalStudents: 0,
  totalMentors: 0,
};

const EMPTY_STUDENT_STATS: StudentStats = {
  myClasses: 0,
  pendingAssessments: 0,
  completedAssessments: 0,
  averageGrade: 0,
};

function toObjectId(value: unknown): Types.ObjectId | undefined {
  if (!value) return undefined;
  if (value instanceof Types.ObjectId) return value;
  try {
    return new Types.ObjectId(String(value));
  } catch {
    return undefined;
  }
}

function addIdToSet(set: Set<string>, value: PossibleId) {
  if (!value) return;
  set.add(value instanceof Types.ObjectId ? value.toString() : String(value));
}

function toStringSet(values: PossibleId[]): Set<string> {
  const set = new Set<string>();
  values.forEach((value: PossibleId) => {
    addIdToSet(set, value);
  });
  return set;
}

export async function getStats(req: Request, res: Response) {
  try {
    await connectDB();

    const userId = getUserFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const cacheKey = buildCacheKey('stats', userId, user.role);
    const cachedStats = await getFromCache<{ stats: DashboardStats; studentStats?: StudentStats }>(cacheKey);
    
    if (cachedStats) {
      return res.json(cachedStats);
    }

    let stats: DashboardStats = { ...EMPTY_STATS };
    let studentStats: StudentStats | undefined;

    if (user.role === 'system_admin') {
      const [totalClasses, totalSchools, totalStudents, totalMentors] = await Promise.all([
        Class.countDocuments(),
        School.countDocuments(),
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'mentor' }),
      ]);

      stats = {
        totalClasses,
        totalSchools,
        totalStudents,
        totalMentors,
      };

      return res.json({ stats });
    }

    if (user.role === 'school_admin') {
      const schoolIdSet = toStringSet([
        user.schoolId as Types.ObjectId | undefined,
      ]);

      const adminSchools = await School.find({ adminId: user._id }).select('_id');
      adminSchools.forEach((school) => {
        schoolIdSet.add(school._id.toString());
      });

      const schoolIds = Array.from(schoolIdSet).map((id) => new Types.ObjectId(id));

      if (schoolIds.length === 0) {
        return res.json({ stats });
      }

      const [totalClasses, totalStudents, totalMentors] = await Promise.all([
        Class.countDocuments({ schoolId: { $in: schoolIds } }),
        User.countDocuments({ role: 'student', schoolId: { $in: schoolIds } }),
        User.countDocuments({ role: 'mentor', schoolId: { $in: schoolIds } }),
      ]);

      stats = {
        totalClasses,
        totalSchools: schoolIds.length,
        totalStudents,
        totalMentors,
      };

      return res.json({ stats });
    }

    if (user.role === 'mentor') {
      const mentorClasses = await Class.find({ mentorIds: user._id }).select('mentorIds studentIds schoolId');

      const studentIds = new Set<string>();
      const mentorIds = new Set<string>();
      const schoolIds = new Set<string>();

      mentorClasses.forEach((classDoc) => {
        classDoc.studentIds?.forEach((studentId: PossibleId) => {
          addIdToSet(studentIds, studentId);
        });
        classDoc.mentorIds?.forEach((mentorId: PossibleId) => {
          addIdToSet(mentorIds, mentorId);
        });
        if (classDoc.schoolId) {
          schoolIds.add(classDoc.schoolId.toString());
        }
      });

      mentorIds.add(user._id.toString());

      const [pendingAssessments, completedAssessments] = await Promise.all([
        AssessmentAttempt.countDocuments({ assessorId: user._id, isComplete: false }),
        AssessmentAttempt.countDocuments({ assessorId: user._id, isComplete: true }),
      ]);

      stats = {
        totalClasses: mentorClasses.length,
        totalSchools: schoolIds.size || (user.schoolId ? 1 : 0),
        totalStudents: studentIds.size,
        totalMentors: mentorIds.size,
      };

      studentStats = {
        ...EMPTY_STUDENT_STATS,
        myClasses: mentorClasses.length,
        pendingAssessments,
        completedAssessments,
      };

      return res.json({ stats, studentStats });
    }

    // Student view
    const studentClasses = await Class.find({ studentIds: user._id }).select('mentorIds studentIds schoolId');

    const classIds = studentClasses.map((classDoc) => classDoc._id);
    const mentorIds = new Set<string>();
    const peerIds = new Set<string>();
    const schoolIds = new Set<string>();

    studentClasses.forEach((classDoc) => {
      classDoc.mentorIds?.forEach((mentorId: PossibleId) => {
        addIdToSet(mentorIds, mentorId);
      });
      classDoc.studentIds?.forEach((studentId: PossibleId) => {
        addIdToSet(peerIds, studentId);
      });
      if (classDoc.schoolId) {
        schoolIds.add(classDoc.schoolId.toString());
      }
    });

    const studentObjectId = new Types.ObjectId(user._id.toString());

    const assessmentQuery: Record<string, unknown> = {
      isActive: true,
      targetRole: 'student',
    };

    const schoolObjectId = toObjectId(user.schoolId);
    if (schoolObjectId) {
      assessmentQuery.schoolId = schoolObjectId;
    }

    const orClauses: Record<string, unknown>[] = [];
    if (classIds.length > 0) {
      orClauses.push({ classIds: { $in: classIds } });
    }
    orClauses.push({ classIds: { $exists: false } });
    orClauses.push({ classIds: { $eq: [] } });

    assessmentQuery.$or = orClauses;

    const [
      activeAssessments,
      pendingAttemptCount,
      completedAttemptCount,
      gradeAggregate,
    ] = await Promise.all([
      Assessment.countDocuments(assessmentQuery),
      AssessmentAttempt.countDocuments({ respondentId: studentObjectId, isComplete: false }),
      AssessmentAttempt.countDocuments({ respondentId: studentObjectId, isComplete: true }),
      Grade.aggregate<{ _id: unknown; avgPercentage: number | null }>([
        { $match: { studentId: studentObjectId } },
        { $group: { _id: null, avgPercentage: { $avg: '$percentage' } } },
      ]),
    ]);

    const averageGrade = gradeAggregate.length > 0 && gradeAggregate[0].avgPercentage
      ? Math.round(gradeAggregate[0].avgPercentage)
      : 0;

    const pendingAssessments = Math.max(activeAssessments - completedAttemptCount, pendingAttemptCount);
    const completedAssessments = completedAttemptCount;

    stats = {
      totalClasses: studentClasses.length,
      totalSchools: schoolIds.size || (user.schoolId ? 1 : 0),
      totalStudents: peerIds.size || studentClasses.length,
      totalMentors: mentorIds.size,
    };

    studentStats = {
      myClasses: studentClasses.length,
      pendingAssessments,
      completedAssessments,
      averageGrade,
    };

    const result = { stats, studentStats };
    await setToCache(cacheKey, result, { ttl: 60 });

    return res.json(result);
  } catch (error) {
    console.error('Failed to build dashboard stats', error);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
}

export async function getGlobalStats(req: Request, res: Response) {
  try {
    await connectDB();

    const userId = getUserFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!isSystemAdmin(user.role as UserRole)) {
      return res.status(403).json({ error: 'System admin access required' });
    }

    const cacheKey = buildCacheKey('global_stats');
    const cachedStats = await getFromCache<GlobalStats>(cacheKey);
    
    if (cachedStats) {
      return res.json({ stats: cachedStats });
    }

    const [
      totalClasses,
      totalSchools,
      totalApprovedSchools,
      totalPendingSchools,
      totalStudents,
      totalMentors,
      totalStaff,
      pendingSchoolApprovals,
      pendingDeletionRequests,
    ] = await Promise.all([
      Class.countDocuments(),
      School.countDocuments(),
      School.countDocuments({ status: 'approved' }),
      School.countDocuments({ status: 'pending' }),
      User.countDocuments({ role: 'student', isActive: true }),
      User.countDocuments({ role: 'mentor', isActive: true }),
      User.countDocuments({ 
        role: { $in: ['school_admin', 'admissions', 'counselor', 'office_staff'] }, 
        isActive: true 
      }),
      SchoolApproval.countDocuments({ status: 'pending' }),
      DeletionRequest.countDocuments({ status: 'pending' }),
    ]);

    const globalStats: GlobalStats = {
      totalClasses,
      totalSchools,
      totalApprovedSchools,
      totalPendingSchools,
      totalStudents,
      totalMentors,
      totalStaff,
      pendingSchoolApprovals,
      pendingDeletionRequests,
    };

    await setToCache(cacheKey, globalStats, { ttl: 30 });

    return res.json({ stats: globalStats });
  } catch (error) {
    console.error('Failed to build global stats', error);
    return res.status(500).json({ error: 'Failed to fetch global stats' });
  }
}
