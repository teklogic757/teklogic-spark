---
phase: 07-submission-flow-decomposition
plan: "02"
subsystem: submit-flow
tags: [submission, persistence, notifications, resilience]
requires:
  - plan: "01"
    provides: Shared submission preparation boundary
provides:
  - A persistence helper that succeeds before notifications run
  - A best-effort post-persist notification stage with explicit outcomes
  - Email result summaries that make skipped and failed notifications observable
affects: [idea-submission, email, admin-notifications]
tech-stack:
  added: []
  patterns: [persistence boundary, best-effort side effects, explicit outcome contracts]
key-files:
  created: []
  modified:
    - src/lib/submit-flow.ts
    - src/lib/email.ts
key-decisions:
  - "Idea persistence and point updates now complete before notification work begins."
  - "Email side effects return structured post-persist outcomes instead of sharing the success path with core writes."
patterns-established:
  - "Future side effects should attach to runPostPersist() as best-effort outcomes, not inline in route actions."
requirements-completed:
  - SUBM-01
  - SUBM-02
duration: 16min
completed: 2026-03-04
---

# Phase 7 Plan 2: Persistence Boundary Summary

**Submission persistence is now its own explicit step, with notifications moved behind a clearly best-effort post-persist boundary.**

## Performance

- **Duration:** 16 min
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Added `persistIdeaSubmission()` so attachment upload, idea insert, and point updates complete before any notification code runs.
- Added `runPostPersist()` to execute evaluation and admin emails after persistence and record explicit `delivered`, `skipped`, or `failed` outcomes.
- Added `summarizeEmailResult()` in `src/lib/email.ts` so notification logging uses a single explicit summary contract.

## Files Created/Modified

- `src/lib/submit-flow.ts` - Separates preparation, persistence, and post-persist work into distinct helpers.
- `src/lib/email.ts` - Exposes a shared email result summarizer for post-persist logging.

## Decisions Made

- Persistence failures still stop the submission, but notification failures only log and do not roll back the saved idea.
- Admin notifications remain enabled for both desktop and mobile, but they now run after the idea is already durable.

## Deviations from Plan

None.

## Issues Encountered

None.

## User Setup Required

None.
