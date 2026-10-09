# ADR-0001: Initial Application Foundation

- **Status:** Accepted (2026-10-09). Sections marked *Owner-confirmed* were decided directly by the project owner. The rest was the agent's recommendation, accepted by the owner.
- **Amended:** 2026-10-09 by the owner: §7 API test runner changed from Jest to Vitest, because the NestJS 12 CLI now generates Vitest. 2026-10-09 by the owner: §5 UI font changed from Manrope to Onest, because Manrope has no U+02BB/U+02BC glyphs.
- **Date:** 2026-10-09
- **Deciders:** Project owner (acceptance), Claude (draft)

## Context

Governance v1.1 is approved, and the repository contains only documentation. Autonomous development of the Foundation milestone ([ROADMAP.md](../../execution/ROADMAP.md)) needs one coherent set of foundational choices, so that workers do not make project-wide decisions task by task.

Forces:
- **Owner-confirmed:** Next.js frontend, NestJS backend, TypeScript end-to-end, PostgreSQL with Prisma ORM for persistence.
- The product is a mobile-first PWA for users on mid-range Android phones and variable connections, so bundle size and performance matter.
- IELTS domain rules (scoring, answer checking) must have **one canonical implementation** (INVARIANTS I-2). With a separate frontend and backend, any code that both sides genuinely need must be shareable without duplication.
- Interface languages are uz/ru/en from the first screen (INVARIANTS I-6). Visual values come from tokens (I-7).
- The team is small. Every tool added is a tool to maintain.
- The repository is hosted on GitHub (`origin`). The development machine currently has Node 22. pnpm is not installed.

## Decision

### 1. Repository: one monorepo with pnpm workspaces

```
apps/web        Next.js application (App Router)
apps/api        NestJS application
packages/       shared TypeScript packages, created only when the first real shared code exists
```

- **pnpm workspaces only.** No Turborepo or Nx until build times or task orchestration demonstrably need them.
- Shared packages are created **only when real shared code exists**, by the task that needs them. The foundation creates none, and this ADR does not predict which will come first.
- Root-level shared config: `tsconfig.base.json`, ESLint flat config, Prettier config. These are config files, not packages.

### 2. Language and runtime
- **TypeScript end-to-end** (*Owner-confirmed*). Every workspace extends `tsconfig.base.json` with `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch`. The API additionally enables the decorator options NestJS requires.
- **Node.js 24 LTS**, pinned via `.nvmrc` and `engines`. Node 22 leaves maintenance in April 2027, so starting on it would force an early upgrade.
- **pnpm**, pinned via the root `packageManager` field and activated with Corepack.

### 3. Frontend: Next.js (*Owner-confirmed*)
- Current stable major at scaffold time (the exact version is recorded in the lockfile and in PROGRESS.md). App Router, `src/` directory, React Server Components by default.
- **The Next.js server does not own business rules or a database.** It renders pages and may call the API. Domain rules live in domain code and the API.

### 4. Backend: NestJS (*Owner-confirmed*)
- Current stable major. JSON over HTTP. The foundation exposes only `GET /health`.
- **Not decided here:** authentication, API contract and validation approach, and hosting. Each gets its own decision when a current requirement exists (see [ARCHITECTURE.md](../ARCHITECTURE.md#open-decisions-tbd)).

### 4a. Persistence: PostgreSQL + Prisma ORM (*Owner-confirmed*)
- **PostgreSQL** is the database. **Prisma** is the ORM and migration tool, used from `apps/api` only. The web app never accesses the database directly.
- **Not scaffolded in the foundation.** No Foundation task needs persistence. Prisma, the schema, and migrations are added by the first task with a real persistence requirement.
- Still open: schema design, and the database hosting location (part of the hosting and data-residency decision).

### 5. Styling and design tokens
- **Tailwind CSS v4.** Tokens are defined **once** in a CSS `@theme` file in `apps/web`, transcribed from [DESIGN_SYSTEM.md](../../design/DESIGN_SYSTEM.md).
- Tailwind's default color palette is removed, so non-token color utilities do not exist.
- A token check (part of `lint`) rejects raw color values outside the token file and the documented platform-metadata exception.
- shadcn/ui or Radix primitives are **not** installed in the foundation. They are added when the first component needs one, and restyled through tokens.
- Fonts: **Onest** (UI) and **Literata** (passages) via `next/font` (self-hosted at build time), with Latin, Latin Extended, and Cyrillic subsets. Coverage of U+02BB/U+02BC must be verified.

### 6. Localization
- **next-intl**, with locales `uz`, `ru`, `en` and a **locale prefix in every URL** (`/uz/...`). Prefixed URLs make direct acquisition links (PRODUCT.md) shareable in a specific language, and they are explicit for SEO.
- **Default locale: `uz`** (launch market). Requests to `/` redirect based on the browser's language, with `uz` as the fallback.
- `uz` means **Uzbek Latin**. Whether to also support Cyrillic remains TBD ([LOCALIZATION.md](../../product/LOCALIZATION.md)). If it is needed, it can be added later as `uz-Cyrl` without breaking existing URLs.
- Messages are stored as one JSON catalog per locale. A test enforces identical keys across catalogs.

### 7. Testing
- **Vitest is the unit test runner for web, API, and shared packages.** Jest is not used.
- **Web and shared packages:** Vitest + Testing Library (jsdom).
- **API:** Vitest, as generated by the NestJS 12 CLI (unit and e2e configurations). This is the framework default, so the API and web share one runner.
- **End-to-end: Playwright.** A mobile project (Chromium, ~360×800) is primary and a desktop project secondary. Accessibility checks use `@axe-core/playwright`.

### 8. Lint and format
- **ESLint** flat config: typescript-eslint, Next.js rules, `eslint-plugin-jsx-a11y`, React Hooks rules. NestJS-generated lint/format configs are replaced by the root config.
- **Prettier** for formatting. Formatting is never debated in review.
- Root scripts are the canonical gate commands: `format:check`, `lint`, `typecheck`, `test`, `test:e2e`, `build`, and an aggregate `check`. Their real names are recorded in [QUALITY_GATES.md](../../engineering/QUALITY_GATES.md) as they are created.

### 9. PWA foundation
- Web app manifest via the Next.js metadata route (`app/manifest.ts`), with theme colors mirroring the tokens.
- Service worker: **Serwist** if it supports the installed Next.js version and bundler. Otherwise, a minimal hand-written service worker following the official Next.js PWA guide. The worker checks this at task time and records the choice in PROGRESS.md.
- **Scope: installability and app-shell caching only.** No offline data, sync, or push notifications. The offline scope remains TBD.

### 10. CI
- **GitHub Actions** (the repository is on GitHub): install with a frozen lockfile, then `check` and `build` on pushes and pull requests. End-to-end tests in CI follow once they are stable.
- Agents never push. CI runs when the owner pushes.

## Alternatives considered

| Area | Option | Why not (now) |
|---|---|---|
| Repository | Two repositories (web, api) | Any code shared later would need publishing or duplication, which risks conflicting with I-2 |
| Repository | Turborepo / Nx | Orchestration and caching are not needed for two apps. Can be added later without restructuring. |
| Persistence | Other databases / ORMs | Not evaluated in this ADR. PostgreSQL and Prisma were decided directly by the owner. |
| Package manager | npm workspaces | Workable, but looser dependency isolation (phantom dependencies) and slower installs |
| Package manager | Yarn | No advantage over pnpm here |
| Styling | CSS Modules / vanilla-extract | Viable. Tailwind v4's CSS-first `@theme` gives one token source plus utilities with less custom code. |
| Localization | i18next / react-i18next, Lingui, FormatJS | next-intl is built around the App Router and Server Components, with the least glue code |
| Locale routing | Cookie-only locale (no URL prefix) | Links cannot carry a language, and caching and SEO are worse |
| Testing | Jest for the API | The NestJS default up to v11. NestJS 12 generates Vitest, so Jest would mean a second runner configured by hand |
| Testing | Jest everywhere | Slower, with heavier ESM/TS configuration for the Next.js app |
| PWA | next-pwa | Unmaintained |
| Runtime | Node 22 (installed) | Leaves maintenance in April 2027 |
| — | Defer the foundation | Blocks all autonomous work. Pattern decisions would leak into feature tasks. |

## Why this decision

- **Correctness:** a monorepo lets web and api share code without duplication when real shared code appears, which protects single-source rules such as I-2.
- **Simplicity:** framework defaults where they exist (Nest + Vitest, Next + App Router, one test runner). Nothing added before a current need (no Turborepo, no Prisma scaffolding, no UI kit, no offline data).
- **Consistency:** one TypeScript base config, one lint and format setup, one token source, one place for gate commands.

## Consequences

- **Positive:** workers can execute the Foundation milestone without making project-wide decisions. Gates exist before feature code.
- **Costs accepted:** Node 24 must be installed on the development machine. Locale-prefixed URLs commit us to a URL structure early.
- **Harder to change later:** monorepo layout, locale URL structure, Tailwind as the styling mechanism.

## Follow-up / migration notes

- **Before work starts:** owner installs Node 24 LTS (TASKS.json `F-00`).
- **Docs that tasks update when the setup is real:** QUALITY_GATES.md (commands), CLAUDE.md (commands, current state), ARCHITECTURE.md (confirmed table), BOUNDARIES.md (web/api/packages boundaries plus lint enforcement), DESIGN_SYSTEM.md (token source path), LOCALIZATION.md (technical section), and narrowing the path-scoped rule globs to `apps/*`.
- **Expected future ADRs, created only when needed:** API contracts and validation, authentication, hosting and data residency, AI provider, content model.
