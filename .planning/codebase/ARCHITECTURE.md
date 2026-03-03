# Architecture

## High-Level Pattern

- This is a multi-tenant Next.js App Router application organized around `src/app/[client_id]/...`.
- Most read paths are server-rendered pages and layouts, with server actions handling mutations.
- Interactive UI is isolated to client components in `src/components/` and feature-specific subfolders.
- Supabase is both the identity boundary and the primary domain data layer.

## Route Layers

- Public entry points include `src/app/page.tsx`, `src/app/login/page.tsx`, and `src/app/join/page.tsx`.
- Tenant-scoped product routes live under `src/app/[client_id]/`.
- Desktop product routes include dashboard, submit, leaderboard, and prompts.
- Mobile-specific routes live under `src/app/[client_id]/m/`.
- Admin flows are grouped under `src/app/admin/`.
- Auth callback and signout handlers are implemented in `src/app/auth/callback/route.ts` and `src/app/auth/signout/route.ts`.
- Voice upload is exposed as `src/app/api/voice/transcribe/route.ts`.

## Data Flow

- Request enters `middleware.ts` for session refresh, workshop exceptions, and mobile redirect logic.
- Server pages call `createClient()` for user-scoped reads and `createAdminClient()` for privileged reads.
- Mutations run in server actions such as `src/app/login/actions.ts`, `src/app/[client_id]/submit/actions.ts`, and `src/app/admin/actions.ts`.
- AI enrichment is delegated to `src/lib/ai-evaluator.ts`.
- Email notifications are delegated to `src/lib/email.ts`.
- Revalidation and navigation are handled with `revalidatePath()` and `redirect()`.

## Security Model

- Standard user access is intended to rely on Supabase RLS.
- Specific workflows bypass RLS with the admin client, especially org lookups and admin operations.
- Input validation is centralized in `src/lib/validators.ts`.
- Prompt content is sanitized before entering AI prompts via `src/lib/prompt-sanitizer.ts`.
- Rate limiting is applied in several actions through `src/lib/rate-limiter.ts`.

## Domain Focus

- Core domain entities are organizations, users, ideas, invitations, workshop access codes, and contest settings.
- Idea submission is the main business workflow and includes validation, optional file upload, AI scoring, persistence, point updates, and email fan-out.
- The dashboard combines ranked ideas, user-specific ideas, leaderboard data, prompt discovery, and contest state.

## Architectural Tradeoffs

- The app favors pragmatic direct Supabase calls inside routes/actions instead of a separate repository/service layer.
- Business logic is concentrated in a few large server action files, especially `src/app/[client_id]/submit/actions.ts` and `src/app/admin/actions.ts`.
- This keeps implementation direct but increases coupling between transport, domain logic, and side effects.
