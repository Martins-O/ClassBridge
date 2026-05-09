import { Request, Response } from 'express';
import connectDB from '@/lib/mongodb';
import StudentInvitation from '@/models/StudentInvitation';
import User from '@/models/User';
import Class from '@/models/Class';
import { sendEmail, generateStudentInvitationEmail } from '@/lib/email';
import crypto from 'crypto';
import { getUserIdFromRequest } from '@/lib/session';

// GET /api/students/invitations - Fetch student invitations
export async function getStudentInvitations(req: Request, res: Response) {
  try {
    await connectDB();

    // Check authentication
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check permissions - only school admins can view invitations
    if (!['school_admin', 'system_admin'].includes(user.role)) {
      return res.status(403).json({ error: 'Only school administrators can view invitations' });
    }

    // Build query based on user role
    let query = {};
    if (user.role === 'school_admin') {
      query = { schoolId: user.schoolId };
    }

    // Fetch invitations
    const invitations = await StudentInvitation.find(query)
      .populate('classId', 'name academicYear semester')
      .populate('schoolId', 'name')
      .sort({ createdAt: -1 });

    return res.json({
      invitations: invitations.map(invitation => ({
        _id: invitation._id,
        email: invitation.email,
        name: invitation.name,
        classId: {
          _id: invitation.classId._id,
          name: invitation.classId.name,
          academicYear: invitation.classId.academicYear,
          semester: invitation.classId.semester
        },
        schoolId: invitation.schoolId._id,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        createdAt: invitation.createdAt
      }))
    });

  } catch (error) {
    console.error('Failed to fetch student invitations:', error);
    return res.status(500).json({ error: 'Failed to fetch invitations' });
  }
}

// POST /api/students/invite - Invite a student
export async function inviteStudent(req: Request, res: Response) {
  try {
    await connectDB();

    // Check authentication
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check permissions - only school admins can invite students
    if (!['school_admin', 'system_admin'].includes(user.role)) {
      return res.status(403).json({ error: 'Only school administrators can invite students' });
    }

    const { studentEmail, studentName, classId } = req.body;

    // Validate required fields
    if (!studentEmail || !studentName || !classId) {
      return res.status(400).json({ error: 'Missing required fields: studentEmail, studentName, classId' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(studentEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Get class and school information
    const classData = await Class.findById(classId).populate('schoolId');
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Check if school admin has access to this class
    if (user.role === 'school_admin') {
      const hasAccess = classData.schoolId._id.toString() === user.schoolId?.toString();
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied to this class' });
      }
    }

    // Check if student is already registered
    const existingUser = await User.findOne({ email: studentEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }

    // Check if there's already a pending invitation for this email and class
    const existingInvitation = await StudentInvitation.findOne({
      email: studentEmail,
      classId: classId,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });

    if (existingInvitation) {
      return res.status(400).json({ error: 'An active invitation already exists for this student in this class' });
    }

    // Generate unique invitation token
    const token = crypto.randomUUID();

    // Create invitation with 7-day expiry
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = new StudentInvitation({
      email: studentEmail,
      name: studentName,
      schoolId: classData.schoolId._id,
      classId: classId,
      invitedBy: userId,
      token: token,
      expiresAt: expiresAt
    });

    await invitation.save();

    // Prepare email data
    const school = classData.schoolId as { name: string };
    const emailData = generateStudentInvitationEmail({
      studentEmail,
      studentName,
      schoolName: school.name,
      className: classData.name,
      invitationToken: token,
      inviterName: user.name
    });

    // Send invitation email (will throw if fails)
    await sendEmail(emailData);

    return res.status(201).json({
      message: 'Invitation sent successfully',
      invitation: {
        id: invitation._id,
        email: studentEmail,
        name: studentName,
        className: classData.name,
        expiresAt: expiresAt
      }
    });

  } catch (error) {
    console.error('Failed to invite student:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /api/students/accept-invitation - Accept student invitation
export async function acceptStudentInvitation(req: Request, res: Response) {
  try {
    await connectDB();

    const { token, password } = req.body;

    // Validate required fields
    if (!token || !password) {
      return res.status(400).json({ error: 'Missing required fields: token, password' });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Find the invitation
    const invitation = await StudentInvitation.findOne({
      token: token,
      status: 'pending'
    }).populate(['schoolId', 'classId']);

    if (!invitation) {
      return res.status(404).json({ error: 'Invalid or expired invitation' });
    }

    // Check if invitation has expired
    if (invitation.expiresAt < new Date()) {
      // Mark as expired
      invitation.status = 'expired';
      await invitation.save();

      return res.status(410).json({ error: 'Invitation has expired' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: invitation.email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.default.hash(password, 12);

    // Generate unique student ID
    const studentId = await generateStudentId(invitation.schoolId._id.toString());

    // Create new student user
    const newUser = new User({
      name: invitation.name,
      email: invitation.email,
      password: hashedPassword,
      role: 'student',
      schoolId: invitation.schoolId._id,
      studentId: studentId,
      isActive: true,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      isApproved: true
    });

    await newUser.save();

    // Add student to the class
    await Class.findByIdAndUpdate(
      invitation.classId._id,
      { $addToSet: { studentIds: newUser._id } }
    );

    // Mark invitation as accepted
    invitation.status = 'accepted';
    invitation.acceptedAt = new Date();
    await invitation.save();

    return res.status(201).json({
      message: 'Invitation accepted successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        schoolId: newUser.schoolId
      }
    });

  } catch (error) {
    console.error('Failed to accept student invitation:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Function to generate unique student ID
async function generateStudentId(schoolId: string): Promise<string> {
  const currentYear = new Date().getFullYear();
  const schoolIdLast4 = schoolId.slice(-4).toUpperCase();

  // Find the highest student number for this school and year
  const lastStudent = await User.findOne({
    schoolId: schoolId,
    role: 'student',
    studentId: { $regex: `^${currentYear}${schoolIdLast4}` }
  }).sort({ studentId: -1 });

  let nextNumber = 1;
  if (lastStudent?.studentId) {
    const lastNumber = parseInt(lastStudent.studentId.slice(-4));
    nextNumber = lastNumber + 1;
  }

  return `${currentYear}${schoolIdLast4}${nextNumber.toString().padStart(4, '0')}`;
}

// GET /api/students/invitation/:token - Get student invitation details
export async function getStudentInvitation(req: Request, res: Response) {
  try {
    await connectDB();

    const { token } = req.params;

    // Find the invitation
    const invitation = await StudentInvitation.findOne({
      token: token
    }).populate(['schoolId', 'classId', 'invitedBy']);

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    // Check if invitation has expired
    if (invitation.expiresAt < new Date()) {
      // Mark as expired if not already
      if (invitation.status === 'pending') {
        invitation.status = 'expired';
        await invitation.save();
      }

      return res.status(410).json({ error: 'Invitation has expired' });
    }

    // Check if already accepted
    if (invitation.status === 'accepted') {
      return res.status(410).json({ error: 'Invitation has already been accepted' });
    }

    // Return invitation details
    const inviter = invitation.invitedBy as { name: string; role: string };
    const school = invitation.schoolId as { name: string; _id: string };
    const classData = invitation.classId as { name: string; _id: string; subject?: string; grade?: string } | null;

    return res.json({
      invitation: {
        email: invitation.email,
        name: invitation.name,
        school: {
          name: school.name,
          id: school._id
        },
        class: classData ? {
          name: classData.name,
          id: classData._id,
          subject: classData.subject,
          grade: classData.grade
        } : null,
        inviter: {
          name: inviter.name,
          role: inviter.role
        },
        expiresAt: invitation.expiresAt,
        createdAt: invitation.createdAt
      }
    });

  } catch (error) {
    console.error('Failed to get student invitation:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /api/students/bulk-invite - Bulk invite students
export async function bulkInviteStudents(req: Request, res: Response) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await User.findById(userId);
    if (!user || !['school_admin', 'system_admin'].includes(user.role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { students, classId } = req.body;

    if (!students || !Array.isArray(students) || students.length === 0 || !classId) {
      return res.status(400).json({ error: 'Missing students array or classId' });
    }

    const classData = await Class.findById(classId).populate('schoolId');
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const results = {
      success: [] as string[],
      failed: [] as { email: string; error: string }[],
    };

    const school = classData.schoolId as any;

    // Batch check existing users
    const emails = students.map((s: any) => s.email.toLowerCase());
    const existingUsers = await User.find({ email: { $in: emails } }).select('email').lean();
    const existingEmails = new Set(existingUsers.map((u: any) => u.email.toLowerCase()));

    // Batch check existing invitations
    const existingInvitations = await StudentInvitation.find({ email: { $in: emails } }).select('email').lean();
    const existingInvitationEmails = new Set(existingInvitations.map((i: any) => i.email.toLowerCase()));

    // Prepare valid invitations
    const validInvitations: any[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (const student of students) {
      const { email, name } = student;
      const normalizedEmail = email.toLowerCase();

      if (!email || !name) {
        results.failed.push({ email: email || 'unknown', error: 'Missing name or email' });
        continue;
      }

      if (!emailRegex.test(email)) {
        results.failed.push({ email, error: 'Invalid email format' });
        continue;
      }

      if (existingEmails.has(normalizedEmail)) {
        results.failed.push({ email, error: 'User already exists' });
        continue;
      }

      if (existingInvitationEmails.has(normalizedEmail)) {
        results.failed.push({ email, error: 'Invitation already exists' });
        continue;
      }

      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      validInvitations.push({
        email: normalizedEmail,
        name,
        schoolId: school._id,
        classId: classId,
        invitedBy: userId,
        token,
        expiresAt
      });
    }

    // Batch insert invitations
    if (validInvitations.length > 0) {
      const insertedInvitations = await StudentInvitation.insertMany(validInvitations, { ordered: false });

      // Send emails in batch
      for (let i = 0; i < insertedInvitations.length; i++) {
        const invitation = insertedInvitations[i];
        const student = students.find((s: any) => s.email.toLowerCase() === invitation.email);

        if (student) {
          const emailData = generateStudentInvitationEmail({
            studentEmail: invitation.email,
            studentName: student.name,
            schoolName: school.name,
            className: classData.name,
            invitationToken: invitation.token,
            inviterName: user.name
          });

          try {
            await sendEmail(emailData);
            results.success.push(invitation.email);
          } catch (emailError) {
            await StudentInvitation.findByIdAndDelete(invitation._id);
            results.failed.push({ email: invitation.email, error: 'Failed to send email' });
          }
        }
      }
    }

    return res.json({
      message: `Processed ${students.length} invitations`,
      results
    });

  } catch (error) {
    console.error('Failed to bulk invite students:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
