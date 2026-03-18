import { Request, Response } from 'express';
import connectDB from '@/lib/mongodb';
import { getUserIdFromRequest } from '@/lib/session';
import { getPaginationParams, paginate } from '@/lib/pagination';
import { getQueryParams, buildQuery } from '@/lib/queryBuilder';
import { userRepository } from '@/repositories';
import { schoolService } from '@/services';
import { sendSuccess, sendError, sendPaginated } from '@/lib/apiResponse';

export async function getSchools(req: Request, res: Response) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return sendError(res, 'Authentication required', 401, 'AUTH_REQUIRED');
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      return sendError(res, 'User not found', 404, 'USER_NOT_FOUND');
    }

    const { page, limit } = getPaginationParams(req, { defaultLimit: 20, maxLimit: 100 });
    const { filters, search } = getQueryParams(req, {
      allowedFilterFields: ['isActive', 'name'],
      allowedSortFields: ['name', 'createdAt']
    });

    const query = buildQuery(filters, search);
    const result = await schoolService.getAll(userId, user.role, page, limit, query);

    return sendPaginated(res, result.schools, {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
      hasNext: page < Math.ceil(result.total / limit),
      hasPrev: page > 1
    });
  } catch (error) {
    console.error('Get schools error:', error);
    return sendError(res, 'Internal server error', 500);
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

    try {
      const school = await schoolService.create({
        name,
        email,
        phone,
        address,
        website,
        description,
        adminId,
      });

      return res.status(201).json({
        message: 'School registered successfully',
        school,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      throw error;
    }
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

    const user = await userRepository.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { id } = req.params;
    const school = await schoolService.getById(id);

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

    const user = await userRepository.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { id } = req.params;
    const body = req.body;

    try {
      const school = await schoolService.update(id, body, user.role, user.schoolId?.toString());

      return res.json({
        message: 'School updated successfully',
        school,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      throw error;
    }
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

    const user = await userRepository.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const schools = await schoolService.getForUser(userId, user.role);

    return res.json({ schools });
  } catch (error) {
    console.error('Get schools for user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
