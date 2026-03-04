---
phase: 07-submission-flow-decomposition
plan: "01"
subsystem: submit-flow
tags: [submission, refactor, shared-pipeline, server-actions]
requires:
  - phase: 07-submission-flow-decomposition
    provides: Phase-level submission decomposition plan and validation contract
provides:
  - A shared submission preparation boundary for desktop and mobile routes
  - Typed submitter and organization loading before persistence
  - Thin route adapters that no longer duplicate setup orchestration
affects: [idea-submission, mobile-submit, ai-evaluation]
tech-stack:
  added: []
  patterns: [shared domain service, typed preparation contract, thin route adapter]
key-files:
  created:
    - src/lib/submit-flow.ts
  modified:
    - src/app/[client_id]/submit/actions.ts
    - src/app/[client_id]/m/submit/actions.ts
key-decisions:
  - "Preparation now owns normalization, validation, auth resolution, organization loading, and AI evaluation setup."
  - "Desktop and mobile actions keep their route-specific redirects but share one server-side preparation path."
patterns-established:
  - "Future submit-route changes should extend src/lib/submit-flow.ts instead of re-embedding orchestration inside route actions."
requirements-completed:
  - SUBM-01
duration: 20min
completed: 2026-03-04
---

# Phase 7 Plan 1: Shared Submission Preparation Summary

**Desktop and mobile submission routes now delegate to one shared preparation contract instead of duplicating setup logic inline.**

## Performance

- **Duration:** 20 min
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Added `src/lib/submit-flow.ts` with a typed `prepareSubmit()` path that normalizes form input, validates fields, resolves the submitter, loads organization context, and prepares AI evaluation data.
- Reduced both submit actions to thin route adapters that call `submitIdeaFlow()` and preserve their existing redirect behavior.
- Kept desktop-only guest and attachment handling in the shared pipeline while preserving mobile's authenticated-only contract.

## Files Created/Modified

- `src/lib/submit-flow.ts` - Shared submit preparation, typed route context, and orchestration boundary.
- `src/app/[client_id]/submit/actions.ts` - Desktop action now delegates to the shared pipeline.
- `src/app/[client_id]/m/submit/actions.ts` - Mobile action now reuses the same shared preparation path.

## Decisions Made

- The shared module owns server-only concerns such as cookie-based workshop resolution.
- Route files now contain only route-specific success behavior and error passthrough.

## Deviations from Plan

None.

## Issues Encountered

None.

## User Setup Required

None.
