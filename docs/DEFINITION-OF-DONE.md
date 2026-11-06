# Definition of Done

One bar for every merged change, whoever or whatever wrote it.

## Per change

A PR is done when all of these are true:

1. **CI is green.** Lint, types, knip, unit tests, coverage thresholds,
   mutation threshold, secret scan. A red check is never merged with an
   explanation attached; it is fixed or the PR waits.
2. **Changed behaviour has a test, and that test has been seen to fail.**
3. **Tenant-boundary changes have a negative test** that fails when the
   protection is removed (see below).
4. **Schema changes ship as migrations**, with the rollback approach stated and
   destructive steps called out in the PR description.
5. **Docs move in the same PR**, not a follow-up.
6. **No secrets in the diff.**
7. **AI review comments are answered.** Fixed, or replied to with a reason.
   Never resolved silently.
8. **The PR description only claims what was verified.** If something was not
   run (no real database, no credentials), the description says so.

## What counts as tenant-boundary relevant

- Any access policy or scope filter, including edits to an existing one
- Any new table, view or endpoint that exposes tenant-scoped data
- Claim parsing, or anything that changes what a session's claims contain
- Anything that resolves an input (a file, a source, a payload) to a `tenantId`
- Any view definition: a missing `security_invoker = true` bypasses RLS for
  every caller and still passes every positive test

## Standing exceptions

None by default. If a change genuinely cannot meet the bar, the exception is
written into the PR description, so it is a recorded decision rather than an
erosion of the bar.
