---
phase: 05-score-integrity
plan: "01"
subsystem: scoring
tags: [ai-evaluation, scoring, rubric, canonicalization]
requires:
  - phase: 05-score-integrity
    provides: Phase-level score integrity plan and validation contract
provides:
  - A reusable canonical weighted score helper
  - Evaluator output that treats rubric math as the authoritative score
  - Explicit mismatch diagnostics for model-supplied overall score drift
affects: [ai-evaluation, submit, leaderboard]
tech-stack:
  added: []
  patterns: [single-source score normalization, rubric-first scoring]
key-files:
  created:
    - src/lib/score.ts
  modified:
    - src/lib/ai-evaluator.ts
key-decisions:
  - "Canonical score now comes from weighted criterion math, not the model's standalone overall field."
  - "Model overall score is preserved only as diagnostics so mismatches remain visible without becoming truth."
patterns-established:
  - "Any score-bearing workflow should normalize through one shared rubric helper before persistence or ranking."
requirements-completed:
  - SCOR-01
duration: 12min
completed: 2026-03-04
---

# Phase 5 Plan 1: Score Integrity Summary

**The AI evaluator now emits a canonical score derived from rubric math instead of trusting the model's raw overall score.**

## Performance

- **Duration:** 12 min
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Added `src/lib/score.ts` as the shared score normalization and mismatch-detection utility.
- Updated `evaluateIdea()` so `overall_score` is rewritten to the rubric-derived canonical value.
- Preserved model score drift as optional diagnostics instead of allowing it to drive persistence.

## Files Created/Modified

- `src/lib/score.ts` - Centralizes weighted score calculation, clamping, rounding, and mismatch detection.
- `src/lib/ai-evaluator.ts` - Applies canonical score normalization before returning evaluation results.

## Decisions Made

- A one-point-or-greater difference between rubric math and model total is treated as a material mismatch.
- The evaluator contract keeps the canonical score in the existing `overall_score` field to minimize downstream churn.

## Deviations from Plan

None.

## Issues Encountered

None.

## User Setup Required

None.
