import { Router } from 'express';
import type { Request } from 'express';
import { adaptRoute, NextRouteHandler } from '@/lib/nextServerCompat';

import * as assessments from '@/app/api/assessments/route';
import * as assessmentById from '@/app/api/assessments/[id]/route';
import * as assessmentAttemptsByAssessment from '@/app/api/assessments/[id]/attempts/route';
import * as assessmentAttempt from '@/app/api/assessments/attempts/[attemptId]/route';
import * as courses from '@/app/api/courses/route';
import * as courseById from '@/app/api/courses/[id]/route';
import * as transcripts from '@/app/api/transcripts/route';
import * as transcriptById from '@/app/api/transcripts/[id]/route';
import * as schools from '@/app/api/schools/route';
import * as schoolById from '@/app/api/schools/[id]/route';
import * as schoolsGet from '@/app/api/schools/get/route';
import * as studentsInvitations from '@/app/api/students/invitations/route';
import * as studentAcceptInvitation from '@/app/api/students/accept-invitation/route';
import * as studentInvitationToken from '@/app/api/students/invitation/[token]/route';
import * as studentInvite from '@/app/api/students/invite/route';
import * as authLogin from '@/app/api/auth/login/route';
import * as authLogout from '@/app/api/auth/logout/route';
import * as authMe from '@/app/api/auth/me/route';
import * as authRegister from '@/app/api/auth/register/route';
import * as authPasswordReset from '@/app/api/auth/password-reset/route';
import * as authPasswordResetToken from '@/app/api/auth/password-reset/[token]/route';
import * as classes from '@/app/api/classes/route';
import * as classById from '@/app/api/classes/[id]/route';
import * as classStudents from '@/app/api/classes/[id]/students/route';
import * as classesGet from '@/app/api/classes/get/route';
import * as grades from '@/app/api/grades/route';
import * as gradeById from '@/app/api/grades/[id]/route';
import * as mentors from '@/app/api/mentors/route';
import * as mentorById from '@/app/api/mentors/[id]/route';
import * as mentorAcceptInvitation from '@/app/api/mentors/accept-invitation/[token]/route';
import * as stats from '@/app/api/stats/route';
import * as userById from '@/app/api/users/[id]/route';

const router = Router();

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type RouteModule = Partial<Record<HttpMethod, NextRouteHandler<any>>>;

const asRouteModule = (module: unknown): RouteModule => module as RouteModule;

const register = (
  method: HttpMethod,
  path: string,
  module: RouteModule,
  paramMapper?: (req: Request) => Record<string, string>,
) => {
  const handler = module[method];
  if (!handler) {
    return;
  }

  const expressMethod = method.toLowerCase() as 'get' | 'post' | 'put' | 'delete' | 'patch';
  router[expressMethod](path, adaptRoute(handler, paramMapper));
};

// Assessments
register('GET', '/assessments', asRouteModule(assessments));
register('POST', '/assessments', asRouteModule(assessments));
register('GET', '/assessments/:id', asRouteModule(assessmentById), (req) => ({ id: req.params.id }));
register('PUT', '/assessments/:id', asRouteModule(assessmentById), (req) => ({ id: req.params.id }));
register('DELETE', '/assessments/:id', asRouteModule(assessmentById), (req) => ({ id: req.params.id }));
register('GET', '/assessments/:id/attempts', asRouteModule(assessmentAttemptsByAssessment), (req) => ({ id: req.params.id }));
register('POST', '/assessments/:id/attempts', asRouteModule(assessmentAttemptsByAssessment), (req) => ({ id: req.params.id }));
register('GET', '/assessments/attempts/:attemptId', asRouteModule(assessmentAttempt), (req) => ({ attemptId: req.params.attemptId }));
register('PUT', '/assessments/attempts/:attemptId', asRouteModule(assessmentAttempt), (req) => ({ attemptId: req.params.attemptId }));

// Courses
register('GET', '/courses', asRouteModule(courses));
register('POST', '/courses', asRouteModule(courses));
register('GET', '/courses/:id', asRouteModule(courseById), (req) => ({ id: req.params.id }));
register('PUT', '/courses/:id', asRouteModule(courseById), (req) => ({ id: req.params.id }));
register('DELETE', '/courses/:id', asRouteModule(courseById), (req) => ({ id: req.params.id }));

// Transcripts
register('GET', '/transcripts', asRouteModule(transcripts));
register('POST', '/transcripts', asRouteModule(transcripts));
register('GET', '/transcripts/:id', asRouteModule(transcriptById), (req) => ({ id: req.params.id }));
register('PUT', '/transcripts/:id', asRouteModule(transcriptById), (req) => ({ id: req.params.id }));
register('DELETE', '/transcripts/:id', asRouteModule(transcriptById), (req) => ({ id: req.params.id }));

// Schools
register('GET', '/schools', asRouteModule(schools));
register('POST', '/schools', asRouteModule(schools));
register('GET', '/schools/:id', asRouteModule(schoolById), (req) => ({ id: req.params.id }));
register('PUT', '/schools/:id', asRouteModule(schoolById), (req) => ({ id: req.params.id }));
register('DELETE', '/schools/:id', asRouteModule(schoolById), (req) => ({ id: req.params.id }));
register('GET', '/schools/get', asRouteModule(schoolsGet));

// Students
register('GET', '/students/invitations', asRouteModule(studentsInvitations));
register('POST', '/students/invitations', asRouteModule(studentsInvitations));
register('POST', '/students/accept-invitation', asRouteModule(studentAcceptInvitation));
register('GET', '/students/invitation/:token', asRouteModule(studentInvitationToken), (req) => ({ token: req.params.token }));
register('POST', '/students/invite', asRouteModule(studentInvite));

// Auth
register('POST', '/auth/login', asRouteModule(authLogin));
register('POST', '/auth/logout', asRouteModule(authLogout));
register('GET', '/auth/me', asRouteModule(authMe));
register('POST', '/auth/register', asRouteModule(authRegister));
register('POST', '/auth/password-reset', asRouteModule(authPasswordReset));
register('GET', '/auth/password-reset/:token', asRouteModule(authPasswordResetToken), (req) => ({ token: req.params.token }));
register('POST', '/auth/password-reset/:token', asRouteModule(authPasswordResetToken), (req) => ({ token: req.params.token }));

// Classes
register('GET', '/classes', asRouteModule(classes));
register('POST', '/classes', asRouteModule(classes));
register('GET', '/classes/:id', asRouteModule(classById), (req) => ({ id: req.params.id }));
register('PUT', '/classes/:id', asRouteModule(classById), (req) => ({ id: req.params.id }));
register('DELETE', '/classes/:id', asRouteModule(classById), (req) => ({ id: req.params.id }));
register('GET', '/classes/:id/students', asRouteModule(classStudents), (req) => ({ id: req.params.id }));
register('POST', '/classes/:id/students', asRouteModule(classStudents), (req) => ({ id: req.params.id }));
register('GET', '/classes/get', asRouteModule(classesGet));

// Grades
register('GET', '/grades', asRouteModule(grades));
register('POST', '/grades', asRouteModule(grades));
register('GET', '/grades/:id', asRouteModule(gradeById), (req) => ({ id: req.params.id }));
register('PUT', '/grades/:id', asRouteModule(gradeById), (req) => ({ id: req.params.id }));
register('DELETE', '/grades/:id', asRouteModule(gradeById), (req) => ({ id: req.params.id }));

// Mentors
register('GET', '/mentors', asRouteModule(mentors));
register('POST', '/mentors', asRouteModule(mentors));
register('GET', '/mentors/:id', asRouteModule(mentorById), (req) => ({ id: req.params.id }));
register('PUT', '/mentors/:id', asRouteModule(mentorById), (req) => ({ id: req.params.id }));
register('GET', '/mentors/accept-invitation/:token', asRouteModule(mentorAcceptInvitation), (req) => ({ token: req.params.token }));
register('POST', '/mentors/accept-invitation/:token', asRouteModule(mentorAcceptInvitation), (req) => ({ token: req.params.token }));

// Users
register('GET', '/users/:id', asRouteModule(userById), (req) => ({ id: req.params.id }));
register('PATCH', '/users/:id', asRouteModule(userById), (req) => ({ id: req.params.id }));

// Stats
register('GET', '/stats', asRouteModule(stats));

export default router;
