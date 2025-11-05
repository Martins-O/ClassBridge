# Backend

Node.js + TypeScript service skeleton for the survey platform. Provides an Express server with a health endpoint and MongoDB reset utility.

## Scripts

- `npm run dev` – start the API in watch mode (ts-node-dev)
- `npm run build` – compile TypeScript sources to `dist`
- `npm run start` – run the compiled server from `dist`
- `npm run reset:db` – drop the configured MongoDB database

Set environment variables in a `.env` file (see `.env.example`).
