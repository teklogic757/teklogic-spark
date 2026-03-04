---
phase: 06-tenant-boundary-tightening
plan: "02"
subsystem: training-content
tags: [tenant-isolation, training-videos, dashboard]
requires:
  - phase: 06-tenant-boundary-tightening
    provides: Shared tenant request context and dashboard access boundary
provides:
  - A server-only training video access helper
  - A centralized scope filter for global vs org-specific training rows
  - Dashboard fallback behavior that keeps the static training library intact
affects: [dashboard, training-content]
tech-stack:
  added: []
  patterns: [server-only data access, centralized scope contract, safe fallback data]
key-files:
  created:
    - src/lib/training-video-access.ts
  modified:
    - src/lib/training-videos.ts
    - src/lib/dashboard-access.ts
key-decisions:
  - "The reusable scope contract lives in a server-only helper so shared client-side training utilities stay bundle-safe."
  - "If no database-backed training videos are available, the dashboard still falls back to the curated static list."
patterns-established:
  - "Any future org-specific training-video schema change should be isolated to the training-video access helper and parser."
requirements-completed:
  - SECU-02
duration: 12min
completed: 2026-03-04
---

# Phase 6 Plan 2: Scoped Training Video Summary

**Training resources now flow through one reusable scope-aware helper instead of a page-local ad hoc query.**

## Performance

- **Duration:** 12 min
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Split the database-backed training-video read into `src/lib/training-video-access.ts`, keeping the shared normalization utilities bundle-safe for client imports.
- Added parsing and scope helpers that treat rows without `organization_id` as globally visible while remaining ready for future org-specific rows.
- Routed dashboard training resources through the new helper and preserved the existing static fallback library when the table is empty.

## Files Created/Modified

- `src/lib/training-video-access.ts` - Server-only scoped read contract for dashboard training videos.
- `src/lib/training-videos.ts` - Shared parsing, normalization, and scope helpers used by both server and client-safe code paths.
- `src/lib/dashboard-access.ts` - Integrates the scoped helper into the dashboard payload loader.

## Decisions Made

- Scope evaluation treats missing `organization_id` as shared/global visibility.
- The database helper queries `select('*')` so a future `organization_id` column is picked up without another caller change.

## Deviations from Plan

None.

## Issues Encountered

- The first implementation placed server-only Supabase access inside the shared utility module, which broke the Next.js client bundle boundary. The helper was moved into its own server-only file.

## User Setup Required

None.
