# Phase 10: Repository And Secret Hygiene - Context

**Gathered:** 2026-03-11
**Status:** Ready for planning
**Source:** Direct `gsd-plan-phase` fallback without prior `gsd-discuss-phase`

<domain>
## Phase Boundary

Phase 10 hardens deployment readiness before public internet rollout.

In scope:
- production-safe environment variable handling
- canonical site URL and local-override policy for runtime code
- repository hygiene for secrets, caches, generated artifacts, and local agent tooling
- explicit CI/Vercel-oriented deployment preflight checks

Out of scope:
- broader public-surface security headers and cookie behavior beyond what is needed to remove local-only env fallback assumptions
- admin/service-role privilege redesign reserved for Phase 11
- final go-live checklist and durable limiter runtime closure reserved for Phase 12

</domain>

<decisions>
## Implementation Decisions

### Locked Decisions
- Use the roadmap and requirements as the source of truth for `DSEC-01` and `DSEC-02`.
- Preserve local maintenance script ergonomics on Windows, but keep `.env.local` behavior explicitly scoped to local scripts rather than production app/runtime code.
- Reuse existing repo tooling (`npm`, Vitest, ESLint, Next build) instead of introducing a new build system.
- Keep this phase Vercel/CI oriented and avoid pulling Phase 11 public-surface security work forward.

### Claude's Discretion
- Exact helper/module names for canonical env and site URL handling.
- Whether repo hygiene checks live in `scripts/` or `src/scripts/`, as long as the final npm entrypoints are PowerShell-safe.
- Exact documentation split between `README.md` and dedicated deployment docs.

</decisions>

<specifics>
## Specific Ideas

- Remove remaining `NEXT_PUBLIC_URL` usage in runtime code and standardize on a single canonical public URL contract.
- Add scriptable checks for tracked `.env`, `.env.local`, `.vercel`, local agent folders, and build caches.
- Add an explicit deploy preflight command that validates production env readiness before build/deploy.

</specifics>

<deferred>
## Deferred Ideas

- Security headers, cookie tightening, and broader safe-host enforcement beyond Phase 10 env-boundary cleanup.
- Admin/service-role minimization and privilege-surface documentation beyond what is required to keep deployment-safe boundaries clear.
- Final go-live credential rotation, smoke tests, and durable limiter runtime closure.

</deferred>

---

*Phase: 10-repository-and-secret-hygiene*
*Context gathered: 2026-03-11 via plan fallback*
