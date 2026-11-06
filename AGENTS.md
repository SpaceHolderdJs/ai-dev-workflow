# Agent rules

These rules are read by every coding agent working in this repo (Claude Code
loads them via `CLAUDE.md`; Codex, Cursor and Copilot read `AGENTS.md`
directly). They are short on purpose. The tools enforce most of them; this
file says why, so the agent can follow the intent where a tool has nothing
to say.

## How to work

1. **Plan before you edit.** For anything more than a one-file change, state
   the plan in a few lines: files you will touch, the test that will prove it,
   and what you will *not* change. Wait for a go-ahead if the plan touches a
   tenant boundary, a migration, CI, or a dependency.
2. **Write the failing test first** for every bug fix. If you cannot make it
   fail before the fix, you have not reproduced the bug yet.
3. **Run the gate yourself before saying "done":**
   `npm run lint && npm run check:types && npm run check:deps && npm test`.
   Paste the summary line of each, not a paraphrase.
4. **Report what you verified separately from what you assume.** "Tests pass"
   is a claim; "`npm test`: 14 passed, 0 failed" is evidence. If you did not
   run something, say so.
5. **Stop and ask** when the task and the code disagree, when a fix needs a
   rule below to be broken, or when you would have to guess a business rule.

## What you may do without asking

- Read any file except `.env.local` and anything under `secrets/`.
- Edit files under `src/`, `tests/`, `docs/` for the task in hand.
- Run lint, typecheck, knip, unit tests, mutation tests, and the dev server.
- Use `git status`, `git diff`, `git log`, `git show`, create a topic branch.

## What you must ask for first

- `git commit`, `git push`, opening or merging a PR. A human commits.
- `npm install` / adding, removing or upgrading a dependency.
- Any change to `.github/`, `lefthook.yml`, `eslint.config.mjs`,
  `knip.config.ts`, `tsconfig.json`, or this file.
- Any database migration, and anything that runs against a non-local database.
- Deleting files outside the scope of the task.

## What you never do

- `--no-verify`, `git push --force`, `git reset --hard` on a shared branch.
- Disable, skip or weaken a test, lint rule or type check to make the gate
  green. If a rule is wrong, say so and propose the config change in the PR.
- Put a real credential in any tracked file, commit message, or log.
- Claim a check passed that you did not run in this session.

## Code rules (the short version)

Full text with the reasoning: [`docs/CODE-RULES.md`](docs/CODE-RULES.md).

- TypeScript `strict` + `noUncheckedIndexedAccess`. No `any`, no `!` to silence
  an index, no `@ts-ignore` (use `@ts-expect-error <reason>`).
- `type`, not `interface`. Import through `@/*`.
- Delete dead code; `knip` fails the build on unused files, exports and deps.
- Conventional Commits; the body explains *why*.

## Tenant boundaries

Anything that decides **whose data a caller sees** is a tenant boundary:
access policies, scope filters, claim parsing, anything mapping an input to a
`tenantId`. A change there needs a **negative test** — one that asserts the
wrong tenant gets *nothing* — and that test must fail if the protection is
removed. Use the `tenant-boundary-test` skill. `npm run test:mutation` is the
automated proof; a surviving mutant in `src/tenancy/` blocks the PR.

## Skills in this repo

| Skill | Use it when |
|---|---|
| `tenant-boundary-test` | Adding or changing anything that scopes data by tenant, role or site |
| `db-migration` | Writing a schema migration |
| `verify-before-claiming` | Before you report a task as done, every time |
| `ship-pr` | Preparing a branch for review |
