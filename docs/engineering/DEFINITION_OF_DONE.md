# Definition of Done

Canonical owner of **when a change counts as finished** and **which checks a change needs, and when** ([Validation by risk](#validation-by-risk)). Validation is **proportional to the change**: run what is relevant, and say what you skipped and why.

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

- [ ] **Visual review done** with the [`product-design` skill](../../.claude/skills/product-design/SKILL.md). That means the running app was rendered and captured at the widths and in the locales that skill lists, the screenshots were compared with any approved reference in [docs/design/references/](../design/references/README.md) and with the design docs, and the problems were fixed and captured again. Passing lint, typecheck, tests, or accessibility checks does not satisfy this item.
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
| Copy change in a component | Localization entries for all three languages, layout check with the longest string (a screenshot of the affected state at 320 px, per `product-design`) |
| Bug fix in answer checking | A regression test that fails first, the domain test suite, typecheck |
| New screen | Everything in the UI and text sections, plus relevant tests |

## Validation by risk

Owner decision, 2026-10-15. Checks follow the **risk** of a change, not the number of edits. They run at checkpoints, not after every adjustment. This decides **when** a check runs, never **whether** a required check runs.

### Checkpoints

| Level | When | What runs |
|---|---|---|
| **Iteration** | Each small adjustment inside a batch of related visual work | Render and look: screenshots of the affected screen, its widths and the states touched (the dev server is fine, [QUALITY_GATES.md](QUALITY_GATES.md), Screenshots). **No automated suites.** |
| **Checkpoint** | A coherent batch is finished, e.g. one screen's redesign at all its widths, or one task before its commit | The checks for the batch's change class (table below), once. Record them in the [validation record](../execution/PROGRESS.md#validation-record). |
| **Integration checkpoint** | The end of an agreed scope: a redesign scope, a milestone, or before the owner reviews a batch of screens | The full required suite once: `pnpm check`, `pnpm build`, `pnpm --filter web test:e2e` (both projects), and the API e2e when `apps/api` changed. Repeat only what a later change invalidates. |

### Checks by change class

A batch takes the checks of its riskiest change.

| Change class | Checks at the checkpoint |
|---|---|
| **Styling only:** classes, layout, composition, visual-only markup (wrappers, decorative SVG with `aria-hidden`) inside one screen's `ui/`. No change to text, roles, names, focus order, state or behavior | Screenshots of the affected screens per `product-design` (widths, locales, interaction states). `pnpm check`. The browser specs of the affected screens, both projects (they hold axe contrast and the 320/360 px fit). |
| **Screen markup or copy:** headings, roles, labels, element structure, messages | The above, plus layout with the longest translation. |
| **Shared visual building blocks:** an existing component in `shared/ui/` or `widgets/`, an existing token's value, layouts | `pnpm check`, then the browser specs of every screen that uses them. When that is most screens, the whole web e2e suite. A **new** token or component used by one screen counts as that screen's change. |
| **Routing, state, persistence, server code, application behavior:** routes, `proxy.ts`, cookies, device storage, sessions, actions, `*.server.*`, `apps/api` | `pnpm check`, `pnpm build`, the whole web e2e suite, the API e2e when `apps/api` changed, and new behavior covered by a test ([TESTING_STRATEGY.md](TESTING_STRATEGY.md)). |
| **Domain rules:** scoring, answer checking, recommendations | Domain tests with boundary cases (a failing-first regression test for a bug), `pnpm check`. |
| **Docs or governance only** | Read it back, check the links. |

### Reuse and invalidation

- Before running a check, look at the [validation record](../execution/PROGRESS.md#validation-record). A result whose scope the later changes did not touch still holds. Cite it instead of running it again.
- A change invalidates only the results it touches: styling screen A does not invalidate the browser results of screen B, and a shared token value invalidates every screen that uses it.
- A local commit needs `pnpm check` passing on the tree being committed (CI parity), unless the last checkpoint ran it on the same tree.

### Never relaxed

- Security ([security rule](../../.claude/rules/security/security.md)), data integrity (migrations, stored data) and accessibility ([ACCESSIBILITY.md](../design/ACCESSIBILITY.md)) are checked whenever their area changes. Every changed screen gets its axe specs at its checkpoint.
- Never weaken an assertion, skip, or delete a test, and never claim a check that did not run. A failing check blocks the checkpoint.
- The autonomous workflow always runs the task's own `validation` list ([AUTONOMOUS_WORKFLOW.md](../execution/AUTONOMOUS_WORKFLOW.md)).
