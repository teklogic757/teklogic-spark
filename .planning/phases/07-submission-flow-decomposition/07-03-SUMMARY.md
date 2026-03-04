---
phase: 07-submission-flow-decomposition
plan: "03"
subsystem: submit-flow
tags: [submission, route-adapters, failure-boundaries, testability]
requires:
  - plan: "01"
    provides: Shared submission preparation boundary
  - plan: "02"
    provides: Explicit persistence and post-persist split
provides:
  - Final thin desktop and mobile route adapters
  - A shared `submitIdeaFlow()` contract with explicit success and failure outputs
  - Clear future test seams for preparation, persistence, and post-persist behavior
affects: [idea-submission, mobile-submit, phase-tracking]
tech-stack:
  added: []
  patterns: [explicit result contract, thin action layer, decomposed failure paths]
key-files:
  created: []
  modified:
    - src/lib/submit-flow.ts
    - src/app/[client_id]/submit/actions.ts
    - src/app/[client_id]/m/submit/actions.ts
key-decisions:
  - "submitIdeaFlow() is now the route-independent pipeline entry point."
  - "Route actions translate only success redirects and returned error messages."
patterns-established:
  - "Future tests can target prepareSubmit(), persistIdeaSubmission(), and runPostPersist() without invoking full redirects."
requirements-completed:
  - SUBM-01
  - SUBM-02
duration: 12min
completed: 2026-03-04
---

# Phase 7 Plan 3: Thin Action Boundary Summary

**The submission server actions are now thin adapters over an explicit shared pipeline, which makes failure paths far easier to test later.**

## Performance

- **Duration:** 12 min
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Finalized `submitIdeaFlow()` as the shared route-independent submission entry point.
- Reduced desktop and mobile actions to route-specific coordination only: call the pipeline, return an error state, revalidate, and redirect.
- Exposed explicit preparation, persistence, and post-persist helpers so future Phase 9 tests can cover those boundaries in isolation.

## Files Created/Modified

- `src/lib/submit-flow.ts` - Shared pipeline entry point plus explicit helper seams for future tests.
- `src/app/[client_id]/submit/actions.ts` - Final desktop action adapter.
- `src/app/[client_id]/m/submit/actions.ts` - Final mobile action adapter.

## Decisions Made

- Non-critical post-persist outcomes are returned for observability even though route actions do not need them today.
- The route-level contract stays stable: actions still return `{ error }` on failure and redirect on success.

## Deviations from Plan

None.

## Issues Encountered

- `next build` is currently blocked by repository-wide production environment guards around `TEST_EMAIL_OVERRIDE`, but the Phase 7 code completed compile, lint, and type-check before that unrelated gate.

## User Setup Required

- To run a full production build locally, unset `TEST_EMAIL_OVERRIDE` in local env before `npm run build`.
