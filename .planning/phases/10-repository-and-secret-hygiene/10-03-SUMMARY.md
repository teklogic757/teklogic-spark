---
phase: 10-repository-and-secret-hygiene
plan: "03"
subsystem: deploy-preflight
tags: [deployment, vercel, ci, env]
requires: [10-01, 10-02]
provides:
  - Explicit deploy env preflight command
  - Combined build:deploy gate for repo hygiene plus env validation
  - Operator-facing deployment workflow documentation
affects: [phase-10-deploy-gate, operator-workflow]
tech-stack:
  added: [deploy env script]
  patterns: [preflight validation, deploy checklist]
key-files:
  created:
    - scripts/check-deploy-env.mjs
    - docs/deployment.md
  modified:
    - package.json
    - README.md
    - src/lib/env-validator.ts
key-decisions:
  - "Deploy preflight should validate production-style env from the active shell instead of reading local .env files directly."
  - "Vercel/CI can use npm run build:deploy as the single operator entrypoint."
patterns-established:
  - "Deployment gates are explicit commands rather than implicit build-time surprises."
requirements-completed: [DSEC-01, DSEC-02]
duration: 18 min
completed: 2026-03-11
---

# Phase 10 Plan 03: repository-and-secret-hygiene Summary

**Deployment readiness now has an explicit preflight command and operator workflow instead of relying on implicit build failures or tribal knowledge.**

## Accomplishments

- Added `scripts/check-deploy-env.mjs` to validate required production env vars and block local-only overrides.
- Added `npm run check:deploy-env` and `npm run build:deploy` for CI/Vercel-oriented deploy flows.
- Wrote `docs/deployment.md` to connect repo hygiene, env validation, test/build order, and Vercel usage into one workflow.
- Verified the deploy preflight passes when provided a production-safe shell env and fails loudly against the current unsafe local env setup.

## Task Commits

No task-specific commit hashes recorded. The repository already had unrelated in-progress changes, so execution was left uncommitted.

## Issues Encountered

- The current local `.env` state still fails the new production contract, so `npm run build` remains blocked until those local overrides are removed or moved out of deploy-like builds.
