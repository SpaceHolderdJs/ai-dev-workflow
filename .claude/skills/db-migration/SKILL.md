---
name: db-migration
description: Use when writing or changing a database schema migration (tables, views, grants, RLS policies, functions). Covers file naming, grants vs RLS, security_invoker views, rollback notes and the checks to run.
---

# Database migration

Schema is changed only through migration files reviewed in a PR. Never through
a dashboard table editor - that creates drift nobody can review or reproduce.

## Before writing

- Ask before running anything against a non-local database. Local stack only
  (`npx supabase start`) unless the human says otherwise.
- Read the latest few migrations to match naming and helper usage.

## Writing it

1. One concern per file: `supabase/migrations/<timestamp>_<snake_summary>.sql`.
2. Header comment: **why** this change exists, not what it does. If it fixes
   a bug, name the bug and how it showed up.
3. **Grants and RLS are both required.** RLS narrows what a `GRANT` already
   allows; it never substitutes for one. A missing grant shows up as
   "permission denied" and looks like a policy bug.
4. Policies read JWT claims through helpers, wrapped as a scalar subquery:
   `tenant_id = (select app.current_tenant_id())`. A bare call is evaluated
   per row; a policy that queries the table it protects can recurse.
5. Every view over tenant data is `with (security_invoker = true)`. Without it
   the view runs as its owner and bypasses RLS for every caller - and still
   passes every positive test.
6. Least privilege: grant the narrowest verb to the narrowest role. Say in the
   comment why each grant is needed.
7. State the rollback approach. Call out destructive steps (drop, type change,
   data rewrite) so they go in the PR description.

## After writing

- Apply on a fresh local stack (`npx supabase db reset`).
- Regenerate types (`supabase gen types typescript`). Never hand-edit them.
- Any policy/view change: run the `tenant-boundary-test` skill.
- `supabase migration list`: local and remote must agree. Drift is a bug.
