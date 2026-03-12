---
phase: 11-public-surface-and-privilege-hardening
plan: "02"
subsystem: auth-redirect-boundary
tags: [auth, redirects, callback, login, site-url]
requires: [11-01]
provides:
  - Shared safe redirect normalization for auth flows
  - Canonical-host callback handling with fail-closed fallbacks
  - Client login entrypoints aligned to the callback contract
affects: [phase-11-auth-boundary, canonical-site-url]
tech-stack:
  added: [shared auth redirect helper]
  patterns: [safe relative redirect contract, canonical host enforcement, auth regression tests]
key-files:
  created:
    - src/lib/auth-redirect.ts
    - src/lib/auth-redirect.test.ts
  modified:
    - src/lib/site-url.ts
    - src/app/auth/callback/route.ts
    - src/app/login/actions.ts
    - src/app/login/login-form.tsx
    - src/app/[client_id]/login/page.tsx
key-decisions:
  - "Treat the canonical site URL as the redirect authority and reject protocol-relative or off-site targets by default."
  - "Use the auth callback as the enforcement boundary and derive a safe tenant dashboard fallback after session exchange."
  - "Let client login forms use the live browser origin only as a local-development fallback when NEXT_PUBLIC_SITE_URL is not configured."
patterns-established:
  - "Login and callback flows now share src/lib/auth-redirect.ts for callback URL generation and safe redirect enforcement."
requirements-completed: [DSEC-03]
duration: 28 min
completed: 2026-03-11
---

# Phase 11 Plan 02: public-surface-and-privilege-hardening Summary

**Auth redirects now fail closed on the canonical host and no longer trust arbitrary `next` values or the active browser origin in production.**

## Accomplishments

- Added `src/lib/auth-redirect.ts` and `src/lib/auth-redirect.test.ts` to normalize relative redirects, canonical-host absolute redirects, and optional explicit allowlists.
- Updated the auth callback route to derive a safe tenant dashboard fallback after session exchange and log suspicious redirect attempts before falling back.
- Tightened `src/lib/site-url.ts` so protocol-relative paths like `//evil.example` are rejected as in-app redirects.
- Updated both global and tenant login forms to build callback URLs from the canonical site URL contract when configured.

## Task Commits

No task-specific commit hashes recorded. The repository already had unrelated in-progress changes, so execution was left uncommitted.

## Issues Encountered

- `npm run build` remains blocked by local-only env overrides in `.env` / `.env.local`, which is a pre-existing Phase 10 verification gate rather than a Phase 11 code regression.
