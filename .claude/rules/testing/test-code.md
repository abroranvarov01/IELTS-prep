---
paths:
  - "{apps,packages}/**/*.test.*"
  - "{apps,packages}/**/*.spec.*"
  - "apps/web/e2e/**"
  - "apps/api/test/**"
---

# Writing test code

What to test and at which level: docs/engineering/TESTING_STRATEGY.md.

- **Test names state behavior in domain language**, e.g. `"rounds an overall band of 6.25 up to 6.5"`, not `"works correctly"`.
- **Assert on observable behavior**: return values, rendered text and roles, emitted calls at real boundaries. Do not assert on internal state or private functions.
- **Query UI by role and accessible name**, not by CSS classes or test IDs, unless no accessible handle exists. If none exists, that is usually an accessibility bug.
- **Deterministic.** No real network, no live AI calls, no real timers or current dates without control, no order dependence between tests.
- **Mock only at real boundaries** (network, storage, AI provider, clock). Never mock the domain logic under test.
- **Minimal, original fixtures.** Never copy published IELTS material into fixtures. Another slice's fixtures come from its `testing.ts` entry point (docs/architecture/BOUNDARIES.md).
- **No snapshot tests for UI markup.** They break on harmless changes and hide what matters. Use them only for small, stable, reviewed data structures.
- **A regression test must fail without the fix.** Confirm that it does.
- Do not weaken or delete an existing test to make a change pass. If a test is wrong, say why in the summary.
