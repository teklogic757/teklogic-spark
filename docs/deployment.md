# Deployment Workflow

This document defines the Phase 10 deploy-readiness contract for Teklogic Spark AI.

## Goal

A deployment is only considered ready when:

- the repository does not track secrets or local-only artifacts
- production env values are present and safe
- the same checks can run locally, in CI, or as a Vercel build command

## Required Environment Variables

These must exist before a production build or deployment:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SITE_URL`

`NEXT_PUBLIC_SITE_URL` must:

- be a valid absolute URL
- use `https`
- not point to `localhost`, `127.0.0.1`, or another local host alias

## Local-Only Overrides

These values are for development and testing only:

- `TEST_EMAIL_OVERRIDE`
- `EMAIL_TO`

Do not set them in Vercel, CI, or any production-like environment. The deploy preflight rejects them.

## Repo Hygiene Boundary

The repository must never track these paths:

- `.env`
- `.env.local`
- `.vercel/`
- `.next/`
- `next-build/`
- `coverage/`
- `node_modules/`
- `.claude/`
- `.codex/`

Tracked-file safety is enforced with:

```bash
npm run check:repo-hygiene
```

That command also checks that the core `.gitignore` rules still exist and that any local-only artifacts present in the current clone are actually ignored.

## Deploy Preflight

Run the production env gate with:

```bash
npm run check:deploy-env
```

This command validates:

- required production env vars are set
- `NEXT_PUBLIC_SITE_URL` is safe for a public deployment
- local-only email override env vars are not enabled
- notification provider configuration is coherent enough to understand the runtime surface

## Recommended Order

From a clean or nearly clean working tree:

```bash
npm run check:repo-hygiene
npm run check:deploy-env
npm run test:ci
npm run build
```

If you want one command for the deploy gate:

```bash
npm run build:deploy
```

That command runs repo hygiene, deploy env validation, then `next build`.

## Vercel And CI Usage

Recommended Vercel build command:

```bash
npm run build:deploy
```

Recommended CI sequence:

```bash
npm ci
npm run check:repo-hygiene
npm run check:deploy-env
npm run test:ci
npm run build
```

## Fresh Clone Setup

1. Clone the repository.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` for local development only.
4. Fill in the required secrets locally or in your hosted environment manager.
5. Run the repo and deploy checks before the first production-style build.

## Notes

- Runtime code no longer reads `NEXT_PUBLIC_URL`; use `NEXT_PUBLIC_SITE_URL`.
- Local helper scripts may still use `.env.local`, but deploy validation reads the active environment and treats production rules as authoritative.
- Phase 11 will extend this with broader public-surface hardening, but Phase 10 stops at deployment readiness and secret hygiene.
- For the hosted operator flow, including Preview-first staging on Vercel, see [vercel-deploy.md](/c:/Users/justi/Dropbox/antigravity/Teklogic_Project1/teklogic-ideas/docs/vercel-deploy.md).
