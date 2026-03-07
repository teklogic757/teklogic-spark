# Requirements: Teklogic Spark AI

**Defined:** 2026-03-07
**Core Value:** Organizations can reliably capture, score, and act on company-specific AI ideas in a way that keeps employees engaged after the workshop ends.
**Milestone:** v1.2 Internet Deployment Security Hardening

## v1 Requirements

Requirements committed for milestone v1.2.

### Repository And Secret Hygiene

- [ ] **DSEC-01**: Production deployments load secrets from managed environment variables only, with development-only overrides explicitly disabled outside local environments.
- [ ] **DSEC-02**: The repository excludes secrets, local caches, generated artifacts, and local agent tooling so a fresh remote clone is safe for CI and Vercel builds.

### Public Surface Security

- [ ] **DSEC-03**: Public-facing routes use production-safe security headers, cookie behavior, and redirect handling suitable for internet exposure.
- [ ] **DSEC-04**: Admin and service-role capabilities remain explicitly constrained and documented so deployment does not widen privileged access by accident.

### Go-Live Readiness

- [ ] **DSEC-05**: A go-live checklist covers key rotation, test credential cleanup, Vercel environment setup, and final production verification steps.

### Carried Verification Debt

- [ ] **RATE-01**: Guest and authenticated submission rate limits use a shared durable store that works consistently across multi-instance deployments (close via runtime verification).
- [ ] **RATE-02**: Rate-limit enforcement remains explicit for file-upload and workshop submission paths that currently depend on the in-memory limiter (close via runtime verification).

## v2 Requirements

Deferred to future milestone(s).

### Collaboration And Analytics

- **COLL-01**: Users can vote on ideas without weakening tenant isolation.
- **COLL-02**: Users can comment on ideas with moderation-aware visibility rules.
- **ANLY-01**: Admins can view milestone-level analytics on idea volume, scoring trends, and engagement.
- **CAMP-01**: Admins can configure time-boxed campaign windows with clear start and end rules.

## Out of Scope

| Feature | Reason |
|---------|--------|
| New end-user engagement features in v1.2 | Deployment hardening and verification closure are higher-priority release gates |
| Re-platforming away from Next.js/Supabase | Current stack is stable enough; risk is in deployment/security discipline |
| Broad distributed systems redesign | Current scale does not justify infra expansion beyond durable limiter verification |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DSEC-01 | Phase 10 | Pending |
| DSEC-02 | Phase 10 | Pending |
| DSEC-03 | Phase 11 | Pending |
| DSEC-04 | Phase 11 | Pending |
| DSEC-05 | Phase 12 | Pending |
| RATE-01 | Phase 12 | Pending |
| RATE-02 | Phase 12 | Pending |

**Coverage:**
- v1 requirements: 7 total
- Mapped to phases: 7
- Unmapped: 0

---
*Requirements defined: 2026-03-07*
*Last updated: 2026-03-07 after starting milestone v1.2*
