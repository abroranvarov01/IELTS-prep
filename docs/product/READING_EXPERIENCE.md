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

**Approved** (owner, 2026-10-10, task M4-09; drafted in M4-01 to M4-04). These sections turn the approved direction above into buildable specs for the Reading engine (M4). Review, explanations and Error Intelligence are M5. Interface copy for these specs is in [USER_FLOWS.md, Interface copy (M4)](USER_FLOWS.md#interface-copy-m4). Test content (passages, questions, instructions such as "Do the following statements agree with the information given in the passage?", and answer words such as TRUE or NOT GIVEN) stays in English and is marked `lang="en"` inside a Russian or Uzbek interface.

**Owner decisions these specs implement (2026-10-10):** mobile-first; the passage is the main visual object; the current question lives in a persistent bottom sheet with collapsed / partial / expanded states if needed; a question navigator for the full Reading test; question UI adapts by IELTS question type; highlighting; Pin Evidence associates passage text with the current question; Practice Mode may provide help; Exam Mode removes learning assistance and follows realistic IELTS constraints; desktop Exam Mode may use passage and questions side by side; only small original demo content.

**Decided at the M4-09 gate (owner, 2026-10-10):**
- **Scope:** the four interaction families as specified. Table, flow-chart and diagram label completion are deferred and recorded as **required pre-beta Reading follow-ups** (TASKS.json M11-01 to M11-03).
- **Answer checking is M5, not M4.** M4 shows no score, correctness or band.
- **M4 demo content is Academic only.** The engine must not prevent General Training content later, but nothing General-specific is built now.
- **Reading is reachable only by its direct route in M4.** Home is not changed.
- No auto-advance after choosing; matching uses the answer button and list, no drag and drop; autocorrect and spell checking are off for typed answers.
- Mobile: the compact test bar, three sheet states (partial about 45%), every state reachable without dragging, keyboard-safe while typing, the passage never scrolls because the question changes, the navigator usable at 320 px, no state by color alone.
- Sentence-level highlighting and Pin Evidence; one highlight style (the yellow tint plus a subtle bottom border, DESIGN_SYSTEM.md); up to 3 evidence sentences per question, stored with the question for M5 review.
- Exam: 60 minutes, no pause, no Pin Evidence, auto-finish at 0:00. Practice: no timer, Pin Evidence, the word-limit warning. The finished page shows only completion and answered information.
- Desktop: passage and questions side by side with a bottom navigator, the same layout for both modes; mode-specific controls still differ.
- The other open questions in these sections are decided as recommended (the owner approved the sections as drafted).

### Question types (M4)

**Approved** (owner, 2026-10-10, task M4-09; drafted in M4-01).

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

### Mobile reading screen (M4)

**Approved** (owner, 2026-10-10, task M4-09; drafted in M4-02). The phone layout for both modes; mode differences are in [Practice and Exam Mode (M4)](#practice-and-exam-mode-m4) and the desktop exam layout there too. Flows with step counts: [USER_FLOWS.md, Reading flows (M4)](USER_FLOWS.md#reading-flows-m4).

**The screen at 360 px, top to bottom:**
1. **Test bar** (the screen's `header`, about 48 px, replacing the shell header on the test screen only): "Exit" on the start side, the current passage ("Passage 1 of 3") in the middle, the timer on the end side when the mode has one. Nothing else (open questions 1 and 2).
2. **The passage** (the `main` landmark): the passage title, then its paragraphs in the approved passage typography (Literata, 17 px, line height 1.6) inside the 16 px gutters. Paragraph letters (A, B, …) are shown in the margin when the content has them (matching headings and matching information need them). The passage scrolls freely; it has bottom padding equal to the sheet's current height, so its last line can always be scrolled above the sheet.
3. **The question sheet** (a `region` named "Questions", after `main` in the DOM): persistent, non-modal, floating over the bottom of the passage. The passage stays readable and scrollable behind it in every state.

**Sheet states:**

| State | Height | Shows | Used for |
|---|---|---|---|
| **Collapsed** | Its content only (about 96 px) | The handle, "Question 5 of 40", whether it is answered, the flag | Reading the passage with the most room |
| **Partial** (default) | About 45% of the visible screen height | The handle and header row, the group instruction, the prompt, the answer control, Previous / Next | Reading and answering in the same place |
| **Expanded** | Everything below the test bar | The same as partial with room for long content, or a list that opened in the sheet (a "choose from a list" option list, the navigator) | Long option lists, summaries, the navigator |

- **Moving between states without a gesture** (no gesture-only action, [ACCESSIBILITY.md](../design/ACCESSIBILITY.md)): the handle is a button ("Show question" / "Hide question") that toggles collapsed ↔ partial; opening an option list or the navigator expands the sheet, and closing it (its own "Back" button, Escape, or choosing) returns to partial.
- **Dragging:** the handle area can also be dragged; on release the sheet snaps to the nearest state. Dragging the sheet's content scrolls the content, not the sheet.
- **Content longer than the state:** the sheet's body scrolls inside the sheet; the header row and Previous / Next stay visible.
- **Phone keyboard:** when a typed-answer field gets focus, the sheet stays docked on top of the on-screen keyboard (tracking the visible viewport), showing the text with the current gap and the field; the passage area above shrinks but stays scrollable. When the keyboard closes, the sheet returns to its earlier state.
- **Rotation and resizing** keep the state; heights are recomputed.
- **Motion:** state changes animate in at most 200 ms (the approved "base" duration); with reduced motion they are instant.

**Sheet header and footer:**
- Header row: "Question 5 of 40" (or "Questions 14–15" for a "choose several" item), the flag toggle ("Mark for review", available in both modes as in computer-delivered IELTS; M4-04), and "All questions" (opens the navigator).
- Footer row: "Previous" and "Next" as quiet bordered buttons (not red). "Next" on question 40 is replaced by "Finish test", the screen's one red action. "Finish test" is also at the end of the navigator.

**Passage and current question:** changing question **does not scroll the passage** (open question 4): the reader keeps their place, and IELTS questions do not always follow the passage order. Moving to a question of another passage (e.g. from 13 to 14) shows that passage at the position where the user last left it (its top the first time), and the test bar updates ("Passage 2 of 3").

**The question navigator** (opens in the expanded sheet from "All questions"):
- Grouped by passage: a heading "Passage 1" and its question numbers, then Passage 2 and Passage 3.
- Each number is a button of at least 44 × 44 px. At 320 px, six fit per row (6 × 44 px plus five 4 px gaps = 284 px of the 288 px between the gutters), so 40 questions take about seven rows plus three headings, scrolling inside the sheet.
- **States, never by color alone (I-8):** unanswered: an outlined button; answered: a filled button with a contrasting number; current: a heavier border and an underline; marked for review: a small flag icon in the corner. Each button's accessible name says it all, e.g. "Question 5, answered, marked for review, current".
- Tapping a number shows that question in the partial sheet. "Finish test" sits after the last group.

**The timer** (modes in M4-04): remaining time as `mm:ss` in the test bar, updated once a second visually but announced to screen readers only at 10 minutes and 5 minutes left (a polite live region: "10 minutes left"), and shown bolder from 5 minutes left. Nothing blinks or moves.

**Accessibility:**
- **Order:** skip link "Skip to the question" (first focusable), test bar, passage (`main`), question sheet (region). Screen readers can read the whole passage and then the question, as on paper.
- **Changing question** moves focus to the sheet's question heading ("Question 6 of 40"), so the new question is announced. Previous / Next stay reachable by Tab.
- **Keyboard:** every control reachable by Tab; the handle, flag, navigator, Previous, Next and Finish are buttons; Escape closes an open option list or the navigator.
- **200% zoom and 320 px:** the sheet's partial state may then show only the header and prompt with the rest scrolling inside it; nothing is clipped, and the expanded state is always available.
- **Reduced motion:** no sheet animation, no timer animation.

**Empty, error and offline states:**
- **Unknown test address:** the localized not-found page.
- **Answers cannot be saved on this device** (storage blocked or full; ADR-0006): a one-line notice above the passage: "Your answers can't be saved on this device. Don't close this page." The test still works.
- **Offline after the test has loaded:** answering, navigating, highlighting and pinning keep working (they need no network). Opening a test while offline shows the M1 error state (offline scope is TBD).

**Open questions (M4-02):**
1. **Test bar instead of the shell header on the test screen?** Options: (a) a compact test bar (Exit, passage, timer); (b) the shell header plus a test bar under it. **Recommendation: (a)**: on a 360 × 640 screen every 48 px of passage matters, and the logo is not useful mid-test.
2. **Language switcher during a test?** Options: (a) not on the test screen (the language is chosen before; "Exit" leads back to it); (b) in the test bar. **Recommendation: (a).** Answers are kept on the device either way, so switching later loses nothing.
3. **How a Reading test is reached in M4:** options: (a) only by its direct link (`/{locale}/reading/{testId}`), home unchanged; (b) also a link on home. **Recommendation: (a)**: home's next action stays the level check until its design decides how Reading fits in, and direct links are an approved acquisition path.
4. **Scroll the passage when the question changes?** Options: (a) never; (b) to the paragraph a question refers to. **Recommendation: (a)** in M4: predictable, and it does not reveal where an answer is.
5. **Three sheet states or two?** The owner allowed "collapsed / partial / expanded if needed". **Recommendation: three**: collapsed for reading on small phones, expanded for option lists and the navigator.

### Highlighting and Pin Evidence (M4)

**Approved** (owner, 2026-10-10, task M4-09; drafted in M4-03). Whether each is available in Exam Mode is in [Practice and Exam Mode (M4)](#practice-and-exam-mode-m4).

**The unit is a sentence** (open question 1). The passage's sentences have stable identifiers in the content (content contract, M4-06), so highlights and pins can be stored and found again, and later compared with the real evidence in review (M5).

**Selecting a sentence:**
- **Touch:** tapping a sentence selects it: it gets a visible outline and a small action bar appears just above the sheet: "Highlight" (or "Remove highlight"), "Pin to question 5" (or "Unpin from question 5"), and "Cancel". Tapping another sentence moves the selection; tapping "Cancel", the selected sentence again, or scrolling far away clears it. Plain reading taps are not taken: a tap without a selection does nothing else, and a long press still starts the browser's own text selection for copying.
- **Mouse (desktop):** the same, with a click.
- **Keyboard:** the passage is one Tab stop ("Passage. Use the arrow keys to move between sentences, Enter for actions."). Inside it, Up and Down arrows move a visible focus from sentence to sentence (roving focus, so 40 sentences do not become 40 Tab stops), Enter opens the action bar for the focused sentence, Escape closes it, and Tab leaves the passage.
- **Screen readers:** in reading mode the passage reads as plain text; focusing it as above gives the same actions. Each action is announced politely ("Highlighted", "Pinned to question 5").

**Highlighting:**
- One highlight style: a soft background tint on the whole sentence (value in M4-05), drawn with the semantic `<mark>` element, so screen readers that support it announce "highlighted" and the text stays one continuous text.
- "Highlight" adds it, "Remove highlight" removes it. Highlights belong to the test session, not to a question, and stay when the question changes.

**Pin Evidence:**
- "Pin to question 5" attaches the selected sentence to **the current question** as the user's evidence for their answer.
- **Up to three sentences per question** (open question 3), from anywhere in that question's passage. A fourth pin is refused with a short message ("You can pin up to 3 sentences to one question."). The same sentence may be pinned to several questions.
- **In the sheet:** under the answer control, a block "Your evidence" lists the pinned sentences in passage order, each as a short quote with its paragraph ("Paragraph C"), "Show in passage" (scrolls the passage to it and selects it) and "Remove from evidence".
- **In the passage:** sentences pinned to the current question carry a small pin marker in the margin with the question number (open question 4). Pins of other questions are not marked, so the passage stays calm.
- **Changing question:** the sheet shows the new question's evidence and the passage's pin markers change with it.
- **Stored for review:** pins are kept with the session (ADR-0006) so evidence-first review (M5) can compare them with the real evidence. M4 never says whether a pin is right.

**Not by color alone (I-8):** the selection has an outline as well as any fill; highlights use `<mark>` and a tint; pin markers are an icon plus the number.

**Persistence:** highlights and pins are part of the session on this device: they survive a reload and "Exit" (ADR-0006), not a cleared browser or another device (no accounts yet).

**Open questions (M4-03):**
1. **Sentence or any text range?** Options: (a) whole sentences, chosen by tap, click or arrow keys; (b) any range, chosen with the browser's text selection plus a custom action bar (closer to computer-delivered IELTS on desktop, but on phones it competes with the system's selection menu, and ranges are hard to choose by keyboard). **Recommendation: (a)** for M4 on all devices: reliable on phones, operable by keyboard and screen reader, and pins line up exactly with the evidence sentences review will use.
2. **Pin Evidence in Exam Mode?** Decided with Practice vs Exam (M4-04): **recommendation: Practice only**, since the real test has no such aid.
3. **How many pins per question?** Options: (a) up to 3 sentences; (b) one; (c) unlimited. **Recommendation: (a)**: some answers need two sentences, and a limit keeps evidence a choice, not a copy of the passage.
4. **Which pins are marked in the passage?** Options: (a) only the current question's; (b) all, with their numbers. **Recommendation: (a).**
5. **One highlight style or several colors?** **Recommendation: one** (computer-delivered IELTS has one, and colors would need meanings).

### Practice and Exam Mode (M4)

**Approved** (owner, 2026-10-10, task M4-09; drafted in M4-04). This fills in the open cells of the [Practice Mode vs Exam Mode](#practice-mode-vs-exam-mode) table for M4. Test-format facts (3 passages, 40 questions, 60 minutes, no extra time to transfer answers in Reading) come from the IELTS partners' public test-format pages (British Council, IDP).

**Choosing a mode:** the test's start screen (its address, `/{locale}/reading/{testId}`) shows the test's title and two choices as option rows: **Practice** ("No time limit. Mark evidence for your answers.") and **Exam** ("60 minutes, like the real test. No help."), then the red "Start". A link can preselect a mode (e.g. `?mode=exam`); the user still taps "Start". Step count: 2 (choose, start), 1 with a preselected mode. A test with an unfinished session skips the start screen and resumes ([Leave and come back](USER_FLOWS.md#leave-and-come-back)).

**Per mode in M4:**

| | Practice | Exam |
|---|---|---|
| Scope | The whole test (3 passages, 40 questions), at the user's pace; leaving and resuming at any time | The whole test as one sitting |
| Timing | No timer (open question 2) | 60:00 counting down from "Start"; no pause; keeps running while the user is away (measured from the stored start time, ADR-0006); warnings at 10 and 5 minutes |
| Time-out | n/a | At 0:00 the answers are final and the test finishes by itself, without the confirmation; the finished page says "Time is up." |
| Highlighting | Yes | Yes (computer-delivered IELTS allows it) |
| Pin Evidence | Yes | **No** (the real test has no such aid; open question 2 of M4-03) |
| Mark for review, navigator | Yes | Yes (both exist in computer-delivered IELTS) |
| Help in M4 | Pin Evidence; a word-limit warning under a typed answer that has more words than the instruction allows ("This answer has more than 2 words.") | None |
| Explanations, hints, checking answers | Not in M4 (M5) | Not in M4; after the test only (M5) |
| "Exit" | Back to home; everything is kept | Asks first: "Leave the test? The time keeps running while you are away." ("Leave" / "Stay") |
| After finishing | The finished page (below) | The finished page |

**The finished page in M4** (both modes): the heading "Test finished" (or "Time is up." above it after a time-out), "You answered 37 of 40 questions.", and one honest line: "Checking answers and explanations will come in a later version." Then the red "Go to home page" and a quiet "Start again" (a new session; the finished one stays stored for M5 review, ADR-0006). No score, no estimate: nothing in M4 computes one (honest feedback, [PRODUCT.md](PRODUCT.md#honest-feedback-non-negotiable)). Opening a finished test's link again shows this page.

**Desktop layout (from the approved desktop breakpoint, 1024 px):**
- **Test bar** across the top (Exit, "Passage 1 of 3", timer).
- **Two columns**, each scrolling independently: the passage on the start side (about 55% of the width, its text at a comfortable reading measure) and the questions on the end side (about 45%). The question column shows **all questions of the current passage** in order, as computer-delivered IELTS does, each with its answer control in place; the current question is marked and kept in view. A thin divider separates the columns. No bottom sheet.
- **Navigator** as a bar along the bottom: the current passage's numbers as buttons, the other passages as one button each with their progress ("Passage 2: 3 of 14 answered"); choosing another passage switches both columns. Previous / Next and "Finish test" sit at the bar's end.
- **Keyboard:** Tab moves test bar → passage (one stop, arrow keys inside, M4-03) → question column → navigator bar. Option lists open in place in the question column.
- **Same layout in both modes** on desktop (open question 5): Practice adds Pin Evidence and its "Your evidence" blocks in the question column.
- **Tablet (600–1023 px):** the phone layout with the bottom sheet, the passage centered at a comfortable measure and the sheet as wide as the passage column.

**Open questions (M4-04):**
1. **Mode choice:** options: (a) a start screen with both modes and "Start"; (b) the mode only from the link. **Recommendation: (a)**, with optional preselection by link.
2. **A timer in Practice?** Options: (a) none; (b) elapsed time shown quietly; (c) an optional countdown. **Recommendation: (a)** in M4: Practice is for comfortable learning, and ACCESSIBILITY.md requires practice timers to be optional anyway.
3. **Word-limit warning in Practice?** (M4-01 open question 5.) **Recommendation: yes, in Practice only**, as the one piece of Practice help that is not an explanation.
4. **What the user sees after finishing in M4:** options: (a) the honest finished page with the answered count; (b) go straight home. **Recommendation: (a).**
5. **Desktop Practice layout:** options: (a) the same side-by-side layout as Exam; (b) the phone layout widened. **Recommendation: (a)**: side by side is simply better for reading on a wide screen.
6. **Exam time while away:** options: (a) keeps running, as in a real sitting; (b) pauses. **Recommendation: (a)**, stated on the start screen and in the "Exit" confirmation.
7. **Notes:** computer-delivered IELTS also lets candidates attach notes to text. **Recommendation: not in M4**; highlighting covers the main need.
