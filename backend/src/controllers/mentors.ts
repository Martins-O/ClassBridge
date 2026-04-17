import { Request, Response } from 'express';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import School from '@/models/School';
import Class from '@/models/Class';
import MentorInvitation from '@/models/MentorInvitation';
import { sendEmail, generateMentorInvitationEmail } from '@/lib/email';
import crypto from 'crypto';
import { getUserIdFromRequest } from '@/lib/session';

// GET /api/mentors - Fetch mentors for a school
export async function getMentors(req: Request, res: Response) {
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

    // Only school admins and super admins can view mentors
    if (!['school_admin', 'system_admin'].includes(currentUser.role)) {
      return res.status(403).json({ error: 'Only school administrators can view mentors' });
    }

    const { searchParams } = new URL(req.url || 'http://localhost');
    const schoolId = searchParams.get('schoolId') || currentUser.schoolId;

    if (!schoolId) {
      return res.status(400).json({ error: 'School ID is required' });
    }

    // Verify school exists
    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    // For school admins, ensure they can only view mentors from their own school
    if (currentUser.role === 'school_admin' && currentUser.schoolId?.toString() !== schoolId) {
      return res.status(403).json({ error: 'You can only view mentors from your own school' });
    }

    // Fetch mentors and classes in parallel to avoid N+1 queries
    const [mentors, classes] = await Promise.all([
      User.find({
        role: 'mentor',
        schoolId: schoolId,
        isActive: true
      }).select('-password').lean(),
      Class.find({
        schoolId: schoolId
      }).select('name _id mentorIds').lean()
    ]);

    // Group classes by mentor
    const classesByMentor = new Map<string, typeof classes>();
    for (const cls of classes) {
      for (const mentorId of cls.mentorIds) {
        const mentorIdStr = mentorId.toString();
        if (!classesByMentor.has(mentorIdStr)) {
          classesByMentor.set(mentorIdStr, []);
        }
        classesByMentor.get(mentorIdStr)?.push(cls);
      }
    }

    // Attach classes to mentors
    const mentorsWithClasses = mentors.map((mentor: any) => ({
      ...mentor,
      assignedClasses: classesByMentor.get(mentor._id.toString()) || []
    }));

    return res.json({ mentors: mentorsWithClasses });
  } catch (error) {
    console.error('Failed to fetch mentors:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /api/mentors - Create a new mentor (invite mentor to school)
export async function createMentor(req: Request, res: Response) {
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

    // Only school admins and super admins can invite mentors
    if (!['school_admin', 'system_admin'].includes(currentUser.role)) {
      return res.status(403).json({ error: 'Only school administrators can invite mentors' });
    }

    const body = req.body;
    const {
      name,
      email,
      schoolId
    } = body;

    // Validate required fields
    if (!name || !email || !schoolId) {
      return res.status(400).json({ error: 'Name, email, and school ID are required' });
    }

    // Verify school exists
    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    // For school admins, ensure they can only invite mentors to their own school
    if (currentUser.role === 'school_admin' && currentUser.schoolId?.toString() !== schoolId) {
      return res.status(403).json({ error: 'You can only invite mentors to your own school' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      // If user exists but is not a mentor at this school, update their role and school
      if (existingUser.role !== 'mentor' || existingUser.schoolId?.toString() !== schoolId) {
        existingUser.role = 'mentor';
        existingUser.schoolId = schoolId;
        existingUser.isActive = true;
        await existingUser.save();
      }
      return res.status(200).json({
        message: 'Mentor added successfully',
        mentor: existingUser,
        isExistingUser: true
      });
    }

    // Check if there's already a pending invitation for this email and school
    const existingInvitation = await MentorInvitation.findOne({
      email: email.toLowerCase(),
      schoolId: schoolId,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });

    if (existingInvitation) {
      return res.status(400).json({ error: 'An active invitation already exists for this mentor in this school' });
    }

    // Generate unique invitation token
    const token = crypto.randomUUID();

    // Create invitation with 7-day expiry
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = new MentorInvitation({
      email: email.toLowerCase(),
      name,
      schoolId,
      invitedBy: userId,
      token: token,
      expiresAt: expiresAt
    });

    await invitation.save();

    // Prepare email data
    const emailData = generateMentorInvitationEmail({
      mentorEmail: email.toLowerCase(),
      mentorName: name,
      schoolName: school.name,
      invitationToken: token,
      inviterName: currentUser.name
    });

    // Send invitation email (will throw if fails)
    await sendEmail(emailData);

    return res.status(201).json({
      message: 'Mentor invitation sent successfully',
      invitation: {
        id: invitation._id,
        email: email.toLowerCase(),
        name,
        expiresAt: expiresAt
      },
      isExistingUser: false
    });

  } catch (error) {
    console.error('Failed to create mentor:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// PUT /api/mentors - Update mentor class assignments (bulk operation)
export async function updateMentorAssignments(req: Request, res: Response) {
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

    // Only school admins and super admins can manage mentor assignments
    if (!['school_admin', 'system_admin'].includes(currentUser.role)) {
      return res.status(403).json({ error: 'Only school administrators can manage mentor assignments' });
    }

    const body = req.body;
    const {
      mentorId,
      classIds, // Array of class IDs to assign/remove
      action // 'assign' or 'remove'
    } = body;

    if (!mentorId || !classIds || !action) {
      return res.status(400).json({ error: 'Mentor ID, class IDs, and action are required' });
    }

    // Verify mentor exists and belongs to the same school
    const mentor = await User.findById(mentorId);
    if (!mentor || mentor.role !== 'mentor') {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    if (currentUser.role === 'school_admin' &&
        mentor.schoolId?.toString() !== currentUser.schoolId?.toString()) {
      return res.status(403).json({ error: 'You can only manage mentors from your own school' });
    }

    if (action === 'assign') {
      // Assign mentor to classes
      for (const classId of classIds) {
        const classDoc = await Class.findById(classId);
        if (classDoc && !classDoc.mentorIds.includes(mentorId)) {
          classDoc.mentorIds.push(mentorId);
          await classDoc.save();
        }
      }
    } else if (action === 'remove') {
      // Remove mentor from classes
      for (const classId of classIds) {
        const classDoc = await Class.findById(classId);
        if (classDoc) {
          classDoc.mentorIds = classDoc.mentorIds.filter(
            (id: string) => id.toString() !== mentorId
          );
          await classDoc.save();
        }
      }
    }

    // Return updated mentor with class assignments
    const updatedMentor = await User.findById(mentorId).select('-password');
    const assignedClasses = await Class.find({
      mentorIds: mentorId
    }).select('name _id');

    return res.json({
      message: `Mentor ${action}ed to classes successfully`,
      mentor: {
        ...updatedMentor.toObject(),
        assignedClasses
      }
    });

  } catch (error) {
    console.error('Failed to update mentor assignments:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// PUT /api/mentors/:id - Update mentor information or assign/remove from classes
export async function updateMentor(req: Request, res: Response) {
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

    // Only school admins and super admins can update mentors
    if (!['school_admin', 'system_admin'].includes(currentUser.role)) {
      return res.status(403).json({ error: 'Only school administrators can update mentors' });
    }

    const { id: mentorId } = req.params;
    const body = req.body;
    const {
      name,
      email,
      classIds, // Array of class IDs to assign the mentor to
      action // 'assign' or 'remove' for class assignment
    } = body;

    // Find the mentor
    const mentor = await User.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    // Verify mentor belongs to the same school as the current user
    if (currentUser.role === 'school_admin' &&
      mentor.schoolId?.toString() !== currentUser.schoolId?.toString()) {
      return res.status(403).json({ error: 'You can only manage mentors from your own school' });
    }

    if (name || email) {
      // Update mentor information
      if (name) mentor.name = name;
      if (email) mentor.email = email.toLowerCase();
      await mentor.save();
    }

    if (classIds && action) {
      if (action === 'assign') {
        // Assign mentor to classes
        for (const classId of classIds) {
          const classDoc = await Class.findById(classId);
          if (classDoc && !classDoc.mentorIds.includes(mentorId)) {
            classDoc.mentorIds.push(mentorId);
            await classDoc.save();
          }
        }
      } else if (action === 'remove') {
        // Remove mentor from classes
        for (const classId of classIds) {
          const classDoc = await Class.findById(classId);
          if (classDoc) {
            classDoc.mentorIds = classDoc.mentorIds.filter(
              (id: string) => id.toString() !== mentorId
            );
            await classDoc.save();
          }
        }
      }
    }

    // Get updated mentor with class assignments
    const updatedMentor = await User.findById(mentorId).select('-password');
    const assignedClasses = await Class.find({
      mentorIds: mentorId
    }).select('name _id');

    return res.json({
      message: 'Mentor updated successfully',
      mentor: {
        ...updatedMentor.toObject(),
        assignedClasses
      }
    });

  } catch (error) {
    console.error('Failed to update mentor:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// DELETE /api/mentors/:id - Deactivate mentor
export async function deleteMentor(req: Request, res: Response) {
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

    // Only school admins and super admins can deactivate mentors
    if (!['school_admin', 'system_admin'].includes(currentUser.role)) {
      return res.status(403).json({ error: 'Only school administrators can deactivate mentors' });
    }

    const { id: mentorId } = req.params;

    // Find the mentor
    const mentor = await User.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    // Verify mentor belongs to the same school as the current user
    if (currentUser.role === 'school_admin' &&
      mentor.schoolId?.toString() !== currentUser.schoolId?.toString()) {
      return res.status(403).json({ error: 'You can only manage mentors from your own school' });
    }

    // Deactivate the mentor instead of deleting
    mentor.isActive = false;
    await mentor.save();

    // Remove mentor from all classes
    await Class.updateMany(
      { mentorIds: mentorId },
      { $pull: { mentorIds: mentorId } }
    );

    return res.json({
      message: 'Mentor deactivated successfully'
    });

  } catch (error) {
    console.error('Failed to delete mentor:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/mentors/:id - Fetch single mentor details
export async function getMentor(req: Request, res: Response) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id: mentorId } = req.params;

    // Fetch mentor details
    const mentor = await User.findById(mentorId).select('-password');
    if (!mentor || mentor.role !== 'mentor') {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    // Get class assignments
    const assignedClasses = await Class.find({
      mentorIds: mentorId
    }).select('name _id academicYear semester');

    return res.json({
      mentor: {
        ...mentor.toObject(),
        assignedClasses
      }
    });

  } catch (error) {
    console.error('Failed to fetch mentor:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/mentors/accept-invitation/:token - Get mentor invitation details
export async function getMentorInvitation(req: Request, res: Response) {
  try {
    await connectDB();

    const { token } = req.params;

    // Find the invitation by token
    const invitation = await MentorInvitation.findOne({
      token,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    }).populate('schoolId', 'name');

    if (!invitation) {
      return res.status(404).json({ error: 'Invalid or expired invitation' });
    }

    // Get inviter information
    const inviter = await User.findById(invitation.invitedBy).select('name');

    return res.json({
      invitation: {
        _id: invitation._id,
        email: invitation.email,
        name: invitation.name,
        schoolName: invitation.schoolId.name,
        inviterName: inviter?.name || 'School Administrator',
        expiresAt: invitation.expiresAt,
        status: invitation.status
      }
    });

  } catch (error) {
    console.error('Failed to get mentor invitation:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /api/mentors/accept-invitation/:token - Accept mentor invitation
export async function acceptMentorInvitation(req: Request, res: Response) {
  try {
    await connectDB();

    const { token } = req.params;
    const { password } = req.body;

    // Validate password
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Find the invitation by token
    const invitation = await MentorInvitation.findOne({
      token,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });

    if (!invitation) {
      return res.status(404).json({ error: 'Invalid or expired invitation' });
    }

    // Check if user already exists (shouldn't happen if invitation was created properly)
    const existingUser = await User.findOne({ email: invitation.email });
    if (existingUser) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }

    // Hash password
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.default.hash(password, 12);

    // Create new mentor user
    const newMentor = new User({
      name: invitation.name,
      email: invitation.email,
      password: hashedPassword,
      role: 'mentor',
      schoolId: invitation.schoolId,
      isActive: true
    });

    await newMentor.save();

    // Update invitation status
    invitation.status = 'accepted';
    invitation.acceptedAt = new Date();
    await invitation.save();

    // Get school information for response
    const school = await School.findById(invitation.schoolId).select('name');

    return res.status(201).json({
      message: 'Mentor account created successfully',
      mentor: {
        _id: newMentor._id,
        name: newMentor.name,
        email: newMentor.email,
        role: newMentor.role,
        schoolName: school?.name
      }
    });

  } catch (error) {
    console.error('Failed to accept mentor invitation:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
