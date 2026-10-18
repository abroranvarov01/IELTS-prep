# Listening Experience

Canonical owner of the **Listening interaction model**: the question types the Listening engine renders and how each is answered, the player, modes, sections and layouts.

> **STATUS: DRAFT.** Every section below is a draft for the owner's gate (TASKS.json M8-06). Nothing here is decided until then. The surface direction it follows is approved: "Listening is audio-first" ([DESIGN_CONSTITUTION.md, Surface direction](../design/DESIGN_CONSTITUTION.md#surface-direction)).

General UX rules apply ([UX_PRINCIPLES.md](UX_PRINCIPLES.md)), as do accessibility requirements ([ACCESSIBILITY.md](../design/ACCESSIBILITY.md)) and the visual system ([DESIGN_SYSTEM.md](../design/DESIGN_SYSTEM.md)). The Reading engine this builds on is owned by [READING_EXPERIENCE.md](READING_EXPERIENCE.md); where a Listening type behaves exactly like a Reading type, this file links to it instead of restating it.

**Not in this file yet:** the player, Practice and Exam Mode, section progression, resume, weak connections and the screen layout around the questions are M8-02 (this file, a later section). The content contract and audio assets are M8-03 and M8-04 (ADRs). Visual values are M8-05 (DESIGN_SYSTEM.md). Answer checking, results and review are M9.

## Question types (M8)

**DRAFT** (M8-01, for the M8-06 gate).

### The IELTS Listening test format

Sources checked on 2026-10-18: ielts.org "IELTS Academic format: Listening" and "IELTS General Training format: Listening" (the two pages describe the same test); IDP "How IELTS on computer works" and IDP "IELTS on computer: Listening preparation" for computer delivery. ielts.org announced that IELTS moves to computer delivery only from mid-2026 ([READING_EXPERIENCE.md, Answer checking](READING_EXPERIENCE.md#answer-checking-m5)), so the computer-delivered facts are the ones this product simulates.

| Fact | Status | Source |
|---|---|---|
| 4 parts, 10 questions each, 40 questions; about 30 minutes | Verified | ielts.org Listening format pages |
| Part 1: an everyday conversation between two speakers; Part 2: an everyday monologue; Part 3: an educational or training conversation between two main speakers; Part 4: an academic talk by one speaker | Verified | ielts.org Listening format pages |
| Questions follow the order of the recording | Verified | ielts.org Listening format pages |
| The recording is heard **once only**; British, Australian, New Zealand and North American accents | Verified | ielts.org Listening format pages |
| One mark per correct answer | Verified | ielts.org Listening format pages |
| Academic and General Training Listening are the same test | Verified (the two pages give the same format) | ielts.org Listening format pages |
| Task types: multiple choice; matching; plan, map and diagram labelling; form, note, table and flow-chart completion; sentence completion; short-answer questions. The number of each type varies | Verified | ielts.org Listening format pages |
| Multiple choice: a question with three options, or a sentence stem with three endings; sometimes a longer list from which more than one answer is chosen | Verified | ielts.org Listening format pages |
| Labelling: answers are **selected from a list** | Verified | ielts.org Listening format pages |
| Form, note, table and flow-chart completion: the answer is **selected from a list or written** from the recording | Verified | ielts.org Listening format pages |
| Short answers: some questions ask for two or three answers | Verified | ielts.org Listening format pages |
| Word limits such as "NO MORE THAN TWO WORDS AND/OR A NUMBER"; going over loses the mark; hyphenated words count as one; contractions are not tested | Verified | ielts.org Listening format pages |
| On computer: answers are typed as they are heard; no transfer time; 2 minutes to check answers at the end; time to read the questions before each recording; a navigator of all 40 questions with forward and back; a "Review" mark; a volume control | Verified (IDP pages) | IDP "How IELTS on computer works"; IDP "IELTS on computer: Listening preparation" |
| On computer: how matching and labelling answers are given (clicking a letter, typing it, or dragging) | **Not found** on the pages checked | n/a; this spec does not depend on it (open question L3) |
| The exact reading time before each part, and the timing of the pauses | **Not found** on the pages checked | M8-02 decides with sources or as product policy |

Spelling, numbers and dates in Listening answers are checking rules, owned by M9 with their sources.

### Types by interaction

Grouped by how the learner answers, as Reading's types are ([READING_EXPERIENCE.md, Question types (M4)](READING_EXPERIENCE.md#question-types-m4)). **Every official Listening task type is covered; none is deferred** (the acceptance criterion of M8-01).

| Interaction | IELTS Listening task type | Reading renderer reused | New in M8 |
|---|---|---|---|
| **Choose one** | Multiple choice (one answer, usually A–C) | Choose one, as it is | Nothing |
| **Choose several** | Multiple choice with more than one answer ("Choose TWO letters, A–E") | Choose several, as it is | Nothing |
| **Choose from a list** | Matching (items to a shared list of options) | The shared option list, as it is (open question L2 proposes letter buttons for Listening) | Possibly the letter-button control (L2) |
| **Type words, in a text** | Form, note and sentence completion | Typed answer and the gap text | Form layout (label and value lines); fields in the text (L1) |
| **Type words, short answer** | Short-answer questions, including "List TWO …" | Short answer, as it is | Nothing |
| **Type words or choose, in a table or flow chart** | Table and flow-chart completion (written or from a list) | Typed answer; the shared option list | **Shared** table and flow-chart layouts (also Reading's, M8-17 and M8-18) |
| **Choose or type, on an image** | Plan and map labelling (from a list); diagram labelling (from a list in Listening; typed in Reading) | Typed answer; the shared option list | **Shared** labelling layout with images (also Reading's, M8-19) |

**What an answer is** stays exactly as in Reading ([READING_EXPERIENCE.md, What an answer is](READING_EXPERIENCE.md#what-an-answer-is-for-the-content-contract-and-session-state)): one option id, a set of option ids for a "choose several" item, or the text as typed. No Listening type needs a new answer shape, so the session model (M8-10) and checking (M9) reuse the Reading shapes. A completion gap in a form, note, table, flow chart or label is **either** typed **or** chosen from the group's list, as the content says (M8-03 records the field).

### What every Listening question shows

Unlike a Reading passage, the recording cannot be scrolled back to in Exam Mode, and it moves on whether or not the learner has answered. So the **unit on screen is the question group**, not the single question:

- **The current group is shown whole**: its instruction (English test content, including the word limit, e.g. "Write ONE WORD AND/OR A NUMBER for each answer"), its title or picture, and every one of its questions with its answer control in place. The learner reads the group before the recording starts and answers each question as the recording reaches it, without moving between questions. In Reading the sheet shows one question at a time; in Listening that would cost a tap per answer while the audio runs.
- **Question order is the recording's order**, as in IELTS. The engine never reorders.
- **The audio never moves the screen** (open question L4): the group does not scroll, and the current question does not change, because the recording reached a point. The learner keeps control; the transcript timestamps (M8-03) are not used to drive the screen.
- **The current question** is the one whose control the learner is focused on or last used, or the one chosen with the navigator or Previous / Next. "Mark for review" and the navigator's current state refer to it, as on Reading desktop.
- Answer words such as A, B, C are shown with their text; nothing is abbreviated.
- Where the player, the section header and the navigator sit around the group, and how a group too tall for the screen behaves with the on-screen keyboard, is M8-02.

**While the audio plays,** nothing in the question area changes by itself; the player shows its own state (M8-02). Choosing, typing and moving between questions never pause or affect the audio.

### Choose one: multiple choice (one answer)

As Reading's choose one ([Choose one](READING_EXPERIENCE.md#choose-one-true--false--not-given-yes--no--not-given-multiple-choice-one-answer)): full-width option rows with the letter and text, a native radio group, no auto-advance, "Clear answer" once answered. The only difference is that every question of the group is on screen at once, each with its own row list and its number as its heading ("Question 21"). A sentence stem with three endings is the same control.

- **Phone:** the group scrolls inside the question area; three rows of at least 48 px per question.
- **Keyboard:** Tab moves from one question's radio group to the next; arrows move within a group and never change question.
- **Desktop:** the same rows in the question column.

### Choose several: multiple choice with more than one answer

As Reading's choose several ([Choose several](READING_EXPERIENCE.md#choose-several-multiple-choice-with-more-than-one-answer)), unchanged: one item covers several numbers, checkbox rows, "2 of 2 chosen", other options disabled at the maximum, order never matters.

### Choose from a list: matching

The IELTS Listening matching task: a shared list of options (often A–C, up to A–H; e.g. opinions, features, places) and a list of items, each answered with one letter ("What does the speaker say about each of the following rooms?").

- **The shared list** is shown once at the top of the group, letter and text, as English test content.
- **Each item** shows its number and prompt and an answer control. Two options (open question L2):
  - (a) **Reading's answer button and option list**: "Choose an answer", which opens the group's list; one pattern in both skills, already approved and accessible, but two taps and the list covers the other items while the audio runs.
  - (b) **Letter buttons**: under each prompt, a row of the list's letters as a radio group (each at least 44 × 44 px; at 320 px six fit on a row, A–H wraps to two rows); one tap answers. The option text stays in the shared list above; each letter's accessible name carries its text ("B, too expensive"). For lists longer than eight options the group falls back to (a).
- "Chosen for {question}" and repeated letters ("You may choose any letter more than once") behave as in Reading.
- **Keyboard:** (a) as in Reading; (b) a native radio group per item, arrows between letters, Tab to the next item.
- **Desktop:** the shared list beside or above the items, the same control as on phones.

### Type words, in a text: form, note and sentence completion

The recording's outline with numbered gaps. Each gap is one question.

- **Form completion:** the form's fields as label and value lines ("Name: Sarah (1) ______", "Postcode: (2) ______"), one line each, with the form's title. Some lines have no gap (given information, e.g. "Example: Date of arrival: 15 May").
- **Note completion:** lines of notes as the content structures them (Reading's note completion has lines only; whether Listening notes add headings or sub-lines is M8-03's contract decision).
- **Sentence completion:** one sentence per question, as Reading's.
- **The fields** (open question L1):
  - (a) **Reading's layout**: the text with numbered gaps, then one labeled field per gap under the text ("Answer 3"); approved and simple, but the eye goes between the gap and the list of fields while the audio runs.
  - (b) **Fields in the text**: each gap is its field, in place in the line ("Postcode: [ 2 ______ ]"), with its number inside the empty field; the line wraps, and a field never gets narrower than about 8 characters or wider than the line. This is how computer-delivered IELTS shows completion (the boxes in the text) and keeps the eye on one place. Reading's desktop decision named fields in the text "a possible later improvement for realism" ([READING_EXPERIENCE.md, Decided for the desktop layout](READING_EXPERIENCE.md#practice-and-exam-mode-m4)).
- **Each field:** one line; autocorrect, autocapitalization and spell checking off; stored as typed and trimmed on blur (as Reading). **The ordinary text keyboard**, never a numeric one, even where the answer is likely a number: "AND/OR A NUMBER" means either, and a numeric keyboard would block letters (Part 1 often has spelled names, postcodes, times and prices).
- **Accessible name:** "Answer {number}", as in Reading; the line's text stays readable around it.
- **Keyboard:** Tab and Shift+Tab move between fields in order; Enter does not submit or change question (as Reading).
- **Word limit:** the instruction's limit stays visible above the group; the Practice word-limit warning works as in Reading. A gap chosen **from a list** instead (the content says so) uses the matching control of open question L2 in the gap's place.
- **Desktop:** the same, in the question column, at a comfortable measure.

### Type words, short answer

As Reading's short answers: the question and a labeled field. "List TWO things …" is one question text with two numbered fields under it ("Answer 15", "Answer 16"), each its own question number and typed answer; nothing new is stored. Fields as above.

### Table completion (shared with Reading)

A table summarising the recording, with gaps in some cells. **Designed once for both skills**: Listening adopts it in M8-15 and Reading in M8-17 (the M4 table follow-up, required before beta). The visual values are M8-05's.

- **From 600 px (tablet and desktop):** a real `<table>` with its header row (and row headers where the content has them), each gap's field in its cell, cells wrapping their text. No horizontal scroll from 600 px for tables of up to four columns: a product limit, not an IELTS rule, which M8-03 records and the validator enforces.
- **Phones (below 600 px)** (open question L5): (a) **one card per row**: the row's first cell as its heading, then each other cell as "column heading: content" lines, the gap's field in its line; no horizontal scroll at 320 px and the column headings repeated where they are needed; or (b) the table itself with horizontal scroll inside its box, which ACCESSIBILITY.md allows only for desktop exam simulation. **Recommendation: (a).**
- The semantics stay a table on wide screens and become a list of rows with headed lines on phones, so a screen reader always hears which column a gap is in.
- **Keyboard:** Tab moves through the fields in reading order (row by row).
- **Answers:** typed or from a list, per the content; a chosen answer uses the matching control (L2).

### Flow-chart completion (shared with Reading)

The stages of a process as boxes joined by arrows, with gaps in some boxes. Designed once for both skills: Listening in M8-15, Reading in M8-18.

- **Every width:** a vertical sequence of boxes, each full width (on desktop at the question column's measure), joined by a downward arrow. Stages follow each other in one direction, so the phone layout is also the desktop layout (a product choice; no official layout rule was found).
- **Structure:** an ordered list of stages, so a screen reader hears "list, 6 items" and each stage's position; the arrows are decorative.
- **A box** holds one or more lines of text with gaps; fields as in completion above (L1).
- **Linear flow charts only** (open question L6). A branching chart (two boxes side by side) is not supported in M8; the validator refuses it (M8-03).
- **Answers:** typed or from a list, per the content.

### Plan, map and diagram labelling (shared with Reading)

A picture (a building plan, a street map, a diagram of a machine or process) with places marked, and questions that name a place or a part. Designed once for both skills: Listening in M8-16, Reading diagram label completion in M8-19.

- **Two answer kinds**, as the content says:
  - **From a list** (Listening plans and maps; ielts.org: "selecting answers from a list"): the picture shows **letters** at places (A–H); each question names a place ("Café") and is answered with a letter. The control is open question L2's.
  - **Typed** (Reading diagram labelling; Listening when the content says so): the picture shows **question numbers** at the labels to complete; each question is a typed field ("Answer 14").
- **Phone:** the picture at the full width between the gutters, its letters or numbers at least 24 px with a contrasting outline so they read on any image (values M8-05); under it, the questions as a list, each with its control. An **"Enlarge picture"** button opens the picture alone on the full screen, where it can be panned and zoomed with gestures **and** with buttons (zoom in, zoom out, close), so no gesture is required (ACCESSIBILITY.md). The questions stay one tap away (close).
- **Desktop:** the picture and the questions side by side in the question area (the picture on the start side, the questions on the end side), each scrolling on its own if needed.
- **Text alternative:** every picture has one, written in the content (M8-03): a short name ("Plan of the ground floor of the sports centre") and a longer description of what a sighted learner sees: the layout, the given labels, and where each letter or number is ("Letter C is the room in the north-east corner, next to the stairs"). It describes the picture neutrally and never says which answer belongs where. In Listening the answer comes from the recording; in Reading it comes from the passage.
- **Keyboard:** Tab reaches "Enlarge picture", then the questions; the enlarged view's buttons work with Enter and Space, Escape closes it.
- The image pipeline (formats, sizes, loading on weak connections) is M8-03 and M8-04.

### Highlighting, notes and Pin Evidence

Reading's sentence highlighting and Pin Evidence work on a passage, which Listening does not have. Whether the question text can be highlighted, and whether Listening has a note area (computer-delivered IELTS gives rough paper for notes, IDP), is decided with the player and modes in M8-02. Listening's evidence (a timestamp and a transcript excerpt) is M9's review.

### Accessibility notes for every type

- Every control has an accessible name with its question number; option letters carry their text; nothing is by color alone (Reading's rules).
- **A screen reader speaks over the recording.** A learner who uses one hears both at once. This file does not solve it: M8-02 states how the player helps (pause and rewind in Practice), and the Exam Mode limitation is stated up front, not hidden. Transcripts as an alternative for deaf or hard-of-hearing learners are TBD (ACCESSIBILITY.md, Audio and media).
- Fields, letter buttons and option rows meet the 44 px minimum (48 px for rows); at 320 px and 200% zoom nothing is clipped and nothing scrolls sideways (except the enlarged picture, which pans by design).

### Open questions (M8-01)

1. **L1. Completion fields: in the text, or under it?** Options: (a) Reading's layout, a labeled field per gap under the text; (b) fields in the text, in each gap's place, on phones and desktop; (c) (b) on desktop only. **Recommendation: (b)** for Listening: the learner writes while the recording moves on, and one place to look matters more than in Reading; it is also how computer-delivered IELTS shows completion. Reading keeps (a) for its existing types until the owner decides otherwise; the shared table and flow-chart layouts use fields in their cells in both skills, since there is no "under" a table cell.
2. **L2. Matching and labels from a list: letter buttons or the option list?** Options: (a) Reading's answer button and option list; (b) a row of letter buttons per item, falling back to (a) for lists longer than eight options. **Recommendation: (b)** in Listening: one tap per answer while the audio runs, every item stays on screen. It is a new control, so M8-05 designs it and the owner approves it at M8-06.
3. **L3. Drag and drop?** Computer-delivered IELTS may use dragging for some matching and labelling tasks (not confirmed on the pages checked). Options: (a) none, as decided for Reading (M4 open question 4); (b) dragging in desktop Exam Mode with a keyboard equivalent. **Recommendation: (a)**: the same accessible interaction everywhere; realism comes from the timing and the play-once audio (M8-02), not from the gesture.
4. **L4. Should the screen follow the recording?** The transcript timestamps (M8-03) could move the current question as the audio reaches it. Options: (a) never; (b) in Practice only; (c) always. **Recommendation: (a)**: predictable, the learner stays in control (as Reading never scrolls the passage), and it would hint where an answer is.
5. **L5. Tables on phones:** options (a) one card per row with headed lines; (b) the table with horizontal scroll inside its box. **Recommendation: (a)**, since 320 px without horizontal scroll is a requirement.
6. **L6. Branching flow charts?** Options: (a) linear only in M8; the validator refuses branches; a later content need adds them with their own design pass; (b) design branches now. **Recommendation: (a)**: a flow chart is described as the stages of a process (ielts.org), no content planned in M8 needs a branch, and a branch has no layout at 320 px without its own design pass. If the owner prefers to keep branching as a recorded follow-up, a task is added to TASKS.json for it.
7. **L7. "Choose from a list" gaps in forms, notes and tables:** options: (a) supported in M8 with L2's control; (b) typed gaps only in M8. **Recommendation: (a)**: ielts.org names both answer kinds for these tasks, and the control exists anyway for matching.
