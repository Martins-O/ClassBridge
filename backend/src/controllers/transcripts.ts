import { Request, Response } from 'express';
import connectDB from '@/lib/mongodb';
import Transcript from '@/models/Transcript';
import User from '@/models/User';
import Class from '@/models/Class';
import { getUserIdFromRequest } from '@/lib/session';
import { generateTranscriptPDF, generateTranscriptCSV, TranscriptData } from '@/services/export.service';
import { hasPermission, canViewOwnGradesOnly, canViewAllGrades, isSystemAdmin } from '@/lib/permissions';
import { PERMISSIONS } from '@/lib/permissions';
import { UserRole } from '@/models/User';

// GET /api/transcripts - Fetch transcripts with filtering
export async function getTranscripts(req: Request, res: Response) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { searchParams } = new URL(req.url || 'http://localhost');
    const studentId = searchParams.get('studentId');
    const schoolId = searchParams.get('schoolId');

    const query: Record<string, unknown> = {};

    // Role-based access control using permission helpers
    if (isSystemAdmin(currentUser.role as UserRole)) {
      if (studentId) query.studentId = studentId;
      if (schoolId) query.schoolId = schoolId;
    } else if (canViewAllGrades(currentUser.role as UserRole)) {
      query.schoolId = currentUser.schoolId;
      if (studentId) query.studentId = studentId;
    } else if (currentUser.role === 'mentor') {
      // Mentors can view transcripts for students in their classes
      const mentorClasses = await Class.find({ mentorIds: userId }).select('_id');
      const classIds = mentorClasses.map((c: any) => c._id);
      if (studentId) {
        // Verify student is in one of mentor's classes
        const student = await User.findById(studentId);
        if (!student || !student.classIds?.some((cid: any) => classIds.some((mcid: any) => mcid.equals(cid)))) {
          return res.status(403).json({ error: 'You can only view transcripts for students in your classes' });
        }
        query.studentId = studentId;
      } else {
        // Return transcripts for all students in mentor's classes
        const studentIds = await User.find({ classIds: { $in: classIds }, role: 'student' }).distinct('_id');
        query.studentId = { $in: studentIds };
      }
    } else if (canViewOwnGradesOnly(currentUser.role as UserRole)) {
      query.studentId = userId;
    } else {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const transcripts = await Transcript.find(query)
      .populate('studentId', 'name email')
      .populate('schoolId', 'name')
      .sort({ lastUpdated: -1 });

    return res.json({ transcripts });

  } catch (error) {
    console.error('Failed to fetch transcripts:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /api/transcripts - Create or update a transcript
export async function createTranscript(req: Request, res: Response) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Only users with MANAGE_TRANSCRIPTS permission can create/update transcripts
    if (!hasPermission(currentUser.role as UserRole, PERMISSIONS.MANAGE_TRANSCRIPTS)) {
      return res.status(403).json({ error: 'Permission denied: MANAGE_TRANSCRIPTS required' });
    }

    const { studentId, courseRecord } = req.body;

    if (!studentId || !courseRecord) {
      return res.status(400).json({ error: 'Student ID and course record are required' });
    }

    // Validate the student exists
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Verify permissions for the specific student/class
    if (currentUser.role === 'mentor') {
      const classData = await Class.findById(courseRecord.classId);
      if (!classData || !classData.mentorIds.includes(userId)) {
        return res.status(403).json({ error: 'You can only add grades for classes you mentor' });
      }
    } else if (currentUser.role === 'school_admin') {
      if (student.schoolId?.toString() !== currentUser.schoolId?.toString()) {
        return res.status(403).json({ error: 'You can only manage transcripts for students in your school' });
      }
    }

    // Find or create transcript
    let transcript = await Transcript.findOne({ studentId });

    if (!transcript) {
      // Create new transcript
      transcript = new Transcript({
        studentId,
        schoolId: student.schoolId,
        studentInfo: {
          name: student.name,
          email: student.email,
          studentNumber: student.studentId || 'N/A',
          enrollmentDate: student.createdAt
        },
        courseRecords: [courseRecord]
      });
    } else {
      // Update existing transcript
      const existingRecordIndex = transcript.courseRecords.findIndex(
        (record: { classId: { toString(): string } }) => record.classId.toString() === courseRecord.classId
      );

      if (existingRecordIndex >= 0) {
        // Update existing course record
        transcript.courseRecords[existingRecordIndex] = courseRecord;
      } else {
        // Add new course record
        transcript.courseRecords.push(courseRecord);
      }
    }

    await transcript.save();

    return res.status(201).json({
      message: 'Transcript updated successfully',
      transcript
    });

  } catch (error) {
    console.error('Failed to create transcript:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/transcripts/:id - Fetch a specific transcript
export async function getTranscript(req: Request, res: Response) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { id: transcriptId } = req.params;

    const transcript = await Transcript.findById(transcriptId)
      .populate('studentId', 'name email studentId')
      .populate('schoolId', 'name address')
      .populate('courseRecords.classId', 'name')
      .populate('courseRecords.mentorId', 'name');

    if (!transcript) {
      return res.status(404).json({ error: 'Transcript not found' });
    }

    // Permission check
    let hasAccess = false;

    if (currentUser.role === 'student') {
      hasAccess = transcript.studentId._id.toString() === userId;
    } else if (currentUser.role === 'mentor') {
      // Check if mentor has taught any of the courses in the transcript
      const mentorClasses = await Class.find({ mentorIds: userId }).select('_id');
      const mentorClassIds = mentorClasses.map(cls => cls._id.toString());
      hasAccess = transcript.courseRecords.some((record: { classId: { _id: { toString(): string } } }) =>
        mentorClassIds.includes(record.classId._id.toString())
      );
    } else if (currentUser.role === 'school_admin') {
      hasAccess = transcript.schoolId._id.toString() === currentUser.schoolId?.toString();
    } else if (currentUser.role === 'system_admin') {
      hasAccess = true;
    }

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    return res.json({ transcript });

  } catch (error) {
    console.error('Failed to fetch transcript:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// PUT /api/transcripts/:id - Update a transcript
export async function updateTranscript(req: Request, res: Response) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Only mentors, school admins, and system admins can update transcripts
    if (!['mentor', 'school_admin', 'system_admin'].includes(currentUser.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { id: transcriptId } = req.params;
    const updateData = req.body;

    const transcript = await Transcript.findById(transcriptId);
    if (!transcript) {
      return res.status(404).json({ error: 'Transcript not found' });
    }

    // Permission check for updates
    if (currentUser.role === 'school_admin') {
      if (transcript.schoolId.toString() !== currentUser.schoolId?.toString()) {
        return res.status(403).json({ error: 'You can only update transcripts from your school' });
      }
    }

    // Update transcript fields
    Object.keys(updateData).forEach(key => {
      if (key !== '_id' && key !== 'createdAt') {
        transcript[key] = updateData[key];
      }
    });

    await transcript.save();

    return res.json({
      message: 'Transcript updated successfully',
      transcript
    });

  } catch (error) {
    console.error('Failed to update transcript:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// DELETE /api/transcripts/:id - Delete a transcript
export async function deleteTranscript(req: Request, res: Response) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Only school admins and system admins can delete transcripts
    if (!['school_admin', 'system_admin'].includes(currentUser.role)) {
      return res.status(403).json({ error: 'Only administrators can delete transcripts' });
    }

    const { id: transcriptId } = req.params;

    const transcript = await Transcript.findById(transcriptId);
    if (!transcript) {
      return res.status(404).json({ error: 'Transcript not found' });
    }

    // Permission check
    if (currentUser.role === 'school_admin') {
      if (transcript.schoolId.toString() !== currentUser.schoolId?.toString()) {
        return res.status(403).json({ error: 'You can only delete transcripts from your school' });
      }
    }

    await Transcript.findByIdAndDelete(transcriptId);

    return res.json({
      message: 'Transcript deleted successfully'
    });

  } catch (error) {
    console.error('Failed to delete transcript:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function exportTranscript(req: Request, res: Response) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;
    const format = req.query.format as string || 'pdf';

    const transcript = await Transcript.findById(id)
      .populate('studentId', 'name email studentId')
      .populate('schoolId', 'name');

    if (!transcript) {
      return res.status(404).json({ error: 'Transcript not found' });
    }

    const transcriptData: TranscriptData = {
      studentInfo: {
        name: transcript.studentInfo.name,
        email: transcript.studentInfo.email,
        studentNumber: transcript.studentInfo.studentNumber,
        enrollmentDate: transcript.studentInfo.enrollmentDate
      },
      courseRecords: transcript.courseRecords.map((record: any) => ({
        className: record.className,
        academicYear: record.academicYear,
        duration: record.duration,
        cohort: record.cohort,
        grade: record.grade,
        credits: record.credits,
        mentorName: record.mentorName,
        completedDate: record.completedDate
      })),
      academicSummary: transcript.academicSummary
    };

    if (format === 'csv') {
      const csv = generateTranscriptCSV(transcriptData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=transcript-${id}.csv`);
      return res.send(csv);
    }

    const pdf = await generateTranscriptPDF(transcriptData);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=transcript-${id}.pdf`);
    return res.send(pdf);

  } catch (error) {
    console.error('Failed to export transcript:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
