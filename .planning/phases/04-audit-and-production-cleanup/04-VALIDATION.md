---
phase: 4
slug: audit-and-production-cleanup
status: ready
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-03
---

# Phase 4 - Validation Strategy

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
| 4-01-01 | 01 | 1 | QUAL-03, QUAL-04 | smoke | `npm run lint` | OK | pending |
| 4-01-02 | 01 | 1 | QUAL-03, QUAL-04 | smoke | `npm run build` | OK | pending |
| 4-02-01 | 02 | 2 | QUAL-04 | smoke | `npm run lint` | OK | pending |
| 4-02-02 | 02 | 2 | QUAL-04 | smoke | `npm run build` | OK | pending |
| 4-03-01 | 03 | 2 | QUAL-03 | smoke | `npm run lint` | OK | pending |
| 4-03-02 | 03 | 2 | QUAL-03 | smoke | `npm run build` | OK | pending |

*Status: pending = not yet executed, green = passing, red = failing*

---

## Wave 0 Requirements

- Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Sensitive admin mutations create durable audit entries | QUAL-04 | Requires authenticated privileged session plus database inspection | As a super admin, run one create/update mutation (for example add a training video or update an organization), then verify a new `admin_audit_events` row exists with actor identity, action, target type/id, and `created_at`. |
| Core auth and submit flows stop emitting noisy success logs | QUAL-03 | Requires runtime behavior across server and browser logs | Load `/login`, complete one successful login, open a tenant dashboard, and submit an idea in a non-error path. Confirm routine flow narration is gone or debug-gated. Then force one controlled error (for example invalid auth or a missing org) and confirm a useful error still appears. |

---

## Validation Sign-Off

- [x] All tasks have an automated verify command
- [x] Sampling continuity is maintained
- [x] Wave 0 does not require new infrastructure
- [x] No watch-mode flags are used
- [x] Feedback latency is below 90 seconds
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-03-03
