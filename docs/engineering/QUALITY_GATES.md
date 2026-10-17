# Quality Gates

Canonical owner of the **validation commands and deterministic enforcement**.

**Principle:** if a tool can enforce a rule, a tool enforces it: compiler, formatter, linter, tests, CI. Prompt instructions are for judgment, not for things a machine can check.

## Current state (2026-10-09)

**All gates below exist.** Run commands from the repository root with Node 24 (`.nvmrc`) and pnpm via Corepack (`corepack enable`). **`pnpm check` bundles the fast gates.** Which gates a change needs, and at which checkpoint, is owned by [DEFINITION_OF_DONE.md, Validation by risk](DEFINITION_OF_DONE.md#validation-by-risk). For user-facing UI the gates are necessary but not sufficient. The screenshot review in [DEFINITION_OF_DONE.md](DEFINITION_OF_DONE.md#when-ui-changes) is judgment, and no gate replaces it. CI (`.github/workflows/ci.yml`, GitHub Actions) runs two jobs on every push and pull request: `check` (`pnpm install --frozen-lockfile`, `pnpm check`, `pnpm build`, no database) and `api-database` (a `postgres:18.6` service container like `compose.yaml`, then `pnpm --filter api db:deploy`, `db:check`, and `test:e2e`). It becomes active when the owner pushes. Browser e2e tests (Playwright) are not in CI yet.

| Gate | Command | Status |
|---|---|---|
| **All fast gates** | `pnpm check` = `format:check`, `lint` (including the token check), `typecheck`, `test` | Exists (CI) |
| Typecheck | `pnpm typecheck` (runs `typecheck` in every workspace; `apps/web`: `next typegen && tsc --noEmit`; `apps/api`: `tsc --noEmit`) | Exists |
| Lint | `pnpm lint` (ESLint flat config, `eslint.config.mjs`: `@eslint/js` + typescript-eslint recommended for all files; `apps/web/**` adds `eslint-config-next/core-web-vitals` (Next.js, React Hooks) and the full jsx-a11y recommended set; `import/no-restricted-paths` stops `apps/web` and `apps/api` importing from each other and enforces the Feature-Sliced Design boundaries of `apps/web` (ADR-0010, [BOUNDARIES.md](../architecture/BOUNDARIES.md#enforcement): layer direction, slices of one layer isolated, slices used only through their public API, `*.server.ts` entry points only from the app layer, fixtures only in tests, segment direction), with zones generated from the folders; `no-restricted-imports` and `no-restricted-globals` keep `model/` segments free of React, Next.js, next-intl, `node:*` and browser APIs and `api/` segments free of React; `import/no-cycle` rejects import cycles; files outside the layers fail; then `scripts/check-tokens.mjs` rejects raw hex/rgb/hsl colors and arbitrary color utilities outside `apps/web/src/shared/ui/tokens.css`, and `scripts/check-architecture.mjs` lints representative forbidden imports in every spelling and fails if one is accepted) | Exists |
| Format | `pnpm format:check` (check), `pnpm format` (write). Prettier defaults; Markdown and the lockfile are excluded (`.prettierignore`) | Exists |
| Unit/component tests | `pnpm test` (Vitest in every workspace: `apps/web` with jsdom + Testing Library, `apps/api`) | Exists |
| End-to-end tests | `pnpm test:e2e` (runs `test:e2e` in every workspace) | Exists |
| ↳ API HTTP e2e | `pnpm --filter api test:e2e` (Vitest + supertest against the Nest app). Needs the local database running (`pnpm db:up`) and `DATABASE_URL` (exported, or in `apps/api/.env` from `.env.example`) | Exists (CI) |
| ↳ Browser e2e + accessibility | `pnpm --filter web test:e2e` (Playwright against the production build, started by `webServer`; projects `mobile` 360×800 and `desktop` 1280×800; `@axe-core/playwright` WCAG 2.2 AA checks). Needs Chromium: `pnpm --filter web exec playwright install chromium` | Exists |
| ↳ One screen's browser specs | `pnpm --filter web test:e2e <spec files>` (both projects; add `--project=mobile` or `desktop` for one). Each run builds first, so batch the specs of a checkpoint into one run. Screens: onboarding `onboarding`; home `home`; level check `level-check`; not found and errors `not-found`; header, language switcher and locales `shell`, `language-switcher`, `locales`; PWA `pwa`; Reading test `reading`, `reading-desktop`, `reading-journeys`, `reading-tabs`; Reading results `reading-results`; Reading review `reading-review` (all `e2e/<name>.spec.ts`) | Exists |
| Build | `pnpm build` (runs `build` in every workspace); one app: `pnpm --filter web build` or `pnpm --filter api build` | Exists (CI) |
| Local database | `pnpm db:up` (starts PostgreSQL 18.6 from `compose.yaml` on 127.0.0.1:5432 and waits until it is healthy), `pnpm db:down` (stops it and keeps the data volume). Needs Docker with the Compose plugin. The URL is the one in `apps/api/.env.example` | Exists |
| Database migrations | `pnpm --filter api db:migrate --name <change>` (authors: create and apply a migration locally, `prisma migrate dev`), `db:deploy` (apply committed migrations, `prisma migrate deploy`; the only way outside a local database), `db:status` (`prisma migrate status`), `db:check` (fails, exit 2 from Prisma, when the database differs from `schema.prisma`; run after `db:deploy` it checks the committed migrations against the schema). All need `DATABASE_URL`. Rules: `.claude/rules/backend/database.md` | Exists (CI: `db:deploy`, `db:check`) |
| Screenshots (not a gate) | For the visual review (`product-design` skill). While iterating, the dev server is enough: `pnpm --filter web dev` (port 3002; it follows the working tree, no build per pass). At an integration checkpoint, capture from the production build: `pnpm --filter web build`, then `pnpm --filter web start --port <port>`. One page: `pnpm --filter web exec playwright screenshot --viewport-size "<width>, 800" --wait-for-selector h1 [--full-page] http://localhost:<port>/<locale>/<path> <absolute path>.png` (wait for the element under review if it is not an `h1`). States that need interaction: a throwaway Playwright script outside the repository that loads `@playwright/test` from `apps/web` (`createRequire`). Uses the Chromium that the browser e2e tests install. Without `--wait-for-selector`, a streamed page can be captured blank. Screenshots are never committed (approved references: [docs/design/references/](../design/references/README.md)) | Exists |
| API docs (not a gate) | The running API (`pnpm --filter api dev`, port 3001) serves Swagger UI at `/docs` and the OpenAPI document at `/docs-json`, generated from the controllers and their classes, **only when `NODE_ENV` is not `production`** (ADR-0002 §5). The e2e tests check the document's contents | Exists |
| Prisma Client | `pnpm --filter api db:generate` (also runs on install as `postinstall`). The client is generated into `apps/api/src/generated/` and not committed. Needs no database and no `DATABASE_URL` | Exists |

**Agents must not claim that a check passed if they did not run it.** This table is the only canonical list of commands. Update it when a command changes.

## Future deterministic enforcement

Rows marked **Implemented** are configured (commands above). The others are recommendations for later.

| Concern | Recommended enforcement | Status |
|---|---|---|
| Type correctness | TypeScript `strict`, plus `noUncheckedIndexedAccess` | **Implemented** (`tsconfig.base.json`) |
| Formatting | Prettier (or equivalent), checked in CI. Never argue formatting in review. | **Implemented** |
| Code smells and imports | ESLint with recommended TypeScript and React Hooks rules | **Implemented** |
| Accessibility (static) | `eslint-plugin-jsx-a11y` | **Implemented** |
| Architecture boundaries | ESLint import restrictions or dependency-cruiser, once [BOUNDARIES.md](../architecture/BOUNDARIES.md) has concrete modules | **Implemented** for apps and for the Feature-Sliced Design layers, slices and segments of `apps/web` (`import/no-restricted-paths`, `no-restricted-imports`, `no-restricted-globals`, `import/no-cycle`; ADR-0010), with a self-check (`scripts/check-architecture.mjs`). `apps/api` module rules come with its feature structure. |
| Hard-coded UI strings | A no-literal-string lint rule for JSX, plus a missing-translation-key check for uz/ru/en | Partly: catalog key parity and non-empty messages are tested (`apps/web/src/shared/i18n/messages.test.ts`). No JSX literal-string rule yet. |
| Raw design values | A lint rule or Tailwind config that rejects arbitrary colors outside the tokens | **Implemented** (`scripts/check-tokens.mjs`, Tailwind defaults reset in `tokens.css`) |
| Behavior | Unit, component, and e2e suites per [TESTING_STRATEGY.md](TESTING_STRATEGY.md) | **Implemented** (tooling; API e2e in CI, browser e2e not yet) |
| Accessibility (runtime) | axe checks in component/e2e tests | **Implemented** in browser e2e |
| PWA, performance | Lighthouse CI with budgets for mobile (bundle size, LCP, installability) | Not yet |
| Regressions | CI runs typecheck, lint, format check, tests, and build on every PR. The main branch is protected. | **Implemented** in CI. Branch protection is an owner action. |
| Secrets | Secret scanning in CI. `.env*` is git-ignored. | Partly: `.env*` (except `.env.example`) is git-ignored. No secret scanning yet. |

## Claude Code hooks (recommended, not enabled)

Hooks are **not** configured in `.claude/settings.json`. The gates above now exist, so consider:

- **PostToolUse on Edit/Write:** run a *report-only* typecheck/lint on the changed file and show the errors to Claude. Do not auto-fix silently.
- **Stop hook:** run the fast gates (typecheck + lint + unit tests) and surface any failures before the agent reports completion.

Never add hooks that rewrite user code silently, delete files, or run destructive commands.
