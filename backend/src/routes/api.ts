import { Router, Request, Response, NextFunction } from 'express';

import * as authController from '@/controllers/auth';
import * as schoolsController from '@/controllers/schools';
import * as classesController from '@/controllers/classes';
import * as coursesController from '@/controllers/courses';
import * as assessmentsController from '@/controllers/assessments';
import * as gradesController from '@/controllers/grades';
import * as usersController from '@/controllers/users';
import * as mentorsController from '@/controllers/mentors';
import * as studentsController from '@/controllers/students';
import * as transcriptsController from '@/controllers/transcripts';
import * as notificationsController from '@/controllers/notifications';
import * as statsController from '@/controllers/stats';
import * as healthController from '@/controllers/health';
import * as approvalsController from '@/controllers/approvals';
import * as deletionRequestsController from '@/controllers/deletionRequests';
import * as auditController from '@/controllers/audit';
import * as settingsController from '@/controllers/settings';
import * as systemController from '@/controllers/system';
import * as parentsController from '@/controllers/parents';
import * as reportsController from '@/controllers/reports';
import * as schoolReportController from '@/controllers/schoolReport';
import * as importExportController from '@/controllers/importExport';
import uploadRoutes from './upload';
import { csrfProtection } from '@/middleware/csrf';
import { generateCsrfToken } from '@/lib/csrf';
import { jwtAuthMiddleware, optionalAuthMiddleware, AuthenticatedRequest } from '@/lib/auth';
import { authenticate, AuthRequest } from '@/lib/authorization';
import { requirePermission, requireSystemAdmin, requireSchoolAdmin, requireSchoolApproved, requireAnyPermission } from '@/lib/authorization';
import { PERMISSIONS } from '@/lib/permissions';
import { signupCombinedLimiter, signupEmailRateLimiter, passwordResetLimiter, sensitiveActionLimiter } from '@/middleware/rateLimiter';
import { captchaVerification } from '@/middleware/captcha';
import { validateObjectId } from '@/middleware/validateObjectId';
import { fullSanitize } from '@/middleware/sanitize';

const router = Router();

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

const csrfHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fullSanitize(req, res, () => {
      csrfProtection(req, res, (err?: any) => {
        if (err) return next(err);
        asyncHandler(fn)(req, res, next);
      });
    });
  };
};

const protectedHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return [fullSanitize, jwtAuthMiddleware, asyncHandler(fn)];
};

const protectedCsrfHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fullSanitize(req, res, () => {
      jwtAuthMiddleware(req, res, (err?: any) => {
        if (err) return next(err);
        csrfProtection(req, res, (csrfErr?: any) => {
          if (csrfErr) return next(csrfErr);
          asyncHandler(fn)(req, res, next);
        });
      });
    });
  };
};

const requirePermissionHandler = (permission: string) => {
  return (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
    return [fullSanitize, jwtAuthMiddleware, requirePermission(permission as any), asyncHandler(fn)];
  };
};

const requirePermissionCsrfHandler = (permission: string) => {
  return (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
      fullSanitize(req, res, () => {
        jwtAuthMiddleware(req, res, (err?: any) => {
          if (err) return next(err);
          const permMiddleware = requirePermission(permission as any);
          permMiddleware(req, res, (permErr?: any) => {
            if (permErr) return next(permErr);
            csrfProtection(req, res, (csrfErr?: any) => {
              if (csrfErr) return next(csrfErr);
              asyncHandler(fn)(req, res, next);
            });
          });
        });
      });
    };
  };
};

const systemAdminHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fullSanitize(req, res, () => {
      jwtAuthMiddleware(req, res, (err?: any) => {
        if (err) return next(err);
        const systemAdminMiddleware = requireSystemAdmin();
        systemAdminMiddleware(req, res, (adminErr?: any) => {
          if (adminErr) return next(adminErr);
          csrfProtection(req, res, (csrfErr?: any) => {
            if (csrfErr) return next(csrfErr);
            asyncHandler(fn)(req, res, next);
          });
        });
      });
    });
  };
};

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', asyncHandler(healthController.getHealth));

/**
 * @swagger
 * /health/live:
 *   get:
 *     summary: Liveness probe endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is alive
 */
router.get('/health/live', asyncHandler(healthController.getLiveness));

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness probe endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is ready
 *       503:
 *         description: Service is not ready
 */
router.get('/health/ready', asyncHandler(healthController.getReadiness));

/**
 * @swagger
 * /system/status:
 *   get:
 *     summary: Get system status
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System status information
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/system/status', systemAdminHandler(systemController.getSystemStatus));

/**
 * @swagger
 * /system/metrics:
 *   get:
 *     summary: Get system metrics
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System metrics information
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/system/metrics', systemAdminHandler(systemController.getSystemMetrics));

/**
 * @swagger
 * /reports/audit:
 *   get:
 *     summary: Get audit log report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *       - in: query
 *         name: resource
 *         schema:
 *           type: string
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *     responses:
 *       200:
 *         description: Audit log report
 */
router.get('/reports/audit', systemAdminHandler(reportsController.getAuditLogsReport));

/**
 * @swagger
 * /reports/activity:
 *   get:
 *     summary: Get activity report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Activity report
 */
router.get('/reports/activity', systemAdminHandler(reportsController.getActivityReport));

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/auth/login', csrfHandler(authController.login));

router.get('/auth/csrf-token', (req: Request, res: Response) => {
  const token = generateCsrfToken('');
  res.cookie('csrfToken', token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.json({ csrfToken: token });
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: User logout
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/auth/logout', csrfHandler(authController.logout));

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.post('/auth/change-password', protectedCsrfHandler(authController.changePassword));

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully
 *       401:
 *         description: Invalid refresh token
 */
router.post('/auth/refresh', sensitiveActionLimiter, csrfHandler(authController.refreshToken));

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 *       401:
 *         description: Not authenticated
 */
router.get('/auth/me', optionalAuthMiddleware, asyncHandler(authController.me));

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered
 *       409:
 *         description: Email already exists
 */
router.post('/auth/register', signupCombinedLimiter, captchaVerification, csrfHandler(authController.register));

/**
 * @swagger
 * /auth/verify-email/{token}:
 *   post:
 *     summary: Verify email with token
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 */
router.post('/auth/verify-email/:token', csrfHandler(authController.verifyEmail));

/**
 * @swagger
 * /auth/resend-verification:
 *   post:
 *     summary: Resend email verification
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verification email sent
 */
router.post('/auth/resend-verification', signupEmailRateLimiter, csrfHandler(authController.resendVerificationEmail));

/**
 * @swagger
 * /auth/password-reset:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset email sent
 */
router.post('/auth/password-reset', passwordResetLimiter, csrfHandler(authController.requestPasswordReset));

/**
 * @swagger
 * /auth/password-reset/{token}:
 *   get:
 *     summary: Verify password reset token
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Token is valid
 *       404:
 *         description: Invalid token
 */
router.get('/auth/password-reset/:token', asyncHandler(authController.verifyPasswordResetToken));

/**
 * @swagger
 * /auth/password-reset/{token}:
 *   post:
 *     summary: Reset password with token
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 */
router.post('/auth/password-reset/:token', csrfHandler(authController.resetPassword));

/**
 * @swagger
 * /auth/2fa/setup:
 *   post:
 *     summary: Setup two-factor authentication
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA setup initiated
 */
router.post('/auth/2fa/setup', protectedCsrfHandler(authController.setupTwoFactor));

/**
 * @swagger
 * /auth/2fa/verify:
 *   post:
 *     summary: Verify and enable two-factor authentication
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: 2FA enabled successfully
 */
router.post('/auth/2fa/verify', protectedCsrfHandler(authController.verifyTwoFactor));

/**
 * @swagger
 * /auth/2fa/disable:
 *   post:
 *     summary: Disable two-factor authentication
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: 2FA disabled successfully
 */
router.post('/auth/2fa/disable', protectedCsrfHandler(authController.disableTwoFactor));

/**
 * @swagger
 * /schools:
 *   get:
 *     summary: Get all schools (system admin only)
 *     tags: [Schools]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of schools
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (system admin required)
 */
router.get('/schools', systemAdminHandler(schoolsController.getSchools));

/**
 * @swagger
 * /schools/{id}:
 *   get:
 *     summary: Get school by ID
 *     tags: [Schools]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: School data
 *   put:
 *     summary: Update school
 *     tags: [Schools]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: School updated
 */
router.get('/schools/:id', validateObjectId(), jwtAuthMiddleware, requireSchoolApproved(), asyncHandler(schoolsController.getSchoolById));
router.put('/schools/:id', systemAdminHandler(schoolsController.updateSchool));
router.patch('/schools/:id/status', systemAdminHandler(schoolsController.updateSchoolStatus));
router.get('/schools/:id/stats', validateObjectId(), jwtAuthMiddleware, requireSchoolApproved(), asyncHandler(schoolsController.getSchoolStats));
router.get('/schools/:id/report', validateObjectId(), jwtAuthMiddleware, requireSchoolApproved(), asyncHandler(schoolReportController.getSchoolReport));
router.get('/schools/:id/activity', validateObjectId(), jwtAuthMiddleware, requireSchoolApproved(), asyncHandler(schoolReportController.getSchoolActivity));
router.get('/schools/:id/audit-export', validateObjectId(), jwtAuthMiddleware, requireSchoolApproved(), asyncHandler(schoolReportController.exportSchoolAuditCsv));

/**
 * @swagger
 * /schools/request:
 *   post:
 *     summary: Request to create a new school
 *     tags: [Schools]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               website:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: School request submitted
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

// School Approval Routes

/**
 * @swagger
 * /approvals/pending:
 *   get:
 *     summary: Get all pending approval requests
 *     tags: [Approvals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending approvals
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/approvals/pending', systemAdminHandler(approvalsController.getPendingApprovals));

/**
 * @swagger
 * /approvals/pending/count:
 *   get:
 *     summary: Get count of pending approval requests
 *     tags: [Approvals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Count of pending approvals
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/approvals/pending/count', systemAdminHandler(approvalsController.getPendingApprovalCount));

/**
 * @swagger
 * /approvals/{id}:
 *   get:
 *     summary: Get approval request by ID
 *     tags: [Approvals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Approval request details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/approvals/:id', validateObjectId(), systemAdminHandler(approvalsController.getApprovalById));
  
/**
 * @swagger
 * /approvals/{id}/approve:
 *   post:
 *     summary: Approve a school registration request
 *     tags: [Approvals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: School approved successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/approvals/:id/approve', systemAdminHandler(approvalsController.approveSchool));

/**
 * @swagger
 * /approvals/{id}/reject:
 *   post:
 *     summary: Reject a school registration request
 *     tags: [Approvals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: School rejected
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/approvals/:id/reject', systemAdminHandler(approvalsController.rejectSchool));

router.post('/schools/request', jwtAuthMiddleware, csrfHandler(approvalsController.requestSchool));
router.get('/schools/my-request', jwtAuthMiddleware, asyncHandler(approvalsController.getMySchoolRequest));

// Deletion Request Routes
router.get('/deletion-requests/pending', jwtAuthMiddleware, requirePermission(PERMISSIONS.REQUEST_DELETE), asyncHandler(deletionRequestsController.getPendingDeletionRequests));
router.get('/deletion-requests/pending/count', jwtAuthMiddleware, requirePermission(PERMISSIONS.REQUEST_DELETE), asyncHandler(deletionRequestsController.getPendingDeletionCount));
router.get('/deletion-requests', jwtAuthMiddleware, requirePermission(PERMISSIONS.APPROVE_DELETE), asyncHandler(deletionRequestsController.getAllDeletionRequests));
router.post('/deletion-requests', jwtAuthMiddleware, csrfHandler(deletionRequestsController.requestDeletion));
router.get('/deletion-requests/:id', jwtAuthMiddleware, requirePermission(PERMISSIONS.REQUEST_DELETE), asyncHandler(deletionRequestsController.getDeletionRequestById));
router.post('/deletion-requests/:id/approve', jwtAuthMiddleware, requirePermission(PERMISSIONS.APPROVE_DELETE), csrfHandler(deletionRequestsController.approveDeletionRequest));
router.post('/deletion-requests/:id/reject', jwtAuthMiddleware, requirePermission(PERMISSIONS.APPROVE_DELETE), csrfHandler(deletionRequestsController.rejectDeletionRequest));
router.delete('/deletion-requests/:id', jwtAuthMiddleware, requirePermission(PERMISSIONS.REQUEST_DELETE), csrfHandler(deletionRequestsController.cancelDeletionRequest));

/**
 * @swagger
 * /classes:
 *   get:
 *     summary: Get all classes
 *     tags: [Classes]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of classes
 *   post:
 *     summary: Create new class
 *     tags: [Classes]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClassCreate'
 *     responses:
 *       201:
 *         description: Class created
 */
router.get('/classes', jwtAuthMiddleware, requireSchoolApproved(), asyncHandler(classesController.getClasses));
router.post('/classes', requirePermissionCsrfHandler(PERMISSIONS.MANAGE_CLASSES)(classesController.createClass));

/**
 * @swagger
 * /classes/{id}:
 *   get:
 *     summary: Get class by ID
 *     tags: [Classes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Class data
 *   put:
 *     summary: Update class
 *     tags: [Classes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Class updated
 */
router.get('/classes/:id', validateObjectId(), jwtAuthMiddleware, asyncHandler(classesController.getClassById));
router.put('/classes/:id', validateObjectId(), protectedCsrfHandler(classesController.updateClass));
router.delete('/classes/:id', validateObjectId(), protectedCsrfHandler(classesController.deleteClass));

/**
 * @swagger
 * /classes/{id}/students:
 *   get:
 *     summary: Get students in class
 *     tags: [Classes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of students
 *   post:
 *     summary: Add students to class
 *     tags: [Classes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Students added
 */
router.get('/classes/:id/students', validateObjectId(), jwtAuthMiddleware, asyncHandler(classesController.getClassStudents));
router.post('/classes/:id/students', validateObjectId(), protectedCsrfHandler(classesController.addStudentToClass));

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of courses
 *   post:
 *     summary: Create new course
 *     tags: [Courses]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CourseCreate'
 *     responses:
 *       201:
 *         description: Course created
 */
router.get('/courses', jwtAuthMiddleware, requireSchoolApproved(), asyncHandler(coursesController.getCourses));
router.post('/courses', requirePermissionCsrfHandler(PERMISSIONS.MANAGE_COURSES)(coursesController.createCourse));
router.put('/courses/:id', requirePermissionCsrfHandler(PERMISSIONS.MANAGE_COURSES)(coursesController.updateCourse));
router.delete('/courses/:id', requirePermissionCsrfHandler(PERMISSIONS.MANAGE_COURSES)(coursesController.deleteCourse));

/**
 * @swagger
 * /assessments:
 *   get:
 *     summary: Get all assessments
 *     tags: [Assessments]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of assessments
 *   post:
 *     summary: Create new assessment
 *     tags: [Assessments]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssessmentCreate'
 *     responses:
 *       201:
 *         description: Assessment created
 */
router.get('/assessments', jwtAuthMiddleware, requireSchoolApproved(), asyncHandler(assessmentsController.getAssessments));
router.post('/assessments', requirePermissionCsrfHandler(PERMISSIONS.MANAGE_ASSESSMENTS)(assessmentsController.createAssessment));

/**
 * @swagger
 * /assessments/{id}/attempt:
 *   post:
 *     summary: Start taking an assessment
 *     tags: [Assessments]
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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               respondentId:
 *                 type: string
 *               classId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Assessment attempt created
 */
router.post('/assessments/:id/attempt', requirePermissionCsrfHandler(PERMISSIONS.TAKE_ASSESSMENT)(assessmentsController.createAssessmentAttempt));

/**
 * @swagger
 * /assessments/attempts/{attemptId}:
 *   get:
 *     summary: Get assessment attempt
 *     tags: [Assessments]
 *     security:
 *       - cookieAuth: []
 *   put:
 *     summary: Submit/update assessment attempt
 *     tags: [Assessments]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               answers:
 *                 type: array
 *               isComplete:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Attempt updated
 */
router.get('/assessments/attempts/:attemptId', jwtAuthMiddleware, asyncHandler(assessmentsController.getAssessmentAttempt));
router.put('/assessments/attempts/:attemptId', requirePermissionCsrfHandler(PERMISSIONS.TAKE_ASSESSMENT)(assessmentsController.updateAssessmentAttempt));

/**
 * @swagger
 * /assessments/{id}/attempts:
 *   get:
 *     summary: Get assessment attempts
 *     tags: [Assessments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of attempts
 */
router.get('/assessments/:id/attempts', validateObjectId(), jwtAuthMiddleware, asyncHandler(assessmentsController.getAssessmentAttempts));

/**
 * @swagger
 * /grades:
 *   get:
 *     summary: Get all grades
 *     tags: [Grades]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of grades
 *   post:
 *     summary: Create new grade
 *     tags: [Grades]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Grade'
 *     responses:
 *       201:
 *         description: Grade created
 */
router.get('/grades', jwtAuthMiddleware, requireSchoolApproved(), asyncHandler(gradesController.getGrades));
router.post('/grades', requirePermissionCsrfHandler(PERMISSIONS.GRADE_STUDENTS)(gradesController.createGrade));
router.post('/grades/bulk', requirePermissionCsrfHandler(PERMISSIONS.GRADE_STUDENTS)(gradesController.bulkCreateGrades));
router.put('/grades/:id', validateObjectId(), requirePermissionCsrfHandler(PERMISSIONS.GRADE_STUDENTS)(gradesController.updateGrade));
router.delete('/grades/:id', validateObjectId(), requirePermissionCsrfHandler(PERMISSIONS.GRADE_STUDENTS)(gradesController.deleteGrade));

router.post('/import/students', jwtAuthMiddleware, requireSchoolApproved(), requirePermission(PERMISSIONS.MANAGE_USERS), importExportController.uploadMiddleware, asyncHandler(importExportController.importStudents));
router.post('/import/classes', jwtAuthMiddleware, requireSchoolApproved(), requirePermission(PERMISSIONS.MANAGE_CLASSES), importExportController.uploadMiddleware, asyncHandler(importExportController.importClasses));

router.get('/export/students', jwtAuthMiddleware, requireSchoolApproved(), asyncHandler(importExportController.exportStudents));
router.get('/export/classes', jwtAuthMiddleware, requireSchoolApproved(), asyncHandler(importExportController.exportClasses));
router.get('/export/grades', jwtAuthMiddleware, requireSchoolApproved(), asyncHandler(importExportController.exportGrades));

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User data
 *   patch:
 *     summary: Update user
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User updated
 */
router.get('/users', jwtAuthMiddleware, asyncHandler(usersController.listUsers));
router.get('/users/:id', validateObjectId(), jwtAuthMiddleware, asyncHandler(usersController.getUser));
router.patch('/users/:id', validateObjectId(), protectedCsrfHandler(usersController.updateUser));
router.get('/users/:id/password-status', validateObjectId(), jwtAuthMiddleware, asyncHandler(usersController.getPasswordStatus));
router.post('/users/:id/force-password-change', validateObjectId(), systemAdminHandler(usersController.forcePasswordChange));
router.post('/users/:id/reset-password', validateObjectId(), systemAdminHandler(usersController.resetPassword));
router.post('/users/invite', jwtAuthMiddleware, csrfHandler(usersController.inviteUser));
router.patch('/users/:id/deactivate', jwtAuthMiddleware, csrfHandler(usersController.deactivateUser));
router.delete('/users/:id', validateObjectId(), protectedCsrfHandler(usersController.deleteUser));
router.post('/users/bulk-import', jwtAuthMiddleware, csrfHandler(usersController.bulkImportUsers));

// Mentor Routes
router.get('/mentors', jwtAuthMiddleware, requireSchoolApproved(), asyncHandler(mentorsController.getMentors));
router.post('/mentors', requirePermissionCsrfHandler(PERMISSIONS.MANAGE_USERS)(mentorsController.createMentor));
router.put('/mentors', requirePermissionCsrfHandler(PERMISSIONS.MANAGE_USERS)(mentorsController.updateMentorAssignments));
router.get('/mentors/accept-invitation/:token', asyncHandler(mentorsController.getMentorInvitation));
router.post('/mentors/accept-invitation/:token', asyncHandler(mentorsController.acceptMentorInvitation));
router.get('/mentors/:id', validateObjectId(), jwtAuthMiddleware, asyncHandler(mentorsController.getMentor));
router.put('/mentors/:id', validateObjectId(), requirePermissionCsrfHandler(PERMISSIONS.MANAGE_USERS)(mentorsController.updateMentor));
router.delete('/mentors/:id', validateObjectId(), requirePermissionCsrfHandler(PERMISSIONS.MANAGE_USERS)(mentorsController.deleteMentor));

// Student Routes
router.get('/students/invitations', jwtAuthMiddleware, requireSchoolApproved(), asyncHandler(studentsController.getStudentInvitations));
router.post('/students/invite', requirePermissionCsrfHandler(PERMISSIONS.MANAGE_USERS)(studentsController.inviteStudent));
router.post('/students/bulk-invite', requirePermissionCsrfHandler(PERMISSIONS.MANAGE_USERS)(studentsController.bulkInviteStudents));
router.get('/students/invitation/:token', asyncHandler(studentsController.getStudentInvitation));
router.post('/students/accept-invitation', asyncHandler(studentsController.acceptStudentInvitation));

/**
 * @swagger
 * /transcripts:
 *   get:
 *     summary: Get all transcripts
 *     tags: [Transcripts]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of transcripts
 *   post:
 *     summary: Create new transcript
 *     tags: [Transcripts]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Transcript'
 *     responses:
 *       201:
 *         description: Transcript created
 */
router.get('/transcripts', jwtAuthMiddleware, requireSchoolApproved(), asyncHandler(transcriptsController.getTranscripts));
router.post('/transcripts', requirePermissionCsrfHandler(PERMISSIONS.MANAGE_TRANSCRIPTS)(transcriptsController.createTranscript));
router.put('/transcripts/:id', validateObjectId(), requirePermissionCsrfHandler(PERMISSIONS.MANAGE_TRANSCRIPTS)(transcriptsController.updateTranscript));
router.delete('/transcripts/:id', validateObjectId(), requirePermissionCsrfHandler(PERMISSIONS.MANAGE_TRANSCRIPTS)(transcriptsController.deleteTranscript));

/**
 * @swagger
 * /transcripts/{id}/export:
 *   get:
 *     summary: Export transcript as PDF or CSV
 *     tags: [Transcripts]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [pdf, csv]
 *     responses:
 *       200:
 *         description: Exported transcript file
 */
router.get('/transcripts/:id/export', validateObjectId(), jwtAuthMiddleware, asyncHandler(transcriptsController.exportTranscript));

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get all notifications
 *     tags: [Notifications]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Notifications marked as read
 */
router.get('/notifications', jwtAuthMiddleware, asyncHandler(notificationsController.getNotifications));
router.patch('/notifications', protectedCsrfHandler(notificationsController.markAllNotificationsAsRead));

/**
 * @swagger
 * /notifications/{id}:
 *   patch:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 */
router.patch('/notifications/:id', protectedCsrfHandler(notificationsController.markNotificationAsRead));
router.get('/notifications/unread-count', jwtAuthMiddleware, asyncHandler(notificationsController.getUnreadCount));
router.delete('/notifications/:id', protectedCsrfHandler(notificationsController.deleteNotification));

/**
 * @swagger
 * /stats:
 *   get:
 *     summary: Get platform statistics
 *     tags: [Stats]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Platform statistics
 */
router.get('/stats', jwtAuthMiddleware, asyncHandler(statsController.getStats));
router.get('/stats/global', systemAdminHandler(statsController.getGlobalStats));
router.get('/stats/analytics', jwtAuthMiddleware, requireSchoolApproved(), asyncHandler(statsController.getAnalytics));

router.use('/upload', uploadRoutes);

// Audit Logs Routes
router.get('/audit-logs', systemAdminHandler(auditController.getAuditLogs));
router.get('/audit-logs/recent', systemAdminHandler(auditController.getRecentLogs));

// Settings Routes
router.get('/settings', jwtAuthMiddleware, asyncHandler(settingsController.getSettings));
router.put('/settings', jwtAuthMiddleware, csrfHandler(settingsController.updateSettings));

// Parent Routes
router.get('/parents/children', jwtAuthMiddleware, asyncHandler(parentsController.getMyChildren));
router.post('/parents/children', protectedCsrfHandler(parentsController.addChild));
router.delete('/parents/children/:studentId', protectedCsrfHandler(parentsController.removeChild));
router.get('/parents/children/:studentId/grades', jwtAuthMiddleware, asyncHandler(parentsController.getChildGrades));
router.get('/parents/children/:studentId/classes', jwtAuthMiddleware, asyncHandler(parentsController.getChildClasses));

export default router;
