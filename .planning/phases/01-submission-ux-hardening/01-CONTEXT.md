# Phase 1: Submission UX Hardening - Context

**Gathered:** 2026-03-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Improve the existing submission and admin form experience so users get clearer file validation before submit and more predictable async feedback during form actions. This phase clarifies interaction behavior within the current forms; it does not add new product capabilities.

</domain>

<decisions>
## Implementation Decisions

### File upload experience
- Invalid attachments should be rejected immediately after file selection, before the user submits the form.
- The upload field should show a compact checklist of file rules that updates with the selected file state.
- A valid attachment should appear as a small selected-file card showing filename, size, and remove or replace actions.
- File rejection should appear both inline under the file field and in the top form-level error area.

### Pending and success states
- While a form action is running, inputs should remain editable, but duplicate submits must be prevented.
- Pending feedback should stay lightweight: button-level loading treatment only, without a full-form overlay.
- For non-redirecting admin actions, success feedback should remain as small inline confirmation near the action area.
- For redirecting submit flows, show a short processing message alongside the existing button spinner before navigation completes.

### Claude's Discretion
- The exact visual styling of the selected-file card, checklist presentation, and inline status text.
- The specific copy for file validation messages and the pre-redirect processing message.
- Whether duplicate-submit prevention is implemented by disabling only the action button or by deduplicating repeated submissions in a similar lightweight way.

</decisions>

<specifics>
## Specific Ideas

- Keep the pending state restrained rather than introducing a full-page loading treatment.
- File upload guidance should feel more explicit than the current helper copy, but still compact.
- Error visibility should favor clarity over minimalism for attachment problems by showing the issue both near the field and at the form level.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/submit-idea-form.tsx`: Primary desktop submit form already contains the attachment field, helper copy, top-level error area, and pending button state.
- `src/app/[client_id]/m/submit/page.tsx`: Mobile submit flow also uses `useActionState`, so the same pending/error behavior should likely be mirrored there.
- `src/components/ui/input.tsx`, `src/components/ui/textarea.tsx`, `src/components/ui/button.tsx`, and `src/components/ui/card.tsx`: Existing UI primitives should be reused for any new inline validation and selected-file presentation.

### Established Patterns
- Forms use `useActionState` and surface server errors from `state?.error`.
- Current pending states are lightweight and button-centric across submit, invite, org, user, join, and profile forms.
- Tailwind utility classes and existing card-based layout patterns are already established for form UI.

### Integration Points
- `src/components/submit-idea-form.tsx` is the main integration point for file upload and submit-state changes.
- `src/app/[client_id]/submit/actions.ts` remains the server-side source of truth for file validation and should stay aligned with any client checks.
- `src/app/admin/organizations/org-form.tsx`, `src/app/admin/users/user-form.tsx`, and `src/app/admin/invites/invite-form.tsx` are the admin-side targets for consistent async feedback behavior.

</code_context>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope.

</deferred>

---
*Phase: 01-submission-ux-hardening*
*Context gathered: 2026-03-03*
