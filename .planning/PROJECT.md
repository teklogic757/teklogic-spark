# Teklogic Spark AI

## What This Is

Teklogic Spark AI is a multi-tenant web app that turns AI workshop momentum into a repeatable internal idea pipeline. Employees and workshop guests can submit automation ideas, get AI-assisted scoring and reframing, and participate in contests, leaderboards, and organization-specific experiences while admins manage tenant setup and content.

## Core Value

Organizations can reliably capture, score, and act on company-specific AI ideas in a way that keeps employees engaged after the workshop ends.

## Current Milestone: v1.1 Trust And Isolation Hardening

**Goal:** Restore trust in scoring, tighten tenant-safe access boundaries, and make critical submission flows easier to harden and verify.

**Target features:**
- Canonical weighted AI scoring drives persisted scores, points, and leaderboard behavior
- Dashboard and training-video reads use least-privilege, tenant-safe data access patterns
- Submission, rate limiting, and test infrastructure become production-safe and maintainable

## Requirements

### Validated

- [x] Users can authenticate and reach the correct organization dashboard through global and tenant-aware login flows
- [x] Employees and workshop guests can submit structured ideas with optional attachments and receive AI scoring data stored in Supabase
- [x] Super admins can manage organizations, users, invites, workshops, and organization settings from the admin area
- [x] The product includes leaderboard, prompt-library, learning-resource, and contest experiences in the current UI
- [x] Outbound notifications now run through a shared provider contract across welcome, evaluation, admin, and digest flows
- [x] Client-side submission validation and async admin feedback now better match the current server-side rules
- [x] Training videos are now admin-managed and contest digests have a real server-side workflow
- [x] Sensitive admin mutations are audit-logged and production-facing request paths are quieter and safer to operate

### Active

- [ ] Make weighted rubric scoring the only score that affects persisted results and points
- [ ] Reduce privileged data access on dashboard paths and preserve tenant boundaries for current and future content
- [ ] Break the submission pipeline into testable, lower-risk units and replace in-memory rate limiting with a shared store
- [ ] Establish an automated test baseline around scoring, isolation, and critical submission/workshop flows

### Out of Scope

- Native mobile apps: the current product is web-first and already has mobile-specific web routes
- Major new end-user collaboration or analytics features in this milestone: platform trust issues take priority first
- Re-platforming away from Next.js or Supabase

## Context

This is a brownfield Next.js 15 App Router application backed by Supabase for auth, Postgres data, and storage. The current repo now has a shipped production-readiness milestone covering stronger client validation, shared notification delivery, digest and training-content administration, and durable audit logging for privileged admin actions. A codebase map exists in `.planning/codebase/` and remains the structural reference for future planning. The immediate next step is a corrective hardening milestone focused on score integrity, least-privilege data access, submission-path maintainability, durable abuse controls, and test coverage.

## Current State

- Shipped milestone: `v1.0 Production Readiness` on 2026-03-03
- Completed scope: 4 phases, 10 plans, 23 documented tasks
- Operational baseline: `npm run lint` and `npm run build` pass, with only non-blocking existing warnings
- Recent architectural additions: shared email contract, digest workflow, admin-managed training videos, admin audit-event persistence, sanitized server logging
- New milestone focus: `v1.1 Trust And Isolation Hardening` addresses correctness drift, broader-than-needed service-role reads, submit-flow coupling, non-durable rate limiting, and missing automated tests

## Next Milestone Goals

- Make score calculation and point awards deterministic against the documented weighted rubric
- Narrow privileged reads so tenant boundaries remain explicit and future schema changes do not create silent leaks
- Create a safer platform baseline before adding new engagement or analytics surface area

## Queued Milestone After v1.1: v1.2 Internet Deployment Security Hardening

**Goal:** Prepare the app for Vercel deployment and public-internet exposure without carrying local-only assumptions, weak secret handling, or avoidable operational risk into production.

**Planned focus:**
- Clean repository hygiene so remote clones and build systems only receive the files required to build and run
- Enforce environment-managed secret handling and remove development-only overrides from production paths
- Add explicit go-live hardening around auth, headers, rate limiting, logging, and privileged admin/service-role surfaces

## Constraints

- **Tech stack**: Next.js 15, React 19, TypeScript, Supabase, and Tailwind are already in place; preserve the existing platform and patterns instead of re-architecting
- **Environment**: Windows/PowerShell is the primary development environment; avoid workflows that depend on fragile shell piping or Linux-only assumptions
- **Security**: `createAdminClient()` bypasses RLS and must stay tightly scoped; privileged operations need explicit justification and auditability
- **Operational scale**: Expected load remains modest (<10 concurrent users per project docs); optimize for reliability and maintainability before distributed scale concerns
- **External dependencies**: OpenAI and email providers are in the critical path for key user flows; failures must degrade safely without losing ideas

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Treat this as a brownfield initialization | The repo already contains a working product and a fresh codebase map | [x] Good |
| Use current documented priorities as the active planning scope | `ROADMAP.md` and `README.md` already defined the production-ready push | [x] Good |
| Track `.planning/` in git | Planning artifacts should persist with the repository and support future GSD steps | [x] Good |
| Skip separate domain research for initialization | The current codebase and docs provided enough local context to define the first milestone | [x] Good |
| Build production-safety features before new engagement features | Reliability, auditability, and lower operational noise had to land before more surface-area expansion | [x] Good |
| Prioritize a corrective hardening milestone before new end-user features | Score trust, tenant isolation, and deployment safety are product credibility issues, not optional cleanup | [ ] Pending |
| Skip standalone research for v1.1 planning | This milestone is driven by concrete repo issues rather than a new domain or feature category | [x] Good |

---
*Last updated: 2026-03-04 after queuing the post-v1.1 deployment security milestone*
