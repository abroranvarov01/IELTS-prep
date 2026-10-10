# Reading Experience

Canonical owner of the **Reading interaction model**, the product's signature experience.

> **STATUS: APPROVED PRODUCT/UX DIRECTION.** The interaction model below is decided. Exact visual measurements, gestures, component structure, and implementation are **not** decided. Nothing here is implemented.

General UX rules still apply ([UX_PRINCIPLES.md](UX_PRINCIPLES.md)), as do accessibility requirements ([ACCESSIBILITY.md](../design/ACCESSIBILITY.md)) and the visual system ([DESIGN_SYSTEM.md](../design/DESIGN_SYSTEM.md)).

## Mobile Reading (approved direction)

1. **The passage is the main visual object.** It gets the screen, the reading typography, and the user's attention.
2. **Questions live in a persistent, floating bottom sheet** over the passage, not on separate pages.
3. **The sheet shows the current question** without forcing the user to keep switching between a passage page and a question page. Users read and answer in the same place.
4. **Question UI adapts to the IELTS question type** (e.g. multiple choice, True/False/Not Given, matching headings, completion tasks). Each type gets the interaction that suits it on a phone. A generic form is not enough.
5. **Users can highlight text** in the passage.
6. **Pin Evidence.** While answering, the user can pin the sentence or paragraph they believe supports their answer, so it stays visible next to the question.

## Review (Practice Mode)

**Evidence-first review.** For each question, review shows:
- **where the answer comes from** in the passage (the evidence, located in context), and
- **why**: the paraphrase or reasoning that connects the question wording to the passage wording.

If the user pinned evidence, review compares it with the actual evidence. Review feeds Error Intelligence and supports "Explain simpler" (both owned by [PRODUCT.md](PRODUCT.md#approved-product-principles)).

## Practice Mode vs Exam Mode

| | Practice Mode | Exam Mode |
|---|---|---|
| Goal | Comfortable learning | Reproduce real test constraints |
| Learning help (explanations, hints, Explain simpler) | May be available | **Removed** |
| Highlighting | Yes | Expected yes, because the real computer-delivered test allows it. Confirm in design. |
| Pin Evidence | Yes | Not decided |
| Timing | Flexible (see [ACCESSIBILITY.md](../design/ACCESSIBILITY.md#motion-and-time)) | Real test timing |
| Feedback | Evidence-first review | After the test only |

## Desktop

**Desktop Exam Mode** may use a realistic side-by-side passage/question layout that resembles computer-delivered IELTS, instead of copying the mobile bottom-sheet layout. Mobile is optimized for comfortable learning. Desktop can provide realistic simulation.

## Open details (not yet decided)

- Sheet sizes and snap points, gestures, and how the passage scroll position relates to the current question.
- Highlight colors and styles, and whether highlights and pinned evidence persist across sessions and devices.
- Whether Pin Evidence is available in Exam Mode.
- The exact Practice Mode help features beyond evidence-first review.
- The interaction for each question type (this needs one design pass per type).
- Accessibility of the sheet: screen-reader order between passage and sheet, keyboard access on desktop, behavior at 200% zoom and 320 px width, reduced motion.

## M4 specifications (drafts)

**DRAFT: awaiting owner approval** (tasks M4-01 to M4-04, decided together at the M4-09 gate). These sections turn the approved direction above into buildable specs for the Reading engine (M4). Review, explanations and Error Intelligence are M5. Interface copy for these specs is in [USER_FLOWS.md, Interface copy (M4)](USER_FLOWS.md#interface-copy-m4). Test content (passages, questions, instructions such as "Do the following statements agree with the information given in the passage?", and answer words such as TRUE or NOT GIVEN) stays in English and is marked `lang="en"` inside a Russian or Uzbek interface.

**Owner decisions these specs implement (2026-10-10):** mobile-first; the passage is the main visual object; the current question lives in a persistent bottom sheet with collapsed / partial / expanded states if needed; a question navigator for the full Reading test; question UI adapts by IELTS question type; highlighting; Pin Evidence associates passage text with the current question; Practice Mode may provide help; Exam Mode removes learning assistance and follows realistic IELTS constraints; desktop Exam Mode may use passage and questions side by side; only small original demo content.

### Question types (M4)

**DRAFT: awaiting owner approval** (task M4-01).

**The IELTS Reading question types** (sources: the official test-format pages of the IELTS partners, e.g. British Council "IELTS exam format" and IDP "IELTS test format explained"; a Reading test has 3 sections and 40 questions in 60 minutes, one mark per question). Grouped by how the user answers:

| Interaction | IELTS question types | Proposed for M4 |
|---|---|---|
| **Choose one** | True / False / Not Given (identifying information); Yes / No / Not Given (identifying the writer's views or claims); multiple choice with one answer | Yes |
| **Choose several** | Multiple choice with more than one answer ("Choose TWO letters") | Yes |
| **Choose from a list** (shared options) | Matching headings; matching information (which paragraph contains…); matching features; matching sentence endings; summary completion from a box of words | Yes |
| **Type words** | Sentence completion; summary completion from the passage; note completion; short-answer questions | Yes |
| **Type words, special layout** | Table completion; flow-chart completion | **Deferred** |
| **Type words, on an image** | Diagram label completion | **Deferred** |

**Why the deferrals:** table and flow-chart completion need a two-dimensional layout that does not fit 320 px without its own design pass, and diagram labelling needs images with text alternatives and an image pipeline the content contract does not have yet. None of them adds a new way to answer: each is "type words" in another layout, so the engine (data contract, session, navigator) covers them, and they can be added with their first content set without engine changes. Proposed: when real content needs them (content sourcing, M9), each with one design pass.

**What every question shows in the sheet:** its number, the group's instruction (English test content, including the word limit, e.g. "Write NO MORE THAN TWO WORDS from the passage for each answer"), the prompt, the answer control, and the sheet's own controls (M4-02). Answer words such as TRUE, FALSE, NOT GIVEN are written in full exactly as in the test, never abbreviated.

#### Choose one: True / False / Not Given, Yes / No / Not Given, multiple choice (one answer)
- **Phone:** the options as a vertical list of full-width option rows (at least 48 px high): `TRUE`, `FALSE`, `NOT GIVEN`; or `A` to `D`, each with its letter and text. Tapping a row selects it. **No auto-advance** (unlike onboarding): users often reconsider, and moving on stays a deliberate "Next" (M4-02). The selected row shows a check mark and a heavier border, not only a fill (I-8).
- **Keyboard:** a native radio group. Tab reaches the group, arrow keys move the selection, Space selects. Moving with arrows never changes question.
- **Changing and clearing:** tapping another option replaces the answer. A quiet "Clear answer" action appears once there is an answer, because a radio group cannot be emptied otherwise and an unanswered question must stay possible.
- **Desktop:** the same rows in the question column (M4-04).

#### Choose several: multiple choice with more than one answer
- One item covers several question numbers (e.g. "Questions 14–15: Choose TWO letters, A–E"). The navigator lists each number; both open the same item.
- **Phone and keyboard:** a list of checkbox rows. A line under the instruction shows the count ("2 of 2 chosen"). When the maximum is reached, the other options are disabled until one is unchecked, so the user cannot exceed the instruction by accident.
- **Answered state:** with one letter chosen, the first number counts as answered; with two, both.
- Order never matters.

#### Choose from a list: matching types and summary from a word box
- **The shared list** (headings i–x, paragraph letters A–G, features A–E, sentence endings A–G, words A–J) is shown once per group, as English test content.
- **Phone:** each question shows its prompt (e.g. "Paragraph B", or the statement, or the sentence beginning) and a full-width answer button: "Choose an answer" when empty, otherwise the chosen option's letter and text. Tapping it expands the sheet (M4-02) to show the group's options as a list of option rows (same look as "choose one"); choosing one fills the answer and returns to the question. Long headings wrap; nothing is truncated.
- **Options already used:** an option chosen for another question in the same group shows "Chosen for {question}" (it is the user's own answer, not a hint). It can still be chosen: some types allow a letter more than once ("NB You may use any letter more than once" is part of the instruction), and for others the user resolves it.
- **Summary from a word box:** the summary text is shown with numbered gaps ("… was replaced by (24) ______ …"). Each gap is one question; the current gap is marked in the text, and its answer button sits under the summary.
- **Matching headings:** the passage's paragraphs carry their letters (content contract, M4-06) so "Paragraph B" can be found.
- **Keyboard and desktop:** the same list, opened by the answer button, as a native radio group. **No drag and drop** in M4 (open question 4).

#### Type words: sentence, summary and note completion, short answers
- **Phone:** the sentence, summary or notes are shown with numbered gaps; the current gap is marked, and its text field sits under the text, labeled "Answer {number}". Short-answer questions show the question and the field. The word limit from the instruction stays visible above the text.
- **The field:** one line; autocorrect, autocapitalization and spell checking are off (they would correct spelling, which the test assesses); what the user types is stored as typed.
- **Keyboard:** Tab reaches the field, typing answers; Enter does not submit or change question. The phone keyboard's behavior with the sheet is specified in M4-02.
- **Word limit:** shown as test content. No word counter in M4 (open question 5).

#### What an answer is (for the content contract and session state)
| Interaction | Stored answer per question number |
|---|---|
| Choose one | One option identifier, or none |
| Choose several | The set of chosen option identifiers of the item (at most the instruction's number), shared by its question numbers |
| Choose from a list | One option identifier from the group's list, or none |
| Type words | The text as typed (trimmed of surrounding spaces when saved), or none |

Checking these against an answer key (case, spelling variants, word limits, accepted alternatives) is domain logic with its own tests, in M4 or M5 (open question 2).

#### Open questions (M4-01)
1. **Academic only, or also General Training content in M4?** The engine and question types are the same; GT differs in its texts (shorter workplace and everyday texts in the first sections) and in its band conversion. Options: (a) Academic demo content only, with the exam type as a field in the content contract; (b) both. **Recommendation: (a)**, since PRODUCT.md still lists Academic vs GT at launch as open and band conversion is not in M4.
2. **Answer checking in M4 or M5?** The earlier draft M4 goal included answer checking and band conversion; the owner's M4 list does not. Options: (a) M5, together with results and evidence-first review, where it is first shown; (b) M4 as domain code only, with no screen showing it; (c) M4 including a Practice-only "check this answer". **Recommendation: (a).** Nothing in M4 would show a result, so (b) has no consumer, and (c) is feedback that belongs with review. Band conversion needs official sources (`.claude/rules/domain/ielts-scoring.md`) and stays with results in M5.
3. **Auto-advance after choosing?** Options: (a) no, "Next" is deliberate; (b) advance after choosing. **Recommendation: (a)**, as in computer-delivered IELTS, so a mis-tap is visible before moving on.
4. **Drag and drop for matching on desktop?** Computer-delivered IELTS uses dragging for some matching types. Options: (a) the answer button and option list everywhere in M4; (b) also drag and drop in desktop Exam Mode. **Recommendation: (a)** for M4: one accessible interaction on all devices; dragging can be added later for realism with a keyboard equivalent.
5. **Word counter for typed answers?** Options: (a) none; (b) a counter in Practice Mode only; (c) a warning in Practice Mode when an answer exceeds the limit. **Recommendation: decide with Practice help in M4-04**; none in Exam Mode in any case.
