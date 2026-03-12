---
phase: 08-durable-abuse-controls
plan: "02"
subsystem: action-cutover
tags: [security, rate-limiting, server-actions]
requires:
  - plan: "01"
    provides: Durable limiter backend and async facade
provides:
  - Existing server actions now await durable limiter checks
  - Stable identifiers for user and IP scoped throttles
  - Early exits before expensive downstream work
affects: [login, admin, authenticated-submit]
tech-stack:
  added: []
  patterns: [explicit identifiers, fail-fast guards, shared async guard]
key-files:
  created: []
  modified:
    - src/app/login/actions.ts
    - src/app/admin/actions.ts
    - src/lib/submit-flow.ts
    - src/lib/rate-limiter.ts
key-decisions:
  - "IP-based routes now use one normalized helper instead of reading forwarding headers ad hoc."
  - "Authenticated submit and admin invite throttles use explicit `user:`-prefixed identifiers for clarity."
patterns-established:
  - "Durable rate limiting is now treated as a first-class awaited server-side guard."
requirements-completed:
  - RATE-01
  - RATE-02
duration: 9min
completed: 2026-03-04
---

# Phase 8 Plan 2: Existing Action Cutover Summary

**The existing throttled server actions now use the durable limiter path instead of process-local counters.**

## Performance

- **Duration:** 9 min
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Updated login organization lookup to throttle by normalized client IP through the shared durable limiter.
- Updated admin invitation creation to await the durable limiter with an explicit user-scoped identifier.
- Updated authenticated submit flow throttling so the durable limiter runs before organization lookup, AI evaluation, and persistence.

## Files Created/Modified

- `src/app/login/actions.ts` - Uses normalized client IP throttling.
- `src/app/admin/actions.ts` - Awaits the durable invitation limiter.
- `src/lib/submit-flow.ts` - Awaits the durable authenticated submission limiter.
- `src/lib/rate-limiter.ts` - Added shared identifier helpers used by callers.

## Decisions Made

- Kept route-level error handling unchanged so forms still receive the same `{ error }` style responses.
- Centralized IP normalization in the limiter module to avoid diverging rate-limit keys across routes.

## Deviations from Plan

None.

## Issues Encountered

- Full production build still stops on the repository’s existing environment-policy guard after compile and type-check, unrelated to this phase’s code.

## User Setup Required

- None beyond the Phase 8 migration and manual verification steps.
