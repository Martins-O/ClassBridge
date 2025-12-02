# ClassBridge Frontend (Reset)

The previous implementation has been archived (`Frontend_backup.tar.gz`). This folder contains a clean Next.js 14 + TypeScript baseline so we can reintroduce features incrementally. Start the dev server once dependencies are installed:

```
npm install
npm run dev
```

Each new feature should live in its own branch or commit with dedicated UI/components to keep scope tight.

## Testing

The project ships with Vitest + Testing Library configured via `vitest.config.ts`.

```
npm run test
```

Current coverage focuses on the school admin login form to ensure navigation and error handling work end-to-end. Use the same stack as you add more flows.
