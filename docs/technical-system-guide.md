# Teklogic Spark AI Technical System Guide

## Purpose

This document explains how Teklogic Spark AI works today for internal technical team members. It is intended to help engineers, technical operators, and future contributors understand the actual system shape, not an aspirational future architecture.

## System Summary

Teklogic Spark AI is a multi-tenant Next.js 15 App Router application backed by Supabase. It supports authenticated employees and workshop guests, captures AI/automation ideas, enriches them with OpenAI-based evaluation, stores everything in Postgres, and exposes tenant-specific dashboards plus a super-admin management area.

## Core Stack

- Next.js 15.5 App Router
- React 19
- TypeScript
- Tailwind CSS 4 with shadcn/Radix-style UI primitives
- Supabase Auth, Postgres, and Storage
- OpenAI GPT-4o-mini for idea evaluation
- Nodemailer or Resend for outbound email
- Vitest for regression tests

## Architectural Pattern

The app is server-first.

- most reads happen in server components
- most writes happen in server actions
- client components exist mainly for interactivity
- Supabase is both auth boundary and primary data store

The route structure is organized around tenant-aware paths under `src/app/[client_id]/...`, with shared public entry points and a separate `/admin` area.

## Major Product Surfaces

### Public And Auth Surfaces

- `/` redirects users to the appropriate login or dashboard path
- `/login` is the global login entry point
- `/auth/callback` handles auth code exchange and redirect completion
- `/join` supports workshop access flows

### Tenant Surfaces

- `/{client_id}/dashboard`
- `/{client_id}/submit`
- `/{client_id}/leaderboard`
- `/{client_id}/prompts`
- mobile tenant routes under `/{client_id}/m/...`

### Admin Surfaces

- `/admin/organizations`
- `/admin/users`
- `/admin/invites`
- `/admin/workshops`
- `/admin/training`
- `/admin/profile`

### API / Background Surfaces

- `/api/voice/transcribe`
- `/api/cron/contest-digest`

## Core Domain Model

The system is centered on these main entities:

- `organizations`
- `users`
- `ideas`
- `invitations`
- `workshop_access_codes`
- `training_videos`

Ideas are the central domain object. They connect organization context, submitter identity, optional attachments, AI scoring, and engagement mechanics such as leaderboard points.

## Multi-Tenant Model

Tenant context is path-based. The `client_id` segment is the active organization slug.

The main tenant access resolution logic now flows through [dashboard-access.ts](/c:/Users/justi/Dropbox/antigravity/Teklogic_Project1/teklogic-ideas/src/lib/dashboard-access.ts). That helper:

- loads the current user
- resolves the user profile
- resolves the organization
- redirects users to the correct tenant if they hit the wrong one
- provides typed tenant context for dashboard-style pages

Standard data access is intended to rely on Supabase RLS. In a few known cases, the app uses an admin client to bypass RLS for reliability or privileged operations.

## Authentication And Access

Authentication is handled through Supabase Auth with email/password and magic link support.

The current pattern is:

- global login determines who the user is
- the app finds the user’s organization
- the user is redirected to `/{organization_slug}/dashboard`

Workshop guests use a separate access path through workshop codes and cookie-backed organization context, which allows limited submission access without a full employee account.

## Idea Submission Flow

The main submission workflow is centralized in [submit-flow.ts](/c:/Users/justi/Dropbox/antigravity/Teklogic_Project1/teklogic-ideas/src/lib/submit-flow.ts).

That flow is intentionally broken into three stages:

1. `prepareSubmit`
2. `persistIdeaSubmission`
3. `runPostPersist`

### Preparation Stage

This stage:

- normalizes form input
- validates fields and attachments
- resolves submitter context
- enforces rate limits
- loads organization context
- performs AI evaluation

### Persistence Stage

This stage:

- uploads attachments to Supabase Storage when present
- inserts the idea into the `ideas` table
- updates score totals for authenticated users

### Post-Persist Stage

This stage:

- resolves admin recipients
- builds the user-facing review email
- includes relevant Reddit links when available
- sends combined review/admin notification emails
- records outcome details for delivery, failure, or skip conditions

## AI Evaluation Flow

The AI evaluation engine lives in [ai-evaluator.ts](/c:/Users/justi/Dropbox/antigravity/Teklogic_Project1/teklogic-ideas/src/lib/ai-evaluator.ts).

It:

- sanitizes user-supplied prompt input
- injects organization context
- sends structured evaluation requests to OpenAI
- computes canonical weighted scores
- applies guardrails to reduce inflated scoring
- returns structured output used for storage and email generation

The output includes:

- overall score
- criterion-level scores
- reframed idea copy
- coaching feedback
- improvement checklist
- related suggestions
- metadata stored in JSON form

## Dashboard And Leaderboard Flow

Dashboard aggregation is driven by [dashboard-access.ts](/c:/Users/justi/Dropbox/antigravity/Teklogic_Project1/teklogic-ideas/src/lib/dashboard-access.ts) and [leaderboard.ts](/c:/Users/justi/Dropbox/antigravity/Teklogic_Project1/teklogic-ideas/src/lib/leaderboard.ts).

The dashboard currently assembles:

- tenant info
- top ideas
- current user ideas
- current user score
- organization leaderboard
- training resources
- prompt-hub teaser content
- contest banner state

The leaderboard is organization-scoped and no longer depends on ad hoc score reads from the `users` table alone.

## Prompt And Training Surfaces

The prompt hub is a curated prompt experience backed by static prompt data in `public/data/prompts.json`.

Training resources are admin-managed and flow through:

- [training-video-access.ts](/c:/Users/justi/Dropbox/antigravity/Teklogic_Project1/teklogic-ideas/src/lib/training-video-access.ts)
- [training-videos.ts](/c:/Users/justi/Dropbox/antigravity/Teklogic_Project1/teklogic-ideas/src/lib/training-videos.ts)

This keeps tenant-scoped training reads separated from dashboard composition logic.

## Admin Architecture

Most admin mutations live in [actions.ts](/c:/Users/justi/Dropbox/antigravity/Teklogic_Project1/teklogic-ideas/src/app/admin/actions.ts).

The admin area currently supports:

- organization CRUD
- user CRUD
- invitation creation
- workshop code operations
- training video management
- idea and attachment access for organization views

The admin layer verifies super-admin access before mutations and records audit events for sensitive operations.

## Notifications And Digest Flow

Outbound email behavior is centralized in [email.ts](/c:/Users/justi/Dropbox/antigravity/Teklogic_Project1/teklogic-ideas/src/lib/email.ts).

Current supported flows include:

- welcome email
- guest welcome flow
- idea review email
- admin notification email
- contest digest email

The digest workflow is supported by [contest-digest.ts](/c:/Users/justi/Dropbox/antigravity/Teklogic_Project1/teklogic-ideas/src/lib/contest-digest.ts) and the cron route at `/api/cron/contest-digest`.

## Rate Limiting And Abuse Controls

Rate limiting is handled through [rate-limiter.ts](/c:/Users/justi/Dropbox/antigravity/Teklogic_Project1/teklogic-ideas/src/lib/rate-limiter.ts).

The current system includes:

- action-level throttling for key server actions
- guest/workshop-specific identifiers
- attachment-aware submission limits
- durable limiter work implemented in code

Known gap:

- runtime verification debt from Phase 8 remains open and is scheduled to close in Phase 12

## Environment And Deployment Safety

Phase 10 added a shared deployment/runtime policy through:

- [env-policy.mjs](/c:/Users/justi/Dropbox/antigravity/Teklogic_Project1/teklogic-ideas/src/lib/env-policy.mjs)
- [env-validator.ts](/c:/Users/justi/Dropbox/antigravity/Teklogic_Project1/teklogic-ideas/src/lib/env-validator.ts)
- [site-url.ts](/c:/Users/justi/Dropbox/antigravity/Teklogic_Project1/teklogic-ideas/src/lib/site-url.ts)

This now governs:

- canonical site URL handling
- production-safe redirect and link generation
- deploy-time environment validation
- blocking of local-only overrides in production-like environments

Deployment gates added in Phase 10:

- `npm run check:repo-hygiene`
- `npm run check:deploy-env`
- `npm run build:deploy`

## Testing And Verification Posture

The repo now has a committed Vitest baseline and regression suites for:

- score integrity
- tenant dashboard access
- submission flow boundaries
- workshop join behavior

Current automated status:

- `npm run test:ci` passes
- `npm run check:repo-hygiene` passes
- `npm run check:deploy-env` works as intended

Current limitation:

- `npm run build` is intentionally blocked in production-like mode until local unsafe env overrides are removed and a valid `NEXT_PUBLIC_SITE_URL` is provided

## Key Technical Risks And Known Debt

### Verification Debt

- durable limiter runtime verification is still pending
- Phase 10 deployment verification is implemented in code but still needs clean-env operator validation

### Architectural Tradeoffs

- large admin action files still mix orchestration, Supabase access, and side effects
- some privileged paths still depend on service-role access to avoid RLS deadlocks
- route-level logic is pragmatic and direct rather than strongly layered

### Deployment State

The app is functionally private/internal today. It is not yet in the “ready to publish publicly” state, even though the deployment safety work is underway.

## Recommended Reading Order For New Engineers

1. [README.md](/c:/Users/justi/Dropbox/antigravity/Teklogic_Project1/teklogic-ideas/README.md)
2. [deployment.md](/c:/Users/justi/Dropbox/antigravity/Teklogic_Project1/teklogic-ideas/docs/deployment.md)
3. [dashboard-access.ts](/c:/Users/justi/Dropbox/antigravity/Teklogic_Project1/teklogic-ideas/src/lib/dashboard-access.ts)
4. [submit-flow.ts](/c:/Users/justi/Dropbox/antigravity/Teklogic_Project1/teklogic-ideas/src/lib/submit-flow.ts)
5. [admin/actions.ts](/c:/Users/justi/Dropbox/antigravity/Teklogic_Project1/teklogic-ideas/src/app/admin/actions.ts)
6. [ai-evaluator.ts](/c:/Users/justi/Dropbox/antigravity/Teklogic_Project1/teklogic-ideas/src/lib/ai-evaluator.ts)
7. [10-VERIFICATION.md](/c:/Users/justi/Dropbox/antigravity/Teklogic_Project1/teklogic-ideas/.planning/phases/10-repository-and-secret-hygiene/10-VERIFICATION.md)
