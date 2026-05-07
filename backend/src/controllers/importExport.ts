import { Request, Response } from 'express';
import multer from 'multer';
import connectDB from '@/lib/mongodb';
import { getUserIdFromRequest } from '@/lib/session';
import { userRepository } from '@/repositories';
import { classService } from '@/services';
import { gradeService } from '@/services';
import User from '@/models/User';
import { parseStudentsCSV, parseClassesCSV, generateStudentsCSV, generateClassesCSV, generateGradesCSV } from '@/services/importExport.service';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

export const uploadMiddleware = upload.single('file');

export async function importStudents(req: Request, res: Response) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await userRepository.findById(userId);
    if (!user || !['school_admin', 'system_admin'].includes(user.role)) {
      return res.status(403).json({ error: 'Only administrators can import students' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'CSV file is required' });
    }

    const rows = await parseStudentsCSV(req.file.buffer);
    if (rows.length === 0) {
      return res.status(400).json({ error: 'No valid rows found in CSV' });
    }

    const results = { created: 0, updated: 0, errors: [] as string[] };

    for (const row of rows) {
      try {
        const existing = await User.findOne({ email: row.email, role: 'student' });
        if (existing) {
          existing.name = row.name;
          if (row.phone) existing.phone = row.phone;
          if (row.studentId) existing.studentId = row.studentId;
          existing.schoolId = user.schoolId || user._id;
          await existing.save();
          results.updated++;
        } else {
          const studentData: any = {
            name: row.name,
            email: row.email,
            phone: row.phone,
            studentId: row.studentId || `STU-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            role: 'student',
            schoolId: user.schoolId || user._id,
            password: Math.random().toString(36).slice(-12),
          };
          await User.create(studentData);
          results.created++;
        }
      } catch (error) {
        results.errors.push(`Failed to process ${row.email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return res.json({
      message: `Imported ${results.created} students, updated ${results.updated}`,
      results,
    });
  } catch (error) {
    console.error('Import students error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function importClasses(req: Request, res: Response) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await userRepository.findById(userId);
    if (!user || !['school_admin', 'system_admin'].includes(user.role)) {
      return res.status(403).json({ error: 'Only administrators can import classes' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'CSV file is required' });
    }

    const rows = await parseClassesCSV(req.file.buffer);
    if (rows.length === 0) {
      return res.status(400).json({ error: 'No valid rows found in CSV' });
    }

    const results = { created: 0, errors: [] as string[] };
    const schoolId = user.role === 'system_admin' ? (req.body.schoolId || user.schoolId) : user.schoolId;

    for (const row of rows) {
      try {
        await classService.create({
          name: row.name,
          schoolId: schoolId?.toString() || '',
          academicYear: row.academicYear,
          duration: row.duration,
          cohort: row.cohort,
          description: row.description,
          subject: row.subject,
          grade: row.grade,
        }, user.role, schoolId?.toString());
        results.created++;
      } catch (error) {
        results.errors.push(`Failed to create class "${row.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return res.json({
      message: `Created ${results.created} classes`,
      results,
    });
  } catch (error) {
    console.error('Import classes error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function exportStudents(req: Request, res: Response) {
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

    const query: Record<string, unknown> = { role: 'student' };
    if (user.role === 'school_admin') {
      query.schoolId = user.schoolId;
    }

    const students = await User.find(query).select('name email phone studentId role isActive createdAt').lean();
    const csv = generateStudentsCSV(students);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=students.csv');
    return res.send(csv);
  } catch (error) {
    console.error('Export students error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function exportClasses(req: Request, res: Response) {
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

    const { classes } = await classService.getAll(userId, user.role, user.schoolId?.toString(), 1, 1000);
    const csv = generateClassesCSV(classes);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=classes.csv');
    return res.send(csv);
  } catch (error) {
    console.error('Export classes error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function exportGrades(req: Request, res: Response) {
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

    const { grades } = await gradeService.getAll(userId, user.role, 1, 1000);
    const csv = generateGradesCSV(grades);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=grades.csv');
    return res.send(csv);
  } catch (error) {
    console.error('Export grades error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
