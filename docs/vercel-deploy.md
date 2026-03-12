# Vercel Deployment Checklist

This guide is the operator workflow for hosting Teklogic Spark AI on Vercel without treating Preview like final Production.

## Goal

- Stage the app on Vercel Preview instead of your laptop
- Keep email delivery safely redirected during staging
- Promote to Production later on `https://spark.teklogic.net`

## Environment Model

This project now supports:

- `Preview` for staged testing on a Vercel preview URL
- `Production` for the final public hostname

Runtime behavior is intentionally different:

- `Preview` may use `TEST_EMAIL_OVERRIDE` and `EMAIL_TO`
- `Production` must not use those override variables
- `Production` must define `NEXT_PUBLIC_SITE_URL`

## Preview Environment Variables

Set these in Vercel under the `Preview` environment:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=

NOTIFICATION_PROVIDER=smtp
EMAIL_USER=
EMAIL_PASSWORD=
# or:
# NOTIFICATION_PROVIDER=resend
# RESEND_API_KEY=

TEST_EMAIL_OVERRIDE=justin@teklogic.net
EMAIL_TO=

ADMIN_NOTIFICATION_EMAIL=justin@teklogic.net
```

Notes:

- `NEXT_PUBLIC_SITE_URL` is optional in `Preview`
- if `NEXT_PUBLIC_SITE_URL` is omitted, runtime falls back to the Vercel preview hostname
- keep `TEST_EMAIL_OVERRIDE` enabled in Preview so all staged email flows route to one inbox

## Production Environment Variables

Set these in Vercel under the `Production` environment:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=

NEXT_PUBLIC_SITE_URL=https://spark.teklogic.net

NOTIFICATION_PROVIDER=smtp
EMAIL_USER=
EMAIL_PASSWORD=
# or:
# NOTIFICATION_PROVIDER=resend
# RESEND_API_KEY=

ADMIN_NOTIFICATION_EMAIL=justin@teklogic.net
```

Do not set these in `Production`:

```env
TEST_EMAIL_OVERRIDE
EMAIL_TO
```

## First Preview Deployment

1. Import the repository into Vercel.
2. Add the `Preview` environment variables.
3. Trigger a deployment.
4. Open the generated `*.vercel.app` preview URL.
5. Verify the app loads, authentication works, and emails are redirected to `TEST_EMAIL_OVERRIDE`.

## Preview Verification Checklist

Run these checks on the preview deployment:

- Global login with password works
- Magic-link login works
- Auth callback redirects land on safe in-app destinations
- Tenant dashboard loads correctly
- Submit flow works
- Admin routes work for a super admin
- `/admin` hard-denies authenticated non-admin users
- Emails route only to `TEST_EMAIL_OVERRIDE`

## Domain Setup For Production

The intended public hostname is:

```text
spark.teklogic.net
```

That is a subdomain, not an apex domain. In most Vercel-managed setups, Vercel will ask for a `CNAME`, not an `A` record.

Recommended sequence:

1. Add `spark.teklogic.net` to the Vercel project.
2. Run:

```powershell
vercel domains add spark.teklogic.net
vercel domains inspect spark.teklogic.net
```

3. Create exactly the DNS record Vercel tells you to create.
4. Wait for verification in Vercel.
5. Add `NEXT_PUBLIC_SITE_URL=https://spark.teklogic.net` to the `Production` environment.
6. Deploy Production.

Do not guess the DNS target or IP. Use the exact record shown by Vercel for the project at deploy time.

## Production Cutover Checklist

Before deploying Production:

- `spark.teklogic.net` is verified in Vercel
- `NEXT_PUBLIC_SITE_URL=https://spark.teklogic.net` is set in Production
- `TEST_EMAIL_OVERRIDE` is absent from Production
- `EMAIL_TO` is absent from Production
- production mail credentials are configured
- Supabase credentials are confirmed
- a final Preview smoke test has passed

Then deploy:

```powershell
vercel --prod
```

## CLI Workflow

Initial setup:

```powershell
npm i -g vercel
vercel login
vercel link
vercel
```

Production deploy:

```powershell
vercel --prod
```

## Repo Validation Commands

Before a production cutover, run:

```powershell
npm run check:repo-hygiene
npm run check:deploy-env
npm run test:ci
npm run build:deploy
```

`npm run check:deploy-env` is intentionally strict. It is a production-readiness gate, not a Preview-staging gate.

## Common Mistakes

- Setting `TEST_EMAIL_OVERRIDE` in Production
- Treating `spark.teklogic.net` like an apex domain and planning for an `A` record by default
- Setting `NEXT_PUBLIC_SITE_URL` to a hostname that is not live yet
- Assuming Preview and Production should share the same email behavior
- Using local `.env.local` values as the source of truth for hosted Vercel configuration

## Related Docs

- [deployment.md](/c:/Users/justi/Dropbox/antigravity/Teklogic_Project1/teklogic-ideas/docs/deployment.md)
- [DEPLOYMENT_SECURITY_CHECKLIST.md](/c:/Users/justi/Dropbox/antigravity/Teklogic_Project1/teklogic-ideas/docs/DEPLOYMENT_SECURITY_CHECKLIST.md)
- [SETUP.md](/c:/Users/justi/Dropbox/antigravity/Teklogic_Project1/teklogic-ideas/docs/SETUP.md)
