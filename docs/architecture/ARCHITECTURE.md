# Architecture

Canonical owner of the **current high-level architecture** and the list of open architecture decisions.

> **Current state (2026-10-09):** the Foundation milestone ([ROADMAP.md](../execution/ROADMAP.md)) is implemented: the setup in ADR-0001 exists in code. No product features exist yet.

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
| **Foundation:** pnpm-workspace monorepo (`apps/web`, `apps/api`, `packages/*` on demand), Node 24 LTS, Tailwind CSS v4 tokens, next-intl with locale-prefixed URLs (`uz` default), Vitest (web and api) and Playwright, ESLint and Prettier, a PWA shell (Serwist, app-shell caching only), GitHub Actions CI. Implemented. | [ADR-0001](decisions/0001-initial-application-foundation.md), Accepted 2026-10-09 (amended §5, §7) |

Still TBD until a current requirement exists: database schema (M2 adds Prisma without product models, owner decision 2026-10-10), API contract and validation approach (ADR-0002, Proposed).

## Open decisions (TBD)

Do not invent answers to these in code. Each one is a candidate ADR.

- **Hosting and data residency.** Uzbekistan's personal-data law contains data-localization requirements for citizens' personal data. Check the legal requirements before choosing hosting or managed databases.
- **API contracts and validation.** Proposed in [ADR-0002](decisions/0002-api-contracts-and-validation.md) from the owner's 2026-10-10 decisions (REST + JSON, DTO classes, class-validator with a global `ValidationPipe`, one error format, OpenAPI via `@nestjs/swagger`, no shared contracts package yet). Waiting for acceptance. How the web app gets API types is decided with its first consumer of an endpoint.
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
