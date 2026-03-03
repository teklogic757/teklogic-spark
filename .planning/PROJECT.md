# Teklogic Spark AI

## What This Is

Teklogic Spark AI is a multi-tenant web app that turns AI workshop momentum into a repeatable internal idea pipeline. Employees and workshop guests can submit automation ideas, get AI-assisted scoring and reframing, and participate in contests, leaderboards, and organization-specific experiences while admins manage tenant setup and content.

## Core Value

Organizations can reliably capture, score, and act on company-specific AI ideas in a way that keeps employees engaged after the workshop ends.

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

- [ ] Define the next production milestone goals and convert the current v2 ideas into concrete requirements
- [ ] Add the highest-value collaboration feature set (voting and/or comments) without weakening tenant isolation
- [ ] Expand analytics and campaign-management tooling now that the baseline production-readiness work is shipped

### Out of Scope

- Native mobile apps: the current product is web-first and already has mobile-specific web routes
- Major new social features beyond the next milestone's chosen scope
- Re-platforming away from Next.js or Supabase

## Context

This is a brownfield Next.js 15 App Router application backed by Supabase for auth, Postgres data, and storage. The current repo now has a shipped production-readiness milestone covering stronger client validation, shared notification delivery, digest and training-content administration, and durable audit logging for privileged admin actions. A codebase map exists in `.planning/codebase/` and remains the structural reference for future planning. The immediate next step is defining the next milestone with fresh requirements and a new roadmap.

## Current State

- Shipped milestone: `v1.0 Production Readiness` on 2026-03-03
- Completed scope: 4 phases, 10 plans, 23 documented tasks
- Operational baseline: `npm run lint` and `npm run build` pass, with only non-blocking existing warnings
- Recent architectural additions: shared email contract, digest workflow, admin-managed training videos, admin audit-event persistence, sanitized server logging

## Next Milestone Goals

- Turn deferred collaboration ideas into validated scope with explicit requirement IDs
- Decide whether the next milestone prioritizes engagement features, analytics, or campaign management
- Preserve the current server-action and server-component architecture while extending tenant-safe product features

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

---
*Last updated: 2026-03-03 after v1.0 milestone*
