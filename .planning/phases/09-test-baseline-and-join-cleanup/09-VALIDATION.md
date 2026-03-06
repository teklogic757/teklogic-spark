---
phase: 9
slug: test-baseline-and-join-cleanup
status: ready
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-06
---

# Phase 9 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + existing smoke checks (`eslint`, `next build`) |
| **Config file** | `vitest.config.ts`, `tsconfig.json`, `package.json` scripts |
| **Quick run command** | `npm run test -- --run` |
| **Full suite command** | `npm run test:ci && npm run build` |
| **Estimated runtime** | ~60-150 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test -- --run`
- **After every plan wave:** Run `npm run test:ci`
- **Before `$gsd-verify-work`:** Run `npm run test:ci && npm run build`
- **Max feedback latency:** 150 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 9-01-01 | 01 | 1 | TEST-01 | infrastructure | `npm run test -- --run` | OK | green |
| 9-01-02 | 01 | 1 | TEST-01 | smoke | `npm run test:ci` | OK | green |
| 9-02-01 | 02 | 2 | TEST-02 | unit | `npm run test -- --run src/lib/score.test.ts src/lib/dashboard-access.test.ts src/lib/submit-flow.test.ts` | OK | green |
| 9-02-02 | 02 | 2 | TEST-02 | integration-lite | `npm run test:ci` | OK | green |
| 9-03-01 | 03 | 3 | TEST-03 | unit | `npm run test -- --run src/app/join/actions.test.ts` | OK | pending |
| 9-03-02 | 03 | 3 | TEST-03 | smoke | `npm run test:ci && npm run build` | OK | pending |

*Status: pending = not yet executed, green = passing, red = failing*

---

## Wave 0 Requirements

- Existing infrastructure covers all phase requirements.
- Vitest bootstrap lands in Wave 1 Task 1 and unblocks all following automated verification commands.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Test commands are easy for the team to run in PowerShell and CI without local shell quirks | TEST-01 | Automated checks only validate pass/fail, not operator ergonomics | Run `npm run test -- --run` and `npm run test:ci` from a fresh PowerShell session and confirm command docs match actual behavior. |
| Workshop join still redirects valid codes while blocking abusive repeats | TEST-03 | Requires live Supabase workshop code and cookie behavior in browser flow | Trigger throttled invalid attempts, then validate a correct workshop code still sets the cookie and redirects to `/{org}/submit?source=workshop`. |

---

## Validation Sign-Off

- [x] All tasks have an automated verify command
- [x] Sampling continuity is maintained
- [x] Wave 0 does not require extra test infrastructure outside this phase
- [x] No watch-mode flags are used in verification commands
- [x] Feedback latency is below 150 seconds
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-03-06
