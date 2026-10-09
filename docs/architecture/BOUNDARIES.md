# Boundaries

Canonical owner of **module and dependency boundaries**.

> **STATUS: PRINCIPLES ONLY.** No folder structure exists yet. When the repository layout is decided (the foundation ADR), replace this section with concrete module names and allowed dependency directions. Then enforce them with tooling (see [QUALITY_GATES.md](../engineering/QUALITY_GATES.md#future-deterministic-enforcement)).

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
