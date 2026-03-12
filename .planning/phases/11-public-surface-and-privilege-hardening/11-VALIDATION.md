---
phase: 11
slug: public-surface-and-privilege-hardening
status: ready
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-11
---

# Phase 11 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + existing smoke checks (`eslint`, `next build`) |
| **Config file** | `vitest.config.ts`, `package.json` |
| **Quick run command** | `npm run lint` |
| **Full suite command** | `npm run test:ci && npm run build` |
| **Estimated runtime** | ~120-240 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run lint`
- **After every plan wave:** Run the strongest targeted phase command plus `npm run test:ci`
- **Before `$gsd-verify-work`:** Run `npm run test:ci && npm run build`
- **Max feedback latency:** 240 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 11-01-01 | 01 | 1 | DSEC-03 | unit | `npm run test -- --run src/lib/security-headers.test.ts` | OK | passed |
| 11-01-02 | 01 | 1 | DSEC-03 | static | `npm run lint` | OK | passed with existing repo warnings |
| 11-02-01 | 02 | 2 | DSEC-03 | unit | `npm run test -- --run src/lib/auth-redirect.test.ts` | OK | passed |
| 11-02-02 | 02 | 2 | DSEC-03 | smoke | `npm run test:ci && npm run build` | OK | `test:ci` passed; `build` blocked by existing local-only env overrides |
| 11-03-01 | 03 | 2 | DSEC-04 | unit | `npm run test -- --run src/lib/dashboard-access.test.ts src/app/admin/actions.test.ts` | OK | passed |
| 11-03-02 | 03 | 2 | DSEC-04 | static | `npm run lint` | OK | passed with existing repo warnings |

*Status: pending = not yet executed, green = passing, red = failing*

---

## Wave 0 Requirements

- Existing Vitest, lint, and build infrastructure already covers the phase.
- Phase 11 should add focused tests for header policy, redirect normalization, and admin guard behavior inside the plan work rather than via a separate setup wave.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| HSTS and secure-cookie behavior appear correctly behind the real HTTPS deployment edge | DSEC-03 | Local `next build` cannot fully simulate CDN/proxy TLS headers and browser cookie storage rules | Deploy to a production-like host, log in, inspect response headers and auth cookies in DevTools, and confirm HSTS plus secure cookie attributes are present only under the intended HTTPS conditions. |
| Magic-link and auth callback redirects reject suspicious `next` values and land on the canonical production host | DSEC-03 | Requires real email callback links and browser navigation against the deployed hostname | Trigger a magic link, test valid relative redirects, invalid external redirects, and mismatched host/origin scenarios, and confirm fallback behavior routes to a safe in-app page. |
| Authenticated non-admin users receive a hard deny for `/admin` while super admins retain required workflows | DSEC-04 | Requires real session roles and browser navigation through the public app shell | Sign in once as a non-admin and once as a super admin, visit `/admin` and key subroutes, and confirm non-admin users do not receive soft redirects that hide authorization failures. |
| Service-role call sites match the documented privileged-access inventory | DSEC-04 | This is a code and operator review artifact, not just a runtime behavior | Compare the final `createAdminClient()` call sites to the privileged-access documentation and confirm every remaining call has a narrow rationale and owner-facing note. |

---

## Validation Sign-Off

- [x] All tasks have an automated verify command or existing infrastructure coverage
- [x] Sampling continuity is maintained
- [x] Wave 0 gaps are explicitly called out
- [x] No watch-mode flags are used in verification commands
- [x] Feedback latency is below 240 seconds
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-03-11
