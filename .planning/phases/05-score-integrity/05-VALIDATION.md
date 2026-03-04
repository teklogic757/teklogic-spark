---
phase: 5
slug: score-integrity
status: ready
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-04
---

# Phase 5 - Validation Strategy

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
| 5-01-01 | 01 | 1 | SCOR-01 | smoke | `npm run lint` | OK | pending |
| 5-01-02 | 01 | 1 | SCOR-01 | smoke | `npm run build` | OK | pending |
| 5-02-01 | 02 | 2 | SCOR-01, SCOR-02 | smoke | `npm run lint` | OK | pending |
| 5-02-02 | 02 | 2 | SCOR-01, SCOR-02 | smoke | `npm run build` | OK | pending |
| 5-03-01 | 03 | 2 | SCOR-02 | smoke | `npm run lint` | OK | pending |
| 5-03-02 | 03 | 2 | SCOR-02 | smoke | `npm run build` | OK | pending |

*Status: pending = not yet executed, green = passing, red = failing*

---

## Wave 0 Requirements

- Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Canonical score ignores mismatched model `overall_score` values | SCOR-01 | Requires a controlled mocked or logged mismatch case that lint/build cannot exercise | Force one evaluation response where `criteria_scores` imply a different weighted result than `overall_score`, submit an idea, and confirm the persisted `ideas.ai_score` matches rubric math while the mismatch is logged or stored for diagnostics. |
| Score-driven UI matches persisted canonical totals after reconciliation | SCOR-02 | Requires runtime data inspection across multiple views | In a seeded or staging org, compare one user's `ideas.ai_score` sum with dashboard stats, leaderboard rank, mobile leaderboard, and contest digest payload data. Confirm they all show the same total and ordering after the phase changes land. |

---

## Validation Sign-Off

- [x] All tasks have an automated verify command
- [x] Sampling continuity is maintained
- [x] Wave 0 does not require new infrastructure
- [x] No watch-mode flags are used
- [x] Feedback latency is below 90 seconds
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-03-04
