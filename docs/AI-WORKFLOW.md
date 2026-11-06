# How I work with coding agents

This is the loop behind every change in the production projects this repo was
extracted from. The agent writes most of the first draft. The workflow exists
so that its output is checked by machines first, then by a human, and so that
a confident summary is never mistaken for a verified result.

```
 task
  │
  ▼
 plan ──────────────── agent proposes files, test, out-of-scope; I approve
  │                     (required for boundaries, migrations, CI, deps)
  ▼
 failing test ──────── written first; for a boundary, the negative case
  │
  ▼
 implement ─────────── PostToolUse hook lints every file the agent touches
  │                     PreToolUse hook blocks bypasses and secret reads
  ▼
 verify ────────────── verify-before-claiming skill: run the gate, mark
  │                     every claim verified / not run / assumed
  ▼
 I read the diff ───── and commit myself (lefthook: lint, types, knip, tests,
  │                     commitlint; pre-push: mutation on the boundary)
  ▼
 PR ────────────────── CI: static, tests+coverage, mutation, gitleaks
  │                     AI review: Claude reviews against AGENTS.md + docs
  ▼
 human merge ───────── squash, Conventional Commit title -> release version
```

## Tools

| Tool | What I use it for |
|---|---|
| **Claude Code** (CLI) | Main agent. Plans, edits, runs the gate, drafts commits and PR text. |
| **Claude Code GitHub Action** | PR reviewer (`.github/workflows/ai-review.yml`). |
| **lefthook, commitlint, ESLint, tsc, knip, Vitest, Stryker, gitleaks** | The gate. Same checks locally and in CI. |

## Where the rules live

| File | Purpose |
|---|---|
| `AGENTS.md` (`CLAUDE.md` imports it) | What the agent may do, must ask about, never does; code rules in brief |
| `.claude/settings.json` | The same allow / ask / deny lists, enforced by Claude Code |
| `.claude/hooks/` | Guards no permission list can express; auto-lint on edit |
| `.claude/skills/` | Repeatable procedures: boundary tests, migrations, verification, PRs |
| `docs/CODE-RULES.md` | Every rule, why it exists, and which tool enforces it |
| `docs/DEFINITION-OF-DONE.md` | The merge bar |

## Three rules that came from real mistakes

1. **A test that has never been red has not been shown to test anything.**
   A write-denial RLS test once passed against a tenant that had no rows in
   that table at all, so the update matched nothing whether or not the policy
   worked. Now every
   boundary fixture has rows on both sides, every negative test is broken on
   purpose once, and mutation testing runs in CI.
2. **Assert the outcome, not the mechanism.** A test asserting one specific
   Postgres error code broke when a CLI upgrade changed *which* layer denied
   the write. The invariant is "the row is unchanged", so that is what the
   test checks now, and the CLI is pinned.
3. **Numbers in a summary come from output in this session.** Agents
   paraphrase. The `verify-before-claiming` skill makes every claim carry its
   evidence, or say "not run".
