import { Request, Response } from 'express';
import connectDB from '@/lib/mongodb';
import { getUserIdFromRequest } from '@/lib/session';
import User from '@/models/User';
import Course from '@/models/Course';
import Assessment from '@/models/Assessment';

interface UploadedFile {
    path?: string;
    filename?: string;
    originalname?: string;
    mimetype?: string;
    size?: number;
    secure_url?: string;
    public_id?: string;
}

export async function uploadProfileImage(req: Request, res: Response) {
    try {
        await connectDB();

        const userId = getUserIdFromRequest(req);
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const file = req.file as UploadedFile | undefined;
        if (!file || !file.secure_url) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { profileImage: file.secure_url },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.json({
            message: 'Profile image uploaded successfully',
            profileImage: file.secure_url,
            user
        });
    } catch (error) {
        console.error('Upload profile image error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export async function uploadCourseMaterial(req: Request, res: Response) {
    try {
        await connectDB();

        const userId = getUserIdFromRequest(req);
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const { id: courseId } = req.params;
        const file = req.file as UploadedFile | undefined;

        if (!file || !file.secure_url) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const material = {
            title: req.body.title || file.originalname || 'Untitled',
            description: req.body.description || '',
            url: file.secure_url,
            type: getFileType(file.mimetype || ''),
            uploadedAt: new Date()
        };

        course.materials = course.materials || [];
        course.materials.push(material);
        await course.save();

        return res.json({
            message: 'Material uploaded successfully',
            material
        });
    } catch (error) {
        console.error('Upload course material error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export async function uploadAssessmentMaterial(req: Request, res: Response) {
    try {
        await connectDB();

        const userId = getUserIdFromRequest(req);
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const { id: assessmentId } = req.params;
        const file = req.file as UploadedFile | undefined;

        if (!file || !file.secure_url) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const assessment = await Assessment.findById(assessmentId);
        if (!assessment) {
            return res.status(404).json({ error: 'Assessment not found' });
        }

        const material = {
            title: req.body.title || file.originalname || 'Untitled',
            description: req.body.description || '',
            url: file.secure_url,
            type: getFileType(file.mimetype || ''),
            uploadedAt: new Date()
        };

        (assessment as any).materials = (assessment as any).materials || [];
        (assessment as any).materials.push(material);
        await assessment.save();

        return res.json({
            message: 'Material uploaded successfully',
            material
        });
    } catch (error) {
        console.error('Upload assessment material error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

function getFileType(mimetype: string): 'document' | 'video' | 'link' | 'image' {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'video';
    return 'document';
}
