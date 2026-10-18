# Architecture Decision Records

Canonical owner of **when and how ADRs are written**. The procedure for making a decision is the `architecture-decision` skill.

## When to write an ADR

Write one when a decision does at least one of the following:

- has meaningful architectural impact,
- is difficult to reverse,
- affects multiple features,
- establishes a project-wide pattern,
- deliberately rejects credible alternatives.

**Do not** write ADRs for trivial implementation choices (naming a helper, choosing between two equivalent loops, styling a single component).

## Foundation ADR

When application scaffolding begins, record the tightly related foundational choices in **one coherent foundation ADR**. Do not write separate ADRs for each initial tool. Typical scope:
- framework, TypeScript configuration, package manager
- styling strategy (including how design tokens are implemented)
- basic test tooling
- PWA foundation

Split a choice into its own ADR only when it independently meets the criteria above. The backend framework (NestJS) and the persistence stack (PostgreSQL + Prisma) are included because the owner confirmed them. AI-provider choices are **not** part of the foundation ADR. They stay TBD until a current requirement needs them.

## Rules

- Before reversing or working around an established pattern, **read the relevant ADRs**. Reversing an accepted ADR requires a new ADR that supersedes it. Do not silently diverge.
- Files are named `NNNN-short-kebab-title.md` (e.g. `0001-application-stack.md`), numbered in sequence and never reused.
- Status values: `Proposed` → `Accepted` → (`Superseded by NNNN` | `Deprecated`). Accepted ADRs are not rewritten. Only their status line changes.
- An agent may draft an ADR as `Proposed`. Only the project owner marks it `Accepted`.
- Use [ADR-TEMPLATE.md](ADR-TEMPLATE.md).

## Index

| ADR | Title | Status |
|---|---|---|
| [0001](0001-initial-application-foundation.md) | Initial Application Foundation | Accepted |
| [0002](0002-api-contracts-and-validation.md) | API Contracts and Input Validation | Accepted |
| [0003](0003-guest-state-on-the-device.md) | Guest State on the Device | Accepted |
| [0004](0004-web-feature-structure.md) | Feature Structure and Domain Code in apps/web | Superseded by 0010 |
| [0005](0005-reading-content-contract.md) | Reading Content Contract | Accepted |
| [0006](0006-reading-session-state.md) | Reading Session State and Persistence | Accepted |
| [0007](0007-reading-ui-primitives.md) | Building Blocks for the Question Sheet and Passage Selection | Accepted |
| [0008](0008-reading-answer-checking-and-explanations.md) | Reading Answer Checking, Explanations and Review Content | Accepted |
| [0009](0009-reading-attempts-on-the-device.md) | Reading Attempts and Results on the Device | Accepted |
| [0010](0010-feature-sliced-design-in-apps-web.md) | Feature-Sliced Design in apps/web | Accepted |
| [0011](0011-level-check-forms-results-and-storage.md) | Level-Check Forms, Results and Storage | Accepted |
| [0012](0012-listening-content-contract-and-audio-assets.md) | Listening Content Contract and Audio Assets | Proposed |

Candidate decisions waiting for ADRs are listed in [ARCHITECTURE.md](../ARCHITECTURE.md#open-decisions-tbd).
