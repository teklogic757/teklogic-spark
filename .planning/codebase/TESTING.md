# Testing

## Current State

- There are no visible automated test files in the repository tree (`*.test.*`, `*.spec.*`, or `__tests__` were not found).
- `package.json` does not define a `test` script.
- The only built-in quality gate exposed through scripts is `npm run lint`.

## Existing Validation Practices

- Input validation is covered by runtime Zod schemas in `src/lib/validators.ts`.
- Prompt hardening is implemented in `src/lib/prompt-sanitizer.ts`.
- Rate limiting logic is encapsulated in `src/lib/rate-limiter.ts`.
- These utilities are structured in a way that would be straightforward to unit test, but no current harness is present.

## Manual And Operational Verification

- The repo includes multiple utility scripts under `src/scripts/` and `scripts/` for manual environment checks and database setup.
- Documentation in `docs/SETUP.md`, `docs/ENVIRONMENT.md`, and `README.md` likely supports manual QA and local setup.
- The current workflow appears to rely on local dev verification plus database inspection rather than CI-backed automated tests.

## Highest-Value Missing Coverage

- `src/app/[client_id]/submit/actions.ts` needs integration coverage because it combines auth, validation, OpenAI calls, storage, database writes, points, and email side effects.
- `src/app/admin/actions.ts` needs permission and regression coverage because it performs privileged data mutations.
- `src/app/login/actions.ts` and `middleware.ts` need auth-routing coverage to prevent redirect regressions.
- `src/lib/ai-evaluator.ts` needs mocked OpenAI contract tests for JSON shape handling and failure paths.
- `src/lib/email.ts` needs provider-selection and credential-failure tests.

## Practical Next Test Setup

- Add a unit/integration runner such as Vitest for library and server-action tests.
- Start by extracting smaller pure functions from large action files where possible.
- Mock Supabase and OpenAI at module boundaries instead of relying on live services.
- Treat linting as insufficient for this codebase because most risk is behavioral, not stylistic.
