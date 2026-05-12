# ClassBridge

Full-stack education management platform for schools, mentors, students, and parents. Built with a **React + Vite** frontend and an **Express + MongoDB** backend.

## Architecture

```
classbridge/
├── frontend/          React + Vite + TypeScript (Vercel)
├── backend/           Express + MongoDB + TypeScript (Render)
├── start-dev.sh       Runs both in development
```

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB instance (local or Atlas)

### 1. Environment Setup

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your values
```

### 2. Install & Run

```bash
./start-dev.sh
```

Or separately:

```bash
# Terminal 1 — Backend
cd backend && npm install && npm run dev

# Terminal 2 — Frontend
cd frontend && npm install && npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:4000`.

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: 4000) |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `SESSION_SECRET` | Yes | Session signing secret |
| `JWT_SECRET` | Yes | JWT signing secret |
| `JWT_REFRESH_SECRET` | Yes | Refresh token secret |
| `CSRF_SECRET` | Yes | CSRF token signing secret |
| `EMAIL_HOST` | For email | SMTP host (e.g. `smtp.gmail.com`) |
| `EMAIL_PORT` | For email | SMTP port (`587`) |
| `EMAIL_USER` | For email | SMTP username |
| `EMAIL_PASSWORD` | For email | SMTP password / Gmail App Password |
| `EMAIL_FROM_ADDRESS` | For email | Sender address |
| `EMAIL_FROM_NAME` | For email | Sender name |
| `FRONTEND_URL` | Yes | Frontend URL (for email links & CORS) |
| `CORS_ORIGIN` | Yes | Allowed CORS origin |
| `CAPTCHA_SECRET_KEY` | No | Turnstile/reCAPTCHA secret |
| `CAPTCHA_SITE_KEY` | No | Turnstile/reCAPTCHA site key |
| `CLOUDINARY_*` | No | Cloudinary credentials for uploads |
| `REDIS_URL` | No | Redis URL for rate limiting |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | No | Backend API base URL (default: `/api/v1`) |

## Features

- **Role-based access** — system_admin, school_admin, mentor, student, parent, and staff roles
- **School management** — Registration with approval workflow
- **Class management** — Create, edit, assign mentors and students
- **Course management** — Create courses linked to classes
- **Assessments** — Peer, mentor-to-student, student-to-mentor, and self-assessments with multiple question types
- **Grades** — Full grading with weighted categories and letter grades
- **Transcripts** — Generate and export student transcripts (PDF/CSV)
- **Notifications** — In-app notification bell with read/unread tracking
- **Import/Export** — Bulk CSV import/export for students, classes, and grades
- **Audit Logs** — Full audit trail of all actions
- **Analytics** — School and global analytics dashboards
- **2FA** — TOTP-based two-factor authentication

## User Roles

| Role | Description |
|---|---|
| `system_admin` | Global platform administrator |
| `school_admin` | School-level administrator |
| `office_staff` | Administrative staff |
| `admissions` | Admissions staff |
| `counselor` | Academic counselor |
| `mentor` | Teacher / faculty |
| `student` | Enrolled student |
| `parent` | Parent / guardian |

## Deployment

### Backend (Render)

The backend includes a `render.yaml` with service configuration. Key settings:

- **Build command:** `npm install && npm run build`
- **Start command:** `npm start`
- **Health check:** `/api/health`
- Set environment variables in Render dashboard (sync: false vars)

### Frontend (Vercel)

The frontend includes a `vercel.json` for SPA routing. Set `VITE_API_URL` to the deployed backend URL (e.g. `https://your-backend.onrender.com/api/v1`).

### Email (Gmail SMTP)

1. Enable 2-Factor Authentication on your Google account
2. Generate an [App Password](https://support.google.com/accounts/answer/185833)
3. Set `EMAIL_HOST=smtp.gmail.com`, `EMAIL_PORT=587`, `EMAIL_USER`, and `EMAIL_PASSWORD` (the app password)

## API Overview

All routes are prefixed with `/api/v1`.

| Group | Endpoints |
|---|---|
| Auth | `POST /auth/login`, `POST /auth/register`, `POST /auth/logout`, `POST /auth/refresh`, `POST /auth/verify-email/:token`, `POST /auth/resend-verification`, `POST /auth/password-reset`, `POST /auth/change-password`, `GET /auth/me`, `POST /auth/2fa/*` |
| Schools | `GET /schools`, `GET /schools/:id`, `PUT /schools/:id`, `PATCH /schools/:id/status`, `POST /schools/request` |
| Classes | `GET /classes`, `POST /classes`, `GET /classes/:id`, `PUT /classes/:id`, `DELETE /classes/:id`, `GET /classes/:id/students` |
| Courses | `GET /courses`, `POST /courses`, `GET /courses/:id`, `PUT /courses/:id`, `DELETE /courses/:id` |
| Assessments | `GET /assessments`, `POST /assessments`, `POST /assessments/:id/attempt`, `GET /assessments/attempts/:attemptId` |
| Grades | `GET /grades`, `POST /grades`, `POST /grades/bulk`, `PUT /grades/:id`, `DELETE /grades/:id` |
| Transcripts | `GET /transcripts`, `POST /transcripts`, `GET /transcripts/:id/export` |
| Users | `GET /users`, `GET /users/:id`, `PATCH /users/:id`, `POST /users/invite`, `DELETE /users/:id` |
| Mentors | `GET /mentors`, `POST /mentors`, `GET /mentors/accept-invitation/:token` |
| Students | `POST /students/invite`, `POST /students/bulk-invite`, `GET /students/invitation/:token` |
| Parents | `GET /parents/children`, `POST /parents/children`, `DELETE /parents/children/:studentId` |
| Notifications | `GET /notifications`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all` |
| Import/Export | `POST /import/students`, `POST /import/classes`, `GET /export/students`, `GET /export/classes`, `GET /export/grades` |
| System | `GET /system/status`, `GET /system/metrics`, `GET /stats`, `GET /stats/analytics` |
| Audit | `GET /audit-logs`, `GET /audit-logs/recent` |

Full Swagger docs at `/api-docs` when the server is running.

## Scripts

### Backend

| Script | Description |
|---|---|
| `npm run dev` | Start with hot reload (ts-node-dev) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run compiled production build |
| `npm run seed` | Run database seed script |
| `npm run reset:db` | Drop the database |

### Frontend

| Script | Description |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

## Tech Stack

### Frontend
- **Framework:** React 19 + TypeScript
- **Build tool:** Vite
- **Styling:** Tailwind CSS v4
- **UI:** shadcn/ui (Radix primitives)
- **Routing:** React Router v6
- **State:** Zustand
- **HTTP:** Axios
- **Animation:** Framer Motion
- **Deploy:** Vercel

### Backend
- **Runtime:** Node.js + TypeScript
- **Framework:** Express
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (access + refresh tokens), session cookie fallback
- **Security:** CSRF (double-submit cookie), rate limiting, helmet
- **Email:** Nodemailer (Gmail SMTP)
- **File upload:** Multer + Cloudinary
- **Deploy:** Render
