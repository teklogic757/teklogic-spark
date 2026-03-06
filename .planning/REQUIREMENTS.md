# Requirements: Teklogic Spark AI

**Defined:** 2026-03-03
**Core Value:** Organizations can reliably capture, score, and act on company-specific AI ideas in a way that keeps employees engaged after the workshop ends.

## v1 Requirements

### Scoring Integrity

- [ ] **SCOR-01**: Submitted ideas persist a canonical AI score derived from the documented weighted criterion rubric rather than the model's standalone overall score.
- [ ] **SCOR-02**: Points, leaderboard ranking, and any score-based UI all use the same canonical weighted score source.

### Tenant Isolation

- [x] **SECU-01**: Dashboard data reads use the least-privilege Supabase client needed for each dataset, with service-role access limited to explicitly justified server-only exceptions.
- [x] **SECU-02**: Training-video reads use a scoped query contract that remains safe if videos become organization-specific later.
- [x] **SECU-03**: Dashboard server code removes unsafe `as any` escapes where typed access patterns can express the real data boundary.

### Submission Pipeline

- [x] **SUBM-01**: Idea submission is split into composable server-side units for validation, context loading, AI evaluation, uploads, persistence, point updates, and notifications.
- [x] **SUBM-02**: Non-critical side effects (such as email dispatch) cannot cause a valid idea submission to be lost after persistence succeeds.

### Abuse Controls

- [ ] **RATE-01**: Guest and authenticated submission rate limits use a shared durable store that works consistently across multi-instance deployments.
- [ ] **RATE-02**: Rate-limit enforcement remains explicit for file-upload and workshop submission paths that currently depend on the in-memory limiter.

### Quality Safety Net

- [x] **TEST-01**: The repository includes an automated test runner and scripts that can execute the app's test suite in local development and CI.
- [x] **TEST-02**: Automated tests cover score canonicalization, tenant-safe dashboard access, and the critical submission flow's success/failure boundaries.
- [ ] **TEST-03**: The workshop join flow removes redundant query filters and has regression coverage or focused verification documentation.

## v2 Requirements

### Collaboration And Analytics

- **COLL-01**: Users can vote on ideas without weakening tenant isolation.
- **COLL-02**: Users can comment on ideas with moderation-aware visibility rules.
- **ANLY-01**: Admins can view milestone-level analytics on idea volume, scoring trends, and engagement.
- **CAMP-01**: Admins can configure time-boxed campaign windows with clear start and end rules.

### Internet Deployment Security Hardening

- [ ] **DSEC-01**: Production deployments load secrets from managed environment variables only, with development-only overrides explicitly disabled outside local environments.
- [ ] **DSEC-02**: The repository excludes secrets, local caches, generated artifacts, and local agent tooling so a fresh remote clone is safe for CI and Vercel builds.
- [ ] **DSEC-03**: Public-facing routes use production-safe security headers, cookie behavior, and redirect handling suitable for internet exposure.
- [ ] **DSEC-04**: Admin and service-role capabilities remain explicitly constrained and documented so deployment does not widen privileged access by accident.
- [ ] **DSEC-05**: A go-live checklist covers key rotation, test credential cleanup, Vercel environment setup, and final production verification steps.

## Out of Scope

| Feature | Reason |
|---------|--------|
| New end-user engagement features in this milestone | Correctness and platform trust issues are higher priority than adding surface area |
| Re-platforming away from Next.js/Supabase | The current architecture is stable enough; the issue is implementation discipline, not stack choice |
| Full distributed-scale redesign beyond a durable limiter backend | Current scale is still modest, so this milestone should fix the weakest operational point without broad infrastructure churn |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SCOR-01 | Phase 5 | Complete |
| SCOR-02 | Phase 5 | Complete |
| SECU-01 | Phase 6 | Complete |
| SECU-02 | Phase 6 | Complete |
| SECU-03 | Phase 6 | Complete |
| SUBM-01 | Phase 7 | Complete |
| SUBM-02 | Phase 7 | Complete |
| RATE-01 | Phase 8 | Pending |
| RATE-02 | Phase 8 | Pending |
| TEST-01 | Phase 9 | Complete |
| TEST-02 | Phase 9 | Complete |
| TEST-03 | Phase 9 | Pending |
| DSEC-01 | Milestone v1.2 (queued) | Queued |
| DSEC-02 | Milestone v1.2 (queued) | Queued |
| DSEC-03 | Milestone v1.2 (queued) | Queued |
| DSEC-04 | Milestone v1.2 (queued) | Queued |
| DSEC-05 | Milestone v1.2 (queued) | Queued |

**Coverage:**
- v1 requirements: 17 total
- Mapped to phases: 12
- Unmapped: 5

---
*Requirements defined: 2026-03-03*
*Last updated: 2026-03-04 after completing Phase 7*
