---
name: review-change
description: Project review procedure for a diff, branch, or set of changed files against this repository's product, design, and engineering rules. Use when asked to review code or before reporting a substantial change as done.
---

# Review a change

(This is named `review-change` so that it does not shadow the built-in `/code-review` bug-hunting command. The two complement each other.)

## 1. Understand the intent
Read the task or PR description. State in one sentence what the change should do. Review against that intent, not against your own preferred design.

## 2. Correctness first
- Does it do what was asked? Are the edge cases handled (empty, offline, long strings, invalid input)?
- Is IELTS domain logic correct and sourced? Is there exactly one implementation of it (`docs/architecture/INVARIANTS.md`)?
- Are errors handled rather than swallowed? Is untrusted input, including AI output, validated?

## 3. Scope and simplicity
- Is every hunk required by the task (`.claude/rules/01-change-discipline.md`)?
- Do new abstractions meet `docs/engineering/CODE_QUALITY.md` § Abstraction threshold?
- Is there dead code, a duplicate path, commented-out code, or an orphaned TODO?
- Is there a new dependency or pattern without justification or an ADR?

## 4. Consistency
- Does it follow the existing patterns and the accepted ADRs?
- Does it respect `docs/architecture/BOUNDARIES.md`? In `apps/web`: is each file in the layer, slice and segment that § Placing code gives it, does each public API export only what other slices use, and is no boundary rule disabled (`eslint-disable`)?

## 5. Product and UI (if user-facing)
- Apply the "Check before finishing" list from the `ui-implementation` skill.
- Is honest-feedback wording preserved for any score display (`docs/product/PRODUCT.md`)?

## 6. Tests and verification
- Does the new behavior or the bug fix have tests at the right level (`docs/engineering/TESTING_STRATEGY.md`)?
- Were the gates actually run? Does the claimed verification match what was done?
- Do the checks match the change class in `docs/engineering/DEFINITION_OF_DONE.md` § Validation by risk, and does the validation record in `docs/execution/PROGRESS.md` cover the change? Neither too little (a shared or behavior change checked like styling) nor repeated runs over unchanged work.

## Output
List findings ranked by severity: **Blocking** (incorrect, unsafe, violates an invariant) → **Should fix** → **Consider**. Each finding gets a file:line reference, the concrete problem, and a suggested fix. Do not pad the review with style nits that a formatter or linter should handle. Recommend the tool instead. If nothing is wrong, say so.
