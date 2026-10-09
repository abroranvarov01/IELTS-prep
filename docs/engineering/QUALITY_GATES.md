# Quality Gates

Canonical owner of the **validation commands and deterministic enforcement**.

**Principle:** if a tool can enforce a rule, a tool enforces it: compiler, formatter, linter, tests, CI. Prompt instructions are for judgment, not for things a machine can check.

## Current state (2026-10-09)

**No quality gates exist yet.** The repository has no `package.json`, no toolchain, and no CI. The Foundation tasks ([TASKS.json](../execution/TASKS.json)) create them and update this table as each command becomes real.

| Gate | Command | Status |
|---|---|---|
| Typecheck | — | Does not exist |
| Lint | — | Does not exist |
| Format | — | Does not exist |
| Unit/component tests | — | Does not exist |
| End-to-end tests | — | Does not exist |
| Build | — | Does not exist |

**Agents must not claim that a check passed if the command does not exist.** When scaffolding adds these commands, replace the table above with the real command names. This table is their only canonical list.

## Future deterministic enforcement

These are recommendations. **None of them is configured.** Set them up during scaffolding, before feature work.

| Concern | Recommended enforcement |
|---|---|
| Type correctness | TypeScript `strict`, plus `noUncheckedIndexedAccess` |
| Formatting | Prettier (or equivalent), checked in CI. Never argue formatting in review. |
| Code smells and imports | ESLint with recommended TypeScript and React Hooks rules |
| Accessibility (static) | `eslint-plugin-jsx-a11y` |
| Architecture boundaries | ESLint import restrictions or dependency-cruiser, once [BOUNDARIES.md](../architecture/BOUNDARIES.md) has concrete modules |
| Hard-coded UI strings | A no-literal-string lint rule for JSX, plus a missing-translation-key check for uz/ru/en |
| Raw design values | A lint rule or Tailwind config that rejects arbitrary colors outside the tokens |
| Behavior | Unit, component, and e2e suites per [TESTING_STRATEGY.md](TESTING_STRATEGY.md) |
| Accessibility (runtime) | axe checks in component/e2e tests |
| PWA, performance | Lighthouse CI with budgets for mobile (bundle size, LCP, installability) |
| Regressions | CI runs typecheck, lint, format check, tests, and build on every PR. The main branch is protected. |
| Secrets | Secret scanning in CI. `.env*` is git-ignored. |

## Claude Code hooks (recommended, not enabled)

Hooks are **not** configured in `.claude/settings.json` at the moment, because there are no commands for them to run. Once the gates above exist, consider:

- **PostToolUse on Edit/Write:** run a *report-only* typecheck/lint on the changed file and show the errors to Claude. Do not auto-fix silently.
- **Stop hook:** run the fast gates (typecheck + lint + unit tests) and surface any failures before the agent reports completion.

Never add hooks that rewrite user code silently, delete files, or run destructive commands.
