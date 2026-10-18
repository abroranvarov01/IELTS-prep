# Boundaries

Canonical owner of **module and dependency boundaries**.

## Workspaces

| Workspace    | Owns                                                                                                              | May import from            | Must not                                                        |
| ------------ | ----------------------------------------------------------------------------------------------------------------- | -------------------------- | --------------------------------------------------------------- |
| `apps/web`   | Next.js UI: pages, components, localization, design tokens, PWA shell                                             | its own code, `packages/*` | import from `apps/api`; access the database; own business rules |
| `apps/api`   | NestJS HTTP API; persistence (Prisma, PostgreSQL)                                                                 | its own code, `packages/*` | import from `apps/web`                                          |
| `packages/*` | Code that both apps genuinely need (e.g. IELTS domain rules, INVARIANTS I-2). Created only when such code exists. | other packages             | import from `apps/*`                                            |

- **Enforcement:** `pnpm lint` fails on any import between `apps/web` and `apps/api` (`import/no-restricted-paths` in `eslint.config.mjs`). When the first package is created, add a zone so `packages/*` cannot import from `apps/*`.
- **Database access:** only `apps/api`, only through `PrismaService` from `apps/api/src/database/` (`DatabaseModule`). It is the one Prisma client and the only application code that reads `DATABASE_URL` (the Prisma CLI reads it in `apps/api/prisma.config.ts`).
- The web app talks to the API over HTTP only. Contracts follow [ADR-0002](decisions/0002-api-contracts-and-validation.md): DTO and response classes in `apps/api`, validated by the global `ValidationPipe`, and every error in one format (`apps/api/src/errors/`). Prisma types never appear in a response. How the web app gets these types is still open ([ARCHITECTURE.md](ARCHITECTURE.md#open-decisions-tbd)).
- Module boundaries inside `apps/api` wait for its feature structure decision. The layering below is the intended direction.

## Modules inside `apps/web`: Feature-Sliced Design

Decided in [ADR-0010](decisions/0010-feature-sliced-design-in-apps-web.md) (it supersedes ADR-0004). This section owns the rules; tools enforce them (see "Enforcement" below).

### Layers

`apps/web/src` has six layers. A layer imports only the layers **below** it in this table, and every file belongs to one of them.

| Layer    | Folder                                         | Holds                                                                                                                                                         | Today                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| -------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| app      | `app/` (the Next.js App Router) and `proxy.ts` | Routes and route groups, layouts, `error`, `not-found`, `global-error`, metadata, the manifest, the service worker, fonts, global CSS. Route files stay thin. |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| pages    | `views/`                                       | One slice per page, or per group of closely related pages: what the page shows, its page-only parts, its Server Actions                                       | `home`, `onboarding`, `level-check` (the intro and the result), `practice` (the Practice Hub), `reading-test` (the test, its retry and the level-check section, which is the test screen by removal, ADR-0011 §2), `reading-results` (the results, the review and the level-check review, which is the review on the check's attempt), `listening-test` (the Listening start screen, the Exam download and its one tap, the screen with player, questions, bottom bar and navigator, and the finished page)                                                                                                                                                                                                                                                                                                                                   |
| widgets  | `widgets/`                                     | A large block of UI used by several pages or layouts                                                                                                          | `shell` (header, language switcher, product navigation, main landmark), `reading-layout` (the test bar frame, the bottom sheet and the skip link, shared by the Reading test and its review)                                                                                                                                                                                                                                                                                                  |
| features | `features/`                                    | A user capability with a narrow contract, used by more than one block                                                                                         | `answer-question` (the answer control of every question type, the option list, a group's shared text, and for the review what a question asks and the options it offers), `mark-passage` (selecting sentences by touch and keyboard, highlighting, Pin Evidence, the evidence list, the passage's review marks), `listening-player` (the Practice and Exam players around one audio element, ADR-0013 §2, §3), `answer-listening` (a Listening question group with every question's control in place: option rows, letter buttons, fields in the text, tables, flow charts, labelling)                                                                                                                                                                               |
| entities | `entities/`                                    | A product concept: its rules (`model/`), its data access (`api/`), its React binding (`ui/`)                                                                  | `goal` (the guest's goal and its cookie, ADR-0003), `reading` (the Reading content contract, units, session, checking, attempts, results, explanations; `localStorage` sessions and the IndexedDB history; the running session's context) , `level-check` (the level check's result model, ADR-0011 §4; its attempts and result records in their own IndexedDB database and the state cookie, ADR-0011 §3, §5). It takes plain data (scored positions, a finished section), so it never imports `reading`: the page that owns the check runs the Reading session and checking module and passes their output; `listening` (the Listening content contract: the test, transcript and key validators, ADR-0012; the check of a test's media files on disk, `api/assets.server.ts`; the session with its Exam clock, playback coverage and its `localStorage` entries, ADR-0013 §3; checking and signals, ADR-0014 §6; committed attempts, result records and first-try markers in its own IndexedDB database `ielts-prep-listening`, with the import of M8 finished sessions, ADR-0014 §1–§5; the shipped tests, `content.server.ts`; the Exam audio download into Cache Storage, ADR-0013 §2) |
| shared   | `shared/`                                      | Infrastructure and primitives with no product knowledge                                                                                                       | `ui` (the primary button and link, the quiet link and the quiet button, the secondary button, the desktop-breakpoint hook, the visible-element lookup, the answer option, the option row, the status message, the line icons (with the Reading and Listening skill icons) and illustrations, the layouts shared by Reading and Listening (`CompletionTable`, `FlowChart`, `LabelledPicture`), the arc motif and the accent panel, `tokens.css`), `i18n` (routing, locale-aware navigation, the next-intl request config), `lib` (the device's `localStorage` and new session ids, shared by the Reading and Listening sessions), `content` (the content shapes and readers the Reading and Listening contracts share, ADR-0012 §7: origins, options, gap texts, word limits, review statuses, how a gap is answered, tables, flow charts, labelling, images, provenance, hashed file names; structure only, except the typed-answer normalization both skills' checking shares, ADR-0014 §6; no other checking rules)                                                                                                                    |

- The FSD pages layer is named **`views`** so that Next.js never treats it as a Pages Router. There is no `src/pages`.
- **Slices of one layer never import each other.** What two slices need moves to a lower layer. There are no `@x` cross-imports; adding one needs a reason recorded here first.

### Segments

Inside a slice (and in `shared`), code is grouped by purpose:

| Segment  | Holds                                                                                                                                           | Must not                                                                                                                                 |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `model/` | Plain TypeScript: domain and IELTS rules, parsers of untrusted data, reducers, view-model functions (INVARIANTS I-3, I-4)                       | import React, Next.js, next-intl, `node:*`; use `window`, `document`, `navigator` or browser storage; import its slice's `ui/` or `api/` |
| `api/`   | I/O: `localStorage` and IndexedDB adapters, the goal cookie, content loading (`*.server.ts`), Server Actions (`api/actions.ts`, `"use server"`) | import React or its slice's `ui/`                                                                                                        |
| `ui/`    | React components, and the hooks and context that serve them                                                                                     |                                                                                                                                          |

A segment is created by the first file that needs it. No empty segments or slices.

File names: React components in PascalCase (`AnswerControl.tsx`), every other module in kebab-case, hooks included (`use-reading-session.ts`, `load-result.ts`). Tests sit next to the code they test (`*.test.ts(x)`).

### Public API

- A slice is used only through files at its root: **`index.ts`**; server-only entry points **`*.server.ts`**, imported by the app layer only; and **`testing.ts`**, fixtures imported by tests only. Everything else in a slice is internal.
- `index.ts` names what it exports (no `export *`) and exports only what another slice uses today.
- Inside a slice, files import each other relatively, never through their own `index.ts` (that would be a cycle).
- `shared` has no slices: its modules are imported by path, for example `@/shared/ui/PrimaryLink` or `@/shared/i18n/routing`, so a client component or the proxy loads only what it uses.
- Examples: the results route imports `readingKey` from `@/entities/reading/keys.server`; the test route imports `readingTest` from `@/entities/reading/content.server` and never the keys (ADR-0008 §2); the level-check routes import the form, and the result and review routes its key and explanations, from `@/entities/reading/forms.server`; a view imports `apply` from `@/entities/reading`, never from `@/entities/reading/model/session`.

### Next.js routing

- URLs and route groups are unchanged: `app/[locale]/(valid-locale)/(shell)/…` for pages inside the shell with the product navigation, `app/[locale]/(valid-locale)/(onboarding)/start/…` for the onboarding steps (the shell without navigation, M6-05), `app/[locale]/(valid-locale)/reading/[testId]` for the test screen, which has its own test bar, and `app/[locale]/(valid-locale)/level-check/reading` and `level-check/review` for the level-check section and its review, likewise (its intro and result are shell pages under `(shell)/level-check`).
- A route file reads its params, sets metadata, loads server-only data through a `*.server.ts` entry point, and renders one view (for example `ReadingScreen` from `@/views/reading-test`). It holds no product logic and no markup beyond that.
- Server-only content (tests, keys, explanations) is loaded in route files and passed to views as props. Client components never import a `*.server.ts` entry point.
- `proxy.ts` belongs to the app layer: it reads the goal cookie and the test list through public APIs (`@/entities/goal`, `@/entities/reading/content.server`).

### Placing code

Start where the code is used and move it down only when a second consumer exists:

1. **A product or IELTS rule** (checking, scoring, goal parsing, the session's transitions): the `model/` of the entity it is about (`entities/reading/model/scoring.ts`). A rule only one page uses, and that is about that page's flow, may live in the page's `model/` (`views/home/model/next-action.ts`), still pure.
2. **Reading or writing storage, cookies or content files:** the `api/` of the entity whose data it is (`entities/reading/api/history.ts`). Server-only loading gets a `*.server.ts` entry point.
3. **Orchestration** (the order of loading, saving, committing and navigating for a screen): a hook in the page's `ui/` (`views/reading-test/ui/use-reading-session.ts`), or the page's `api/` when it renders nothing (`views/reading-results/api/load-result.ts`).
4. **UI only one page uses:** that page's `ui/` (`QuestionSheet`, `QuestionColumn`, `QuestionBar` in `views/reading-test`).
5. **A user capability that several blocks or pages use:** a feature (`AnswerControl` serves the phone sheet and the desktop column).
6. **A large block several pages or layouts use:** a widget (`Shell` serves the shell layout, `error` and `not-found`).
7. **A primitive without product knowledge** (a button, the option row, locale routing): `shared`. Reading-specific behavior does not move to `shared` because it looks reusable.

### Enforcement

| Rule                                                                                                                                                                      | Tool                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Layer direction; slices of one layer isolated; public API only; `*.server.ts` from the app layer only; `model/` never imports `ui/` or `api/`, `api/` never imports `ui/` | `import/no-restricted-paths` zones generated from the folders in `eslint.config.mjs`. They resolve the `@/*` alias and relative paths alike, and check imports, `export … from`, `import()` and `require` |
| Fixtures and test helpers (`testing.ts`, `testing/`, `*.fixture.ts`) only in tests                                                                                        | the same rule, for non-test files                                                                                                                                                                         |
| `model/` is pure; `api/` never imports React                                                                                                                              | `no-restricted-imports`, `no-restricted-globals`                                                                                                                                                          |
| No import cycles                                                                                                                                                          | `import/no-cycle`                                                                                                                                                                                         |
| Every file is in a layer (no `src/pages`)                                                                                                                                 | `no-restricted-syntax` on files outside the layers                                                                                                                                                        |
| The rules above still reject what they should                                                                                                                             | `scripts/check-architecture.mjs` (run by `pnpm lint`): lints representative forbidden imports in every spelling and fails if one is accepted                                                              |

## Intended layering (proposal)

```
UI (screens, components)  ──►  Domain (IELTS rules, scoring, answer checking, recommendations)
        │                               ▲
        ▼                               │
Application / data access  ─────────────┘
(fetching, persistence, AI calls, offline sync)
```

- **Domain** is plain TypeScript. It does not depend on React, the framework, the database client, or an AI SDK. It can be tested without rendering anything.
- **UI** renders state and collects input. It calls domain functions. It never re-implements domain rules.
- **Data access / integrations** (database, AI provider, storage, audio) sit behind interfaces that are only as wide as current use requires. These are not generic "adapters" for providers we do not use.
- **Database entities are not public API contracts.** API responses use explicit types.
- In `apps/web` these are the segments of each slice: `ui/`, `model/` and `api/` (above).

## Rules for defining boundaries later

- Draw a boundary only where it protects something real: domain correctness, a security edge, or a dependency we may realistically swap. Do not add layers for symmetry.
- Each boundary, once it exists, must be enforceable by tooling (for example lint import restrictions). A boundary that exists only in prose will erode.
