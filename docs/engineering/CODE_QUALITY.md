# Code Quality

Canonical owner of **what good code looks like in this repository**. "Clean code" here means the concrete properties below. How agents should *work* (scope, assumptions, surgical changes) is owned by [`.claude/rules/00-engineering-core.md`](../../.claude/rules/00-engineering-core.md) and [`01-change-discipline.md`](../../.claude/rules/01-change-discipline.md).

When properties conflict, the priority order in `00-engineering-core.md` decides.

## Readability
- Code reads top-down: the main path first, details after. Exit early instead of nesting deeply.
- A reader should not need to open three files to understand what one function does.
- Optimize for a competent engineer new to the codebase, not for the author.

## Naming
- Names say what something *is* or *does* in domain terms: `checkReadingAnswer`, `estimatedBandRange`. Not `handleData` or `processItem`.
- Use IELTS vocabulary consistently: *band*, *raw score*, *section*, *passage*, *question type*, *task*. Do not invent synonyms for the same concept.
- Booleans read as predicates (`isTimed`, `hasAudio`). Functions are verbs. Types are nouns.
- Avoid vague suffixes (`Manager`, `Helper`, `Util`, `Service`, `Handler`) unless the name genuinely describes the responsibility.

## Complexity
- Measure complexity by **how much a reader must hold in their head**, not by line counts. There is no universal function length limit. A 60-line function with a straight flow can be clearer than five 12-line fragments.
- **Do not hide complexity.** Moving logic through extra layers so that each file looks small makes the system harder to follow. Split a unit when it has more than one *reason to change*, not when it looks long.
- Prefer data and plain functions over class hierarchies. Prefer explicit branching over clever indirection.

## Abstraction threshold
An abstraction (helper, hook, component, wrapper, layer, config) is justified only when at least one of these holds:
1. The pattern **already** appears in several places with the same meaning, not just a similar shape.
2. It names a clear **domain primitive** (e.g. `BandScore`, `AnswerKey`).
3. Separating it **materially** improves readability or testability.

And it must **remove more complexity than it adds**. Not justified:
- generic frameworks for a single use case
- configuration systems with one value
- factories, managers, providers, registries, or adapters without a real current responsibility
- wrapper layers that only forward calls
- extractions made because something "might be reused later"

When unsure, keep the code inline. Extracting later is cheap. Removing a premature abstraction is expensive.

## Duplication
- Duplicate **knowledge** (a rule, a formula, a constant with meaning) is a bug waiting to happen. It must have one source.
- Duplicate **shape** (two similar-looking blocks with different reasons to change) is acceptable. Tolerate small duplication until the shared meaning is clear.

## Domain separation
- IELTS rules (scoring, answer checking, band conversion, recommendation logic) live in domain code, not inside components, route handlers, or SQL.
- Domain code is pure where practical: inputs in, result out, no I/O.
- See [INVARIANTS.md](../architecture/INVARIANTS.md) and [BOUNDARIES.md](../architecture/BOUNDARIES.md).

## Side effects
- Keep side effects (network, storage, timers, analytics, AI calls) at the edges and make them obvious from the call site.
- A function whose name sounds like a query does not mutate anything.
- No hidden global mutable state.

## Error handling
- Handle errors where you can do something meaningful. Otherwise let them propagate.
- Never swallow an error silently (empty `catch`, `catch { return null }` without a reason).
- User-facing errors are localized, plain-language, and say what the user can do next. Technical details go to logs (without personal data).
- Validate untrusted input at the boundary (API input, AI output, storage). After that, trust the types.

## Public API size
- Export only what callers need. Every export is a commitment.
- Prefer few, well-named parameters. Use an options object only when there are several optional parameters.
- Do not add parameters, flags, or modes that no current caller uses.

## Dependency discipline
- Adding a dependency is a decision. Check whether the platform or an existing dependency already covers the need.
- Before adding one, consider bundle size (this is a mobile PWA on variable connections), maintenance health, and license.
- A new dependency that establishes a project-wide pattern (state management, forms, data fetching, i18n) requires an ADR.

## Comments
- Comment **why**, not what: constraints, IELTS rules with their source, non-obvious trade-offs, workarounds with links.
- Do not delete comments you do not understand. Find out why they exist first.
- No commented-out code. Version control remembers.

## Dead code
- Do not leave unused exports, helpers, branches, duplicate code paths, or temporary compatibility layers.
- A TODO is acceptable only with a concrete reason and owner/issue. Do not leave TODOs created by your own change unaddressed.

## Refactoring discipline
- Refactoring is a separate, behavior-preserving change. Do not mix it into a feature or a bug fix.
- Refactor when it serves a current need: the change you are about to make is hard because of the structure. Not for taste.
- Tests must protect the behavior before restructuring. The procedure is the `refactor` skill.
