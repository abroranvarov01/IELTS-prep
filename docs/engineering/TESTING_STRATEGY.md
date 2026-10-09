# Testing Strategy

Canonical owner of **what we test, at which level, and why**. How to write individual test files is owned by [`.claude/rules/testing/test-code.md`](../../.claude/rules/testing/test-code.md). The procedure is the `testing` skill.

> **STATUS:** no test tooling is installed yet. Runner choices (likely Vitest for unit/component tests and Playwright for end-to-end) will be confirmed in the foundation ADR.

## Levels

| Level | What it covers | Priority |
|---|---|---|
| **Domain unit tests** | Scoring, band conversion and rounding, answer checking (spelling, word limits, accepted variants), error-pattern detection (Error Intelligence), recommendation rules | **Highest.** Domain logic does not ship without them. |
| **Component tests** | Interactive behavior users depend on: answer selection, timers, audio controls, form validation, accessible names/roles | Where behavior is non-trivial |
| **End-to-end tests** | Critical flows on a **mobile viewport** first: first practice, complete a practice set → see mistakes, mock test submission | A small number of high-value flows |
| **Accessibility checks** | Automated axe-style checks in component/e2e tests, plus manual checks per [ACCESSIBILITY.md](../design/ACCESSIBILITY.md) | Every new screen |

## Principles

- Test **behavior**, not implementation. Tests should survive a refactor that preserves behavior.
- Domain tests need no rendering, no network, and no database (see [INVARIANTS.md](../architecture/INVARIANTS.md)).
- **Bug fixes are verified in proportion to the bug** (see [Bug-fix verification](#bug-fix-verification)).
- IELTS rule tests cite their source (official band descriptors or conversion guidance) in the test or the domain code.
- Do not chase a coverage percentage. Cover the rules and the risky paths.

## Bug-fix verification

| Bug type | Required |
|---|---|
| Domain or business logic (scoring, answer checking, recommendations, data rules) | **A regression test is mandatory.** It must fail before the fix. |
| Other code behavior that a reliable automated test can capture | A regression test (the default) |
| Visual, environment-specific, browser-specific, or tooling bugs where an automated test would be disproportionate or unreliable | A **reliable reproduction** (steps, environment, viewport/browser) and **explicit verification** after the fix, both recorded in the summary |

The exception in the last row is for tests that are genuinely disproportionate or flaky. It is **never** a way to skip an easy, useful test.

## AI features

- Deterministic tests cover our own code around the AI: prompt assembly, response parsing and validation, estimate labeling, range presentation, failure handling.
- **Model quality** (how well estimates match examiner bands) is measured with a separate evaluation set and process (TBD). It is not part of unit tests, and it never calls live models in CI.

## Test data

- Use original, minimal fixtures. Never copy published IELTS material into fixtures (see [PRODUCT.md](../product/PRODUCT.md#content-integrity-and-brand)).
- Include Uzbek and Russian strings in UI tests where layout or text handling matters.
