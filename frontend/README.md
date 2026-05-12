# ClassBridge Frontend

React + Vite + TypeScript frontend for the ClassBridge education management platform.

## Tech Stack

- **React 19** with TypeScript
- **Vite** for build tooling and HMR
- **Tailwind CSS v4** for styling
- **shadcn/ui** component library (Radix UI primitives)
- **React Router v6** for routing
- **Zustand** for auth state management
- **Axios** for HTTP with JWT refresh interceptor
- **Framer Motion** for page/component animations
- **Lucide React** for icons

## Getting Started

```bash
npm install
npm run dev
```

Development server starts at `http://localhost:5173`. API requests to `/api/*` are proxied to `http://localhost:4000` (configured in `vite.config.ts`).

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |

## Project Structure

```
src/
├── components/       Reusable UI components (shadcn/ui)
├── hooks/            Custom React hooks
├── layouts/          AdminLayout, PublicLayout, DashboardLayout
├── lib/              Utility functions
├── pages/            Route pages
│   ├── admin/        Admin dashboard pages
│   └── parent/       Parent dashboard pages
├── services/         Axios API client
├── stores/           Zustand stores
├── types/            TypeScript type definitions
├── utils/            Helper functions
└── App.tsx           Router configuration
```

## Key Pages

| Route | Component | Access |
|---|---|---|
| `/` | LandingPage | Public |
| `/login` | LoginPage | Public |
| `/register` | RegisterPage | Public |
| `/dashboard` | Admin Dashboard | Authenticated |
| `/schools` | SchoolsListPage | System Admin |
| `/classes` | ClassesListPage | Authenticated |
| `/courses` | CoursesListPage | Authenticated |
| `/assessments` | AssessmentsListPage | Authenticated |
| `/grades` | GradesListPage | Authenticated |
| `/students` | StudentsListPage | Authenticated |
| `/transcripts` | TranscriptsListPage | Authenticated |
| `/users` | UsersListPage | System/School Admin |
| `/settings` | SettingsPage | Authenticated |
| `/profile` | ProfilePage | Authenticated |
| `/analytics` | AnalyticsPage | Authenticated |
| `/import-export` | ImportExportPage | Authenticated |
| `/audit-logs` | AuditLogsPage | System Admin |
| `/reports` | ReportsPage | System Admin |

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `/api/v1` | Backend API base URL |

In production (Vercel), set `VITE_API_URL` to the full Render backend URL (e.g. `https://your-backend.onrender.com/api/v1`).
