---
phase: 1
slug: submission-ux-hardening
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-03
---

# Phase 1 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | other - eslint plus Next.js production build |
| **Config file** | `eslint.config.mjs` |
| **Quick run command** | `npm run lint` |
| **Full suite command** | `npm run build` |
| **Estimated runtime** | ~90 seconds |

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
| 1-01-01 | 01 | 1 | QUAL-01 | lint | `npm run lint` | ✅ | ⬜ pending |
| 1-01-02 | 01 | 1 | QUAL-01 | build | `npm run build` | ✅ | ⬜ pending |
| 1-01-03 | 01 | 1 | QUAL-02 | manual-plus-build | `npm run build` | ✅ | ⬜ pending |
| 1-02-01 | 02 | 1 | QUAL-02 | lint | `npm run lint` | ✅ | ⬜ pending |
| 1-02-02 | 02 | 1 | QUAL-02 | build | `npm run build` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Selected-file card renders filename, size, and remove or replace affordance | QUAL-01 | Visual interaction state | Select a valid attachment on desktop submit and confirm the card content updates correctly |
| Immediate attachment rejection shows both inline and form-level errors | QUAL-01 | UI placement and timing | Select an invalid file and confirm both error surfaces appear before submit |
| Redirecting submit flow shows a short processing message before navigation | QUAL-02 | Transitional UX timing | Submit a valid idea and confirm the processing copy appears with the spinner before redirect |
| Admin forms keep inline success feedback near the action area | QUAL-02 | Presentation consistency | Save changes in admin forms and confirm success remains inline rather than toast-only |

---

## Validation Sign-Off

- [x] All tasks have automated verify or existing Wave 0 coverage
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all missing references
- [x] No watch-mode flags
- [x] Feedback latency < 90s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending 2026-03-03
