# Progress

Canonical **execution log**. The task status lives in [TASKS.json](TASKS.json). This file records what happened and what is waiting on the owner. Workers append entries. They never rewrite earlier ones.

## Current state

- **Milestone:** M0 Foundation (see [ROADMAP.md](ROADMAP.md))
- **Next:** `F-07` (worker): Web unit test tooling (Vitest + Testing Library).

## Open questions for the owner

## Log

Entry format:

```
### YYYY-MM-DD: <task id> <title>
- Result: done | blocked
- Changes: <one line per notable change>
- Verification: <commands run and outcome; anything "not available yet">
- Versions / choices: <e.g. Next.js x.y, Serwist vs manual SW, and why>
- Notes: <assumptions, placeholders, follow-ups noticed but not done>
```

### 2026-10-09: Execution setup (not a task)
- Result: done
- Changes: ADR-0001 drafted (Proposed); ROADMAP, TASKS (M0 Foundation), PROGRESS, AUTONOMOUS_WORKFLOW created; `work-next-task` skill added; settings deny writes to secret env files and destructive git operations.
- Verification: JSON and links validated. No application code. No dependencies installed.
- Notes: Repository has GitHub remote `origin` and one commit (README). Governance is uncommitted until F-01. The machine has Node 22. ADR-0001 requires Node 24.

### 2026-10-09: ADR-0001 accepted (not a task)
- Result: done
- Changes: Owner confirmed PostgreSQL + Prisma (recorded in ADR-0001, not scaffolded). Removed the prediction of which shared package comes first. Foundation milestone renamed to M0. ADR-0001 marked Accepted.
- Verification: JSON and links validated.
- Notes: F-00 remains `todo` until Node 24 LTS is installed (machine has v22.23.3).

### 2026-10-09: F-01 Repository baseline and governance commit
- Result: done
- Changes: Added `.gitignore` (dependencies, `.next/`, `dist/`, `*.tsbuildinfo`, coverage and Playwright output, logs, `.env` / `.env.*` except `.env.example`, OS/editor files), `.gitattributes` (`* text=auto eol=lf`), `.editorconfig` (UTF-8, LF, 2 spaces, final newline), `.nvmrc` (`24`). Committed the governance (CLAUDE.md, .claude/, docs/).
- Verification: `node --version` → v24.21.0 (via nvm). `git check-ignore -v .env` matches; `.env.example` not ignored; `.env.local`, `apps/web/.env.production`, `node_modules/`, `apps/web/.next/` ignored; no governance file ignored. No CRLF in tracked text. `git status --porcelain` empty and `git ls-files CLAUDE.md .claude docs | wc -l` checked after the commit. Lint/typecheck/test gates: not available yet.
- Versions / choices: `.nvmrc` pins the major (`24`), matching ADR-0001's "Node.js 24 LTS".
- Notes: Node 24 is installed via nvm (default alias `24`), but non-interactive shells that do not source nvm still resolve `/usr/bin/node` v22.23.3. Workers activate nvm per command. Entries for framework-specific generated files (e.g. `next-env.d.ts`) are left to the app scaffold tasks.

### 2026-10-09: F-02 pnpm workspace root and TypeScript base config
- Result: done
- Changes: Root `package.json` (private, `packageManager: pnpm@12.10.1`, `engines.node: ^24`, no dependencies). `pnpm-workspace.yaml` with `apps/*` and `packages/*`. `tsconfig.base.json` with only the four ADR-0001 §2 options. `pnpm-lock.yaml` generated.
- Verification: `node --version` → v24.21.0; `pnpm --version` → 12.10.1; `pnpm install --frozen-lockfile` succeeds (after removing `node_modules`). The four strict options are present in `tsconfig.base.json` and it parses as JSON. Lint/typecheck/test gates: not available yet.
- Versions / choices: pnpm 12.10.1 (npm `latest` tag on 2026-10-09). `corepack enable` was run, which adds pnpm shims to the nvm-managed Node 24 bin directory (task-mandated activation; no system Node change). pnpm 12 records itself under `packageManagerDependencies` in the first YAML document of the lockfile; that is pnpm's own format.
- Notes: The base tsconfig deliberately holds only the shared strictness options. Module, target, and JSX settings differ between Next.js and NestJS, so each app sets them. CLAUDE.md and QUALITY_GATES.md still say "no package.json"; F-11 owns that sync.

### 2026-10-09: F-03 Prettier and base ESLint at the root
- Result: done
- Changes: Root dev dependencies `prettier`, `eslint`, `@eslint/js`, `typescript-eslint`, `typescript` (exact pins). `.prettierrc.json` (Prettier defaults), `.prettierignore` (lockfile, Markdown; Prettier already honors `.gitignore`). `eslint.config.mjs` (flat config: global ignores, `@eslint/js` recommended, typescript-eslint recommended; apps add `files`-scoped entries). Root scripts `format`, `format:check`, `lint`. `TASKS.json` and `eslint.config.mjs` reformatted by Prettier (format-only; TASKS.json content verified identical apart from the F-03 status). QUALITY_GATES.md table updated.
- Verification: `pnpm format:check` passes; `pnpm lint` passes. A temporary `probe.ts` with `const x: any` made `pnpm lint` fail with `@typescript-eslint/no-explicit-any` (then deleted). Typecheck/test gates: not available yet.
- Versions / choices: Prettier 3.9.9, ESLint 10.12.0, @eslint/js 10.0.1, typescript-eslint 8.71.1. **TypeScript 6.0.3, not the npm `latest` 7.0.2**: typescript-eslint 8.71.1 declares the peer range `typescript >=4.8.4 <6.1.0`, so 6.0.3 is the newest compatible release. Revisit when typescript-eslint supports TypeScript 7.
- Notes: **Markdown is excluded from Prettier.** Running it would only change formatting, but it pads every table column, so editing one cell rewrites the whole table and makes governance diffs noisy. Markdown stays hand-formatted. Because `docs/execution/TASKS.json` is now under `format:check`, workers must keep it in Prettier format (run `pnpm format` after editing it).

### 2026-10-09: F-04 Scaffold apps/web (Next.js)
- Result: done
- Changes: `apps/web` from `create-next-app@16.4.0 --ts --app --src-dir --tailwind --eslint --use-pnpm --skip-install --disable-git --empty --no-agents-md --no-react-compiler`. Removed the app-local `pnpm-workspace.yaml` (its `allowBuilds` moved to the root), `eslint.config.mjs` (rules moved into the root config), `.gitignore` (`next-env.d.ts` and `*.pem` moved to the root), template `README.md`, and the template metadata ("Create Next App"). The page is a bare `<main />`. `tsconfig.json` extends `../../tsconfig.base.json`. App scripts: dev, build, start, lint, typecheck. Root scripts: `typecheck` and `build` run recursively. Root ESLint adds a `files: ["apps/web/**"]` entry with `eslint-config-next/core-web-vitals` plus the full jsx-a11y recommended rules.
- Verification: `pnpm format:check`, `pnpm lint`, `pnpm --filter web lint`, `pnpm typecheck`, and `pnpm --filter web build` pass. `pnpm install --frozen-lockfile` from a clean `node_modules` shows no peer warnings. A temporary `probe.tsx` (conditional `useState`, clickable `div`, `<img>` without alt) failed lint with react-hooks/rules-of-hooks, jsx-a11y (alt-text, click-events-have-key-events, no-static-element-interactions), and @next/next/no-img-element. The probe was then deleted. Tests: not available yet.
- Versions / choices: Next.js 16.4.0 (npm `latest`, published 2026-10-09), React 19.3.0, Tailwind CSS 4.3.3 through `@tailwindcss/turbopack` (template default), `@types/node` ^24 (template had ^20; aligned to the runtime), TypeScript 6.0.3 (template asks for ^5; Next's build and `tsc` accept 6.0.3). `cacheComponents` and `partialPrefetching` are kept as create-next-app defaults. `--no-agents-md`: CLAUDE.md is the single agent guide.
- **ESLint changed from 10.12.0 (F-03) to 9.39.5**, with `@eslint/js` 9.39.5. Reasons: the create-next-app 16.4.0 template pins `eslint ^9`, and `eslint-plugin-jsx-a11y` 6.10.2 (required by ADR-0001), `eslint-plugin-react`, and `eslint-plugin-import` (both pulled in by `eslint-config-next`) declare peer support only up to ESLint 9. npm marks 9.39.5 as "no longer supported". Follow-up: move to ESLint 10 once those plugins declare support.
- Notes: `<html lang="en">` is a placeholder until F-06 sets the locale. Running `eslint` from inside `apps/web` needs `settings.next.rootDir` to be absolute, so the config builds it from `import.meta.dirname`. The `.claude/rules/frontend/react.md` note about adding framework-specific rules is not addressed here (not in scope).

### 2026-10-09: F-05 Scaffold apps/api (NestJS) with a health endpoint
- Result: blocked
- Changes: none in the repository. A trial `nest new` ran in a scratch directory outside the repo.
- Verification: `@nestjs/cli` 12.0.8 / `@nestjs/core` 12.1.2 are npm `latest`. The generated project uses Vitest 4, oxlint, ESM, and TypeScript ^6.
- Versions / choices: none made.
- Notes: Stopped per AUTONOMOUS_WORKFLOW (deviating from an ADR). The question is under "Open questions for the owner".

### 2026-10-09: Owner decision on F-05 (not a task)
- Result: done
- Changes: Owner chose **Vitest for `apps/api`** on NestJS 12. ADR-0001 §7 is amended in place, at the owner's request (amendment noted in its status block): Vitest is the unit runner for web and API, and Jest is removed. ARCHITECTURE.md summary updated. F-05 scope now says Vitest, F-07's root test note says both apps use Vitest, and F-05 is back to `todo`. Constraints: keep NestJS 12, no downgrade to 11, no manual Jest setup.
- Verification: `pnpm format:check` passes. The only remaining Jest mentions are in the ADR amendment note and its rejected-alternatives rows.
- Notes: `decisions/README.md` says accepted ADRs are superseded rather than rewritten. The owner explicitly asked for an in-place update.

### 2026-10-09: F-05 Scaffold apps/api (NestJS) with a health endpoint
- Result: done
- Changes: `apps/api` from `@nestjs/cli@12.0.8 new api --directory apps/api --skip-git --skip-install --package-manager pnpm --no-observe`. Removed the hello-world AppController/AppService/spec, template README, `.prettierrc`, and `.oxlintrc.json`; the root Prettier and ESLint configs apply. Added `HealthController` (`GET /health` → `{"status":"ok"}`) with a Vitest unit test, and adapted the generated e2e test to `/health`. `main.ts` reads `PORT` with default 3001, documented in `apps/api/.env.example` (placeholder, no secrets). `tsconfig.json` extends the base config and keeps the Nest decorator options. Scripts: dev, build, start (`node dist/main.js`), test, test:e2e, typecheck. Root `test` script added (`pnpm -r test`).
- Verification: `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm --filter api test`, `pnpm --filter api test:e2e`, `pnpm --filter api build`, and root `pnpm test` pass. `pnpm peers check`: no issues. Probes, all reverted: a changed health response failed both the unit and e2e test; `any` in `apps/api` failed lint; constructor injection (service into controller) works under Vitest; the built server answered `{"status":"ok"}` on 3001 by default and on `PORT=3055`.
- Versions / choices: NestJS 12.1.2 (`@nestjs/core`, `common`, `platform-express`, `testing`), `@nestjs/cli` 12.0.8, Vitest 4.1.11, TypeScript 6.0.3 (template asks for ^6.0.2). The template is ESM (`"type": "module"`).
- Removed from the template: the `deploy` script and `@nestjs/mau` (Nest cloud deployment; agents never deploy); oxlint, `oxlint-tsgolint`, and app-local Prettier (root configs replace them); `@vitest/coverage-v8` and the `test:cov`/`test:watch`/`test:debug`/`start:debug`/`format`/`lint` scripts (outside the required script set; coverage thresholds belong to a later decision); `vite-tsconfig-paths` (no path aliases exist, and its `tsconfck` dependency is deprecated with a TypeScript ^5 peer); `source-map-support` (not referenced by Nest). `strictPropertyInitialization: false` was dropped so the API runs fully strict. Add it back with a reason if DTO classes need it.
- Notes: The template's oxlint config enforced `no-floating-promises`. The root ESLint uses non-type-checked typescript-eslint rules, so that check is not active. Follow-up: consider type-aware linting (owner or a later task).

### 2026-10-09: F-06 Localization foundation (next-intl, uz/ru/en)
- Result: done
- Changes: Added `next-intl` to `apps/web`, following the official App Router example (`next/root-params`): `src/i18n/routing.ts` (uz/ru/en, default uz, `localePrefix: "always"`), `src/i18n/request.ts`, `src/proxy.ts` (locale redirect; skips `/api`, `/_next`, and files with an extension), and the next-intl plugin in `next.config.ts`. Layout and page moved to `src/app/[locale]/`. The layout sets `<html lang>` from the active locale and prerenders all three locales with `generateStaticParams`. The page shows only `app.name` from `messages/{uz,ru,en}.json`. LOCALIZATION.md gained a "Technical setup" section and now points at ADR-0001 §6 instead of saying TBD.
- Verification: `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, and `pnpm --filter web build` pass. The build prerenders `/uz`, `/ru`, `/en` as static. Against `pnpm start`: `/` → 307 `/uz`; with `Accept-Language: ru` → `/ru`, `en` → `/en`, `de` → `/uz` (fallback); a `NEXT_LOCALE=en` cookie wins over `Accept-Language: ru`. `/uz`, `/ru`, `/en` → 200 with `<html lang="uz|ru|en">` and `<h1>IELTS Prep</h1>`. `/uz/does-not-exist` → 404. The three catalogs have identical keys (one key, `app.name`). Tests: none for web yet (F-07 adds the catalog key test).
- Versions / choices: next-intl 4.14.9 (npm `latest`, peers include Next 16). Uses `next/root-params`, the approach next-intl documents for Cache Components (the app keeps `cacheComponents: true`). Left out because nothing needs them yet: `i18n/navigation.ts` (no links), `NextIntlClientProvider` (no client components), and typed message keys (`AppConfig` augmentation). next-intl depends on `@parcel/watcher` and `@swc/core`, whose install scripts pnpm 12 blocks. They are set to `false` in root `allowBuilds` (same as `sharp` and `unrs-resolver`), and their prebuilt binaries load.
- Notes: **Product name is still TBD.** `app.name` = "IELTS Prep" in all three catalogs is the working placeholder (see open questions). Follow-up: typed message keys would let `pnpm typecheck` catch unknown keys.
