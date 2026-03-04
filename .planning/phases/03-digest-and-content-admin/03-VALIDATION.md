---
phase: 3
slug: digest-and-content-admin
status: ready
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-03
---

# Phase 3 - Validation Strategy

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
| 3-01-01 | 01 | 1 | NOTF-04, ADMN-01, ADMN-02 | smoke | `npm run lint` | OK | pending |
| 3-01-02 | 01 | 1 | NOTF-04, ADMN-01, ADMN-02 | smoke | `npm run build` | OK | pending |
| 3-02-01 | 02 | 2 | NOTF-04 | smoke | `npm run lint` | OK | pending |
| 3-02-02 | 02 | 2 | NOTF-04 | smoke | `npm run build` | OK | pending |
| 3-03-01 | 03 | 2 | ADMN-01, ADMN-02 | smoke | `npm run lint` | OK | pending |
| 3-03-02 | 03 | 2 | ADMN-01, ADMN-02 | smoke | `npm run build` | OK | pending |

*Status: pending = not yet executed, green = passing, red = failing*

---

## Wave 0 Requirements

- Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Weekly digest only runs for active contests | NOTF-04 | Requires real time-window data plus email configuration | Seed one active contest and one inactive contest, invoke the digest route with the expected secret, confirm only the active organization is processed, then invoke it again within a week and confirm the same organization is skipped by cadence guard. |
| Admin can add a YouTube training item | ADMN-01 | Requires authenticated super-admin session plus UI interaction | In `/admin/training`, submit a valid YouTube URL, confirm the item is persisted, then load a tenant dashboard and verify the new card appears without editing source data files. |
| Admin can remove a training item | ADMN-02 | Requires authenticated super-admin session plus UI interaction | Delete an existing item from `/admin/training`, then refresh the tenant dashboard and confirm the removed card no longer renders. |

---

## Validation Sign-Off

- [x] All tasks have an automated verify command
- [x] Sampling continuity is maintained
- [x] Wave 0 does not require new infrastructure
- [x] No watch-mode flags are used
- [x] Feedback latency is below 90 seconds
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-03-03
