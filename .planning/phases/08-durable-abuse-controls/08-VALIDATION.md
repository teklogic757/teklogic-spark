---
phase: 8
slug: durable-abuse-controls
status: ready
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-04
---

# Phase 8 - Validation Strategy

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
| 8-01-01 | 01 | 1 | RATE-01 | smoke | `npm run lint` | OK | pending |
| 8-01-02 | 01 | 1 | RATE-01 | smoke | `npm run build` | OK | pending |
| 8-02-01 | 02 | 2 | RATE-01, RATE-02 | smoke | `npm run lint` | OK | pending |
| 8-02-02 | 02 | 2 | RATE-01, RATE-02 | smoke | `npm run build` | OK | pending |
| 8-03-01 | 03 | 3 | RATE-02 | smoke | `npm run lint` | OK | pending |
| 8-03-02 | 03 | 3 | RATE-02 | smoke | `npm run build` | OK | pending |

*Status: pending = not yet executed, green = passing, red = failing*

---

## Wave 0 Requirements

- Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Durable limiter state survives a server restart and still blocks over-budget callers | RATE-01 | Lint/build cannot prove behavior across process restarts or multiple app instances | Exhaust one limiter bucket in local dev or staging, restart the Next.js server (or hit a second instance), and confirm the next request still receives the expected 429 until the stored window expires. |
| Workshop guest submissions still hit explicit limits before AI evaluation and before attachment-heavy work | RATE-02 | Requires a real workshop cookie, anonymous flow, and optionally an attachment upload | Join a workshop, submit repeated guest ideas including one with an attachment, and confirm the new durable limiter blocks excess attempts without silently bypassing protection or uploading files after the budget is spent. |
| Workshop code entry rejects brute-force bursts without breaking the redirect flow for valid codes | RATE-02 | Requires repeated invalid join attempts and then one valid code path | Submit several invalid workshop codes until throttled, confirm the join form returns a clear rate-limit message, then retry after reset with a valid code and confirm it still sets the cookie and redirects correctly. |

---

## Validation Sign-Off

- [x] All tasks have an automated verify command
- [x] Sampling continuity is maintained
- [x] Wave 0 does not require new infrastructure
- [x] No watch-mode flags are used
- [x] Feedback latency is below 90 seconds
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-03-04
