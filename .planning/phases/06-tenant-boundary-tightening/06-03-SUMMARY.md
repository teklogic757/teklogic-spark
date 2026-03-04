---
phase: 06-tenant-boundary-tightening
plan: "03"
subsystem: leaderboard
tags: [tenant-isolation, leaderboard, least-privilege]
requires:
  - phase: 06-tenant-boundary-tightening
    provides: Shared tenant request context and typed dashboard reads
provides:
  - A typed `user_leaderboard` view contract in the database types
  - Tenant-facing leaderboard helpers that accept scoped clients
  - Desktop and mobile leaderboard pages that reuse the shared tenant context
affects: [dashboard, leaderboard, mobile, digest]
tech-stack:
  added: []
  patterns: [view typing, dependency injection, least-privilege shared reads]
key-files:
  created: []
  modified:
    - src/lib/types/database.types.ts
    - src/lib/leaderboard.ts
    - src/app/[client_id]/leaderboard/page.tsx
    - src/app/[client_id]/m/page.tsx
    - src/app/[client_id]/m/leaderboard/page.tsx
    - src/lib/contest-digest.ts
key-decisions:
  - "Leaderboard helpers now receive the caller's Supabase client instead of creating a service-role client internally."
  - "The admin digest path can still pass an admin client explicitly, keeping privileged usage visible at the callsite."
patterns-established:
  - "Shared tenant-facing read helpers should accept an injected client when authenticated RLS-safe access is sufficient."
requirements-completed:
  - SECU-01
  - SECU-03
duration: 14min
completed: 2026-03-04
---

# Phase 6 Plan 3: Least-Privilege Leaderboard Summary

**Tenant-facing leaderboard reads no longer default to service-role access.**

## Performance

- **Duration:** 14 min
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Added an explicit `user_leaderboard` view type so leaderboard reads map cleanly without page-local coercion.
- Refactored `src/lib/leaderboard.ts` to accept an injected Supabase client, allowing tenant pages to use the authenticated user client while the digest keeps its explicit admin client.
- Updated desktop leaderboard, mobile home, and mobile leaderboard pages to reuse the shared tenant request context and the new least-privilege leaderboard contract.

## Files Created/Modified

- `src/lib/types/database.types.ts` - Adds the typed `user_leaderboard` view contract.
- `src/lib/leaderboard.ts` - Uses injected clients instead of hardcoded service-role access.
- `src/app/[client_id]/leaderboard/page.tsx` - Uses the shared tenant context and user-scoped leaderboard reads.
- `src/app/[client_id]/m/page.tsx` - Uses the same least-privilege current-user score lookup.
- `src/app/[client_id]/m/leaderboard/page.tsx` - Uses the same least-privilege organization leaderboard lookup.
- `src/lib/contest-digest.ts` - Passes the admin client explicitly for the privileged digest path.

## Decisions Made

- Privileged reads are still allowed where appropriate, but the privilege level is now controlled at the callsite instead of hidden inside the helper.
- Tenant pages now share one request-context helper for auth and tenant checks instead of repeating mixed client logic.

## Deviations from Plan

None.

## Issues Encountered

None.

## User Setup Required

None.
