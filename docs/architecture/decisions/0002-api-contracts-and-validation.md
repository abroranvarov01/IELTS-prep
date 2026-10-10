# ADR-0002: API Contracts and Input Validation

- **Status:** Proposed (2026-10-10). Sections marked *Owner-decided* were decided directly by the project owner on 2026-10-10. The rest is the agent's proposal, waiting for the owner's acceptance (TASKS.json `M2-01`).
- **Date:** 2026-10-10
- **Deciders:** Project owner (decisions, acceptance), Claude (draft)

## Context

ADR-0001 §4 left the API contract and validation approach open "until a current requirement exists". M2 (Backend & Persistence Foundation) gives `apps/api` a database, and every feature after it (M3 onwards) adds endpoints that take user input. Without one agreed approach, each feature would invent its own request validation, error shape, and documentation.

Forces:
- **Security rule:** all untrusted input is validated at the boundary (`.claude/rules/security/security.md`).
- **BOUNDARIES.md:** database entities are not public API contracts, and API responses use explicit types. The web app talks to the API over HTTP only.
- **Localization (INVARIANTS I-6):** the web app shows every message in uz/ru/en, so the API must give it something stable to translate, not English sentences to display.
- **Privacy:** the product may be used by minors. Error responses and logs must not echo personal data or internals.
- No endpoint takes input yet. The first real consumers arrive in M3.

## Decision

### 1. Style: REST + JSON (*Owner-decided*)
Resource-oriented HTTP endpoints with JSON bodies. No GraphQL, no RPC framework.

### 2. Request and response shapes: NestJS DTO classes (*Owner-decided*)
- Every request body, query, and route-parameter object is a DTO class in `apps/api`. Every response has an explicit response class.
- Prisma models and generated Prisma types never appear in a controller signature or a response. Controllers map to response classes.

### 3. Validation: class-validator + class-transformer with one global `ValidationPipe` (*Owner-decided*)
- The pipe is registered **once, globally**, through the `APP_PIPE` provider so that the running app and tests built from `AppModule` validate in the same way. Controllers do not add their own validation pipes.
- Proposed options:
  - `whitelist: true` and `forbidNonWhitelisted: true`: unknown properties are rejected with 400, not silently dropped. A client bug is then visible.
  - `transform: true` with `enableImplicitConversion: false`: payloads become DTO instances. Type conversion (for example query strings to numbers) is declared per property with `@Type()`, never implicit.
  - `forbidUnknownValues: true` (the class-validator default, kept explicit).

### 4. One API error response format (*Owner-decided*: a consistent format. *Proposed*: its shape)
Every error response, including validation errors, unknown routes, and unexpected exceptions, has this JSON body:

```json
{
  "statusCode": 400,
  "code": "validation_failed",
  "message": "Request validation failed",
  "errors": [{ "field": "targetBand", "constraints": ["min"] }]
}
```

- `statusCode`: the HTTP status, repeated in the body.
- `code`: a stable, machine-readable `snake_case` identifier. **The web app translates `code` (and `constraints`) into uz/ru/en.** It never shows `message` to users.
- `message`: a short English text for developers and logs.
- `errors`: present only for validation failures. `field` is the property path (`answers.0.value` for nested values). `constraints` lists the failed class-validator constraint names (`isInt`, `min`, `whitelistValidation`, …).
- Rejected input values are **never** echoed.
- Unexpected exceptions return 500 with `code: "internal_error"` and a generic message. Stack traces, exception messages, and database errors never reach the client. The server logs the error without request bodies or personal data.
- One global exception filter, registered through `APP_FILTER`, produces this format. Initial codes: `validation_failed`, `not_found`, `internal_error`, plus the remaining HTTP errors under their snake-cased status name (`bad_request`, `service_unavailable`, …). Features add their own codes when they need them.

### 5. OpenAPI via `@nestjs/swagger` (*Owner-decided*)
- The OpenAPI document is generated from the DTO and response classes, so it cannot drift from the code.
- Proposed: **explicit decorators** (`@ApiProperty`, `@ApiOkResponse`, …). The Nest CLI Swagger plugin is not used. It only runs in `nest build`, so tests (Vitest) would see a different document than the built app.
- Proposed: Swagger UI at `/docs` and the JSON document at `/docs-json`, served **only when `NODE_ENV` is not `production`**. Whether to publish API docs in production is decided together with hosting.
- The documented error response (section 4) is part of the document.

### 6. No shared contracts package yet (*Owner-decided*)
- `apps/web` does not import DTOs or generated types from `apps/api` (already enforced by lint), and no `packages/contracts` is created now.
- When the web app first consumes an endpoint, the options (for example web types generated from the OpenAPI document, or a shared package) are decided then, with that consumer in front of us.

### 7. Not decided here
URL prefix and API versioning, CORS, authentication, rate limiting, and pagination conventions. Each is decided with its first real requirement.

## Alternatives considered

| Option | Pros | Cons |
|---|---|---|
| **DTO classes + class-validator + `@nestjs/swagger` (chosen)** | NestJS's documented default; one class gives the type, the validation, and the OpenAPI schema | Decorator-heavy. class-validator is maintained slowly. |
| Zod schemas (`nestjs-zod` or custom pipes) | Schemas are plain values that could later move into a shared package | Not the NestJS default; OpenAPI needs another integration. Rejected by the owner. |
| tRPC / ts-rest shared contracts | End-to-end types without codegen | Couples web and api at build time, and needs a shared package now. Rejected by the owner. |
| GraphQL | Flexible queries | Not needed for this product's screens; more infrastructure. Rejected by the owner. |
| RFC 9457 Problem Details for errors | An IETF standard | `type` URIs and `application/problem+json` add ceremony that no client needs yet. The chosen shape is close to NestJS's default and can be mapped later. |
| NestJS's default error body | No code to write | No stable `code` to translate, and validation errors are English sentences. Unexpected errors are already safe. |
| Swagger CLI plugin | Less decorator boilerplate | The document differs between build and tests (section 5). |

## Why this decision

- **Correctness:** one global pipe and one global filter means no endpoint can skip validation or leak internals by accident. Rejecting unknown properties surfaces client bugs early.
- **Simplicity:** framework defaults (DTO classes, `ValidationPipe`, `@nestjs/swagger`). No shared package and no codegen before a consumer exists.
- **Consistency:** every endpoint has the same error shape, and the web app has one stable `code` to translate (INVARIANTS I-6).

## Consequences

- **Positive:** M3 and later features add endpoints without making contract decisions. API docs are generated, not hand-written.
- **Costs accepted:** decorators on every DTO property. Web types are written by hand until the contract-sharing decision (section 6).
- **Harder to change later:** the error format, once the web app depends on `code`; class-validator as the validation library across all DTOs.

## Follow-up / migration notes

- **Implementation:** TASKS.json `M2-07` (validation and error format) and `M2-08` (OpenAPI).
- **Docs to update on acceptance:** ARCHITECTURE.md (move the API contracts item from Open decisions to Confirmed), BOUNDARIES.md (the contract approach), ADR index.
- **Future decision:** how the web app gets API types (section 6), made with the first web consumer of an endpoint.
