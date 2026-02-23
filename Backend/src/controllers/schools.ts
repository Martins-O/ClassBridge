import { Request, Response } from 'express';
import connectDB from '@/lib/mongodb';
import School from '@/models/School';
import User from '@/models/User';
import { getUserIdFromRequest } from '@/lib/session';

export async function getSchools(req: Request, res: Response) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let schools;

    if (user.role === 'super_admin') {
      schools = await School.find().populate('adminId');
    } else if (user.role === 'school_admin') {
      schools = await School.find({ _id: user.schoolId }).populate('adminId');
    } else {
      schools = await School.find().select('name _id');
    }

    return res.json({ schools });
  } catch (error) {
    console.error('Get schools error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createSchool(req: Request, res: Response) {
  try {
    await connectDB();

    const body = req.body;
    const { name, email, phone, address, website, description, adminId } = body;

    if (!name || !email || !adminId) {
      return res.status(400).json({ error: 'Name, email, and admin ID are required' });
    }

    const existingSchool = await School.findOne({ email: email.toLowerCase() });
    if (existingSchool) {
      return res.status(400).json({ error: 'School with this email already exists' });
    }

    const adminUser = await User.findById(adminId);
    if (!adminUser) {
      return res.status(404).json({ error: 'Admin user not found' });
    }

    const school = new School({
      name,
      email: email.toLowerCase(),
      phone,
      address,
      website,
      description,
      adminId: adminUser._id,
    });

    await school.save();

    adminUser.role = 'school_admin';
    adminUser.schoolId = school._id;
    await adminUser.save();

    return res.status(201).json({
      message: 'School registered successfully',
      school: {
        id: school._id,
        name: school.name,
        email: school.email,
        adminId: school.adminId,
      },
    });
  } catch (error) {
    console.error('Create school error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getSchoolById(req: Request, res: Response) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { id } = req.params;
    const school = await School.findById(id).populate('adminId', 'name email');
    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    let hasAccess = false;

    if (user.role === 'super_admin') {
      hasAccess = true;
    } else if (user.role === 'school_admin') {
      hasAccess = school._id.toString() === user.schoolId?.toString();
    }

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    return res.json({ school });
  } catch (error) {
    console.error('Get school by id error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateSchool(req: Request, res: Response) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const requestingUser = await User.findById(userId);
    if (!requestingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { id } = req.params;
    const body = req.body;
    const { name, email, phone, address, website, description, subscriptionType } = body;

    const school = await School.findById(id);
    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    const isSuperAdmin = requestingUser.role === 'super_admin';
    const isSchoolAdmin = requestingUser.role === 'school_admin' && requestingUser.schoolId?.toString() === school._id.toString();

    if (!isSuperAdmin && !isSchoolAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (email && email !== school.email) {
      const existingSchool = await School.findOne({
        email: email.toLowerCase(),
        _id: { $ne: id },
      });
      if (existingSchool) {
        return res.status(400).json({ error: 'Email already in use by another school' });
      }
      school.email = email.toLowerCase();
    }

    if (name) school.name = name;
    if (phone !== undefined) school.phone = phone;
    if (address !== undefined) school.address = address;
    if (website !== undefined) school.website = website;
    if (description !== undefined) school.description = description;
    if (subscriptionType) school.subscriptionType = subscriptionType;

    await school.save();

    return res.json({
      message: 'School updated successfully',
      school: {
        id: school._id,
        name: school.name,
        email: school.email,
      },
    });
  } catch (error) {
    console.error('Update school error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getSchoolsForUser(req: Request, res: Response) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findById(userId).select('role schoolId');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'super_admin') {
      const schools = await School.find({}).populate('adminId', 'name email');
      return res.json({ schools });
    }

    if (user.role === 'school_admin') {
      const schools = await School.find({ adminId: userId }).populate('adminId', 'name email');
      return res.json({ schools });
    }

    return res.status(403).json({ error: 'Access denied' });
  } catch (error) {
    console.error('Get schools for user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
