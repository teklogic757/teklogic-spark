---
phase: 08-durable-abuse-controls
plan: "03"
subsystem: workshop-protection
tags: [security, workshop, guest-submit, attachments]
requires:
  - plan: "01"
    provides: Durable limiter backend
  - plan: "02"
    provides: Existing route cutover to async durable checks
provides:
  - Durable workshop join throttling
  - Explicit guest submission throttling
  - Attachment-adjacent throttling before expensive work
affects: [join-workshop, guest-submit, file-upload]
tech-stack:
  added: []
  patterns: [cost-aware guards, scoped guest keys, pre-upload protection]
key-files:
  created: []
  modified:
    - src/app/join/actions.ts
    - src/lib/submit-flow.ts
    - src/lib/rate-limiter.ts
key-decisions:
  - "Workshop guests are keyed by workshop org plus normalized client IP so anonymous submits still share durable protection."
  - "Attachment-heavy submits consume a separate limiter budget before AI evaluation and upload work begins."
patterns-established:
  - "Guest and file-adjacent abuse controls now have explicit dedicated limiter scopes rather than inheriting authenticated-only rules."
requirements-completed:
  - RATE-02
duration: 10min
completed: 2026-03-04
---

# Phase 8 Plan 3: Workshop And Guest Protection Summary

**The workshop entry and guest submit paths now enforce explicit durable throttles, including a separate budget for attachment-heavy requests.**

## Performance

- **Duration:** 10 min
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Added durable throttling to `joinWorkshop()` before workshop-code validation.
- Added durable guest submission throttling for workshop-based anonymous desktop submits.
- Added a dedicated attachment-adjacent limiter before organization loading, AI evaluation, and later upload work begin.

## Files Created/Modified

- `src/app/join/actions.ts` - Applies durable join throttling before code validation.
- `src/lib/submit-flow.ts` - Applies guest and attachment-adjacent throttles before expensive work.
- `src/lib/rate-limiter.ts` - Defines the extra durable limiter presets and shared scoped-key helpers.

## Decisions Made

- Reused the existing workshop cookie plus normalized client IP to build a stable anonymous limiter key.
- Kept the Phase 9 duplicate workshop join query smell untouched; this phase only hardened the abuse controls around it.

## Deviations from Plan

None.

## Issues Encountered

- Real restart and multi-instance behavior still need manual confirmation against a database with the new migration applied.

## User Setup Required

- Run the manual Phase 8 abuse-flow checks in `08-VERIFICATION.md` after applying the migration.
