# Structure

## Top-Level Layout

- `src/app/` contains all routes, layouts, server actions, and API handlers.
- `src/components/` contains shared UI primitives and feature-specific components.
- `src/lib/` contains integration code, validators, and reusable domain helpers.
- `src/data/` stores static data used by product features.
- `public/` stores static assets and prompt JSON content.
- `supabase/migrations/` contains database migrations.
- `src/scripts/` and `scripts/` contain operational SQL and TypeScript utilities.
- `docs/` contains onboarding and setup documentation.

## App Router Breakdown

- `src/app/login/` is the primary global login experience.
- `src/app/[client_id]/dashboard/` is the main tenant dashboard.
- `src/app/[client_id]/submit/` contains the primary idea submission flow.
- `src/app/[client_id]/leaderboard/` and `src/app/[client_id]/prompts/` extend tenant features.
- `src/app/[client_id]/m/` mirrors key tenant routes for mobile-specific UX.
- `src/app/admin/` contains super-admin management for organizations, users, invites, profile, and workshops.
- `src/app/api/voice/transcribe/` is the only API route visible in the current tree.

## Component Organization

- Generic shadcn-style components live in `src/components/ui/`.
- Dashboard-related widgets live in `src/components/features/dashboard/`.
- Contest components live in `src/components/features/contest/`.
- Idea browsing and modals live in `src/components/features/ideas/`.
- Prompt browsing components live in `src/components/features/prompts/`.
- Mobile shell components live in `src/components/mobile/`.
- Cross-feature components include `src/components/TopIdeas.tsx`, `src/components/submit-idea-form.tsx`, and `src/components/voice-recorder.tsx`.

## Naming Patterns

- Routes use Next.js conventions: `page.tsx`, `layout.tsx`, `route.ts`, and `actions.ts`.
- Feature files tend to use PascalCase for components and camelCase for libraries and utilities.
- SQL migrations use timestamp or ordered prefixes such as `20250131_add_attachment_fields.sql`.

## Structural Observations

- Admin logic is centralized in `src/app/admin/actions.ts` rather than split per resource.
- Tenant submit logic is centralized in `src/app/[client_id]/submit/actions.ts`.
- The repo mixes permanent app code, operational scripts, and database artifacts in a single workspace.
- There is no dedicated `tests/` directory or separate package for shared backend services.
