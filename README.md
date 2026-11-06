# ai-dev-workflow

The AI-assisted development workflow I use on production work, pulled out of a
private client codebase so it can be read and run on its own.

The source project is a multi-tenant BI platform for school-district finance
(Next.js, Supabase/Postgres with row-level security, n8n ETL, Vercel, Sentry).
I built it end to end. Its code and data belong to the client, so this repo
carries **the workflow, not the product**: agent rules, skills, hooks, quality
gates and CI, plus a small tenant-scoping module and its tests so every check
has real code to run against.

```bash
npm install          # also installs the git hooks
npm run lint && npm run check:types && npm run check:deps && npm test
npm run test:mutation
```

## What's here

```
AGENTS.md                      agent rules: may / must ask / never, code rules in brief
CLAUDE.md                      @AGENTS.md - one source of truth for every agent
.claude/
  settings.json                allow / ask / deny permissions + hook wiring
  hooks/guard-bash.mjs         blocks --no-verify, force-push, .env.local reads, loosened test runs
  hooks/lint-touched-file.mjs  eslint --fix on every file the agent edits
  skills/
    tenant-boundary-test/      negative tests that are proven to fail
    db-migration/              grants + RLS + security_invoker + rollback
    verify-before-claiming/    evidence for every claim in the agent's summary
    ship-pr/                   gate, commitlint, PR body from the real diff
.github/
  workflows/ci.yml             static, tests + coverage, mutation, gitleaks
  workflows/ai-review.yml      Claude Code reviews each PR against the repo's own docs
  PULL_REQUEST_TEMPLATE.md     incl. "written with an agent? what did you check yourself?"
  CODEOWNERS, dependabot.yml
lefthook.yml                   pre-commit / commit-msg / pre-push, same checks as CI
docs/
  AI-WORKFLOW.md               the loop, end to end, and the mistakes behind the rules
  CODE-RULES.md                every rule, why, and which tool enforces it
  DEFINITION-OF-DONE.md        the merge bar
src/tenancy/                   tenant/role/site scoping + positive and negative tests
src/money/                     a regression-tested formatter (a real bug from the dashboard)
```

## The loop in one paragraph

The agent plans, then writes the failing test, then the code. A hook lints each
file as it is written; another blocks the shortcuts (`--no-verify`, force-push,
reading secrets). Before it reports "done", the `verify-before-claiming` skill
makes it run the gate and label every claim as verified, not run, or assumed.
I read the diff and commit myself. lefthook runs the same checks as CI, and CI
adds mutation testing and a secret scan. An AI reviewer comments on the PR
against `AGENTS.md` and `docs/`. A human merges. Full version:
[`docs/AI-WORKFLOW.md`](docs/AI-WORKFLOW.md).

## What the agent may do without asking

Read code, edit `src/`, `tests/` and `docs/` for the task, run lint, types, knip,
tests and the dev server, and use read-only git. It asks before committing,
pushing, installing dependencies, touching CI or lint config, or running
migrations. It never bypasses hooks, weakens a check, or reads `.env.local`.
The rules are in `AGENTS.md`, enforced by `.claude/settings.json` and
`.claude/hooks/`.

## Why mutation testing

Most agent-written test suites are green on the first run. That shows the tests
pass. It doesn't show they can fail. Stryker changes the code one mutation at a
time and checks that some test goes red. The tenant boundary has to kill every
mutant, because a scoping check that nothing notices being removed is the
failure that costs the most.

## License

MIT
