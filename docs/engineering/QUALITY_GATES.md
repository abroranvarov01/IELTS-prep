# Quality Gates

Canonical owner of the **validation commands and deterministic enforcement**.

**Principle:** if a tool can enforce a rule, a tool enforces it: compiler, formatter, linter, tests, CI. Prompt instructions are for judgment, not for things a machine can check.

## Current state (2026-10-09)

**All gates below exist.** There is no CI yet. The Foundation tasks ([TASKS.json](../execution/TASKS.json)) create the rest and update this table as each command becomes real. Run commands from the repository root with Node 24 and pnpm (Corepack).

| Gate | Command | Status |
|---|---|---|
| Typecheck | `pnpm typecheck` (runs `typecheck` in every workspace; `apps/web`: `next typegen && tsc --noEmit`; `apps/api`: `tsc --noEmit`) | Exists |
| Lint | `pnpm lint` (ESLint flat config, `eslint.config.mjs`: `@eslint/js` + typescript-eslint recommended for all files; `apps/web/**` adds `eslint-config-next/core-web-vitals` (Next.js, React Hooks) and the full jsx-a11y recommended set; then `scripts/check-tokens.mjs` rejects raw hex/rgb/hsl colors and arbitrary color utilities outside `apps/web/src/styles/tokens.css`) | Exists |
| Format | `pnpm format:check` (check), `pnpm format` (write). Prettier defaults; Markdown and the lockfile are excluded (`.prettierignore`) | Exists |
| Unit/component tests | `pnpm test` (Vitest in every workspace: `apps/web` with jsdom + Testing Library, `apps/api`) | Exists |
| End-to-end tests | `pnpm test:e2e` (runs `test:e2e` in every workspace) | Exists |
| ↳ API HTTP e2e | `pnpm --filter api test:e2e` (Vitest + supertest against the Nest app) | Exists |
| ↳ Browser e2e + accessibility | `pnpm --filter web test:e2e` (Playwright against the production build, started by `webServer`; projects `mobile` 360×800 and `desktop` 1280×800; `@axe-core/playwright` WCAG 2.2 AA checks). Needs Chromium: `pnpm --filter web exec playwright install chromium` | Exists |
| Build | `pnpm build` (runs `build` in every workspace); one app: `pnpm --filter web build` or `pnpm --filter api build` | Exists |

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
