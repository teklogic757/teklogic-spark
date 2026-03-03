# Requirements: Teklogic Spark AI

**Defined:** 2026-03-03
**Core Value:** Organizations can reliably capture, score, and act on company-specific AI ideas in a way that keeps employees engaged after the workshop ends.

## v1 Requirements

Requirements for the current production-readiness milestone. Each maps to exactly one roadmap phase.

### Notifications

- [ ] **NOTF-01**: New users receive a welcome email after account creation with organization-specific login guidance
- [ ] **NOTF-02**: Idea submitters receive evaluation emails through the configured provider, with graceful fallback when delivery fails
- [ ] **NOTF-03**: Admins receive a notification email for each new idea submission including submitter context and attachment presence
- [ ] **NOTF-04**: Active contests can trigger a weekly digest summarizing leaderboard standings and recent top ideas

### Admin Experience

- [ ] **ADMN-01**: Super admins can add a training video to the learning library by submitting a YouTube URL in the admin area
- [ ] **ADMN-02**: Super admins can remove an existing training video from the learning library in the admin area

### Quality And Reliability

- [ ] **QUAL-01**: Users get client-side validation on idea submission that mirrors the current server-side rules for required fields, lengths, and file restrictions
- [ ] **QUAL-02**: Submission and admin mutation flows show clear loading and failure states while async work is in progress
- [ ] **QUAL-03**: Production-facing request paths avoid noisy debug logging while preserving actionable error logging
- [ ] **QUAL-04**: Sensitive admin mutations are audit-logged with actor, action, target, and timestamp

## v2 Requirements

Deferred to a later milestone. Tracked here so they do not leak into the current roadmap.

### Collaboration

- **COLL-01**: Users can upvote ideas within their organization
- **COLL-02**: Users can comment on ideas to discuss implementation details

### Engagement

- **GAME-01**: Users earn badges or achievements beyond score-based points
- **GAME-02**: Organizations can run theme-based campaigns with custom rules

## Out of Scope

Explicitly excluded from this milestone.

| Feature | Reason |
|---------|--------|
| Native mobile app | Existing mobile web routes are sufficient for the current milestone |
| Slack or Teams integrations | Valuable later, but not required to make the core platform production-ready |
| Broad social collaboration suite | Comments and advanced collaboration are intentionally deferred to v2 |
| Major architecture rewrite | Current work should harden the existing Next.js and Supabase foundation |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| NOTF-01 | Phase 2 | Pending |
| NOTF-02 | Phase 2 | Pending |
| NOTF-03 | Phase 2 | Pending |
| NOTF-04 | Phase 3 | Pending |
| ADMN-01 | Phase 3 | Pending |
| ADMN-02 | Phase 3 | Pending |
| QUAL-01 | Phase 1 | Pending |
| QUAL-02 | Phase 1 | Pending |
| QUAL-03 | Phase 4 | Pending |
| QUAL-04 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 10 total
- Mapped to phases: 10
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-03*
*Last updated: 2026-03-03 after initial definition*
