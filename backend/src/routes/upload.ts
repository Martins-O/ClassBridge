import { Router, Request, Response, NextFunction } from 'express';
import * as uploadController from '@/controllers/upload';
import { uploadProfileImage, uploadCourseMaterial, uploadAssessmentMaterial } from '@/lib/upload';
import { getUserIdFromRequest } from '@/lib/session';
import { csrfProtection } from '@/middleware/csrf';
import { jwtAuthMiddleware } from '@/lib/auth';

const router = Router();

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

const csrfHandler = (handler: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
        csrfProtection(req, res, (err?: any) => {
            if (err) return next(err);
            asyncHandler(handler)(req, res, next);
        });
    };
};

const protectedCsrfHandler = (handler: any, fieldName: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        jwtAuthMiddleware(req, res, (jwtErr?: any) => {
            if (jwtErr) return next(jwtErr);
            csrfProtection(req, res, (csrfErr?: any) => {
                if (csrfErr) return next(csrfErr);
                asyncHandler(handler)(req, res, next);
            });
        });
    };
};

/**
 * @swagger
 * /upload/profile:
 *   post:
 *     summary: Upload profile image
 *     tags: [Upload]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile image uploaded successfully
 *       400:
 *         description: No file uploaded
 *       401:
 *         description: Authentication required
 */
router.post('/profile', jwtAuthMiddleware, uploadProfileImage.single('file'), csrfHandler(uploadController.uploadProfileImage));

/**
 * @swagger
 * /upload/course/{id}/material:
 *   post:
 *     summary: Upload course material
 *     tags: [Upload]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Material uploaded successfully
 *       400:
 *         description: No file uploaded
 *       401:
 *         description: Authentication required
 */
router.post('/course/:id/material', jwtAuthMiddleware, uploadCourseMaterial.single('file'), csrfHandler(uploadController.uploadCourseMaterial));

/**
 * @swagger
 * /upload/assessment/{id}/material:
 *   post:
 *     summary: Upload assessment material
 *     tags: [Upload]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Material uploaded successfully
 *       400:
 *         description: No file uploaded
 *       401:
 *         description: Authentication required
 */
router.post('/assessment/:id/material', jwtAuthMiddleware, uploadAssessmentMaterial.single('file'), csrfHandler(uploadController.uploadAssessmentMaterial));

export default router;
