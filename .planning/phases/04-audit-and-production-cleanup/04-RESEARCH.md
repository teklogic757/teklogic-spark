# Phase 4: Audit And Production Cleanup - Research

**Researched:** 2026-03-03
**Status:** Ready for planning

## Objective

Answer the planning question for Phase 4: what needs to change so privileged admin actions become traceable and production-facing request paths stop emitting noisy debug output while still preserving useful failure diagnostics.

## Current Implementation Snapshot

### Sensitive admin mutations are not audit logged

- There is no audit-event table or audit helper in the current schema or app types.
- High-impact admin mutations currently complete without writing any actor/action trail:
  - `src/app/admin/actions.ts`
    - `updateOrganization`
    - `createOrganization`
    - `createUser`
    - `updateUser`
    - `createInvitation`
    - `createTrainingVideo`
    - `deleteTrainingVideo`
  - `src/app/admin/workshops/actions.ts`
    - `generateWorkshopCode`
    - `toggleCodeStatus`
- These actions already verify elevated roles, but they only return success/error responses. There is no durable record of who changed what and when.

### Production request paths still contain verbose debug logging

- `src/app/[client_id]/dashboard/page.tsx` logs request lifecycle details during normal success paths, including:
  - render start markers
  - tenant slug lookups
  - organization payloads
  - cookie names and truncated values when auth is missing
- `src/app/login/page.tsx` logs session presence, user IDs, and redirect targets during normal page loads.
- `src/app/login/login-form.tsx` logs login attempts and redirect flow details from the browser.
- `src/app/[client_id]/submit/actions.ts` logs multiple success-path checkpoints for validation, org lookup, inserts, and points updates.
- `src/app/[client_id]/m/submit/actions.ts` mirrors the same notification/error pattern for mobile submission.
- `src/app/admin/actions.ts` logs notification delivery status on successful admin operations.

### Error logging exists, but it is inconsistent

- Useful server-side error logs already exist in auth callbacks, submit flows, AI evaluation, and admin actions.
- Some logs currently dump full error objects or extra request context rather than a constrained diagnostic summary.
- The biggest issue is not absence of logging, but the mix of:
  - routine success-path noise
  - duplicated debug traces
  - potentially over-detailed context (cookies, object payloads, raw identifiers) in production logs

## Gaps Against Phase Requirements

### QUAL-03: Avoid noisy debug logging while preserving actionable error logging

- Normal request execution in login, dashboard, and submit paths still writes debug output even when nothing is wrong.
- Some logs expose more request/session detail than production operations should emit by default.
- There is no shared logging helper that distinguishes:
  - development-only debug diagnostics
  - production-safe warnings
  - sanitized error logging

### QUAL-04: Audit-log sensitive admin mutations

- No persistent audit model exists.
- No current server action captures:
  - actor ID
  - action name
  - target entity/type
  - timestamp
- Because the app performs privileged mutations through server actions and service-role access, audit logging must be explicitly added in application code rather than expected from Supabase automatically.

## Recommended Technical Shape

### 1. Add one dedicated audit-events table plus a shared write helper

Use a small schema addition rather than scattering audit columns across domain tables:

- Add an `admin_audit_events` table (name can vary, but keep it explicit and admin-scoped)
- Recommended columns:
  - `id`
  - `actor_user_id`
  - `actor_email`
  - `organization_id` (nullable for global actions if needed)
  - `action`
  - `target_type`
  - `target_id`
  - `metadata` (JSONB, optional and intentionally minimal)
  - `created_at`

Then create a server-only helper (for example `src/lib/audit-log.ts`) that:

- accepts a normalized event payload
- resolves actor context from the authenticated admin
- writes one durable row through the server/admin client
- can be reused by all privileged admin actions

This keeps the audit contract centralized and makes future expansion straightforward.

### 2. Instrument privileged admin actions after successful mutations

The first pass should cover the highest-risk mutation surfaces already in use:

- organization create/update
- user create/update
- invitation creation
- training-video create/delete
- workshop code create/toggle

Recommended behavior:

- write the audit event only after the underlying mutation succeeds
- include only the minimum metadata needed to reconstruct intent
- do not log secrets, tokens, passwords, or full payload dumps
- if an audit write fails, surface a clear failure path instead of silently pretending the action is fully complete

That last point matters because a "successful" admin mutation without traceability does not satisfy the phase goal.

### 3. Introduce a small server-safe logging helper for debug gating and error normalization

Add a shared utility (for example `src/lib/server-log.ts`) that provides:

- `debug(...)` or `debugLog(...)` gated to non-production environments
- `warn(...)` for operational but non-fatal issues
- `error(...)` that:
  - keeps the useful message
  - serializes only safe fields from unknown errors
  - avoids leaking cookies, full session objects, or unnecessary identifiers

The point is not to build a full observability stack. The point is to stop inline `console.log` sprawl and create one safe default.

### 4. Remove success-path logging from core auth and submit flows

The fastest quality win is to replace or delete logs in:

- `src/app/login/page.tsx`
- `src/app/login/login-form.tsx`
- `src/app/[client_id]/dashboard/page.tsx`
- `src/app/[client_id]/submit/actions.ts`
- `src/app/[client_id]/m/submit/actions.ts`
- `src/app/admin/actions.ts`

For these flows:

- remove logs that only narrate normal control flow
- keep warnings/errors for genuine failures
- route remaining diagnostics through the shared helper when possible

### 5. Preserve actionable failure details, but trim sensitive context

The target behavior is:

- errors still identify the failing subsystem or action
- errors can include stable identifiers when necessary for diagnosis
- logs no longer emit raw cookie data, entire returned objects, or user-facing request narration

This satisfies QUAL-03 without leaving production blind when something breaks.

## Validation Architecture

Phase 4 can use the same repo smoke-check cadence as the earlier phases:

- Quick feedback after each task: `npm run lint`
- Full suite after each plan wave: `npm run build`
- Manual verification for the two behavioral requirements:
  - perform one sensitive admin mutation and confirm an audit row is written with actor, action, target, and timestamp
  - exercise login/dashboard/submit paths and confirm production noise is reduced while intentional error cases still log a useful message

## Files Most Likely To Change

- `supabase/migrations/*`
- `src/lib/types/database.types.ts`
- `src/lib/audit-log.ts`
- `src/lib/server-log.ts`
- `src/app/admin/actions.ts`
- `src/app/admin/workshops/actions.ts`
- `src/app/login/page.tsx`
- `src/app/login/login-form.tsx`
- `src/app/auth/callback/route.ts`
- `src/app/[client_id]/dashboard/page.tsx`
- `src/app/[client_id]/submit/actions.ts`
- `src/app/[client_id]/m/submit/actions.ts`

## Planning Notes

- Split this phase into one foundation plan and two execution plans after it:
  - audit schema + shared observability helpers first
  - sensitive admin action instrumentation second
  - production log cleanup across auth and submit flows third
- Keep scope tight:
  - no third-party logging platform integration
  - no full metrics/trace pipeline
  - no broad audit coverage for every read-only admin action in this milestone

---

*Phase: 04-audit-and-production-cleanup*
*Research completed: 2026-03-03*
