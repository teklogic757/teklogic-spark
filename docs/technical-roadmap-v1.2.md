# Technical Roadmap: v1.2 Internet Deployment Security Hardening

## Scope

This roadmap covers the remainder of the current milestone as of March 11, 2026. It is limited to:

- Phase 10: Repository And Secret Hygiene
- Phase 11: Public Surface And Privilege Hardening
- Phase 12: Go-Live Verification And Durable Limiter Closeout

This is an engineering roadmap, not a product expansion roadmap.

## Current State

### Already Completed In Code

- Phase 10 implementation work is complete
- repo hygiene checks are in place
- deploy env preflight checks are in place
- canonical site URL and env policy helpers are in place
- planning and verification artifacts have been updated

### Still Pending Verification

- clean deploy-like environment validation for Phase 10
- fresh-clone execution of the deploy workflow
- removal of local-only override values from production-like env usage

### Not Yet Started

- Phase 11 execution
- Phase 12 execution

## Phase 10: Repository And Secret Hygiene

### Status

Implemented in code, verification pending.

### What Was Added

- shared environment policy and canonical site URL handling
- repo hygiene audit command
- deploy env preflight command
- deployment workflow documentation

### What Still Needs To Happen

- remove `TEST_EMAIL_OVERRIDE` and `EMAIL_TO` from deploy-like env paths
- set a real HTTPS `NEXT_PUBLIC_SITE_URL`
- run `npm run build:deploy` from a clean or fresh clone
- close Phase 10 through verification rather than more implementation

### Exit Criteria

- Phase 10 verification changes from pending to resolved
- deploy gate passes under a production-like environment

## Phase 11: Public Surface And Privilege Hardening

### Goal

Reduce internet-facing risk by hardening session behavior, redirect safety, headers, and privileged access surfaces before public deployment.

### Planned Focus Areas

#### 1. Public-Surface Security Headers

Add and verify headers suitable for internet exposure, likely including:

- content security policy direction
- frame restrictions
- content type sniffing prevention
- referrer and related browser protections

#### 2. Auth, Redirect, And Session Safety

Harden:

- public auth callback flows
- login redirects
- host/origin handling under production deployment
- cookie/session assumptions for public internet exposure

#### 3. Privileged Surface Review

Constrain and document:

- admin routes
- service-role usage
- `createAdminClient()` boundaries
- places where least privilege is not yet fully achieved

### Expected Deliverables

- explicit security behavior in middleware or route layers
- reduced implicit trust in forwarded host / origin data
- documented privileged access map
- verification artifacts proving behavior under production-style routing assumptions

### Main Risk

Phase 11 can expose latent assumptions from internal/private usage, especially around redirects, cookies, and admin bypass patterns.

## Phase 12: Go-Live Verification And Durable Limiter Closeout

### Goal

Finish the release gate by proving the system can be operated safely in a real deployment environment and by closing the carried durable rate-limiter verification debt.

### Planned Focus Areas

#### 1. Go-Live Checklist

Create and execute a concrete checklist covering:

- environment setup
- secret management
- credential hygiene
- Vercel configuration
- final smoke testing

#### 2. Durable Limiter Runtime Verification

Close the open debt from Phase 8 by proving:

- restart behavior is correct
- multi-instance behavior is correct
- guest and workshop submission throttles remain enforced
- file-upload-adjacent submit limits remain durable

#### 3. Human Verification Of High-Risk Flows

Run final manual checks on:

- workshop join behavior
- guest submission behavior
- attachment-including submission behavior
- auth redirects and tenant routing

### Expected Deliverables

- go-live checklist document
- resolved runtime verification artifacts
- closed `RATE-01` and `RATE-02`
- milestone-ready deployment sign-off

## Recommended Engineering Order

1. Finish Phase 10 verification first.
2. Execute Phase 11 hardening with verification artifacts as part of the work, not after.
3. Execute Phase 12 as the final operational gate.

That order matters because Phase 12 depends on the security and deployment assumptions that Phase 10 and Phase 11 are meant to stabilize.

## What This Roadmap Explicitly Does Not Cover

This milestone does not prioritize:

- voting
- comments
- broader analytics
- campaign expansion beyond current contest support
- public launch marketing materials

Those are downstream of internet-safe deployment and operational trust.

## Summary

From this point forward, the team should think of v1.2 as a release-hardening milestone with three steps:

- verify the deploy hygiene already implemented
- harden the public-facing surface area
- prove the system is operationally ready to go live

The fastest way to lose time from here would be switching back to net-new product features before these gates are closed.
