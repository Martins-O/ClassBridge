# ClassBridge Backend

Express + TypeScript + MongoDB backend API for the ClassBridge education management platform.

## Tech Stack

- **Node.js** + **TypeScript**
- **Express** web framework
- **MongoDB** + **Mongoose** ODM
- **JWT** authentication (access + refresh tokens with rotation)
- **CSRF** protection (double-submit cookie pattern)
- **Nodemailer** for transactional email (Gmail SMTP)
- **Multer** + **Cloudinary** for file uploads
- **Helmet**, rate limiting, input sanitization

## Getting Started

```bash
cp .env.example .env
# Edit .env with your MongoDB URI and secrets
npm install
npm run dev
```

Server starts at `http://localhost:4000`.

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start with hot reload (ts-node-dev) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run compiled production build |
| `npm run seed` | Run database seed |
| `npm run reset:db` | Drop the database |

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `4000` | Server port |
| `MONGODB_URI` | Yes | — | MongoDB connection string |
| `SESSION_SECRET` | Yes | — | Session signing secret |
| `JWT_SECRET` | Yes | — | JWT signing secret |
| `JWT_REFRESH_SECRET` | Yes | — | Refresh token secret |
| `CSRF_SECRET` | Yes | — | CSRF token signing secret |
| `EMAIL_HOST` | For email | — | SMTP host |
| `EMAIL_PORT` | For email | `587` | SMTP port |
| `EMAIL_SECURE` | For email | `false` | SMTP secure flag |
| `EMAIL_USER` | For email | — | SMTP username |
| `EMAIL_PASSWORD` | For email | — | SMTP password / Gmail App Password |
| `EMAIL_FROM_NAME` | For email | `ClassBridge` | Sender name |
| `EMAIL_FROM_ADDRESS` | For email | — | Sender address |
| `FRONTEND_URL` | Yes | — | Frontend URL for email links & CORS |
| `CORS_ORIGIN` | Yes | — | Allowed CORS origin |
| `CAPTCHA_SECRET_KEY` | No | — | Turnstile/reCAPTCHA secret |
| `CAPTCHA_SITE_KEY` | No | — | Turnstile/reCAPTCHA site key |
| `CLOUDINARY_CLOUD_NAME` | No | — | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | No | — | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | No | — | Cloudinary API secret |
| `REDIS_URL` | No | — | Redis URL for rate limiting |
| `AUTO_SEED_ADMIN` | No | `true` | Auto-seed system admin on start |

### Gmail SMTP Setup

1. Enable 2-Factor Authentication on your Google account
2. Generate an [App Password](https://support.google.com/accounts/answer/185833)
3. Set:
   - `EMAIL_HOST=smtp.gmail.com`
   - `EMAIL_PORT=587`
   - `EMAIL_SECURE=false`
   - `EMAIL_USER` = your Gmail address
   - `EMAIL_PASSWORD` = the generated app password

## Project Structure

```
src/
├── controllers/     Request handlers
├── lib/             Utilities (auth, JWT, CSRF, email, DB, validation)
├── middleware/      Express middleware (CSRF, rate limit, sanitize, captcha)
├── models/          Mongoose schemas
├── repositories/    Data access layer
├── routes/          Route definitions
├── scripts/         Utility scripts (seed, reset)
├── services/        Business logic layer
└── server.ts        App entry point
```

## API Routes

All routes are mounted under `/api/v1`. Full Swagger documentation at `/api-docs` when running.

### Auth
- `POST /auth/register` — Register a new school + admin
- `POST /auth/login` — Login with email + password
- `POST /auth/logout` — Logout (invalidate refresh token)
- `POST /auth/refresh` — Refresh access token
- `POST /auth/verify-email/:token` — Verify email
- `POST /auth/resend-verification` — Resend verification email
- `POST /auth/password-reset` — Request password reset
- `POST /auth/password-reset/:token` — Execute password reset
- `POST /auth/change-password` — Change password (authenticated)
- `GET /auth/me` — Current user info
- `POST /auth/2fa/setup` — Setup 2FA
- `POST /auth/2fa/verify` — Verify & enable 2FA

### Schools
- `GET /schools` — List all (system admin)
- `GET /schools/:id` — School details
- `PUT /schools/:id` — Update school
- `PATCH /schools/:id/status` — Update status
- `POST /schools/request` — Request new school

### Classes
- `GET /classes` — List classes
- `POST /classes` — Create class
- `GET /classes/:id` — Class details
- `PUT /classes/:id` — Update class
- `DELETE /classes/:id` — Delete class
- `GET /classes/:id/students` — Class students

### Courses
- `GET /courses` — List courses
- `POST /courses` — Create course
- `GET /courses/:id` — Course details
- `PUT /courses/:id` — Update course
- `DELETE /courses/:id` — Delete course

### Assessments
- `GET /assessments` — List assessments
- `POST /assessments` — Create assessment
- `POST /assessments/:id/attempt` — Start attempt
- `PUT /assessments/attempts/:attemptId` — Submit attempt

### Grades
- `GET /grades` — List grades
- `POST /grades` — Create grade
- `POST /grades/bulk` — Bulk create grades

### Transcripts
- `GET /transcripts` — List transcripts
- `POST /transcripts` — Create transcript
- `GET /transcripts/:id/export` — Export transcript (PDF/CSV)

### Users
- `GET /users` — List users
- `GET /users/:id` — User details
- `PATCH /users/:id` — Update user
- `POST /users/invite` — Invite user
- `DELETE /users/:id` — Soft-delete user

### Notifications
- `GET /notifications` — List notifications
- `PATCH /notifications/:id/read` — Mark as read
- `PATCH /notifications/read-all` — Mark all as read

## Database Models

- **User** — All user roles with permissions
- **School** — Educational institutions
- **Class** — Class/cohort groupings
- **Course** — Courses within classes
- **Grade** — Student grades with weighted scoring
- **Assessment** — Survey/assessment templates
- **AssessmentAttempt** — Completed submissions
- **Transcript** — Academic transcripts
- **StudentInvitation** / **MentorInvitation** — Invite tokens
- **ParentLink** — Parent-student relationships
- **Notification** — In-app notifications
- **AuditLog** — Action audit trail
- **RefreshToken** — JWT refresh token management (rotating)
