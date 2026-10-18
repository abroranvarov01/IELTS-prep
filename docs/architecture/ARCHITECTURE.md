# Architecture

Canonical owner of the **current high-level architecture** and the list of open architecture decisions.

> **Current state (2026-10-09):** the Foundation milestone ([ROADMAP.md](../execution/ROADMAP.md)) is implemented: the setup in ADR-0001 exists in code. No product features exist yet.

## Confirmed decisions

Changing these requires owner approval and an ADR.

| Decision | Source |
|---|---|
| **Frontend: Next.js. Backend: NestJS. TypeScript end-to-end.** | Owner, 2026-10-09 ([ADR-0001](decisions/0001-initial-application-foundation.md)) |
| **Persistence: PostgreSQL + Prisma ORM** (api only; Prisma Client and `DatabaseModule` in `apps/api` since M2-03, no models yet) | Owner, 2026-10-09 ([ADR-0001](decisions/0001-initial-application-foundation.md)) |
| The product is a **mobile-first web app delivered as a PWA** | Product brief |
| Interface languages: Uzbek, Russian, English. Test content in English. | [LOCALIZATION.md](../product/LOCALIZATION.md) |
| AI scores are always presented as estimates | [PRODUCT.md](../product/PRODUCT.md#honest-feedback-non-negotiable) |
| Launch market is Uzbekistan. No multi-region architecture up front. | [PRODUCT.md](../product/PRODUCT.md) |
| **Foundation:** pnpm-workspace monorepo (`apps/web`, `apps/api`, `packages/*` on demand), Node 24 LTS, Tailwind CSS v4 tokens, next-intl with locale-prefixed URLs (`uz` default), Vitest (web and api) and Playwright, ESLint and Prettier, a PWA shell (Serwist, app-shell caching only), GitHub Actions CI. Implemented. | [ADR-0001](decisions/0001-initial-application-foundation.md), Accepted 2026-10-09 (amended §5, §7) |
| **API contracts and validation:** REST + JSON, NestJS DTO and response classes, class-validator with one global `ValidationPipe` that rejects unknown properties, one error format for every error, OpenAPI via `@nestjs/swagger` outside production, no shared contracts package yet. Implemented in `apps/api` (`src/errors/`, `src/openapi.ts`). | Owner, 2026-10-10 ([ADR-0002](decisions/0002-api-contracts-and-validation.md)) |
| **Guest goal state:** the onboarding answers (exam type, target band) in one first-party cookie written by Server Actions and read only on the server; parsed by one domain function; no personal data, no practice state. | Owner, 2026-10-10 ([ADR-0003](decisions/0003-guest-state-on-the-device.md)) |
| **`apps/web` structure: Feature-Sliced Design.** Layers `app` (the Next.js App Router and `proxy.ts`), `views` (the FSD pages layer), `widgets`, `features`, `entities`, `shared`; slices with public APIs; pure `model/` segments; layer direction, slice isolation and public APIs enforced by lint. Rules: [BOUNDARIES.md](BOUNDARIES.md#modules-inside-appsweb-feature-sliced-design). | Owner, 2026-10-11 ([ADR-0010](decisions/0010-feature-sliced-design-in-apps-web.md), superseding ADR-0004 of 2026-10-10) |
| **Reading content contract:** tests as JSON with stable sentence ids, structured gap texts and word limits as data, the answer key in a separate file not sent to the browser in M4, one domain validator. | Owner, 2026-10-10 ([ADR-0005](decisions/0005-reading-content-contract.md)) |
| **Reading session state:** a pure session model with one transition function, a timer derived from the stored start, kept per test in validated `localStorage`; `useReducer` and context, no state library. | Owner, 2026-10-10 ([ADR-0006](decisions/0006-reading-session-state.md)) |
| **Reading UI building blocks:** a hand-built non-modal question sheet, React-rendered sentence targets, native `<dialog>` for the Exam exit confirmation; no UI or animation library for this. | Owner, 2026-10-10 ([ADR-0007](decisions/0007-reading-ui-primitives.md)) |
| **Reading answer checking and explanations:** one domain checking module with a rules version, run in the browser on the results and review pages; a key revision and fingerprint tests; pre-written per-locale explanation files with a review status (`aiDraft`, `reviewed`, `approved`); no band conversion and no runtime AI. | Owner, 2026-10-11 ([ADR-0008](decisions/0008-reading-answer-checking-and-explanations.md)) |
| **Reading attempts on the device:** sessions stay in `localStorage`; committed attempts, result records and first-try markers in IndexedDB transactions, so the first committed attempt survives across tabs; a random id per session; sources removed only after their transaction has completed; result records per key revision and rules version; M4 sessions imported without invented results. | Owner, 2026-10-11 ([ADR-0009](decisions/0009-reading-attempts-on-the-device.md)) |
| **Level-check forms, results and storage:** a form in the Reading content contract under its own id and version, kept out of the Reading catalog; the Reading session model in a separate `localStorage` entry; a separate IndexedDB database with append-only attempts and result records keyed by form, key, checking-rules and level-rules versions; a pure level module with its own version and no band type; a state-only cookie so Home knows find / continue / practise. | Owner, 2026-10-18 ([ADR-0011](decisions/0011-level-check-forms-results-and-storage.md)) |

Still TBD until a current requirement exists: database schema (M2 adds Prisma without product models, owner decision 2026-10-10).

## Open decisions (TBD)

Do not invent answers to these in code. Each one is a candidate ADR.

- **Hosting and data residency.** Uzbekistan's personal-data law contains data-localization requirements for citizens' personal data. Check the legal requirements before choosing hosting or managed databases.
- **API types in the web app.** How `apps/web` gets the API's request and response types (generated from the OpenAPI document, a shared package, or something else). Decide with the first web consumer of an endpoint ([ADR-0002 §6](decisions/0002-api-contracts-and-validation.md)).
- **Guest practice state before accounts.** Where practice answers, attempts and unfinished activities are kept. For Reading, decided in [ADR-0006](decisions/0006-reading-session-state.md) (accepted); finished attempts and their results: [ADR-0009](decisions/0009-reading-attempts-on-the-device.md) (accepted). For Listening sessions, proposed in [ADR-0013](decisions/0013-listening-audio-delivery-and-session-state.md) §3. The guest's goal is decided ([ADR-0003](decisions/0003-guest-state-on-the-device.md)).
- **Authentication.** Methods (phone/SMS, Telegram, Google, email) and when registration is offered. Practice before registration is already a product decision ([PRODUCT.md](../product/PRODUCT.md#approved-product-principles)).
- **AI provider and evaluation pipeline** for Writing/Speaking. This includes how estimates are calibrated and how user content is handled. M5 uses no AI for Reading explanations (owner, M5-01); the decisions an AI option would need first are listed in [READING_EXPERIENCE.md, Explanations and the AI decision (M5)](../product/READING_EXPERIENCE.md#explanations-and-the-ai-decision-m5).
- **Audio.** Delivery of Listening audio on weak connections. Capture, upload, and processing of Speaking recordings. The Listening audio assets (format, size targets, one file per part, provenance) are proposed in [ADR-0012](decisions/0012-listening-content-contract-and-audio-assets.md) (M8-03); their delivery as hashed static files with immutable caching, the Exam download into Cache Storage, and the constraints production hosting must meet (M14) in [ADR-0013](decisions/0013-listening-audio-delivery-and-session-state.md) (M8-04); both await M8-06.
- **Offline scope.** What works offline (for example downloaded Reading sets) and how results sync.
- **Content model and authoring.** How passages, questions, answer keys, and explanations are authored, versioned, and reviewed. The Reading content contract is decided in [ADR-0005](decisions/0005-reading-content-contract.md) (accepted); answer checking and explanation files: [ADR-0008](decisions/0008-reading-answer-checking-and-explanations.md) (accepted); the Listening contract, with transcripts and images shared with Reading, is proposed in [ADR-0012](decisions/0012-listening-content-contract-and-audio-assets.md); authoring, review and delivery stay with the content system (M13).
- **Analytics and privacy.** What is measured, with what tool, and the consent requirements (including for minors).
- **Feature folder structure inside `apps/api`.** Decide with its first feature module. (`apps/web`: [ADR-0010](decisions/0010-feature-sliced-design-in-apps-web.md), accepted.)

## Related

- Module and dependency boundaries: [BOUNDARIES.md](BOUNDARIES.md)
- Must-always-hold statements: [INVARIANTS.md](INVARIANTS.md)
- Decision records: [decisions/](decisions/README.md)
