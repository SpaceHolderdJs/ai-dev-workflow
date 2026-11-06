---
name: tenant-boundary-test
description: Use when adding or changing anything that decides whose data a caller sees - access policies, tenant/role/site scope filters, claim parsing, or mapping an input to a tenantId. Writes the negative test and proves it can fail.
---

# Tenant-boundary test

A policy that lets everyone through passes every positive test. The only test
that covers a boundary is one that asserts the **wrong caller gets nothing**,
and that **fails when the protection is removed**.

## Steps

1. **Name the boundary.** One sentence: "A principal of site A must not see
   rows of site B." If you cannot write the sentence, ask.
2. **Build a fixture that can tell right from wrong.** At least two tenants,
   and inside the tenant at least two scopes (two sites, two roles). A
   single-tenant fixture cannot distinguish correct scoping from scoping that
   ignores the claim and returns the same rows either way. Make sure the
   *other* tenant actually has rows - a filter over an empty set proves nothing.
3. **Write the positive case** (right caller sees exactly the expected rows,
   asserted by id or by exact total, not by "length > 0").
4. **Write the negative cases**: other tenant, no role, unassigned user,
   missing/garbled claims. Assert **no rows** (`toEqual([])`), not rows that
   add up to zero.
5. **Assert the real failure.** If the system is meant to refuse (throw,
   return 403, raise SQLSTATE 42501), assert that exact refusal. An empty
   result and a refusal are different outcomes.
6. **Prove the test can fail.** Temporarily break the protection (e.g. make
   the filter return every row), run the test, confirm the negative cases go
   red, then restore the exact original code. Say in your report which
   assertion went red.
7. **Run `npm run test:mutation`.** A surviving mutant in `src/tenancy/` means
   a line of the boundary has no test that notices it changing. Kill it with
   a test, not with an ignore comment.

## Report format

```
Boundary: <sentence>
Positive: <test name> - <expected rows/total>
Negative: <test names>
Proved can fail: broke <what>, <n> tests went red, restored
Mutation: <score>, survivors in src/tenancy: <none | list>
```
