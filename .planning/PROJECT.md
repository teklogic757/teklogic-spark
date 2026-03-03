# Teklogic Spark AI

## What This Is

Teklogic Spark AI is a multi-tenant web app that turns AI workshop momentum into a repeatable internal idea pipeline. Employees and workshop guests can submit automation ideas, get AI-assisted scoring and reframing, and participate in contests, leaderboards, and organization-specific experiences while admins manage tenant setup and content.

## Core Value

Organizations can reliably capture, score, and act on company-specific AI ideas in a way that keeps employees engaged after the workshop ends.

## Requirements

### Validated

- ✓ Users can authenticate and reach the correct organization dashboard through global and tenant-aware login flows — existing
- ✓ Employees and workshop guests can submit structured ideas with optional attachments and receive AI scoring data stored in Supabase — existing
- ✓ Super admins can manage organizations, users, invites, workshops, and organization settings from the admin area — existing
- ✓ The product already includes leaderboard, prompt-library, learning-resource, and contest experiences in the current UI — existing

### Active

- [ ] Make outbound notifications production-ready and reliable across welcome, evaluation, admin, and digest flows
- [ ] Improve submission and admin UX with stronger frontend validation, clearer loading states, and lower-friction content management
- [ ] Add auditability and cleanup for sensitive admin and production-facing flows
- [ ] Package the current platform into a clear, phase-driven production-readiness milestone

### Out of Scope

- Native mobile apps — the current product is web-first and already has mobile-specific web routes
- Major new social features (comments, discussion boards, collaboration) — these are future roadmap items, not part of the immediate hardening milestone
- Re-platforming away from Next.js or Supabase — current architecture is already established and should be improved in place

## Context

This is a brownfield Next.js 15 App Router application backed by Supabase for auth, Postgres data, and storage. The current repo already contains a functioning product with multi-tenant routing, AI evaluation, email abstractions, prompt and training resources, and admin workflows. A codebase map has been created in `.planning/codebase/` and should be treated as the structural reference for future planning. The root `ROADMAP.md`, `README.md`, and `AGENTS.md` indicate the current business focus is moving from MVP functionality to production readiness, especially notifications, leaderboard polish, admin enhancements, and operational safety.

## Constraints

- **Tech stack**: Next.js 15, React 19, TypeScript, Supabase, and Tailwind are already in place — preserve the existing platform and patterns instead of re-architecting
- **Environment**: Windows/PowerShell is the primary development environment — avoid workflows that depend on fragile shell piping or Linux-only assumptions
- **Security**: `createAdminClient()` bypasses RLS and must stay tightly scoped — privileged operations need explicit justification and auditability
- **Operational scale**: Expected load remains modest (<10 concurrent users per project docs) — optimize for reliability and maintainability before distributed scale concerns
- **External dependencies**: OpenAI and email providers are in the critical path for key user flows — failures must degrade safely without losing ideas

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Treat this as a brownfield initialization | The repo already contains a working product and a fresh codebase map | ✓ Good |
| Use current documented priorities as the active planning scope | `ROADMAP.md` and `README.md` already define the next production-ready push | ✓ Good |
| Track `.planning/` in git | Planning artifacts should persist with the repository and support future GSD steps | ✓ Good |
| Skip separate domain research for this initialization | The current codebase, docs, and roadmap already provide enough local context to define the next milestone | — Pending |

---
*Last updated: 2026-03-03 after initialization*
