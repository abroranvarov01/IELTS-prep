# Roadmap

Canonical owner of **milestone sequencing rationale and the decisions that block each milestone**. The milestones themselves (order, name, goal, status) and all tasks live in [TASKS.json](TASKS.json). Feature scope and status: [FEATURE_MAP.md](../product/FEATURE_MAP.md).

## Milestones

Order, goals, and status: the `milestones` array in [TASKS.json](TASKS.json). Goals of `planned` milestones are drafts until the owner activates them.

| ID | Milestone | Why at this point | Blocking decisions (resolve before or inside the milestone) |
|---|---|---|---|
| M0 | Foundation ([ADR-0001](../architecture/decisions/0001-initial-application-foundation.md)) | Gates and structure before any feature code | None |
| M1 | App Shell & Design Foundation | Every screen needs the shell. It validates the design system in real UI. | Owner approval of the shell flow specs, copy, and design values (tasks M1-01 to M1-03) |
| M2 | Backend & Persistence Foundation | Stored data is needed before accounts, progress, and content can exist on the server | API contracts and validation ADR; schema design; hosting and data residency before any production database |
| M3 | Onboarding + Home | Core loop: "understand what to do" | Flow specs for first open and returning user; recommendation rules; level-check design; where results live before accounts exist |
| M4 | Reading Engine | Signature experience ([READING_EXPERIENCE.md](../product/READING_EXPERIENCE.md)). A direct Reading link is an acquisition path. | Content model ADR; Academic vs General Training; question-type interaction designs; sheet sizes, snap points, and gestures; content for the first sets; status colors; UI primitives approach (shadcn/Radix or not) |
| M5 | Reading Review + Error Intelligence | Turns practice into understanding (product loop) | Error-pattern taxonomy; AI provider ADR if AI is used for explanations |
| M6 | Listening | Second skill, reusing the practice and review patterns from Reading | Audio ADR (delivery on weak connections); content sourcing |
| M7 | Accounts + Sync | Progress across devices, phone to desktop | Auth ADR (methods, when registration is offered); hosting and data residency; minors' consent |
| M8 | Progress + Personalization | Needs history from earlier milestones | Recommendation rules; how estimates are validated and presented (honest feedback) |
| M9 | Content System | Scales content beyond hand-made sets | Content model and authoring ADR; content sourcing and review process |
| M10 | PWA + Performance + Reliability | Hardens the experience on mid-range phones and weak connections | Offline scope; analytics, monitoring, and privacy |
| M11 | Beta Hardening | Last step before real users | Legal review (data localization, minors); hosting |

**Not yet scheduled** ([FEATURE_MAP.md](../product/FEATURE_MAP.md) areas without a milestone): Writing and Speaking practice with AI estimates, full mock tests, vocabulary, and targeted practice beyond what M5 produces.

**Deliberately not in M1:** reusable UI primitives without a consumer (a Button, the bottom-sheet base) arrive with their first consumer, in M3 and M4 ([CODE_QUALITY.md § Abstraction threshold](../engineering/CODE_QUALITY.md#abstraction-threshold)).

## Rules

- Exactly one milestone is `active` at a time. The owner activates the next milestone after its tasks are written in TASKS.json. A worker never activates a milestone ([AUTONOMOUS_WORKFLOW.md](AUTONOMOUS_WORKFLOW.md)).
- New tasks are appended to TASKS.json with their `milestone` id. Completed tasks are never deleted or renamed. Their history also stays in PROGRESS.md and git.
- A milestone is complete when all of its tasks are `done` and the full gate suite passes.
- A worker must not start work whose blocking decisions are open. Open decisions become human tasks or stop conditions.
