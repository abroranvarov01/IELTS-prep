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
- The web app talks to the API over HTTP only. The contract approach is TBD ([ARCHITECTURE.md](ARCHITECTURE.md#open-decisions-tbd)).
- Module boundaries inside each app wait for the feature folder structure decision. The layering below is the intended direction.

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
