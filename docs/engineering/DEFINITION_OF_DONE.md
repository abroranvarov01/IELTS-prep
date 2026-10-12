# Definition of Done

Canonical owner of **when a change counts as finished**. Validation is **proportional to the change**: run what is relevant, and say what you skipped and why.

## Always (every change)

- [ ] The requested behavior is implemented and the acceptance criteria are verified, not just assumed.
- [ ] The diff contains only changes required by the task (see [01-change-discipline](../../.claude/rules/01-change-discipline.md)).
- [ ] No dead code, debug output, or commented-out code was introduced.
- [ ] The implementer has reviewed their own full diff.
- [ ] Assumptions made along the way are stated in the summary.

## When code changes

- [ ] Types are valid (typecheck passes).
- [ ] Lint passes for the touched files.
- [ ] Relevant tests pass. New behavior has a test. A fixed bug meets [bug-fix verification](TESTING_STRATEGY.md#bug-fix-verification).
- [ ] In `apps/web`, new or moved code sits where [BOUNDARIES.md, Placing code](../architecture/BOUNDARIES.md#placing-code) puts it: the right layer, slice and segment, used by other slices only through the slice's public API, which exports nothing unused. `pnpm lint` checks the boundaries; placement within them is reviewed. A new slice, entry point or layer is reflected in BOUNDARIES.md.

The commands are listed in [QUALITY_GATES.md](QUALITY_GATES.md). If a command does not exist yet, say so. Do not claim a check passed.

## When UI changes

User-facing UI only: anything a user sees or operates. Backend and other non-UI changes skip this section.

- [ ] **Visual review done** with the [`visual-fidelity` skill](../../.claude/skills/visual-fidelity/SKILL.md). That means the running app was rendered and captured at the widths and in the locales that skill lists, the screenshots were compared with any approved reference in [docs/design/references/](../design/references/README.md) and with the design docs, and the problems were fixed and captured again. Passing lint, typecheck, tests, or accessibility checks does not satisfy this item.
- [ ] No known visual regression against an approved reference.
- [ ] Accessibility considered: keyboard, focus, names, contrast, touch targets ([ACCESSIBILITY.md](../design/ACCESSIBILITY.md)).
- [ ] UX rules hold for the screen ([UX_PRINCIPLES.md](../product/UX_PRINCIPLES.md)).
- [ ] No pattern from [UI_ANTI_PATTERNS.md](../design/UI_ANTI_PATTERNS.md).

## When user-facing text changes

- [ ] Strings go through localization, with uz/ru/en entries ([LOCALIZATION.md](../product/LOCALIZATION.md)).
- [ ] The layout is checked with the longest translation.

## When scoring, feedback, or domain rules change

- [ ] Domain tests cover the rule, including boundary cases.
- [ ] Honest-feedback wording is preserved ([PRODUCT.md](../product/PRODUCT.md#honest-feedback-non-negotiable)).

## Docs and ADRs

- [ ] Docs are updated **only** when the change alters something they state (feature status, a token, a boundary, a command).
- [ ] An ADR is written only when the [ADR criteria](../architecture/decisions/README.md#when-to-write-an-adr) are met.

## Proportionality examples

| Change | Expected validation |
|---|---|
| Typo in a doc | Read it back. Nothing else. |
| Copy change in a component | Localization entries for all three languages, layout check with the longest string (a screenshot of the affected state at 320 px, per `visual-fidelity`) |
| Bug fix in answer checking | A regression test that fails first, the domain test suite, typecheck |
| New screen | Everything in the UI and text sections, plus relevant tests |
