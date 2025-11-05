# Class Bridge Monorepo

A full-stack TypeScript project for the Class Bridge platform. The repository is organised as a dual-workspace monorepo with a Next.js frontend and an Express + MongoDB backend.

## Prerequisites

- Node.js 18 or later
- npm 9 or later (ships with Node 18+)
- Local or hosted MongoDB instance

> **Note:** All commands in the sections below are run from the repository root unless stated otherwise.

## Repository layout

```
Frontend/    Next.js 15 application (React 19, Tailwind CSS)
Backend/     Express API written in TypeScript
start-dev.sh Convenience script that starts both workspaces in parallel
```

## Environment configuration

Each workspace reads its own `.env` file.

### Frontend (`Frontend/.env.local`)

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_BASE_URL` | Browser-visible origin for the frontend (defaults to `http://localhost:3000`). |
| `BACKEND_URL` | Origin of the backend API that handles `/api/*` routes (defaults to `http://localhost:4000`). |

Use `.env.production` (copied from `.env.production.example`) for production builds.

### Backend (`Backend/.env`)

| Variable | Description |
| --- | --- |
| `PORT` | HTTP port for the Express server (`4000` by default). |
| `MONGODB_URI` | Connection string for MongoDB. |
| `SESSION_SECRET` | Secret used to sign session cookies. Must be a strong value in production. |
| `BREVO_API_KEY` | Optional Brevo (Sendinblue) API key for transactional email. |
| `EMAIL_FROM_NAME` / `EMAIL_FROM_ADDRESS` | Sender identity used for outbound emails. |
| `NEXT_PUBLIC_BASE_URL` | Public-facing URL of the frontend (used in emails). |
| `CORS_ORIGIN` | Comma-separated list of origins allowed to send credentialed requests (e.g. `http://localhost:3000`). |

A copyable template lives in `Backend/.env.example`.

## Installing dependencies

```bash
npm install --prefix Backend
npm install --prefix Frontend
```

The installs create separate `node_modules` folders inside each workspace. Do **not** run `npm install` at the repo root.

## Running locally

### Option 1 – one command for both apps

```bash
./start-dev.sh
```

The script launches `npm run dev` in `Backend/` and `Frontend/` simultaneously and tears them down when you stop the script (Ctrl+C).

### Option 2 – separate terminals

```bash
npm run dev --prefix Backend   # http://localhost:4000
npm run dev --prefix Frontend  # http://localhost:3000
```

Requests to `/api/*` from the Next.js app are proxied to the backend URL defined in the frontend environment file.

## Workspace commands

### Frontend (Next.js)

| Script | Description |
| --- | --- |
| `npm run dev` | Start Next.js in development mode. |
| `npm run build` | Create an optimised production build. |
| `npm run start` | Serve the production build. |
| `npm run lint` | Run ESLint with the project rules. |

The app lives in `Frontend/src` using the App Router, Tailwind CSS, and React Server Components.

### Backend (Express API)

| Script | Description |
| --- | --- |
| `npm run dev` | Start the API in watch mode via `ts-node-dev`. |
| `npm run build` | Compile TypeScript sources to `dist/`. |
| `npm run start` | Run the compiled server (`node dist/server.js`). |
| `npm run reset:db` | Connect to MongoDB and drop the configured database. |

The entry point is `Backend/src/server.ts` and the compiled output is ignored by git.

## API overview

The backend re-exposes all legacy Next.js route handlers under the Express router `Backend/src/routes/api.ts`. Key endpoints include:

| Method & Path | Purpose |
| --- | --- |
| `GET /api/auth/me` | Return the currently authenticated user with school and class metadata. |
| `GET /api/users/:id` | Fetch a specific user profile (self, same-school admin, or super admin access). |
| `PATCH /api/users/:id` | Update a user profile with role-aware permissions. |
| `POST /api/auth/login` | Issue a session cookie after credential validation. |
| `POST /api/auth/logout` | Clear the session cookie. |
| `POST /api/auth/password-reset` | Request a password reset link via email. |
| `GET/POST /api/auth/password-reset/:token` | Validate & consume password reset tokens. |
| `GET /api/schools/get` | List schools for the signed-in admin or super admin. |
| `PUT /api/schools/:id` | Update school metadata (school admin for own school, or super admin). |
| `POST /api/students/invite` | Invite students and email them via Brevo. |
| `POST /api/assessments` | Create a new assessment (mentor/super admin). |
| `GET /api/stats` | Dashboard statistics for authenticated users. |

All endpoints honour the shared session cookie (`userId`) and rely on the serializer in `Backend/src/lib/serializeUser.ts` to remove sensitive fields.

## Linting and builds

```bash
npm run build --prefix Backend
npm run lint --prefix Frontend
```

Run these before committing to ensure both workspaces compile cleanly.

## Deployment notes

- Deploy the frontend (Next.js) and backend (Node/Express) independently. The frontend must expose `NEXT_PUBLIC_BASE_URL` and point `BACKEND_URL` at the deployed API.
- The backend requires `SESSION_SECRET`, `MONGODB_URI`, and `CORS_ORIGIN` to be set. For production, build with `npm run build --prefix Backend` and run `npm run start --prefix Backend`.
- Shared code between workspaces currently lives in the backend (`Backend/src/models`, `Backend/src/lib`). If you need to share modules with the frontend, consider adding a `packages/` directory or publishing internal packages.

## Useful troubleshooting tips

- **Deprecation warning for `util._extend`:** ensure third-party dependencies are updated; no project source uses the API.
- **MongoDB connection issues:** confirm `MONGODB_URI` is reachable and that the database user has the right permissions.
- **Cross-origin errors:** check that `CORS_ORIGIN` includes every frontend origin that performs authenticated requests.

## Contributing workflow

1. Install dependencies for both workspaces.
2. Create `.env` files from the provided examples.
3. Develop using `./start-dev.sh` or separate terminals.
4. Run `npm run lint --prefix Frontend` and `npm run build --prefix Backend` before committing.
5. Push feature branches and open a pull request.

---

Happy building! Let the ClassBridge team know if you expand the API surface so we can keep this document updated.
