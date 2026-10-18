# Feature Map

Canonical owner of **product scope and feature status**. It records intent, not design or implementation. Update a row's status when work starts or ships.

Status values: `Not started` · `Designing` · `In progress` · `Shipped`. Sequencing is owned by [ROADMAP.md](../execution/ROADMAP.md); the Milestones and Beta columns follow it (replanned 2026-10-17).

| Area | Intent (one line) | Status | Milestones | Beta |
|---|---|---|---|---|
| Diagnostic assessment | Find the user's starting level quickly, without a full mock test. | Not started (M3 built the invitation and an interim page) | M7 (Reading section), M9 (Listening section) | Beta |
| Personalized next action | Returning users see the single most useful thing to do now. Personalization may use target band and exam date. | In progress (M3: home with one next action, the level check; guest goal on the device) | M3, M7 (after the level check), M11 (cross-skill) | Beta |
| Navigation and shell | Home and Practice reachable from any shell page: a bottom bar on phones, header links on tablets, a sidebar on desktop. | Shipped (M6; Progress and the account join in M11 and M10) | M6 | Beta |
| Practice Hub | One place to start practice: every Reading and Listening test with its state on this device. | Shipped for Reading (M6: every Reading test with its device state; Listening joins in M8) | M6, M8 | Beta |
| Reading practice | Phone-first Reading with a passage-first layout, a question bottom sheet, Pin Evidence, and Practice/Exam modes. UX direction approved: [READING_EXPERIENCE.md](READING_EXPERIENCE.md). Table, flow-chart and diagram label completion are required before beta (TASKS.json M8-17 to M8-19, on layouts shared with Listening). | In progress (M4: the Reading engine on phone and desktop with the 13 M4 question types, highlighting, Pin Evidence, and Practice and Exam with the timer, reached by direct link; M5: answer checking, a practice score out of 40 (never a band), results kept on the device) | M4, M5, M8 (table, flow-chart, diagram label) | Beta |
| Listening practice | Audio plus questions, with realistic play-once behavior in exam mode. | Not started | M8 | Beta |
| Writing practice | Task 1 / Task 2 practice with AI-estimated feedback. | Not started | After beta (candidate M16) | Post-beta |
| Speaking practice | Recorded answers with AI-estimated feedback. | Not started | After beta (candidate M17) | Post-beta |
| Targeted practice | Short drills aimed at specific question types and weaknesses. | In progress (M5 done: retries of the questions of an attempt that were not fully correct or unanswered, with their own results; no unseen practice before content exists, M13) | M5, M9 (Listening retries); unseen practice needs content (M13 or later) | Beta (retries); unseen drills post-beta unless approved |
| Full mock tests | Realistic timed simulation. Desktop-friendly for computer-delivered IELTS realism. | Not started | M12 | Beta (Listening + Reading) |
| Error review | Evidence-first explanations of every mistake, with "Explain simpler" in uz/ru/en. | In progress (M5 done: evidence-first review of every answer on phone and desktop, with AI-drafted explanations in uz/ru/en awaiting the human review before beta, M15-08 to M15-11 and M15-16) | M5, M9 (Listening) | Beta |
| Error Intelligence | Detect recurring error patterns (not only right/wrong) and turn them into targeted practice. | In progress (M5 done: observable notes per answer and repeated mistakes in the first attempt at a test, a proposed heuristic, with a retry of those questions; learner-confirmed causes and evidence across tests are later, M11) | M5, M9 (Listening), M11 (across tests) | Beta |
| Progress tracking | "Your progress": trend and current estimate, without a dashboard overload. | Not started | M11, M12 (mock history) | Beta |
| Accounts and sync | Optional accounts that carry practice across devices, offered only when they give the learner something. | Not started | M10 | Beta |
| Vocabulary | Vocabulary practice tied to the user's own mistakes and passages. | Not started | Not scheduled | Post-beta |
| Offline / PWA | Installable app. The offline scope is TBD (see ARCHITECTURE.md). | Not started (the PWA shell exists since M0) | M14 | Beta |

## Notes that constrain future design

- Approved principles behind these rows (value before registration, direct entry links, Explain simpler, Error Intelligence) are owned by [PRODUCT.md](PRODUCT.md#approved-product-principles).
- Writing and Speaking feedback falls under the honest-feedback rule in [PRODUCT.md](PRODUCT.md#honest-feedback-non-negotiable).
- Speaking needs microphone permission and audio upload. Listening needs reliable audio delivery on weak connections. Both carry architecture decisions that are still TBD.
- Before a feature moves to `In progress`, its main flow should exist in [USER_FLOWS.md](USER_FLOWS.md).
