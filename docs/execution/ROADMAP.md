# Roadmap

Canonical owner of **milestone sequencing**. Feature scope and status: [FEATURE_MAP.md](../product/FEATURE_MAP.md). Executable tasks: [TASKS.json](TASKS.json), which only ever contains the **current** milestone.

## Milestones

| ID | Milestone | Status |
|---|---|---|
| — | Governance v1.1 (pre-milestone) | Done (2026-10-09) |
| M0 | **Foundation**: monorepo, Next.js web, NestJS api, gates, localization, tokens, PWA shell, CI ([ADR-0001](../architecture/decisions/0001-initial-application-foundation.md)) | ADR-0001 accepted. Tasks defined, waiting on F-00 (Node 24) |
| M1+ | See candidates below | Not approved |

## Candidate sequence after Foundation (NOT APPROVED)

This is a proposal to discuss, not a plan. The owner approves the next milestone before any of its tasks are written. Each candidate lists the decisions it needs first. A worker must not start a milestone whose blocking decisions are open.

| Candidate | Why at this point | Blocking decisions |
|---|---|---|
| **App shell and core UI primitives** (layout, navigation, buttons, bottom sheet base, language switcher) | Every feature needs them. Validates the design system in real UI. | Status colors; first screens' flow specs (USER_FLOWS.md); whether to add shadcn/Radix primitives |
| **Reading practice: first vertical slice** (one passage, a few question types, Practice Mode, evidence-first review) | Signature experience. A direct Reading link is an acquisition path. | Content model ADR; Academic vs General Training; question-type interaction designs; content sourcing; API contracts ADR; whether practice works with no account (local-only results) |
| **First run and next action** (target band, exam date, recommended next action) | Core loop: "understand what to do" | Recommendation rules; diagnostic design |
| **Accounts and persistence** | Saving progress across devices, moving from phone to desktop | Auth ADR; schema design; hosting and data residency |
| **Error Intelligence and Explain simpler** | Key differentiator once there is practice data | Error-pattern taxonomy; AI provider ADR (if used for explanations) |
| **Listening**, then **Writing/Speaking with AI estimates** | Full IELTS coverage | Audio ADR; AI provider and calibration process |

## Rules

- When a milestone is approved, its tasks replace the tasks in TASKS.json. The previous milestone's completion stays recorded in PROGRESS.md and git history.
- A milestone is complete when all of its tasks are `done` and the full gate suite passes.
