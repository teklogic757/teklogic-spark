---
phase: 05-score-integrity
plan: "02"
subsystem: submission
tags: [submit, mobile, scoring, points]
requires:
  - phase: 05-score-integrity
    provides: Canonical evaluator score contract
provides:
  - Desktop and mobile submit flows that persist canonical `ai_score`
  - Shared fallback logic for point updates when the RPC path fails
  - Stored score diagnostics in submission analysis payloads
affects: [submit, mobile, email, points]
tech-stack:
  added: []
  patterns: [shared point-fallback path, single-score write path]
key-files:
  created: []
  modified:
    - src/app/[client_id]/submit/actions.ts
    - src/app/[client_id]/m/submit/actions.ts
key-decisions:
  - "Point deltas now reuse the same canonical score variable that is persisted to the idea row."
  - "Fallback writes to `users.total_points` stay in place for resilience, but they now share one score input per flow."
patterns-established:
  - "Submission flows should store score diagnostics alongside analysis so future audits can inspect score mismatches."
requirements-completed:
  - SCOR-01
  - SCOR-02
duration: 14min
completed: 2026-03-04
---

# Phase 5 Plan 2: Score Integrity Summary

**Both submit entry points now persist and award points from the same canonical score path.**

## Performance

- **Duration:** 14 min
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Centralized points RPC fallback behavior in both submit actions.
- Ensured inserted `ideas.ai_score`, emailed score values, and points increments all use the evaluator's canonical score output.
- Added `score_details` and `model_overall_score` into `ai_analysis_json` for downstream diagnostics.

## Files Created/Modified

- `src/app/[client_id]/submit/actions.ts` - Uses one canonical score variable for persistence and points updates.
- `src/app/[client_id]/m/submit/actions.ts` - Mirrors the same canonical score and fallback behavior in mobile submissions.

## Decisions Made

- The fallback path still updates `users.total_points` to preserve existing behavior when the RPC helper fails.
- Score mismatch diagnostics are stored per submission so reconciliations can inspect them later without re-calling the model.

## Deviations from Plan

None.

## Issues Encountered

None.

## User Setup Required

None.
