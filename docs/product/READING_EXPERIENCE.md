# Reading Experience

Canonical owner of the **Reading interaction model**, the product's signature experience.

> **STATUS: APPROVED PRODUCT/UX DIRECTION.** The interaction model below is decided. The [M4 specifications](#m4-specifications-drafts) are **implemented** (M4 Reading engine, 2026-10-11): the phone and desktop layouts, the question types of the M4 scope, highlighting, Pin Evidence, and Practice and Exam Mode. The [M5 specifications](#m5-specifications-drafts), approved with amendments (owner, 2026-10-11, M5-01), are **implemented** (M5 Reading review + Error Intelligence, 2026-10-17): answer checking and the practice score, the attempt history on the device, results, the evidence-first review on phones, tablets and desktop, retries and repeated mistakes. The explanations and the key stay `aiDraft` until the human reviews before beta (M15-08 to M15-11 and M15-16).

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
- **Scope:** the four interaction families as specified. Table, flow-chart and diagram label completion are deferred and recorded as **required pre-beta Reading follow-ups** (TASKS.json M8-17 to M8-19, moved into the Listening engine milestone on 2026-10-17 because they share its layouts).
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
| **Type words, special layout** | Table completion; flow-chart completion | **Deferred**; added on the shared layouts: table completion in M8-17 (`tableCompletion`), flow-chart completion in M8-18 (`flowChartCompletion`) |
| **Type words, on an image** | Diagram label completion | **Deferred**; added in M8-19 on the shared labelling picture (`diagramLabelCompletion`), used by Demo Reading Test 2 |

**Why the deferrals:** table and flow-chart completion need a two-dimensional layout that does not fit 320 px without its own design pass, and diagram labelling needs images with text alternatives and an image pipeline the content contract does not have yet. None of them adds a new way to answer: each is "type words" in another layout, so the engine (data contract, session, navigator) covers them, and they can be added with their first content set without engine changes. Proposed: when real content needs them, each with one design pass (now planned in M8, with Listening).

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

**The word-limit warning is advisory** (owner, 2026-10-11): it counts conservatively (a word is a space-separated part with a letter in it; numbers never count), so it never warns about an answer that fits the limit. The official IELTS counting and checking rules belong to answer checking in M5.

**The finished page in M4** (both modes): the heading "Test finished" (or "Time is up." above it after a time-out), "You answered 37 of 40 questions.", and one honest line: "Checking answers and explanations will come in a later version." Then the red "Go to home page" and a quiet "Start again" (a new session; the finished one stays stored for M5 review, ADR-0006). "Start again" returns to the start screen, where the mode is chosen again (owner, 2026-10-11). No score, no estimate: nothing in M4 computes one (honest feedback, [PRODUCT.md](PRODUCT.md#honest-feedback-non-negotiable)). Opening a finished test's link again shows this page.

**Desktop layout (from the approved desktop breakpoint, 1024 px):**
- **Test bar** across the top (Exit, "Passage 1 of 3", timer).
- **Two columns**, each scrolling independently: the passage on the start side (about 55% of the width, its text at a comfortable reading measure) and the questions on the end side (about 45%). The question column shows **all questions of the current passage** in order, as computer-delivered IELTS does, each with its answer control in place; the current question is marked and kept in view. A thin divider separates the columns. No bottom sheet.
- **Navigator** as a bar along the bottom: the current passage's numbers as buttons, the other passages as one button each with their progress ("Passage 2: 3 of 14 answered"); choosing another passage switches both columns. Previous / Next and "Finish test" sit at the bar's end.
- **Keyboard:** Tab moves test bar → passage (one stop, arrow keys inside, M4-03) → question column → navigator bar. Option lists open in place in the question column.
- **Same layout in both modes** on desktop (open question 5): Practice adds Pin Evidence and its "Your evidence" blocks in the question column.
- **Tablet (600–1023 px):** the phone layout with the bottom sheet, the passage centered at a comfortable measure and the sheet as wide as the passage column.

**Decided for the desktop layout (owner, 2026-10-11, at M4-21):**
- **Completion groups** (sentence, summary and note completion; summary from a word box): the group's text is shown once in the question column with its gaps numbered, followed by one clearly labeled control per question ("Answer 24": the typed field, or the answer button for a word box). No fields inside the gaps in M4; fields in the text, as computer-delivered IELTS has them, are a possible later improvement for realism.
- **"Mark for review":** one toggle for the current question, in the navigator bar.
- **"Finish test"** asks in a confirmation dialog, like "Exit" in Exam Mode, with the same content as the phone's confirmation.
- **The sentence action bar** floats inside the passage column, above the navigator bar.
- **The navigator bar shows the passage on screen first**, so its question numbers get the first row; the other passages follow in order (owner, 2026-10-11). Strict passage order is not used where it would make the bar taller.
- **The current question** is the one whose controls the user is focused on or working with, or the one chosen in the navigator bar or with Previous / Next. It is what Previous / Next, "Mark for review", pins and the navigator bar's state refer to.

**Open questions (M4-04):**
1. **Mode choice:** options: (a) a start screen with both modes and "Start"; (b) the mode only from the link. **Recommendation: (a)**, with optional preselection by link.
2. **A timer in Practice?** Options: (a) none; (b) elapsed time shown quietly; (c) an optional countdown. **Recommendation: (a)** in M4: Practice is for comfortable learning, and ACCESSIBILITY.md requires practice timers to be optional anyway.
3. **Word-limit warning in Practice?** (M4-01 open question 5.) **Recommendation: yes, in Practice only**, as the one piece of Practice help that is not an explanation.
4. **What the user sees after finishing in M4:** options: (a) the honest finished page with the answered count; (b) go straight home. **Recommendation: (a).**
5. **Desktop Practice layout:** options: (a) the same side-by-side layout as Exam; (b) the phone layout widened. **Recommendation: (a)**: side by side is simply better for reading on a wide screen.
6. **Exam time while away:** options: (a) keeps running, as in a real sitting; (b) pauses. **Recommendation: (a)**, stated on the start screen and in the "Exit" confirmation.
7. **Notes:** computer-delivered IELTS also lets candidates attach notes to text. **Recommendation: not in M4**; highlighting covers the main need.

## M5 specifications (drafts)

**Approved with amendments** (owner, 2026-10-11, task M5-01; drafted during M5 planning and revised after the owner's first review). The owner approved the recommendations of D1 and D3 to D25, amended D2, and added the amendments in [Decided at the M5-01 gate](#decided-at-the-m5-01-gate), which are applied below. Flows and step counts: [USER_FLOWS.md, Reading results and review flows (M5)](USER_FLOWS.md#reading-results-and-review-flows-m5); copy: [Interface copy (M5)](USER_FLOWS.md#interface-copy-m5); visual values: [DESIGN_SYSTEM.md, M5 components](../design/DESIGN_SYSTEM.md#m5-components-reading-results-and-review); data: [ADR-0008](../architecture/decisions/0008-reading-answer-checking-and-explanations.md) and [ADR-0009](../architecture/decisions/0009-reading-attempts-on-the-device.md). A review snapshot is [docs/execution/M5-01-review-packet.md](../execution/M5-01-review-packet.md); these sections stay the canonical text.

**Kept from M4, not reopened:** the desktop navigator bar's content-driven height (two rows at 1280 px and up to three at 1024 px are acceptable); Previous, Next and "Mark for review" keep their text labels; the passage on screen comes first in the bar; the refused-pin message is contextual feedback above the action bar's two rows. M5 screens reuse these.

**What M4 actually does today** (inspected 2026-10-11): the answer key (`content/reading/<testId>.key.json`) has `accept` and `evidence` per question number and is validated but never loaded by the app; "choose two" items repeat the same `accept` set under both numbers (22 and 23: A, C); the NOT GIVEN entries (3, 30) point at the sentence where the passage discusses the topic, because the key validator requires at least one evidence sentence; the demo's typed answers have one accepted form each. A session always carries `highlights` (possibly empty). Finishing stores the session under `reading:<testId>:finished`, and a later finish **replaces** it. Typed answers are stored as typed and trimmed when the field loses focus. The demo test, its key and its passages were drafted by Claude (AI) in M4 and have not been reviewed by a person.

**Words used here:**
- *Pre-written* means written into the content files ahead of time (in M5 drafted by Claude and marked `aiDraft` until people review them; ADR-0008 §6), as opposed to generated when a learner asks.
- *Scoring position* is one question number, worth one mark. *Answer unit* is what the learner answers as one thing: a single question, or a "choose several" item such as 22–23 (two positions, one unit). Marks and the score count positions; review cards, retries and repeated-mistake counts use units.
- *First try* is defined in [Error Intelligence (M5)](#error-intelligence-m5).

### Decided at the M5-01 gate

Owner decision, 2026-10-11, on the review packet at commit 069877e: the recommendations of D1 and D3 to D25 are approved; D2 is approved with one change; the amendments below supersede earlier draft text and are applied throughout these sections, the copy, the design notes, ADR-0008 and ADR-0009.
- **D2:** the mechanical normalization as proposed, but only **one trailing full stop** is ignored; commas, semicolons and colons are not stripped. This is a practice-product policy, not a verified IELTS rule.
- **Highlights are kept** in the finished attempt with answers and pins, including those of imported M4 sessions; an absent field means "not recorded". Flags and view state are not kept.
- **"Choose several" items are one answer unit** in review and retries: an aggregate outcome with option-level correctness, never a positional mark presented as a particular letter; a unit is reviewed or retried whole and once; review progress counts cards; a retry's navigator stays within its subset; repeated-mistake counts use units; retry addresses are validated against the source attempt.
- **Concrete storage guarantees across tabs** (ADR-0009 §2 to §5, amended at the owner's request on 2026-10-11): committed history in IndexedDB transactions, so the first committed attempt (answers, pins, highlights, timestamps), the first-try marker and one result record per pair hold even when tabs race; a random id per session; sources removed only after their transaction has completed; recoverable M4 entries never destroyed by a failed write; tests with two tabs.
- **Coherent result records:** one record per key-revision and rules-version pair even when unchanged, all kept; a correction notice only for learner-visible changes; feedback metadata such as `fromPassage` covered by the existing version numbers; the first try refreshed before patterns are derived; patterns unavailable when the matching content is not.
- **Claims within the evidence:** "Possible spelling issue"; a neutral "not enough evidence" state; tags describe questions; pin comparisons describe agreement with the key's cited sentences; NOT GIVEN feedback separates absent information from contradiction and facts from the writer's views.
- **Copy corrections:** "Your retry"; no claim that answers were viewed or that a retry measures memory; the score may wrap; no empty evidence block for NOT GIVEN; in en, ru and uz.
- **Explanations:** English drafted first, then ru and uz from it, all `aiDraft` in M5; before beta, English review, then reconciling translations, then fluent review, then owner approval, as M15 tasks that only people can complete.

### Content versions and M4 data (M5)

**Four numbers, each guarding one thing** ([ADR-0009](../architecture/decisions/0009-reading-attempts-on-the-device.md) §1):
- the **content version** (`ReadingTest.version`) guards the whole test file: what answers and marks point at, and the word limits and passage words that checking and feedback read;
- the **storage schema** (`schema` in each stored envelope) guards the stored shape;
- the **answer-key revision** (`revision`, new in the key) guards the whole key file: accepted answers, evidence, tags and `fromPassage`, which M5 puts in the key so that feedback metadata is covered without a new number;
- the **checking-rules version** (`SCORING_RULES_VERSION`, new in the checking module) guards normalization, marks, outcomes and signals.

Fingerprint tests fail when a shipped test or key file changes without the matching increase (ADR-0008 §3). Nothing else is versioned.

**Is M5 backward-compatible with M4 data?** What an M4 session depends on, checked against the M4 code (`session.ts`, `parse-session.ts`, `units.ts`, `parse-content.ts`), and what M5 changes:

| An M4 session depends on | Changed by M5? |
|---|---|
| Test id and content version (`testId`, `testVersion`) | No |
| Question numbers 1–40 and the unit keys answers are stored under ("22" for 22–23) | No |
| Option ids of every question and list (A–D, i–viii, paragraph letters A–E, TRUE/FALSE/NOT GIVEN) | No |
| Passage ids and numbers (scroll positions, the passage on screen) | No |
| Sentence ids (highlights, pins) | No |
| The session envelope `{ "schema": 1, "session" }` | No: M5 keeps schema 1; it adds the optional `sessionId` (an M4 session without one gets a deterministic id, ADR-0009 §3), and the `retry` field only appears in the new retry entry |
| The test file | **No change at all** in M5 (`fromPassage` is in the key) |
| The key file | Adds `revision`, `review`, optional `trap` and `fromPassage`, variants; sessions never store anything from the key |

**Decision (D23): keep the demo test at `version: 1` while these conditions hold**: the test file stays byte-identical (the fingerprint test) and the session envelope stays at schema 1. If any later change touches the test file, the version increases and M4 sessions of that test read as absent (ADR-0006).

**How a completed attempt stays tied to what judged it** (ADR-0009 §2 to §7): the attempt keeps `testVersion` and its unchanged answers, pins and highlights; each result record names its key revision and rules version. The learner sees the record of the current pair.

| Event | What happens |
|---|---|
| **First view** of an attempt of the current content version | It is checked and a record is written for the current pair |
| **Key revision or rules version increased** | On the next view, the attempt is checked again from its unchanged answers and a record is written for the new pair **even if nothing changed**, so later views know the pair was checked (concurrent views in several tabs produce exactly one record, decided inside an IndexedDB transaction). If the score, an outcome or a note the learner sees changed, the page shows a correction notice ("Rechecked after a correction…"), quoting the earlier score only when the score changed. Otherwise there is no notice. Earlier records are kept (D24) |
| **Content version changed** (the attempt's content is no longer shipped) | No check is possible: the most recent stored record is shown with "This test has changed since you took it, so a detailed review is not available"; without one, "…so your answers can't be checked" |
| **Test no longer shipped** | Its records stay in storage, shown nowhere, not deleted by M5 |
| **Invalid stored data** | An invalid record is ignored and may be replaced by a valid one with the same key; a record with an unknown schema, or a database newer than the app knows, is never overwritten or removed; never a crash (ADR-0009 §9) |

**Import of a completed M4 session** (ADR-0009 §6, D25), on the first load of any Reading page of that test:
1. Read `reading:<testId>:finished`. If it does not parse with the ADR-0006 rules or its `testVersion` is not the current one, leave it untouched and stop.
2. In one IndexedDB transaction: if no attempt `m4-finished-<startedAt>` exists, add it (`kind: "test"`, `importedFromM4: true`, its mode, times, answers, pins **and highlights** exactly as stored, and no result); in any case set the test's first try to "unknown". Two tabs importing at once produce one attempt.
3. Only when that transaction has completed, remove the `:finished` entry. A failed transaction leaves it in place, and the next load tries again.
4. Nothing else is created: no score, outcome, check date or first-try claim. The attempt is checked the first time its results are shown, and its results page says "You finished this test before the app checked answers. It was checked when you first opened these results."
5. Earlier M4 finished sessions that M4 overwrote are gone; nothing pretends otherwise.

An **unfinished** M4 session is resumed unchanged (with the id `m4-current-<startedAt>`) and, when finished, committed like any M5 attempt.

**Across tabs** (ADR-0009 §2 to §5): sessions in progress stay in `localStorage` (synchronous, so nothing is lost when a tab closes); committed attempts, result records and first-try markers live in IndexedDB, and every "only if it does not exist yet" decision is made inside one IndexedDB read-write transaction, which the browser never runs at the same time as another overlapping one, in any tab. So when two tabs finish the same session, at the same moment or one after the other, the first committed attempt keeps its answers, pins, highlights and timestamps and the other tab is shown it; two tabs never both set the first try; and each attempt gets exactly one result record per key revision and rules version. A finished session stays in `localStorage` until its transaction has completed. Every session has a random id from its start, so two distinct sessions never share one; M4 sessions get deterministic ids (`m4-current-<startedAt>`, `m4-finished-<startedAt>`).

### Answer checking (M5)

**Official sources checked on 2026-10-11** (ielts.org, Cambridge University Press & Assessment, IDP; the British Council domains could not be reached and nothing below relies on them). ielts.org announced (2026-03-05) that IELTS moves to computer delivery only from mid-2026, so the rules below are read for typed answers.

| Rule | Status | Source |
|---|---|---|
| 40 questions, 60 minutes; each correct answer receives 1 mark; scores out of 40 are converted to the 9-band scale | Verified | ielts.org Academic and General Training Reading format pages; ielts.org "IELTS scoring in detail" |
| Raw-score tables are the **average** marks at each band and "will vary slightly from test version to test version"; ielts.org publishes Academic 15→5, 23→6, 30→7, 35→8 and General Training 15→4, 23→5, 30→6, 35→7 | Verified | ielts.org "IELTS scoring in detail"; "How we develop the test" (standards fixing per version) |
| Spelling mistakes lose the mark | Verified | Cambridge "IELTS FAQs" (Academic): "Copy words accurately from the text. Spelling mistakes will mean that you will lose the mark for that question." |
| British and American spellings are both accepted | Verified | ielts.org Teacher's guide; official sample keys list both (e.g. "mineralisation / mineralization") |
| Capital letters do not matter in Reading | Verified (IDP publication) | IDP "IELTS Focus: Academic Reading", p. 44: "Capitalization is not important on the Reading test." |
| An answer over the word limit is marked incorrect | Verified | Cambridge "IELTS FAQs"; ielts.org format pages: "You will lose the mark for writing more than the word limit." |
| Hyphenated words count as one word | Verified | ielts.org format pages: "Hyphenated words such as 'check-in' count as single words." |
| Numbers may be written in figures or words | Verified (Academic page) | ielts.org Academic Reading format page; computer-delivered sample key "two/2" |
| Contracted words are not tested | Verified | ielts.org format pages |
| Answers use words taken from the text; completion answers must be grammatically correct | Verified | ielts.org Academic format page; Cambridge FAQs |
| "Choose TWO" letters: each letter has its own question number and the key says "IN EITHER ORDER" | Verified | official sample and computer-delivered answer keys |
| TRUE / FALSE / NOT GIVEN and YES / NO / NOT GIVEN definitions ("contradicts", "no information on this", "impossible to say what the writer thinks") | Verified | official sample tasks; ielts.org format pages |
| Writing more than one answer where one is required gets no mark | Verified | Cambridge FAQs |
| **Whether articles ("a", "the") count toward the word limit** | **Not found** (D4: counted) | Official keys mark them optional with brackets, e.g. "(the) Retailing Manager", which says nothing about counting |
| **Date formats** | **Not found** for Reading (D22: listed variants only); IDP articles about Listening only | n/a |
| **Surrounding punctuation** (a trailing full stop) | **Not found** (D2: one trailing full stop ignored, as product policy) | n/a |
| Changed word forms (plural, tense) are wrong | Not a blanket rule: official keys accept both forms for some items, e.g. "robot(s)" | official sample keys |
| No negative marking | Not stated on ielts.org; follows from "each correct answer receives 1 mark"; IDP: "a blank answer will get no marks" | n/a |

**Per type** (every M4 type; each question number is one scoring position worth one mark; outcome per position: `correct`, `incorrect` or `unanswered`):

| Interaction | M4 types | Correct when | Unanswered when |
|---|---|---|---|
| Choose one | TRUE/FALSE/NOT GIVEN, YES/NO/NOT GIVEN, multiple choice (one answer) | The chosen option equals the key's accepted option | Nothing chosen |
| Choose several | Multiple choice with more than one answer | See the worked example below | See below |
| Choose from a list | Matching headings, information, features, sentence endings; summary from a word box | The chosen option is one of the key's accepted options (one, unless the key accepts more) | Nothing chosen |
| Type words | Sentence, summary and note completion; short answers | The normalized answer equals one normalized accepted variant | Empty or only spaces |

**"Choose TWO", worked on the M4 data model.** Demo questions 22–23 (group `p2-g3`, `multipleChoiceMulti`, "Choose TWO letters, A–E", options A–E). In M4, `questionUnits` makes it one unit with key `"22"`, numbers `[22, 23]` and `choose` 2 (the number of its numbers; the content has no separate `choose` field). The session stores one answer under `answers["22"]`: a list of at most 2 distinct option ids; nothing is ever stored under `"23"` (the M4 session parser rejects it). The key has `"22": { "accept": ["A", "C"], … }` and the same set under `"23"`.

Marks (D5): **marks** = the number of distinct chosen options that are in the accepted set, at most `choose`. For the score and the counts, the item's positions take the marks in order: position *i* (counting from 0) is `correct` if *i* < marks, otherwise `incorrect` if *i* < the number of chosen options, otherwise `unanswered`. These positional outcomes exist **only for counting**; the learner never sees "22 correct, 23 not correct" as if it described a particular letter. What the learner sees is the **unit's outcome** and **each option's** correctness:

| Case | `answers["22"]` | Marks | Positions counted | Unit outcome shown | Options shown |
|---|---|---|---|---|---|
| Both correct | `["A", "C"]` | 2 | 2 correct | Correct | A and C: "Your answer, correct" |
| Reversed order | `["C", "A"]` | 2 | 2 correct | Correct | the same |
| One correct, one wrong | `["A", "B"]` or `["B", "A"]` | 1 | 1 correct, 1 not correct | 1 of 2 correct | A: "Your answer, correct"; B: "Your answer, not correct"; C: "Correct answer" |
| No correct | `["B", "D"]` | 0 | 2 not correct | Not correct | B, D: "Your answer, not correct"; A, C: "Correct answer" |
| Partial: one chosen, correct | `["C"]` | 1 | 1 correct, 1 no answer | 1 of 2 correct | C: "Your answer, correct"; A: "Correct answer" |
| Partial: one chosen, wrong | `["E"]` | 0 | 1 not correct, 1 no answer | Not correct | E: "Your answer, not correct"; A, C: "Correct answer" |
| Nothing chosen | absent | 0 | 2 no answer | No answer | A, C: "Correct answer" |
| Duplicate `["A", "A"]`, an unknown id `["A", "Z"]`, or three ids | Never stored: M4's `apply` refuses them (`isValidAnswer`), the M4 session parser reads a stored session containing them as no session, and the attempt parser (M5-04) rejects such an attempt | – | – | – | – |

The unit outcome is: **Correct** when marks = `choose`; **No answer** when nothing was chosen; **Not correct** when marks = 0 and something was chosen; otherwise **"{marks} of {choose} correct"** (partly correct). Checking is also defensive: it counts each accepted option once and never gives an item more than `choose` marks, whatever it receives.

**40 positions, at most 40 marks, nothing counted twice.** The M4 validator already requires question numbers 1–40, each exactly once, in order. The demo test has 39 answer units: 38 with one number and the 22–23 item with two, so 40 scoring positions; the maximum is 38 × 1 + 1 × 2 = 40 marks (checked against the demo files on 2026-10-11). Checking walks units, not key entries, and reads an item's accepted set once, so the duplicated key entry for 23 cannot add a mark. A unit test in M5-03 asserts 40 positions and a maximum of 40 for every shipped test.

**Contract changes this needs:** one new validator rule (ADR-0008 §3): every number of a "choose several" item has the same `accept` set, with exactly `choose` distinct options (and the same `trap` tag or none). The content, the key format and the stored answer shape stay as in M4.

**Normalization of typed answers** (D2, as decided; mechanical only, everything else is decided by the accepted variants):
1. Unicode NFC.
2. Letter case is ignored (IDP, above).
3. Leading and trailing spaces removed; runs of spaces become one.
4. Typographic apostrophes and quotes (’ ‘ ʼ) become `'`; the Unicode hyphens U+2010 and U+2011 become `-` (phones insert them).
5. **One trailing full stop** (`.`) is ignored: product policy, because phone keyboards add a full stop after a double space; not a verified IELTS rule. Commas, semicolons, colons and any other punctuation are kept.
6. **Never** ignored or corrected: spelling (no fuzzy matching: a misspelt answer is incorrect, as in IELTS), word form, word order, missing or extra words, articles.

**Accepted variants are pre-written, in full** (D3; ADR-0008 §3). The key's `accept` list holds every accepted answer as a complete string. Where the passage allows them, the key lists: both British and American spellings; a number in figures and in words; optional words as separate full variants ("winter weather", "the winter weather") when both are right; singular and plural only when both answer the question. **Dates** (D22, no official Reading source): no date parsing; each accepted form ("24 April", "April 24", "24th April") is its own variant; the demo test has no date answers. Nothing is generated when checking. The validator rejects a variant that is empty, a duplicate after normalization, or over the word limit. Variants are reviewed with the key before beta (D20).

**Word limits.** An answer is correct only when it matches a variant, and every variant fits the limit, so an over-limit answer is never correct (as in IELTS). The validator counts words as: every space-separated part is a word, a hyphenated part is one word (verified), and where the instruction allows "AND/OR A NUMBER", one part made of digits is the number. **Articles are counted as words** (D4, no official source): a variant with an article must still fit the limit. The Practice warning keeps its separate, more lenient count (M4).

**Unanswered questions.** "No answer" is a display status of its own, never shown as "Not correct"; it earns **0 marks** and **stays in the denominator**. Unanswered questions are part of the learning flow: they are in the results breakdown, in the review sequence started from the results ([Evidence-first review](#evidence-first-review-m5)), and in "Try again" ([Targeted practice](#targeted-practice-m5)), and every one of those names them. After an Exam time-out each of them carries the note "This question had no answer when the time ran out." Only repeated-mistake detection leaves them out, because a blank says nothing about how an answer was formed.

**Score and denominators.**
- A test attempt: the raw score is the number of marks **out of 40** (scoring positions), whatever was answered: "27 of 40 correct", with "Not correct: 9 · No answer: 4" next to it (also counted in positions, so the three numbers add up to 40). No percentage.
- A retry: "9 of 13 now correct", out of the retried positions (whole units, not-correct and unanswered ones alike; 22–23 counts 2); never shown out of 40 and never combined with the original score.
- Both are counts of correct answers on our own content, labeled as a practice score.

**Raw score is not a band** (D1). ielts.org publishes the average marks per band for official test versions and says they vary between versions; standards are fixed per version. Our demo test is original and has never been calibrated, so a band read from those averages would claim a precision we do not have. **Decided: no band and no "Estimated band" in M5**, for Academic or General Training; the results page says "A practice score on our own practice test. It is not an IELTS band score." Band conversion returns only with calibrated content (content system, M13, or later) and the Academic / General Training decision ([PRODUCT.md](PRODUCT.md#open-questions)). INVARIANTS I-2 stays without an implementation until then.

### When results are available (M5)

| Situation | Behavior |
|---|---|
| Practice, "Finish test" → "Finish" | The attempt is recorded (ADR-0009) and the results page opens at once |
| Exam, "Finish test" → "Finish" | The same. "Feedback after the test only" holds: nothing is checked before finishing |
| Exam, time-out with the screen open | Finishes by itself (M4) and opens the results page with "Time is up." |
| Exam, time-out while away | On the next visit the session is found finished (ADR-0006); the attempt is recorded once and the results page opens with "Time is up." |
| Reload of results or review | The same attempt and the same record (ADR-0009 §7) |
| The key or the checking rules changed since the last record | Checked again and a record written for the new pair; the correction notice only when something the learner sees changed (D24) |
| An M4 finished session on the device | Imported without a result, checked when its results are first shown, with the note that it was checked later (D25) |
| Opening the test link after finishing | The start screen, with a quiet "See your last results" (D6). M4 showed the finished page there |
| Storage blocked or full | Results are computed and shown, kept in memory for the tab, with the notice; recoverable sources stay in storage |
| During a test, either mode | No checking and no explanations (D17) |

Completed attempts never change: "Start again" and retries create new attempts, and a recheck adds a record instead of replacing one (ADR-0009 §7). Results are traceable to their key and rules, and never silently overwritten.

### Results page (M5)
- Address: `/{locale}/reading/{testId}/results` (the latest test attempt) or `?attempt={id}` (a specific one); inside the shell, so the header's language switcher is there.
- At 360 px, top to bottom: "Time is up." when the Exam timed out; the H1 "Your results"; the test title (English) and the mode in meta text; "27 of 40 correct" large (it wraps at narrow widths and at 200% zoom; it is not forced onto one line); the honest line; "Not correct: 9 · No answer: 4"; when applicable, the correction, "checked later" or storage note; the red review button; "Mistakes that repeated" ([Error Intelligence](#error-intelligence-m5)); the quiet "Try again" link (when any unit was not fully correct or unanswered) and "Start again".
- **The red button names what it opens** (D8): "Review mistakes and unanswered questions" (both exist), "Review mistakes" (no unanswered), "Review unanswered questions" (no mistakes), "Review answers" (everything correct). A partly correct "choose several" item counts as a mistake here.
- One primary action. No band, no gauge, no chart, no celebration (honest feedback; UI_ANTI_PATTERNS.md).
- Focus moves to the H1 when the page replaces the test screen, so finishing is announced (as on the M4 finished page).

### Evidence-first review (M5)

**Purpose:** for each answer unit, what you answered, what was accepted, where the passage says it, and why. It covers correct answers and unanswered questions as well as mistakes.

**Phone** (`/{locale}/reading/{testId}/review`, the test-screen layout with the test bar instead of the shell header):
- **Test bar:** "Results" on the start side (back to this attempt's results), "Passage 2 of 3", no timer.
- **Passage** (`main`): read-only. The current unit's evidence sentences carry an evidence chip and a dotted underline; for NOT GIVEN, "related" sentences a different chip and a dashed underline. The attempt's highlights and the current unit's pins are shown as they were at the end of the attempt; if the attempt has no recorded highlights (an absent field), none are shown and nothing is said about them. Sentences are not selectable (no action bar).
- **Review sheet** (the M4 sheet: collapsed, partial, expanded, the same controls to move between them). One **card per answer unit**, in this order:
  1. "Question 5 of 40" (or "Questions 22–23") and the unit outcome as icon and word: "Correct", "Not correct", "No answer", or for an item "1 of 2 correct". In the review sequence, "To review: 3 of 12" (cards, so 22–23 counts once).
  2. The question as in the test (English). Choice and list types: the options, read-only, each with its own label: "Your answer, correct", "Your answer, not correct" or "Correct answer". Typed types: "Your answer" (as typed) and "Correct answer" (the first variant), plus "Also accepted" (the others). An unanswered question: "You did not answer this question." (and the time-out note when it applies).
  3. **Evidence:** "Evidence in the passage" with the evidence sentences as quotes ("Paragraph C", "Show in passage"). NOT GIVEN with related sentences: "Where the passage talks about this". **NOT GIVEN with no related sentences: no evidence block at all**, no empty container and no "Show in passage".
  4. **Why:** the explanation in the interface language, then "Explain simpler" (a disclosure: the simpler text follows the button).
  5. **Your evidence** (Practice attempts with pins): the pinned quotes (for an item, the pins of all its numbers) and one sentence about agreement with the key: "You pinned a sentence the answer key cites as evidence." or "None of your pinned sentences is one the answer key cites as evidence." For NOT GIVEN: "The answer is NOT GIVEN, so no sentence in the passage confirms or contradicts the statement." These describe agreement with the key's cited sentences only; they do not say another sentence could not also support the answer.
  6. **Notes:** the unit's observable signals, one sentence each ([Error Intelligence](#error-intelligence-m5)).
  7. Footer: Previous and Next (within the sequence); "All questions" in the header opens the navigator with outcome badges.
- **The passage follows the review** (D9): changing card scrolls the passage so the first evidence (or related) sentence is in view above the sheet, instantly with reduced motion; with no such sentence, the passage stays where it is. This differs on purpose from the test, where the passage never moves (M4: it would reveal where answers are).
- **Sequences** (D8): the red button on the results page opens the first card that is not fully correct **or unanswered**, and Previous / Next move through exactly those cards, in question order; "To review: 3 of 12" counts them all. Choosing any number in the navigator (including a correct one) switches to all cards in order. "Review answers" (everything correct) uses all cards. Both numbers of an item open its one card; the navigator shows the unit's outcome badge on both.

**Desktop** (from 1024 px): the test bar; the passage column (55%) with the same marks; the question column (45%) with the current card only (review cards are long, unlike the test's answer controls); the M4 navigator bar with outcome badges, Previous and Next, keeping its approved content-driven height and text labels. Tablet (600–1023 px) keeps the phone layout.

**Exam attempts** are reviewed the same way; they have no pins, so "Your evidence" is absent.

**NOT GIVEN without fabricated proof** (D10):
- The key's evidence for a NOT GIVEN answer marks where the passage deals with the statement's topic, presented as "Where the passage talks about this", never as proof. It may be empty (a contract change: M4's validator requires at least one sentence), and then no evidence block appears.
- The explanation says what the passage does say about the topic and why that is **neither agreement nor contradiction**: for TRUE/FALSE/NOT GIVEN, the passage gives no information on the point (if it said the opposite, the answer would be FALSE); for YES/NO/NOT GIVEN, it is impossible to say what the writer thinks about it (if the writer's views contradicted it, the answer would be NO). For question 3: the passage describes how people use shared bicycles but says nothing about who most of the users are, so it neither agrees nor disagrees with the statement. It never invents or paraphrases a sentence as if the passage contained it.

**Languages:** the passage, the question, the options, the answer words (TRUE, NOT GIVEN), the user's typed answer and the accepted answers are English test content with `lang="en"`. The labels, notes, tips, the explanation and its simpler version are in the interface language; English quotes inside an explanation are `lang="en"` spans (ADR-0008 §5). Answer words are never translated. The explanation follows the interface language (D13); the language is switched on the results page, which has the shell header.

**Focus and keyboard:** on opening and on every card change, focus moves to the card's heading (as in M4). "Show in passage" scrolls to the sentence and moves focus to it. "Explain simpler" keeps focus and toggles `aria-expanded`. Escape closes the navigator and returns focus to "All questions". The passage stays one Tab stop for reading.

**Empty and error states:** no attempt on this device, or an unknown attempt id → "No results on this device yet" with the red "Start the test"; an attempt from an earlier content version → its stored score, "This test has changed since you took it, so a detailed review is not available"; an unknown question number → the first card of the sequence; storage blocked → the in-memory attempt with the notice (a reload leads to the empty state); unknown test → not-found; offline after loading → works.

### Routes and navigation (M5)

Decided as drafted (D21). All pages are prerendered per test and locale; the attempt data comes from the device.

| Address | Shows | Frame |
|---|---|---|
| `/{locale}/reading/{testId}` | The start screen (with "See your last results" when an attempt exists) or the session in progress, as in M4. After finishing it **replaces** itself with the results page, so Back does not return to a finished test | Test bar |
| `/{locale}/reading/{testId}/results[?attempt={id}]` | Results of the latest test attempt, or of the given attempt (a retry, an earlier attempt) | Shell |
| `/{locale}/reading/{testId}/review?attempt={id}&q={n}&set={mistakes\|all}` | The review (`mistakes` = units not fully correct or unanswered). Moving between cards replaces the address, so Back leaves the review instead of stepping through every card | Test bar |
| `/{locale}/reading/{testId}/retry?of={id}&q={numbers}` | A retry of the given units of that test attempt (Practice), validated as in [Targeted practice](#targeted-practice-m5) | Test bar |

- Attempt ids are the session's id (`s-` and a random UUID; `m4-current-…` or `m4-finished-…` for M4 sessions; ADR-0009 §3); invalid parameters fall back as in the empty states.
- The level check and onboarding are not involved: a direct link still bypasses onboarding (USER_FLOWS.md).

### Home in M5

**Decided (D18): no change.** Reading stays reachable by its direct link (M4 decision), the level check stays the next action (rule 1), and home, rendered on the server from the goal cookie, cannot read the device's attempts (ADR-0006 §4). Next-action rules that use history belong to M11. The options considered were a cookie pointer and a quiet link on home.

### Error Intelligence (M5)

**Three layers, never mixed** (D14):

| Layer | Who decides it | May say | Example |
|---|---|---|---|
| **Observable signals** | Computed from the answer, the key, the test and the learner's own pins | What happened, as a fact about the text | "You chose NOT GIVEN. The passage contradicts this statement, so the answer is FALSE." |
| **Content tags** (`trap` in the key) | Pre-written with the key (in M5 drafted by Claude, reviewed before beta) | What the **question** tests, not a weakness of the learner | Question 4 is tagged `qualifier` ("every trip" against "a small fee") |
| **Learner-confirmed causes** | Only the learner | Why it happened, in the learner's words | Not in M5: nothing in M5 states a cause |

Nothing infers the learner's reasoning from an incorrect answer alone. Never: "You don't understand NOT GIVEN", "You read too fast", "Your vocabulary is weak", "You guessed", "You made a spelling mistake".

**Observable signals** (per answer unit; unanswered questions have none except the time-out note; no signal ever changes a mark):

| Signal | Detection rule | Example (demo test) |
|---|---|---|
| `ngInsteadOfFalse` | Statement types; key FALSE or NO; answer NOT GIVEN | Question 4 (key FALSE: the passage says later schemes "charged a small fee") answered NOT GIVEN |
| `falseInsteadOfNg` | Key NOT GIVEN; answer FALSE or NO | Question 3 ("Most people who use shared bicycles are students"; key NOT GIVEN) answered FALSE |
| `ngInsteadOfTrue` | Key TRUE or YES; answer NOT GIVEN | Question 1 (key TRUE: "children rode to school") answered NOT GIVEN |
| `trueInsteadOfNg` | Key NOT GIVEN; answer TRUE or YES | Question 30 ("Teachers should be paid extra…"; key NOT GIVEN) answered YES |
| `oneLetterAway` (shown as "Possible spelling issue") | Typed; incorrect; the normalized answer is exactly one letter added, missing or changed from a normalized accepted variant of at least 4 letters. An observed text difference, not proof of a spelling mistake ("lines" is one letter from "lanes" and may be a different word) | Question 11 "pavments" (accepted "pavements") |
| `wordLimit` | Typed; incorrect; more words than the limit by the validator's count | Question 9 "cleaner air" (ONE WORD ONLY; accepted "air") |
| `notFromPassage` | Typed, `fromPassage` in the key; incorrect; a word of the answer (letters only, case ignored) does not occur in the question's passage | Question 7 "mobile" (the passage says "phone") |
| `timeUp` | Unanswered, in an Exam attempt finished by time-out | Questions 38–40 empty when the time ran out |
| `pinnedElsewhere` | Practice; the unit not fully correct; it has pins (on any of its numbers); its key is not NOT GIVEN and cites evidence; no pin is a cited sentence | Question 5: pinned "Short car journeys are replaced…", answered A; the key cites the next sentence |

The notes for the four statement signals use the wording of the question type (USER_FLOWS.md copy): **facts** for TRUE/FALSE/NOT GIVEN ("the passage contradicts this", "the passage gives no information on this") and **the writer's views** for YES/NO/NOT GIVEN ("the writer's views contradict this", "it is impossible to say what the writer thinks about this"). A note about NOT GIVEN always states both sides: what NOT GIVEN means and why the other answer applies (absent information against contradiction).

**Repeated-mistake categories** (at most 8; all counts are answer units):

| Category | Counts | Out of ("of N") |
|---|---|---|
| NOT GIVEN mixed up with FALSE or NO | `ngInsteadOfFalse`, `falseInsteadOfNg` | Answered statement questions whose key is NOT GIVEN, FALSE or NO |
| NOT GIVEN mixed up with TRUE or YES | `ngInsteadOfTrue`, `trueInsteadOfNg` | Answered statement questions whose key is NOT GIVEN, TRUE or YES |
| Possible spelling issues | `oneLetterAway` | Answered typed questions |
| Too many words | `wordLimit` | Answered typed questions |
| Words not from the passage | `notFromPassage` | Answered typed questions with `fromPassage` |
| Pins differed from the cited evidence | `pinnedElsewhere` | Practice units with pins whose key cites evidence and is not NOT GIVEN |
| Questions that use other words (content tag) | Units tagged `paraphrase` not fully correct | Answered units tagged `paraphrase` |
| Questions that turn on a small word (content tag) | Units tagged `qualifier` not fully correct | Answered units tagged `qualifier` |

Unanswered questions belong to no category (see [Answer checking](#answer-checking-m5), Unanswered questions). A "choose several" item counts as one unit, never as two examples.

**Content tags** (optional, one per question, only where true; an item's numbers carry the same tag): `paraphrase` (the question expresses the passage's idea in different words) and `qualifier` (the answer turns on a limiting word such as all, most, only, every, never). They describe the question. The demo key gets them where they apply (M5-02); a category with fewer than 3 tagged units in a test simply cannot appear.

**The first try, precisely** (D15, ADR-0009 §5). Repeated mistakes use only the first try at a test, because later tries repeat questions the learner has already worked on. The first try is stored, never guessed:

| Situation | First try for that test |
|---|---|
| The first test attempt recorded on a device with no attempt entries for that test | That attempt |
| An unfinished M4 session finished under M5, with no M4 finished entry on the device | That attempt (no finished session ever existed there, or the data was cleared) |
| An M4 finished session imported | **Unknown** (M4 kept only the latest finished session), even if M5 had already recorded an attempt |
| "Start again", any later test attempt | Not the first try |
| A retry | Never |
| Practice or Exam | Either can be the first try |
| A reload, a second tab, a time-out noticed on load | The same attempt (one id), counted once |
| A new content version of the test | Still the same test; the first try does not change |
| Other attempt entries exist when the first try is decided, or the marker names a missing or invalid attempt | **Unknown** |
| Another browser or device, or site data cleared | Cannot be known; the copy says "on this device" |

**Repeated exposure is excluded** by construction: only the first try's record is evidence, so each unit counts at most once; later attempts, retries and rechecks are never evidence; duplicates cannot arise (one attempt per id).

**Before deriving patterns**, the first try's record is brought up to the current pair if its content version is the current one (ADR-0009 §7: a check writes a record). If the first try's content version is not the current one, **patterns are unavailable**: the page says "Repeated mistakes can't be shown because this test has changed since your first try." Old answers and signals are never combined with another version's groups or tags.

**When the first try is unknown:** no repeated-mistake detection for that test, and the results page says "We can't tell which was your first try at this test on this device, so we don't look for repeated mistakes in it." Each unit's own notes still appear in review, because they describe only that attempt.

**When a mistake counts as repeated** (D15; a **proposed product heuristic, not a validated diagnosis**): the same category on **at least 3 different answer units** from **at least 2 different question groups** of the first try (one group shares one instruction, so a single group could reflect one misread instruction). The numbers are a starting point to be checked against real use (M11); the copy never calls the result a diagnosis or a weakness.

**What the learner sees** (only on a test attempt's results, never on a retry's):
- The scope, in words the evidence supports: on the first try itself, "In this attempt at this test. One test is not enough to show a lasting weakness."; on a later attempt, "From your first attempt at this test on this device. Later attempts repeat questions you have worked on before, so they are not used. One test is not enough to show a lasting weakness."
- Up to two categories, most occurrences first (ties in table order), each with its count out of its opportunities and the question numbers ("3 of 5 questions whose answer was NOT GIVEN, FALSE or NO (questions 2, 3, 30)"), one tip, and "Practise these questions again".
- No repeated category (whether too few units or too few groups): "Not enough evidence to show a repeated pattern in this attempt." (on the first try) or "…in your first attempt at this test." (on a later attempt). Single occurrences stay as notes on their cards in review.
- With one demo test, nothing claims a pattern across tests, a lasting weakness, improvement, a level or a band. Evidence across tests and rates belong to M11.

**Feedback the content can support:** the per-unit explanation (pre-written), the observable note, and per category one fixed tip (catalog copy) that restates the test's own instruction or a verified rule: what FALSE, NO and NOT GIVEN mean (the instructions' wording), that misspelt answers and answers over the limit lose the mark (verified above), that "from the passage" means the passage's words, where the key's evidence is (review), and to compare the question's words with the evidence (paraphrase) or check limiting words (qualifier). The only action offered is to practise those same questions again, labeled as questions attempted before.

### Targeted practice (M5)

**Decided scope (D16): try again questions from an earlier attempt that were not fully correct or unanswered; no unseen practice in M5.**
- **Which questions:** every answer unit of the source test attempt that is not fully correct (incorrect or partly correct) or unanswered, or the units of a repeated-mistake card. A unit is always included **whole and once**: a retry of 22–23 has both choices empty and counts 2 positions, even if one of them earned a mark before. The link's number is computed after expanding and de-duplicating units ("Try 14 questions again: not correct or no answer" when 13 positions were lost and 22–23 was partly correct).
- **The session:** Practice with only those units; answers start empty; no timer; Pin Evidence available; the navigator ("All questions"), Previous and Next show only those units; "Finish test" and its confirmation as in M4. The header adds "3 of 13 to practise" (positions).
- **Results:** "Your retry": "9 of 14 now correct" and "These are questions you have attempted before. This practice result is not an independent measure of your level." Then the review button (named as on the results page) and "Back to your test results".
- **Validating a retry address** (`?of={id}&q={numbers}`): the source must be a stored **test** attempt of the **current content version**; its record for the current pair is used (written first if needed); the requested numbers are expanded to whole units and every unit must be one the source did not get fully correct. Otherwise a safe state, with "See your last results" and "Start the test":
  - source missing (never existed on this device, or removed by retention): "The attempt these questions came from is no longer on this device.";
  - source from an earlier content version: "This test has changed since that attempt, so its questions can't be practised again.";
  - questions not allowed for that source: "These questions can't be practised from that attempt."
- **What it is not:** independent evidence of ability (never counted in repeated mistakes, never shown out of 40, never combined with the original score, never called improvement); a new test; a content library.
- **Unseen practice** (new questions on a weak point) needs new content: only one demo test exists, and adding content sets is the content system (M13). A short original drill set would also need the content contract to allow tests shorter than 3 passages and 40 questions (ADR-0005). Not in M5.
- One retry in progress per test, kept apart from the test's session (ADR-0009 §8): the same retry link resumes it; starting a different retry replaces an unfinished one.

### Explanations and the AI decision (M5)

**Decided (D12): pre-written explanations and simpler versions in uz, ru and en, without runtime AI.**

**Who writes them, and their status** (ADR-0008 §6). In M5 the explanations, like the demo test and key from M4, are **drafted by Claude (AI)** in a worker task (M5-05): **English first, then ru and uz drafted from the English draft**. All of them stay `aiDraft` in M5 and are never described as written by a person. Each key file and each explanation file carries one review status:

| Status | Meaning | Set by |
|---|---|---|
| `aiDraft` | Drafted by Claude; no person has checked it | The worker task that drafts it |
| `reviewed` | A person has checked it as described below; the review is recorded in PROGRESS.md (reviewer's role, date, what was checked, what changed) | A worker, on the owner's instruction after the recorded review; never without one |
| `approved` | The owner approves it for release | The owner |

**Before beta** (D20; M15-08 to M15-11 and M15-16), every Reading key and explanation file must be `approved`, in this order:
1. **English accuracy review (M15-08, people):** a person with strong English and IELTS Reading knowledge, not the drafting AI, checks every accepted answer and variant against the passage, every cited evidence sentence, every NOT GIVEN judgment, every content tag and `fromPassage`, the questions and passages as far as they affect the answers, and every English explanation and simpler version (grounded only in the passage, accurate, plain, the simpler one saying the same thing more simply). Corrections increase the key revision where the key changes.
2. **Reconcile translations (M15-10, worker):** the ru and uz drafts are updated to every English correction; they stay drafts.
3. **Fluent-speaker review (M15-11, people):** fluent speakers check every ru and uz explanation and simpler version against the reviewed English: same meaning, plain language, consistent terms, English quotes untouched, Uzbek orthography (U+02BB, U+02BC) ([LOCALIZATION.md](LOCALIZATION.md), rule 7). Not raw machine translation.
4. **Owner release approval (M15-16):** the owner sets the files to `approved`.

M5 finishes with `aiDraft` files and does not wait for any of these: nothing is released to real users before beta. The status is not shown in the interface in M5.

**Authoring rules** (for the drafts and for any later author):
- One explanation and one simpler version per answer unit (a "choose several" item once), in each of en, ru and uz, in the per-locale content files (ADR-0008 §5).
- **Grounded only in the passage, the question and the key:** name the words of the cited evidence and the question words they match (the paraphrase); for choice and list types, say briefly why a tempting wrong option does not fit when that helps. No facts from outside the passage.
- **NOT GIVEN:** what the passage says about the topic, and why that is neither agreement nor contradiction, in the terms of the question type (information for TRUE/FALSE/NOT GIVEN, the writer's views for YES/NO/NOT GIVEN). Never an invented sentence.
- **Simpler:** the same reasoning in at most two short sentences, everyday words, no grammar terms. Limits enforced by the validator: explanation at most 450 characters, simpler at most 250 characters and shorter than the explanation, per locale.
- English quotes at most 8 words, as `en` segments.

**Limitations of the decision:** fixed texts that cannot answer follow-up questions; not tailored to an arbitrary typed answer (the observable notes cover the common cases); one "simpler" level; about six texts per answer unit (234 for the demo test's 39 units) to draft and review, growing with every new test; quality depends on the reviewers.

**The AI alternative (not chosen):** generating the simpler or a tailored explanation at runtime would need an **AI provider ADR first** (ARCHITECTURE.md lists "AI provider and evaluation pipeline" as TBD), deciding at least:
- **Provider and model**, and where calls run (the API, never the browser; keys as secrets, AUTONOMOUS_WORKFLOW hard limits).
- **Grounding:** inputs limited to the question, the key, the evidence sentences and the reviewed explanation; the output may quote only passage text that exists, checked after generation; nothing outside the passage.
- **Privacy:** what is sent (the typed answer at most, no identifiers), data residency for Uzbekistan, minors, retention at the provider.
- **Failure behavior:** fall back to the pre-written text; a timeout budget; no blank card.
- **Latency** on weak mobile connections, and **cost** per call; since explanations are per question, not per learner, generating them once per question and locale and caching them (or at authoring time) gives most of the value.
- **Quality** of Uzbek and Russian output, an evaluation set, and the honest label of AI-written text.

### Decisions for M5-01

Owner decision, 2026-10-11: **approved as recommended for D1 and D3 to D25; D2 approved with an amendment**; the amendments in [Decided at the M5-01 gate](#decided-at-the-m5-01-gate) apply throughout.

| # | Decision | Decided behavior | Trade-off | Notes |
|---|---|---|---|---|
| D1 | Band for the uncalibrated demo test | "27 of 40 correct" and the honest line; no band and no "Estimated band", Academic or General Training. Rejected: an "Estimated band" from ielts.org's average marks; those averages as background | Learners do not get the band they may want; any band from an uncalibrated test would be false precision | Sourced: tables are averages that vary by test version |
| D2 | Typed-answer normalization | NFC; case ignored; spaces trimmed and collapsed; ’ ‘ ʼ → '; U+2010/U+2011 → -; **one trailing full stop ignored**; commas, semicolons, colons and all other punctuation kept | A trailing full stop IELTS might reject is accepted; other punctuation stays strict | **Amended by the owner.** Product policy, not a verified IELTS rule |
| D3 | Accepted variants | Every accepted answer written in full in the key and reviewed (UK/US spellings, figures and words, optional words); no fuzzy matching, nothing generated when checking. Rejected: parsing official-style brackets and slashes; fuzzy matching | Longer keys; a valid variant nobody listed is marked wrong until a key revision | Case, spelling, UK/US, figures: sourced |
| D4 | Articles and the word limit | The validator counts "a" and "the" as words, so a variant with an article must fit the limit | May reject a variant IELTS would accept | **No official source** |
| D5 | "Choose TWO" marks | 1 mark per distinct correct letter, any order, at most 2; positions take the marks in order for counting only; the learner sees the unit outcome and option-level correctness | Positional outcomes exist only inside the score and counts | Official keys: "IN EITHER ORDER", one number per letter |
| D6 | Results timing; the test link after finishing | Results at once after finishing or time-out in both modes; the test link then shows the start screen with "See your last results" | Changes M4's "test link shows the finished page"; one more tap to old results | |
| D7 | Where checking runs | In the browser on the results and review pages; the key is never on the test screen | A determined user can read the key from those pages | No real secrecy is possible without accounts |
| D8 | Review entry and sequence | The red button names what it opens and walks every card not fully correct **or unanswered**; progress counts cards; the navigator reaches all | Two sequences to understand ("To review: 3 of 12" shows which) | |
| D9 | The passage in review | Scrolls to the evidence on card change, instantly with reduced motion | Differs from the test screen, where moving would reveal answers | |
| D10 | NOT GIVEN evidence | "Where the passage talks about this", may be empty (then no evidence block), never proof; the explanation separates absent information from contradiction | A related sentence can still be misread as proof; the label and explanation address it | **Contract change:** M4 requires at least one evidence sentence |
| D11 | Status colors | Correct: green `status.correct` `#157A3C` with a check and the word; not correct: `ink` cross and the word; no answer: dash and the word; partly correct: half-filled circle and the words | No red "wrong" that some users expect | Red stays the action color (DESIGN_SYSTEM.md) |
| D12 | Explanations and "Explain simpler" | Pre-written explanation and simpler version per unit in en, ru, uz; AI-drafted (English first), reviewed by people before beta; no runtime AI | Fixed texts, not tailored; 234 texts to review for one test | The AI option's open decisions are listed above |
| D13 | Explanation language | Follows the interface language; switched on the results page | Seeing two languages side by side needs a switch | |
| D14 | Error Intelligence layers | Observable signals and content tags only; no learner-confirmed causes in M5; never infer reasoning | No "why" from the learner in M5 | |
| D15 | First try and repeated mistakes | First try stored per test; unknown after an M4 import or when other entries exist; a category repeats at ≥ 3 units in ≥ 2 groups of the first try; at most two shown; scoped to "this test on this device" | The threshold is arbitrary and one test is little evidence; devices with M4 data get none for the demo test | **Proposed heuristic, not a validated diagnosis** |
| D16 | Targeted practice | Try again every unit not fully correct or unanswered (or a card's units), whole and once, Practice only, labeled as attempted before; validated against the source; no unseen practice | Repeated questions are not an independent measure | |
| D17 | Checking during a test | None in either mode | No instant feedback while practising | |
| D18 | Home | Unchanged | Results are reached only through the test link | |
| D19 | Attempt storage | ADR-0009 (amended 2026-10-11): sessions in `localStorage`; committed attempts, result records and first-try markers in IndexedDB transactions that keep the first committed attempt across tabs; a random id per session; sources removed only after their transaction has completed; result records per key revision and rules version, all kept; 20 attempts kept; no reset control; unknown schemas never overwritten | Up to about 100 KB per test; clearing site data is the only reset | |
| D20 | Review status and pre-beta review | `aiDraft` / `reviewed` / `approved`; M5 finishes with `aiDraft`; before beta: English review, reconciling ru and uz, fluent review, owner approval (M11-04 to M11-07; since the 2026-10-17 replanning M15-08 to M15-11 and M15-16) | AI drafts are visible in development builds until reviewed (no interface label) | Only people complete the reviews |
| D21 | Routes and navigation | `/results`, `/review`, `/retry` under the test; finishing and card changes replace the address; review and retry in the test-bar layout, results in the shell | Four addresses per test | |
| D22 | Date formats | No date parsing; each accepted date form is its own pre-written variant; the demo test has no date answers | Every accepted form must be listed; a missing one is marked wrong until a key revision | **No official source** for Reading |
| D23 | The demo test's content version | Keep `version: 1` while the test file stays byte-identical and the session envelope stays at schema 1 | Relies on the fingerprint test | See Content versions and M4 data |
| D24 | Key corrections and rule changes | One record per key revision and rules version, written even when unchanged, all kept; the correction notice only for learner-visible changes | Two version numbers to maintain | |
| D25 | M4 finished sessions | Imported once with answers, pins and highlights, without a result, checked at first view with a note; the test's first try becomes unknown; the source is removed only after a successful write | Devices with M4 data get no repeated-mistake detection for the demo test | Importing as a first try would invent provenance |
