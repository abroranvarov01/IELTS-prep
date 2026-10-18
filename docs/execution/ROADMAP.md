# Roadmap

Canonical owner of **milestone sequencing rationale and the decisions that block each milestone**. The milestones themselves (order, name, one-line goal, status) and all tasks live in [TASKS.json](TASKS.json). Feature scope and status: [FEATURE_MAP.md](../product/FEATURE_MAP.md).

Replanned on 2026-10-17 after M5 (owner request): the old M6–M11 (Listening, Accounts, Progress, Content, PWA, Beta) were too compressed and missed the level check, a product UI foundation, Listening review and mocks. M6–M15 below replace them; the reasons are in [PROGRESS.md](PROGRESS.md). Goals of `planned` milestones are drafts until the owner activates them.

## The beta this plan leads to

A learner can **onboard → find their starting point → know what to do next → practise Reading and Listening → understand mistakes → retry → see progress → get the next recommendation → take a mock → check their level again**, in Uzbek, Russian or English, on a mid-range phone and on a laptop for realistic exam simulation. Accounts stay optional; nothing requires sign-up before practice. Every score is a practice result on our own content, honestly labelled; no band is shown until content is calibrated. Writing and Speaking are post-beta.

## Completed milestones

| ID | Milestone | Why at this point | Blocking decisions (resolve before or inside the milestone) |
|---|---|---|---|
| M0 | Foundation ([ADR-0001](../architecture/decisions/0001-initial-application-foundation.md)) | Gates and structure before any feature code | None |
| M1 | App Shell & Design Foundation | Every screen needs the shell. It validates the design system in real UI. | Owner approval of the shell flow specs, copy, and design values (tasks M1-01 to M1-03) |
| M2 | Backend & Persistence Foundation | Stored data is needed before accounts, progress, and content can exist on the server | API contracts and validation: owner decisions 2026-10-10, ADR-0002 (acceptance is task M2-01). Schema design: no product models in M2 (owner decision 2026-10-10); tables arrive with the features that need them. Hosting and data residency: TBD, needed before any production database, not for M2 (owner decision 2026-10-10). A local database needs Docker on the development machine (M2-02). |
| M3 | Onboarding + Home | Core loop: "understand what to do" | Owner decisions 2026-10-10: three onboarding steps (exam type, target band, diagnostic invitation), a one-action home, guest-first without auth. Inside M3, approved at M3-05: flow specs and copy, design values, guest state on the device (ADR-0003), web feature structure (ADR-0004), the M3 next-action rules, and where the diagnostic CTA leads. The level-check (diagnostic) design itself stays open. |
| M4 | Reading Engine | Signature experience ([READING_EXPERIENCE.md](../product/READING_EXPERIENCE.md)). A direct Reading link is an acquisition path. | Owner decisions 2026-10-10: the engine scope (domain model, content contract, session state, navigator, bottom sheet, answer persistence, timer, question renderers, highlighting, Pin Evidence, Practice and Exam Modes, desktop exam layout); review, explanations and Error Intelligence are M5; original demo content only. Decided at one gate (M4-09): question-type scope and interactions, bottom-sheet behavior (sizes, snap points, gestures), Pin Evidence, Practice vs Exam, the persistence model (ADR-0006), the desktop exam layout, the content contract (ADR-0005), UI primitives (ADR-0007), Academic vs General Training content, and whether answer checking is in M4. Status colors only if M4 shows correctness. |
| M5 | Reading Review + Error Intelligence | Turns practice into understanding (product loop) | Decided at one owner gate (M5-01, owner, 2026-10-11: D1 and D3–D25 as recommended, D2 amended, seven amendments), drafted 2026-10-11 in [READING_EXPERIENCE.md, M5 specifications](../product/READING_EXPERIENCE.md#m5-specifications-drafts) (decisions D1–D25; review snapshot in [M5-01-review-packet.md](M5-01-review-packet.md)): answer-checking rules (sourced; three rules have no official source), no band for the uncalibrated demo test, content versions, key corrections and the M4 import, when results appear, evidence-first review and NOT GIVEN handling, routes and Home, status colors, the error-pattern taxonomy and "recurring" threshold, targeted practice limited to retrying known mistakes, pre-written explanations (AI-drafted, reviewed by people before beta) without runtime AI, ADR-0008 (checking and explanations) and ADR-0009 (attempts on the device). An AI provider ADR only if the owner chooses AI for explanations (recommendation: no). |

**Deliberately not in M1:** reusable UI primitives without a consumer (a Button, the bottom-sheet base) arrive with their first consumer, in M3 and M4 ([CODE_QUALITY.md § Abstraction threshold](../engineering/CODE_QUALITY.md#abstraction-threshold)).

## M6–M15: the path to beta

| ID | Milestone | One-sentence purpose | Owner gate |
|---|---|---|---|
| M6 | Product UI Foundation + Practice Hub | Apply the Design Operating System to everything that exists, settle navigation, add one place to start practice, and lock owner-approved reference screenshots. | M6-04 |
| M7 | Level Check (Diagnostic) | Replace the interim level-check page with a short, honest starting-point check whose result feeds the next action. | M7-05 |
| M8 | Listening Engine | The second skill's engine, as M4 was for Reading, plus the shared table, flow-chart and labelling layouts that Reading also needs. | M8-06 |
| M9 | Listening Review + Error Intelligence | Turn Listening practice into understanding: timestamped audio evidence, transcript, why, retry; and the level check's Listening section. | M9-04 |
| M10 | Accounts + Sync | Optional accounts that carry the device's history across devices without losing or rewriting it; the first server product models. | M10-05 |
| M11 | Cross-skill Home + Progress + Personalization | Home answers "what should I do now?" from real Reading, Listening and level-check data; a progress screen without false precision. | M11-04 |
| M12 | Mock Experience | Full Listening + Reading mocks as calm measurement, with review, weak areas and a next action. | M12-04 |
| M13 | Content System | A production pipeline (authoring, validation, review status, provenance, publishing, rollback) and the beta content library. | M13-02 |
| M14 | PWA + Performance + Reliability | Production-grade install, caching, weak-network behavior, budgets in CI, error reporting and the production environment. | M14-03 |
| M15 | Beta Hardening | Every before-beta review and check, done by the right people, then the owner's launch decision. | M15-18 |

Each milestone starts with worker drafts (specs, copy, design values, ADRs), then **one owner gate** where a wrong decision would force rework, then implementation, then an integration checkpoint. Activating a milestone stays a separate owner action ([Rules](#rules)).

### M6 — Product UI Foundation + Practice Hub
- **Why now:** five milestones of screens exist; Listening, the level check, progress and mocks will add many more. Settling the visual language, navigation and reference screenshots now stops each later milestone from redesigning the shell and repeating the same visual debates.
- **Outcomes:** a recorded UI audit of every existing surface; navigation and responsive shell decided and built; a Practice Hub (`/{locale}/practice`) as the entry to Reading tests with their state on this device, ready to list Listening when it exists; Home and onboarding at final visual quality; Reading surfaces consistent with the same language; owner-approved reference screenshots in `docs/design/references/`.
- **Depends on:** M5 (done).
- **Decisions (M6-04):** navigation model; Practice Hub content and how Home reaches it without losing its one primary action; whether the Hub shows anything for skills that do not exist yet; the audit items in scope (a capped list); the reference screens to approve.
- **Out of scope:** new product behavior beyond navigation and the Hub; a token or type-scale overhaul; illustration programs; Figma.
- **Exit criteria:** every audit item in the approved list is closed or explicitly deferred with a reason; approved references exist for Home, onboarding, Practice Hub, the Reading test (phone and desktop), results and review; the full gate suite passes; later milestones start from these references instead of redesigning.
- **Risks:** turning into an endless redesign (mitigated by the capped audit list and the exit criteria); navigation that crowds the phone screen.

### M7 — Level Check (Diagnostic)
- **Why now:** onboarding has invited learners to a level check since M3, and personalization (M11) needs a starting point. Building it before Listening keeps the onboarding promise honest early; designing it for both skills now avoids rebuilding it later.
- **Outcomes:** a canonical spec for the level check; an original item set; a pure scoring and result model with a rules version; resume, incomplete and retake behavior; the real `/{locale}/level-check` replacing the interim page; a result screen with one next action; results stored on the device compatibly with later sync.
- **Depends on:** M6 (visual foundation, navigation).
- **Decisions (M7-05):** purpose and skills (recommended: designed for Reading and Listening, the Reading section in M7 and the Listening section in M9); length and item selection (recommended: fixed short forms, not adaptive); what the result is (recommended: an honestly labelled starting point or range on our own practice scale, **no IELTS band**, since nothing is calibrated); Academic only or also General Training at beta (PRODUCT.md open question; recommended: Academic only); retake rules; how the result feeds Home.
- **Out of scope:** band conversion; adaptive testing; Writing and Speaking; AI scoring.
- **Exit criteria:** a learner can take, leave, resume, finish and retake the Reading section on phone and desktop in uz/ru/en; the result wording passes the honest-feedback rule; the full suite passes.
- **Risks:** false psychometric precision (mitigated by the result model decision and the scoring rule); a Reading-only first version mistaken for a full level check (the copy says which skills it covers).

### M8 — Listening Engine
- **Why now:** Listening is the second skill of the beta and the largest new engine. It reuses the Reading architecture where it fits (content contract pattern, session model, sheet, navigator, answer controls) and adds audio.
- **Outcomes:** a canonical Listening experience spec; every Listening question family (multiple choice, multiple answers, matching, plan/map/diagram labelling, form, note, table, flow-chart and sentence completion, short answer); Sections 1–4; a Listening content contract with audio assets, transcripts with timestamps (stored now, shown in M9) and images with text alternatives; the player in Practice (pause, rewind, speed) and Exam (realistic play restrictions); weak-network loading and resume; phone and desktop layouts; an original demo test with real audio; Reading table, flow-chart and diagram label completion on the shared layouts (the M4 pre-beta follow-ups).
- **Depends on:** M6. The level check does not block it.
- **Decisions (M8-06):** question-type interactions; Practice vs Exam behavior of the player (what is allowed, timing, reading time, section changes); the content contract and audio asset model (ADR); audio delivery, preloading and caching on weak connections (ADR); design values; **who produces original audio and how it is licensed** (human or synthetic voices, accents), the first real content-sourcing decision (PRODUCT.md open question).
- **Out of scope:** answer checking, review and transcripts shown to learners (M9); offline downloads (M14); production audio hosting (M14).
- **Exit criteria:** the demo test can be practised and taken as an exam on phone and desktop, every question family works, audio behaves on a throttled connection, and the three Reading types work in both modes; the full suite passes.
- **Risks:** the milestone's size (mitigated by one task per family or layout); audio production blocking the demo (the human audio task follows the drafted scripts right after the gate); play restrictions that frustrate learners on bad connections.

### M9 — Listening Review + Error Intelligence
- **Why now:** without review, Listening practice does not complete the product loop. Cross-skill personalization (M11) is not complete before it.
- **Outcomes:** sourced Listening answer-checking rules; results; evidence-first review whose signature object is **audio timestamp + transcript evidence + why + try again** (replay of the evidence segment, the evidence phrase highlighted); explanations and "Explain simpler" (pre-written, AI-drafted, reviewed by people before beta); retries; Listening signals and repeated mistakes where the data supports them; the shared attempt history extended to Listening without touching Reading data; the level check's Listening section.
- **Depends on:** M8; M7 for the level check's Listening section.
- **Decisions (M9-04):** checking rules with sources (spelling, numbers, dates, word limits); the Listening signal taxonomy and thresholds; transcript visibility; how the attempt history holds a second skill (ADR extending ADR-0009, with a migration of the existing database).
- **Out of scope:** runtime AI; learner-confirmed causes; evidence across tests (M11).
- **Exit criteria:** a Listening attempt can be finished, checked, reviewed with timestamped evidence and retried on phone and desktop; existing Reading attempts survive the history upgrade (tested); the level check covers both skills; the full suite passes.
- **Risks:** a database upgrade that loses Reading history (mitigated by migration tests with real M4/M5 data shapes); claiming causes ("you can't hear numbers") the data does not show.

### M10 — Accounts + Sync
- **Why now:** durable progress across phone and laptop needs it, and progress and mocks (M11, M12) get far more valuable with it. It comes after both skills exist so that one sync model covers Reading, Listening and the level check.
- **Outcomes:** the **first server-side product models** (users, sessions, synced attempts, results, level-check results, profile and preferences); optional sign-in offered only when it gives the learner something; guest → account migration of the device's history (M4 sessions, M5 attempts, result records, highlights, pins, retries, first-try markers) without rewriting it; multi-device consistency and conflict rules; account deletion and export; the web's first API consumer.
- **Depends on:** M9 (the history shape of both skills), M7.
- **Decisions (M10-05):** authentication methods and providers (ADR; phone/SMS, Telegram, Google, email — PRODUCT.md open question); when registration is offered; the sync and conflict model (ADR); how the web gets API types (ADR-0002 §6) and the `apps/api` feature structure; minors' consent and data residency (legal input M10-01, human); which data is stored server-side at all (minimization).
- **Out of scope:** paid plans; social features; production hosting (M14).
- **Exit criteria:** a guest's history moves into an account intact and appears on a second device; deletion removes server data; nothing requires sign-up before practice; security tests pass; the full suite and the API e2e pass.
- **Risks:** legal requirements (data localization for Uzbek citizens, minors) changing the design late (mitigated by the legal input before the ADRs); merging histories that breaks the "first committed attempt" guarantee.

### M11 — Cross-skill Home + Progress + Personalization
- **Why now:** this is when real data exists: level-check results, Reading and Listening history, retries and repeated mistakes, optionally across devices.
- **Outcomes:** deterministic, explainable recommendation rules with "why this"; Home showing one next action, continue-where-you-left-off and a compact progress preview; a Progress screen (trend only with enough data, weak areas, recent activity, target band context); new-learner, insufficient-data and stale-data states.
- **Depends on:** M7, M9, M10.
- **Decisions (M11-04):** the recommendation rules and their thresholds; what "current performance" is shown as, and when (honest ranges, insufficient-data states); where Home and Progress get their data (Home is server-rendered from a cookie today and cannot read device storage, ADR-0003, ADR-0006 §4; ADR); whether any progress model is stored server-side.
- **Out of scope:** AI recommendations; vanity dashboards; streaks or gamification.
- **Exit criteria:** every recommendation can be explained from the learner's own data, tested at its boundaries; Home keeps one primary action; the full suite passes.
- **Risks:** fake precision; a dashboard creep that breaks the UX principles.

### M12 — Mock Experience
- **Why now:** mocks need both engines (M8, M4), honest results language, and progress to feed (M11).
- **Outcomes:** a mock entry; a full Listening + Reading mock with official timing on desktop (and the phone policy the gate decides); resume rules; results as one measurement, not a verdict; review entry; weak areas and the next action; mock history and trend within Progress.
- **Depends on:** M11 (progress and recommendations), M8, M9.
- **Decisions (M12-04):** formats (full mock, skill mocks, Practice vs Realistic); the result language (recommended: practice scores per skill, no band while content is uncalibrated; any band estimate needs sourced conversion and calibration first); review before score; resume rules; mocks on phones.
- **Out of scope:** Writing and Speaking sections; leaderboards; public scores.
- **Exit criteria:** a learner can take, resume, finish and review a full mock; results never claim a "true level"; the full suite passes.
- **Risks:** psychological harm from harsh result screens (mitigated by the approved surface direction); too little content for more than one mock before M13.

### M13 — Content System
- **Why now:** until here, hand-made JSON is enough for one demo test per engine. A beta needs a library of reviewed, versioned, provenance-tracked content, and every engine and its history exist to integrate with.
- **Outcomes:** content lifecycle and review statuses across Reading, Listening, the level check and mocks (draft → AI-assisted draft if used → validated → content review → answer and evidence review → localization review → approved → published); provenance and licensing records; difficulty metadata; publishing and rollback; compatibility with historical attempts; authoring and validation tools; the beta content library drafted and its audio produced.
- **Depends on:** M12 (all content types exist). Content production by people may start earlier, after the M8 sourcing decision.
- **Decisions (M13-02):** where content lives and how it is delivered (files in the repository vs database and API vs another tool; ADR); who writes and reviews content (PRODUCT.md open question); the size of the beta library.
- **Out of scope:** runtime AI generation; a public content library to browse; content scale beyond beta (post-beta).
- **Exit criteria:** every shipped content item carries a review status and provenance; publishing and rollback are tested; historical attempts survive a content change; the beta library exists as drafts with audio; the full suite passes.
- **Risks:** content volume and human review time are the critical path to beta (start commissioning after M8); AI drafts shipping without human review (prevented by the status checks).

### M14 — PWA + Performance + Reliability
- **Why now:** productionizes what exists, once its full shape is known: audio caching, many content sets, accounts and the production environment.
- **Outcomes:** final icons and install experience; the agreed offline scope; caching, quotas, invalidation and service-worker updates; weak-network resilience everywhere; performance budgets enforced in CI; error reporting and observability without personal data; the production environment prepared by the owner.
- **Depends on:** M13.
- **Decisions (M14-03):** offline scope (ARCHITECTURE.md TBD); budgets; error-reporting and analytics tools and their privacy handling (including minors); production hosting (if not settled in M10).
- **Out of scope:** full offline support unless approved; native apps.
- **Exit criteria:** budgets pass in CI; errors from web and API are reported without personal data; the app installs and updates cleanly; the production environment exists (owner); the full suite passes.
- **Risks:** analytics or monitoring that conflicts with privacy rules for minors.

### M15 — Beta Hardening
- **Why now:** last step before real users; it collects every before-beta item recorded since M3.
- **Outcomes:** a beta checklist built from the record; legal and privacy review and its consequences; security review; accessibility audit with real TalkBack and iOS checks; real-device and weak-network checks; human reviews of all keys, evidence, transcripts, explanations and the level check; fluent uz and ru review of all interface copy and explanations; content provenance review; support and error-recovery basics; launch and rollback runbooks; the owner's release approval and launch decision.
- **Depends on:** M14.
- **Decisions:** the owner's release approval of content (M15-16) and the launch decision (M15-18).
- **Out of scope:** new features.
- **Exit criteria:** every checklist item is done or explicitly accepted by the owner; the full suite passes on the release candidate.
- **Risks:** human review capacity; findings that need product changes late (mitigated by per-milestone localization and accessibility work instead of saving it all for the end).

## Cross-cutting rules for M6–M15

- **Server-side product models** appear only where a milestone first needs them, each through an ADR at that milestone: accounts and synced history (M10), possibly progress (M11), mock attempts within the sync model (M12), content storage and delivery (M13). No schema is invented earlier.
- **Compatibility:** M4 sessions, M5 attempts, result records, highlights, pins, retries and first-try markers keep their meaning. Any change to stored data (the Listening history upgrade in M9, sync in M10, content versions in M13) comes with an approved migration and tests on real stored shapes.
- **Localization:** every milestone that adds copy or content ships it in uz, ru and en with key parity tests; fluent human review is collected in M15.
- **Accessibility and design:** every UI task follows the `product-design` skill (screenshots at the listed widths, uz/ru review, critique), ACCESSIBILITY.md and axe in e2e. Exact visual values stay in DESIGN_SYSTEM.md.
- **AI:** no runtime AI in M6–M15 without a prior owner decision and an AI provider ADR (ARCHITECTURE.md TBD). AI may draft content and explanations, which ship only after human review.
- **Privacy:** the product may be used by minors: data minimization, no unnecessary profile fields, no personal data in logs or error reports, deletion supported, no selling data, no social or leaderboard features.

## After beta (not planned in detail)

Writing (M16), Speaking (M17), AI assessment and calibration (M18), content scale (M19), growth (M20), B2B or API (M21) and native experiments (M22) are candidate directions only, with no tasks. Each needs its own decisions (for Writing and Speaking: the AI provider ADR and calibration of estimates, PRODUCT.md open questions).

## Rules

- Exactly one milestone is `active` at a time. The owner activates the next milestone after its tasks are written in TASKS.json. A worker never activates a milestone ([AUTONOMOUS_WORKFLOW.md](AUTONOMOUS_WORKFLOW.md)).
- New tasks are appended to TASKS.json with their `milestone` id. Completed tasks are never deleted or renamed. Their history also stays in PROGRESS.md and git. Tasks not yet done may move to another milestone with a new id when the roadmap changes; the old id is kept in their `notes`.
- A milestone is complete when all of its tasks are `done` and the full gate suite passes.
- A worker must not start work whose blocking decisions are open. Open decisions become human tasks or stop conditions.
