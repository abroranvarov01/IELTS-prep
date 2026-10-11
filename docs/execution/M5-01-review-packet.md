# M5-01 Owner Review Packet: Reading Review + Error Intelligence

> **Review snapshot, not a specification.** Generated on 2026-10-11 by copying the canonical draft sections listed under [Canonical sources](#canonical-sources) word for word, as they stand in the commit that adds or updates this file; only heading levels and relative links were adjusted (links point at the canonical files). If anything here differs from those sections, **the canonical sections win**. Edit them, not this file.
>
> **Nothing here is approved.** M5 is `planned`, no milestone is active, and task M5-01 (the owner gate) is open. Earlier discussion of the proposal is not approval of any part of it. Every "recommendation" is Claude's proposal.

## How to use this packet

- **What the owner is asked to do (task M5-01):** answer decisions D1 to D25 ([Part 1](#part-1-decisions-d1-to-d25)); approve or revise the Reading specifications, flows, copy and design values (Parts 2 to 4); accept or revise ADR-0008 and ADR-0009 (Parts 5 and 6); and confirm or change the M5 tasks (Part 7). Activating M5 is a separate owner action.
- **Already approved and not reopened (M4):** the desktop navigator bar's content-driven height (two rows at 1280 px and up to three at 1024 px are acceptable); Previous, Next and "Mark for review" keep their text labels; the passage on screen comes first in the bar; the refused-pin message is contextual feedback above the action bar's two rows.
- **Not in M5:** accounts and sync (M7), progress over time and evidence across tests (M8), new content and authoring tools (M9), and runtime AI unless D12 (b) is chosen and an AI provider ADR is accepted first.
- **How to answer:** reply per decision ID ("D4: b") or mark sections approved; the worker records the answers in the canonical files and TASKS.json.

## What changed since the first proposal (ee570c4)

A summary only; the parts below hold the text.
- **All owner decisions shown:** D1 to D21 in full with the proposed behavior, recommendation, trade-off and notes, plus four new ones: D22 date formats (no official Reading source), D23 the demo test's content version, D24 key corrections and rule changes, D25 importing M4 finished sessions.
- **Content versioning:** four separate numbers (content version, storage schema, answer-key revision, checking-rules version), a compatibility check of M5 against the actual M4 contract, append-only results that record the key revision and rules version, visible rechecks after a correction, and defined behavior for missing content and invalid data (ADR-0009 §1, §4, §7). The recommendation to keep `version: 1` now rests on that compatibility check.
- **M4 import:** exact steps; an imported attempt has no result until it is first checked, nothing is invented, and the test's first try becomes "unknown".
- **"Choose TWO":** a worked example on the M4 data model (questions 22–23), the 40 scoring positions and 40-mark maximum, and the one validator rule it needs.
- **Unanswered questions:** "No answer" earns 0 marks and stays in the denominator; the review button names unanswered questions and the review sequence includes them; "Try again" covers them and says so.
- **First try:** stored, not guessed (`firstTry` in the history); defined for imports, restarts, retries, content versions and reloads; no detection when unknown; the 3-question / 2-group threshold is labeled a proposed heuristic; the wording is limited to "this test on this device".
- **Authorship:** the demo test, key and explanations are AI drafts (Claude), recorded as `aiDraft` and never described as written by a person; `reviewed` and `approved` statuses and the pre-beta review requirements are defined (D20).
- **Contract changes now named:** NOT GIVEN evidence may be empty (M4 requires at least one sentence); the "choose several" set rule; key `revision` and `review`; `fromPassage`; explanation files with a review status.
- **Design:** a result-states table, the phone, tablet and desktop review behavior, and the accessibility treatment.
- **Tasks:** M5-01 to M5-11 keep their IDs, dependencies and the M5-01 gate; their scope and acceptance criteria follow the clarifications (M5-08 unchanged).

## Canonical sources

| Part | Content | Canonical source |
|---|---|---|
| 1 | Decisions D1 to D25 | [READING_EXPERIENCE.md, Decisions for M5-01](../product/READING_EXPERIENCE.md#decisions-for-m5-01) |
| 2 | Reading specifications: content versions and M4 data, answer checking, results, review, routes, Home, Error Intelligence, targeted practice, explanations and the AI decision | [READING_EXPERIENCE.md, M5 specifications (drafts)](../product/READING_EXPERIENCE.md#m5-specifications-drafts) |
| 3 | Flows and all proposed uz/ru/en copy | [USER_FLOWS.md, Reading results and review flows (M5)](../product/USER_FLOWS.md#reading-results-and-review-flows-m5) and [Interface copy (M5)](../product/USER_FLOWS.md#interface-copy-m5) |
| 4 | Design values, result states, review layouts, accessibility | [DESIGN_SYSTEM.md, M5 components](../design/DESIGN_SYSTEM.md#m5-components-reading-results-and-review) |
| 5 | ADR-0008 (Proposed) | [0008-reading-answer-checking-and-explanations.md](../architecture/decisions/0008-reading-answer-checking-and-explanations.md) |
| 6 | ADR-0009 (Proposed) | [0009-reading-attempts-on-the-device.md](../architecture/decisions/0009-reading-attempts-on-the-device.md) |
| 7 | M5 tasks | [TASKS.json](TASKS.json) (rendered here; the JSON is canonical) |

Also changed with the proposal: [ROADMAP.md](ROADMAP.md) (M5 row), [FEATURE_MAP.md](../product/FEATURE_MAP.md) (three rows "Designing"), [ARCHITECTURE.md](../architecture/ARCHITECTURE.md) (pointers), the [ADR index](../architecture/decisions/README.md) and [PROGRESS.md](PROGRESS.md).

## Part 1. Decisions D1 to D25

### Decisions for M5-01

Every row is **open** until the owner answers it at M5-01. "Recommendation" is Claude's proposal, not a decision.

| # | Decision | Proposed behavior | Recommendation | Trade-off | Notes |
|---|---|---|---|---|---|
| D1 | Band for the uncalibrated demo test | "27 of 40 correct" and the honest line; no band and no "Estimated band", Academic or General Training | **(a) raw score only**. Alternatives: (b) an "Estimated band" from ielts.org's average marks; (c) those averages shown as background | Learners do not get the band they may want; any band from an uncalibrated test would be false precision | Sourced: tables are averages that vary by test version |
| D2 | Typed-answer normalization | NFC; case ignored; spaces trimmed and collapsed; ’ ‘ ʼ → '; U+2010/U+2011 → -; one trailing `. , ; :` ignored; nothing else | **The list as proposed**. Alternative for the trailing mark: (b) strict | Ignoring it may accept an answer IELTS would reject; strict may mark a right word wrong because the keyboard added a full stop | Trailing punctuation: **no official source** |
| D3 | Accepted variants | Every accepted answer written in full in the key and reviewed (UK/US spellings, figures and words, optional words); no fuzzy matching, nothing generated when checking | **(a)**. Alternatives: (b) parse official-style brackets and slashes; (c) fuzzy matching | Longer keys; a valid variant nobody listed is marked wrong until a key revision | Case, spelling, UK/US, figures: sourced |
| D4 | Articles and the word limit | The validator counts "a" and "the" as words, so a variant with an article must fit the limit | **(a) count them**. Alternative: (b) do not count | May reject a variant IELTS would accept | **No official source** |
| D5 | "Choose TWO" marks | 1 mark per distinct correct letter, any order, at most 2; the numbers take the marks in order; partial answers and blanks as in the worked example | **(a)**. Alternative: (b) all or nothing | Per-number outcomes are positional, not tied to a letter | Official keys: "IN EITHER ORDER", one number per letter |
| D6 | Results timing; the test link after finishing | Results at once after finishing or time-out in both modes; the test link then shows the start screen with "See your last results" | **(a)**. Alternative: (b) the test link opens the results | Changes M4's "test link shows the finished page"; one more tap to old results | |
| D7 | Where checking runs | In the browser on the results and review pages; the key is never on the test screen | **(a)** (ADR-0008). Alternative: (b) a Server Action | A determined user can read the key from those pages | No real secrecy is possible without accounts |
| D8 | Review entry and sequence | The red button names what it opens and walks every not-correct **and unanswered** question; the navigator reaches all 40 | **(a)**. Alternative: (b) Previous / Next through all 40 | Two sequences to understand ("To review: 3 of 13" shows which) | |
| D9 | The passage in review | Scrolls to the evidence on question change, instantly with reduced motion | **(a)**. Alternative: (b) never moves, as in the test | Differs from the test screen, where moving would reveal answers | |
| D10 | NOT GIVEN evidence | "Where the passage talks about this", may be empty, never proof; the explanation says what is and is not said | **(a)**. Alternative: (b) no passage reference for NOT GIVEN | A related sentence can still be misread as proof; the label and explanation address it | **Contract change:** M4 requires at least one evidence sentence |
| D11 | Status colors | Correct: green `status.correct` `#157A3C` with a check and the word; not correct: `ink` cross and the word; no answer: dash and the word | **(a)**. Alternative: (b) a dedicated "incorrect" hue | No red "wrong" that some users expect | Red stays the action color (DESIGN_SYSTEM.md) |
| D12 | Explanations and "Explain simpler" | Pre-written explanation and simpler version per question in en, ru, uz; AI-drafted, reviewed before beta; no runtime AI | **(a)**. Alternative: (b) runtime AI after an AI provider ADR | Fixed texts, not tailored; 234 texts to review for one test | AI option's open decisions listed above |
| D13 | Explanation language | Follows the interface language; switched on the results page | **(a)**. Alternative: (b) a language choice inside review | Seeing two languages side by side needs a switch | |
| D14 | Error Intelligence layers | Observable signals and content tags only; no learner-confirmed causes in M5; never infer reasoning | **(a)**. Alternative: (b) ask "What happened?" after each mistake | No "why" from the learner in M5 | |
| D15 | First try and repeated mistakes | First try stored per test; unknown after an M4 import or damaged history; a category repeats at ≥ 3 questions in ≥ 2 groups of the first try; at most two shown; scoped to "this test on this device" | **(a)**. Alternatives: (b) another threshold; (c) per-question notes only, no categories | The threshold is arbitrary and one test is little evidence; devices with M4 data get none for the demo test | **Proposed heuristic, not a validated diagnosis** |
| D16 | Targeted practice | Try again every not-correct and unanswered question of an attempt (or a card's questions), Practice only, labeled as seen before; no unseen practice | **(a)**. Alternatives: (b) also a short drill set (contract change, content work); (c) none | Repeated questions measure memory, not ability | |
| D17 | Checking during a test | None in either mode | **(a)**. Alternative: (b) "check this answer" in Practice | No instant feedback while practising | |
| D18 | Home | Unchanged | **(a)**. Alternatives: (b) a cookie pointer; (c) a quiet link | Results are reached only through the test link | |
| D19 | Attempt storage | ADR-0009: a history per test, attempts written once, results append-only with key revision and rules version, stored first-try provenance, 20 attempts kept, no reset control, an unknown schema never overwritten | **Accept ADR-0009** | Up to about 100 KB per test; clearing site data is the only reset | |
| D20 | Review status and pre-beta review | Key and explanation files carry `aiDraft` / `reviewed` / `approved`; before beta: English accuracy review of the key, questions and English explanations, fluent uz and ru review, owner approval; M5 may finish with `aiDraft`; beta checks become M11 tasks | **(a) before beta, not blocking M5**. Alternative: (b) before M5 is done | AI drafts are visible in development builds until reviewed (no interface label) | |
| D21 | Routes and navigation | `/results`, `/review`, `/retry` under the test; finishing and question changes replace the address; review and retry in the test-bar layout, results in the shell | **Approve as drafted** | Four addresses per test | |
| D22 | Date formats | No date parsing; each accepted date form is its own pre-written variant; the demo test has no date answers | **(a) variants only**. Alternative: (b) parse dates | Every accepted form must be listed; a missing one is marked wrong until a key revision | **No official source** for Reading |
| D23 | The demo test's content version | Keep `version: 1`, because M5 changes nothing the version guards; increase it if M5-02 must change a guarded part | **(a) keep**. Alternative: (b) increase it anyway | Keeping relies on the compatibility check (M5-02 tests it); increasing would drop M4 sessions without a structural reason | See Content versions and M4 data |
| D24 | Key corrections and rule changes | Each result records the key revision and rules version; a newer one triggers a recheck from the unchanged answers; a changed result is appended and shown with a note, the earlier one kept | **(a)**. Alternatives: (b) freeze the first result; (c) overwrite it; (d) increase the content version instead | Two version numbers to maintain; a learner may see a score change, with the reason | |
| D25 | M4 finished sessions | Imported once as an attempt without a result, checked at first view with a note; the test's first try becomes unknown | **(a)**. Alternatives: (b) do not import; (c) import and treat as the first try | Devices with M4 data get no repeated-mistake detection for the demo test | (c) would invent first-try provenance |

## Part 2. Reading specifications

From READING_EXPERIENCE.md; the decisions subsection is in Part 1.

### M5 specifications (drafts)

**DRAFT: awaiting owner approval (task M5-01).** Prepared 2026-10-11 during M5 planning and revised the same day after the owner's first review. Nothing here is implemented or approved; earlier discussion of the proposal is not approval of any part of it. The roadmap's draft M5 goal is not treated as a specification. Flows and step counts: [USER_FLOWS.md, Reading results and review flows (M5)](../product/USER_FLOWS.md#reading-results-and-review-flows-m5); copy: [Interface copy (M5)](../product/USER_FLOWS.md#interface-copy-m5); visual values: [DESIGN_SYSTEM.md, M5 components](../design/DESIGN_SYSTEM.md#m5-components-reading-results-and-review); data: [ADR-0008](../architecture/decisions/0008-reading-answer-checking-and-explanations.md) and [ADR-0009](../architecture/decisions/0009-reading-attempts-on-the-device.md) (Proposed). Every decision the owner is asked to make is in [Decisions for M5-01](../product/READING_EXPERIENCE.md#decisions-for-m5-01). A review snapshot of all of this is [docs/execution/M5-01-review-packet.md](M5-01-review-packet.md); these sections stay the canonical text.

**Kept from M4, not reopened:** the desktop navigator bar's content-driven height (two rows at 1280 px and up to three at 1024 px are acceptable); Previous, Next and "Mark for review" keep their text labels; the passage on screen comes first in the bar; the refused-pin message is contextual feedback above the action bar's two rows. M5 screens reuse these.

**What M4 actually does today** (inspected 2026-10-11): the answer key (`content/reading/<testId>.key.json`) has `accept` and `evidence` per question number and is validated but never loaded by the app; "choose two" items repeat the same `accept` set under both numbers (22 and 23: A, C); the NOT GIVEN entries (3, 30) point at the sentence where the passage discusses the topic, because the key validator requires at least one evidence sentence; the demo's typed answers have one accepted form each. Finishing stores the session under `reading:<testId>:finished`, and a later finish **replaces** it. Typed answers are stored as typed and trimmed when the field loses focus. The demo test, its key and its passages were drafted by Claude (AI) in M4 and have not been reviewed by a person.

**Words used here:** *pre-written* means written into the content files ahead of time (in M5 drafted by Claude and marked `aiDraft` until people review them; ADR-0008 §6), as opposed to generated when a learner asks. *First try* is defined in [Error Intelligence (M5)](../product/READING_EXPERIENCE.md#error-intelligence-m5).

#### Content versions and M4 data (M5)

**Four numbers, each guarding one thing** ([ADR-0009](../architecture/decisions/0009-reading-attempts-on-the-device.md) §1): the **content version** (`ReadingTest.version`) guards what stored answers and marks point at; the **storage schema** (`schema` in each stored envelope) guards the stored shape; the **answer-key revision** (`revision`, new in the key) guards accepted answers, evidence and tags; the **checking-rules version** (`SCORING_RULES_VERSION`, new in the checking module) guards normalization, marks and signals. Nothing else is versioned.

**Is M5 backward-compatible with M4 data?** What an M4 session depends on, checked against the M4 code (`session.ts`, `parse-session.ts`, `units.ts`, `parse-content.ts`), and what M5 changes:

| An M4 session depends on | Changed by M5? |
|---|---|
| Test id and content version (`testId`, `testVersion`) | No |
| Question numbers 1–40 and the unit keys answers are stored under ("22" for 22–23) | No |
| Option ids of every question and list (A–D, i–viii, paragraph letters A–E, TRUE/FALSE/NOT GIVEN) | No |
| Passage ids and numbers (scroll positions, the passage on screen) | No |
| Sentence ids (highlights, pins) | No |
| The session envelope `{ "schema": 1, "session" }` | No: M5 keeps it; the new `retry` field only appears in the new retry entry |
| The test file's fields | Adds optional `fromPassage` on typed groups; the M4 parser ignores unknown fields and the stored session does not refer to groups |
| The key file | Adds `revision`, `review`, optional `trap`, variants; sessions never store anything from the key |

**Recommendation (D23): keep the demo test at `version: 1`, because nothing the version guards changes**, not to avoid a migration. M5-02 checks this: if authoring the key or `fromPassage` requires changing any guarded part, the version becomes 2, and M4 sessions of that test then read as absent (ADR-0006). On devices with M4 data that means losing an unfinished session and the M4 finished entry; there are no real users before beta, so the cost is small either way.

**How a completed attempt stays tied to what judged it** (ADR-0009 §2 to §4): the attempt keeps `testVersion` and its unchanged answers; each result records `keyRevision` and `rulesVersion`. A result is shown as stored while both are current.

| Event | What happens |
|---|---|
| **Key correction** (revision increases) or a **rules change** | On the next view, the attempt is checked again from its unchanged answers. If anything differs, the new result is appended and shown with "Rechecked after a correction to the answer key or to how answers are checked. Your earlier result was 27 of 40." The earlier result is kept. If nothing differs, nothing changes (D24) |
| **Content version changed** (the attempt's content is no longer shipped) | No new check is possible: the latest stored result is shown with "This test has changed since you took it, so a detailed review is not available"; without one, "…so your answers can't be checked" |
| **Test no longer shipped** | Its attempts stay in storage, shown nowhere, not deleted by M5 |
| **Invalid stored data** | A bad attempt or result entry is ignored and removed on the next write; unreadable JSON reads as an empty history and is replaced (first try then "unknown"); a well-formed envelope with an unknown schema is never overwritten (attempts kept in memory with the notice). Never a crash (ADR-0009 §7) |

**Import of a completed M4 session** (ADR-0009 §5, D25), step by step, on the first load of any Reading page of that test:
1. Read `reading:<testId>:finished`. If it does not parse with the ADR-0006 rules or its `testVersion` is not the current one, leave it untouched and stop.
2. If an attempt with id `String(startedAt)` exists, remove the entry and stop.
3. Otherwise write, in one write: the attempt (`kind: "test"`, `importedFromM4: true`, its `mode`, `startedAt`, `finishedAt`, `finishReason`, `answers` and `pins` exactly as stored, **`results: []`**) and `firstTry: "unknown"` for the test. Then remove the entry.
4. Nothing else is created: no score, outcome, check date or first-try claim. The attempt is checked the first time its results are shown, with the then-current key and rules, and its results page says "You finished this test before the app checked answers. It was checked when you first opened these results."
5. Earlier M4 finished sessions that M4 overwrote are gone; nothing pretends otherwise. Because of them, that test's first try on the device is "unknown" ([Error Intelligence](../product/READING_EXPERIENCE.md#error-intelligence-m5)).

An **unfinished** M4 session is resumed unchanged and, when finished, recorded like any M5 attempt.

#### Answer checking (M5)

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
| **Whether articles ("a", "the") count toward the word limit** | **Not found** (D4) | Official keys mark them optional with brackets, e.g. "(the) Retailing Manager", which says nothing about counting |
| **Date formats** | **Not found** for Reading (D22); IDP articles about Listening only | n/a |
| **Surrounding punctuation** (a trailing full stop) | **Not found** (D2) | n/a |
| Changed word forms (plural, tense) are wrong | Not a blanket rule: official keys accept both forms for some items, e.g. "robot(s)" | official sample keys |
| No negative marking | Not stated on ielts.org; follows from "each correct answer receives 1 mark"; IDP: "a blank answer will get no marks" | n/a |

**Per type** (every M4 type; each question number is one scoring position worth one mark; outcome per number: `correct`, `incorrect` or `unanswered`):

| Interaction | M4 types | Correct when | Unanswered when |
|---|---|---|---|
| Choose one | TRUE/FALSE/NOT GIVEN, YES/NO/NOT GIVEN, multiple choice (one answer) | The chosen option equals the key's accepted option | Nothing chosen |
| Choose several | Multiple choice with more than one answer | See the worked example below | See below |
| Choose from a list | Matching headings, information, features, sentence endings; summary from a word box | The chosen option is one of the key's accepted options (one, unless the key accepts more) | Nothing chosen |
| Type words | Sentence, summary and note completion; short answers | The normalized answer equals one normalized accepted variant | Empty or only spaces |

**"Choose TWO", worked on the M4 data model.** Demo questions 22–23 (group `p2-g3`, `multipleChoiceMulti`, "Choose TWO letters, A–E", options A–E). In M4, `questionUnits` makes it one unit with key `"22"`, numbers `[22, 23]` and `choose` 2 (the number of its numbers; the content has no separate `choose` field). The session stores one answer under `answers["22"]`: a list of at most 2 distinct option ids; nothing is ever stored under `"23"` (the M4 session parser rejects it). The key has `"22": { "accept": ["A", "C"], … }` and the same set under `"23"`.

Rule (D5): **marks** = the number of distinct chosen options that are in the accepted set, at most `choose`. The item's numbers take the marks in order: number *i* (counting from 0) is `correct` if *i* < marks, otherwise `incorrect` if *i* < the number of chosen options, otherwise `unanswered`. The outcome is positional ("22 correct" means "the first mark was earned"), because official keys accept the letters "IN EITHER ORDER".

| Case | `answers["22"]` | Correct letters | 22 | 23 | Marks |
|---|---|---|---|---|---|
| Both correct | `["A", "C"]` | 2 | correct | correct | 2 |
| Reversed order | `["C", "A"]` | 2 | correct | correct | 2 |
| One correct, one wrong | `["A", "B"]` or `["B", "A"]` | 1 | correct | incorrect | 1 |
| No correct | `["B", "D"]` | 0 | incorrect | incorrect | 0 |
| Partial: one chosen, correct | `["C"]` | 1 | correct | unanswered | 1 |
| Partial: one chosen, wrong | `["E"]` | 0 | incorrect | unanswered | 0 |
| Nothing chosen | absent | 0 | unanswered | unanswered | 0 |
| Duplicate `["A", "A"]`, an unknown id `["A", "Z"]`, or three ids | Never stored: M4's `apply` refuses them (`isValidAnswer`), the M4 session parser reads a stored session containing them as no session, and the attempt parser (M5-04) rejects such an attempt | – | – | – | – |

Checking is also defensive: it counts each accepted option once and never gives an item more than `choose` marks, whatever it receives.

**40 positions, at most 40 marks, nothing counted twice.** The M4 validator already requires question numbers 1–40, each exactly once, in order. The demo test has 39 answer units: 38 with one number and the 22–23 item with two, so 40 scoring positions; the maximum is 38 × 1 + 1 × 2 = 40 marks (checked against the demo files on 2026-10-11). Checking walks units, not key entries, and reads an item's accepted set once, so the duplicated key entry for 23 cannot add a mark. A unit test in M5-03 asserts 40 positions and a maximum of 40 for every shipped test.

**Contract changes this needs:** one new validator rule (ADR-0008 §3): every number of a "choose several" item has the same `accept` set, with exactly `choose` distinct options. The content, the key format and the stored answer shape stay as in M4.

**Normalization of typed answers** (D2; mechanical only, everything else is decided by the accepted variants):
1. Unicode NFC.
2. Letter case is ignored (IDP, above).
3. Leading and trailing spaces removed; runs of spaces become one.
4. Typographic apostrophes and quotes (’ ‘ ʼ) become `'`; the Unicode hyphens U+2010 and U+2011 become `-` (phones insert them).
5. **No official source:** one trailing `.`, `,`, `;` or `:` is ignored, because phone keyboards add a full stop after a double space.
6. **Never** ignored or corrected: spelling (no fuzzy matching: a misspelt answer is incorrect, as in IELTS), word form, word order, missing or extra words, articles.

**Accepted variants are pre-written, in full** (D3; ADR-0008 §3). The key's `accept` list holds every accepted answer as a complete string. Where the passage allows them, the key lists: both British and American spellings; a number in figures and in words; optional words as separate full variants ("winter weather", "the winter weather") when both are right; singular and plural only when both answer the question. **Dates** (D22, no official Reading source): no date parsing; each accepted form ("24 April", "April 24", "24th April") is its own variant; the demo test has no date answers. Nothing is generated when checking. The validator rejects a variant that is empty, a duplicate after normalization, or over the word limit. Variants are reviewed with the key before beta (D20).

**Word limits.** An answer is correct only when it matches a variant, and every variant fits the limit, so an over-limit answer is never correct (as in IELTS). The validator counts words as: every space-separated part is a word, a hyphenated part is one word (verified), and where the instruction allows "AND/OR A NUMBER", one part made of digits is the number. **Articles are counted as words** (D4, no official source): a variant with an article must still fit the limit. The Practice warning keeps its separate, more lenient count (M4).

**Unanswered questions.** "No answer" is a display status of its own, never shown as "Not correct"; it earns **0 marks** and **stays in the denominator**. Unanswered questions are part of the learning flow: they are in the results breakdown, in the review sequence started from the results ([Evidence-first review](../product/READING_EXPERIENCE.md#evidence-first-review-m5)), and in "Try again" ([Targeted practice](../product/READING_EXPERIENCE.md#targeted-practice-m5)), and every one of those names them. After an Exam time-out each of them carries the note "This question had no answer when the time ran out." Only repeated-mistake detection leaves them out, because a blank says nothing about how an answer was formed.

**Score and denominators.**
- A test attempt: the raw score is the number of marks **out of 40**, whatever was answered: "27 of 40 correct", with "Not correct: 9 · No answer: 4" next to it. No percentage.
- A retry: "9 of 13 now correct", out of the retried questions (not-correct and unanswered ones alike); never shown out of 40 and never combined with the original score.
- Both are counts of correct answers on our own content, labeled as a practice score.

**Raw score is not a band** (D1). ielts.org publishes the average marks per band for official test versions and says they vary between versions; standards are fixed per version. Our demo test is original and has never been calibrated, so a band read from those averages would claim a precision we do not have. **Recommendation: no band and no "Estimated band" in M5**, for Academic or General Training; the results page says "A practice score on our own practice test. It is not an IELTS band score." Band conversion returns only with calibrated content (content sourcing, M9) and the Academic / General Training decision ([PRODUCT.md](../product/PRODUCT.md#open-questions)). INVARIANTS I-2 stays without an implementation until then.

#### When results are available (M5)

| Situation | Behavior |
|---|---|
| Practice, "Finish test" → "Finish" | The attempt is recorded (ADR-0009) and the results page opens at once |
| Exam, "Finish test" → "Finish" | The same. "Feedback after the test only" holds: nothing is checked before finishing |
| Exam, time-out with the screen open | Finishes by itself (M4) and opens the results page with "Time is up." |
| Exam, time-out while away | On the next visit the session is found finished (ADR-0006); the attempt is recorded once and the results page opens with "Time is up." |
| Reload of results or review | The same attempt and the same result (ADR-0009 §3, §4) |
| The key or the checking rules corrected since the result | Checked again; a changed result is shown with the "Rechecked…" note and the earlier score (D24) |
| An M4 finished session on the device | Imported without a result, checked when its results are first shown, with the note that it was checked later (D25) |
| Opening the test link after finishing | The start screen, with a quiet "See your last results" (D6). M4 showed the finished page there |
| Storage blocked or full | Results are computed and shown, kept in memory for the tab, with the notice |
| During a test, either mode | No checking and no explanations (D17) |

Completed attempts never change: "Start again" and retries create new attempts, and a recheck appends a result instead of replacing one (ADR-0009 §4).

#### Results page (M5)
- Address: `/{locale}/reading/{testId}/results` (the latest test attempt) or `?attempt={id}` (a specific one); inside the shell, so the header's language switcher is there.
- At 360 px, top to bottom: "Time is up." when the Exam timed out; the H1 "Your results"; the test title (English) and the mode in meta text; "27 of 40 correct" large; the honest line; "Not correct: 9 · No answer: 4"; when applicable, the "Rechecked…" or "checked later" note; the red review button; "Mistakes that repeated" ([Error Intelligence](../product/READING_EXPERIENCE.md#error-intelligence-m5)); the quiet "Try again" link (when anything was not correct or unanswered) and "Start again".
- **The red button names what it opens** (D8): "Review mistakes and unanswered questions" (both exist), "Review mistakes" (no unanswered), "Review unanswered questions" (no mistakes), "Review answers" (everything correct).
- One primary action. No band, no gauge, no chart, no celebration (honest feedback; UI_ANTI_PATTERNS.md).
- Focus moves to the H1 when the page replaces the test screen, so finishing is announced (as on the M4 finished page).

#### Evidence-first review (M5)

**Purpose:** for each question, what you answered, what was accepted, where the passage says it, and why. It covers correct answers and unanswered questions as well as mistakes.

**Phone** (`/{locale}/reading/{testId}/review`, the test-screen layout with the test bar instead of the shell header):
- **Test bar:** "Results" on the start side (back to this attempt's results), "Passage 2 of 3", no timer.
- **Passage** (`main`): read-only. The current question's evidence sentences carry an evidence chip and a dotted underline; for NOT GIVEN, "related" sentences a different chip and a dashed underline. The user's highlights and the current question's pins are shown as in the test. Sentences are not selectable (no action bar).
- **Review sheet** (the M4 sheet: collapsed, partial, expanded, the same controls to move between them). The card, in this order:
  1. "Question 5 of 40" (or "Questions 22–23") and the outcome as icon and word: "Correct", "Not correct", "No answer" (an item: "1 of 2 correct"). In the review sequence, "To review: 3 of 13".
  2. The question as in the test (English). Choice and list types: the options, read-only, with "Your answer" and "Correct answer" labels. Typed types: "Your answer" (as typed) and "Correct answer" (the first variant), plus "Also accepted" (the others). An unanswered question: "You did not answer this question." (and the time-out note when it applies).
  3. **Evidence:** "Evidence in the passage" with the evidence sentences as quotes ("Paragraph C", "Show in passage"). NOT GIVEN: "Where the passage talks about this" (see below).
  4. **Why:** the explanation in the interface language, then "Explain simpler" (a disclosure: the simpler text follows the button).
  5. **Your evidence** (Practice attempts with pins): the pinned quotes and one sentence comparing them with the evidence.
  6. **Notes:** the question's observable signals, one sentence each ([Error Intelligence](../product/READING_EXPERIENCE.md#error-intelligence-m5)).
  7. Footer: Previous and Next (within the sequence); "All questions" in the header opens the navigator with outcome badges.
- **The passage follows the review** (D9): changing question scrolls the passage so the first evidence (or related) sentence is in view above the sheet, instantly with reduced motion. This differs on purpose from the test, where the passage never moves (M4: it would reveal where answers are).
- **Sequences** (D8): the red button on the results page opens the first question that is not correct **or unanswered**, and Previous / Next move through exactly those questions, in number order; "To review: 3 of 13" counts them all. Choosing any number in the navigator (including a correct one) switches to all 40 in order. "Review answers" (everything correct) uses all 40.

**Desktop** (from 1024 px): the test bar; the passage column (55%) with the same marks; the question column (45%) with the review card of the current question only (review cards are long, unlike the test's answer controls); the M4 navigator bar with outcome badges, Previous and Next, keeping its approved content-driven height and text labels. Tablet (600–1023 px) keeps the phone layout.

**Exam attempts** are reviewed the same way; they have no pins, so "Your evidence" is absent.

**NOT GIVEN without fabricated proof** (D10):
- The key's evidence for a NOT GIVEN answer marks where the passage deals with the statement's topic, presented as "Where the passage talks about this", never as proof. It may be empty (a contract change: M4's validator requires at least one sentence).
- The explanation says what the passage does say about the topic and which part of the statement it does not cover (for question 3: the passage describes how people use shared bicycles but never says who most of the users are). It never invents or paraphrases a sentence as if the passage contained it.
- With pins: "The answer is NOT GIVEN, so no sentence proves it."

**Languages:** the passage, the question, the options, the answer words (TRUE, NOT GIVEN), the user's typed answer and the accepted answers are English test content with `lang="en"`. The labels, notes, tips, the explanation and its simpler version are in the interface language; English quotes inside an explanation are `lang="en"` spans (ADR-0008 §5). Answer words are never translated. The explanation follows the interface language (D13); the language is switched on the results page, which has the shell header.

**Focus and keyboard:** on opening and on every question change, focus moves to the card's heading (as in M4). "Show in passage" scrolls to the sentence and moves focus to it. "Explain simpler" keeps focus and toggles `aria-expanded`. Escape closes the navigator and returns focus to "All questions". The passage stays one Tab stop for reading.

**Empty and error states:** no attempt on this device, or an unknown attempt id → "No results on this device yet" with the red "Start the test"; an attempt from an earlier content version → its stored score, "This test has changed since you took it, so a detailed review is not available"; an unknown question number → the first question of the sequence; storage blocked → the in-memory attempt with the notice (a reload leads to the empty state); unknown test → not-found; offline after loading → works.

#### Routes and navigation (M5)

Proposed for approval separately (D21). All pages are prerendered per test and locale; the attempt data comes from the device.

| Address | Shows | Frame |
|---|---|---|
| `/{locale}/reading/{testId}` | The start screen (with "See your last results" when an attempt exists) or the session in progress, as in M4. After finishing it **replaces** itself with the results page, so Back does not return to a finished test | Test bar |
| `/{locale}/reading/{testId}/results[?attempt={id}]` | Results of the latest test attempt, or of the given attempt (a retry, an earlier attempt) | Shell |
| `/{locale}/reading/{testId}/review?attempt={id}&q={n}&set={mistakes\|all}` | The review (`mistakes` = not correct and unanswered). Moving between questions replaces the address, so Back leaves the review instead of stepping through 40 questions | Test bar |
| `/{locale}/reading/{testId}/retry?of={id}&q={numbers}` | A retry of the given questions of that attempt (Practice) | Test bar |

- Attempt ids are the attempt's start time (ADR-0009); invalid parameters fall back as in the empty states.
- The level check and onboarding are not involved: a direct link still bypasses onboarding (USER_FLOWS.md).

#### Home in M5

Proposed for approval separately (D18). Options:
- (a) **No change** (recommended): Reading stays reachable by its direct link (M4 decision), the level check stays the next action (rule 1), and home, rendered on the server from the goal cookie, cannot read the device's attempts (ADR-0006 §4). Next-action rules that use history belong to M8.
- (b) A small cookie pointer (ADR-0006 §4) so home's next action becomes "Continue your Reading test" or "Review your Reading mistakes": needs new next-action rules and a check against ADR-0003's "small preferences only".
- (c) A quiet "Your last Reading result" link on home: a second action competing with the level check.

#### Error Intelligence (M5)

**Three layers, never mixed** (D14):

| Layer | Who decides it | May say | Example |
|---|---|---|---|
| **Observable signals** | Computed from the answer, the key, the test and the learner's own pins | What happened | "You chose NOT GIVEN. The passage says the opposite of the statement, so the answer is FALSE." |
| **Content tags** (`trap` in the key) | Pre-written with the key (in M5 drafted by Claude, reviewed before beta) | What the question tests | Question 4 is tagged `qualifier` ("every trip" against "a small fee") |
| **Learner-confirmed causes** | Only the learner | Why it happened, in the learner's words | Not in M5: nothing in M5 states a cause |

Nothing infers the learner's reasoning from an incorrect answer alone. Never: "You don't understand NOT GIVEN", "You read too fast", "Your vocabulary is weak", "You guessed".

**Observable signals** (per question; unanswered questions have none except the time-out note):

| Signal | Detection rule | Example (demo test) |
|---|---|---|
| `ngInsteadOfFalse` | Statement types; key FALSE or NO; answer NOT GIVEN | Question 4 (key FALSE: the passage says later schemes "charged a small fee") answered NOT GIVEN |
| `falseInsteadOfNg` | Key NOT GIVEN; answer FALSE or NO | Question 3 ("Most people who use shared bicycles are students"; key NOT GIVEN) answered FALSE |
| `ngInsteadOfTrue` | Key TRUE or YES; answer NOT GIVEN | Question 1 (key TRUE: "children rode to school") answered NOT GIVEN |
| `trueInsteadOfNg` | Key NOT GIVEN; answer TRUE or YES | Question 30 ("Teachers should be paid extra…"; key NOT GIVEN) answered YES |
| `spelling` | Typed; incorrect; the normalized answer is exactly one letter added, missing or changed from a normalized accepted variant of at least 4 letters | Question 11 "pavments" (accepted "pavements") |
| `wordLimit` | Typed; incorrect; more words than the limit by the validator's count | Question 9 "cleaner air" (ONE WORD ONLY; accepted "air") |
| `notFromPassage` | Typed, in a group with `fromPassage`; incorrect; a word of the answer (letters only, case ignored) does not occur in the question's passage | Question 7 "mobile" (the passage says "phone") |
| `timeUp` | Unanswered, in an Exam attempt finished by time-out | Questions 38–40 empty when the time ran out |
| `pinnedElsewhere` | Practice; incorrect; the question has pins; its key is not NOT GIVEN and has evidence; no pin is an evidence sentence | Question 5: pinned "Short car journeys are replaced…", answered A; the evidence is the next sentence |

**Repeated-mistake categories** (at most 8):

| Category | Counts | Out of ("of N") |
|---|---|---|
| NOT GIVEN mixed up with FALSE or NO | `ngInsteadOfFalse`, `falseInsteadOfNg` | Answered statement questions whose key is NOT GIVEN, FALSE or NO |
| NOT GIVEN mixed up with TRUE or YES | `ngInsteadOfTrue`, `trueInsteadOfNg` | Answered statement questions whose key is NOT GIVEN, TRUE or YES |
| Spelling | `spelling` | Answered typed questions |
| Too many words | `wordLimit` | Answered typed questions |
| Words not from the passage | `notFromPassage` | Answered typed questions in `fromPassage` groups |
| The evidence was in another sentence | `pinnedElsewhere` | Practice questions with pins whose key has evidence and is not NOT GIVEN |
| The same idea in other words (content tag) | Incorrect on questions tagged `paraphrase` | Answered questions tagged `paraphrase` |
| Small words that change the meaning (content tag) | Incorrect on questions tagged `qualifier` | Answered questions tagged `qualifier` |

Unanswered questions belong to no category (see [Answer checking](../product/READING_EXPERIENCE.md#answer-checking-m5), Unanswered questions).

**Content tags** (optional, one per question, only where true): `paraphrase` (the question expresses the passage's idea in different words) and `qualifier` (the answer turns on a limiting word such as all, most, only, every, never). The demo key gets them where they apply (M5-02); a category with fewer than 3 tagged questions in a test simply cannot appear.

**The first try, precisely** (D15, ADR-0009 §6). Repeated mistakes use only the first try at a test, because after the first review the learner has seen every answer. The first try is stored, never guessed:

| Situation | First try for that test |
|---|---|
| The first test attempt recorded on a device with no history for that test | That attempt |
| An unfinished M4 session finished under M5, with no M4 finished entry on the device | That attempt (no finished session ever existed there, or the data was cleared) |
| An M4 finished session imported | **Unknown** (M4 kept only the latest finished session) |
| "Start again", any later test attempt | Not the first try |
| A retry | Never |
| Practice or Exam | Either can be the first try |
| A reload, a second tab, a time-out noticed on load | The same attempt (one id), counted once |
| A new content version of the test | Still the same test; the first try does not change |
| The history unreadable and rewritten, or the named attempt missing | **Unknown** |
| Another browser or device, or site data cleared | Cannot be known; the copy says "on this device" |

**Repeated exposure is excluded** by construction: only the first try's latest result is evidence, so each question counts at most once; later attempts and retries are never evidence; duplicates cannot arise (one attempt per session id).

**When the first try is unknown:** no repeated-mistake detection for that test, and the results page says "We can't tell which was your first try at this test on this device, so we don't look for repeated mistakes in it." Each question's own notes still appear in review, because they describe only that attempt.

**When a mistake counts as repeated** (D15; a **proposed product heuristic, not a validated diagnosis**): the same category on **at least 3 different questions** from **at least 2 different question groups** of the first try (one group shares one instruction, so a single group could reflect one misread instruction). The numbers are a starting point to be checked against real use (M8); the copy never calls the result a diagnosis or a weakness.

**What the learner sees** (only on a test attempt's results, never on a retry's):
- Up to two categories, most occurrences first (ties in table order), each with its count out of its opportunities and the question numbers ("3 of 5 questions whose answer was NOT GIVEN, FALSE or NO (questions 2, 3, 30)"), one tip, and "Practise these questions again".
- The scope, in words the evidence supports: on the first try itself, "In this try at this test. One test is not enough to show a lasting weakness."; on a later attempt, "From your first try at this test on this device, because after that you had seen the answers. One test is not enough to show a lasting weakness."
- No repeated category: "No kind of mistake repeated on 3 or more questions in your first try at this test." Single occurrences stay as notes on their questions in review.
- With one demo test, nothing claims a pattern across tests, a lasting weakness, improvement, a level or a band. Evidence across tests and rates (for example "at least a third of the opportunities") belong to M8.

**Feedback the content can support:** the per-question explanation (pre-written), the observable note, and per category one fixed tip (catalog copy) that restates the test's own instruction or a verified rule: what FALSE and NOT GIVEN mean (the instruction's wording), that misspelt answers and answers over the limit lose the mark (verified above), that "from the passage" means the passage's words, where the evidence was (review), and to compare the question's words with the evidence (paraphrase) or check limiting words (qualifier). The only action offered is to practise those same questions again, labeled as seen before.

#### Targeted practice (M5)

**Recommended scope (D16): try known mistakes and unanswered questions again; no unseen practice in M5.**
- **What it is:** a Practice session on the same test with only the chosen questions: **every question of an attempt that was not correct or unanswered**, or the questions of a repeated-mistake card. The results link says so ("Try 13 questions again: not correct or no answer"). Answers start empty; no timer; Pin Evidence available; the navigator and Previous / Next show only those questions; "Finish test" and its confirmation as in M4. The header adds "3 of 13 to practise".
- **Results:** "Your second try": "9 of 13 now correct" (unanswered ones count in the 13) and "You had already seen these questions and their answers, so this shows what you remember from the review. It does not measure your level." Then the review button (as on the results page) and "Back to your test results".
- **What it is not:** independent evidence of ability (never counted in repeated mistakes, never shown out of 40, never combined with the original score, never called improvement); a new test; a content library.
- **Unseen practice** (new questions on a weak point) needs new content: only one demo test exists, and adding content sets is content sourcing (M9). A short original drill set would also need the content contract to allow tests shorter than 3 passages and 40 questions (ADR-0005). Not in M5.
- One retry in progress per test, kept apart from the test's session (ADR-0009 §5): the same retry link resumes it; starting a different retry replaces an unfinished one.

#### Explanations and the AI decision (M5)

**Recommended for owner review (D12): pre-written explanations and simpler versions in uz, ru and en, without runtime AI.** This is a recommendation awaiting the owner's decision, not a decision.

**Who writes them, and their status** (ADR-0008 §6). In M5 the explanations, like the demo test and key from M4, are **drafted by Claude (AI)** in a worker task (M5-05). They are recorded as `aiDraft` and are never described as written by a person. Each key file and each explanation file carries one review status:

| Status | Meaning | Set by |
|---|---|---|
| `aiDraft` | Drafted by Claude; no person has checked it | The worker task that drafts it |
| `reviewed` | A person has checked it as described below; the review is recorded in PROGRESS.md (reviewer's role, date, what was checked, what changed) | A worker, on the owner's instruction after the review |
| `approved` | The owner approves it for release | The owner |

**Before beta** (D20), every Reading key and explanation file must be `approved`, after:
1. **English answer accuracy:** a person with strong English and IELTS Reading knowledge, not the drafting AI, checks every accepted answer and variant against the passage, every evidence sentence, every NOT GIVEN judgment, every content tag, and the questions and passages as far as they affect the answers.
2. **English explanations:** the same reviewer checks each explanation and simpler version: grounded only in the passage, accurate, plain, and the simpler one saying the same thing more simply.
3. **uz and ru:** fluent speakers check every explanation and simpler version against the English: same meaning, plain language, consistent terms, English quotes untouched, Uzbek orthography (U+02BB, U+02BC) ([LOCALIZATION.md](../product/LOCALIZATION.md), rule 7). Not raw machine translation.
4. **Owner approval.**

M5 may finish with `aiDraft` files: nothing is released to real users before beta. The status is not shown in the interface in M5. On approval of D20, the beta checks become M11 tasks.

**Authoring rules** (for the drafts and for any later author):
- One explanation and one simpler version per question unit (a "choose several" item once), in each of en, ru and uz, in the per-locale content files (ADR-0008 §5).
- **Grounded only in the passage, the question and the key:** name the words of the evidence and the question words they match (the paraphrase); for choice and list types, say briefly why a tempting wrong option does not fit when that helps. No facts from outside the passage.
- **NOT GIVEN:** what the passage says about the topic and what it does not say, as above. Never an invented sentence.
- **Simpler:** the same reasoning in at most two short sentences, everyday words, no grammar terms. Limits enforced by the validator: explanation at most 450 characters, simpler at most 250 characters and shorter than the explanation, per locale.
- English quotes at most 8 words, as `en` segments.
- English first, then ru and uz from the reviewed English.

**Limitations of the recommendation:** fixed texts that cannot answer follow-up questions; not tailored to an arbitrary typed answer (the observable notes cover the common cases); one "simpler" level; about six texts per question (234 for the demo test's 39 units) to draft and review, growing with every new test; quality depends on the reviewers.

**The AI alternative:** generating the simpler or a tailored explanation at runtime. It needs an **AI provider ADR first** (ARCHITECTURE.md lists "AI provider and evaluation pipeline" as TBD), deciding at least:
- **Provider and model**, and where calls run (the API, never the browser; keys as secrets, AUTONOMOUS_WORKFLOW hard limits).
- **Grounding:** inputs limited to the question, the key, the evidence sentences and the reviewed explanation; the output may quote only passage text that exists, checked after generation; nothing outside the passage.
- **Privacy:** what is sent (the typed answer at most, no identifiers), data residency for Uzbekistan, minors, retention at the provider.
- **Failure behavior:** fall back to the pre-written text; a timeout budget; no blank card.
- **Latency** on weak mobile connections, and **cost** per call; since explanations are per question, not per learner, generating them once per question and locale and caching them (or at authoring time) gives most of the value.
- **Quality** of Uzbek and Russian output, an evaluation set, and the honest label of AI-written text.
No provider is chosen and no AI infrastructure is added in M5 unless the owner chooses this option, and then only after that ADR is accepted.

## Part 3. Flows and interface copy

From USER_FLOWS.md.

### Reading results and review flows (M5)

**DRAFT: awaiting owner approval (task M5-01).** Prepared 2026-10-11 during M5 planning and revised the same day after the owner's first review; not approved. The screens are specified in [READING_EXPERIENCE.md, M5 specifications](../product/READING_EXPERIENCE.md#m5-specifications-drafts), the visual values in [DESIGN_SYSTEM.md, M5 components](../design/DESIGN_SYSTEM.md#m5-components-reading-results-and-review), the data in ADR-0008 and ADR-0009 (Proposed). The copy is in [Interface copy (M5)](../product/USER_FLOWS.md#interface-copy-m5). Steps count from the M4 reading screen; Reading is still reached by its direct link (M4), and home is unchanged unless the owner decides otherwise (READING_EXPERIENCE.md, Home in M5).

#### Finish → results
- **Goal:** right after finishing, the learner sees how many answers were correct and what to do next.
- **Entry point:** "Finish test" in Practice or Exam (M4), or the Exam time-out.
- **Primary action:** on the results page, the red review button, whose text names what it opens: "Review mistakes and unanswered questions", "Review mistakes", "Review unanswered questions" or "Review answers".
- **Steps:** 1. "Finish test" → the confirmation (M4). 2. "Finish" → the results page (`/{locale}/reading/{testId}/results`): "27 of 40 correct", the honest line, "Not correct: 9 · No answer: 4", the red review button, "Mistakes that repeated", and the quiet "Try 13 questions again: not correct or no answer" and "Start again".
- **Step count:** 2, as in M4. An Exam time-out shows the results page with "Time is up." without any step.
- **Empty / error states:** no finished attempt on this device (for example a shared results link) → "No results on this device yet" with the red "Start the test". Results cannot be saved → the notice, results still shown. An attempt from an earlier content version → its stored score and "This test has changed since you took it…". A result rechecked after a key or rules correction → the new result with the "Rechecked…" note and the earlier score. An imported M4 attempt → the note that it was checked later. Unknown test → not-found. Offline after loading → works; opening offline → the M1 error state.
- **Languages checked:** not yet (M5-06: the Russian score line and honest line at 320 px).

#### Results → understand a mistake
- **Goal:** for each mistake and each unanswered question, see the answer, where it comes from in the passage, and why.
- **Entry point:** the red review button on the results page.
- **Primary action:** reading the review card; moving on with "Next".
- **Steps:** 1. The red review button → the review screen at the first question that is not correct or has no answer: the passage with that question's evidence marked and in view, and the review card (outcome, your answer or "You did not answer this question.", correct answer, evidence, why). 2. "Next" → the next question that is not correct or has no answer ("To review: 2 of 13" counts both kinds). Optional: "Explain simpler" (1), "Show in passage" (1), "All questions" then a number (2) to see any question, including correct ones.
- **Step count:** 1 from results to the first explanation; 3 from the last test question (finish, confirm, review).
- **Unanswered questions** are never skipped: they are in the sequence, named on the button and shown as "No answer" (not "Not correct").
- **Empty / error states:** all answers correct → the button reads "Review answers" and opens question 1. A question number or attempt not on this device → as above. Review of an attempt from an earlier content version → not available, with the score kept.
- **Languages checked:** not yet (M5-07: the longest outcome, the Russian evidence heading and "Explain simpler" at 320 px; M5-08 at 1024 px).

#### Explain simpler
- **Steps:** 1. "Explain simpler" under the explanation → the simpler version appears right after the button, in the interface language; the button becomes "Hide the simpler explanation".
- **Step count:** 1. Available for every question in Practice and Exam attempts (review happens after the test, so Exam's "no help" rule is kept).

#### Try your mistakes and unanswered questions again
- **Goal:** answer once more, without seeing the answers, every question you got wrong or left unanswered, and see how many you now get right.
- **Entry point:** "Try 13 questions again: not correct or no answer" on the results page, or "Practise these questions again" on a repeated-mistake card.
- **Primary action:** answering, then "Finish".
- **Steps:** 1. Tap the link → the reading screen in Practice with only those questions, answers empty (no start screen: the mode is fixed). 2. Answer and move as in M4. 3. "Finish test", "Finish" → the retry's results: "9 of 13 now correct" (the 13 include the unanswered ones), the honest retry line, the review button, "Back to your test results".
- **Step count:** 1 to start.
- **Empty / error states:** nothing not correct or unanswered → the link is not shown. An unfinished retry of the same questions → resumed. Starting a different retry replaces an unfinished one.
- **Languages checked:** not yet (M5-09).

#### Come back to results later
- **Steps:** 1. Open the test link → the start screen (M4) with a quiet "See your last results" under "Start", when this device has a finished attempt. 2. Tap it → the results page of the latest test attempt.
- **Step count:** 2. (In M4 the test link showed the finished page instead; see READING_EXPERIENCE.md, Routes and navigation (M5).)

### Interface copy (M5)

**PROPOSED, awaiting owner approval (task M5-01).** Interface strings only. Test content (passages, questions, options, TRUE/FALSE/NOT GIVEN, typed and accepted answers) stays in English from the content. Explanations and their simpler versions are per-test content files, not catalog strings (ADR-0008). `<en>…</en>` marks English answer words inside a localized string, rendered with `lang="en"`. Uzbek uses U+02BB for oʻ and gʻ and U+02BC for the tutuq belgisi. A fluent-speaker review of uz and ru is required before beta, as for M1 to M4. Keys are suggestions.

| Key (suggested) | Used in | en | ru | uz |
|---|---|---|---|---|
| `reading.results.title` | Results H1 and page title | Your results | Ваши результаты | Natijalaringiz |
| `reading.results.score` | Score line | {score} of {total} correct | Верно: {score} из {total} | {total} tadan {score} tasi toʻgʻri |
| `reading.results.honest` | Under the score | A practice score on our own practice test. It is not an IELTS band score. | Это результат практики на нашем собственном тесте, а не балл IELTS. | Bu oʻz mashq testimizdagi natija, IELTS bali emas. |
| `reading.results.breakdown` | Under the honest line | Not correct: {incorrect} · No answer: {unanswered} | Неверно: {incorrect} · Без ответа: {unanswered} | Notoʻgʻri: {incorrect} · Javobsiz: {unanswered} |
| `reading.results.reviewMistakesAndUnanswered` | Results, red, when there are mistakes and unanswered questions | Review mistakes and unanswered questions | Разобрать ошибки и вопросы без ответа | Xatolar va javobsiz savollarni koʻrib chiqish |
| `reading.results.reviewMistakes` | Results, red, mistakes but no unanswered questions | Review mistakes | Разобрать ошибки | Xatolarni koʻrib chiqish |
| `reading.results.reviewUnanswered` | Results, red, unanswered questions but no mistakes | Review unanswered questions | Разобрать вопросы без ответа | Javobsiz savollarni koʻrib chiqish |
| `reading.results.reviewAll` | Results, red, when everything is correct | Review answers | Посмотреть ответы | Javoblarni koʻrib chiqish |
| `reading.results.tryAgain` | Results, quiet; `{count}` = not correct + no answer | {count, plural, one {Try # question again: not correct or no answer} other {Try # questions again: not correct or no answer}} | {count, plural, one {Ответить ещё раз на # вопрос с ошибкой или без ответа} few {Ответить ещё раз на # вопроса с ошибкой или без ответа} many {Ответить ещё раз на # вопросов с ошибкой или без ответа} other {Ответить ещё раз на # вопроса с ошибкой или без ответа}} | Xato yoki javobsiz {count} ta savolga qayta javob berish |
| `reading.results.rechecked` | Results, after a key or rules correction | Rechecked after a correction to the answer key or to how answers are checked. Your earlier result was {score} of {total}. | Перепроверено после исправления ключа ответов или правил проверки. Прежний результат: {score} из {total}. | Javoblar kaliti yoki tekshirish qoidalari tuzatilgandan keyin qayta tekshirildi. Oldingi natija: {total} tadan {score}. |
| `reading.results.importedFromM4` | Results of an attempt imported from M4 | You finished this test before the app checked answers. It was checked when you first opened these results. | Вы завершили этот тест, когда приложение ещё не проверяло ответы. Он проверен, когда вы впервые открыли эти результаты. | Siz bu testni ilova javoblarni tekshirmagan paytda yakunlagansiz. U natijalarni birinchi marta ochganingizda tekshirildi. |
| `reading.results.storageUnavailable` | Notice on results and review | Your results can't be saved on this device. They will be lost if you close or reload this page. | Результаты не сохраняются на этом устройстве. Они пропадут, если закрыть или обновить страницу. | Natijalar bu qurilmada saqlanmaydi. Sahifani yopsangiz yoki yangilasangiz, ular yoʻqoladi. |
| `reading.results.none.title` | No attempt on this device | No results on this device yet | На этом устройстве пока нет результатов | Bu qurilmada hali natijalar yoʻq |
| `reading.results.none.body` | No attempt on this device | Results appear here after you finish the test on this device. | Результаты появятся здесь, когда вы завершите тест на этом устройстве. | Testni shu qurilmada yakunlaganingizdan soʻng natijalar shu yerda chiqadi. |
| `reading.results.none.start` | No attempt, red | Start the test | Начать тест | Testni boshlash |
| `reading.results.oldVersion` | Attempt from an earlier content version | This test has changed since you took it, so a detailed review is not available. | Тест изменился после вашей попытки, поэтому подробный разбор недоступен. | Siz topshirganingizdan keyin test oʻzgargan, shuning uchun batafsil tahlil mavjud emas. |
| `reading.results.cannotCheck` | Unchecked attempt from an earlier version | This test has changed since you took it, so your answers can't be checked. | Тест изменился после вашей попытки, поэтому ответы нельзя проверить. | Siz topshirganingizdan keyin test oʻzgargan, shuning uchun javoblarni tekshirib boʻlmaydi. |
| `reading.lastResults` | Start screen, quiet, when an attempt exists | See your last results | Посмотреть последние результаты | Oxirgi natijalarni koʻrish |
| `reading.review.toResults` | Review test bar (start side) | Results | Результаты | Natijalar |
| `reading.review.correct` | Outcome | Correct | Верно | Toʻgʻri |
| `reading.review.incorrect` | Outcome | Not correct | Неверно | Notoʻgʻri |
| `reading.review.unanswered` | Outcome | No answer | Нет ответа | Javob yoʻq |
| `reading.review.partly` | Outcome of a "choose several" item | {correct} of {total} correct | Верно {correct} из {total} | {total} tadan {correct} tasi toʻgʻri |
| `reading.review.yourAnswer` | Answer label | Your answer | Ваш ответ | Sizning javobingiz |
| `reading.review.correctAnswer` | Answer label | Correct answer | Правильный ответ | Toʻgʻri javob |
| `reading.review.alsoAccepted` | Answer label | Also accepted | Также засчитывается | Bu ham qabul qilinadi |
| `reading.review.noAnswerGiven` | Typed answer left empty | You did not answer this question. | Вы не ответили на этот вопрос. | Bu savolga javob bermagansiz. |
| `reading.review.evidenceTitle` | Evidence block | Evidence in the passage | Подтверждение в тексте | Matndagi dalil |
| `reading.review.relatedTitle` | Evidence block for NOT GIVEN | Where the passage talks about this | Где в тексте говорится об этом | Matnda bu haqda soʻz boradigan joy |
| `reading.review.why` | Explanation heading | Why | Почему | Nima uchun |
| `reading.review.simpler` | Disclosure button | Explain simpler | Объяснить проще | Soddaroq tushuntirish |
| `reading.review.simplerHide` | Disclosure button, open | Hide the simpler explanation | Скрыть простое объяснение | Sodda tushuntirishni yashirish |
| `reading.review.simplerTitle` | Before the simpler text | In simple words | Простыми словами | Oddiy soʻzlar bilan |
| `reading.review.pinMatch` | Under "Your evidence" | You pinned the evidence sentence. | Вы закрепили предложение с подтверждением. | Siz dalil boʻlgan gapni biriktirgansiz. |
| `reading.review.pinMiss` | Under "Your evidence" | The evidence is in a different sentence from the one you pinned. | Подтверждение в другом предложении, не в том, что вы закрепили. | Dalil siz biriktirgan gapda emas, boshqa gapda. |
| `reading.review.pinNotGiven` | Under "Your evidence", NOT GIVEN | The answer is <en>NOT GIVEN</en>, so no sentence proves it. | Ответ: <en>NOT GIVEN</en>, поэтому ни одно предложение его не доказывает. | Javob: <en>NOT GIVEN</en>, shuning uchun uni hech bir gap isbotlamaydi. |
| `reading.review.toReview` | Under the review heading in the mistakes sequence | To review: {current} of {total} | Разбор: {current} из {total} | Tahlil: {total} tadan {current} |
| `reading.review.evidenceMarker` | Accessible name of an evidence chip | Evidence for question {number} | Подтверждение к вопросу {number} | {number}-savol uchun dalil |
| `reading.review.relatedMarker` | Accessible name of a "related" chip | Related to question {number} | Относится к вопросу {number} | {number}-savolga tegishli |
| `reading.navigator.correct` | Navigator state word in review | correct | верно | toʻgʻri |
| `reading.navigator.incorrect` | Navigator state word in review | not correct | неверно | notoʻgʻri |
| `reading.signals.ngInsteadOfFalse` | Note; `{answer}` is FALSE or NO | You chose <en>NOT GIVEN</en>. The passage says the opposite of the statement, so the answer is <en>{answer}</en>. | Вы выбрали <en>NOT GIVEN</en>. В тексте сказано противоположное, поэтому ответ: <en>{answer}</en>. | Siz <en>NOT GIVEN</en> ni tanladingiz. Matnda buning aksi aytilgan, shuning uchun javob: <en>{answer}</en>. |
| `reading.signals.falseInsteadOfNg` | Note; `{answer}` is FALSE or NO | You chose <en>{answer}</en>. The passage does not say whether this is so, so the answer is <en>NOT GIVEN</en>. | Вы выбрали <en>{answer}</en>. В тексте не сказано, так это или нет, поэтому ответ: <en>NOT GIVEN</en>. | Siz <en>{answer}</en> ni tanladingiz. Matnda bu shundaymi yoki yoʻqmi aytilmagan, shuning uchun javob: <en>NOT GIVEN</en>. |
| `reading.signals.ngInsteadOfTrue` | Note; `{answer}` is TRUE or YES | You chose <en>NOT GIVEN</en>. The passage does say this, so the answer is <en>{answer}</en>. | Вы выбрали <en>NOT GIVEN</en>. В тексте это сказано, поэтому ответ: <en>{answer}</en>. | Siz <en>NOT GIVEN</en> ni tanladingiz. Matnda bu aytilgan, shuning uchun javob: <en>{answer}</en>. |
| `reading.signals.trueInsteadOfNg` | Note; `{answer}` is TRUE or YES | You chose <en>{answer}</en>. The passage does not say this, so the answer is <en>NOT GIVEN</en>. | Вы выбрали <en>{answer}</en>. В тексте этого не сказано, поэтому ответ: <en>NOT GIVEN</en>. | Siz <en>{answer}</en> ni tanladingiz. Matnda bu aytilmagan, shuning uchun javob: <en>NOT GIVEN</en>. |
| `reading.signals.spelling` | Note | Your answer differs from the correct answer by one letter. | Ваш ответ отличается от правильного одной буквой. | Javobingiz toʻgʻri javobdan bitta harf bilan farq qiladi. |
| `reading.signals.wordLimit` | Note | Your answer has more words than the instruction allows. | В вашем ответе больше слов, чем разрешает задание. | Javobingizda topshiriq ruxsat berganidan koʻproq soʻz bor. |
| `reading.signals.notFromPassage` | Note | Your answer uses a word that is not in the passage. This task asks for words from the passage. | В ответе есть слово, которого нет в тексте. В этом задании нужны слова из текста. | Javobingizda matnda yoʻq soʻz bor. Bu topshiriqda matndagi soʻzlar kerak. |
| `reading.signals.timeUp` | Note on unanswered questions of a timed-out Exam | This question had no answer when the time ran out. | Когда время закончилось, на этот вопрос не было ответа. | Vaqt tugaganda bu savolga javob berilmagan edi. |
| `reading.patterns.title` | Results section heading | Mistakes that repeated | Повторившиеся ошибки | Takrorlangan xatolar |
| `reading.patterns.scopeThisTry` | Under the heading, on the first try's results | In this try at this test. One test is not enough to show a lasting weakness. | В этой попытке этого теста. Одного теста мало, чтобы говорить о постоянной слабости. | Shu testdagi shu urinishda. Doimiy zaif tomonni koʻrsatish uchun bitta test yetarli emas. |
| `reading.patterns.scopeFirstTry` | Under the heading, on a later attempt's results | From your first try at this test on this device, because after that you had seen the answers. One test is not enough to show a lasting weakness. | По вашей первой попытке этого теста на этом устройстве: после неё вы уже видели ответы. Одного теста мало, чтобы говорить о постоянной слабости. | Shu qurilmadagi bu testning birinchi urinishingiz boʻyicha, chunki undan keyin javoblarni koʻrgansiz. Doimiy zaif tomonni koʻrsatish uchun bitta test yetarli emas. |
| `reading.patterns.none` | No repeated category | No kind of mistake repeated on 3 or more questions in your first try at this test. | В первой попытке этого теста ни одна ошибка не повторилась в 3 или более вопросах. | Bu testdagi birinchi urinishingizda hech bir xato 3 yoki undan koʻp savolda takrorlanmadi. |
| `reading.patterns.unknownFirstTry` | First try unknown (M4 import, damaged history) | We can't tell which was your first try at this test on this device, so we don't look for repeated mistakes in it. | Мы не знаем, какая попытка этого теста на этом устройстве была первой, поэтому не ищем в нём повторяющиеся ошибки. | Bu qurilmada bu testning qaysi urinishi birinchi boʻlganini bilmaymiz, shuning uchun undagi takrorlangan xatolarni qidirmaymiz. |
| `reading.patterns.practise` | Pattern card, quiet | Practise these questions again | Повторить эти вопросы | Bu savollarni qayta ishlash |
| `reading.patterns.ngFalse.title` | Pattern card | <en>NOT GIVEN</en> mixed up with <en>FALSE</en> or <en>NO</en> | <en>NOT GIVEN</en> путается с <en>FALSE</en> или <en>NO</en> | <en>NOT GIVEN</en> bilan <en>FALSE</en> yoki <en>NO</en> adashtirilgan |
| `reading.patterns.ngFalse.count` | Pattern card | {count} of {total} questions whose answer was <en>NOT GIVEN</en>, <en>FALSE</en> or <en>NO</en> (questions {numbers}) | {count} из {total, plural, one {# вопроса} other {# вопросов}} с ответом <en>NOT GIVEN</en>, <en>FALSE</en> или <en>NO</en> (вопросы {numbers}) | Javobi <en>NOT GIVEN</en>, <en>FALSE</en> yoki <en>NO</en> boʻlgan {total} ta savoldan {count} tasi ({numbers}-savollar) |
| `reading.patterns.ngFalse.tip` | Pattern card | <en>FALSE</en> means the passage says the opposite. <en>NOT GIVEN</en> means the passage does not say. Before you choose <en>FALSE</en>, find the sentence that contradicts the statement. | <en>FALSE</en>: в тексте сказано противоположное. <en>NOT GIVEN</en>: в тексте об этом не сказано. Прежде чем выбрать <en>FALSE</en>, найдите предложение, которое противоречит утверждению. | <en>FALSE</en>: matnda buning aksi aytilgan. <en>NOT GIVEN</en>: matnda bu haqda aytilmagan. <en>FALSE</en> ni tanlashdan oldin fikrga zid gapni toping. |
| `reading.patterns.ngTrue.title` | Pattern card | <en>NOT GIVEN</en> mixed up with <en>TRUE</en> or <en>YES</en> | <en>NOT GIVEN</en> путается с <en>TRUE</en> или <en>YES</en> | <en>NOT GIVEN</en> bilan <en>TRUE</en> yoki <en>YES</en> adashtirilgan |
| `reading.patterns.ngTrue.count` | Pattern card | {count} of {total} questions whose answer was <en>NOT GIVEN</en>, <en>TRUE</en> or <en>YES</en> (questions {numbers}) | {count} из {total, plural, one {# вопроса} other {# вопросов}} с ответом <en>NOT GIVEN</en>, <en>TRUE</en> или <en>YES</en> (вопросы {numbers}) | Javobi <en>NOT GIVEN</en>, <en>TRUE</en> yoki <en>YES</en> boʻlgan {total} ta savoldan {count} tasi ({numbers}-savollar) |
| `reading.patterns.ngTrue.tip` | Pattern card | <en>TRUE</en> needs a sentence that says the same thing, often in other words. If there is none, and nothing contradicts the statement, the answer is <en>NOT GIVEN</en>. | Для <en>TRUE</en> нужно предложение, где сказано то же самое, часто другими словами. Если такого нет и ничто не противоречит утверждению, ответ: <en>NOT GIVEN</en>. | <en>TRUE</en> uchun xuddi shu fikr, koʻpincha boshqa soʻzlar bilan aytilgan gap kerak. Bunday gap boʻlmasa va fikrga hech narsa zid boʻlmasa, javob: <en>NOT GIVEN</en>. |
| `reading.patterns.spelling.title` | Pattern card | Spelling | Написание слов | Imlo |
| `reading.patterns.spelling.count` | Pattern card | {count} of {total} typed answers were one letter away from the correct answer (questions {numbers}) | {count} из {total, plural, one {# письменного ответа} other {# письменных ответов}} отличались от правильного одной буквой (вопросы {numbers}) | Yozilgan {total} ta javobdan {count} tasi toʻgʻri javobdan bitta harf bilan farq qildi ({numbers}-savollar) |
| `reading.patterns.spelling.tip` | Pattern card (rule: Cambridge IELTS FAQs, see READING_EXPERIENCE.md, Answer checking) | In the test, a misspelt answer loses the mark. Copy the word from the passage letter by letter. | На экзамене ответ с ошибкой в написании не засчитывается. Переписывайте слово из текста буква за буквой. | Imtihonda xato yozilgan javob uchun ball berilmaydi. Soʻzni matndan harfma-harf koʻchiring. |
| `reading.patterns.wordLimit.title` | Pattern card | Too many words | Слишком много слов | Soʻzlar juda koʻp |
| `reading.patterns.wordLimit.count` | Pattern card | {count} of {total} typed answers had more words than allowed (questions {numbers}) | {count} из {total, plural, one {# письменного ответа} other {# письменных ответов}} содержали больше слов, чем разрешено (вопросы {numbers}) | Yozilgan {total} ta javobdan {count} tasida ruxsat etilganidan koʻp soʻz bor edi ({numbers}-savollar) |
| `reading.patterns.wordLimit.tip` | Pattern card (rule: ielts.org Reading format pages) | In the test, an answer with more words than allowed loses the mark. Check the limit in the instruction, for example <en>NO MORE THAN TWO WORDS</en>, and write only the words that answer the question. | На экзамене ответ, в котором больше слов, чем разрешено, не засчитывается. Проверяйте ограничение в задании, например <en>NO MORE THAN TWO WORDS</en>, и пишите только слова, которые отвечают на вопрос. | Imtihonda ruxsat etilganidan koʻp soʻzli javob uchun ball berilmaydi. Topshiriqdagi cheklovni tekshiring, masalan <en>NO MORE THAN TWO WORDS</en>, va faqat savolga javob boʻladigan soʻzlarni yozing. |
| `reading.patterns.notFromPassage.title` | Pattern card | Words not from the passage | Слова не из текста | Matnda yoʻq soʻzlar |
| `reading.patterns.notFromPassage.count` | Pattern card | {count} of {total} typed answers used a word that is not in the passage (questions {numbers}) | В {count} из {total, plural, one {# письменного ответа} other {# письменных ответов}} есть слово, которого нет в тексте (вопросы {numbers}) | Yozilgan {total} ta javobdan {count} tasida matnda yoʻq soʻz bor edi ({numbers}-savollar) |
| `reading.patterns.notFromPassage.tip` | Pattern card | When the instruction says <en>from the passage</en>, write the passage's own words, even if you know a synonym. | Если в задании сказано <en>from the passage</en>, пишите слова из текста, даже если знаете синоним. | Topshiriqda <en>from the passage</en> deyilgan boʻlsa, sinonimni bilsangiz ham, matndagi soʻzlarni yozing. |
| `reading.patterns.evidence.title` | Pattern card | The evidence was in another sentence | Подтверждение было в другом предложении | Dalil boshqa gapda edi |
| `reading.patterns.evidence.count` | Pattern card | {count} of {total} questions you pinned evidence for (questions {numbers}) | {count} из {total, plural, one {# вопроса} other {# вопросов}}, к которым вы закрепили предложения (вопросы {numbers}) | Dalil biriktirgan {total} ta savoldan {count} tasi ({numbers}-savollar) |
| `reading.patterns.evidence.tip` | Pattern card | Find the key words of the question, then look for the same idea in the passage, not only the same words. The review shows where the evidence was. | Найдите ключевые слова вопроса и ищите в тексте ту же мысль, а не только те же слова. В разборе видно, где было подтверждение. | Savoldagi kalit soʻzlarni toping va matndan faqat oʻsha soʻzlarni emas, oʻsha fikrni qidiring. Tahlilda dalil qayerda ekani koʻrsatilgan. |
| `reading.patterns.paraphrase.title` | Pattern card (content tag) | The same idea in other words | Та же мысль другими словами | Boshqa soʻzlar bilan aytilgan fikr |
| `reading.patterns.paraphrase.count` | Pattern card | {count} of {total} questions where the passage says it in other words were not correct (questions {numbers}) | Неверно {count} из {total, plural, one {# вопроса} other {# вопросов}}, где в тексте это сказано другими словами (вопросы {numbers}) | Matnda boshqa soʻzlar bilan aytilgan {total} ta savoldan {count} tasi notoʻgʻri ({numbers}-savollar) |
| `reading.patterns.paraphrase.tip` | Pattern card | Look for the same idea, not the same words. In the review, compare the question's words with the evidence. | Ищите ту же мысль, а не те же слова. В разборе сравните слова вопроса с подтверждением. | Bir xil soʻzlarni emas, bir xil fikrni qidiring. Tahlilda savoldagi soʻzlarni dalil bilan solishtiring. |
| `reading.patterns.qualifier.title` | Pattern card (content tag) | Small words that change the meaning | Маленькие слова, которые меняют смысл | Maʼnoni oʻzgartiradigan kichik soʻzlar |
| `reading.patterns.qualifier.count` | Pattern card | {count} of {total} questions that depend on a word like <en>all</en>, <en>most</en> or <en>only</en> were not correct (questions {numbers}) | Неверно {count} из {total, plural, one {# вопроса} other {# вопросов}}, где всё решает слово вроде <en>all</en>, <en>most</en> или <en>only</en> (вопросы {numbers}) | <en>all</en>, <en>most</en> yoki <en>only</en> kabi soʻzga bogʻliq {total} ta savoldan {count} tasi notoʻgʻri ({numbers}-savollar) |
| `reading.patterns.qualifier.tip` | Pattern card | Check words such as <en>all</en>, <en>most</en>, <en>some</en>, <en>only</en>, <en>always</en> and <en>never</en> in both the question and the passage. | Сверяйте слова вроде <en>all</en>, <en>most</en>, <en>some</en>, <en>only</en>, <en>always</en> и <en>never</en> в вопросе и в тексте. | Savolda ham, matnda ham <en>all</en>, <en>most</en>, <en>some</en>, <en>only</en>, <en>always</en> va <en>never</en> kabi soʻzlarni tekshiring. |
| `reading.retry.progress` | Retry sheet header, under the question number | {current} of {total} to practise | {current} из {total} для повторения | Takrorlash uchun {total} tadan {current} |
| `reading.retry.title` | Retry results H1 | Your second try | Ваша повторная попытка | Takroriy urinishingiz |
| `reading.retry.score` | Retry results | {score} of {total} now correct | Теперь верно: {score} из {total} | Endi {total} tadan {score} tasi toʻgʻri |
| `reading.retry.honest` | Retry results | You had already seen these questions and their answers, so this shows what you remember from the review. It does not measure your level. | Вы уже видели эти вопросы и ответы на них, поэтому результат показывает, что вы запомнили после разбора. Он не измеряет ваш уровень. | Bu savollar va javoblarini oldin koʻrgansiz, shuning uchun natija tahlildan nimani eslab qolganingizni koʻrsatadi. U darajangizni oʻlchamaydi. |
| `reading.retry.backToResults` | Retry results, quiet | Back to your test results | Вернуться к результатам теста | Test natijalariga qaytish |

Reused without change: "Time is up.", "Start again", "Show in passage", "Your evidence", "Paragraph {letter}", "All questions", "Previous", "Next", "Finish test" and the finish confirmation, the navigator's "no answer" and "current", and "Practice" / "Exam".

## Part 4. Design values

From DESIGN_SYSTEM.md.

### M5 components (Reading results and review)

**DRAFT: awaiting owner approval (task M5-01).** Proposed 2026-10-11 during M5 planning, revised the same day after the owner's first review; not approved. Visual values for the M5 drafts ([READING_EXPERIENCE.md, M5 specifications](../product/READING_EXPERIENCE.md#m5-specifications-drafts)). Reused unchanged: the brand palette, the type scale, the focus style, motion, the breakpoints, the M3 primary button and quiet link, the M4 secondary button, option rows, test bar, sheet, navigator cells, "Your evidence" quote style and desktop columns, including the approved desktop navigator bar (content-driven height: two rows at 1280 px and up to three at 1024 px acceptable; Previous, Next and "Mark for review" keep their text labels). Contrast computed with the WCAG 2.x formula.

#### Status: correct, not correct, no answer
The [Status colors](../design/DESIGN_SYSTEM.md#status-colors) are TBD and M5 is the first milestone that shows correctness. **Every outcome is an icon plus a word** ("Correct", "Not correct", "No answer"), never color alone (I-8); color only supports "correct". "No answer" is its own state, never drawn as "not correct".

| Outcome | Icon (20 px; 16 px in navigator badges) | Color | Contrast |
|---|---|---|---|
| Correct | A check mark in a filled circle | **New token `status.correct` `#157A3C`** (green) for the circle; white check | 5.41:1 on `surface.base`, 5.15:1 on `surface.warm`; white on it 5.41:1. Usable for text too (AA) |
| Not correct | A cross in an outlined circle | `ink` (no new color) | 18.58:1 |
| No answer | A dash in a dashed-outline circle | `text.secondary` | 8.22:1 |

- **Why "not correct" gets no color (recommended, option a; decision D11):** red is the brand's action color and this document requires "incorrect" to stay distinct from it and from Reading's red family; a second hue (orange, amber, purple) would collide with a skill color or read as a warning. The cross and the word carry the meaning; the screen stays calm, as review should.
- **Option b:** a dedicated "incorrect" hue outside the red family (for example a dark amber `#9A5B00`, 5.43:1 on white). Not recommended: amber reads as "warning", and Writing's orange is close.
- `status.correct` is a yellower green than Speaking's teal (`#0F7A5A`); the two never appear together without their labels.

#### Results page
- Inside the shell (header with the language switcher), in the approved onboarding and home column (36rem).
- "Time is up." (when the Exam timed out) in Heading 3 above the H1, as on the M4 finished page.
- **Score:** "27 of 40 correct" as one line in Heading 1 size, weight 800, the score in tabular figures. No ring, gauge, chart, percentage, confetti or color fill ([UI_ANTI_PATTERNS.md](../design/UI_ANTI_PATTERNS.md)).
- The honest line in body text `ink` directly under the score; the breakdown ("Not correct: 9 · No answer: 4") in body text `text.secondary`, each count with its outcome icon.
- Notes (rechecked, imported, older version, storage) in body text `ink` with the 20 px info icon, 16 px under the breakdown, before the button.
- The red review button 24 px below (its text names what it opens); "Mistakes that repeated" 32 px below it; the quiet links ("Try 13 questions again: not correct or no answer", "Start again") last, 8 px apart. Long Russian and Uzbek link texts wrap.

**Result states** (each is the same page; only the listed parts change):

| State | Score line | Note | Red button | Repeated mistakes | Quiet links |
|---|---|---|---|---|---|
| Finished, mistakes and unanswered | "27 of 40 correct" | none | "Review mistakes and unanswered questions" | Cards, or the "none" text, with the scope line | Try again, Start again |
| Finished, mistakes only | as above | none | "Review mistakes" | as above | as above |
| Finished, unanswered only | as above | none | "Review unanswered questions" | as above | as above |
| Everything correct | "40 of 40 correct" | none | "Review answers" | the "none" text | Start again |
| Exam time-out | as above, "Time is up." above the H1 | none | as above | as above | as above |
| Rechecked after a correction | the new score | "Rechecked… Your earlier result was 27 of 40." | as above | from the first try's latest result | as above |
| Imported from M4 | as above | "You finished this test before the app checked answers…" | as above | "We can't tell which was your first try…" | as above |
| Earlier content version, result stored | the stored score | "This test has changed since you took it, so a detailed review is not available." | none; "Start the test" becomes the red button | none | none |
| Earlier content version, no result | none | "…so your answers can't be checked." | "Start the test" | none | none |
| No attempt on this device | none; H1 "No results on this device yet" and its sentence | none | "Start the test" | none | none |
| Storage blocked or full | as in the matching state | the storage notice | as above | as above | as above |
| A retry's results | H1 "Your second try", "9 of 13 now correct" and the honest retry line | none | the review button for the retry | never | "Back to your test results" |

#### Pattern card ("Mistakes that repeated")
- At most two cards. A card is allowed here because each is one distinct unit with its own action ([UI_ANTI_PATTERNS.md](../design/UI_ANTI_PATTERNS.md)): `surface.warm`, `radius.lg`, 16 px padding, no shadow, no border.
- The scope line ("In this try at this test…" or "From your first try…") in body text `text.secondary` under the section heading, before the cards.
- Title in Heading 3; the count line in body text; the tip in body text `text.secondary` (7.83:1 on warm); the action "Practise these questions again" as a quiet link (48 px tap area). English answer words (TRUE, NOT GIVEN) inside are `lang="en"`, not styled differently.
- The "none" and "first try unknown" texts are plain body text, not cards.

#### Review: passage marks
- **Evidence of the current question:** an inline chip before the sentence, like the M4 pin marker (`radius.full`, 1 px `ink` border, `surface.base`), with a 14 px quote-mark icon and the question number in bold meta text, plus a 2 px **dotted** `ink` underline under the sentence (18.58:1). Accessible name: "Evidence for question 5".
- **NOT GIVEN "related" sentences:** the same chip with an outlined (not filled) quote icon and the accessible name "Related to question 3"; the underline is dashed, so "related" and "evidence" differ by shape, not color.
- **The user's own marks:** highlights keep the approved `highlight` tint and border; the current question's pins keep the M4 pin chip. A sentence can carry both chips; the chips sit side by side and wrap with the text.
- Selection (blush) is not used in review: sentences are not selectable there.

#### Review card (phone sheet and desktop column)
- **Header row:** "Question 5 of 40" in Heading 3, then the outcome (icon and word, body weight 700) on its own line; on phones, "All questions" stays in the header as in M4. In the review sequence, "To review: 3 of 13" in meta text `text.secondary` under the heading.
- **Answers:**
  - Choice and list types: the question's option rows, read-only (no hover, no pressed state; they are a list, not controls). The user's option gets a trailing label "Your answer" with the outcome icon; the accepted option gets "Correct answer" with the correct icon and a 2 px `status.correct` boundary. The user's wrong option keeps a 2 px `ink` dashed boundary. Labels are text, so nothing depends on the boundary color.
  - Typed types: two label-value rows, "Your answer" and "Correct answer" (and "Also accepted"), the values in passage typography with `lang="en"`. An unanswered question shows "You did not answer this question." in place of the value, with the "No answer" icon.
- **Evidence block:** the M4 "Your evidence" quote style (`surface.warm`, `radius.md`, 12/16 px padding, the paragraph label in meta text, the sentence in passage typography) under the heading "Evidence in the passage" (or "Where the passage talks about this"), each with "Show in passage" as a quiet link.
- **Explanation:** heading "Why" in Heading 3, body text in the interface language; `lang="en"` spans in the same style.
- **"Explain simpler":** a secondary button (the M4 secondary button) with `aria-expanded`; the simpler text appears right after it, introduced by "In simple words" in bold, with a 4 px `ink` bar along its start edge (the approved current-question bar), so it is visibly a second version and not a new section.
- **Signal notes:** one sentence each in body text with a 20 px info icon (a circle with "i", `ink`), not a status color.
- **Your evidence comparison** (Practice attempts with pins): the M4 "Your evidence" block, followed by one sentence in body text weight 700.
- Spacing between blocks 24 px; inside a block 8 px. Previous / Next as in M4.

#### Review: navigator outcome badges
- The M4 cells (44 × 44 px, number in the cell). In review: a correct question's cell gets the 16 px correct badge in the top corner (where M4 shows the flag); a not-correct question's cell the cross badge; an unanswered question keeps the M4 "unanswered" outline style plus the dash badge. Fills: none (all cells are outlined), so the badge shapes carry the outcome. The current cell keeps the M4 3 px `ink` bar. Flags are not shown in review.
- Accessible names: "Question 5, not correct, current"; "Question 38, no answer".

#### Review on phone, tablet and desktop

| | Phone (320–599 px) | Tablet (600–1023 px) | Desktop (from 1024 px) |
|---|---|---|---|
| Frame | Test bar ("Results", passage, no timer) | Same | Same |
| Passage | Full width between the gutters, read-only, marks as above | Centered at the 40rem measure | Start column, 55%, at the 40rem measure |
| Review card | In the M4 sheet: partial by default, expanded for long cards and the navigator, collapsed to read; the card scrolls inside the sheet | The phone sheet, as wide as the passage | End column, 45%: the current question's card only, scrolling on its own |
| Navigator | "All questions" opens it in the expanded sheet | Same | The M4 bottom bar with outcome badges, Previous and Next, content-driven height, text labels |
| Question change | The passage scrolls so the first evidence sentence sits above the sheet; focus to the card heading | Same | The passage column scrolls the evidence into view; focus to the card heading |

#### Accessibility treatment (M5 screens)
- **Not by color alone (I-8):** outcomes are icon plus word; answer rows carry text labels; evidence and related marks differ by icon and underline style; navigator badges differ by shape and are named in words.
- **Focus:** results H1 on arrival from the test; the review card's heading on opening and on every question change; "Show in passage" moves focus to the sentence; the navigator returns focus to "All questions" on Escape. The approved focus ring everywhere.
- **Announcements:** the focused headings announce the outcome; nothing else uses a live region except the storage notice (polite, once).
- **Disclosure:** "Explain simpler" is a button with `aria-expanded`; the simpler text follows it in reading order.
- **Language:** English test content, typed and accepted answers, and `en` spans in explanations and copy carry `lang="en"`.
- **Targets:** every control at least 44 × 44 px (48 px for buttons and quiet links), including at 320 px.
- **320 px and 200% zoom:** no horizontal scroll; long uz and ru labels wrap and are never truncated; at 200% the partial sheet may show only the card header, with the rest scrolling inside it, as in M4.
- **Reduced motion:** the passage jumps to the evidence instead of scrolling smoothly; the sheet does not animate.

#### Tokens this would add
`--color-status-correct` (`#157A3C`) only. Everything else uses existing or approved values. If the owner chooses option b for "not correct", one more color token (`--color-status-incorrect`).

## Part 5. ADR-0008 (Proposed)

### ADR-0008: Reading Answer Checking, Explanations and Review Content

- **Status:** Proposed (2026-10-11, M5 planning; revised the same day for the owner review packet; for the owner's decision at task M5-01). If accepted, it amends [ADR-0005](../architecture/decisions/0005-reading-content-contract.md) §2 (the answer key is loaded by the results and review pages) and extends the content contract (§3 to §5 below).
- **Date:** 2026-10-11
- **Deciders:** Project owner (acceptance), Claude (draft)

#### Context

[ADR-0005](../architecture/decisions/0005-reading-content-contract.md) keeps each test's answer key and evidence in a separate file (`<testId>.key.json`) that the web app does not load in M4, and leaves answer checking open. The owner moved answer checking to M5 (M4-09). M5 (drafts in [READING_EXPERIENCE.md, M5 specifications](../product/READING_EXPERIENCE.md#m5-specifications-drafts)) needs:

- checking every M4 question type and a raw score, with no band conversion for the uncalibrated demo test;
- evidence-first review: the accepted answer, the evidence sentences, an explanation and a simpler explanation, in uz, ru and en;
- observable signals for repeated-mistake detection (for example a typed answer one letter away from an accepted one);
- results that stay tied to the key and checking rules that produced them ([ADR-0009](../architecture/decisions/0009-reading-attempts-on-the-device.md) §1).

**What the M4 contract does today** (`apps/web/src/domain/reading/parse-content.ts`): the test and key parsers build their objects from known fields only, so an unknown field is ignored, not rejected; every list in a key entry must have at least one item, so `evidence` cannot be empty; a key's `version` must equal its test's; each `accept` value must be an option of its question; nothing checks that the numbers of a "choose several" item share one set, or how many options it has.

Forces:
- **Honest feedback and one scoring source** (PRODUCT.md; INVARIANTS I-1 to I-4; `.claude/rules/domain/ielts-scoring.md`): checking is domain code with tests for every rule; IELTS rules are sourced.
- **Content integrity (I-5)** and **content as untrusted data** (ADR-0005): new files are validated like tests and keys.
- **Who wrote it:** the demo test, its key and the explanations are drafted by Claude (AI). That must stay visible until people have reviewed them.
- **Localization:** explanations are in the interface language; test content stays in English and is marked `lang="en"` ([LOCALIZATION.md](../product/LOCALIZATION.md)). Interface strings live in the catalogs (I-6).
- **Device-only practice:** answers live in the browser (ADR-0006). Review must show the accepted answers, so any page that reviews must receive the key.
- **No AI decision exists** (ARCHITECTURE.md: AI provider is TBD).

#### Decision

##### 1. Checking is one domain module with a rules version
- `apps/web/src/domain/reading/scoring.ts` (the name keeps it under `.claude/rules/domain/ielts-scoring.md`): a pure function from the test, the key and an attempt's answers (and pins) to a result: per question number an outcome (`correct`, `incorrect`, `unanswered`) and its observable signals, plus the marks and the number of scoring positions.
- **`SCORING_RULES_VERSION`**, one integer constant in that module, increases whenever a change could alter an outcome, a mark or a signal for the same answers and key, bug fixes included. Each stored result records it (ADR-0009 §1, §4).
- The rules (normalization, accepted variants, "choose several" marks, unanswered, denominators, signals) are those in [READING_EXPERIENCE.md, Answer checking (M5)](../product/READING_EXPERIENCE.md#answer-checking-m5) and [Error Intelligence (M5)](../product/READING_EXPERIENCE.md#error-intelligence-m5), each with unit tests that cite their source or say that no official source exists.
- **No band conversion** in M5: nothing converts a raw score to a band, so INVARIANTS I-2 still has no implementation to protect.

##### 2. Checking runs in the browser, on the results and review pages
- The results and review pages import the key and the active locale's explanations as static data (read and validated on the server at build time, like the tests, ADR-0005 §3) and pass them to their client parts, which check the attempt from the device's storage.
- **The test screen does not import them**, so the key is not part of the page a learner answers on.
- **Trust model, stated plainly:** a determined user can read the key from the results or review page before taking the test. Device-only practice cannot keep it secret: a server check would have to return the accepted answers for review anyway. This is practice, not a proctored test, as with the device clock (ADR-0006).

##### 3. Answer key additions (`<testId>.key.json`, still validated against its test)
- **`revision`** (integer, from 1): increases with any change to accepted answers, evidence or tags once the key has been used for results. A correction needs **no content version change**, because no stored answer or anchor becomes invalid (ADR-0005 §1); stored results record the revision they used, and ADR-0009 §4 decides what a correction does to them. `version` keeps matching the test's content version, as today.
- **Typed answers:** `accept` lists every accepted answer in full: no optional-word brackets or slash syntax to parse. Variants are written into the key ahead of time and reviewed; none are generated when checking. Each is non-empty, distinct from the others after normalization, and within the group's word limit by the validator's word count ([READING_EXPERIENCE.md, Answer checking (M5)](../product/READING_EXPERIENCE.md#answer-checking-m5): hyphenated words count once, articles count, one number is free only where the limit allows a number). The M4 Practice warning keeps its own, more lenient count.
- **"Choose several" (new validator rule):** every number of an item has the same `accept` set, with exactly as many options as the item has numbers (its `choose`), and no option twice. The key format stays one entry per question number.
- **NOT GIVEN (contract change):** `evidence` of a NOT GIVEN answer lists the sentences where the passage deals with the statement's topic and **may be empty**; M4's validator requires at least one. Review presents these sentences as related text, never as proof. For every other answer, at least one evidence sentence stays required.
- **Optional `trap`** per question, one of `paraphrase`, `qualifier`: what the question tests (READING_EXPERIENCE.md, Error Intelligence).
- **`review`**, required: `{ "status": "aiDraft" | "reviewed" | "approved" }` for the key as a whole (§6).

##### 4. Content addition: `fromPassage`
- Typed-answer groups may set `fromPassage: true` when their instruction says the words come from the passage. The "not from the passage" signal applies only there. The validator rejects it on other group types. It changes nothing the content version guards.

##### 5. Explanations are per-test, per-locale content files
- `apps/web/content/reading/<testId>.explanations.<locale>.json` for `uz`, `ru` and `en`:

```
{ "testId", "version", "locale",
  "review": { "status": "aiDraft" | "reviewed" | "approved" },
  "items": { "<unit key>": { "explanation": Segment[], "simpler": Segment[] } } }
Segment = { "text": "…" } | { "en": "…" }
```

- One item per question unit (a "choose several" item once, under its first number, as answers are stored, ADR-0006).
- `en` segments are English test words or short quotes, rendered with `lang="en"` inside a Russian or Uzbek explanation. Structured segments, as with gap texts (ADR-0005), never markers inside strings.
- **Validated with the test and key** by the domain validator: the file's test and version match; every unit has both texts; no empty text; `simpler` is shorter than `explanation`; the length limits of the authoring rules; a known review status. An invalid or missing file fails the unit tests and the build.
- Only the active locale's file is passed to the review page.
- **Not in `messages/*.json`:** explanations are per-test content, not interface strings. The fixed texts of repeated-mistake detection (notes and tips) are interface strings and live in the catalogs.

##### 6. Authorship and review status are recorded, not implied
- **`aiDraft`**: drafted by Claude (AI), including any text a worker task writes. Never described as written by a person.
- **`reviewed`**: a person has checked it (the English key and explanations against the passage by someone with strong English and IELTS Reading knowledge; ru and uz by fluent speakers), recorded in PROGRESS.md with the reviewer's role and date.
- **`approved`**: the owner has approved it for release.
- M5 may finish with `aiDraft` files; nothing is released to real users before beta. The pre-beta requirement (all `approved`) is in READING_EXPERIENCE.md, Explanations (M5), decision D20. The status is not shown in the interface in M5.

##### 7. "Explain simpler" is pre-written, not generated at runtime
The simpler version is the `simpler` text of §5. No runtime AI. Generated explanations would first need an AI provider ADR (ARCHITECTURE.md open decision; the decisions it needs are listed in READING_EXPERIENCE.md, Explanations and the AI decision (M5)).

##### 8. Not decided here
Band conversion and calibration; AI; authoring tools and the review workflow beyond the status field (M9); server-side checking or storage (M7 and later).

#### Alternatives considered

| Option | Pros | Cons |
|---|---|---|
| **A. Checking in the browser on the results and review pages; key revision and rules version; explanations as per-locale content files with a review status (chosen)** | No network needed after loading; the test screen never carries the key; corrections traceable; AI drafts visible as such | The key is readable from those pages; two version numbers to maintain |
| B. A Server Action checks the answers and returns the result | The key file stays on the server | No real secrecy (review returns the accepted answers); finishing needs the network; answers still live on the device |
| C. Key corrections bump the content version | One number fewer | Discards in-progress sessions and ends review of earlier attempts though no stored answer became invalid |
| D. Explanations inside the key file, all languages together | One file per test | Sends three languages to every review; mixes the language-neutral key with localized text |
| E. Explanations in the message catalogs | Existing localization tooling | Catalogs are interface strings; per-test content would grow every page's catalog |
| F. Runtime AI explanations | Tailored, unlimited "simpler" | Needs an AI provider ADR, privacy and data-residency decisions, cost, latency on weak connections, grounding and failure handling |

#### Why this decision

- **Correctness:** one tested checking module; every result traceable to its key revision and rules version; content, key and explanations validated together, so a missing explanation or a broken evidence id cannot ship.
- **Simplicity:** static files and pure functions; no API, database or AI.
- **Consistency:** ADR-0005's file-plus-validator approach; domain in `domain/`, file loading in `data/` (ADR-0004); structured segments as for gap texts.

#### Consequences

- **Positive:** results and review work for every M4 question type and stay correct offline once loaded; authors see validation errors at build time; corrections show up as rechecked results instead of silent changes.
- **Costs accepted:** about six texts per question (two per locale), each needing human review before beta; the key is visible to a determined user.
- **Harder to change later:** the explanation file shape and the unit keys it uses.

#### Follow-up / migration notes

- **Implementation:** M5-02 (key and content additions, validator), M5-03 (`scoring.ts` and its rules version), M5-05 (explanation files, their validator, AI drafts marked `aiDraft`), M5-06 and M5-07 (loading on the results and review pages).
- **Docs on acceptance:** the ADR index; ADR-0005's status line ("§2 amended by ADR-0008"); ARCHITECTURE.md (content model: checking and explanations decided); LOCALIZATION.md (explanations are localized content files, not catalog strings).

## Part 6. ADR-0009 (Proposed)

### ADR-0009: Reading Attempts and Results on the Device

- **Status:** Proposed (2026-10-11, M5 planning; revised the same day for the owner review packet; for the owner's decision at task M5-01). If accepted, it amends [ADR-0006](../architecture/decisions/0006-reading-session-state.md) §2: the `reading:<testId>:finished` entry is replaced by the attempt history below.
- **Date:** 2026-10-11
- **Deciders:** Project owner (acceptance), Claude (draft)

#### Context

M4 keeps a Reading session on the device ([ADR-0006](../architecture/decisions/0006-reading-session-state.md)): the current session under `reading:<testId>` and the most recent finished one under `reading:<testId>:finished`, both in the envelope `{ "schema": 1, "session": … }`. "Start again" starts a new session, and when that one finishes it **replaces** the earlier finished session. Nothing is checked or scored in M4, so no M4 session has a score.

M5 (drafts in [READING_EXPERIENCE.md, M5 specifications](../product/READING_EXPERIENCE.md#m5-specifications-drafts)) adds results, evidence-first review, repeated-mistake detection and retries. That needs:

- **Results tied to what produced them**: the content version, the answer-key revision and the checking rules ([ADR-0008](../architecture/decisions/0008-reading-answer-checking-and-explanations.md) §3).
- **More than one finished attempt per test**, with new attempts and retries never overwriting an earlier one.
- **A known first try**: repeated-mistake detection uses only the first try at a test, so the history must say whether its first try is known.
- **No duplicates** after a reload, a second tab, or an Exam time-out noticed on load.
- **Compatibility with M4 data** on devices that used M4: in-progress sessions and the `:finished` entry.

Forces (unchanged from ADR-0006): no accounts and no server-side guest record (ADR-0003); stored data is untrusted input; domain rules stay out of the UI (I-3, I-4; ADR-0004); home is rendered on the server and cannot read `localStorage`. One attempt is a few kilobytes.

The answer key is not loaded on the test screen ([ADR-0008](../architecture/decisions/0008-reading-answer-checking-and-explanations.md) §2), so the test screen records an attempt and the results page checks it.

#### Decision

##### 1. Four version numbers, each guarding one thing

| Number | Where | Guards | Changes when |
|---|---|---|---|
| **Content version** | `ReadingTest.version` (ADR-0005); copied into every session and attempt as `testVersion` | Everything a stored answer or mark points at: question numbers, the "choose several" items, option ids, passages and their ids, paragraph letters, sentence ids | Any of those changes (ADR-0005 §1, unchanged) |
| **Storage schema** | `schema` in each stored envelope | The shape of the stored JSON | The stored shape changes. M5 keeps the session envelope at 1 and starts the attempts envelope at 1 |
| **Answer-key revision** | `revision` in the key file ([ADR-0008](../architecture/decisions/0008-reading-answer-checking-and-explanations.md) §3); recorded in each result | Accepted answers, evidence, tags | Any change to them after a key has been used for results |
| **Checking-rules version** | One constant in the checking module (ADR-0008 §1); recorded in each result | Normalization, marks and signal rules | Any code change that could change an outcome, a mark or a signal for the same answers and key |

Nothing else is versioned. Explanations are text shown next to a result; they are not part of it.

##### 2. A finished session becomes an attempt in a per-test history
- Key `reading:<testId>:attempts`, value:

```
{ "schema": 1,
  "firstTry": "<attempt id>" | "unknown",      (absent until the first test attempt; §6)
  "attempts": [ ReadingAttempt, … ] }          (ordered by startedAt)

ReadingAttempt
  id               String(startedAt): the session's start time, which a session never changes
  testId, testVersion
  kind             "test" | "retry"
  retryOf?         the id of the attempt whose questions are retried (retry only)
  questions?       the retried question numbers (retry only)
  mode             "practice" | "exam"        (a retry is always "practice")
  startedAt, finishedAt, finishReason ("user" | "timeUp")
  answers, pins    copied from the session, in the ADR-0006 shapes
  importedFromM4?  true for an attempt imported from M4's ":finished" entry (§5)
  results          [ Result, … ]              (append-only; empty until first checked; §4)

Result
  keyRevision, rulesVersion, checkedAt
  outcomes         per question number: "correct" | "incorrect" | "unanswered"
  signals          per question number: the observable signal codes (ADR-0008 §1)
  score, total     marks and the number of scoring positions (40 for a test attempt)
```

- Flags, highlights and the view are not kept: results and review do not use them.

##### 3. Finishing records the attempt once
- When `apply` returns a finished session (the user finished, or the Exam time ran out, also when that is noticed on load), the storage adapter (a) appends the attempt with `results: []` **unless an attempt with that id exists**, then (b) removes `reading:<testId>`.
- On load, a current session whose `startedAt` equals an existing attempt id is removed: finishing was interrupted between (a) and (b).
- A reload, a second tab (both tabs share the one current session) and a time-out noticed on load therefore lead to one attempt. Answers, pins and times are never changed after (a).

##### 4. Results are computed when first shown and are append-only
- **First view:** if the attempt's `testVersion` is the current content version, the attempt is checked with the current key and rules and the result is appended.
- **Later views:** if the latest result's `keyRevision` and `rulesVersion` are the current ones, it is shown as stored. If either is older and the content version still matches, the attempt is checked again from its unchanged answers. If any outcome, signal or the score differs, the new result is appended and shown, with the note "Rechecked after a correction to the answer key or to how answers are checked. Your earlier result was 27 of 40." If nothing differs, nothing is written.
- **Nothing is overwritten:** earlier results stay in the list, so the learner's first result is never lost and a correction is always visible. Retries and new attempts never touch another attempt.
- **Content no longer available** (the attempt's `testVersion` is not the current one): no new check is possible. The latest stored result is shown (score and counts) with "This test has changed since you took it, so a detailed review is not available"; with no stored result, "…so your answers can't be checked". An attempt of a test the app no longer ships is kept in storage, shown nowhere, and not deleted by M5.

##### 5. Compatibility with M4
- **In-progress sessions** (`reading:<testId>`, envelope schema 1): unchanged and resumed as in M4. When one finishes under M5 it is recorded by §3 like any session.
- **The M4 `:finished` entry:** on the first load of any Reading page of that test, if it parses with the ADR-0006 rules and its `testVersion` is the current content version, it is imported as one attempt: `kind: "test"`, `importedFromM4: true`, id = its `startedAt`, its answers, pins and times as stored, and **`results: []`**. No score, outcome or date is invented: it is checked the first time its results are shown, with the then-current key and rules, like any attempt, and the results page says so ("You finished this test before the app checked answers. It was checked when you first opened these results."). The import also sets `firstTry` to `"unknown"` (§6). The entry is then removed. If the id already exists, nothing is imported and the entry is removed.
- **An M4 `:finished` entry that does not parse or has another content version** is not imported and is left untouched (a few kilobytes, never read again).
- **Content version:** M5's content additions keep the demo test's version **only because they change nothing it guards** (§1): see [READING_EXPERIENCE.md, Content versions and M4 data (M5)](../product/READING_EXPERIENCE.md#content-versions-and-m4-data-m5). If M5-02 had to change any guarded part, the version would increase and M4 sessions of that test would read as absent (ADR-0006).
- **Retries in progress** live in their own entry, `reading:<testId>:retry` (the ADR-0006 envelope, schema 1; the session additionally carries `retry: { of, questions }`), so a retry never touches the test's current session. The main entry never carries `retry`.

##### 6. First-try provenance is stored, not guessed
- `firstTry` is written **once**, in the same write as the attempt that decides it:
  - the first `test` attempt recorded into a history that did not exist → its id;
  - an M4 import → `"unknown"`: M4 kept only the latest finished session, so earlier finished sessions may have been overwritten;
  - a history that existed but could not be read and is written again (§7) → `"unknown"`.
- `firstTry` is per test, across content versions. Retries never set it. "Start again" creates later attempts.
- If `firstTry` names an attempt that is missing or invalid, it reads as `"unknown"`.
- What the device cannot know: attempts in another browser, on another device, or before site data was cleared. The first try is therefore "the first try on this device", and the copy says so.

##### 7. Stored data is untrusted
- **Entry by entry:** a domain parser next to the session parser validates each attempt. An invalid attempt is ignored and removed on the next write of that test's history; an invalid result entry is ignored and removed likewise (the attempt is checked again if possible). Duplicate ids keep the first. One bad entry never loses the others.
- **An envelope that is not valid JSON or not an object** reads as an empty history. It holds nothing recoverable, so the next write replaces it, with `firstTry: "unknown"`.
- **A well-formed envelope with an unknown `schema`** (written by a newer version of the app) is **never overwritten**: that test's attempts are then kept in memory with the storage notice, as in §9.

##### 8. Retention and reset
- At most **20 attempts per test**. When a new attempt would exceed that, the oldest attempt is removed, **except the attempt named by `firstTry`**. That bounds a test's history at roughly 100 KB.
- **No reset control in M5.** Clearing the browser's site data clears the history, as it clears sessions today (ADR-0006). Nothing is kept on a server.

##### 9. Storage unavailable or full
- Attempts are then kept in memory in the storage module for the tab's lifetime: finishing and opening results or review are client-side navigations, so they work in that tab; a reload loses them. Results and review show the notice. A failed write never crashes.

##### 10. Derived, not stored
- **Repeated mistakes** are computed from the first try's latest result on every read (domain code).
- **The review position** (attempt, question, sequence) lives in the page address.

##### 11. Not decided here
- Home showing a Reading activity (a cookie pointer, ADR-0006 §4) stays out unless the owner approves it at M5-01.
- Server storage and moving the history to an account (M7); progress over time and evidence across tests (M8).

#### Alternatives considered

| Option | Pros | Cons |
|---|---|---|
| **A. One validated history per test, attempts written once, results append-only with their key revision and rules version, stored first-try provenance (chosen)** | Same storage and validation approach as ADR-0006; corrections stay visible; first try known or explicitly unknown | Read-modify-write of a list of a few tens of kilobytes; two small version numbers to maintain |
| B. Keep M4's single `:finished` entry and add a `:first` entry | Smallest change | Retries and later attempts still overwrite each other |
| C. One `localStorage` entry per attempt | Write-once per key | Listing, retention and provenance need a scan of all keys |
| D. Freeze the first result forever, never recheck | Simplest | A known-wrong judgment would be shown forever after a key correction |
| E. Recheck and overwrite the result | No history to keep | The learner's earlier result disappears silently |
| F. Tie key corrections to the content version | One number fewer | A typo fix in the key would discard in-progress sessions and end review of every earlier attempt, though no stored answer became invalid |
| G. Infer the first try as "the earliest attempt" | No stored field | Wrong after an M4 import or a damaged history; it would present an unknown first try as known |
| H. IndexedDB, or server storage | Larger, or cross-device | Rejected in ADR-0006 and ADR-0003 for the same reasons |

#### Why this decision

- **Correctness:** attempts are recorded idempotently; every result names the key and rules that produced it; corrections are visible instead of silent; first-try provenance is never invented.
- **Simplicity:** the same browser storage, envelope and parser style as ADR-0006; two integers and one field for provenance; no new dependency.
- **Consistency:** device-only guest state (ADR-0003, ADR-0006); rules in `domain/`, storage in `data/` (ADR-0004).

#### Consequences

- **Positive:** results, review, repeated mistakes and retries read one history; M4 data carries over without invented scores.
- **Costs accepted:** a cleared browser or another device starts with no history; Safari may clear a site's storage after 7 days without a visit (ADR-0006); attempt ids trust the device clock; a device that used M4 gets no repeated-mistake detection for that test, because its first try is unknown.
- **Harder to change later:** the attempt shape, once stored (mitigated by `schema` and the entry-by-entry parser).

#### Follow-up / migration notes

- **Implementation:** M5-04 (attempt model, parser, recording, import, provenance, retention, in-memory fallback, tests with M4-format data); checking on first view and rechecking (M5-06); retries (M5-09); first-try use (M5-10).
- **Docs on acceptance:** the ADR index; ADR-0006's status line ("§2 amended by ADR-0009"); ARCHITECTURE.md (guest practice state); BOUNDARIES.md if the storage module gains a rule.

## Part 7. M5 tasks

Rendered from TASKS.json. All are `todo`; every implementation task depends on M5-01 directly or through other tasks.

#### M5-01: Owner approves the M5 specs, copy, design values and ADRs

- **Owner:** human · **Status:** `todo` · **Depends on:** none
- **Goal:** One approval gate before any M5 product code: answer checking and results, evidence-first review, Error Intelligence, targeted practice, explanations (pre-written or runtime AI), routes and Home, status colors, and how attempts are kept on the device.
- **Scope:**
  - Review the drafts prepared during M5 planning (2026-10-11, not a task): READING_EXPERIENCE.md 'M5 specifications (drafts)', USER_FLOWS.md 'Reading results and review flows (M5)' and 'Interface copy (M5)', DESIGN_SYSTEM.md 'M5 components (Reading results and review)'; mark what is approved as Approved; the review snapshot docs/execution/M5-01-review-packet.md collects all of it, and the canonical sections win where they differ
  - Answer decisions D1–D25 in READING_EXPERIENCE.md 'Decisions for M5-01', including the three IELTS rules with no official source (D2 trailing punctuation, D4 articles and the word limit, D22 date formats), the content version, key corrections and M4 import (D23 to D25) and, separately, the routes and navigation (D21) and Home (D18)
  - Review ADR-0008 (answer checking, explanations, review content) and ADR-0009 (attempts and results on the device) and set them to Accepted or ask for changes; on acceptance the status lines of ADR-0005 and ADR-0006 note the amended sections, and the ADR index and ARCHITECTURE.md are updated
  - If AI is chosen for explanations (D12 b): an AI provider ADR becomes a new draft task, and no AI work starts before it is accepted; M5-05 and M5-07 are adjusted
  - If D20 is approved: add M11 human tasks for the pre-beta reviews of the Reading key and explanations (English accuracy, fluent uz and ru review, owner approval to 'approved')
  - If an answer changes M5's scope (for example no retries, a drill set, Home changes, checking during a test, a band estimate), say so; M5-02 to M5-11 are adjusted before work continues
  - Activating M5 (its status in TASKS.json) remains a separate owner action
- **Acceptance criteria:**
  - The M5 specs, copy and design values are Approved, and ADR-0008 and ADR-0009 are Accepted (or the drafts are revised and this gate repeated)
  - Every decision D1–D25 has a recorded answer
  - No open question blocks M5-02 to M5-11
- **Validation:**
  - `grep -n 'Approved' docs/product/READING_EXPERIENCE.md docs/product/USER_FLOWS.md docs/design/DESIGN_SYSTEM.md`
  - `grep -n 'Status' docs/architecture/decisions/0008-*.md docs/architecture/decisions/0009-*.md`
- **References:**
  - docs/execution/M5-01-review-packet.md
  - docs/product/READING_EXPERIENCE.md
  - docs/product/USER_FLOWS.md
  - docs/design/DESIGN_SYSTEM.md
  - docs/architecture/decisions/0008-reading-answer-checking-and-explanations.md
  - docs/architecture/decisions/0009-reading-attempts-on-the-device.md
  - docs/architecture/decisions/README.md
  - docs/execution/ROADMAP.md
- **Docs to update:**
  - docs/product/READING_EXPERIENCE.md
  - docs/product/USER_FLOWS.md
  - docs/design/DESIGN_SYSTEM.md
  - docs/architecture/decisions/ (0005, 0006 status lines; 0008, 0009; README.md index)
  - docs/architecture/ARCHITECTURE.md
  - docs/execution/ROADMAP.md
  - docs/execution/PROGRESS.md

#### M5-02: Answer key and content additions for checking

- **Owner:** worker · **Status:** `todo` · **Depends on:** M5-01
- **Goal:** The answer key and the content contract carry everything checking and Error Intelligence need, validated, without changing the demo test's version.
- **Scope:**
  - Per ADR-0008 §3, §4 and §6 as accepted, validator rules: the key's `revision` (integer from 1) and required `review.status` (`aiDraft` | `reviewed` | `approved`); typed variants are non-empty, distinct after normalization and within the word limit by the validator's count (every space-separated part is a word, a hyphenated part is one word, one numeric part is free when the limit allows a number, articles count unless D4 decided otherwise); every number of a 'choose several' item has the same set with exactly as many distinct options as the item has numbers; NOT GIVEN evidence may be empty (relaxing M4's at-least-one rule for NOT GIVEN keys only); the optional `trap` tag (`paraphrase` | `qualifier`); the optional `fromPassage` flag, on typed groups only
  - The validator's word count as one domain function, its tests citing the ielts.org hyphenation rule and stating that the article rule has no official source
  - Demo content: `fromPassage: true` on its typed groups. Demo key, drafted by Claude and marked `review.status: aiDraft`, `revision: 1`: variants only where the passage supports them (optional words, British and American spellings, figures and words; dates as listed variants, D22), `trap` tags where they apply. Record each choice in PROGRESS.md as an AI draft awaiting the D20 review
  - The demo test keeps the content version decided at D23 (recommended 1, because nothing it guards changes); a test asserts that M4-format stored sessions of the demo test still parse against the M5 content
  - Unit tests for every new validator rule with small original fixtures; every content file still validated by the content test
- **Out of scope:**
  - checking answers (M5-03)
  - explanations (M5-05)
  - UI
  - new tests or passages; changing question numbers, options or sentence ids
- **Acceptance criteria:**
  - Every rule of ADR-0008 §3, §4 and §6 is enforced and tested
  - The demo test and key validate; the content version matches D23; M4-format sessions still parse; the existing M4 session tests pass unchanged
  - All gates pass
- **Validation:**
  - `pnpm db:up`
  - `pnpm check`
  - `pnpm build`
  - `DATABASE_URL=postgresql://ielts_prep:ielts_prep@localhost:5432/ielts_prep pnpm test:e2e`
- **References:**
  - docs/architecture/decisions/0005-reading-content-contract.md
  - docs/architecture/decisions/0008-reading-answer-checking-and-explanations.md
  - docs/architecture/decisions/0009-reading-attempts-on-the-device.md
  - docs/product/READING_EXPERIENCE.md
  - .claude/rules/domain/ielts-scoring.md
  - .claude/rules/testing/test-code.md
  - docs/product/PRODUCT.md

#### M5-03: Answer checking and the raw score in the domain

- **Owner:** worker · **Status:** `todo` · **Depends on:** M5-02
- **Goal:** Every M4 question type is checked against the key with the approved normalization, marks, outcomes, denominators and observable signals, as tested domain code.
- **Scope:**
  - `apps/web/src/domain/reading/scoring.ts` (under .claude/rules/domain/ielts-scoring.md) per READING_EXPERIENCE.md 'M5 specifications', 'Answer checking (M5)' as approved: normalization (NFC, case, spaces, typographic apostrophes, phone hyphens, the D2 decision on trailing punctuation); outcomes for all 13 M4 types; 'choose several' marks in either order, given to the item's numbers in order; unanswered distinct from incorrect; the raw score out of 40 for a test attempt and out of the retried questions for a retry
  - `SCORING_RULES_VERSION` (ADR-0008 §1), recorded by every result; the 'choose two' cases of the worked example in READING_EXPERIENCE.md as tests (both, reversed, one right one wrong, none right, one chosen, nothing chosen; duplicates and unknown ids never award a mark or more than `choose` marks); a test that every shipped test has exactly 40 scoring positions and a maximum of 40 marks; unanswered: 0 marks, kept in the denominator
  - The observable signals of 'Error Intelligence (M5)': ngInsteadOfFalse, falseInsteadOfNg, ngInsteadOfTrue, trueInsteadOfNg, spelling (exactly one letter added, missing or changed from an accepted variant of at least 4 letters), wordLimit, notFromPassage, timeUp, pinnedElsewhere
  - Result types that keep a practice raw score distinct from any band or estimate; no band conversion anywhere
  - Unit tests for every rule and edge case, each IELTS rule citing its official source (or stating that none exists): case; spaces; smart apostrophes; phone hyphens; trailing punctuation; a misspelling is incorrect; British and American spellings only when listed in the key; over the limit never correct; 'choose two' in either order with partial marks; unanswered vs incorrect; each signal's positive and negative cases, using the demo test and small fixtures
- **Out of scope:**
  - storage of attempts and results (M5-04)
  - UI
  - repeated mistakes across attempts (M5-10)
  - band conversion
- **Acceptance criteria:**
  - Checking matches the approved rules for every M4 question type, proven by tests
  - No UI code decides correctness (INVARIANTS I-3)
  - All gates pass
- **Validation:**
  - `pnpm db:up`
  - `pnpm check`
  - `pnpm build`
  - `DATABASE_URL=postgresql://ielts_prep:ielts_prep@localhost:5432/ielts_prep pnpm test:e2e`
- **References:**
  - docs/product/READING_EXPERIENCE.md
  - docs/architecture/decisions/0008-reading-answer-checking-and-explanations.md
  - .claude/rules/domain/ielts-scoring.md
  - docs/architecture/INVARIANTS.md
  - docs/engineering/TESTING_STRATEGY.md
  - .claude/rules/testing/test-code.md
  - docs/product/PRODUCT.md

#### M5-04: Attempt history on the device

- **Owner:** worker · **Status:** `todo` · **Depends on:** M5-03
- **Goal:** Finished sessions become immutable attempts kept on the device, recorded once and compatible with M4 data.
- **Scope:**
  - Per ADR-0009 as accepted: the attempt model and a domain parser that validates entry by entry; recording on finish (append unless the id exists, then remove the current session); removing a current session that is already recorded; results append-only, each with `keyRevision` and `rulesVersion` (an adapter function the results page calls; ADR-0009 §4); `firstTry` provenance written once (ADR-0009 §6); retention (20 per test, never the `firstTry` attempt); importing M4's `reading:<testId>:finished` entry exactly as in READING_EXPERIENCE.md 'Import of a completed M4 session' (`results: []`, `importedFromM4`, `firstTry: "unknown"`; a non-importable entry left untouched); the retry entry `reading:<testId>:retry` and the session's optional `retry` field, never on the main entry; an in-memory fallback when storage is blocked or full
  - The test screen's finish (by the user, by time-out, and a time-out noticed on load) records the attempt instead of writing `:finished`. The M4 finished page stays until M5-06 replaces it
  - Tests with stored values in the exact M4 format (schema 1, in progress and finished): resumed unchanged; a finished entry imported once; no duplicate after a reload, a second tab, or a time-out noticed on load; a bad attempt or result entry ignored and removed on the next write; unreadable JSON replaced with `firstTry: "unknown"`; an unknown schema never overwritten (attempts in memory); retention; results appended, never overwritten; `firstTry` for a first attempt, an M4 import, a restart, a retry and a damaged history
- **Out of scope:**
  - the results and review UI (M5-06, M5-07)
  - retry screens (M5-09)
  - server storage, accounts (M7)
- **Acceptance criteria:**
  - Behavior matches ADR-0009, proven by tests that include M4-format data
  - The M4 Reading e2e journeys still pass
  - All gates pass
- **Validation:**
  - `pnpm db:up`
  - `pnpm check`
  - `pnpm build`
  - `DATABASE_URL=postgresql://ielts_prep:ielts_prep@localhost:5432/ielts_prep pnpm test:e2e`
- **References:**
  - docs/architecture/decisions/0006-reading-session-state.md
  - docs/architecture/decisions/0009-reading-attempts-on-the-device.md
  - docs/architecture/decisions/0004-web-feature-structure.md
  - .claude/rules/security/security.md
  - .claude/rules/testing/test-code.md
- **Docs to update:**
  - docs/architecture/BOUNDARIES.md (if the storage module gains a rule)

#### M5-05: AI-drafted explanations for the demo test in uz, ru and en

- **Owner:** worker · **Status:** `todo` · **Depends on:** M5-02
- **Goal:** Every question unit of the demo test has an explanation and a simpler version in each interface language, drafted by Claude (AI), marked as AI drafts, and validated like content.
- **Scope:**
  - Per ADR-0008 §5: the explanation file type, its domain validator (test and version match, one item per question unit, both texts in every locale, a known `review.status`, no empty text, the approved length limits, simpler shorter than the explanation, `en` segments) and a server-side loader in `data/` that returns one locale's file; a content test validating every file
  - Draft (Claude, AI) `demo-academic-1.explanations.{en,ru,uz}.json` with `review.status: aiDraft`, by the approved authoring rules: grounded only in the passage, question and key; the paraphrase named; NOT GIVEN explanations say what the passage covers and what it does not, never an invented sentence; English quotes as `en` segments of at most 8 words
  - Original text for this project, English first, then ru and uz; never described as written by a person; PROGRESS.md records the files as AI drafts awaiting the D20 reviews (English accuracy, fluent uz and ru, owner approval)
- **Out of scope:**
  - UI (M5-07)
  - runtime AI
  - other tests
- **Acceptance criteria:**
  - All 39 question units (40 questions, 22–23 as one item) have both texts in en, ru and uz, and the files validate
  - The validator rejects a missing unit, an unknown unit, an empty or too long text, a simpler text not shorter than its explanation, and a wrong test or version (tests)
  - Each explanation refers only to its question's evidence and passage
  - Every file's review status is `aiDraft`, unless a human review is recorded in PROGRESS.md
  - All gates pass
- **Validation:**
  - `pnpm db:up`
  - `pnpm check`
  - `pnpm build`
  - `DATABASE_URL=postgresql://ielts_prep:ielts_prep@localhost:5432/ielts_prep pnpm test:e2e`
- **References:**
  - docs/architecture/decisions/0008-reading-answer-checking-and-explanations.md
  - docs/product/READING_EXPERIENCE.md
  - docs/product/LOCALIZATION.md
  - docs/product/PRODUCT.md
  - .claude/rules/testing/test-code.md
- **Docs to update:**
  - docs/product/LOCALIZATION.md (explanations are localized content files, not catalog strings)

#### M5-06: Results after finishing

- **Owner:** worker · **Status:** `todo` · **Depends on:** M5-04
- **Goal:** Finishing a test in either mode, or running out of time, leads to an honest results page whose result never changes once shown.
- **Scope:**
  - The results address as approved (D21), inside the shell: the key loaded on the server for the results and review pages only (ADR-0008 §2), the result computed on first view and appended, then rechecked when the key revision or rules version is newer, with the 'Rechecked…' note and the earlier result kept (ADR-0009 §4); 'Time is up.', 'Your results', the score out of 40, the honest line, the breakdown, the red review button whose text names what it opens (mistakes and unanswered, mistakes, unanswered, or all answers; linking to the review address that M5-07 builds), 'Start again'
  - Finishing and time-out replace the test screen with the results page; the test link shows the start screen with 'See your last results' (D6); the M4 finished page and its now unused copy are removed
  - Every result state in DESIGN_SYSTEM.md 'Result states': including rechecked, imported from M4 (note), no attempt, unknown attempt, an earlier content version (score kept, or cannot be checked), storage blocked (notice, in memory)
  - The `status.correct` token and outcome icons as approved (DESIGN_SYSTEM.md M5); uz/ru/en copy as approved
  - Tests: component tests; e2e on phone and desktop: Practice finish, Exam finish, Exam time-out on screen and while away (controlled clock), reload shows the same result, a result stored with an older key revision is rechecked with the note, an M4-format finished session seeded in storage shows results, storage blocked, 320 px in uz/ru/en, axe
- **Out of scope:**
  - review (M5-07, M5-08)
  - repeated mistakes (M5-10)
  - retries (M5-09)
  - band conversion
  - Home (unless D18 decided otherwise)
- **Acceptance criteria:**
  - Results appear exactly as approved in every situation of 'When results are available (M5)'
  - The test route does not import the key or explanations
  - No band or estimate is shown anywhere
  - All gates pass
- **Validation:**
  - `pnpm db:up`
  - `pnpm check`
  - `pnpm build`
  - `DATABASE_URL=postgresql://ielts_prep:ielts_prep@localhost:5432/ielts_prep pnpm test:e2e`
- **References:**
  - docs/product/READING_EXPERIENCE.md
  - docs/product/USER_FLOWS.md
  - docs/design/DESIGN_SYSTEM.md
  - docs/design/ACCESSIBILITY.md
  - docs/design/UI_ANTI_PATTERNS.md
  - docs/product/LOCALIZATION.md
  - .claude/rules/frontend/react.md
  - .claude/rules/styling/visual-implementation.md
  - .claude/rules/testing/test-code.md
  - docs/architecture/decisions/0004-web-feature-structure.md
  - docs/architecture/decisions/0008-reading-answer-checking-and-explanations.md
  - docs/architecture/decisions/0009-reading-attempts-on-the-device.md
  - docs/product/PRODUCT.md
- **Docs to update:**
  - docs/design/DESIGN_SYSTEM.md (the status token in code)

#### M5-07: Evidence-first review on phones

- **Owner:** worker · **Status:** `todo` · **Depends on:** M5-05, M5-06
- **Goal:** From the results, a learner reviews every question (mistakes first, correct and unanswered too) with their answer, the accepted answer, the evidence in the passage, the explanation and 'Explain simpler', on a phone.
- **Scope:**
  - The review address as approved, in the test-screen layout: the test bar with 'Results'; the read-only passage with evidence and related chips and underlines, the learner's highlights and the current question's pins; the review sheet card in the approved order (outcome, answers, evidence, why, 'Explain simpler', 'Your evidence' comparison, notes); the navigator with outcome badges
  - Sequences (D8): the red button's sequence walks every not-correct and unanswered question, unanswered ones shown as 'No answer' with 'You did not answer this question.' (and the time-out note), never skipped; the address replaced on question change; the passage scrolls to the evidence (D9), instantly with reduced motion; NOT GIVEN as 'Where the passage talks about this', never proof; focus and keyboard behavior as specified; the empty and error states
  - Explanations of the active locale only; test content and `en` segments marked lang=en; uz/ru/en copy as approved
  - Tests: component tests of the card for each interaction family; e2e on phone: results to the first question to review, Next through mistakes and unanswered questions, a correct and an unanswered question through the navigator, a NOT GIVEN question, 'Explain simpler', 'Show in passage', the keyboard path, 320 px in uz/ru/en, 200% zoom, reduced motion, axe
- **Out of scope:**
  - the desktop layout (M5-08)
  - repeated mistakes (M5-10)
  - retries (M5-09)
  - runtime AI
- **Acceptance criteria:**
  - Every M4 question type can be reviewed as approved on a phone, in both modes' attempts
  - Nothing is shown by color alone (I-8); English test content is lang=en
  - All gates pass
- **Validation:**
  - `pnpm db:up`
  - `pnpm check`
  - `pnpm build`
  - `DATABASE_URL=postgresql://ielts_prep:ielts_prep@localhost:5432/ielts_prep pnpm test:e2e`
- **References:**
  - docs/product/READING_EXPERIENCE.md
  - docs/product/USER_FLOWS.md
  - docs/design/DESIGN_SYSTEM.md
  - docs/design/ACCESSIBILITY.md
  - docs/design/UI_ANTI_PATTERNS.md
  - docs/product/LOCALIZATION.md
  - .claude/rules/frontend/react.md
  - .claude/rules/styling/visual-implementation.md
  - .claude/rules/testing/test-code.md
  - docs/architecture/decisions/0004-web-feature-structure.md
  - docs/architecture/decisions/0007-reading-ui-primitives.md
  - docs/architecture/decisions/0008-reading-answer-checking-and-explanations.md
  - docs/architecture/decisions/0009-reading-attempts-on-the-device.md

#### M5-08: Review on desktop

- **Owner:** worker · **Status:** `todo` · **Depends on:** M5-07
- **Goal:** Review uses the desktop two-column layout from 1024 px, as approved.
- **Scope:**
  - The passage column with the review marks, the question column with the current question's review card, the M4 navigator bar with outcome badges and Previous / Next, keeping the approved content-driven height (two rows at 1280 px, up to three at 1024 px) and text labels; tablet keeps the phone layout
  - Keyboard order test bar → passage → card → navigator bar; e2e on desktop at 1024 and 1280 px in uz/ru/en, axe
- **Out of scope:**
  - changes to the approved M4 desktop decisions
  - repeated mistakes, retries
- **Acceptance criteria:**
  - Desktop review behaves as approved
  - All gates pass
- **Validation:**
  - `pnpm db:up`
  - `pnpm check`
  - `pnpm build`
  - `DATABASE_URL=postgresql://ielts_prep:ielts_prep@localhost:5432/ielts_prep pnpm test:e2e`
- **References:**
  - docs/product/READING_EXPERIENCE.md
  - docs/product/USER_FLOWS.md
  - docs/design/DESIGN_SYSTEM.md
  - docs/design/ACCESSIBILITY.md
  - docs/design/UI_ANTI_PATTERNS.md
  - docs/product/LOCALIZATION.md
  - .claude/rules/frontend/react.md
  - .claude/rules/styling/visual-implementation.md
  - .claude/rules/testing/test-code.md
  - docs/architecture/decisions/0004-web-feature-structure.md

#### M5-09: Try mistakes and unanswered questions again (retry)

- **Owner:** worker · **Status:** `todo` · **Depends on:** M5-08
- **Goal:** A learner can answer an attempt's not-correct and unanswered questions again without seeing the answers, and sees an honestly labeled result that never changes the original attempt.
- **Scope:**
  - The retry address as approved: a Practice session limited to the given questions (the session's `retry` field, ADR-0009 §5), enforced in the domain transitions (moving, answering and pinning only within the subset; the answered count and the finish confirmation over the subset); the navigator, Previous / Next and the desktop column show only those questions; 'n of m to practise'
  - One retry in progress per test: the same retry resumes, a different one replaces it; finishing records a `retry` attempt
  - The retry's results ('Your second try', the score out of the retried questions, the honest retry line, the review button named as on the results page, 'Back to your test results') and review of the retry; the quiet 'Try n questions again: not correct or no answer' on a test attempt's results, covering every question not correct or unanswered (hidden when there are none); the retry's denominator counts both
  - Tests: domain tests for subset transitions; e2e on phone and desktop; the original attempt and its result are unchanged after a retry (stored data and its results page)
- **Out of scope:**
  - unseen or new practice content (M9)
  - repeated-mistake cards (M5-10)
  - Exam-mode retries
- **Acceptance criteria:**
  - Retries behave as approved and are never shown out of 40 or combined with the original
  - All gates pass
- **Validation:**
  - `pnpm db:up`
  - `pnpm check`
  - `pnpm build`
  - `DATABASE_URL=postgresql://ielts_prep:ielts_prep@localhost:5432/ielts_prep pnpm test:e2e`
- **References:**
  - docs/product/READING_EXPERIENCE.md
  - docs/product/USER_FLOWS.md
  - docs/design/DESIGN_SYSTEM.md
  - docs/design/ACCESSIBILITY.md
  - docs/design/UI_ANTI_PATTERNS.md
  - docs/product/LOCALIZATION.md
  - .claude/rules/frontend/react.md
  - .claude/rules/styling/visual-implementation.md
  - .claude/rules/testing/test-code.md
  - docs/architecture/decisions/0004-web-feature-structure.md
  - docs/architecture/decisions/0006-reading-session-state.md
  - docs/architecture/decisions/0009-reading-attempts-on-the-device.md

#### M5-10: Error Intelligence: repeated mistakes

- **Owner:** worker · **Status:** `todo` · **Depends on:** M5-09
- **Goal:** The results page shows repeated mistakes only when the first-try evidence meets the approved threshold, describes what happened without guessing why, and links to practising those questions again.
- **Scope:**
  - Domain code per READING_EXPERIENCE.md 'M5 specifications', 'Error Intelligence (M5)' as approved: the first try from the stored `firstTry` (ADR-0009 §6), per test, never guessed; no detection when it is unknown; the categories from signals and content tags with their opportunities; the threshold (D15), presented as a heuristic, never as a diagnosis; ordering and the limit of two; unanswered questions excluded
  - 'Mistakes that repeated' on a test attempt's results: the scope line ('In this try at this test…' or 'From your first try…'), the cards (title, count of opportunities with question numbers, tip, 'Practise these questions again' as a retry of those questions), the 'none' text, the 'first try unknown' text, nothing on a retry's results; no wording that claims a pattern across tests or a lasting weakness; the per-question notes in review use the same signals
  - uz/ru/en copy as approved, with English answer words lang=en
  - Tests: domain tests at every boundary (2 vs 3 questions, 1 vs 2 groups, first try only, later attempts, restarts and retries ignored, an imported M4 attempt and a damaged history (unknown first try), unanswered excluded, content tags, ties); e2e with seeded attempts for a card, the none state and a later attempt
- **Out of scope:**
  - learner-confirmed causes (D14)
  - rates across many tests (M8)
  - any band, level or improvement claim
- **Acceptance criteria:**
  - Repeated mistakes appear exactly when the approved rule says so, proven by tests
  - No text states a cause the learner did not give
  - All gates pass
- **Validation:**
  - `pnpm db:up`
  - `pnpm check`
  - `pnpm build`
  - `DATABASE_URL=postgresql://ielts_prep:ielts_prep@localhost:5432/ielts_prep pnpm test:e2e`
- **References:**
  - docs/product/READING_EXPERIENCE.md
  - docs/product/USER_FLOWS.md
  - docs/design/DESIGN_SYSTEM.md
  - docs/design/ACCESSIBILITY.md
  - docs/design/UI_ANTI_PATTERNS.md
  - docs/product/LOCALIZATION.md
  - .claude/rules/frontend/react.md
  - .claude/rules/styling/visual-implementation.md
  - .claude/rules/testing/test-code.md
  - docs/architecture/decisions/0004-web-feature-structure.md
  - docs/product/PRODUCT.md
  - .claude/rules/domain/ielts-scoring.md
  - docs/engineering/TESTING_STRATEGY.md

#### M5-11: Reading review end to end, accessibility pass and docs

- **Owner:** worker · **Status:** `todo` · **Depends on:** M5-10
- **Goal:** The product loop for Reading (practice, understand mistakes, practise again) works as one flow on phone and desktop, and the docs describe what exists.
- **Scope:**
  - e2e journeys on both projects in uz/ru/en with English test content marked lang=en: a Practice test → finish → results → review mistakes and unanswered questions (each interaction family, a NOT GIVEN question, an unanswered question, 'Explain simpler') → try them again → the retry's results → back; an Exam with a time-out → results → review; a reload at each step; M4-format data already on the device (an unfinished session resumed, a finished one imported with the 'checked later' note and no repeated-mistake detection)
  - Accessibility pass per ACCESSIBILITY.md on the production build (keyboard, screen-reader order, announcements, 200% zoom, 320 px, reduced motion, not by color alone), with findings fixed or recorded; a TalkBack check recorded as before-beta if no device is available
  - Docs: FEATURE_MAP (Error review, Error Intelligence, Targeted practice), CLAUDE.md Current state, READING_EXPERIENCE.md status line
- **Out of scope:**
  - new features
- **Acceptance criteria:**
  - The journeys pass on both projects
  - The accessibility pass is recorded
  - All gates pass
- **Validation:**
  - `pnpm db:up`
  - `pnpm check`
  - `pnpm build`
  - `DATABASE_URL=postgresql://ielts_prep:ielts_prep@localhost:5432/ielts_prep pnpm test:e2e`
- **References:**
  - docs/product/READING_EXPERIENCE.md
  - docs/product/USER_FLOWS.md
  - docs/design/DESIGN_SYSTEM.md
  - docs/design/ACCESSIBILITY.md
  - docs/design/UI_ANTI_PATTERNS.md
  - docs/product/LOCALIZATION.md
  - .claude/rules/frontend/react.md
  - .claude/rules/styling/visual-implementation.md
  - .claude/rules/testing/test-code.md
  - docs/architecture/decisions/0004-web-feature-structure.md
  - docs/product/FEATURE_MAP.md
  - CLAUDE.md
- **Docs to update:**
  - docs/product/FEATURE_MAP.md
  - CLAUDE.md (Current state)
  - docs/product/READING_EXPERIENCE.md
