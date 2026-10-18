# Listening Experience

Canonical owner of the **Listening interaction model**: the question types the Listening engine renders and how each is answered, the player, modes, sections and layouts.

> **STATUS: APPROVED** (owner, 2026-10-18, task M8-06), with the amendment in [Decided at the M8-06 gate](#decided-at-the-m8-06-gate). Drafted in M8-01 and M8-02. **Implemented** (M8 Listening engine, 2026-10-18): every section below, with the temporary test; checking, results and review are M9. The surface direction it follows: "Listening is audio-first" ([DESIGN_CONSTITUTION.md, Surface direction](../design/DESIGN_CONSTITUTION.md#surface-direction)).

General UX rules apply ([UX_PRINCIPLES.md](UX_PRINCIPLES.md)), as do accessibility requirements ([ACCESSIBILITY.md](../design/ACCESSIBILITY.md)) and the visual system ([DESIGN_SYSTEM.md](../design/DESIGN_SYSTEM.md)). The Reading engine this builds on is owned by [READING_EXPERIENCE.md](READING_EXPERIENCE.md); where a Listening type behaves exactly like a Reading type, this file links to it instead of restating it.

**Owned elsewhere:** the content contract and audio assets are M8-03 and M8-04 (ADRs); visual values are M8-05 (DESIGN_SYSTEM.md); flows, step counts and copy are in [USER_FLOWS.md, Listening flows (M8)](USER_FLOWS.md#listening-flows-m8); answer checking, results and review are M9.

## Decided at the M8-06 gate

Owner decision, 2026-10-18: the recommendations of **L1–L7** (M8-01) and **P1–P11** (M8-02) are approved as written below; so are the Listening flows and copy (USER_FLOWS.md), the M8 design values (DESIGN_SYSTEM.md), [ADR-0012](../architecture/decisions/0012-listening-content-contract-and-audio-assets.md) and [ADR-0013](../architecture/decisions/0013-listening-audio-delivery-and-session-state.md) (Accepted). **Amendment:**
- **Original audio production is deferred.** M8 does not record or generate original audio. The first working Listening test is **one coherent temporary test from existing material whose terms permit this use**: matching audio, questions, answer key, transcript and any pictures, prepared through the normal content contract (TASKS.json M8-07 and M8-08). An existing complete set is preferred over unrelated recordings; if none is available with permission, permitted recordings with questions and answers authored by Claude and checked against the audio. Its source and usage terms are verified and recorded; publicly accessible material is never assumed to be reusable.
- **It is labelled as temporary practice content and keeps its attribution** ([Temporary practice content](#temporary-practice-content-m8)). It replaces nothing in the engine: no answer, file path or part count is written into UI code.
- **The test follows the format above** (4 parts, 40 questions); nothing in the owner's instruction changes the exam format.
- **Replacing it with the owner's final materials** is tracked separately (TASKS.json M13-10, M13-11). Original audio for the beta library stays with M13-07 and M13-08.
- The scope of M8 and the milestone boundaries are unchanged.

## Temporary practice content (M8)

**Approved direction** (owner, 2026-10-18, M8-06 amendment); copy and values were added after the gate at the owner's instruction and are confirmed in the screenshot review of the screens (M8-12, M8-13).

- A test marked temporary in its content (ADR-0012 §1, `temporary: true`) shows, on its start screen, a note "Temporary practice test" and its attribution line ("Source: …", the text its licence requires, English, `lang="en"`), and in the Practice Hub the line "Temporary practice test" under its format.
- The attribution comes from the content's `origin`, never from code. Removing the temporary test and adding the final one is a content change (a new test id, or a new version as ADR-0008 §3 requires), with no change to the engine.
- Nothing about the temporary test is presented as official IELTS material or as the product's own content.

### Source of the temporary test (M8-07, checked 2026-10-18)

**No complete IELTS-format Listening set with a licence that permits this use was found.** The official sample tests (ielts.org, British Council) and the third-party practice sites found state no licence for reuse, and one is marked all rights reserved; they are not used. So the test uses the **approved fallback**: four permitted recordings, one per part, chosen to match the part types of the format, with questions and answers to be written by Claude in M8-08 and checked against the audio.

**Source: VOA Learning English** (Voice of America, learningenglish.voanews.com). Its "Request Our Content" page (https://learningenglish.voanews.com/p/6861.html, read 2026-10-18) states that "Learning English texts, MP3s, photos and videos are in the public domain" and that they may be reprinted "for educational and commercial purposes, with credit to learningenglish.voanews.com". **Exception:** stories, photos and video images from news agencies (AP, Reuters, AFP) are copyrighted and may not be republished. VOA's usage page (insidevoa.com/p/5719.html) adds that VOA websites "may contain copyright protected material"; this is the exception above. Nothing on either page restricts conversion, excerpting or use in an app; works in the public domain carry no such restriction.

**What this means for the product:** copying, converting to the ADR-0012 format, adding questions and serving the recordings and transcripts to learners are permitted; **credit is required** (the attribution line below); no agency material may be used. Each recording below was checked: it is VOA's own production, written and voiced by VOA staff, with no agency credit or agency text in its transcript, and its photos are not used (the test's pictures are drawn for the product).

| Part | Format role | VOA item | Speakers | Length | MP3 (128 kbps) |
|---|---|---|---|---|---|
| 1 | Everyday conversation | Let's Learn English Level 2, Lesson 6: "Will It Float?" (https://learningenglish.voanews.com/a/lesson-6-will-it-float/4064553.html): a city tour by amphibious "duck" boat, with facts about the boat and the White House | Anna, Penelope, a boy guide; Professor Bot (the course's teaching voice) | 4:44 | `voa-audio.voanews.eu/vle/2017/10/10/4814fa95-feaa-447a-a081-499d11b1d5f3_hq.mp3`, sha256 `521d44ef…b65680` |
| 2 | Everyday monologue | Education Tips: "Learning English with English Clubs: Starting and Organizing Your Club" (https://learningenglish.voanews.com/a/learning-english-with-english-clubs-starting-and-organizing-your-club/3947928.html), by Phil Dierking | Jill Robbins and Phil Dierking, reading in turn | 7:37 | `voa-audio.voanews.eu/vle/2017/07/17/1959ddf4-5d15-462e-a760-55be5bfd5494_hq.mp3`, sha256 `bb6a3459…826354d` |
| 3 | Educational or training conversation, two main speakers | Let's Learn English Level 2, Lesson 13: "Save the Bees!" (https://learningenglish.voanews.com/a/lets-learn-english-level-2-lesson-13-save-the-bees/4145716.html): a beekeeper teaches Anna | Caroline, Anna; Professor Bot | 3:51 | `voa-audio.voanews.eu/vle/2017/12/01/104a6627-290a-4472-911e-3bb9349f44f7_hq.mp3`, sha256 `f231fd76…bfa5a1fd0` |
| 4 | Talk on an educational subject | Education Tips: "Make a Memory Palace to Improve Your English" (https://learningenglish.voanews.com/a/improve-your-english-with-a-memory-palace/5855771.html), by Alice Bryant | John Russell and Alice Bryant, reading in turn | 9:00 | `voa-audio.voanews.eu/vle/2021/04/20/6dffc231-cb3e-4662-afd5-f1208cbffed8_hq.mp3`, sha256 `e646e10f…26bc9463` |

Every file was downloaded on 2026-10-18 and its duration measured with ffprobe: 284.8 s, 457.2 s, 231.5 s and 540.0 s, matching the lengths the pages state. Full hashes are in PROGRESS.md (M8-07).

**Attribution** (the `origin.attribution` text, shown on the start screen): "Recordings and transcripts: VOA Learning English (learningenglish.voanews.com), public domain. Questions written for this app."

**Known differences from a real IELTS test**, stated so the temporary test is not mistaken for one:
- Every voice has a North American accent, and Learning English is read slowly; IELTS uses several accents at natural speed.
- Parts 1 and 3 include Professor Bot's short grammar comments between scenes; Parts 2 and 4 are read by two presenters in turn rather than one speaker.
- The recordings total about 25 minutes, not about 30, and have no IELTS-style spoken instructions or reading pauses. M8-08 added 30 seconds of silence before each part for reading time (allowed: the material is public domain), recorded in each file's provenance; with it the test runs about 27 minutes.
- The questions are written for this product by Claude (`aiDraft`), not by VOA or IELTS.

## Question types (M8)

**Approved** (M8-01; owner, 2026-10-18, M8-06).

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

- **Three ways to label**, as the content says:
  - **Letters on the picture** (Listening plans and maps; ielts.org: "selecting answers from a list"): the picture shows **letters** at places (A–H); each question names a place ("Café") and is answered with a letter. The control is open question L2's.
  - **Numbers on the picture, answered from a word list**: the picture shows **question numbers** at places, and the group has its own list of words (A–G); each numbered place is answered with a letter from that list, with L2's control.
  - **Typed** (Reading diagram labelling; Listening when the content says so): the picture shows **question numbers** at the labels to complete; each question is a typed field ("Answer 14").
- **Phone:** the picture at the full width between the gutters, its letters or numbers at least 24 px with a contrasting outline so they read on any image (values M8-05); under it, the questions as a list, each with its control. An **"Enlarge picture"** button opens the picture alone on the full screen, where it can be panned and zoomed with gestures **and** with buttons (zoom in, zoom out, close), so no gesture is required (ACCESSIBILITY.md). The questions stay one tap away (close).
- **Desktop:** the picture and the questions side by side in the question area (the picture on the start side, the questions on the end side), each scrolling on its own if needed.
- **Text alternative:** every picture has one, written in the content (M8-03): a short name ("Plan of the ground floor of the sports centre") and a longer description of what a sighted learner sees: the layout, the given labels, and where each letter or number is ("Letter C is the room in the north-east corner, next to the stairs"). It describes the picture neutrally and never says which answer belongs where. In Listening the answer comes from the recording; in Reading it comes from the passage.
- **Keyboard:** Tab reaches "Enlarge picture", then the questions; the enlarged view's buttons work with Enter and Space, Escape closes it.
- The image pipeline (formats, sizes, loading on weak connections) is M8-03 and M8-04.

### Highlighting, notes and Pin Evidence

Reading's sentence highlighting and Pin Evidence work on a passage, which Listening does not have. Whether the question text can be highlighted, and whether Listening has a note area (computer-delivered IELTS gives rough paper for notes, IDP), is open question P9 below. Listening's evidence (a timestamp and a transcript excerpt) is M9's review.

### Accessibility notes for every type

- Every control has an accessible name with its question number; option letters carry their text; nothing is by color alone (Reading's rules).
- **A screen reader speaks over the recording.** A learner who uses one hears both at once. Practice lets them pause and go back; the Exam Mode limitation is stated up front, not hidden ([The player](#the-player-m8)). Transcripts as an alternative for deaf or hard-of-hearing learners are TBD (ACCESSIBILITY.md, Audio and media).
- Fields, letter buttons and option rows meet the 44 px minimum (48 px for rows); at 320 px and 200% zoom nothing is clipped and nothing scrolls sideways (except the enlarged picture, which pans by design).

### Open questions (M8-01)

1. **L1. Completion fields: in the text, or under it?** Options: (a) Reading's layout, a labeled field per gap under the text; (b) fields in the text, in each gap's place, on phones and desktop; (c) (b) on desktop only. **Recommendation: (b)** for Listening: the learner writes while the recording moves on, and one place to look matters more than in Reading; it is also how computer-delivered IELTS shows completion. Reading keeps (a) for its existing types until the owner decides otherwise; the shared table and flow-chart layouts use fields in their cells in both skills, since there is no "under" a table cell.
2. **L2. Matching and labels from a list: letter buttons or the option list?** Options: (a) Reading's answer button and option list; (b) a row of letter buttons per item, falling back to (a) for lists longer than eight options. **Recommendation: (b)** in Listening: one tap per answer while the audio runs, every item stays on screen. It is a new control, so M8-05 designs it and the owner approves it at M8-06.
3. **L3. Drag and drop?** Computer-delivered IELTS may use dragging for some matching and labelling tasks (not confirmed on the pages checked). Options: (a) none, as decided for Reading (M4 open question 4); (b) dragging in desktop Exam Mode with a keyboard equivalent. **Recommendation: (a)**: the same accessible interaction everywhere; realism comes from the timing and the play-once audio (M8-02), not from the gesture.
4. **L4. Should the screen follow the recording?** The transcript timestamps (M8-03) could move the current question as the audio reaches it. Options: (a) never; (b) in Practice only; (c) always. **Recommendation: (a)**: predictable, the learner stays in control (as Reading never scrolls the passage), and it would hint where an answer is.
5. **L5. Tables on phones:** options (a) one card per row with headed lines; (b) the table with horizontal scroll inside its box. **Recommendation: (a)**, since 320 px without horizontal scroll is a requirement.
6. **L6. Branching flow charts?** Options: (a) linear only in M8; the validator refuses branches; a later content need adds them with their own design pass; (b) design branches now. **Recommendation: (a)**: a flow chart is described as the stages of a process (ielts.org), no content planned in M8 needs a branch, and a branch has no layout at 320 px without its own design pass. If the owner prefers to keep branching as a recorded follow-up, a task is added to TASKS.json for it.
7. **L7. "Choose from a list" gaps in forms, notes and tables:** options: (a) supported in M8 with L2's control; (b) typed gaps only in M8. **Recommendation: (a)**: ielts.org names both answer kinds for these tasks, and the control exists anyway for matching.

## Player, modes and sections (M8)

**Approved** (M8-02; owner, 2026-10-18, M8-06). Flows, step counts and copy: [USER_FLOWS.md, Listening flows (M8)](USER_FLOWS.md#listening-flows-m8).

### What the official format says about playing

Sources as in [The IELTS Listening test format](#the-ielts-listening-test-format), checked on 2026-10-18.

| Fact | Status | Used for |
|---|---|---|
| The recording is heard once only | Verified (ielts.org) | Exam Mode plays once, without pause or seeking |
| There is time to read the questions before each recording | Verified (IDP "IELTS on computer: Listening preparation") | The reading time is **inside the recording** (below) |
| On computer, no transfer time; 2 minutes to check answers at the end | Verified (IDP) | Exam Mode's 2-minute check after the recording |
| About 30 minutes in total | Verified (ielts.org) | The start screen's time |
| Answers can be changed at any time before the test is submitted; a navigator of all 40 questions; a review mark; a volume control | Verified (IDP) | Navigation and "Mark for review" in both modes; volume (open question P5) |
| How long each reading pause is, and where the pauses fall within a part | **Not found** on official pages (unofficial guides disagree) | Product policy, decided per recording in the content (M8-07) |

**The reading time and the part changes are part of the audio**, as in the real test: each part's recording starts with its spoken introduction and a silence for reading the questions ("You now have some time to look at questions 1 to 5"), and may have a second pause before its second group. The app does not add its own pauses or countdowns between parts. So Practice and Exam play the same recording, and the scripts (M8-07) decide the pause lengths as product policy, stated in the content's provenance record. One file or one stretch of audio per part is M8-03's decision; this spec only needs to know where each part starts.

### The player (M8)

One player for the test, always visible under the test bar (phone and desktop). It plays the part of the questions on screen in Practice, and the whole recording in order in Exam.

**Practice Mode** (learning help, no time limit):
- **Play / Pause** (the player's main button, 48 px).
- **Back 5 seconds** and **Forward 5 seconds** (open question P2).
- **A position slider** with the elapsed and total time of the part ("1:23 / 7:40"); dragging or the arrow keys move it.
- **Speed:** 0.75×, 1× (default) and 1.25× (open question P3), chosen from a small menu; the choice is kept for the session.
- **At the end of a part:** the player stops and says "End of Part 2"; "Play again" restarts the part. It never moves to the next part by itself.
- **No transcript during practice** (open question P4): the transcript is the evidence of M9's review; shown while answering, it would give the answers away.
- **No timer** (as Reading Practice).

**Exam Mode** (realistic, no help):
- **No controls except volume** (open question P5): no pause, no seeking, no speed. The player shows its state as text and a non-interactive progress line: "Recording: Part 2", the part's progress, and in the test bar the overall "Part 2 of 4".
- **The recording plays once, from Part 1 to Part 4, without stopping.** Parts follow each other inside the recording; nothing waits for the learner.
- **The 2-minute check:** when the recording ends, the test bar shows "Time to check: 2:00" counting down, and a polite announcement says "The recording has ended. You have 2 minutes to check your answers." At 0:00 the answers are final and the test finishes by itself without the confirmation, and the finished page says "Time is up." (as Reading's Exam time-out). "Finish test" is available throughout, with the confirmation.
- **The learner moves freely** between all 40 questions at any time, as on computer-delivered IELTS: the navigator, Previous and Next work during the recording. **The screen never follows the recording** (M8-01 L4): when a new part starts and the learner is looking at another part, a quiet notice "Part 2 has started." with "Go to Part 2" appears above the questions, and a polite announcement says the same; the learner decides.
- Stated up front on the start screen: the recording plays once without stopping, and the time keeps running if you leave ([Resume](#resume-and-weak-connections-m8)).

**Practice vs Exam, per feature:**

| | Practice | Exam |
|---|---|---|
| Scope | All four parts, in any order, at the learner's pace | The whole test as one sitting, in order |
| The recording | Per part; play, pause, back, forward, slider, speed, play again | Once, Parts 1–4 without stopping |
| Reading time before a group | In the recording; the learner may also pause | In the recording |
| Changing part | Choosing a question of another part switches the player to that part (paused at the position it was left) | The recording decides; the questions of every part are always reachable |
| Timing | None | The recording's length, then 2 minutes to check; auto-finish at 0:00 |
| Mark for review, navigator | Yes | Yes |
| Word-limit warning | Yes (as Reading Practice) | No |
| Transcript | No (M9 review only; P4) | No |
| Highlighting, notes | Open question P9 | Open question P9 |
| "Exit" | As Reading's "Exit"; everything kept, the player paused at its position | Asks first: "Leave the test? The recording keeps going while you are away." |
| After finishing | The finished page | The finished page |

**The finished page in M8** (both modes, until M9 adds checking): as Reading's in M4: "Test finished" (and "Time is up." after a time-out), "You answered {answered} of {total} questions.", the honest line "Checking answers and explanations will come in a later version.", the red "Go to home page" and a quiet "Start again". No score: nothing in M8 computes one.

**Sound check:** none in M8 (open question P6). Each part's recording starts with spoken instructions, which serve as the sound check in Practice; the Exam start screen asks the learner to set the volume and use headphones if they can.

**Audio focus on the device:** when the browser pauses the audio itself (a phone call, another app taking the audio, the system stopping background playback), Practice shows the player paused at that position. Exam treats it as an interruption ([Resume](#resume-and-weak-connections-m8)).

### Keyboard, screen readers and motion (player)

- **Order:** skip link "Skip to the questions" (first focusable), the test bar (Exit, part, check timer), the player (a `region` named "Audio player"), the questions (`main`), the bottom bar.
- **Practice controls are native buttons** with accessible names that change with the state ("Play" / "Pause"); the slider is a native range input whose value is read as words ("1 minute 23 seconds of 7 minutes 40 seconds"); speed is a button that opens a short list of radio options ("Speed: 1×").
- **No global keyboard shortcuts** (open question P7): Space and the arrow keys type and move inside answer fields, and a shortcut there would change the audio by accident. Every control is reachable by Tab.
- **Exam:** the player's state is text in the region, not a live region; only three things are announced politely: a new part has started, the recording has ended with the check time, and 30 seconds of check time left. The check timer is in the test bar as Reading's timer is (`mm:ss`, bolder in the last 30 seconds, nothing blinks).
- **A screen reader speaks over the recording** ([Accessibility notes](#accessibility-notes-for-every-type)): Practice is the mode that works with one (pause, back); the Exam start screen says plainly that the recording does not stop. Transcripts for deaf or hard-of-hearing learners stay TBD (ACCESSIBILITY.md).
- **Motion:** no waveform and no animated equalizer (open question P8); the progress line moves with the audio but has no transition; with reduced motion nothing in the player animates. Buffering is shown by text ("Loading the audio…"), with at most a static icon.

## Resume and weak connections (M8)

**Approved** (M8-02; owner, 2026-10-18, M8-06). How sessions and audio are stored and fetched is M8-04's ADR; this section is the behavior it must give.

### Leave and come back

**Practice:** everything is kept on the device as in Reading (answers, marks, the question on screen) plus **each part's audio position**. Coming back opens the screen where the learner left, with the player **paused** at the saved position minus 3 seconds (so the learner hears the end of the last sentence again); the learner taps Play. Browsers do not let a page start sound before the learner taps, so a paused player is also the only reliable state.

**Exam:** the sitting is like the real one: **the recording keeps going while the learner is away**, as Reading's Exam time keeps running (open question P1).
- **Background playback is not guaranteed and the app never claims it.** While the page stays open in another tab or behind a locked screen, some browsers keep playing and others pause or stop the audio. A pause the learner did not make (the browser, the system, a phone call) is an interruption with the documented recovery (below): the Exam pauses, and the learner continues with one tap when they come back.
- When the learner comes back to a closed page, the position is the recording's start time plus the time that has passed (minus the time lost to buffering and interruptions, which the session records). The screen shows "Continue the test", the sentence "The recording kept going while you were away. It continues from Part 3, 4:12.", and the red "Continue", which starts the audio at that position (the tap the browser needs). If the recording has ended in the meantime, the screen opens in the check time with what is left of it; if the check time is over too, the test is finished ("Time is up.").
- "Exit" asks first: "Leave the test? The recording keeps going while you are away." ("Leave" / "Stay").

### Weak connections

The learners use mid-range phones on variable mobile connections (PRODUCT.md). A recording of about 30 minutes is several megabytes (M8-03 sets the target), so:

- **Before starting, the start screen states the audio's size** ("Audio: about {size} MB. Wi-Fi is best.") and recommends headphones.
- **Exam: the whole recording is downloaded before it starts** (open question P10). After "Start", the "Preparing the audio" screen shows the progress ("6 of 14 MB"); when everything is on the device it says "The audio is ready. The recording plays once and starts when you tap the button." with the red "Start the recording". Downloading first means a slow connection never stops the exam halfway, and the exam then works offline. The tap also gives the browser the permission to play sound.
- **Practice: a part can start once enough of it has loaded** to play without stopping at the current speed (the browser's own estimate), and the other parts load in the background in order. The player shows "Loading the audio…" while it waits, and Play is unavailable until it can play.
- **Buffering in Practice** (the connection is slower than the audio): the player pauses itself with "Loading the audio…" and continues by itself when enough has loaded; the position is never lost.
- **Download failure before starting** (both modes): "The audio couldn't be downloaded. Check your connection and try again." with "Try again"; what has been downloaded is kept, so a retry continues.
- **Failure mid-exam** (the audio stops and cannot continue: a stored file was evicted, a decoding error, the browser stopped playback): this is the **only time an Exam pauses**. The screen shows "The audio stopped", "The recording is paused at Part 3, 4:12, and your answers are saved.", the red "Try again" (continues from that position once the audio can play) and a quiet "Finish without the rest". The time the audio was stopped does not count against the learner, and the session records that the sitting was interrupted (M8-04), so M9 and mock history can say so honestly. The finished page of an interrupted Exam adds: "The recording was interrupted, so this was not a full exam sitting."
- **Failure in Practice:** the player shows "The audio couldn't load." and "Try again"; answering and navigating keep working.
- **Offline:** once the audio a mode needs is on the device, answering, navigating and playing work offline. Opening a test while offline shows the M1 error state (the offline scope is M14).
- **Storage blocked or full** (sessions cannot be kept): the one-line notice as in Reading: "Your answers can't be saved on this device. Don't close this page." The audio download needs storage only for the session's duration (M8-04 decides where it lives).

## Listening screen: phone and desktop (M8)

**Approved** (M8-02; owner, 2026-10-18, M8-06). The audio-first order from [DESIGN_CONSTITUTION.md, Surface direction](../design/DESIGN_CONSTITUTION.md#surface-direction): a compact top bar, progress, the player, the current question, its answer controls, then compact navigation. Visual values are M8-05's.

### Start screen

At the test's address `/{locale}/listening/{testId}` (as Reading's): the test's title (English test content), the format line ("4 parts · 40 questions · about 30 minutes"), the mode as two option rows, **Practice** ("Pause, go back and change the speed. No time limit.") and **Exam** ("The recording plays once without stopping, about {minutes} minutes, then 2 minutes to check. No help. The time keeps running if you leave."), the audio-size line, the headphones line, and the red "Start". On desktop the Reading start screen's composition (`TaskLayout`, the side card with the Listening identity). A link may preselect the mode (`?mode=exam`). A test with an unfinished session skips the start screen and resumes.

### Phone (below 600 px) and tablet (600–1023 px)

Top to bottom at 360 px:
1. **Test bar** (the screen's `header`, about 48 px, as Reading's): "Exit" on the start side, "Part 2 of 4" in the middle, the check timer on the end side only during Exam's check time.
2. **Player** (sticky under the test bar, so it stays reachable while the questions scroll): Practice: Play / Pause, Back 5 s, the slider with its times, Forward 5 s and Speed, in at most two rows at 320 px (the slider gets its own row there). Exam: one row with "Recording: Part 2", the progress line, and the volume note (P5).
3. **The notice line** when there is one (storage, "Part 2 has started." with "Go to Part 2").
4. **The questions** (`main`): the current group whole, as M8-01 specifies (instruction, title or picture, every question with its control in place). The page scrolls; groups follow one another down the part, so the learner can scroll on to the next group as in a paper booklet, and "Questions 1–5" headings separate them. A part is one scrolling page; another part is reached by the navigator or Next.
5. **Bottom bar** (fixed; its height follows its content: two rows on phones, one from the tablet breakpoint; values in DESIGN_SYSTEM.md, M8 components): "Mark for review" for the current question, "All questions" (opens the navigator), Previous and Next. On the last question, Next becomes the red "Finish test".

**Why no bottom sheet:** Reading's sheet exists to keep the passage as the main object; Listening has no passage, so the questions are the main object and get the whole screen under the player. The navigator opens in a sheet (the expanded state of Reading's sheet, with its "Back"), so the pattern stays familiar.

**The navigator:** Reading's navigator, grouped by part ("Part 1" … "Part 4", ten numbers each), with the same states never by color alone and the same accessible names. Choosing a number shows its part and scrolls its question into view with focus on its heading. In Practice this also switches the player to that part.

**Previous / Next:** move the current question by one, scrolling it into view and moving focus to its heading ("Question 6"); crossing into another part shows that part. They never touch the audio in Exam; in Practice crossing into another part switches the player to it, paused.

**Phone keyboard:** when a field has focus, the player stays docked under the test bar, the bottom bar hides behind the on-screen keyboard, and the field is scrolled into view above the keyboard (the visible viewport). When the keyboard closes, the bottom bar returns.

**Tablet (600–1023 px):** the same layout, the questions centered at a comfortable measure, the player and the bottom bar as wide as the question column.

### Desktop (from 1024 px)

- **Test bar** across the top (Exit, "Part 2 of 4", the check timer in Exam's check time).
- **Player** as a band under the test bar across the question area's width; Practice controls in one row; in Exam the state, the progress line and the volume slider (P5).
- **Questions** in one column at a comfortable measure (no passage column), the current group whole; labelling groups use the picture-and-questions two-column layout of M8-01 within the area, and tables show as tables.
- **Navigator bar** along the bottom as Reading's: the part on screen's numbers first, the other parts as quiet buttons with their progress ("Part 3: 4 of 10 answered"), "Mark for review", Previous, Next and "Finish test" (with Reading's confirmation dialog).
- **Same layout in both modes** (as Reading's desktop); the player's controls differ.
- **Keyboard:** Tab moves skip link → test bar → player → questions → navigator bar.

### Empty and error states

- **Unknown test address:** the localized not-found page.
- **The learner's device cannot play the audio format** (very old browsers): the start screen says "This device can't play the test's audio." and Start is unavailable (M8-04 picks a format every supported browser plays, so this is a safety state).
- The download, buffering, interruption, offline and storage states are in [Weak connections](#weak-connections).

### Open questions (M8-02)

1. **P1. Exam resume:** options: (a) the recording keeps going while the learner is away, as Reading's Exam time; (b) the recording pauses when the page closes and continues where it stopped; (c) an Exam cannot be resumed: leaving finishes it. **Recommendation: (a)**: it is the real condition, it matches the approved Reading rule, and it is stated twice before it can surprise anyone (the start screen and the "Exit" confirmation). Interruptions the learner did not cause (the audio failing) are the exception that pauses.
2. **P2. How far Back and Forward jump in Practice:** (a) 5 seconds; (b) 10 seconds; (c) back to the previous sentence (needs the transcript's timing). **Recommendation: (a)**: a missed phrase is usually within 5 seconds, and two taps give 10. (c) could come with M9's transcript timings.
3. **P3. Speeds in Practice:** (a) 0.75×, 1×, 1.25×; (b) also 0.5× and 1.5×; (c) none. **Recommendation: (a)**: slower helps a learner catch a phrase, faster helps build tolerance; more steps distort the voice and add choices.
4. **P4. A transcript in Practice while answering?** The task allows it only if the owner approves. Options: (a) no: the transcript belongs to M9's review; (b) after a part ends, in Practice; (c) at any time in Practice. **Recommendation: (a)**: reading the transcript turns listening practice into reading practice and shows the answers; M9's review shows the evidence excerpt with its timestamp.
5. **P5. Volume in Exam:** IDP says computer-delivered IELTS has a volume control. On phones, browsers mostly ignore a page's volume setting (iOS does not allow it), so the device's buttons are what works. Options: (a) a volume slider on desktop, and on phones the line "Use your device's volume buttons."; (b) no volume control anywhere; (c) a slider everywhere. **Recommendation: (a).**
6. **P6. Sound check before Exam:** (a) none; the start screen asks the learner to set the volume, and Part 1's spoken introduction comes first; (b) a short sample with "Play sample" on the "Preparing the audio" screen. **Recommendation: (a)** for M8; (b) needs its own recorded sample, which M8-08 could add if the owner wants it.
7. **P7. Keyboard shortcuts for the player** (for example Space to pause): (a) none in M8; (b) shortcuts with a modifier key, outside answer fields only. **Recommendation: (a)**: every control is a Tab stop already, and a shortcut that fires while typing an answer would lose audio in Practice.
8. **P8. A waveform in the player?** The surface direction says "the player (or waveform)". Options: (a) a plain progress line; (b) a static waveform drawn from the audio. **Recommendation: (a)**: a waveform adds a data file per part and decoration that answers no question (UI_ANTI_PATTERNS.md, decorative charts).
9. **P9. Highlighting question text and a note area:** computer-delivered IELTS gives rough paper for notes (IDP); whether it allows highlighting in Listening was not found. Options: (a) neither in M8; (b) highlighting of the question text in both modes; (c) a notes field. **Recommendation: (a)**: the learner can use paper as in the test, and both features need their own design pass; recorded here so a later milestone can add them.
10. **P10. Exam download before starting:** (a) the whole recording before "Start the recording"; (b) the first part, then the rest while playing. **Recommendation: (a)**: a test of about 30 minutes must not stop because a connection slowed down in Part 3; the wait is shown with its progress, and it happens once. If the size makes the wait too long on 3G, M8-03's bitrate target is the lever, not a mid-exam stop.
11. **P11. The first audio in Practice:** (a) "Start" opens the screen with the player paused; the learner reads the questions and taps Play; (b) the recording starts with "Start". **Recommendation: (a)**: the recording's own reading pause gives time anyway, but a learner may want to read first, and a page may not start sound reliably after a slow load. This adds one action before the audio (see the step count in USER_FLOWS.md).
