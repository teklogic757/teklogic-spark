---
phase: 7
slug: submission-flow-decomposition
status: ready
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-04
---

# Phase 7 - Validation Strategy

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
| 7-01-01 | 01 | 1 | SUBM-01 | smoke | `npm run lint` | OK | pending |
| 7-01-02 | 01 | 1 | SUBM-01 | smoke | `npm run build` | OK | pending |
| 7-02-01 | 02 | 2 | SUBM-01, SUBM-02 | smoke | `npm run lint` | OK | pending |
| 7-02-02 | 02 | 2 | SUBM-01, SUBM-02 | smoke | `npm run build` | OK | pending |
| 7-03-01 | 03 | 3 | SUBM-01, SUBM-02 | smoke | `npm run lint` | OK | pending |
| 7-03-02 | 03 | 3 | SUBM-01, SUBM-02 | smoke | `npm run build` | OK | pending |

*Status: pending = not yet executed, green = passing, red = failing*

---

## Wave 0 Requirements

- Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Desktop submit still persists ideas even if outbound email is unavailable | SUBM-02 | Requires simulating a provider failure after the DB write | Disable email credentials or force a provider failure, submit an authenticated desktop idea, and confirm the idea appears on the dashboard despite notification failures being logged. |
| Guest workshop submissions still support attachment uploads and complete safely | SUBM-01, SUBM-02 | Requires workshop cookie state plus real file upload handling | Start a workshop guest session, submit an idea with an attachment from the desktop flow, and confirm the idea is saved, the attachment path is persisted, and the user is redirected correctly. |
| Mobile submit flow reuses the shared pipeline without changing UX | SUBM-01 | Requires checking end-user redirect behavior on mobile routes | Submit a mobile idea and confirm the flow still redirects to `/{client_id}/m/submit/success` while using the new shared server-side orchestration. |
| Failure boundaries are explicit enough to test independently | SUBM-01, SUBM-02 | Requires code-level review of helper boundaries | Review the extracted submission helpers and confirm validation/context loading, persistence, and notification dispatch are separate units with typed inputs/outputs. |

---

## Validation Sign-Off

- [x] All tasks have an automated verify command
- [x] Sampling continuity is maintained
- [x] Wave 0 does not require new infrastructure
- [x] No watch-mode flags are used
- [x] Feedback latency is below 90 seconds
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-03-04
