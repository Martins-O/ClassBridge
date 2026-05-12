# ClassBridge

**Standardizing academic governance with secure, verifiable records.**

ClassBridge is a full-stack education management platform that connects schools, administrators, mentors, students, and parents in a unified ecosystem. It streamlines institutional workflows — class and course management, assessments, grading, transcript generation, role-based access control, and analytics — replacing fragmented spreadsheets and manual processes with a centralized digital infrastructure.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Users (Browser)                      │
├──────────────────────┬──────────────────────────────────────┤
│                      │                                      │
│     Vercel           │            Render                    │
│  ┌───────────────┐   │   ┌────────────────────────────┐   │
│  │  React + Vite │   │   │      Express API            │   │
│  │  (SPA)        │──────▶│  /api/v1/*                  │   │
│  │               │   │   │                            │   │
│  │  Tailwind CSS │   │   │  JWT Auth + CSRF           │   │
│  │  shadcn/ui    │   │   │  Rate Limiting             │   │
│  └───────────────┘   │   │  Input Sanitization         │   │
│                      │   │                            │   │
│                      │   ├────────────────────────────┤   │
│                      │   │      Services (Business)   │   │
│                      │   │      Repositories (Data)   │   │
│                      │   ├────────────────────────────┤   │
│                      │   │      Mongoose ODM          │   │
│                      │   └───────────┬────────────────┘   │
│                      │               │                    │
│                      │   ┌───────────▼────────────────┐   │
│                      │   │       MongoDB (Atlas)       │   │
│                      │   └────────────────────────────┘   │
│                      │                                    │
│                      │  ┌──────────────────────────────┐  │
│                      │  │  Gmail SMTP (Nodemailer)      │  │
│                      │  │  Cloudinary (File Uploads)    │  │
│                      │  └──────────────────────────────┘  │
└──────────────────────┴────────────────────────────────────┘
```

### Component Overview

| Layer | Technology | Hosting | Purpose |
|---|---|---|---|
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS v4, shadcn/ui | Vercel | Admin dashboard, registration, login, all user-facing UI |
| **Backend API** | Express, TypeScript | Render | REST API, authentication, business logic, data access |
| **Database** | MongoDB via Mongoose ODM | MongoDB Atlas | All persistent data (users, schools, classes, grades, etc.) |
| **Auth** | JWT (access + refresh tokens), session cookie fallback, CSRF double-submit cookies | — | Stateless authentication with token rotation |
| **Email** | Nodemailer (Gmail SMTP) | — | Verification emails, password resets, invitations, notifications |
| **File Storage** | Multer + Cloudinary | Cloudinary | Profile images, course materials, assessment attachments |

### Auth Flow

```
Browser                         Frontend                       Backend                        MongoDB
  │                                │                              │                              │
  │  POST /login (email+password)  │                              │                              │
  │───────────────────────────────▶│  POST /api/v1/auth/login     │                              │
  │                                │─────────────────────────────▶│  Verify credentials          │
  │                                │                              │─────────────────────────────▶│
  │                                │                              │◀─────────────────────────────│
  │                                │◀─────────────────────────────│  Return accessToken +        │
  │                                │                              │  refreshToken + user         │
  │◀───────────────────────────────│  Store tokens (localStorage)  │                              │
  │                                │                              │                              │
  │  Subsequent API calls          │  Axios interceptor           │                              │
  │───────────────────────────────▶│  attaches Bearer token       │  Verify JWT                  │
  │                                │─────────────────────────────▶│─────────────────────────────▶│
  │                                │◀─────────────────────────────│◀─────────────────────────────│
  │◀───────────────────────────────│                              │                              │
  │                                │                              │                              │
  │  On 401 → auto-refresh         │  POST /api/v1/auth/refresh   │                              │
  │                                │─────────────────────────────▶│  Rotate tokens               │
  │                                │                              │─────────────────────────────▶│
  │                                │◀─────────────────────────────│  New accessToken +           │
  │                                │                              │  refreshToken                │
  │◀───────────────────────────────│  Retry original request       │                              │
```

### Request Pipeline

```
Incoming Request
       │
       ▼
  Helmet (security headers)
       │
       ▼
  CORS (origin validation)
       │
       ▼
  JSON Body Parser (1MB limit)
       │
       ▼
  Cookie Parser
       │
       ▼
  Request Timeout (30s)
       │
       ▼
  Morgan (logging)
       │
       ▼
  Rate Limiter (100 req/15min per IP)
       │
       ▼
  Sanitize Input
       │
       ▼
  JWT Auth Middleware (extract user)
       │
       ▼
  CSRF Protection (POST/PUT/DELETE in production)
       │
       ▼
  Role/Permission Guard
       │
       ▼
  Controller → Service → Repository → MongoDB
       │
       ▼
  JSON Response
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

Frontend: `http://localhost:5173` — Backend: `http://localhost:4000`

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
| `SUPER_ADMIN_EMAIL` | No | Auto-seeded admin email |
| `SUPER_ADMIN_PASSWORD` | No | Auto-seeded admin password |
| `CAPTCHA_SECRET_KEY` | No | Turnstile/reCAPTCHA secret |
| `CAPTCHA_SITE_KEY` | No | Turnstile/reCAPTCHA site key |
| `CLOUDINARY_*` | No | Cloudinary credentials |
| `REDIS_URL` | No | Redis for rate limiting |

### Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | No | `/api/v1` | Backend API base URL |

In production (Vercel), set `VITE_API_URL` to the full Render backend URL (e.g. `https://your-backend.onrender.com/api/v1`).

## Features

### Role-Based Access Control
Eight distinct roles with granular permissions: `system_admin`, `school_admin`, `office_staff`, `admissions`, `counselor`, `mentor`, `student`, `parent`. Each role sees only what they need.

### School Management
- School registration with admin approval workflow
- Profile management, status tracking (pending/approved/rejected/suspended)
- School-level analytics and reporting

### Class & Course Management
- Create classes with mentor assignments and student enrollment
- Courses linked to classes with subject, credits, and capacity management
- Role-based access: mentors can only manage their assigned courses

### Assessments
- Multiple assessment types: peer review, mentor-to-student, student-to-mentor, self-assessment
- Question types: multiple choice, checkbox, text, rating, scale
- Weighted scoring with configurable passing thresholds
- Attempt tracking with max-attempt limits and time limits

### Grades
- Weighted grading categories (assignment, quiz, exam, project, participation, final)
- Automatic percentage and letter grade calculation
- Bulk grade creation
- Draft/published/archived status workflow

### Transcripts
- Auto-generated academic transcripts from grade records
- GPA calculation
- PDF and CSV export

### Communication
- In-app notification system with read/unread tracking
- Transactional emails via Gmail SMTP (verification, password reset, invitations)
- Notification types: info, success, warning, error, assignment, grade, invitation

### Security
- JWT access tokens (15min) + refresh tokens (7 days) with rotation
- CSRF double-submit cookie protection (production only)
- Rate limiting per endpoint group
- Input sanitization and validation
- Helmet security headers
- Optional CAPTCHA (Turnstile/reCAPTCHA)
- Optional 2FA (TOTP)
- Full audit logging

### Data Management
- CSV import/export for students, classes, and grades
- Bulk student invitations
- Soft-delete with restore capability

### Analytics & Reporting
- School-level dashboards with charts
- Global platform analytics (system admin)
- Audit log reports with filtering
- Activity tracking by role and action

## User Roles & Permissions

| Role | Key Capabilities |
|---|---|
| `system_admin` | Full platform access, approve schools, global stats, audit logs, system settings |
| `school_admin` | Manage school: users, classes, courses, grades, transcripts, reports |
| `office_staff` | Manage users, classes, courses, assessments, grades, transcripts |
| `admissions` | Invite students, view reports |
| `counselor` | View grades, reports, transcripts |
| `mentor` | Create/manage courses & assessments, grade students, view transcripts |
| `student` | View own courses, take assessments, view own grades & transcript |
| `parent` | View linked children's grades, classes, reports |

## Deployment

### Backend (Render)
The backend includes a `render.yaml` with service configuration:
- **Build:** `npm install && npm run build`
- **Start:** `npm start`
- **Health:** `/api/health`

### Frontend (Vercel)
- **Build:** `npm run build`
- **Output:** `dist/`
- SPA rewrites configured in `vercel.json`

### Gmail SMTP Setup
1. Enable 2-Factor Authentication on your Google account
2. Generate an [App Password](https://support.google.com/accounts/answer/185833)
3. Set `EMAIL_HOST=smtp.gmail.com`, `EMAIL_PORT=587`, `EMAIL_USER`, and `EMAIL_PASSWORD`

## API Overview

Base path: `/api/v1`

| Group | Endpoints |
|---|---|
| Auth | `POST /auth/login`, `POST /auth/register`, `POST /auth/logout`, `POST /auth/refresh`, `POST /auth/verify-email/:token`, `POST /auth/resend-verification`, `POST /auth/password-reset`, `POST /auth/change-password`, `GET /auth/me`, `POST /auth/2fa/*` |
| Schools | `GET /schools`, `GET /schools/:id`, `PUT /schools/:id`, `PATCH /schools/:id/status`, `POST /schools/request` |
| Classes | `GET /classes`, `POST /classes`, `GET /classes/:id`, `PUT /classes/:id`, `DELETE /classes/:id`, `GET /classes/:id/students` |
| Courses | `GET /courses`, `POST /courses`, `GET /courses/:id`, `PUT /courses/:id`, `DELETE /courses/:id` |
| Assessments | `GET /assessments`, `POST /assessments`, `POST /assessments/:id/attempt`, `PUT /assessments/attempts/:attemptId` |
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

Swagger docs at `/api-docs` when the server is running.

## Database Models

```
User ──────┬── School       (users belong to a school)
           ├── Class        (students enrolled, mentors assigned)
           ├── Course       (courses taught by mentors)
           ├── Grade        (grades awarded to students)
           └── ParentLink   (parent-student relationships)

School ────┬── Class        (classes within a school)
           ├── Course       (courses linked via class)
           ├── Assessment   (assessments created in the school)
           └── Transcript   (student transcripts)

Class ─────┬── Course       (courses belong to a class)
           ├── Assessment   (assessments scoped to classes)
           └── StudentInvitation  (invite tokens)
```

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + TypeScript | UI framework |
| Vite | Build tool, dev server, HMR |
| Tailwind CSS v4 | Utility-first styling |
| shadcn/ui (Radix) | Accessible component primitives |
| React Router v6 | Client-side routing |
| Zustand | Auth state management |
| Axios | HTTP client with JWT interceptor |
| Framer Motion | Animations |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + TypeScript | Runtime |
| Express | HTTP framework |
| MongoDB + Mongoose | Database & ODM |
| JWT (jsonwebtoken) | Stateless auth |
| Nodemailer | Email delivery (Gmail SMTP) |
| Multer + Cloudinary | File uploads |
| Helmet | Security headers |
| express-rate-limit | Rate limiting |
| express-mongo-sanitize | NoSQL injection prevention |
| Swagger (swagger-jsdoc) | API documentation |
| Winston | Logging |
| node-cron | Scheduled tasks |

## Scripts

### Backend
| Script | Description |
|---|---|
| `npm run dev` | Hot-reload dev server |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm run start` | Production server |
| `npm run seed` | Database seed |
| `npm run reset:db` | Drop database |

### Frontend
| Script | Description |
|---|---|
| `npm run dev` | Vite dev server (HMR) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |
