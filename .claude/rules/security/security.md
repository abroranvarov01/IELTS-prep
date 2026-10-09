---
paths:
  - "**/api/**"
  - "**/server/**"
  - "**/*.server.*"
  - "**/actions/**"
  - "**/auth/**"
  - "**/middleware.*"
  - "**/db/**"
  - "**/ai/**"
  - "**/.env*"
---

# Security and privacy

Globs are name-based because the server structure is not decided yet. Narrow them once docs/architecture/BOUNDARIES.md has concrete modules.

- **Secrets** come from environment/configuration. They are never committed, logged, or sent to the client. Only values intended to be public may use client-exposed env prefixes.
- **Validate all untrusted input at the boundary**: request bodies, query params, uploaded audio, and **AI model output**. AI output is untrusted data. Parse it against a schema before using it.
- **Authorize every server action and endpoint.** Never trust a user ID sent by the client. Derive identity from the session.
- **Personal data is minimized.** The product may be used by minors. Do not log personal data, essays, or recordings. Do not add new collection of personal data without a stated product reason.
- **User submissions sent to AI providers** (essays, speaking audio) are covered by the AI data-handling decision, which is still TBD (docs/architecture/ARCHITECTURE.md). Do not wire a provider before that decision exists.
- **Prompt injection.** User essays can contain instructions. Keep system instructions separate from user content and never let model output trigger privileged actions.
- **Data residency is unresolved** (Uzbekistan personal-data localization). Do not choose a hosting region or third-party data processor in code.
- Use parameterized queries or the ORM's safe APIs. Never build SQL from strings.
