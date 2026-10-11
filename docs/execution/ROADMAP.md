# Roadmap

Canonical owner of **milestone sequencing rationale and the decisions that block each milestone**. The milestones themselves (order, name, goal, status) and all tasks live in [TASKS.json](TASKS.json). Feature scope and status: [FEATURE_MAP.md](../product/FEATURE_MAP.md).

## Milestones

Order, goals, and status: the `milestones` array in [TASKS.json](TASKS.json). Goals of `planned` milestones are drafts until the owner activates them.

| ID | Milestone | Why at this point | Blocking decisions (resolve before or inside the milestone) |
|---|---|---|---|
| M0 | Foundation ([ADR-0001](../architecture/decisions/0001-initial-application-foundation.md)) | Gates and structure before any feature code | None |
| M1 | App Shell & Design Foundation | Every screen needs the shell. It validates the design system in real UI. | Owner approval of the shell flow specs, copy, and design values (tasks M1-01 to M1-03) |
| M2 | Backend & Persistence Foundation | Stored data is needed before accounts, progress, and content can exist on the server | API contracts and validation: owner decisions 2026-10-10, ADR-0002 (acceptance is task M2-01). Schema design: no product models in M2 (owner decision 2026-10-10); tables arrive with the features that need them. Hosting and data residency: TBD, needed before any production database, not for M2 (owner decision 2026-10-10). A local database needs Docker on the development machine (M2-02). |
| M3 | Onboarding + Home | Core loop: "understand what to do" | Owner decisions 2026-10-10: three onboarding steps (exam type, target band, diagnostic invitation), a one-action home, guest-first without auth. Inside M3, approved at M3-05: flow specs and copy, design values, guest state on the device (ADR-0003), web feature structure (ADR-0004), the M3 next-action rules, and where the diagnostic CTA leads. The level-check (diagnostic) design itself stays open. |
| M4 | Reading Engine | Signature experience ([READING_EXPERIENCE.md](../product/READING_EXPERIENCE.md)). A direct Reading link is an acquisition path. | Owner decisions 2026-10-10: the engine scope (domain model, content contract, session state, navigator, bottom sheet, answer persistence, timer, question renderers, highlighting, Pin Evidence, Practice and Exam Modes, desktop exam layout); review, explanations and Error Intelligence are M5; original demo content only. Decided at one gate (M4-09): question-type scope and interactions, bottom-sheet behavior (sizes, snap points, gestures), Pin Evidence, Practice vs Exam, the persistence model (ADR-0006), the desktop exam layout, the content contract (ADR-0005), UI primitives (ADR-0007), Academic vs General Training content, and whether answer checking is in M4. Status colors only if M4 shows correctness. |
| M5 | Reading Review + Error Intelligence | Turns practice into understanding (product loop) | All at one owner gate (M5-01), drafted 2026-10-11 in [READING_EXPERIENCE.md, M5 specifications](../product/READING_EXPERIENCE.md#m5-specifications-drafts) (decisions D1–D25; review snapshot in [M5-01-review-packet.md](M5-01-review-packet.md)): answer-checking rules (sourced; three rules have no official source), no band for the uncalibrated demo test, content versions, key corrections and the M4 import, when results appear, evidence-first review and NOT GIVEN handling, routes and Home, status colors, the error-pattern taxonomy and "recurring" threshold, targeted practice limited to retrying known mistakes, pre-written explanations (AI-drafted, reviewed by people before beta) without runtime AI, ADR-0008 (checking and explanations) and ADR-0009 (attempts on the device). An AI provider ADR only if the owner chooses AI for explanations (recommendation: no). |
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
