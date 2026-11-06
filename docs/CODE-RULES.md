# Code rules

Almost every rule here is enforced by a tool, not by reviewer memory, and that
includes an AI reviewer's memory. They are written down to explain *why* each
is set the way it is, so a rule can be argued with instead of quietly disabled
by a person or an agent.

## How rules are enforced

| Gate | When | What it checks |
|---|---|---|
| Claude Code `PostToolUse` hook | every file the agent edits | ESLint `--fix` on that file; remaining errors go back to the agent |
| Claude Code `PreToolUse` hook | every shell command the agent runs | blocks `--no-verify`, force-push, reading `.env.local`, loosening test runs |
| `.claude/settings.json` permissions | every tool call | allow / ask / deny lists (see `AGENTS.md`) |
| lefthook `pre-commit` | every `git commit` | ESLint on staged files, `tsc`, `knip`, unit tests |
| lefthook `commit-msg` | every `git commit` | commitlint (Conventional Commits) |
| lefthook `pre-push` | push touching `src/tenancy/` | mutation tests on the tenant boundary |
| CI `static` | every push / PR | commitlint over the PR range, ESLint, `tsc`, `knip` |
| CI `test` | every push / PR | Vitest with coverage thresholds, hook tests |
| CI `mutation` | every push / PR | Stryker, fails below the break threshold |
| CI `secrets` | every push / PR | gitleaks over full history |
| `AI review` workflow | every non-draft PR | Claude reviews the diff against these docs, inline comments |

Hooks install via the `prepare` script on `npm install`. If a commit succeeds
and none of the above ran, they are not installed: run `npx lefthook install`.
A repo whose hooks were never installed looks normal right up until a bad
commit lands.

**Never bypass with `--no-verify`.** The hook is the fast copy of CI; skipping
it only moves the failure somewhere slower. If a hook is wrong, change its
config in the same PR.

## Commits

[Conventional Commits](https://www.conventionalcommits.org), enforced by
`commitlint.config.ts`:

```
<type>(<scope>): <subject>

<body: why, not what - the diff already says what>
```

Subject lowercase, imperative, no trailing period, header under 72 characters.
The type is not decoration: it decides the release version. A behaviour change
committed as `chore:` ships with no version bump and no release note.

Commits written with an agent carry a `Co-Authored-By:` trailer. The human who
commits is still the author and is accountable for every line.

## TypeScript

- `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` are on.
  `arr[0]` is `T | undefined`; handle the empty case, don't paper over it with `!`.
- No `any` - use `unknown` and narrow. A genuinely wrong third-party type is
  cast at exactly one boundary, with a comment.
- `type`, not `interface`.
- No `@ts-ignore`. `@ts-expect-error <reason>` fails the build once the
  underlying problem is fixed, so it cannot rot.

## Linting and formatting

ESLint ([`@antfu/eslint-config`](https://github.com/antfu/eslint-config)) lints
*and* formats. There is no Prettier step to fight it. Local overrides live at
the bottom of `eslint.config.mjs`, each with a one-line reason.

## Tests

- Every bug fix gets a test that **fails before the fix**.
- **Every tenant-boundary change gets a negative test**: the wrong caller gets
  *nothing*. A policy that allows everyone passes every positive test.
  `src/tenancy/scope.test.ts` is the pattern.
- Assert the real outcome, not a proxy: exact ids or totals, not `length > 0`;
  a refusal (`42501`, `403`, a thrown error) when the system should refuse,
  not an empty result that happens to look the same.
- A fixture has to be able to tell right from wrong: two tenants, two sites,
  and rows in each. A filter over an empty set proves nothing.
- **Mutation testing is the proof that tests can fail.** Coverage shows a line
  ran; Stryker shows a test notices when that line changes.

## Database (when the project has one)

- Schema changes are migration files reviewed in a PR, never dashboard edits.
- `GRANT` and RLS are both required; RLS narrows a grant, never replaces one.
- Policies read JWT claims through helpers wrapped as scalar subqueries,
  `tenant_id = (select app.current_tenant_id())`, so they run once per
  statement, not per row, and never query the table they protect.
- Views over tenant data are `security_invoker = true`.
- Generated DB types are regenerated, never hand-edited.

See `.claude/skills/db-migration/SKILL.md` for the full procedure.

## Secrets

- `.env` holds public, non-secret defaults only. Real values go in
  `.env.local` (git-ignored, denied to the agent).
- `NEXT_PUBLIC_*` / client-exposed variables are public by definition.
- CI integration tests run against a throwaway local stack, so production
  signing secrets never need to be CI secrets.
- gitleaks runs over full history on every PR.

## Dead code

`knip` fails the build on unused files, exports and dependencies. Delete rather
than comment out; the history keeps it.
