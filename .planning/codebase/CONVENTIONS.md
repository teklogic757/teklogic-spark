# Conventions

## Language And Style

- The codebase is TypeScript-first across routes, libraries, and scripts.
- Import aliases use `@/` consistently for in-repo modules.
- Single quotes are the dominant string style in application code.
- Semicolon usage is light and generally omitted.
- Comments are used heavily around operational context, debugging history, and security rationale.

## Framework Conventions

- Server actions are declared with `'use server'` at the top of action files.
- App Router file conventions are followed consistently (`page.tsx`, `layout.tsx`, `route.ts`).
- Server components perform direct async data fetching, for example in `src/app/[client_id]/dashboard/page.tsx`.
- Client components appear to be reserved for interaction-heavy UI and form behavior.

## Validation And Safety

- Zod schemas in `src/lib/validators.ts` are the main input validation layer.
- Helpers return `{ success, data }` or `{ success, error }` style objects instead of throwing on expected validation failures.
- Rate limiting uses `rateLimitAction()` and returns structured error payloads.
- Prompt input is sanitized before OpenAI usage in `src/lib/prompt-sanitizer.ts`.

## Data Access Patterns

- Supabase queries are written inline at call sites rather than through a shared query layer.
- Type assertions with `as any` and ad hoc casts are used when Supabase type inference becomes cumbersome.
- `createClient()` is the default access path, while `createAdminClient()` is explicitly called out for privileged operations.
- Storage access is treated as an admin concern and routed through the admin client.

## UX And Behavior

- Redirect-driven workflows are common after mutations (`redirect()` after login, submit, and admin changes).
- Cache refresh is done selectively with `revalidatePath()`.
- The UI uses Tailwind utility classes directly in JSX, often with a glassmorphism-influenced visual style.

## Convention Gaps

- There is no visible shared error-handling abstraction for server actions.
- Debug `console.log` statements are common in production code paths such as `src/app/[client_id]/submit/actions.ts`.
- Large files blend validation, data access, business rules, and side effects, so boundaries are pragmatic rather than strict.
