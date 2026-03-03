# Integrations

## Supabase

- Supabase is the central integration for database, auth, and storage.
- Browser and server clients are defined in `src/lib/supabase/client.ts` and `src/lib/supabase/server.ts`.
- `createClient()` uses session cookies and respects RLS.
- `createAdminClient()` uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS for privileged reads and writes.
- `middleware.ts` refreshes the current user session on each request.
- Server actions query tables such as `organizations`, `users`, `ideas`, `invitations`, and `workshop_access_codes`.
- File uploads use Supabase Storage bucket `idea-attachments` in `src/app/[client_id]/submit/actions.ts`.

## OpenAI

- Idea scoring runs through `evaluateIdea()` in `src/lib/ai-evaluator.ts`.
- The evaluator uses `openai.chat.completions.create()` with `gpt-4o-mini`.
- Voice transcript structuring uses `extractIdeaFromTranscript()` in `src/lib/ai-evaluator.ts`.
- The voice API route `src/app/api/voice/transcribe/route.ts` calls `openai.audio.transcriptions.create()` with `whisper-1`.
- Prompt-injection hardening is implemented in `src/lib/prompt-sanitizer.ts`.

## Email Providers

- `src/lib/email.ts` abstracts notifications behind `sendEmail()`.
- SMTP is the default provider using `nodemailer`.
- Resend is supported through dynamic import when `NOTIFICATION_PROVIDER=resend`.
- The app sends evaluation emails, welcome emails, guest welcome emails, and admin notifications.
- `TEST_EMAIL_OVERRIDE` or `EMAIL_TO` can redirect outbound email in non-production flows.

## Internal Data And Assets

- Prompt content is loaded from `public/data/prompts.json`.
- Training/resource content is defined in `src/data/training-videos.ts`.
- The leaderboard is partly supported by Supabase SQL in `supabase/migrations/20250204_create_user_leaderboard_view.sql`.

## Operational Dependencies

- SQL schema and migration helpers exist in `schema_dump.sql`, `schema_check.sql`, and multiple files in `src/scripts/`.
- Admin and setup utilities include `src/scripts/setup_storage.ts`, `src/scripts/seed_demo_data.ts`, and `scripts/apply_migration_leaderboard.ts`.

## Integration Risks

- The service role key is used broadly enough that incorrect call sites could bypass intended RLS protections.
- Email integration falls back to logging when credentials are missing, so delivery failures can be silent to end users.
- OpenAI calls are synchronous inside submission flows, so latency or API failure directly affects user submissions.
