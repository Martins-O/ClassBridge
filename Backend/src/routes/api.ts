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
import uploadRoutes from './upload';

const router = Router();

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
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
router.post('/auth/login', asyncHandler(authController.login));

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
router.post('/auth/logout', asyncHandler(authController.logout));

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
router.get('/auth/me', asyncHandler(authController.me));

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
router.post('/auth/register', asyncHandler(authController.register));

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
router.post('/auth/password-reset', asyncHandler(authController.requestPasswordReset));

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
router.post('/auth/password-reset/:token', asyncHandler(authController.resetPassword));

/**
 * @swagger
 * /schools:
 *   get:
 *     summary: Get all schools
 *     tags: [Schools]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of schools
 *   post:
 *     summary: Create new school
 *     tags: [Schools]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/School'
 *     responses:
 *       201:
 *         description: School created
 */
router.get('/schools', asyncHandler(schoolsController.getSchools));
router.post('/schools', asyncHandler(schoolsController.createSchool));

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
router.get('/schools/:id', asyncHandler(schoolsController.getSchoolById));
router.put('/schools/:id', asyncHandler(schoolsController.updateSchool));

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
 *             $ref: '#/components/schemas/Class'
 *     responses:
 *       201:
 *         description: Class created
 */
router.get('/classes', asyncHandler(classesController.getClasses));
router.post('/classes', asyncHandler(classesController.createClass));

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
router.get('/classes/:id', asyncHandler(classesController.getClassById));
router.put('/classes/:id', asyncHandler(classesController.updateClass));

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
router.get('/classes/:id/students', asyncHandler(classesController.getClassStudents));
router.post('/classes/:id/students', asyncHandler(classesController.addStudentToClass));

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
 *             $ref: '#/components/schemas/Course'
 *     responses:
 *       201:
 *         description: Course created
 */
router.get('/courses', asyncHandler(coursesController.getCourses));
router.post('/courses', asyncHandler(coursesController.createCourse));

/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     summary: Get course by ID
 *     tags: [Courses]
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
 *         description: Course data
 *   put:
 *     summary: Update course
 *     tags: [Courses]
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
 *         description: Course updated
 *   delete:
 *     summary: Delete course
 *     tags: [Courses]
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
 *         description: Course archived
 */
router.get('/courses/:id', asyncHandler(coursesController.getCourseById));
router.put('/courses/:id', asyncHandler(coursesController.updateCourse));
router.delete('/courses/:id', asyncHandler(coursesController.deleteCourse));

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
 *             $ref: '#/components/schemas/Assessment'
 *     responses:
 *       201:
 *         description: Assessment created
 */
router.get('/assessments', asyncHandler(assessmentsController.getAssessments));
router.post('/assessments', asyncHandler(assessmentsController.createAssessment));

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
router.get('/grades', asyncHandler(gradesController.getGrades));
router.post('/grades', asyncHandler(gradesController.createGrade));

/**
 * @swagger
 * /grades/bulk:
 *   post:
 *     summary: Bulk create grades
 *     tags: [Grades]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               grades:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Grade'
 *     responses:
 *       201:
 *         description: Grades created
 */
router.post('/grades/bulk', asyncHandler(gradesController.bulkCreateGrades));

/**
 * @swagger
 * /grades/{id}:
 *   get:
 *     summary: Get grade by ID
 *     tags: [Grades]
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
 *         description: Grade data
 *   put:
 *     summary: Update grade
 *     tags: [Grades]
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
 *         description: Grade updated
 *   delete:
 *     summary: Delete grade
 *     tags: [Grades]
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
 *         description: Grade deleted
 */
router.get('/grades/:id', asyncHandler(gradesController.getGrade));
router.put('/grades/:id', asyncHandler(gradesController.updateGrade));
router.delete('/grades/:id', asyncHandler(gradesController.deleteGrade));

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
router.get('/users/:id', asyncHandler(usersController.getUser));
router.patch('/users/:id', asyncHandler(usersController.updateUser));

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
router.get('/transcripts', asyncHandler(transcriptsController.getTranscripts));
router.post('/transcripts', asyncHandler(transcriptsController.createTranscript));

/**
 * @swagger
 * /transcripts/{id}:
 *   get:
 *     summary: Get transcript by ID
 *     tags: [Transcripts]
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
 *         description: Transcript data
 *   put:
 *     summary: Update transcript
 *     tags: [Transcripts]
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
 *         description: Transcript updated
 *   delete:
 *     summary: Delete transcript
 *     tags: [Transcripts]
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
 *         description: Transcript deleted
 */
router.get('/transcripts/:id', asyncHandler(transcriptsController.getTranscript));
router.put('/transcripts/:id', asyncHandler(transcriptsController.updateTranscript));
router.delete('/transcripts/:id', asyncHandler(transcriptsController.deleteTranscript));

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
router.get('/transcripts/:id/export', asyncHandler(transcriptsController.exportTranscript));

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
router.get('/notifications', asyncHandler(notificationsController.getNotifications));
router.patch('/notifications', asyncHandler(notificationsController.markAllNotificationsAsRead));

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
router.patch('/notifications/:id', asyncHandler(notificationsController.markNotificationAsRead));

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
router.get('/stats', asyncHandler(statsController.getStats));

router.use('/upload', uploadRoutes);

export default router;
