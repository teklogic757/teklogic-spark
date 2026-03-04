---
phase: 05-score-integrity
plan: "03"
subsystem: leaderboard
tags: [leaderboard, dashboard, migration, digest, reconciliation]
requires:
  - phase: 05-score-integrity
    provides: Canonical score contract active in evaluator and submit flows
provides:
  - A score-reconciliation migration for historical ideas and cached user totals
  - A shared leaderboard aggregation helper
  - Dashboard, leaderboard, mobile, and digest reads aligned to one aggregate path
affects: [dashboard, leaderboard, mobile, digest, database]
tech-stack:
  added: []
  patterns: [shared leaderboard read model, migration-based score repair]
key-files:
  created:
    - supabase/migrations/20260304_reconcile_score_integrity.sql
    - src/lib/leaderboard.ts
  modified:
    - src/app/[client_id]/dashboard/page.tsx
    - src/app/[client_id]/leaderboard/page.tsx
    - src/app/[client_id]/m/page.tsx
    - src/app/[client_id]/m/leaderboard/page.tsx
    - src/lib/contest-digest.ts
key-decisions:
  - "Historical repair backfills only rows whose rubric criteria are fully present in `ai_analysis_json`."
  - "Score-facing surfaces now read from `user_leaderboard` through one helper instead of ad hoc `users.total_points` queries."
patterns-established:
  - "Score display paths should consume one tenant-scoped leaderboard read model, even when they only need a single user's points."
requirements-completed:
  - SCOR-02
duration: 18min
completed: 2026-03-04
---

# Phase 5 Plan 3: Score Integrity Summary

**Score displays now align on a shared leaderboard aggregation path, and a migration repairs the recoverable historical drift.**

## Performance

- **Duration:** 18 min
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- Added a migration that backfills recoverable `ideas.ai_score` values from stored rubric criteria and then realigns cached `users.total_points`.
- Introduced `src/lib/leaderboard.ts` as the shared score aggregation helper for leaderboard and single-user score reads.
- Moved dashboard, leaderboard, mobile, and contest digest reads onto that shared aggregation path.

## Files Created/Modified

- `supabase/migrations/20260304_reconcile_score_integrity.sql` - Recomputes recoverable canonical scores and realigns totals/view output.
- `src/lib/leaderboard.ts` - Provides shared tenant-scoped score aggregation helpers.
- `src/app/[client_id]/dashboard/page.tsx` - Uses shared aggregate reads for leaderboard and current-user points.
- `src/app/[client_id]/leaderboard/page.tsx` - Uses the shared leaderboard helper for ranking output.
- `src/app/[client_id]/m/page.tsx` - Reads current-user points from the shared leaderboard model.
- `src/app/[client_id]/m/leaderboard/page.tsx` - Uses the shared leaderboard helper for mobile rankings.
- `src/lib/contest-digest.ts` - Builds digest leaderboard content from the same shared aggregate.

## Decisions Made

- The reconciliation migration intentionally leaves rows without complete rubric criteria untouched rather than guessing new scores.
- `user_leaderboard` remains the read model, but access is now centralized through one helper so score surfaces cannot drift by query style.

## Deviations from Plan

None.

## Issues Encountered

None.

## User Setup Required

- Apply `supabase/migrations/20260304_reconcile_score_integrity.sql` in the target Supabase environment before relying on repaired historical totals.
