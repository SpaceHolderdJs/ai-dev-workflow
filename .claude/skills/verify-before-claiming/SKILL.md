---
name: verify-before-claiming
description: Use before reporting any task as done, fixed or passing. Separates what was run and observed from what is assumed, so a summary never claims more than the session proved.
---

# Verify before claiming

The most expensive agent mistake is not a wrong line of code - it is a
confident summary that says something was checked when it wasn't. This skill
is the last step of every task.

## Steps

1. **Run the gate** and keep the output:
   ```bash
   npm run lint && npm run check:types && npm run check:deps && npm test
   ```
2. **Re-read the diff** (`git diff`) against the original request. List
   anything in the diff the request did not ask for, and anything the request
   asked for that is not in the diff.
3. **Check every claim you are about to make** against something you ran in
   this session. For each one, mark it:
   - `verified` - you ran it and saw the result (quote the line)
   - `not run` - say why (needs a real DB, needs credentials, too slow)
   - `assumed` - you believe it but did not check
4. **If a number appears in your summary** (rows, totals, latency, coverage),
   it must come from output in this session, not from memory or estimation.
5. **If a test you wrote passed on the first run**, break the code it covers
   once and confirm it fails. A test that has never been red has not been
   shown to test anything.

## Report format

```
Done: <one line>
Verified:
  - npm run lint: 0 problems
  - npm test: 22 passed
Not run: <check> - <reason>
Assumed: <anything>, or "nothing"
Outside the request: <changes>, or "nothing"
```
