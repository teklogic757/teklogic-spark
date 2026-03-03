# Roadmap: Teklogic Spark AI

**Created:** 2026-03-03
**Mode:** Active milestone planning

## Milestones

- [x] **v1.0 Production Readiness** - Phases 1-4 (shipped 2026-03-03)
- [ ] **v1.1 Trust And Isolation Hardening** - Phases 5-9 (planned 2026-03-03)

## Active Milestone

**v1.1 Trust And Isolation Hardening**

Goal: Restore trust in scoring, reduce over-broad privileged reads, harden critical submission infrastructure, and add the first real automated safety net.

### Phase Summary

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 5 | Score Integrity | Make weighted rubric scoring the single source of truth for persisted AI scores and points | SCOR-01, SCOR-02 | 3 |
| 6 | Tenant Boundary Tightening | Reduce service-role scope and make dashboard content reads tenant-safe and typed | SECU-01, SECU-02, SECU-03 | 3 |
| 7 | Submission Flow Decomposition | Split the submit funnel into safer, testable units with resilient side-effect boundaries | SUBM-01, SUBM-02 | 3 |
| 8 | Durable Abuse Controls | Replace restart-prone in-memory limits with a shared limiter backend on critical entry points | RATE-01, RATE-02 | 3 |
| 9 | Test Baseline And Join Cleanup | Add test tooling, cover critical regressions, and clean the workshop join smell | TEST-01, TEST-02, TEST-03 | 3 |

### Phase Details

**Phase 5: Score Integrity**
Goal: Align persisted scores, point awards, and ranking with the documented weighted rubric.
Requirements: SCOR-01, SCOR-02
Success criteria:
1. Weighted rubric output is persisted as the canonical score for new submissions.
2. Point calculations and leaderboard ordering use the same canonical score field and logic path.
3. Score handling clearly rejects or ignores mismatched model-supplied overall scores when they conflict with rubric math.

**Phase 6: Tenant Boundary Tightening**
Goal: Narrow privileged access so dashboard reads stay correct under current and future tenant rules.
Requirements: SECU-01, SECU-02, SECU-03
Success criteria:
1. Service-role usage on dashboard paths is reduced to documented exceptions that cannot be served safely through user-scoped clients.
2. Training-video queries are scoped through a reusable access pattern that prevents accidental cross-tenant reads if the schema changes.
3. Dashboard server code removes avoidable `as any` casts by using typed data contracts or explicit parsing.

**Phase 7: Submission Flow Decomposition**
Goal: Reduce the blast radius of changes in the idea submission funnel.
Requirements: SUBM-01, SUBM-02
Success criteria:
1. Submission logic is organized into smaller server-side units with clear inputs and outputs.
2. Core persistence can succeed independently of non-critical side effects such as outbound email.
3. Failure paths are explicit enough to test without invoking the full action end to end for every case.

**Phase 8: Durable Abuse Controls**
Goal: Make submission throttling enforceable in real deployments.
Requirements: RATE-01, RATE-02
Success criteria:
1. Rate-limit state is stored in a shared backend rather than process memory.
2. Multi-instance or restart scenarios no longer silently reset effective protection.
3. Guest submission, workshop submission, and file-upload-adjacent paths continue to enforce limits through the new backend.

**Phase 9: Test Baseline And Join Cleanup**
Goal: Add the first meaningful automated safety net and remove the known workshop join logic smell.
Requirements: TEST-01, TEST-02, TEST-03
Success criteria:
1. The repo can run an automated test suite through a documented package script.
2. Tests cover score canonicalization, tenant-safe dashboard access boundaries, and critical submission success/failure behavior.
3. The duplicate workshop join filter is removed and its intended behavior is verified.

## Archived Milestones

<details>
<summary>[x] v1.0 Production Readiness (Phases 1-4) - shipped 2026-03-03</summary>

- [x] Phase 1: Submission UX Hardening (2/2 plans) - completed 2026-03-03
- [x] Phase 2: Notification Delivery (2/2 plans) - completed 2026-03-03
- [x] Phase 3: Digest And Content Admin (3/3 plans) - completed 2026-03-03
- [x] Phase 4: Audit And Production Cleanup (3/3 plans) - completed 2026-03-03

Archive files:
- `.planning/milestones/v1.0-ROADMAP.md`
- `.planning/milestones/v1.0-REQUIREMENTS.md`

</details>

## Next Up

**Phase 5: Score Integrity** - Make weighted rubric scoring the single source of truth.

1. Use `$gsd-discuss-phase 5` to refine the implementation approach.
2. Use `$gsd-plan-phase 5` to create the execution plan directly.
3. Execute Phase 5 before expanding scope to later phases.

---
*Last updated: 2026-03-03 after starting v1.1 milestone*
