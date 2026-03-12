---
phase: 08-durable-abuse-controls
plan: "01"
subsystem: rate-limiter
tags: [security, rate-limiting, postgres, supabase]
requires: []
provides:
  - Durable Postgres-backed rate-limit storage
  - An atomic `consume_rate_limit()` RPC contract
  - A server-only async limiter facade for app code
affects: [submission, login, admin, workshop]
tech-stack:
  added: []
  patterns: [security-definer rpc, durable throttling, server-only infra]
key-files:
  created:
    - supabase/migrations/20260304_add_durable_rate_limits.sql
  modified:
    - src/lib/rate-limiter.ts
key-decisions:
  - "Phase 8 uses Supabase/Postgres for durable rate limits instead of adding Redis at the current scale."
  - "The app consumes limits through one RPC so multi-instance requests share a single source of truth."
patterns-established:
  - "Rate-limit checks are now async server operations that can fail closed with a 503 instead of silently resetting in memory."
requirements-completed:
  - RATE-01
duration: 15min
completed: 2026-03-04
---

# Phase 8 Plan 1: Durable Limiter Foundation Summary

**The in-memory limiter has been replaced with a durable design centered on Postgres-backed bucket consumption.**

## Performance

- **Duration:** 15 min
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Added `public.rate_limit_buckets` plus `consume_rate_limit()` and cleanup helpers in a new Supabase migration.
- Rebuilt `src/lib/rate-limiter.ts` as a server-only async facade that calls the durable RPC through the admin client.
- Preserved the route-level contract: callers still receive `null` when allowed and a user-facing error payload when blocked.

## Files Created/Modified

- `supabase/migrations/20260304_add_durable_rate_limits.sql` - Durable bucket table, atomic consume RPC, and cleanup helper.
- `src/lib/rate-limiter.ts` - Async durable limiter facade plus normalized client-IP helpers.

## Decisions Made

- Chose a Postgres-native design because the project already depends on Supabase and the roadmap explicitly does not require Redis at current scale.
- Failures in the limiter backend return a clear 503-style message instead of silently bypassing throttling.

## Deviations from Plan

None.

## Issues Encountered

- Runtime verification still requires the new migration to be applied to the connected Supabase project before the RPC can be exercised end to end.

## User Setup Required

- Apply `supabase/migrations/20260304_add_durable_rate_limits.sql` before testing the new limiter in a live environment.
