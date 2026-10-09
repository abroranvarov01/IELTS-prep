# Architecture

Canonical owner of the **current high-level architecture** and the list of open architecture decisions.

> **Current state (2026-10-09):** no application code exists. The repository contains only governance and documentation. Nothing below is implemented. The Foundation milestone ([ROADMAP.md](../execution/ROADMAP.md)) builds the setup described in ADR-0001.

## Confirmed decisions

Changing these requires owner approval and an ADR.

| Decision | Source |
|---|---|
| **Frontend: Next.js. Backend: NestJS. TypeScript end-to-end.** | Owner, 2026-10-09 ([ADR-0001](decisions/0001-initial-application-foundation.md)) |
| **Persistence: PostgreSQL + Prisma ORM** (api only; not scaffolded until a persistence requirement exists) | Owner, 2026-10-09 ([ADR-0001](decisions/0001-initial-application-foundation.md)) |
| The product is a **mobile-first web app delivered as a PWA** | Product brief |
| Interface languages: Uzbek, Russian, English. Test content in English. | [LOCALIZATION.md](../product/LOCALIZATION.md) |
| AI scores are always presented as estimates | [PRODUCT.md](../product/PRODUCT.md#honest-feedback-non-negotiable) |
| Launch market is Uzbekistan. No multi-region architecture up front. | [PRODUCT.md](../product/PRODUCT.md) |

## Foundation (ADR-0001, Accepted 2026-10-09; not yet implemented)

[ADR-0001](decisions/0001-initial-application-foundation.md) also decides the rest of the foundation: a pnpm-workspace monorepo (`apps/web`, `apps/api`, `packages/*` on demand), Node 24 LTS, Tailwind CSS v4 tokens, next-intl with locale-prefixed URLs, Vitest/Playwright, ESLint and Prettier, a PWA shell, and GitHub Actions CI. The Foundation milestone implements it.

Still TBD until a current requirement exists: database schema, API contract and validation approach.

## Open decisions (TBD)

Do not invent answers to these in code. Each one is a candidate ADR.

- **Hosting and data residency.** Uzbekistan's personal-data law contains data-localization requirements for citizens' personal data. Check the legal requirements before choosing hosting or managed databases.
- **API contracts and validation.** How web and api share request/response types and validate input. Decide with the first real endpoint.
- **Authentication.** Methods (phone/SMS, Telegram, Google, email) and when registration is offered. Practice before registration is already a product decision ([PRODUCT.md](../product/PRODUCT.md#approved-product-principles)).
- **AI provider and evaluation pipeline** for Writing/Speaking. This includes how estimates are calibrated and how user content is handled.
- **Audio.** Delivery of Listening audio on weak connections. Capture, upload, and processing of Speaking recordings.
- **Offline scope.** What works offline (for example downloaded Reading sets) and how results sync.
- **Content model and authoring.** How passages, questions, answer keys, and explanations are authored, versioned, and reviewed.
- **Analytics and privacy.** What is measured, with what tool, and the consent requirements (including for minors).
- **Feature folder structure** inside `apps/web` and `apps/api`. Decide with the first feature.

## Related

- Module and dependency boundaries: [BOUNDARIES.md](BOUNDARIES.md)
- Must-always-hold statements: [INVARIANTS.md](INVARIANTS.md)
- Decision records: [decisions/](decisions/README.md)
