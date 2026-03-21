import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

const IMAGE_MAX_SIZE = 5 * 1024 * 1024;
const DOCUMENT_MAX_SIZE = 10 * 1024 * 1024;
const VIDEO_MAX_SIZE = 50 * 1024 * 1024;

function sanitizeFilename(filename: string): string {
    const sanitized = filename
        .toLowerCase()
        .replace(/[^a-z0-9.-]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
    
    const ext = path.extname(sanitized);
    const baseName = path.basename(sanitized, ext);
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    
    return `${baseName}_${timestamp}_${random}${ext}`;
}

function validateMimeType(mimetype: string, allowedTypes: string[]): boolean {
    return allowedTypes.includes(mimetype);
}

function getFileExtension(mimetype: string): string {
    const mimeToExt: Record<string, string> = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'image/webp': '.webp',
        'application/pdf': '.pdf',
        'application/msword': '.doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
        'text/plain': '.txt',
        'application/vnd.ms-excel': '.xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
        'video/mp4': '.mp4',
        'video/webm': '.webm',
        'video/quicktime': '.mov',
    };
    return mimeToExt[mimetype] || '';
}

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
        fileSize: IMAGE_MAX_SIZE,
    },
    fileFilter: (req, file, cb) => {
        if (!validateMimeType(file.mimetype, ALLOWED_IMAGE_TYPES)) {
            cb(new Error(`Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`));
            return;
        }
        cb(null, true);
    },
});

export const uploadCourseMaterial = multer({
    storage: getStorage('classbridge/courses/materials'),
    limits: {
        fileSize: DOCUMENT_MAX_SIZE,
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [...ALLOWED_DOCUMENT_TYPES, ...ALLOWED_IMAGE_TYPES];
        if (!validateMimeType(file.mimetype, allowedTypes)) {
            cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`));
            return;
        }
        cb(null, true);
    },
});

export const uploadAssessmentMaterial = multer({
    storage: getStorage('classbridge/assessments/materials'),
    limits: {
        fileSize: DOCUMENT_MAX_SIZE,
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [...ALLOWED_DOCUMENT_TYPES, ...ALLOWED_IMAGE_TYPES];
        if (!validateMimeType(file.mimetype, allowedTypes)) {
            cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`));
            return;
        }
        cb(null, true);
    },
});

export const uploadVideo = multer({
    storage: getStorage('classbridge/videos', 'video'),
    limits: {
        fileSize: VIDEO_MAX_SIZE,
    },
    fileFilter: (req, file, cb) => {
        if (!validateMimeType(file.mimetype, ALLOWED_VIDEO_TYPES)) {
            cb(new Error(`Invalid file type. Allowed types: ${ALLOWED_VIDEO_TYPES.join(', ')}`));
            return;
        }
        cb(null, true);
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

export const FILE_LIMITS = {
    IMAGE_MAX_SIZE,
    DOCUMENT_MAX_SIZE,
    VIDEO_MAX_SIZE,
} as const;

export const ALLOWED_FILE_TYPES = {
    IMAGES: ALLOWED_IMAGE_TYPES,
    DOCUMENTS: ALLOWED_DOCUMENT_TYPES,
    VIDEOS: ALLOWED_VIDEO_TYPES,
} as const;
