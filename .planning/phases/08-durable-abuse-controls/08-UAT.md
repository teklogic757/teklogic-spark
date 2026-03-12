---
status: testing
phase: 08-durable-abuse-controls
source:
  - 08-01-SUMMARY.md
  - 08-02-SUMMARY.md
  - 08-03-SUMMARY.md
started: 2026-03-04T09:10:23Z
updated: 2026-03-04T09:18:30Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

number: 1
name: Cold Start Smoke Test
expected: |
  Apply `supabase/migrations/20260304_add_durable_rate_limits.sql` to the active Supabase environment, restart the app from a cold state, and confirm the application boots without startup errors. The new `consume_rate_limit` function and `rate_limit_buckets` table should exist, and a primary route such as the homepage or login page should load normally after startup.
awaiting: retry after fix

## Tests

### 1. Cold Start Smoke Test
expected: Apply `supabase/migrations/20260304_add_durable_rate_limits.sql` to the active Supabase environment, restart the app from a cold state, and confirm the application boots without startup errors. The new `consume_rate_limit` function and `rate_limit_buckets` table should exist, and a primary route such as the homepage or login page should load normally after startup.
result: issue
reported: "GET /teklogic/prompts returned 500 with missing `./vendor-chunks/tailwind-merge.js`, missing `.next/routes-manifest.json`, and `UNKNOWN` open errors for `.next/server/pages-manifest.json` during `npm run dev`."
severity: blocker

### 2. Durable Bucket Survives Restart
expected: Exhaust one limiter bucket, restart the dev server, and confirm the next request is still throttled until the stored window expires instead of silently resetting after restart.
result: pending

### 3. Durable Bucket Is Shared Across Instances
expected: Trigger a throttled path from one running app instance, then repeat that same path from a second app instance or a restarted instance and confirm the request is still throttled because both instances share the same stored limiter state.
result: pending

### 4. Workshop Join Throttles Brute Force Attempts
expected: Repeated invalid workshop join attempts should eventually return the rate-limit error before code validation. After the limiter window resets, a valid workshop code should still set the workshop cookie and redirect into the submit flow.
result: pending

### 5. Guest Submit And Attachment Path Throttle Early
expected: Repeated workshop guest submissions, including one with an attachment, should eventually be blocked by the new durable limiter before AI evaluation and upload-heavy work continue when the request budget is exhausted.
result: pending

## Summary

total: 5
passed: 0
issues: 1
pending: 4
skipped: 0

## Gaps

- truth: "The app starts from a cold state and serves routes without manifest or vendor-chunk file errors."
  status: failed
  reason: "User reported: GET /teklogic/prompts returned 500 with missing `./vendor-chunks/tailwind-merge.js`, missing `.next/routes-manifest.json`, and `UNKNOWN` open errors for `.next/server/pages-manifest.json` during `npm run dev`."
  severity: blocker
  test: 1
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""
