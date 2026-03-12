import { Router, Request, Response, NextFunction } from 'express';
import * as uploadController from '@/controllers/upload';
import { uploadProfileImage, uploadCourseMaterial, uploadAssessmentMaterial } from '@/lib/upload';
import { getUserIdFromRequest } from '@/lib/session';

const router = Router();

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
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
router.post('/profile', uploadProfileImage.single('file'), asyncHandler(uploadController.uploadProfileImage));

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
router.post('/course/:id/material', uploadCourseMaterial.single('file'), asyncHandler(uploadController.uploadCourseMaterial));

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
router.post('/assessment/:id/material', uploadAssessmentMaterial.single('file'), asyncHandler(uploadController.uploadAssessmentMaterial));

export default router;
