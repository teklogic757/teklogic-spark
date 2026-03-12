# Roadmap: Teklogic Spark AI

**Created:** 2026-03-03
**Mode:** Active milestone planning

## Milestones

- [x] **v1.0 Production Readiness** - Phases 1-4 (shipped 2026-03-03)
- [x] **v1.1 Trust And Isolation Hardening** - Phases 5-9 (archived 2026-03-07)
- [ ] **v1.2 Internet Deployment Security Hardening** - Phases 10-12 (planned 2026-03-07)

## Active Milestone

**v1.2 Internet Deployment Security Hardening**

Goal: Make Teklogic Spark AI safe for public internet deployment by hardening repository/deployment hygiene, public security boundaries, and go-live verification.

### Phase Summary

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 10 | Repository And Secret Hygiene | Remove deployment foot-guns by enforcing clean repo and environment secret discipline | DSEC-01, DSEC-02 | 3 |
| 11 | Public Surface And Privilege Hardening | Apply internet-safe headers/session behavior and constrain privileged admin/service-role surfaces | DSEC-03, DSEC-04 | 3 |
| 12 | Go-Live Verification And Durable Limiter Closeout | Finalize production checklist and close carried RATE runtime verification debt | DSEC-05, RATE-01, RATE-02 | 3 |

### Active Phase Progress

- [ ] Phase 10: Repository And Secret Hygiene (plans executed 2026-03-11; verification pending env cleanup)
- [ ] Phase 11: Public Surface And Privilege Hardening (plans executed 2026-03-11; verification pending deployed-host checks)
- [ ] Phase 12: Go-Live Verification And Durable Limiter Closeout

### Phase Details

**Phase 10: Repository And Secret Hygiene**  
Goal: Ensure deployable builds run from managed environment configuration and clean repository boundaries.
Requirements: DSEC-01, DSEC-02
Success criteria:
1. Production code paths reject local-only secret overrides and rely on managed environment variables.
2. Repository hygiene rules prevent committing secrets, local caches, generated artifacts, and local agent tooling.
3. CI/Vercel-oriented build entrypoints validate required environment configuration before deployment.

**Phase 11: Public Surface And Privilege Hardening**  
Goal: Reduce internet-facing risk by hardening session and privilege boundaries.
Requirements: DSEC-03, DSEC-04
Success criteria:
1. Security headers and cookie behavior are explicitly set for public internet operation.
2. Redirect, auth callback, and login flows enforce safe host/origin behavior under production deployment.
3. Admin/service-role access paths are documented and constrained to minimum required operations.

**Phase 12: Go-Live Verification And Durable Limiter Closeout**  
Goal: Produce a complete go-live gate and close Phase 8 runtime verification debt.
Requirements: DSEC-05, RATE-01, RATE-02
Success criteria:
1. A concrete go-live checklist is documented and executable for secrets, credentials, Vercel env setup, and final smoke tests.
2. Durable limiter migration and runtime verification checks pass for restart and multi-instance behavior.
3. Workshop join and guest/attachment-adjacent submit throttling are manually verified as durable and enforced.

## Archived Milestones

<details>
<summary>[x] v1.1 Trust And Isolation Hardening (Phases 5-9) - archived 2026-03-07</summary>

- [x] Phase 5: Score Integrity (3/3 plans)
- [x] Phase 6: Tenant Boundary Tightening (3/3 plans)
- [x] Phase 7: Submission Flow Decomposition (3/3 plans)
- [x] Phase 8: Durable Abuse Controls (3/3 plans implemented; runtime verification still pending)
- [x] Phase 9: Test Baseline And Join Cleanup (3/3 plans)

Archive files:
- `.planning/milestones/v1.1-ROADMAP.md`
- `.planning/milestones/v1.1-REQUIREMENTS.md`

</details>

<details>
<summary>[x] v1.0 Production Readiness (Phases 1-4) - shipped 2026-03-03</summary>

- [x] Phase 1: Submission UX Hardening (2/2 plans)
- [x] Phase 2: Notification Delivery (2/2 plans)
- [x] Phase 3: Digest And Content Admin (3/3 plans)
- [x] Phase 4: Audit And Production Cleanup (3/3 plans)

Archive files:
- `.planning/milestones/v1.0-ROADMAP.md`
- `.planning/milestones/v1.0-REQUIREMENTS.md`

</details>

## Next Up

**Phase 11 Verification** - run the manual public-surface checks on a production-like HTTPS host after clearing the existing Phase 10 env blockers.

1. Remove `TEST_EMAIL_OVERRIDE` and `EMAIL_TO` from deploy-like env files or hosted env configuration.
2. Set a real HTTPS `NEXT_PUBLIC_SITE_URL`.
3. Run the Phase 11 manual checks from `.planning/phases/11-public-surface-and-privilege-hardening/11-VERIFICATION.md`.
4. Proceed to `$gsd-verify-work 11` or continue into Phase 12 once verification closes.

---
*Last updated: 2026-03-11 after executing Phase 11 plans*
