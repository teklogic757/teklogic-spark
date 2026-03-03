# Requirements: Teklogic Spark AI

**Defined:** 2026-03-03
**Core Value:** Organizations can reliably capture, score, and act on company-specific AI ideas in a way that keeps employees engaged after the workshop ends.

## v1 Requirements

### Scoring Integrity

- [ ] **SCOR-01**: Submitted ideas persist a canonical AI score derived from the documented weighted criterion rubric rather than the model's standalone overall score.
- [ ] **SCOR-02**: Points, leaderboard ranking, and any score-based UI all use the same canonical weighted score source.

### Tenant Isolation

- [ ] **SECU-01**: Dashboard data reads use the least-privilege Supabase client needed for each dataset, with service-role access limited to explicitly justified server-only exceptions.
- [ ] **SECU-02**: Training-video reads use a scoped query contract that remains safe if videos become organization-specific later.
- [ ] **SECU-03**: Dashboard server code removes unsafe `as any` escapes where typed access patterns can express the real data boundary.

### Submission Pipeline

- [ ] **SUBM-01**: Idea submission is split into composable server-side units for validation, context loading, AI evaluation, uploads, persistence, point updates, and notifications.
- [ ] **SUBM-02**: Non-critical side effects (such as email dispatch) cannot cause a valid idea submission to be lost after persistence succeeds.

### Abuse Controls

- [ ] **RATE-01**: Guest and authenticated submission rate limits use a shared durable store that works consistently across multi-instance deployments.
- [ ] **RATE-02**: Rate-limit enforcement remains explicit for file-upload and workshop submission paths that currently depend on the in-memory limiter.

### Quality Safety Net

- [ ] **TEST-01**: The repository includes an automated test runner and scripts that can execute the app's test suite in local development and CI.
- [ ] **TEST-02**: Automated tests cover score canonicalization, tenant-safe dashboard access, and the critical submission flow's success/failure boundaries.
- [ ] **TEST-03**: The workshop join flow removes redundant query filters and has regression coverage or focused verification documentation.

## v2 Requirements

### Collaboration And Analytics

- **COLL-01**: Users can vote on ideas without weakening tenant isolation.
- **COLL-02**: Users can comment on ideas with moderation-aware visibility rules.
- **ANLY-01**: Admins can view milestone-level analytics on idea volume, scoring trends, and engagement.
- **CAMP-01**: Admins can configure time-boxed campaign windows with clear start and end rules.

## Out of Scope

| Feature | Reason |
|---------|--------|
| New end-user engagement features in this milestone | Correctness and platform trust issues are higher priority than adding surface area |
| Re-platforming away from Next.js/Supabase | The current architecture is stable enough; the issue is implementation discipline, not stack choice |
| Full distributed-scale redesign beyond a durable limiter backend | Current scale is still modest, so this milestone should fix the weakest operational point without broad infrastructure churn |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SCOR-01 | Phase 5 | Pending |
| SCOR-02 | Phase 5 | Pending |
| SECU-01 | Phase 6 | Pending |
| SECU-02 | Phase 6 | Pending |
| SECU-03 | Phase 6 | Pending |
| SUBM-01 | Phase 7 | Pending |
| SUBM-02 | Phase 7 | Pending |
| RATE-01 | Phase 8 | Pending |
| RATE-02 | Phase 8 | Pending |
| TEST-01 | Phase 9 | Pending |
| TEST-02 | Phase 9 | Pending |
| TEST-03 | Phase 9 | Pending |

**Coverage:**
- v1 requirements: 12 total
- Mapped to phases: 12
- Unmapped: 0

---
*Requirements defined: 2026-03-03*
*Last updated: 2026-03-03 after starting v1.1 milestone*
