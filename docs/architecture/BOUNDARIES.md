# Boundaries

Canonical owner of **module and dependency boundaries**.

## Workspaces

| Workspace | Owns | May import from | Must not |
|---|---|---|---|
| `apps/web` | Next.js UI: pages, components, localization, design tokens, PWA shell | its own code, `packages/*` | import from `apps/api`; access the database; own business rules |
| `apps/api` | NestJS HTTP API; persistence (Prisma, PostgreSQL) | its own code, `packages/*` | import from `apps/web` |
| `packages/*` | Code that both apps genuinely need (e.g. IELTS domain rules, INVARIANTS I-2). Created only when such code exists. | other packages | import from `apps/*` |

- **Enforcement:** `pnpm lint` fails on any import between `apps/web` and `apps/api` (`import/no-restricted-paths` in `eslint.config.mjs`). When the first package is created, add a zone so `packages/*` cannot import from `apps/*`.
- **Database access:** only `apps/api`, only through `PrismaService` from `apps/api/src/database/` (`DatabaseModule`). It is the one Prisma client and the only application code that reads `DATABASE_URL` (the Prisma CLI reads it in `apps/api/prisma.config.ts`).
- The web app talks to the API over HTTP only. Contracts follow [ADR-0002](decisions/0002-api-contracts-and-validation.md): DTO and response classes in `apps/api`, validated by the global `ValidationPipe`, and every error in one format (`apps/api/src/errors/`). Prisma types never appear in a response. How the web app gets these types is still open ([ARCHITECTURE.md](ARCHITECTURE.md#open-decisions-tbd)).
- Module boundaries inside `apps/api` wait for its feature structure decision. The layering below is the intended direction.

## Modules inside `apps/web`

Decided in [ADR-0004](decisions/0004-web-feature-structure.md). Folders under `apps/web/src`:

| Folder | Holds | May import | Must not import | Lint enforcement |
|---|---|---|---|---|
| `domain/` | Pure product and IELTS rules (the guest's goal; the Reading content contract and session) | other `domain/` files | React, Next.js, next-intl, `node:*`, and every other `src/` folder | Yes: `import/no-restricted-paths` zone and `no-restricted-imports` |
| `data/` | Data access: the goal cookie on the server (ADR-0003), Reading sessions in the browser's `localStorage` (ADR-0006) and the Reading attempt history in IndexedDB (ADR-0009) | `domain/`, Next.js server APIs | `app/`, `features/`, `components/` | Yes: `import/no-restricted-paths` zone |
| `components/` | UI used by two or more features | other `components/`, `i18n/` | `features/`, `data/`, `app/` | Added when the folder is created (M3-07) |
| `features/<f>/` | A feature's screens and Server Actions | its own folder, `domain/`, `data/`, `components/`, `i18n/` | another feature, `app/` | Added when the folder is created (M3-07) |
| `app/` | Routes, layouts, the shell; thin pages | everything above | | |

- `proxy.ts` may import `domain/` and `data/` (it reads the goal cookie from the request), never `features/` or `components/`.
- The zones resolve the `@/*` alias through the apps' tsconfig files, so `@/data/...` and `../data/...` are checked alike.

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

## Rules for defining boundaries later

- Draw a boundary only where it protects something real: domain correctness, a security edge, or a dependency we may realistically swap. Do not add layers for symmetry.
- Each boundary, once it exists, must be enforceable by tooling (for example lint import restrictions). A boundary that exists only in prose will erode.
