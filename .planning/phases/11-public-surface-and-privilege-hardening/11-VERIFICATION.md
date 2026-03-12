---
phase: 11-public-surface-and-privilege-hardening
verified: 2026-03-11T23:10:00Z
status: human_needed
score: 6/6 must-haves verified in code; deployed-host and role-based runtime checks pending
---

# Phase 11: Public Surface And Privilege Hardening Verification Report

**Phase Goal:** Reduce internet-facing risk by hardening session and privilege boundaries.  
**Verified:** 2026-03-11T23:10:00Z  
**Status:** human_needed

## Goal Achievement

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Public-facing responses now use one shared browser security contract instead of inline middleware mutations | VERIFIED | `src/lib/security-headers.ts` is applied from `middleware.ts` and covered by `src/lib/security-headers.test.ts` |
| 2 | Session cookie posture is explicit for public deployment | VERIFIED | `src/lib/supabase/server.ts` and `middleware.ts` both pass `getPublicAuthCookieOptions()` into Supabase SSR clients |
| 3 | Auth redirects fail closed to safe in-app paths on the canonical host | VERIFIED | `src/lib/auth-redirect.ts`, `src/app/auth/callback/route.ts`, and `src/lib/auth-redirect.test.ts` enforce relative-path defaults and canonical-host normalization |
| 4 | Login entrypoints no longer assume the live browser origin is the production authority | VERIFIED | `src/app/login/login-form.tsx` and `src/app/[client_id]/login/page.tsx` now build callback URLs through the shared redirect helper |
| 5 | Authenticated non-admin users no longer receive a soft redirect when hitting `/admin` | VERIFIED | `src/app/admin/layout.tsx` uses `getAdminAccessState()` to redirect anonymous users to `/login` and hard-deny authenticated non-admin users with `notFound()` |
| 6 | Remaining service-role usage is explicitly documented for deployment review | VERIFIED | `docs/privileged-access.md` inventories approved `createAdminClient()` surfaces and `src/lib/supabase/server.ts` points reviewers to that inventory |

## Requirements Coverage

| Requirement | Status | Blocking Issue |
|-------------|--------|----------------|
| DSEC-03 | IMPLEMENTED IN CODE; MANUAL DEPLOYED-HOST CHECKS PENDING | Need real HTTPS/browser verification for HSTS, secure cookies, and hostile callback redirects |
| DSEC-04 | IMPLEMENTED IN CODE; MANUAL ROLE CHECKS PENDING | Need browser verification of anonymous vs non-admin vs super-admin `/admin` behavior on a deployed host |

## Human Verification Required

- On a production-like HTTPS host, log in and confirm HSTS plus secure auth cookie attributes appear only under the intended HTTPS boundary.
- Trigger valid and invalid magic-link / callback redirects and confirm suspicious `next` values fall back to a safe in-app destination on the canonical host.
- Visit `/admin` while anonymous, as an authenticated non-admin, and as a super admin to confirm the route distinguishes those states correctly.
- Compare current `createAdminClient()` call sites to `docs/privileged-access.md` and remove or document any discrepancy before go-live.

## Verification Metadata

- `npm run test -- --run src/lib/security-headers.test.ts` passed.
- `npm run test -- --run src/lib/auth-redirect.test.ts src/app/admin/actions.test.ts` passed.
- `npm run test:ci` passed.
- `npm run lint` completed with existing repository warnings only and no new Phase 11 errors.
- `npm run build` compiled and type-checked the app, then failed on the existing env-policy guard because local `.env` / `.env.local` still defines `TEST_EMAIL_OVERRIDE` and `EMAIL_TO`.
