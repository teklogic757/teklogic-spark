# Privileged Access Inventory

This inventory names every approved `createAdminClient()` surface that remains in Teklogic Spark AI before public deployment. Any new call site should be reviewed as a security change, not added opportunistically.

## Approval Rules

- Service-role access stays server-only through [src/lib/supabase/server.ts](/c:/Users/justi/Dropbox/antigravity/Teklogic_Project1/teklogic-ideas/src/lib/supabase/server.ts).
- Every usage must have a narrow operational reason that cannot be satisfied by the session-scoped client and existing RLS.
- Tenant-facing reads should prefer scoped helpers and RLS first; `createAdminClient()` is the exception path.

## Approved Call Sites

| Area | File | Why it is still approved |
|------|------|--------------------------|
| Dashboard tenant bootstrap | [src/lib/dashboard-access.ts](/c:/Users/justi/Dropbox/antigravity/Teklogic_Project1/teklogic-ideas/src/lib/dashboard-access.ts) | Resolves organization rows that may still be blocked by RLS during authenticated tenant bootstrapping. |
| Login routing | [src/app/login/actions.ts](/c:/Users/justi/Dropbox/antigravity/Teklogic_Project1/teklogic-ideas/src/app/login/actions.ts) | Maps an authenticated user to their organization slug after login without trusting client-provided org context. |
| Auth callback fallback | [src/app/auth/callback/route.ts](/c:/Users/justi/Dropbox/antigravity/Teklogic_Project1/teklogic-ideas/src/app/auth/callback/route.ts) | Resolves the safe default dashboard path after a successful code exchange when no explicit in-app redirect is supplied. |
| Admin organization and user management | [src/app/admin/actions.ts](/c:/Users/justi/Dropbox/antigravity/Teklogic_Project1/teklogic-ideas/src/app/admin/actions.ts) | Performs super-admin-only mutations that require Auth admin APIs or cross-tenant writes. |
| Training video admin reads/writes | [src/lib/training-video-access.ts](/c:/Users/justi/Dropbox/antigravity/Teklogic_Project1/teklogic-ideas/src/lib/training-video-access.ts) and [src/app/admin/actions.ts](/c:/Users/justi/Dropbox/antigravity/Teklogic_Project1/teklogic-ideas/src/app/admin/actions.ts) | Maintains centralized training-video access where RLS is not yet the source of truth for management paths. |
| Durable rate limiting | [src/lib/rate-limiter.ts](/c:/Users/justi/Dropbox/antigravity/Teklogic_Project1/teklogic-ideas/src/lib/rate-limiter.ts) | Calls server-side limiter RPCs that need cross-session visibility and must not depend on the current user session. |
| Submission-side privileged writes | [src/lib/submit-flow.ts](/c:/Users/justi/Dropbox/antigravity/Teklogic_Project1/teklogic-ideas/src/lib/submit-flow.ts) | Supports narrowly scoped operations that still need elevated access after user-scoped writes complete. |
| Join/invitation flows | [src/app/join/actions.ts](/c:/Users/justi/Dropbox/antigravity/Teklogic_Project1/teklogic-ideas/src/app/join/actions.ts) | Validates and fulfills invitation flows that cross auth and profile boundaries. |
| Contest digest jobs | [src/lib/contest-digest.ts](/c:/Users/justi/Dropbox/antigravity/Teklogic_Project1/teklogic-ideas/src/lib/contest-digest.ts) | Scheduled digest aggregation spans organizations and is executed outside a user session. |
| Audit logging | [src/lib/audit-log.ts](/c:/Users/justi/Dropbox/antigravity/Teklogic_Project1/teklogic-ideas/src/lib/audit-log.ts) | Writes centralized audit entries from server-only code paths that may outlive the initiating session context. |

## Review Notes

- `/admin` now treats authenticated non-admin access as a hard deny instead of redirecting back into the tenant shell.
- The callback/login redirect boundary is intentionally fail-closed on the canonical site URL; the service role is used there only to derive a safe default tenant dashboard.
- Phase 12 should re-review each approved call site against final production RLS and remove any elevation that becomes unnecessary.
