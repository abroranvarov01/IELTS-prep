# ADR-0010: Feature-Sliced Design in apps/web

- **Status:** Accepted (2026-10-11, owner decision to adopt Feature-Sliced Design for the existing frontend in `apps/web`; the structure below was drafted by Claude and implemented in task M5-12). Supersedes [ADR-0004](0004-web-feature-structure.md).
- **Date:** 2026-10-11
- **Deciders:** Project owner (the decision to adopt FSD), Claude (draft and implementation)

## Context

[ADR-0004](0004-web-feature-structure.md) organized `apps/web/src` as `app/`, `features/<f>/`, `components/`, `domain/` and `data/`, with lint-enforced import rules. By M5 the folder `features/reading/` held about thirty files: the test screen, the question renderers of thirteen question types, highlighting and Pin Evidence, the desktop layout and the results page. `domain/` and `data/` held the whole Reading model and both of its storage adapters. `ReadingScreen.tsx` mixed the session's lifecycle, storage and history, the Exam clock, passage selection through document-wide listeners, scroll positions and the responsive layout.

On 2026-10-11 the owner decided to adopt Feature-Sliced Design (FSD) for the existing frontend, preserving every approved behavior and stored data, and authorized the refactoring this needs.

Forces:
- **Next.js owns two folder names.** `src/app` is the App Router; a `src/pages` folder becomes the Pages Router.
- **Rules stay pure** (INVARIANTS I-3, I-4): ADR-0004's lint-enforced pure `domain/` must not be lost.
- **The answer key stays off the test route** (ADR-0008 §2): server-only content must not reach a client or route bundle through a re-export file.
- **A boundary counts only when a tool enforces it** (BOUNDARIES.md).
- **No speculative structure** (CODE_QUALITY.md): no empty layers, no slice per component, no new runtime dependency.

## Decision

### 1. Layers and slices
`apps/web/src` has these layers, from the highest. A layer imports only the layers below it. Slices of one layer never import each other.

| Layer | Folder | Slices today |
|---|---|---|
| app | `app/` (the Next.js App Router) and `proxy.ts` | none: routes, layouts, special files, metadata, the manifest and service worker, fonts, global CSS |
| pages | `views/` | `home`, `onboarding`, `level-check`, `reading-test`, `reading-results` |
| widgets | `widgets/` | `shell` |
| features | `features/` | `answer-question`, `mark-passage` |
| entities | `entities/` | `goal`, `reading` |
| shared | `shared/` | none: segments `ui`, `i18n` |

- The FSD pages layer is named **`views`**, so it can never become a Next.js Pages Router. Lint rejects any file outside the layers, a `src/pages` folder included.
- **`entities/reading` is one slice**: the content contract, question units, the session, answer checking, attempts, results and explanations depend on each other closely, and ADR-0009's commit protocol spans the session store and the attempt history. Splitting them would need cross-imports between entities.
- No `@x` cross-imports between slices exist; adding one needs a reason recorded in BOUNDARIES.md.

### 2. Segments inside a slice
- `model/`: plain TypeScript (the domain rules, parsers, reducers, view-model functions). No React, Next.js, next-intl, Node or browser APIs, and nothing from the slice's `ui/` or `api/`. Testable without rendering.
- `api/`: I/O (`localStorage`, IndexedDB, the goal cookie, content files, Server Actions). Never React, never the slice's `ui/`.
- `ui/`: React components, and the hooks and context that serve them.

### 3. Public API
- A slice is imported only through files at its root: `index.ts`, server-only entry points named `*.server.ts` (imported by the app layer only), and `testing.ts` (fixtures, imported by tests only).
- Inside a slice, files import each other relatively, never through the slice's own `index.ts`.
- Re-export files name what they export; no `export *`.
- `shared` has no slices; its modules are imported by path (`@/shared/ui/PrimaryLink`, `@/shared/i18n/routing`), which keeps the proxy and client bundles free of unrelated modules.

### 4. Next.js
- Route files stay thin: route params, metadata, server data from a `*.server.ts` entry point, and one view.
- Server-only content (the tests, answer keys, explanations) is loaded in route files and passed to views as props. The test route imports `content.server.ts` only, never `keys.server.ts`.
- The next-intl request config moved to `shared/i18n/request.ts` (named in `next.config.ts`).

### 5. Enforcement
`pnpm lint` enforces this with the existing ESLint tooling. `import/no-restricted-paths` zones are generated from the folders, so new slices are covered without editing the config. The zones resolve the `@/*` alias and relative paths alike, and check imports, re-exports, dynamic `import()` and `require`. `no-restricted-imports` and `no-restricted-globals` keep `model/` pure and `api/` free of React. `import/no-cycle` rejects cycles, including one through a slice's own `index.ts`. `scripts/check-architecture.mjs` lints representative forbidden imports in every spelling and fails if any of them is accepted.

### 6. Where code named in earlier ADRs lives now

| Before (ADR-0004) | Now |
|---|---|
| `domain/goal.ts`, `domain/onboarding.ts`; `data/goal-cookie.ts` | `entities/goal/model/`; `entities/goal/api/` |
| `domain/next-action.ts` | `views/home/model/` |
| `domain/reading/*` | `entities/reading/model/` |
| `data/reading-session-storage.ts`, `data/reading-history.ts` | `entities/reading/api/session-storage.ts`, `history.ts` |
| `data/reading-content.ts`, `reading-keys.ts`, `reading-explanations.ts` | `entities/reading/api/*.server.ts`; entry points `content.server.ts`, `keys.server.ts` |
| `features/reading/reading-context.ts` | `entities/reading/ui/` |
| `features/home`, `features/onboarding` | `views/home`, `views/onboarding` (Server Actions in `api/actions.ts`) |
| `features/reading` | `views/reading-test`, `views/reading-results`, `features/answer-question`, `features/mark-passage` |
| `components/`, `features/reading/OptionRow.tsx`, `app/StatusMessage.tsx`, `styles/tokens.css` | `shared/ui/` |
| `i18n/` | `shared/i18n/` |
| `app/[locale]/Shell.tsx`, `LanguageSwitcher.tsx` | `widgets/shell/` |

## Alternatives considered

| Option | Pros | Cons |
|---|---|---|
| **A. FSD, pages layer named `views`, lint-enforced with the existing ESLint plugins (chosen)** | No Pages Router risk; no new dependency; every boundary checked in every import spelling | One FSD name differs from the methodology's; the zone generation is project code |
| B. FSD with `src/pages` and an empty root `pages/` folder (the FSD guide for Next.js) | The methodology's own names | A placeholder folder; deleting it silently turns `src/pages` into routes |
| C. Keep ADR-0004 and only split `ReadingScreen` | Least churn | Not the owner's decision; slices of the Reading feature stay unbounded |
| D. Pages only (all Reading UI inside its view slices, no features) | Fewest slices | Answering and passage marking are used by the phone sheet, the desktop column and the passage; a page slice cannot isolate them |
| E. `eslint-plugin-boundaries` or Steiger (the FSD linter) | Ready-made FSD rules | New dev dependencies for what `import/no-restricted-paths` already does |

## Why this decision

- **Correctness:** the domain stays pure and tested without rendering, server-only content stays in route files, and every boundary fails `pnpm lint` when broken, whatever the import spelling.
- **Clarity:** a file's folder says what it is (a page, a capability, a product concept, infrastructure), and a slice's `index.ts` says what others may use.
- **Simplicity:** six folders, slices only where code exists, no new dependency.

## Consequences

- **Positive:** M5-07 onward knows where every file goes; the Reading test page is split by responsibility (`useReadingSession`, `usePassagePosition`, `usePassageMarks`, `ExamTimer`, `TestWorkspace`); the Exam clock no longer renders the whole screen every second.
- **Costs accepted:** public API files to maintain; a component used by a second slice moves down a layer explicitly; the `views` name must be explained once (here and in BOUNDARIES.md).
- **Harder to change later:** the layer and slice names, once many files use them.

## Follow-up / migration notes

- **Implementation:** M5-12 (the moves, public APIs, the `ReadingScreen` split, the ESLint zones and `scripts/check-architecture.mjs`).
- **Docs:** BOUNDARIES.md owns the rules and how to place code; ARCHITECTURE.md lists this ADR; CODE_QUALITY.md, DEFINITION_OF_DONE.md, QUALITY_GATES.md, CLAUDE.md, the React rule and the worker skills point to it. ADR-0004 is superseded; the status lines of ADR-0003 and ADR-0005 to ADR-0009 point here for the new code locations.
- **Next:** when the review (M5-07) needs the navigator or the passage view outside the test page, the shared part moves to a lower layer then, not before.
