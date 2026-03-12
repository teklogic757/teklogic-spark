# Deployment Security Checklist

This checklist is the minimum go-live baseline before exposing Teklogic Spark AI on the public internet or attaching the repo to a production Vercel project.

## Secrets

- Store production secrets only in Vercel project environment variables.
- Do not commit `.env`, `.env.local`, or any real credentials.
- Remove `TEST_EMAIL_OVERRIDE` from production before first deploy.
- Rotate the current `OPENAI_API_KEY` before go-live.
- Rotate the current `SUPABASE_SERVICE_ROLE_KEY` before go-live.
- Rotate any SMTP or Resend credentials before go-live.

## Auth And Data Access

- Review all `createAdminClient()` call sites and confirm each one is server-only and still required.
- Compare the current privileged surfaces to `docs/privileged-access.md` and resolve any undocumented usage before go-live.
- Verify tenant-boundary reads only return organization-scoped data for dashboard, leaderboard, prompts, training, and submit flows.
- Confirm Supabase RLS policies match the current application access model.
- Replace any remaining default or weak test-user passwords before production use.

## Application Runtime

- Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS production URL.
- Confirm production starts without `TEST_EMAIL_OVERRIDE`.
- Confirm rate limiting is durable before opening public routes to the internet.
- Keep verbose debug logging disabled on production paths.
- Confirm cookies, redirects, and auth callbacks use the correct production domain.

## Vercel Setup

- Create separate `Production` and `Preview` environment-variable sets in Vercel.
- Restrict production secrets to the `Production` environment only.
- Verify preview deployments do not send live customer emails.
- Set the canonical production domain before enabling user-facing email links.
- Run a clean build from the remote repository, not from local cached artifacts.

## Final Verification

- Run `npm run lint`.
- Run the test suite once Phase 9 lands.
- Smoke-test login, dashboard, submit, leaderboard, admin, and auth callback flows against production-like environment variables.
- Confirm no local-only folders or generated artifacts are present in the Git diff before pushing.
