# Phase 10: Repository And Secret Hygiene - Research

**Researched:** 2026-03-11
**Status:** Ready for planning
**Source:** Roadmap, requirements, state, and repository inspection

## Objective

Answer the planning question for Phase 10: what must change so Teklogic Spark AI can be deployed to a public environment without depending on local-only secrets, accidental repo artifacts, or implicit operator knowledge.

## Current Implementation Snapshot

### Environment loading and deployment boundary

- `src/lib/env-validator.ts` validates required server env vars and production safety rules, but it runs on module load and still mixes "warn in dev" with "block in prod" behavior that is not yet exposed as a dedicated deployment preflight entrypoint.
- Production-sensitive URL usage is inconsistent:
  - `src/lib/email.ts` mostly prefers `NEXT_PUBLIC_SITE_URL`, but also falls back to `NEXT_PUBLIC_URL` and `http://localhost:3000`.
  - `src/app/admin/workshops/page.tsx` still uses `NEXT_PUBLIC_URL || 'http://localhost:3000'`.
  - `src/app/auth/callback/route.ts` builds redirects from request origin and forwarded host rather than a canonical site helper.
- Local helper scripts under `src/scripts/` explicitly load `.env.local` through `dotenv.config(...)`. That is acceptable for local maintenance scripts, but the repo currently has no clear boundary between "local-only script behavior" and "production application behavior."

### Repository hygiene

- `.gitignore` already excludes `.env*` except `.env.example`, `.next`, `next-build`, `.next_old_v2`, `.claude`, `.codex`, and Supabase temp state.
- The working tree still contains local-only files and directories at the repo root, including `.env`, `.env.local`, `.next`, and `next-build`. They are not tracked today, but Phase 10 should harden the repo so clean-clone safety is explicit rather than assumed.
- `git ls-files` confirms only `.env.example` and `.gitignore` are tracked among the most obvious secret/hygiene paths, which is good, but there is no automated guard that fails fast if unsafe files are introduced later.

### Build and CI/Vercel readiness

- `package.json` only exposes `dev`, `build`, `start`, `lint`, and test scripts. There is no dedicated preflight command for "deployment-safe build."
- The current state file notes that `npm run build` reaches an env-policy guard only after compile and type-check. That means deployment correctness is partially enforced, but there is still no explicit contract for CI/Vercel to run before or during build.

## Gaps Against Phase Requirements

### DSEC-01: Production deployments load secrets from managed environment variables only

- The codebase lacks a single canonical helper for site URL and production env access, so different code paths can make different assumptions about local fallbacks.
- Application code still contains localhost fallbacks in paths that eventually matter for public deployment.
- The repository documents `.env.example`, but there is no dedicated build/preflight command that operators can run to prove production env readiness before deployment starts.

### DSEC-02: The repository excludes secrets, local caches, generated artifacts, and local agent tooling

- Ignore rules exist, but there is no automated hygiene check in scripts or CI-facing commands.
- Repo safety currently depends on remembering the ignore list and inspecting status manually.
- Local script tooling and generated state are separated by convention, not by a deployment-oriented verification step.

## Constraints And Practical Decisions

- Phase 10 should not broaden into Phase 11 security header or auth-flow hardening, except where canonical host/origin handling is required to remove local-only fallback behavior.
- Local maintenance scripts may continue to support `.env.local`, but that support must be explicitly scoped to local tooling rather than production app/runtime code.
- The repo already has Vitest, ESLint, and Next build checks, so Phase 10 should reuse those commands and add a focused deployment preflight instead of inventing a new toolchain.
- The project is Windows-first, so repo/deploy checks need PowerShell-safe npm script entrypoints.

## Recommended Technical Shape

### 1. Separate runtime env policy from local script convenience

Create one canonical server-side environment/access layer for production-sensitive values:

- canonical site URL
- production-vs-local detection
- explicit handling of test-only env vars such as `TEST_EMAIL_OVERRIDE`

Application code should use that helper instead of ad hoc `process.env` fallbacks.

### 2. Treat repo hygiene as an enforceable contract

Add a lightweight repo-hygiene check that validates:

- tracked files do not include `.env`, `.env.local`, `.vercel`, local agent folders, caches, or other local-only artifacts
- ignore patterns cover the high-risk local paths the team actually generates on Windows

This should be scriptable from `npm` so it can be reused locally and in CI.

### 3. Add a deployment preflight entrypoint

Introduce a command that validates required env vars and production safety assumptions before `next build` is used for Vercel or CI. This should be the contract Phase 10 leaves behind for deployment readiness.

## Validation Architecture

Phase 10 can use the existing validation stack with one deployment-focused addition:

- Quick feedback after each task: `npm run lint`
- Repo hygiene feedback: a new scriptable check such as `npm run check:repo-hygiene`
- Full smoke check after each plan wave: `npm run test:ci && npm run build`
- Manual verification:
  - confirm a clean clone does not require deleting local artifacts to run install/build
  - confirm production mode rejects `TEST_EMAIL_OVERRIDE` and invalid/missing canonical site URL
  - confirm local scripts still work from `.env.local` without leaking that behavior into application runtime

## Files Most Likely To Change

- `src/lib/env-validator.ts`
- `src/lib/email.ts`
- `src/app/admin/workshops/page.tsx`
- `src/app/auth/callback/route.ts`
- `package.json`
- `.gitignore`
- `.env.example`
- `README.md` or deployment-facing docs
- new repo/deployment helper scripts under `scripts/` or `src/scripts/`

## Planning Notes

- Split the phase into:
  - application/runtime environment boundary cleanup
  - repository hygiene enforcement
  - deployment preflight and documentation
- Keep the plans concrete and Vercel-oriented without prematurely implementing the public-surface security work reserved for Phase 11.

---

*Phase: 10-repository-and-secret-hygiene*
*Research completed: 2026-03-11*
