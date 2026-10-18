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
| Typo in a doc | Read it back. `pnpm check:docs` when a link changed. Nothing else. |
| Copy change in a component | Localization entries for all three languages, layout check with the longest string (a screenshot of the affected state at 320 px, per `product-design`) |
| Bug fix in answer checking | A regression test that fails first, the domain test suite, typecheck |
| New screen | Everything in the UI and text sections, plus relevant tests |

## Validation by risk

Owner decisions, 2026-10-15 and 2026-10-18. **This section is the only validation policy.** Other documents, skills and task entries link here instead of restating it. Checks follow the **risk** of a change, not the number of edits, and run at checkpoints, not after every adjustment. This decides **which** checks a change needs and **when**. It never relaxes the items under [Never relaxed](#never-relaxed).

### Checkpoints

| Level | When | What runs |
|---|---|---|
| **Iteration** | Each small adjustment inside a batch of related work | For visual work, render and look: screenshots of the affected screen, its widths and the states touched (the dev server is fine, [QUALITY_GATES.md](QUALITY_GATES.md), Screenshots). **No automated suites.** |
| **Checkpoint** | A coherent batch is finished, e.g. one screen at all its widths, or one task before its commit | The checks of the batch's change class (table below), once, minus what the validation record already covers. Record them in the [validation record](../execution/PROGRESS.md#validation-record). |
| **Integration checkpoint** | A milestone's completion, or a **concrete cross-cutting risk** named in the record: a dependency, framework or build-configuration change, the service worker, `proxy.ts` or i18n routing, a token or shared component that most screens use, a change to stored data formats read across features | The full suite once: `pnpm check`, `pnpm build`, `pnpm --filter web test:e2e` (both projects), and the API e2e when `apps/api` changed since the last full run. Reuse still applies: at a milestone's end, rerun only what the record does not already cover on the current tree. |

### Checks by change class

A batch takes the checks of its riskiest change. "Affected" means the screens, flows or modules whose behavior the change can alter; name them in the record. Commands: [QUALITY_GATES.md](QUALITY_GATES.md).

| Change class | Checks at the checkpoint |
|---|---|
| **Documentation only:** Markdown, ADRs, `TASKS.json`, skills, rules, reference images; no executable configuration and no application behavior | `pnpm format:check` (it covers `TASKS.json`; Markdown is not formatted), `pnpm check:docs` (task-queue shape and relative links), and reading the change back. **No app build and no browser suite.** A change to executable configuration (`package.json` scripts, lint, TypeScript, Playwright, Next.js or CI configuration) is not documentation: it takes the checks of what it configures. |
| **Local visual change:** styling, layout, composition or copy of one screen, inside its slice | Screenshots of the affected screen per `product-design` (widths, locales, states touched; the longest translation when copy changed). The browser specs of the affected screen, both projects (they hold axe and the 320/360 px fit). `pnpm check`. |
| **Shared component:** an existing component in `shared/ui/` or `widgets/`, an existing token's value, layouts | `pnpm check`, screenshots of the screens that use it where it renders differently, and the browser specs of the screens whose behavior or layout it can change. A change that keeps every normal width pixel-identical (checked by screenshots) needs only the specs of the case it fixes and the specs of the component itself. When most screens are affected, that is a cross-cutting risk: integration checkpoint. A **new** token or component used by one screen counts as that screen's change. |
| **Domain rules:** scoring, answer checking, recommendations, content validation | Domain tests with boundary cases (a failing-first regression test for a bug), `pnpm check`. Browser specs only of the screens that show the changed result. |
| **Persistence, routing, application behavior:** device storage, sessions, cookies, routes, actions, `*.server.*` | `pnpm check` and the browser specs of the flows that read or write what changed (the browser run builds the web app itself, so a separate `pnpm --filter web build` adds nothing). New behavior is covered by a test ([TESTING_STRATEGY.md](TESTING_STRATEGY.md)). Stored-data formats get a test that reads earlier records. |
| **API, database, authentication:** `apps/api`, migrations, sign-in and sessions on the server | `pnpm check`, `pnpm --filter api build`, the API e2e (`pnpm db:up`, then `pnpm --filter api test:e2e`), migrations with `db:deploy` and `db:check` when the schema changed, and the browser specs of the web flows that call the changed endpoints. Security tests per the [security rule](../../.claude/rules/security/security.md). |

### Reuse and invalidation

- Before running a check, look at the [validation record](../execution/PROGRESS.md#validation-record). A passing result holds while the code it covers, the dependencies (`pnpm-lock.yaml`) and the configuration it ran under are unchanged. Cite it ("reused: <record line>") instead of running it again, and say what evidence is reused.
- A change invalidates only the results it touches: styling screen A does not invalidate the browser results of screen B, a documentation change invalidates no test result, and a shared token value invalidates every screen that uses it.
- **After a small follow-up fix** (a review finding, a failing check fixed), repeat the checks that the fix invalidates, not every suite of the checkpoint.
- A local commit needs the checks of its change class passing on the tree being committed: `pnpm check` for a commit that changes code (CI parity), the documentation checks for a documentation-only commit. A result from the same tree is reused.

### Failures and flaky tests

- A failing check blocks the checkpoint until its cause is understood. Investigate first: read the failure, the trace or error context, and what the change touched.
- **Do not rerun a failing test to obtain a green result.** Rerunning is allowed only as part of the investigation, e.g. to measure how often it fails, on this tree and on the commit before the change. Record the measurement.
- A failure shown to be caused elsewhere (a pre-existing flaky test) is recorded in PROGRESS.md with its mechanism and rate as a follow-up. It is never skipped, weakened or deleted.

### Never relaxed

- Security ([security rule](../../.claude/rules/security/security.md)), data integrity (migrations, stored data) and accessibility ([ACCESSIBILITY.md](../design/ACCESSIBILITY.md)) are checked whenever their area changes. Every changed screen gets its axe specs at its checkpoint.
- Never weaken an assertion, skip, or delete a useful test, never bypass a gate (`--no-verify`, disabled rules), and never claim a check that did not run. A failing check blocks the checkpoint.
- The autonomous workflow runs the task's own `validation` list ([AUTONOMOUS_WORKFLOW.md](../execution/AUTONOMOUS_WORKFLOW.md)). Task lists are written to this policy: a task's list names the checks its change class needs for that task, and a milestone's last task holds its integration checkpoint.
