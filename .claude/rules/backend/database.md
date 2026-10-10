---
paths:
  - "apps/api/prisma/**"
  - "apps/api/prisma.config.ts"
  - "apps/api/src/database/**"
---

# Database schema and migrations

Persistence is PostgreSQL + Prisma, in `apps/api` only (ADR-0001 §4a, docs/architecture/BOUNDARIES.md). Commands: docs/engineering/QUALITY_GATES.md.

- **No model without a feature task that needs it** (owner decision 2026-10-10). No speculative tables, columns, or seed data.
- **Change the schema only through a migration.** Edit `schema.prisma`, run `pnpm --filter api db:migrate --name <what-changed>` against the local database, and commit the schema change and the new migration folder (plus `migration_lock.toml` the first time) in the same commit.
- **Never edit or delete a committed migration.** Fix mistakes with a new migration.
- **Outside your local database, migrations are applied only with `db:deploy`** (`prisma migrate deploy`). `migrate dev`, `migrate reset`, and `db push` are local-only tools.
- **`db:check` must pass.** It fails when the database, built from the committed migrations by `db:deploy`, differs from `schema.prisma`.
- **Prisma models and generated types never appear in controller signatures or API responses.** Map them to response classes (ADR-0002 §2).
- Database access goes through `PrismaService` from `src/database/`. Queries follow `.claude/rules/security/security.md` (no SQL built from strings).
