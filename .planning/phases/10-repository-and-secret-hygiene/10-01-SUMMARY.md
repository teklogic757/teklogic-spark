---
phase: 10-repository-and-secret-hygiene
plan: "01"
subsystem: runtime-env
tags: [env, site-url, auth, email, deployment]
requires: []
provides:
  - Canonical runtime policy for production-safe env handling
  - Shared site URL helper for absolute links and redirects
  - Runtime call sites aligned to one host/origin contract
affects: [phase-10-runtime-boundary, deployment-safety]
tech-stack:
  added: [shared env policy helper]
  patterns: [canonical site url, explicit env validation, production-safe redirect handling]
key-files:
  created:
    - src/lib/site-url.ts
    - src/lib/env-policy.mjs
  modified:
    - src/lib/env-validator.ts
    - src/app/layout.tsx
    - src/lib/email.ts
    - src/lib/ai-evaluator.ts
    - src/app/admin/workshops/page.tsx
    - src/app/auth/callback/route.ts
key-decisions:
  - "Remove env-validator module side effects and validate explicitly from app layout so deploy scripts can reuse the same policy code."
  - "Treat NEXT_PUBLIC_SITE_URL as the only canonical public URL and fall back to localhost only in local development."
  - "Ignore TEST_EMAIL_OVERRIDE and EMAIL_TO at send time in production-sensitive paths, while deploy validation blocks them entirely."
patterns-established:
  - "Absolute links and auth redirects use src/lib/site-url.ts rather than ad hoc process.env reads."
requirements-completed: [DSEC-01]
duration: 35 min
completed: 2026-03-11
---

# Phase 10 Plan 01: repository-and-secret-hygiene Summary

**Production-sensitive links and redirects now flow through one canonical site URL and env policy contract instead of scattered localhost fallbacks.**

## Accomplishments

- Added `src/lib/env-policy.mjs` and `src/lib/site-url.ts` as the shared production/local boundary for env validation and public URL resolution.
- Refactored runtime validation to export reusable functions while preserving startup enforcement through `src/app/layout.tsx`.
- Updated auth callback redirects, workshop admin links, welcome/guest emails, and evaluation email links to use the canonical helper.
- Removed runtime dependence on deprecated `NEXT_PUBLIC_URL` fallbacks in the Phase 10 target paths.

## Task Commits

No task-specific commit hashes recorded. The repository already had unrelated in-progress changes, so execution was left uncommitted.

## Issues Encountered

- `npm run build` now fails fast when `.env` or `.env.local` still carries `TEST_EMAIL_OVERRIDE`, `EMAIL_TO`, or a missing `NEXT_PUBLIC_SITE_URL`. That is expected and is now part of the deploy-readiness contract.
