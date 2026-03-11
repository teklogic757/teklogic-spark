# Phase 11: Public Surface And Privilege Hardening - Context

**Gathered:** 2026-03-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 11 hardens the internet-facing request surface without expanding product capability.

In scope:
- production-safe security headers for public routes
- stricter auth, login, and callback trust behavior for redirects and host/origin handling
- tighter behavior for internet-facing admin access
- explicit documentation and review of privileged service-role usage tied to `DSEC-04`

Out of scope:
- repository and env hygiene already handled in Phase 10
- final go-live checklist and operator verification reserved for Phase 12
- new auth products, separate admin deployments, or broader feature expansion

</domain>

<decisions>
## Implementation Decisions

### Login And Callback Trust Rules
- Post-auth redirects may use relative in-app paths plus a small allowlist of exact external URLs when there is a real need to leave the app.
- In production, the canonical `NEXT_PUBLIC_SITE_URL` remains the authority for callback host validation rather than trusting the incoming request host.
- Invalid or suspicious `next` values should fall back to a safe default such as `/dashboard` and be logged.
- The current client-side magic-link flow may keep using `window.location.origin`, with the server-side callback remaining the enforcement boundary.

### Admin Surface Exposure
- `/admin` remains reachable on the same public app host; access control stays enforced by authentication plus `super_admin` checks rather than a separate pre-gate.
- Unauthenticated users can still be redirected into the normal login path, but authenticated non-admin users should receive a hard unauthorized or not-found style response instead of a soft redirect.
- This phase should keep the existing admin login entry behavior rather than adding a dedicated admin login flow.
- Documentation should explicitly call out service-role-backed admin operations, while broader admin-route documentation can stay lighter.

### Claude's Discretion
- Exact header policy choices, including whether to add CSP, stricter permissions policy entries, or other browser hardening beyond the current middleware baseline.
- Whether host/origin validation should centralize into a new helper or stay close to the auth callback and login call sites.
- How aggressively to narrow or annotate non-admin `createAdminClient()` call sites beyond the explicitly documented privileged surfaces.

</decisions>

<specifics>
## Specific Ideas

- Keep public auth behavior conservative: canonical host wins, questionable redirect inputs do not.
- Avoid adding a separate admin auth product in this phase; harden the existing app surface first.
- Treat server-side callback enforcement as the real security boundary even if client login UX still derives its redirect URL from the browser origin.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `middleware.ts`: already applies baseline security headers, refreshes Supabase auth state, and handles tenant/mobile redirects; this is the primary place to extend public header behavior.
- `src/app/auth/callback/route.ts`: already normalizes `next` and builds absolute redirects through the shared site URL helper; this is the primary callback hardening point.
- `src/lib/site-url.ts`: Phase 10 established the canonical public URL contract, which Phase 11 should reuse rather than adding new host rules ad hoc.
- `src/app/login/login-form.tsx`: current magic-link flow uses `window.location.origin`, making it the main client entrypoint for login redirect behavior.
- `src/app/admin/actions.ts`: centralizes most privileged admin mutations, so any admin access-hardening or documentation work should start here.
- `src/lib/supabase/server.ts`: defines `createAdminClient()` and remains the primary control point for documenting service-role intent.

### Established Patterns
- Redirect-driven auth flows are already common across login, dashboard, join, and callback routes.
- Public request handling currently leans on middleware plus targeted route guards instead of a centralized authorization layer.
- Service-role usage is intentionally allowed for narrow operational reasons, but current usage has spread across admin and some tenant/runtime helpers.

### Integration Points
- `middleware.ts` for browser-facing headers, cookie posture, and route-level request hardening.
- `src/app/auth/callback/route.ts`, `src/app/login/login-form.tsx`, and tenant login routes for safe redirect and callback behavior.
- `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`, and `src/app/admin/actions.ts` for non-admin response handling and admin surface posture.
- `src/lib/dashboard-access.ts`, `src/lib/rate-limiter.ts`, `src/lib/training-video-access.ts`, and `src/lib/submit-flow.ts` as likely review points for service-role containment and documentation.

</code_context>

<deferred>
## Deferred Ideas

- Separate admin host or deployment boundary.
- New admin-only login experience.
- Broader operational go-live controls and runtime limiter verification, which belong in Phase 12.

</deferred>

---

*Phase: 11-public-surface-and-privilege-hardening*
*Context gathered: 2026-03-11*
