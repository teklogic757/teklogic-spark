# Milestones

## v1.1 Trust And Isolation Hardening (Shipped: 2026-03-07)

**Phases completed:** 5 phases, 15 plans, 0 tasks

**Key accomplishments:**
- Canonical weighted scoring behavior was hardened and regression coverage now protects scoring logic and boundary cases.
- Tenant request handling was tightened through shared dashboard access contracts and safer server-side typing patterns.
- Submission flow logic was decomposed into clearer server-side boundaries that isolate persistence from non-critical side effects.
- Durable limiter infrastructure was implemented in code and wired into login, join, submit, and attachment-adjacent paths.
- A baseline Vitest test runner and critical regression suites were added for score integrity, tenant boundaries, submit flow, and workshop join behavior.

**Known gaps accepted at milestone close:**
- `RATE-01` and `RATE-02` remain pending final runtime verification in a live Supabase environment (`08-UAT.md` status is still `testing` with one blocker and four pending checks).
- No standalone `v1.1` milestone audit artifact was present at closeout.

---

## v1.0 Production Readiness (Shipped: 2026-03-03)

**Phases completed:** 4 phases, 10 plans, 23 tasks

**Key accomplishments:**
- Shared client-side validation now drives desktop and mobile idea submission, including immediate attachment rejection and clearer async action feedback.
- Notification delivery now uses a reusable provider contract across welcome, evaluation, admin, and digest email flows.
- Contest digests and the training-video library now have real server-side persistence and admin-managed workflows.
- Privileged admin mutations are now audit-logged and core auth, dashboard, and submit flows are quieter in production logs.

**Notes:**
- Milestone archived after direct code verification and manual phase execution.
- No standalone `v1.0` milestone audit artifact was created before archive; code-level verification passed, but a formal cross-phase audit was skipped.

---
