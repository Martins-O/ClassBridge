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

const router = Router();

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Auth routes
router.post('/auth/login', asyncHandler(authController.login));
router.post('/auth/logout', asyncHandler(authController.logout));
router.get('/auth/me', asyncHandler(authController.me));
router.post('/auth/register', asyncHandler(authController.register));
router.post('/auth/password-reset', asyncHandler(authController.requestPasswordReset));
router.get('/auth/password-reset/:token', asyncHandler(authController.verifyPasswordResetToken));
router.post('/auth/password-reset/:token', asyncHandler(authController.resetPassword));

// Schools routes
router.get('/schools', asyncHandler(schoolsController.getSchools));
router.post('/schools', asyncHandler(schoolsController.createSchool));
router.get('/schools/get', asyncHandler(schoolsController.getSchoolsForUser));
router.get('/schools/:id', asyncHandler(schoolsController.getSchoolById));
router.put('/schools/:id', asyncHandler(schoolsController.updateSchool));

// Classes routes
router.get('/classes', asyncHandler(classesController.getClasses));
router.post('/classes', asyncHandler(classesController.createClass));
router.get('/classes/get', asyncHandler(classesController.getClassesForUser));
router.get('/classes/:id', asyncHandler(classesController.getClassById));
router.put('/classes/:id', asyncHandler(classesController.updateClass));
router.get('/classes/:id/students', asyncHandler(classesController.getClassStudents));
router.post('/classes/:id/students', asyncHandler(classesController.addStudentToClass));

// Courses routes
router.get('/courses', asyncHandler(coursesController.getCourses));
router.post('/courses', asyncHandler(coursesController.createCourse));
router.get('/courses/:id', asyncHandler(coursesController.getCourseById));
router.put('/courses/:id', asyncHandler(coursesController.updateCourse));
router.delete('/courses/:id', asyncHandler(coursesController.deleteCourse));

// Assessments routes
router.get('/assessments', asyncHandler(assessmentsController.getAssessments));
router.post('/assessments', asyncHandler(assessmentsController.createAssessment));
router.get('/assessments/:id', asyncHandler(assessmentsController.getAssessment));
router.put('/assessments/:id', asyncHandler(assessmentsController.updateAssessment));
router.delete('/assessments/:id', asyncHandler(assessmentsController.deleteAssessment));
router.get('/assessments/:id/attempts', asyncHandler(assessmentsController.getAssessmentAttempts));
router.post('/assessments/:id/attempts', asyncHandler(assessmentsController.createAssessmentAttempt));
router.get('/assessments/attempts/:attemptId', asyncHandler(assessmentsController.getAssessmentAttempt));
router.put('/assessments/attempts/:attemptId', asyncHandler(assessmentsController.updateAssessmentAttempt));

// Grades routes
router.get('/grades', asyncHandler(gradesController.getGrades));
router.post('/grades', asyncHandler(gradesController.createGrade));
router.post('/grades/bulk', asyncHandler(gradesController.bulkCreateGrades));
router.get('/grades/:id', asyncHandler(gradesController.getGrade));
router.put('/grades/:id', asyncHandler(gradesController.updateGrade));
router.delete('/grades/:id', asyncHandler(gradesController.deleteGrade));

// Users routes
router.get('/users/:id', asyncHandler(usersController.getUser));
router.patch('/users/:id', asyncHandler(usersController.updateUser));

// Mentors routes
router.get('/mentors', asyncHandler(mentorsController.getMentors));
router.post('/mentors', asyncHandler(mentorsController.createMentor));
router.get('/mentors/:id', asyncHandler(mentorsController.getMentor));
router.put('/mentors/:id', asyncHandler(mentorsController.updateMentor));
router.get('/mentors/accept-invitation/:token', asyncHandler(mentorsController.getMentorInvitation));
router.post('/mentors/accept-invitation/:token', asyncHandler(mentorsController.acceptMentorInvitation));

// Students routes
router.get('/students/invitations', asyncHandler(studentsController.getStudentInvitations));
router.post('/students/invite', asyncHandler(studentsController.inviteStudent));
router.post('/students/bulk-invite', asyncHandler(studentsController.bulkInviteStudents));
router.post('/students/accept-invitation', asyncHandler(studentsController.acceptStudentInvitation));
router.get('/students/invitation/:token', asyncHandler(studentsController.getStudentInvitation));

// Transcripts routes
router.get('/transcripts', asyncHandler(transcriptsController.getTranscripts));
router.post('/transcripts', asyncHandler(transcriptsController.createTranscript));
router.get('/transcripts/:id', asyncHandler(transcriptsController.getTranscript));
router.put('/transcripts/:id', asyncHandler(transcriptsController.updateTranscript));
router.delete('/transcripts/:id', asyncHandler(transcriptsController.deleteTranscript));

// Notifications routes
router.get('/notifications', asyncHandler(notificationsController.getNotifications));
router.patch('/notifications', asyncHandler(notificationsController.markAllNotificationsAsRead));
router.patch('/notifications/:id', asyncHandler(notificationsController.markNotificationAsRead));

// Stats route
router.get('/stats', asyncHandler(statsController.getStats));

export default router;
