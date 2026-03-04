# Phase 3: Digest And Content Admin - Research

**Researched:** 2026-03-03
**Status:** Ready for planning

## Objective

Answer the planning question for Phase 3: what needs to change so Teklogic Spark AI can send a true weekly contest digest during active contests and let super admins manage the dashboard training-video library from the app.

## Current Implementation Snapshot

### Contest and leaderboard state

- Contest state already lives on `organizations` via `contest_starts_at`, `contest_ends_at`, `contest_config`, and `is_leaderboard_enabled`.
- The tenant dashboard already surfaces active-contest UI through:
  - `src/components/features/contest/ContestBanner.tsx`
  - `src/components/features/contest/ContestTimer.tsx`
  - leaderboard queries in `src/app/[client_id]/dashboard/page.tsx`
- There is no digest-specific query path, no digest email helper, and no cron-style route or server action dedicated to scheduled contest messaging.
- There is also no persisted "last digest sent" marker, so nothing currently enforces a weekly cadence.

### Training library state

- Dashboard training content is fully static today:
  - `src/data/training-videos.ts` hard-codes the entire library.
  - `src/components/features/dashboard/TrainingResources.tsx` shuffles and paginates that static list on the client.
- There is no `training_videos` table in `src/lib/types/database.types.ts`.
- There is no admin route or action for creating or deleting learning-library items.
- The admin shell currently links only to organizations, users, and invites in `src/app/admin/layout.tsx`.

### Existing implementation seams to reuse

- Super-admin authorization already exists in `src/app/admin/actions.ts` via `verifyAdmin()`.
- Server-side privileged reads and writes already use `createAdminClient()` where RLS bypass is necessary.
- Email delivery already has a shared abstraction in `src/lib/email.ts`, including multi-recipient support and explicit delivery status.
- The project already favors server-rendered pages and server actions over client-driven data fetching.

## Gaps Against Phase Requirements

### NOTF-04: Weekly digest for active contests

- The contest UI is present, but there is no application path that can be invoked on a schedule.
- No data shape currently stores when a digest last ran, so "weekly" cannot be enforced safely.
- No existing email template summarizes leaderboard standings and recent high-scoring ideas.
- No current job path iterates active organizations and guards against inactive or expired contests.

### ADMN-01 / ADMN-02: Admin-managed training videos

- Adding a YouTube video currently requires editing `src/data/training-videos.ts`.
- Removing a training video also requires code edits and redeploy.
- Because the dashboard reads static data in a client component, admin changes cannot become visible without a new build.
- The current type layer and schema do not model a managed training-video record.

## Recommended Technical Shape

### 1. Add minimal persistence for both features

Use one migration to introduce the missing storage the app needs:

- Add `last_contest_digest_sent_at TIMESTAMPTZ` to `organizations`
  - Keeps digest cadence tied to the contest-owning record.
  - Avoids introducing a separate job ledger table for this milestone.
- Add a `training_videos` table for the shared learning library
  - Recommended columns: `id`, `title`, `youtube_url`, `youtube_video_id`, `thumbnail_url`, `is_active`, `created_at`, `created_by`
  - Keep the table global, not tenant-scoped, because the current dashboard library is shared across organizations.

This keeps the phase small while still making both features truly manageable.

### 2. Implement a cron-ready digest path, not a manual-only placeholder

The cleanest "scheduled-style" implementation is a route handler such as:

- `src/app/api/cron/contest-digest/route.ts`

Recommended behavior:

- Require a shared secret (for example `CRON_SECRET`) before running.
- Query organizations whose contests are currently active:
  - `contest_config.is_active === true`
  - `contest_starts_at <= now`
  - `contest_ends_at > now`
- Skip any organization whose `last_contest_digest_sent_at` is within the last 7 days.
- Build digest content from:
  - current top leaderboard users (`users` ordered by `total_points`)
  - recent top ideas (`ideas` ordered by score or recent date within the contest window)
- Send the digest through a dedicated email helper in `src/lib/email.ts`.
- Stamp `last_contest_digest_sent_at` only after a successful or intentionally skipped send decision for that organization.

This creates a real application path that can later be wired to Vercel Cron without redesigning the feature.

### 3. Move training resources to server-backed reads

To stay aligned with the project architecture:

- Fetch training videos in `src/app/[client_id]/dashboard/page.tsx` as a server read.
- Pass the fetched list into `TrainingResources` as props instead of importing static data directly.
- Keep a small fallback path if no DB rows exist yet, but the primary source should become the new table.

This avoids client-side data ownership for content that admins now control.

### 4. Add a focused admin training page instead of overloading organizations

The simplest admin UX is a dedicated route such as:

- `src/app/admin/training/page.tsx`

It should:

- render the current library
- provide one add form that accepts a YouTube URL (optionally a title override)
- provide one remove action per row

The mutation logic can live in `src/app/admin/actions.ts` if staying consistent with the current repo pattern, though a dedicated `src/app/admin/training/actions.ts` file would also be reasonable if the file size is becoming a problem.

### 5. Centralize YouTube parsing and validation

The current static helper only extracts `?v=` URLs. The admin flow should support common YouTube formats:

- `youtube.com/watch?v=...`
- `youtu.be/...`
- embedded or shortened variants when practical

A shared parser/validator should:

- normalize the URL
- extract a stable video ID
- derive the thumbnail URL
- reject malformed or unsupported inputs before insert

That logic should live outside the UI so both admin actions and dashboard rendering can trust the stored shape.

## Validation Architecture

Phase 3 can use the existing smoke-check envelope:

- Quick feedback after each task: `npm run lint`
- Full suite after each plan wave: `npm run build`
- Manual verification for behaviors that depend on auth, data, and real delivery wiring:
  - invoke the digest path with one active contest and verify it skips inactive organizations
  - add a valid YouTube URL in admin and confirm it appears on the tenant dashboard
  - delete that same item and confirm it disappears without code edits

## Files Most Likely To Change

- `supabase/migrations/*`
- `src/lib/types/database.types.ts`
- `src/lib/validators.ts`
- `src/lib/email.ts`
- `src/app/api/cron/contest-digest/route.ts`
- `src/app/admin/actions.ts`
- `src/app/admin/layout.tsx`
- `src/app/admin/training/page.tsx`
- `src/app/[client_id]/dashboard/page.tsx`
- `src/components/features/dashboard/TrainingResources.tsx`
- `src/data/training-videos.ts`

## Planning Notes

- Split the phase into one foundation plan and two feature plans after it:
  - schema + shared helpers first
  - digest flow second
  - admin training UI and dashboard integration third
- Keep scope tight:
  - no full background queue system
  - no tenant-specific training catalogs
  - no YouTube metadata scraping API integration unless already available

---

*Phase: 03-digest-and-content-admin*
*Research completed: 2026-03-03*
