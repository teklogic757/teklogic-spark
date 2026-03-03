# Stack

## Runtime

- Primary runtime is Node.js via `next dev`, `next build`, and `next start` from `package.json`.
- The application is a Next.js App Router project on `next@^15.1.0`.
- UI uses `react@19.2.3` and `react-dom@19.2.3`.
- TypeScript is enabled through `typescript@^5` and `tsconfig.json`.
- Linting is configured with `eslint@^9` and `eslint-config-next@^15.1.0`.

## Frontend

- Styling is built on `tailwindcss@^4`, `@tailwindcss/postcss`, `tailwindcss-animate`, and `tw-animate-css`.
- The UI layer uses shadcn-style primitives under `src/components/ui/`.
- Radix UI packages support interactive controls such as dialogs, selects, tabs, and dropdowns.
- `framer-motion` is present for richer client-side motion.
- `next-themes` is installed for theme handling.
- Static assets live under `public/`, including `public/logo.svg` and `public/data/prompts.json`.

## Backend And Services

- Supabase is the primary backend, with clients in `src/lib/supabase/client.ts` and `src/lib/supabase/server.ts`.
- Auth/session handling is implemented with `@supabase/ssr`.
- Direct Supabase access uses `@supabase/supabase-js`.
- OpenAI integration is implemented with `openai@^6.16.0` in `src/lib/ai-evaluator.ts` and `src/app/api/voice/transcribe/route.ts`.
- Email delivery uses `nodemailer`, with optional `resend`.
- `pg` is installed for direct PostgreSQL scripting outside the app runtime.
- `dotenv` is available for script execution and local environment loading.

## Configuration

- `next.config.ts` disables `devIndicators` to avoid a local devtools issue.
- `middleware.ts` handles session refresh, auth-aware routing, and mobile redirects.
- `eslint.config.mjs`, `postcss.config.mjs`, and `components.json` define project tooling.
- Database migrations are split between `supabase/migrations/` and SQL utilities in `src/scripts/`.

## Notable Constraints

- The repo is intentionally on Next.js 15 rather than 16, per project docs in `AGENTS.md`.
- There is no test runner script in `package.json`; current scripts are limited to dev/build/start/lint.
- Some automation scripts are TypeScript files under `src/scripts/` and `scripts/`, implying manual execution rather than a dedicated task runner.
