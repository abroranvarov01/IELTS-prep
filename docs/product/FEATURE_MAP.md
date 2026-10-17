# Feature Map

Canonical owner of **product scope and feature status**. It records intent, not design or implementation. Update a row's status when work starts or ships.

Status values: `Not started` · `Designing` · `In progress` · `Shipped`. Sequencing is owned by [ROADMAP.md](../execution/ROADMAP.md).

| Area | Intent (one line) | Status |
|---|---|---|
| Diagnostic assessment | Find the user's starting level quickly, without a full mock test. | Not started |
| Personalized next action | Returning users see the single most useful thing to do now. Personalization may use target band and exam date. | In progress (M3: home with one next action, the level check; guest goal on the device) |
| Reading practice | Phone-first Reading with a passage-first layout, a question bottom sheet, Pin Evidence, and Practice/Exam modes. UX direction approved: [READING_EXPERIENCE.md](READING_EXPERIENCE.md). Table, flow-chart and diagram label completion are required before beta (TASKS.json M11-01 to M11-03). | In progress (M4: the Reading engine on phone and desktop with the 13 M4 question types, highlighting, Pin Evidence, and Practice and Exam with the timer, reached by direct link; M5: answer checking, a practice score out of 40 (never a band), results kept on the device) |
| Listening practice | Audio plus questions, with realistic play-once behavior in exam mode. | Not started |
| Writing practice | Task 1 / Task 2 practice with AI-estimated feedback. | Not started |
| Speaking practice | Recorded answers with AI-estimated feedback. | Not started |
| Targeted practice | Short drills aimed at specific question types and weaknesses. | In progress (M5 done: retries of the questions of an attempt that were not fully correct or unanswered, with their own results; no unseen practice before content exists, M9) |
| Full mock tests | Realistic timed simulation. Desktop-friendly for computer-delivered IELTS realism. | Not started |
| Error review | Evidence-first explanations of every mistake, with "Explain simpler" in uz/ru/en. | In progress (M5 done: evidence-first review of every answer on phone and desktop, with AI-drafted explanations in uz/ru/en awaiting the human review before beta, M11-04 to M11-07) |
| Error Intelligence | Detect recurring error patterns (not only right/wrong) and turn them into targeted practice. | In progress (M5 done: observable notes per answer and repeated mistakes in the first attempt at a test, a proposed heuristic, with a retry of those questions; learner-confirmed causes and evidence across tests are later, M8) |
| Progress tracking | "Your progress": trend and current estimate, without a dashboard overload. | Not started |
| Vocabulary | Vocabulary practice tied to the user's own mistakes and passages. | Not started |
| Offline / PWA | Installable app. The offline scope is TBD (see ARCHITECTURE.md). | Not started |

## Notes that constrain future design

- Approved principles behind these rows (value before registration, direct entry links, Explain simpler, Error Intelligence) are owned by [PRODUCT.md](PRODUCT.md#approved-product-principles).
- Writing and Speaking feedback falls under the honest-feedback rule in [PRODUCT.md](PRODUCT.md#honest-feedback-non-negotiable).
- Speaking needs microphone permission and audio upload. Listening needs reliable audio delivery on weak connections. Both carry architecture decisions that are still TBD.
- Before a feature moves to `In progress`, its main flow should exist in [USER_FLOWS.md](USER_FLOWS.md).
