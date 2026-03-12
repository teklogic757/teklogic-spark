---
phase: 10-repository-and-secret-hygiene
verified: 2026-03-11T13:20:00Z
status: human_needed
score: 6/6 must-haves verified in code; operator env cleanup and fresh-clone checks pending
---

# Phase 10: Repository And Secret Hygiene Verification Report

**Phase Goal:** Ensure deployable builds run from managed environment configuration and clean repository boundaries.
**Verified:** 2026-03-11T13:20:00Z
**Status:** human_needed

## Goal Achievement

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Runtime code now resolves public URLs from one canonical helper instead of ad hoc localhost fallbacks | VERIFIED | `src/lib/site-url.ts` is used by auth callback, workshop admin links, welcome/guest emails, and evaluation email CTA |
| 2 | Production-sensitive env validation is reusable by both runtime startup and deploy preflight | VERIFIED | `src/lib/env-policy.mjs` and `src/lib/env-validator.ts` now expose shared validation rules |
| 3 | Local-only email overrides are blocked from production-like validation and ignored by runtime send logic in production | VERIFIED | `src/lib/env-policy.mjs` blocks `TEST_EMAIL_OVERRIDE` and `EMAIL_TO`; `src/lib/email.ts` only applies overrides outside production |
| 4 | The repository has an explicit hygiene command for tracked secrets and local-only artifacts | VERIFIED | `npm run check:repo-hygiene` calls `scripts/check-repo-hygiene.mjs` |
| 5 | Deployment has an explicit preflight command for env readiness | VERIFIED | `npm run check:deploy-env` calls `scripts/check-deploy-env.mjs` |
| 6 | Operators now have one documented workflow that ties repo hygiene, preflight validation, and build order together | VERIFIED | `docs/deployment.md`, `README.md`, and `package.json` document `build:deploy` |

## Requirements Coverage

| Requirement | Status | Blocking Issue |
|-------------|--------|----------------|
| DSEC-01 | IMPLEMENTED IN CODE; OPERATOR CLEANUP PENDING | Current local `.env` / `.env.local` still carries blocked override values and no committed proof of final hosted env setup |
| DSEC-02 | IMPLEMENTED IN CODE; FRESH-CLONE CHECK PENDING | Need one human-run clean clone verification using the new command set |

## Human Verification Required

- Remove `TEST_EMAIL_OVERRIDE` and `EMAIL_TO` from any deploy-like `.env` files or hosted env configuration.
- Set a real HTTPS `NEXT_PUBLIC_SITE_URL` for the target deployment.
- From a fresh clone or sanitized working tree, run `npm install`, `npm run check:repo-hygiene`, `npm run check:deploy-env`, and `npm run build:deploy`.
- In the target deployed environment, verify auth callback redirects and admin-generated workshop links use the intended canonical host.

## Verification Metadata

- `npm run lint` completed with existing repo warnings only and no new errors.
- `npm run check:repo-hygiene` passed.
- `npm run check:deploy-env` failed in the current shell as expected for missing/unsafe production env and passed with production-safe injected env values.
- `npm run test:ci` passed.
- `npm run build` compiles and type-checks code, then fails on the new env-policy guard because local `.env` state still includes blocked overrides and lacks a valid canonical site URL.
