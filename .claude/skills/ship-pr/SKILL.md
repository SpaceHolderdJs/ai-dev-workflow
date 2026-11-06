---
name: ship-pr
description: Use when a branch is ready for review. Runs the full gate, checks commit messages, fills the PR template from the actual diff, and hands the commit/push to the human.
---

# Ship a PR

## Steps

1. Run the `verify-before-claiming` skill. Do not continue on a red gate.
2. `npx commitlint --from origin/develop --to HEAD` - every commit must be a
   valid Conventional Commit. The type decides the release version, so a
   behaviour change is `feat`/`fix`, never `chore`.
3. Fill `.github/PULL_REQUEST_TEMPLATE.md` from the diff, not from memory:
   - **What this PR does** - one or two sentences.
   - **How to verify** - exact commands a reviewer can paste.
   - **Tenant boundary?** - yes/no. If yes, name the negative test that fails
     without the protection (see `tenant-boundary-test`).
   - Tick only the checklist items you actually verified.
4. Check docs moved with the code: README for setup changes, `docs/` for a
   rule or a judgment call.
5. **Stop.** Print the proposed PR title (a valid Conventional Commit, it
   becomes the squash commit) and body. The human commits, pushes and opens
   the PR.

After the PR is open, the `AI review` workflow posts a review. Treat its
comments as a second reviewer: fix what is right, answer what is wrong with a
reason, never resolve a thread silently.
