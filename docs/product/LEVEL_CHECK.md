# Level check

Canonical owner of the **level check's purpose, scope, result model and honest wording**. Flows and copy: [USER_FLOWS.md](USER_FLOWS.md) (M7-02). Design values: [DESIGN_SYSTEM.md](../design/DESIGN_SYSTEM.md) (M7-03). Items, results and storage in code: the M7 ADR (M7-04). The items themselves: M7-06.

> **STATUS: DRAFT, awaiting owner approval (M7-05).** Drafted by the worker in M7-01 (2026-10-18). Every section is a proposal with its options and a recommendation until the owner decides; the decisions are listed together at the end. Nothing here is implemented.

The learner-facing name is **"Find your level"** ([UX_PRINCIPLES.md, plain language](UX_PRINCIPLES.md#6-plain-language)); "level check" is the product's name for it in the docs and the code. "Diagnostic" never appears in the interface.

## 1. Purpose

**DRAFT.** The level check gives a learner who has just set a goal a **starting point**: where they stand now in the skills the product teaches, and what to practise first. It feeds Home's next action (M7-10) and, later, cross-skill personalization (M11).

It is **not** a certificate, a prediction of an IELTS result, or a judgement of the learner. It measures only what the product practises, on the product's own scale, with original items (never published IELTS material, [PRODUCT.md](PRODUCT.md#content-integrity-and-brand)). It is optional ("Not now" stays, [USER_FLOWS.md](USER_FLOWS.md#open-questions-m3)); practice is never locked behind it.

What it must do well, in this order: be honest about what it can tell; be short enough to finish on a phone in one sitting; lead to one clear next action; and work the same way for Reading and, later, Listening.

## 2. Skills and sequencing

**DRAFT.** Options:

| | (a) Designed for Reading and Listening; the Reading section ships in M7, the Listening section in M9 | (b) Wait until after Listening and ship both sections at once (M9) | (c) Reading only, for good |
|---|---|---|---|
| Onboarding's promise ("find your level") | Kept early, with the copy saying it covers Reading now | Broken until M9: the interim page stays for two more milestones | Kept, but "your level" would mean Reading only |
| Rework | None: one result model with per-skill sections from the start | None, but M11's personalization has no starting point until M9 | A second model later for Listening |
| Risk | A Reading-only check mistaken for a full one (mitigated by the copy and the result naming the skill) | Learners meet an interim page for longer | The product's two beta skills measured differently |

**Recommendation: (a)**, as the roadmap proposes. Consequences for M7: the check has **sections, one per skill**; in M7 only the Reading section exists, the intro and the result say "Reading", and the result model already holds one record per skill section so M9 adds Listening without changing shape. Writing and Speaking are out of scope (post-beta).

## 3. Length and form

**DRAFT.**

- **Length on a phone: about 15 minutes per section.** Options for the Reading section: (a) **two short original passages (250–350 words each) with 7 questions each, 14 in all**; (b) one full-length passage (700–900 words, 13 questions, as one third of a Reading test); (c) a whole 40-question test. **Recommendation: (a).** Two passages of rising difficulty measure more than one long passage with the same number of questions, 300-word passages read comfortably on a phone, and 14 questions over 4–5 question types are enough for a three-step result ([§5](#5-the-result)) without pretending to more. (c) is a mock, not a check.
- **Fixed forms, not adaptive selection.** Options: (a) **fixed, versioned forms** (`formVersion`), one form at M7, a second form when the content system exists (M13); (b) adaptive selection from an item bank. **Recommendation: (a).** Adaptive testing needs calibrated item parameters from real learners, which do not exist; a fixed form is honest about that, is testable, and keeps results comparable between learners and over time.
- **No time pressure.** Options: (a) **untimed, with the expected time shown ("about 15 minutes") and the time taken recorded**; (b) a timer as in Exam Mode. **Recommendation: (a).** A starting point, not an exam: a timer on a first contact with the product measures nerves as much as reading. Pacing is a practice skill the Reading engine's Exam Mode already teaches. The time taken is recorded for M11, never shown as a judgement.
- **No help that reveals answers.** During the check: no answer feedback, no explanations, no "Explain simpler", no "Mark for review" (nothing to come back to after the result), and the Reading engine's highlighting may stay (it reveals nothing). Evidence pins are not part of the check (they belong to practice and review).
- **Question types:** only the M4-approved Reading types ([READING_EXPERIENCE.md, Question types](READING_EXPERIENCE.md#question-types-m4)); none of the deferred layouts (table, flow-chart, diagram). Each form mixes **4 to 5 types** so the result never depends on one type. Proposed for form A: passage 1 (easier, concrete): True / False / Not Given ×4, sentence completion ×3; passage 2 (harder, argumentative): matching headings ×4, multiple choice (one answer) ×3. M7-06 may rebalance within these constraints.

## 4. Academic or General Training

**DRAFT.** [PRODUCT.md](PRODUCT.md#open-questions) leaves "Academic only, or both at launch" open. For the check at beta:

| | (a) Academic-style passages only | (b) Two forms, one per exam type |
|---|---|---|
| Content | One form (two passages) in M7 | Two forms: double the items, keys, explanations and reviews |
| General Training learners | Take the same check; the intro says the texts are Academic-style, and the reading skills measured (locating information, paraphrase, the writer's view) are the same | Texts closer to their test |
| Result comparability | One scale for every learner | Two scales that cannot be compared or pooled |

**Recommendation: (a) for beta**, with one honest line in the intro and the result for learners whose goal is General Training. This decides the check only; the product-wide question (whether General Training practice content exists at launch) stays open in PRODUCT.md.

## 5. The result

**DRAFT.** The result is a **starting point on the product's own practice scale, per skill**. It is never an IELTS band, a band range or a percentile: no content is calibrated against real IELTS results, so any band would be invented ([honest feedback](PRODUCT.md#honest-feedback-non-negotiable); [`ielts-scoring` rule](../../.claude/rules/domain/ielts-scoring.md)).

Options for what the learner sees per section:

| | (a) The raw score only ("9 of 14 correct") and what to practise first | (b) **The raw score, a starting level on a three-step scale, and what to practise first** | (c) An estimated IELTS band or range |
|---|---|---|---|
| Honesty | Fully honest, but 14 questions as a bare number give no sense of where to start | Honest when the scale is named as ours and the level follows from the score by a stated rule | **Not allowed:** no calibration, no sourced conversion for our items |
| Usefulness to Home and M11 | A number per skill; thresholds would still be needed to act on it | A level per skill that the next action and later rules can use; the score stays visible | n/a |

**Recommendation: (b).**

### 5.1 The model

- **Score:** correct positions out of the form's positions, exactly as M5 checks Reading (unanswered counts as not correct; the same checking module and its rules, [ADR-0008](../architecture/decisions/0008-reading-answer-checking-and-explanations.md) §1). No decimals, no percentages shown to the learner.
- **Starting level:** three steps per skill, computed from the score by thresholds that are **product policy, not an IELTS rule** (no official source exists for our scale; recorded as policy per the `ielts-scoring` rule). Proposed for a 14-question form: **level 1: 0–6 correct; level 2: 7–10; level 3: 11–14** (below half; half to about three quarters; above). Three steps is the finest division 14 questions support honestly; the thresholds live in the domain module with the rules version and are tested at every boundary (M7-07).
- **Level names** are interface copy (M7-02). Constraints: plain, neutral, about where to start rather than about the person; never numbers that look like bands ("level 6"), never "weak", "poor", "beginner". Working names for the draft: *Starting out / On the way / Strong start*.
- **What to practise first:** at most **two** suggestions per section, derived from the question-type outcomes of the check (the M5 signals, by type): a type is suggested when the form has at least 3 of its positions and at least half of them were not correct. With no such type: one sentence that says practice itself is the next step. Suggestions are observations ("the Not Given questions were the hardest for you"), never causes.
- **The sentence of scope, always shown:** "Based on 14 questions in a short check, not a full test." A short check cannot be more certain than that, and the page says so without a confidence number (no false precision).
- **Insufficient data:** a result needs a **finished** section (every question seen; leaving keeps it in progress, [§6](#6-incomplete-resumed-and-retaken-checks)). If **more than half** of the positions are unanswered, the section's result is "not enough answers for a starting point": the score is shown, no level, and the next action is to take the section again. Rationale: a level from a handful of answers would be noise.
- **One skill only (M7):** the result page names the section ("Your Reading starting point") and says the Listening section will follow. **No overall level across skills, ever:** sections stay side by side (M9 adds Listening's); skills are not averaged, because the scales are not comparable.
- **Versioned and kept:** each finished section writes a **result record** with the form version, the checking-rules version and the level-rules version, like M5's result records ([ADR-0009](../architecture/decisions/0009-reading-attempts-on-the-device.md) §7); records are never rewritten. The ADR (M7-04) decides the storage.

### 5.2 What is never shown

An IELTS band or range; a percentile or comparison with other learners; decimals or percentages; a time judgement ("too slow"); a cause ("you cannot infer"); a diagnosis word; a celebration or a failure screen ([UI_ANTI_PATTERNS.md](../design/UI_ANTI_PATTERNS.md)).

## 6. Incomplete, resumed and retaken checks

**DRAFT.**

- **Leaving:** the check keeps its session on the device (as Reading sessions do, [ADR-0006](../architecture/decisions/0006-reading-session-state.md); the M7 ADR decides the exact store). Nothing is lost; no result exists until the section is finished.
- **Resuming:** onboarding step 3 and Home say **"Continue the level check"** instead of "Start the level check" while a section is in progress, and open it at the question where the learner left. The intro is skipped. No expiry in M7; the intro offers "Start over" for a stale session.
- **Finishing:** "Finish" asks once (unanswered questions are named, as in Reading), then the section is checked and the result shown. The session is committed once, atomically, even with two tabs open (the ADR, as [ADR-0009](../architecture/decisions/0009-reading-attempts-on-the-device.md) §4 does for attempts).
- **Retaking.** Options: (a) **allowed at any time; each retake is a new attempt; the latest finished result is the starting point; all results are kept**; (b) allowed once per period (for example 14 days); (c) never. **Recommendation: (a).** A lock would be a rule the product cannot justify, and the history is kept, so nothing is lost. With one form at M7 the retake repeats the same questions: the result page says so in one honest line ("Practice measures more than repeating the same check"), and a second form is a content task (M13). Home never prompts a retake by itself (that is M11's decision).
- **Storage blocked or unavailable:** the check still runs and shows its result, kept in memory for the tab, with the M5 storage notice; nothing is written.
- **Direct entry** to `/{locale}/level-check` without a goal: allowed (direct entry paths, [PRODUCT.md](PRODUCT.md#approved-product-principles)); the intro is the same; the goal is not required.

## 7. What the result hands on

**DRAFT.**

- **To Home, in M7 (M7-10):** the next action changes once a section is finished. Options for the next action after the Reading section: (a) **"Practise Reading"** opening the Practice Hub's Reading tests (the first test preselected on the start screen is M11's rule, not M7's); (b) the first Reading test directly. **Recommendation: (a)**: the Hub is the entry the product already has, and M11 decides which test. While a section is in progress: "Continue the level check". Home is rendered from a cookie and cannot read the device's storage ([ADR-0006](../architecture/decisions/0006-reading-session-state.md) §4, READING_EXPERIENCE.md, Home in M5), so M7 needs a way for Home to know the check's **state only**. Options: (a) **a server-managed cookie flag with the state per section (not started / in progress / finished) and nothing else**, like the goal cookie ([ADR-0003](../architecture/decisions/0003-guest-state-on-the-device.md)); (b) Home reads the device after mounting. **Recommendation: (a)** for M7 (the result itself stays on the device; the flag carries no score); M11 decides Home's full data path. The M7 ADR records it.
- **To Home, later (M11):** the result records (per skill: score, level, type outcomes, form version, rules versions, when finished, time taken) are inputs to the recommendation rules and the progress screen, with their insufficient-data and stale-data states. The check makes no recommendation beyond its own next action.
- **To sync (M10):** result records and the in-progress session move with the device's history; the records' versions make them mergeable without rewriting.

## 8. Item requirements (for M7-06)

**DRAFT.**

- **Original** passages and questions, written for the check, never adapted from published IELTS material; Academic-style ([§4](#4-academic-or-general-training)); topics neutral and familiar to learners in Uzbekistan without local knowledge; British spelling as in the test.
- **Form A (M7):** two passages of 250–350 words, rising in difficulty; 14 questions in 4–5 approved types ([§3](#3-length-and-form)); the Reading content contract ([ADR-0005](../architecture/decisions/0005-reading-content-contract.md)) and its validator; a separate key with evidence sentences and tags, as the M5 key.
- **Explanations after the check.** Options: (a) **the result offers "See your answers": the M5 review with pre-written explanations and "Explain simpler", in en, ru and uz**; (b) no review, only the next action. **Recommendation: (a).** Understanding mistakes is the product loop, and the check is many learners' first contact with it; the review already exists. Cost: explanations for 14 items in three languages (AI-drafted, `aiDraft`, human review before beta, M15).
- **Authorship:** every item file records that Claude drafted it; PROGRESS.md records the drafting; the human review is a before-beta task (M15).
- **Form versions:** a form is immutable once results may exist; any change is a new form version (fingerprint test, as ADR-0008 §3).

## 9. Honest wording

**DRAFT.** Principles for every string (copy in M7-02, [LOCALIZATION.md](LOCALIZATION.md) rule 7 for uz and ru):

- Name what it is: "starting point", "our practice scale", "a short check". Name the skill: "Reading".
- Say what it is not, once, plainly: "not an IELTS band".
- Say what it is based on: "14 questions in a short check, not a full test".
- Observations, not causes or labels: "the Not Given questions were the hardest for you", never "you are weak at inference".
- Never: band, score out of 9, level numbers, percentile, "diagnosis", "assessment", "pass", "fail", "excellent", "poor".

Example English result, Reading section finished with 9 of 14: **"Your Reading starting point: On the way.** 9 of 14 correct. Based on 14 questions in a short check, not a full test. This is where to start on our practice scale, not an IELTS band. **Practise first:** Not Given questions. **[Practise Reading]** See your answers · Take the check again".

## 10. Decisions for M7-05

Each with the recommendation above; answering them is the gate.

| # | Decision | Options | Recommendation |
|---|---|---|---|
| D1 | Skills and sequencing | (a) Reading now, Listening in M9, one model; (b) both at M9; (c) Reading only | (a) |
| D2 | Length of the Reading section | (a) two short passages, 14 questions, about 15 min; (b) one long passage, 13; (c) a full test | (a) |
| D3 | Item selection | (a) fixed versioned forms; (b) adaptive | (a) |
| D4 | Timing | (a) untimed, expected time shown, time taken recorded; (b) a timer | (a) |
| D5 | Question types in a form | the M4 types only, 4–5 per form, the proposed mix for form A | as proposed |
| D6 | Exam type at beta | (a) Academic-style only, one honest line for GT learners; (b) two forms | (a) |
| D7 | The result | (a) raw score only; (b) raw score + three-step level + what to practise first; (c) a band | (b) |
| D8 | Level thresholds | 0–6 / 7–10 / 11–14 of 14, as product policy | as proposed |
| D9 | Insufficient data | no level when more than half is unanswered; a finished section is required for any result | as proposed |
| D10 | Retakes | (a) any time, latest counts, history kept; (b) once per period; (c) never | (a) |
| D11 | Next action after the Reading section | (a) the Practice Hub; (b) the first Reading test | (a) |
| D12 | How Home learns the check's state | (a) a state-only cookie flag per section; (b) Home reads the device after mounting | (a) |
| D13 | Explanations after the check | (a) the M5 review with explanations; (b) none | (a) |
| D14 | Level names | plain, neutral, about where to start (working: Starting out / On the way / Strong start); the copy task proposes the final names in three languages | the constraints |

If an answer changes the milestone's scope (for example D1 (b) or D13 (b)), the later M7 tasks are adjusted before work continues (M7-05).
