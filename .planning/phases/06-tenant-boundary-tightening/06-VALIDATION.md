---
phase: 6
slug: tenant-boundary-tightening
status: ready
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-04
---

# Phase 6 - Validation Strategy

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
| 6-01-01 | 01 | 1 | SECU-01, SECU-03 | smoke | `npm run lint` | OK | pending |
| 6-01-02 | 01 | 1 | SECU-01, SECU-03 | smoke | `npm run build` | OK | pending |
| 6-02-01 | 02 | 2 | SECU-02 | smoke | `npm run lint` | OK | pending |
| 6-02-02 | 02 | 2 | SECU-02 | smoke | `npm run build` | OK | pending |
| 6-03-01 | 03 | 2 | SECU-01, SECU-03 | smoke | `npm run lint` | OK | pending |
| 6-03-02 | 03 | 2 | SECU-01, SECU-03 | smoke | `npm run build` | OK | pending |

*Status: pending = not yet executed, green = passing, red = failing*

---

## Wave 0 Requirements

- Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Dashboard still loads when org-row RLS is restrictive | SECU-01 | Requires a real authenticated session plus current Supabase RLS behavior | Sign in as a normal tenant user and load `/{client_id}/dashboard`. Confirm the page still resolves the organization and loads all non-admin widgets after privileged reads are narrowed. |
| Training videos remain tenant-safe if org-specific rows are introduced later | SECU-02 | Requires schema-aware reasoning against real data shape changes | Seed at least one global training video and one org-scoped training video (or simulate future rows), then confirm the helper returns only global rows plus the current org's rows. |
| Dashboard code no longer relies on unsafe broad casts | SECU-03 | Requires code-level review rather than a runtime-only check | Review the final dashboard and helper code to confirm `as any` is removed or isolated behind explicit typed parsing functions with constrained return shapes. |

---

## Validation Sign-Off

- [x] All tasks have an automated verify command
- [x] Sampling continuity is maintained
- [x] Wave 0 does not require new infrastructure
- [x] No watch-mode flags are used
- [x] Feedback latency is below 90 seconds
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-03-04
