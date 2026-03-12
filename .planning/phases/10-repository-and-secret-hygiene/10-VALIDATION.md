---
phase: 10
slug: repository-and-secret-hygiene
status: ready
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-11
---

# Phase 10 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + existing smoke checks (`eslint`, `next build`) + phase-specific repo hygiene script |
| **Config file** | `vitest.config.ts`, `package.json`, phase-added repo/deploy helper scripts |
| **Quick run command** | `npm run lint` |
| **Full suite command** | `npm run test:ci && npm run build` |
| **Estimated runtime** | ~90-180 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run lint`
- **After every plan wave:** Run the strongest relevant phase command plus `npm run test:ci`
- **Before `$gsd-verify-work`:** Run `npm run test:ci && npm run build`
- **Max feedback latency:** 180 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 10-01-01 | 01 | 1 | DSEC-01 | static | `npm run lint` | OK | pending |
| 10-01-02 | 01 | 1 | DSEC-01 | smoke | `npm run test:ci && npm run build` | OK | pending |
| 10-02-01 | 02 | 1 | DSEC-02 | script | `npm run check:repo-hygiene` | W0 | pending |
| 10-02-02 | 02 | 1 | DSEC-02 | static | `npm run lint` | OK | pending |
| 10-03-01 | 03 | 2 | DSEC-01 | script | `npm run check:deploy-env` | W0 | pending |
| 10-03-02 | 03 | 2 | DSEC-01, DSEC-02 | smoke | `npm run test:ci && npm run build` | OK | pending |

*Status: pending = not yet executed, green = passing, red = failing*

---

## Wave 0 Requirements

- Existing Vitest, lint, and build infrastructure already covers the phase.
- Wave 1 must add `npm run check:repo-hygiene` before Plan 02 can close with full automation.
- Wave 2 must add `npm run check:deploy-env` before final deployment gating can be considered complete.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Fresh remote clone is safe for install/build without deleting leaked local artifacts first | DSEC-02 | Requires real repository state outside isolated test harness | Clone the repo into a new directory, run `npm install`, then run the documented repo/deploy checks and confirm no local-only files are required or accidentally tracked. |
| Production runtime rejects local-only override behavior such as `TEST_EMAIL_OVERRIDE` and localhost site URLs | DSEC-01 | Depends on real production-style env settings and deployment semantics | Run the deployment preflight with production env variables, once with a valid HTTPS site URL and once with invalid/unsafe values, and confirm the failure reasons are explicit. |
| Local maintenance scripts can still use `.env.local` while production app code does not depend on it | DSEC-01 | Distinguishes script-time behavior from runtime behavior | Run one local helper script from PowerShell with `.env.local`, then run the app/deploy preflight contract and confirm it does not read or require local-only overrides. |

---

## Validation Sign-Off

- [x] All tasks have an automated verify command or a Wave 0 dependency
- [x] Sampling continuity is maintained
- [x] Wave 0 gaps are explicitly called out
- [x] No watch-mode flags are used in verification commands
- [x] Feedback latency is below 180 seconds
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-03-11
