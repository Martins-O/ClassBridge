import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const getStorage = (folder: string, resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto') => {
    return new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder,
            resource_type: resourceType,
        } as any,
    });
};

export const uploadProfileImage = multer({
    storage: getStorage('classbridge/profiles', 'image'),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed for profile images'));
        }
    },
});

export const uploadCourseMaterial = multer({
    storage: getStorage('classbridge/courses/materials'),
    limits: {
        fileSize: 50 * 1024 * 1024,
    },
});

export const uploadAssessmentMaterial = multer({
    storage: getStorage('classbridge/assessments/materials'),
    limits: {
        fileSize: 50 * 1024 * 1024,
    },
});

export interface CloudinaryUploadResult {
    public_id: string;
    secure_url: string;
    url: string;
    format: string;
    width?: number;
    height?: number;
    bytes: number;
    resource_type: string;
}
