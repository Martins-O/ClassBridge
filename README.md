The repository is now split into dedicated frontend and backend workspaces:

- `Frontend/` – Next.js application (original survey client)
- `Backend/` – Node.js + TypeScript API skeleton with MongoDB utilities

## Frontend (Next.js)

```bash
cd Frontend
npm install
npm run dev
```

The app boots on [http://localhost:3000](http://localhost:3000). Environment files such as `.env.local` now live inside the `Frontend/` directory. Set `BACKEND_URL` (defaults to `http://localhost:4000`) if the API runs elsewhere; requests to `/api/*` are proxied to this backend URL via `next.config.ts`.

## Backend (Node + TypeScript)

```bash
cd Backend
npm install
npm run dev
```

The Express server listens on port `4000` by default. Copy `.env.example` to `.env` inside `Backend/` to customise the port or MongoDB connection string.

- `npm run build` compiles TypeScript to `dist/`
- `npm run start` runs the compiled server
- `npm run reset:db` drops the configured MongoDB database (replaces the old `scripts/reset-database.js` helper)

Cookies are used for authentication, so set `CORS_ORIGIN` (comma-separated) to the frontend origins that should receive credentials.

Local MongoDB data files and logs have been moved under `Backend/data/` and `Backend/logs/` and remain ignored by git.
