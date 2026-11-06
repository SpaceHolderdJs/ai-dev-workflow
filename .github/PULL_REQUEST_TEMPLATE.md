## What this PR does

<!-- One or two sentences. -->

## How to verify

<!-- Exact commands a reviewer can paste. -->

## Does this touch a tenant boundary?

<!-- Access policy, scope filter, claim parsing, anything mapping input to a
     tenantId. If yes, name the negative test that fails when the protection is
     removed, and how you proved it can fail. If no, say no. -->

## Written with an AI agent?

<!-- Which parts, and what you checked yourself rather than took from the
     agent's summary. "Agent said tests pass" is not a check. -->

## Checklist

See `docs/DEFINITION-OF-DONE.md`.

- [ ] `npm run lint`, `npm run check:types`, `npm run check:deps`, `npm test` pass locally
- [ ] Changed behaviour has a test, and I have seen that test fail
- [ ] Tenant-boundary changes have a **negative** test; `npm run test:mutation` has no survivors there
- [ ] Docs changed in this PR if setup, behaviour or a rule changed
- [ ] No secrets in the diff
