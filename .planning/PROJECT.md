# Teklogic Spark AI

## What This Is

Teklogic Spark AI is a multi-tenant web app that turns AI workshop momentum into a repeatable internal idea pipeline. Employees and workshop guests can submit automation ideas, get AI-assisted scoring and reframing, and participate in contests, leaderboards, and organization-specific experiences while admins manage tenant setup and content.

## Core Value

Organizations can reliably capture, score, and act on company-specific AI ideas in a way that keeps employees engaged after the workshop ends.

## Current Milestone: v1.2 Internet Deployment Security Hardening

**Goal:** Make the app safe for internet-facing Vercel deployment by hardening secret handling, public security boundaries, and go-live verification discipline.

**Target features:**
- Production-safe environment and secret handling with explicit validation for deploy targets
- Public-surface hardening for headers, auth/session behavior, and redirect safety
- Go-live checklist execution, including closure of carried durable-limiter runtime verification debt

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

- [ ] Close out `RATE-01` and `RATE-02` runtime verification by applying durable limiter migration and passing all checks in `08-UAT.md`
- [ ] Plan and execute v1.2 internet deployment hardening requirements (`DSEC-01` through `DSEC-05`)

### Out of Scope

- Native mobile apps: the current product is web-first and already has mobile-specific web routes
- Major new end-user collaboration or analytics features in this milestone: platform trust issues take priority first
- Re-platforming away from Next.js or Supabase

## Context

This is a brownfield Next.js 15 App Router application backed by Supabase for auth, Postgres data, and storage. The current repo now has a shipped production-readiness milestone covering stronger client validation, shared notification delivery, digest and training-content administration, and durable audit logging for privileged admin actions. A codebase map exists in `.planning/codebase/` and remains the structural reference for future planning. The immediate next step is a corrective hardening milestone focused on score integrity, least-privilege data access, submission-path maintainability, durable abuse controls, and test coverage.

## Current State

- Shipped milestone: `v1.0 Production Readiness` on 2026-03-03
- Archived milestone: `v1.1 Trust And Isolation Hardening` on 2026-03-07 (closed with known verification gaps)
- Operational baseline: `npm run lint` and `npm run build` pass, with only non-blocking existing warnings
- Recent architectural additions: shared email contract, digest workflow, admin-managed training videos, admin audit-event persistence, sanitized server logging
- Open verification debt: durable limiter runtime verification remains pending in `.planning/phases/08-durable-abuse-controls/08-UAT.md`
- New milestone focus: `v1.2 Internet Deployment Security Hardening` before internet-facing deployment

## Next Milestone Goals

- Enforce production-safe environment and secret handling across local, CI, and Vercel deploy targets
- Lock down public-facing auth/session behavior, headers, and privileged server surfaces before go-live
- Carry unresolved durable limiter runtime verification to completion as first-class release gating

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
*Last updated: 2026-03-07 after starting v1.2 Internet Deployment Security Hardening*
