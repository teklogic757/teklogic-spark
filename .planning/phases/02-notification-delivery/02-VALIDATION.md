---
phase: 2
slug: notification-delivery
status: ready
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-03
---

# Phase 2 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Existing repo smoke checks (`eslint` + `next build`) |
| **Config file** | `eslint.config.mjs`, `next.config.ts`, `tsconfig.json` |
| **Quick run command** | `npm run lint` |
| **Full suite command** | `npm run build` |
| **Estimated runtime** | ~45-90 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run lint`
- **After every plan wave:** Run `npm run build`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 90 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 2-01-01 | 01 | 1 | NOTF-01, NOTF-02, NOTF-03 | smoke | `npm run lint` | OK | pending |
| 2-01-02 | 01 | 1 | NOTF-02, NOTF-03 | smoke | `npm run build` | OK | pending |
| 2-02-01 | 02 | 2 | NOTF-01, NOTF-02 | smoke | `npm run lint` | OK | pending |
| 2-02-02 | 02 | 2 | NOTF-02, NOTF-03 | smoke | `npm run build` | OK | pending |

*Status: pending = not yet executed, green = passing, red = failing*

---

## Wave 0 Requirements

- Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Welcome email routing after admin user creation | NOTF-01 | Requires real auth + provider wiring | Create a user in `/admin/users`, confirm the action succeeds, then inspect provider logs or redirected inbox for the expected welcome-email attempt and URL target. |
| Evaluation email soft-failure handling | NOTF-02 | Depends on env credentials and external provider behavior | Temporarily remove provider credentials locally, submit a valid idea, confirm the idea still saves and the action logs a skipped/failed notification state instead of throwing. |
| Admin notification delivery from desktop and mobile submit | NOTF-03 | Requires real submission flow and external delivery path | Submit one desktop idea and one mobile idea, confirm each triggers an admin-notification attempt with submitter metadata, and verify attachment behavior with a small allowed file on the desktop path. |

---

## Validation Sign-Off

- [x] All tasks have an automated verify command
- [x] Sampling continuity is maintained
- [x] Wave 0 does not require new infrastructure
- [x] No watch-mode flags are used
- [x] Feedback latency is below 90 seconds
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-03-03
