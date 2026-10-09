---
name: testing
description: Procedure for deciding what to test and writing tests for new behavior, bug fixes, or untested risky code. Use when adding or changing tests.
---

# Write tests

1. **Identify the behavior** to protect, in one sentence per case, in domain language.
2. **Choose the lowest level that proves it** (`docs/engineering/TESTING_STRATEGY.md`): domain unit test → component test → end-to-end. Domain rules are always tested at the domain level, never only through the UI.
3. **Find the existing test patterns** for that level (file location, helpers, fixtures) and follow them. Do not introduce a new test utility when an existing one fits.
4. **List the cases** before writing any of them: the main path, the boundaries (e.g. half-band rounding edges, word-limit edges), invalid input, and the empty, error, and offline states for UI. For text-heavy UI, include a Russian or Uzbek string case.
5. **Write the test first when you can.** For bug fixes that require a regression test (`docs/engineering/TESTING_STRATEGY.md` § Bug-fix verification), watch it fail for the expected reason before fixing.
6. **Implement or adjust the code** until the tests pass. Do not bend tests to fit the implementation's quirks.
7. **Check test quality:** deterministic, behavior-focused, minimal original fixtures, no mocks of the code under test (`.claude/rules/testing/test-code.md`).
8. **Run the relevant suites** from `docs/engineering/QUALITY_GATES.md` and report the actual results. If no runner exists yet, say so rather than implying the tests ran.
