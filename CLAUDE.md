# IELTS Prep: project guide for Claude

A mobile-first IELTS preparation PWA for candidates in **Uzbekistan**, with an Uzbek / Russian / English interface. Free core preparation, personalized next actions, strong mistake explanations, and a Reading experience built for phones.

**Product loop:** Open → understand what to do → practice → understand mistakes → improve.

## Current state

- **Governance only. No application code exists yet.** No `package.json`, no toolchain, no tests, no CI. Git repository with a GitHub `origin`.
- **Confirmed:** Next.js frontend, NestJS backend, TypeScript end-to-end, PostgreSQL + Prisma. The full foundation is in ADR-0001 (`docs/architecture/decisions/0001-initial-application-foundation.md`, **Accepted**). See `docs/architecture/ARCHITECTURE.md` for confirmed vs. proposed vs. TBD.
- **Execution:** work is done task by task from `docs/execution/TASKS.json` via the `work-next-task` skill. Do not scaffold, install dependencies, or write product code outside a task that asks for it.
- `.claude/settings.json` denies `git push`, remote changes, history rewrites, and reading or writing secret `.env` files. Local status, diff, add, and commit follow normal permissions. The owner pushes.

## Non-negotiables

Each item is owned by the linked document. These are reminders, not the full rules.

1. **Honest AI feedback.** AI scores are "Estimated band" / "Estimated range", never official IELTS results. No false precision. → `docs/product/PRODUCT.md`
2. **UX constitution:** 10-second rule, 3-click rule, one primary action, progressive disclosure, mobile first, plain language, no learning curve, accessibility as a requirement. → `docs/product/UX_PRINCIPLES.md`
3. **Visual direction:** white-first, red brand accent (inspired by IELTS, not copied), bold modern typography, no generic AI-SaaS look. → `docs/design/DESIGN_CONSTITUTION.md`, `docs/design/UI_ANTI_PATTERNS.md`
4. **Invariants** (single scoring source, domain logic outside UI, no hard-coded UI strings, no raw colors outside tokens, content is original or licensed, no secrets or personal data in logs). → `docs/architecture/INVARIANTS.md`
5. **How to work:** priority order, smallest coherent solution, surgical changes, no speculative abstraction. → `.claude/rules/00-engineering-core.md`, `.claude/rules/01-change-discipline.md` (both always loaded), `docs/engineering/CODE_QUALITY.md`
6. **TBD stays TBD.** Do not silently decide anything marked TBD in `docs/`. Ask, or propose an ADR.

## Where things live (canonical owners)

Each topic has exactly **one** owner. Other files link to it instead of restating it.

| Topic | Owner |
|---|---|
| Product vision, users, approved product principles, honest-feedback rule, content integrity, open product questions | `docs/product/PRODUCT.md` |
| UX rules (10-second, 3-click, …) | `docs/product/UX_PRINCIPLES.md` |
| Feature scope and status | `docs/product/FEATURE_MAP.md` |
| Reading interaction model (signature experience) | `docs/product/READING_EXPERIENCE.md` |
| Flow specs (where step counts are checked) | `docs/product/USER_FLOWS.md` |
| Interface languages and localization rules | `docs/product/LOCALIZATION.md` |
| Visual direction | `docs/design/DESIGN_CONSTITUTION.md` |
| Token policy and values: color, type, spacing, radii, shadows, states, breakpoints | `docs/design/DESIGN_SYSTEM.md` |
| Accessibility requirements | `docs/design/ACCESSIBILITY.md` |
| Forbidden UI patterns | `docs/design/UI_ANTI_PATTERNS.md` |
| Architecture: confirmed / proposed / TBD | `docs/architecture/ARCHITECTURE.md` |
| Module and dependency boundaries | `docs/architecture/BOUNDARIES.md` |
| Must-always-hold statements | `docs/architecture/INVARIANTS.md` |
| ADR rules, index, template | `docs/architecture/decisions/` |
| Milestone sequencing | `docs/execution/ROADMAP.md` |
| Current milestone tasks and status | `docs/execution/TASKS.json` |
| Execution log, open questions for the owner | `docs/execution/PROGRESS.md` |
| Autonomous worker loop, hard limits, stop conditions | `docs/execution/AUTONOMOUS_WORKFLOW.md` |
| Properties of good code | `docs/engineering/CODE_QUALITY.md` |
| When a change counts as done | `docs/engineering/DEFINITION_OF_DONE.md` |
| What to test, at which level | `docs/engineering/TESTING_STRATEGY.md` |
| Validation commands, future enforcement, hooks | `docs/engineering/QUALITY_GATES.md` |

## Rules that load automatically

`.claude/rules/` files without `paths:` load every session. Path-scoped ones load when you work on matching files.

| Rule | Applies to |
|---|---|
| `00-engineering-core.md` | Always: priorities, assumptions, existing-pattern-first, tool enforcement |
| `01-change-discipline.md` | Always: surgical changes, cleanup, diff self-review |
| `frontend/react.md` | `*.tsx`, `*.jsx` |
| `styling/visual-implementation.md` | `*.tsx`, `*.jsx`, `*.css`, Tailwind config |
| `testing/test-code.md` | `*.test.*`, `*.spec.*`, `__tests__/`, `e2e/` |
| `security/security.md` | API, server, auth, actions, middleware, db, ai, `.env*` paths |
| `domain/ielts-scoring.md` | Files and directories named for scoring, bands, feedback, or assessment |

The security and scoring globs are name-based because no source tree exists yet. **Narrow them** when the repository layout is decided. Add a feature-specific domain rule (e.g. `domain/reading.md` scoped to the Reading feature directory) only once that directory exists and has rules worth stating.

## Workflows (skills)

| Task | Skill |
|---|---|
| Build or change functionality | `implement-feature` |
| Fix a defect | `fix-bug` |
| Any user-facing screen, component, style, or text | `ui-implementation` |
| Behavior-preserving restructuring | `refactor` |
| Review a diff against project rules | `review-change` (complements the built-in `/code-review`) |
| Significant technical decision / new project-wide pattern | `architecture-decision` |
| Decide what to test and write tests | `testing` |
| Run the autonomous worker on the task queue (user-invoked only) | `work-next-task` |

## Commands

None exist yet. `docs/engineering/QUALITY_GATES.md` is the only canonical list of commands, and it will be updated at scaffolding time. **Never claim a check passed if you did not run it.**

## Maintaining this governance

Decide where new guidance belongs:

1. Can a tool enforce it (types, lint, formatter, tests, CI)? → Add it to tooling and list it in `QUALITY_GATES.md`. Do not add it to prompts.
2. Needed in almost every session? → This file, kept short (under ~180 lines).
3. A static rule for one code scope? → A path-scoped file in `.claude/rules/`.
4. A procedure for a class of work? → A skill in `.claude/skills/`.
5. Long-lived product, design, or architecture knowledge? → `docs/`, in its canonical owner.
6. An important choice with credible alternatives? → An ADR.

Do not duplicate a rule. Update its owner and link to it. Do not put README or other non-rule files in `.claude/rules/`, because every `.md` file there is loaded as a rule.
