---
phase: 08-durable-abuse-controls
verified: 2026-03-04T09:10:23Z
status: human_needed
score: 7/7 must-haves verified in code; runtime checks pending
---

# Phase 8: Durable Abuse Controls Verification Report

**Phase Goal:** Make submission throttling enforceable in real deployments.
**Verified:** 2026-03-04T09:10:23Z
**Status:** human_needed

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Rate-limit state is no longer sourced from an in-memory `Map` | VERIFIED | `src/lib/rate-limiter.ts` now calls the `consume_rate_limit` RPC instead of mutating local memory |
| 2 | The durable limiter backend is defined in the database layer | VERIFIED | `supabase/migrations/20260304_add_durable_rate_limits.sql` adds `rate_limit_buckets` plus `consume_rate_limit()` |
| 3 | The existing login and admin invite routes now await durable limiter checks | VERIFIED | `src/app/login/actions.ts` and `src/app/admin/actions.ts` both use `await rateLimitAction(...)` |
| 4 | Authenticated submissions still fail fast before expensive downstream work | VERIFIED | `src/lib/submit-flow.ts` applies the authenticated limiter before organization loading and AI evaluation |
| 5 | Workshop guest submissions now have explicit durable throttling | VERIFIED | `src/lib/submit-flow.ts` builds a workshop-scoped guest limiter key from org plus client IP |
| 6 | Attachment-adjacent submits now have a dedicated limiter before high-cost work starts | VERIFIED | `src/lib/submit-flow.ts` calls `submitIdeaAttachment` before organization lookup and later upload work |
| 7 | Workshop code entry now throttles before code validation | VERIFIED | `src/app/join/actions.ts` applies `joinWorkshop` rate limiting before querying `workshop_access_codes` |

**Score:** 7/7 code-level truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `supabase/migrations/20260304_add_durable_rate_limits.sql` | Durable limiter schema and atomic consume contract | EXISTS + SUBSTANTIVE | Adds `rate_limit_buckets`, `consume_rate_limit()`, and cleanup helper |
| `src/lib/rate-limiter.ts` | Async durable limiter facade | EXISTS + SUBSTANTIVE | Uses the new RPC, normalizes identifiers, and fails closed on backend errors |
| `src/lib/submit-flow.ts` | Explicit authenticated, guest, and attachment throttles | EXISTS + SUBSTANTIVE | Applies durable checks before costly submit work |
| `src/app/login/actions.ts` | Durable pre-auth organization lookup throttle | EXISTS + SUBSTANTIVE | Uses normalized client IP helper |
| `src/app/admin/actions.ts` | Durable admin invite throttle | EXISTS + SUBSTANTIVE | Uses awaited durable limiter with user-scoped key |
| `src/app/join/actions.ts` | Durable workshop join throttle | EXISTS + SUBSTANTIVE | Applies limiter before workshop code lookup |

### Requirements Coverage

| Requirement | Status | Blocking Issue |
|-------------|--------|----------------|
| RATE-01: Guest and authenticated submission rate limits use a shared durable store across multi-instance deployments | IMPLEMENTED, RUNTIME CHECK PENDING | The new migration must be applied and exercised against the live Supabase project |
| RATE-02: File-upload and workshop submission paths keep explicit rate-limit enforcement through the new backend | IMPLEMENTED, RUNTIME CHECK PENDING | Manual restart and workshop-flow verification still need to be run |

## Human Verification Required

Blocking before phase close-out:

- Apply `supabase/migrations/20260304_add_durable_rate_limits.sql` to the active Supabase environment.
- Exhaust one limiter bucket, restart the dev server, and confirm the next request is still throttled until the stored window expires.
- Repeat a throttled path from a second app instance (or a restarted instance) to confirm the durable bucket is shared.
- Run repeated invalid workshop joins, confirm throttling triggers, then retry with a valid code after reset and confirm the redirect still works.
- Run repeated workshop guest submits, including one with an attachment, and confirm the limit blocks before AI evaluation and upload-heavy work when the budget is exhausted.

## Gaps Summary

**No code gaps found.** The remaining work is runtime verification against a database with the migration applied.

## Verification Metadata

**Verification approach:** Goal-backward using plan must-haves plus command gates
**Must-haves source:** 08-01-PLAN.md, 08-02-PLAN.md, and 08-03-PLAN.md frontmatter
**Automated checks:** `npm run lint` passed with pre-existing repo warnings; `npm run build` compiled and completed lint/type-check before stopping on existing environment-policy guards for `TEST_EMAIL_OVERRIDE` and missing `NEXT_PUBLIC_SITE_URL`
**Human checks required:** 5 blocking runtime checks
**Total verification time:** 11 min
