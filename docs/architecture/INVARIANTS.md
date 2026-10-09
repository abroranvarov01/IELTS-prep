# Invariants

Short statements that must **always** remain true. Each one links to the document that owns the details. Breaking an invariant requires an ADR, not a code comment.

Status: **Active** = applies from the first line of code. **Pending** = becomes active when the named decision is made.

## Product and domain

| # | Invariant | Status | Owner |
|---|---|---|---|
| I-1 | AI evaluations are never presented as official IELTS results. They are always labeled as estimates. | Active | [PRODUCT.md](../product/PRODUCT.md#honest-feedback-non-negotiable) |
| I-2 | IELTS band calculation (raw score → band, overall band rounding) has exactly one canonical implementation. | Active | [ielts-scoring rule](../../.claude/rules/domain/ielts-scoring.md) |
| I-3 | UI components do not calculate scores or decide answer correctness. They call domain logic. | Active | [BOUNDARIES.md](BOUNDARIES.md) |
| I-4 | Domain behavior is testable without rendering UI. | Active | [TESTING_STRATEGY.md](../engineering/TESTING_STRATEGY.md) |
| I-5 | Practice content is original or licensed. Nothing is copied from published IELTS materials. | Active | [PRODUCT.md](../product/PRODUCT.md#content-integrity-and-brand) |

## Interface

| # | Invariant | Status | Owner |
|---|---|---|---|
| I-6 | User-facing interface strings are never hard-coded in components. | Active | [LOCALIZATION.md](../product/LOCALIZATION.md) |
| I-7 | Raw colors never appear outside token definitions. Repeated or semantic visual decisions use design tokens. | Active | [DESIGN_SYSTEM.md § Token policy](../design/DESIGN_SYSTEM.md#token-policy) |
| I-8 | Meaning is never conveyed by color alone. | Active | [ACCESSIBILITY.md](../design/ACCESSIBILITY.md) |

## Data and API

| # | Invariant | Status | Owner |
|---|---|---|---|
| I-9 | Secrets never live in the repository. Personal data and user submissions (essays, recordings) never appear in logs. | Active | [security rule](../../.claude/rules/security/security.md) |
| I-10 | Database entities are not exposed directly as API contracts. | Pending: backend ADR | [BOUNDARIES.md](BOUNDARIES.md) |
