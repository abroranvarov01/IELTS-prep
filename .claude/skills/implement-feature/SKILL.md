---
name: implement-feature
description: Procedure for implementing a new feature or behavior change end to end. Use when asked to build, add, or change functionality (not for bug fixes, pure refactors, or UI-only polish).
---

# Implement a feature

Follow these steps in order. Keep notes short. The output is working code and an honest summary.

1. **Understand the outcome.** Restate the requested behavior and the acceptance criteria in one or two sentences. If no criteria were given, derive testable ones and list them.
2. **Locate it in the product.** Check `docs/product/FEATURE_MAP.md` and `docs/product/USER_FLOWS.md`. If the feature has no flow spec and is user-facing, draft one (format is in USER_FLOWS.md) before building screens.
3. **Inspect existing patterns.** Search the repository for similar code, components, domain modules, and tests. Plan to reuse them.
4. **Inspect decisions.** Read the relevant ADRs in `docs/architecture/decisions/` and the relevant entries in `docs/architecture/INVARIANTS.md` and `BOUNDARIES.md`.
5. **Define the minimal change surface.** List the files you expect to touch. Domain logic goes in domain code, UI in UI code. If the list keeps growing, stop and reconsider the approach.
6. **Surface assumptions.** Ask about anything that is hard to reverse or touches something marked TBD in `docs/`. State smaller assumptions and proceed conservatively.
7. **Implement.** Domain logic first, with its tests (use the `testing` skill). Then wiring, then UI (use the `ui-implementation` skill for any user-facing surface).
8. **Review the diff.** Apply the self-review in `.claude/rules/01-change-discipline.md`.
9. **Remove accidental complexity.** Check every new abstraction, parameter, file, and dependency against `docs/engineering/CODE_QUALITY.md` § Abstraction threshold. Inline or delete what does not qualify.
10. **Validate.** Run the gates from `docs/engineering/QUALITY_GATES.md` that are relevant to the change. If a gate does not exist, say so.
11. **Verify the acceptance criteria** one by one against actual behavior, not against the code you intended to write.
12. **Update docs only if needed.** Feature status in FEATURE_MAP.md, flow spec, tokens. Propose an ADR only if the ADR criteria are met.
13. **Summarize:** what changed, how it was verified, the assumptions made, any follow-ups noticed but not done.
