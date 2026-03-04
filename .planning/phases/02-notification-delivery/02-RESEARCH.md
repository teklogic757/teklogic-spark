# Phase 2: Notification Delivery - Research

**Researched:** 2026-03-03
**Status:** Ready for planning

## Objective

Answer the planning question for Phase 2: what needs to change so Teklogic Spark AI's outbound notification paths are reliable, correctly routed, and non-blocking.

## Current Implementation Snapshot

### Existing notification library

- `src/lib/email.ts` already centralizes provider selection for SMTP vs Resend.
- `sendEmail()` supports a development redirect via `TEST_EMAIL_OVERRIDE` / `EMAIL_TO`.
- Helper exports exist for:
  - `sendWelcomeEmail()`
  - `sendEvaluationEmail()`
  - `sendAdminNotification()`
  - `sendGuestWelcomeEmail()`
- The shared return type is currently `EmailResult` with only `success`, optional `id`, and optional `error`.

### Existing call sites

- `src/app/admin/actions.ts`
  - `createUser()` creates the auth user and public profile, then fires `sendWelcomeEmail()` asynchronously.
- `src/app/[client_id]/submit/actions.ts`
  - `submitIdea()` saves the idea first, then fires `sendEvaluationEmail()` and `sendAdminNotification()` asynchronously.
- `src/app/[client_id]/m/submit/actions.ts`
  - `submitIdeaMobile()` saves the idea and only fires `sendEvaluationEmail()` asynchronously.
  - There is no admin notification in the mobile submit path today.

## Gaps Against Phase Requirements

### NOTF-01: Welcome email after account creation with org-specific login guidance

- The welcome email path exists, but the login URL inside `sendWelcomeEmail()` points to `/{organizationSlug}/dashboard`.
- For a newly created user, the safer entry point is the auth route (`/{organizationSlug}/login` or the global login flow with org guidance), not a dashboard deep link that assumes an active session.
- `createUser()` logs success/failure ad hoc and does not consume a normalized delivery contract beyond `success`.

### NOTF-02: Evaluation emails use the configured provider and fail gracefully

- Desktop submit uses the provider abstraction already, but the fallback address can become a placeholder (`workshop-guest@example.com`) when no real recipient exists. That avoids crashes but can mask routing issues.
- Mobile submit currently ignores the returned `EmailResult`; it only catches thrown exceptions. A provider-level soft failure (`success: false`) is not handled consistently.
- `sendEmail()` returns only a boolean-style result, which makes it hard for downstream actions to distinguish:
  - delivered
  - skipped because provider credentials are missing
  - failed because the provider rejected the request

### NOTF-03: Admins receive new-idea notifications with submitter context and attachment handling

- Desktop submit does trigger `sendAdminNotification()`.
- Mobile submit does not trigger any admin notification, so Phase 2 must close that gap.
- `sendAdminNotification()` currently routes to a single global address from `ADMIN_NOTIFICATION_EMAIL` (fallback `justin@teklogic.net`), not organization-aware recipients.
- `sendViaResend()` does not pass `attachments`, so attachment handling is incomplete whenever Resend is the active provider.

## Implementation Constraints And Practical Decisions

- Notification delivery must stay non-blocking relative to the user action:
  - user creation should still complete if welcome email is skipped or fails
  - idea submission should still save and redirect if any email fails
- The repo has no automated test runner today. Validation must rely on `npm run lint`, `npm run build`, and targeted manual smoke checks for now.
- The current code already prefers central helpers in `src/lib/`; Phase 2 should extend that pattern rather than duplicating provider logic across server actions.
- Organization-specific admin recipient routing should use data already available in Supabase (for example, org-scoped `super_admin` users), with env-based fallback kept for bootstrap safety.

## Recommended Technical Shape

### 1. Promote the email result into a reusable notification contract

Introduce a richer result shape in `src/lib/email.ts` so every caller can reason about status without branching on raw provider details. The contract should distinguish:

- delivered
- skipped due to missing configuration
- failed due to provider or payload error

This lets call sites log accurately and prevents silent misinterpretation of a `false` return as a thrown exception path.

### 2. Keep provider differences inside the email layer

`sendViaSMTP()` and `sendViaResend()` should normalize to the same result shape and both support the same high-value payload features:

- subject rewrite when `TEST_EMAIL_OVERRIDE` is active
- attachments for admin notifications
- explicit failure details when the provider cannot send

If Resend attachment support is constrained, the email layer should explicitly downgrade and surface that status instead of silently dropping attachments.

### 3. Make recipient resolution explicit

Phase 2 should avoid hard-coding a single admin inbox as the main production path. The safer design is:

- resolve organization admin recipients from the database in the action layer
- allow env fallback when no org admin recipients are configured
- keep the test override behavior centralized in `sendEmail()`

### 4. Cover both submit surfaces

The desktop and mobile submit actions must share the same notification semantics:

- evaluation email attempts after successful save
- admin notification attempts after successful save
- structured logging on delivered/skipped/failed
- no thrown notification failure should break the redirect path

## Validation Architecture

Phase 2 can use the current lightweight validation envelope:

- Quick feedback after each task: `npm run lint`
- Full smoke check after each plan: `npm run build`
- Manual verification for behaviors that need real environment wiring:
  - create a user in admin and confirm the welcome email attempt is routed correctly
  - submit an idea (desktop and mobile) and confirm admin notification attempts in both paths
  - verify missing credentials produce a logged skip/failure without blocking the mutation

## Files Most Likely To Change

- `src/lib/email.ts`
- `src/app/admin/actions.ts`
- `src/app/[client_id]/submit/actions.ts`
- `src/app/[client_id]/m/submit/actions.ts`

## Planning Notes

- Split the phase into:
  - a foundational notification-contract refactor in the email library
  - a follow-up integration pass across admin and submit actions
- Keep the work scoped to delivery reliability; do not expand into full email-service vendor migration or a broad job queue architecture in this phase.

---

*Phase: 02-notification-delivery*
*Research completed: 2026-03-03*
