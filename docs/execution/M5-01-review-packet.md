# M5-01 Owner Review Packet: Reading Review + Error Intelligence

> **Review snapshot, not a specification.** Generated on 2026-10-11 by copying the canonical sections listed under [Canonical sources](#canonical-sources) word for word, as they stand in the commit that adds or updates this file; only heading levels and relative links were adjusted (links point at the canonical files). If anything here differs from those sections, **the canonical sections win**. Edit them, not this file.
>
> **Status:** this version reflects the owner's M5-01 decision of 2026-10-11 (on the packet at commit 069877e): the recommendations of D1 and D3 to D25 approved, D2 amended, and seven amendments applied to the canonical text. The approval itself, M5-01 and the ADR acceptance are recorded in TASKS.json, the ADRs and PROGRESS.md.

## How to read this packet

- **Decisions:** D1 to D25 with the decided behavior ([Part 1](#part-1-decisions-d1-to-d25)), and the owner's amendments in Part 2 under "Decided at the M5-01 gate".
- **Already approved and not reopened (M4):** the desktop navigator bar's content-driven height (two rows at 1280 px and up to three at 1024 px are acceptable); Previous, Next and "Mark for review" keep their text labels; the passage on screen comes first in the bar; the refused-pin message is contextual feedback above the action bar's two rows.
- **Not in M5:** accounts and sync (M7), progress over time and evidence across tests (M8), new content and authoring tools (M9), runtime AI.

## What changed since the packet at 069877e

A summary only; the parts below hold the text.
- **D2 amended:** only one trailing full stop is ignored; other punctuation is kept (product policy, not a verified IELTS rule).
- **Highlights** are kept in every attempt, including imported M4 sessions; an absent field means "not recorded".
- **"Choose several" items are one answer unit** in review and retries: aggregate outcome ("1 of 2 correct"), option-level labels, never a positional mark presented as a letter; reviewed and retried whole and once; progress counts cards; the retry navigator stays within its subset; repeated-mistake counts use units; retry addresses validated with explicit safe states.
- **Storage across tabs (ADR-0009):** one write-once entry per attempt, per result record and for the first-try marker, instead of one rewritten list; kind-specific ids (`test-…`, `retry-…`); sources removed only after their record exists; interleaved-tab tests required.
- **Result records:** one per key revision and rules version, written even when unchanged, all kept; the correction notice only for learner-visible changes; `fromPassage` moved into the key so the key revision covers it; fingerprint tests enforce the version rules; the first try refreshed before patterns; patterns unavailable for another content version.
- **Wording:** "Possible spelling issues"; "Not enough evidence to show a repeated pattern…"; pin comparisons about the key's cited sentences; statement notes in facts or the writer's views, separating absent information from contradiction; "Your retry" and "These are questions you have attempted before…"; the score may wrap; no empty NOT GIVEN evidence block.
- **Explanations:** English drafted first, then ru and uz from it, all `aiDraft`; pre-beta English review, reconciliation, fluent review and owner approval as M11-04 to M11-07.

## Canonical sources

| Part | Content | Canonical source |
|---|---|---|
| 1 | Decisions D1 to D25 | [READING_EXPERIENCE.md, Decisions for M5-01](../product/READING_EXPERIENCE.md#decisions-for-m5-01) |
| 2 | Reading specifications: the M5-01 decision and amendments, content versions and M4 data, answer checking, results, review, routes, Home, Error Intelligence, targeted practice, explanations and the AI decision | [READING_EXPERIENCE.md, M5 specifications (drafts)](../product/READING_EXPERIENCE.md#m5-specifications-drafts) |
| 3 | Flows and all uz/ru/en copy | [USER_FLOWS.md, Reading results and review flows (M5)](../product/USER_FLOWS.md#reading-results-and-review-flows-m5) and [Interface copy (M5)](../product/USER_FLOWS.md#interface-copy-m5) |
| 4 | Design values, result states, review layouts, accessibility | [DESIGN_SYSTEM.md, M5 components](../design/DESIGN_SYSTEM.md#m5-components-reading-results-and-review) |
| 5 | ADR-0008 | [0008-reading-answer-checking-and-explanations.md](../architecture/decisions/0008-reading-answer-checking-and-explanations.md) |
| 6 | ADR-0009 | [0009-reading-attempts-on-the-device.md](../architecture/decisions/0009-reading-attempts-on-the-device.md) |
| 7 | M5 tasks and the M11 review tasks | [TASKS.json](TASKS.json) (rendered here; the JSON is canonical) |

Also changed: [ROADMAP.md](ROADMAP.md), [ARCHITECTURE.md](../architecture/ARCHITECTURE.md), the [ADR index](../architecture/decisions/README.md) and [PROGRESS.md](PROGRESS.md).

## Part 1. Decisions D1 to D25

### Decisions for M5-01

Owner decision, 2026-10-11: **approved as recommended for D1 and D3 to D25; D2 approved with an amendment**; the amendments in [Decided at the M5-01 gate](../product/READING_EXPERIENCE.md#decided-at-the-m5-01-gate) apply throughout.

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
| D19 | Attempt storage | ADR-0009: write-once entries per attempt, result record and first-try marker; sources removed only after their record exists; result records per key revision and rules version, all kept; 20 attempts kept; no reset control; unknown schemas never overwritten | Up to about 100 KB per test; clearing site data is the only reset | |
| D20 | Review status and pre-beta review | `aiDraft` / `reviewed` / `approved`; M5 finishes with `aiDraft`; before beta: English review, reconciling ru and uz, fluent review, owner approval (M11-04 to M11-07) | AI drafts are visible in development builds until reviewed (no interface label) | Only people complete the reviews |
| D21 | Routes and navigation | `/results`, `/review`, `/retry` under the test; finishing and card changes replace the address; review and retry in the test-bar layout, results in the shell | Four addresses per test | |
| D22 | Date formats | No date parsing; each accepted date form is its own pre-written variant; the demo test has no date answers | Every accepted form must be listed; a missing one is marked wrong until a key revision | **No official source** for Reading |
| D23 | The demo test's content version | Keep `version: 1` while the test file stays byte-identical and the session envelope stays at schema 1 | Relies on the fingerprint test | See Content versions and M4 data |
| D24 | Key corrections and rule changes | One record per key revision and rules version, written even when unchanged, all kept; the correction notice only for learner-visible changes | Two version numbers to maintain | |
| D25 | M4 finished sessions | Imported once with answers, pins and highlights, without a result, checked at first view with a note; the test's first try becomes unknown; the source is removed only after a successful write | Devices with M4 data get no repeated-mistake detection for the demo test | Importing as a first try would invent provenance |

## Part 2. Reading specifications

From READING_EXPERIENCE.md; the decisions subsection is in Part 1.

### M5 specifications (drafts)

**DRAFT, revised to the owner's M5-01 decision of 2026-10-11.** Prepared during M5 planning and revised after the owner's first review and after the owner's decision (approve the recommendations of D1 and D3 to D25, D2 amended, plus the amendments in [Decided at the M5-01 gate](../product/READING_EXPERIENCE.md#decided-at-the-m5-01-gate)). The approval itself is recorded with task M5-01. Flows and step counts: [USER_FLOWS.md, Reading results and review flows (M5)](../product/USER_FLOWS.md#reading-results-and-review-flows-m5); copy: [Interface copy (M5)](../product/USER_FLOWS.md#interface-copy-m5); visual values: [DESIGN_SYSTEM.md, M5 components](../design/DESIGN_SYSTEM.md#m5-components-reading-results-and-review); data: [ADR-0008](../architecture/decisions/0008-reading-answer-checking-and-explanations.md) and [ADR-0009](../architecture/decisions/0009-reading-attempts-on-the-device.md). A review snapshot is [docs/execution/M5-01-review-packet.md](M5-01-review-packet.md); these sections stay the canonical text.

**Kept from M4, not reopened:** the desktop navigator bar's content-driven height (two rows at 1280 px and up to three at 1024 px are acceptable); Previous, Next and "Mark for review" keep their text labels; the passage on screen comes first in the bar; the refused-pin message is contextual feedback above the action bar's two rows. M5 screens reuse these.

**What M4 actually does today** (inspected 2026-10-11): the answer key (`content/reading/<testId>.key.json`) has `accept` and `evidence` per question number and is validated but never loaded by the app; "choose two" items repeat the same `accept` set under both numbers (22 and 23: A, C); the NOT GIVEN entries (3, 30) point at the sentence where the passage discusses the topic, because the key validator requires at least one evidence sentence; the demo's typed answers have one accepted form each. A session always carries `highlights` (possibly empty). Finishing stores the session under `reading:<testId>:finished`, and a later finish **replaces** it. Typed answers are stored as typed and trimmed when the field loses focus. The demo test, its key and its passages were drafted by Claude (AI) in M4 and have not been reviewed by a person.

**Words used here:**
- *Pre-written* means written into the content files ahead of time (in M5 drafted by Claude and marked `aiDraft` until people review them; ADR-0008 §6), as opposed to generated when a learner asks.
- *Scoring position* is one question number, worth one mark. *Answer unit* is what the learner answers as one thing: a single question, or a "choose several" item such as 22–23 (two positions, one unit). Marks and the score count positions; review cards, retries and repeated-mistake counts use units.
- *First try* is defined in [Error Intelligence (M5)](../product/READING_EXPERIENCE.md#error-intelligence-m5).

#### Decided at the M5-01 gate

Owner decision, 2026-10-11, on the review packet at commit 069877e: the recommendations of D1 and D3 to D25 are approved; D2 is approved with one change; the amendments below supersede earlier draft text and are applied throughout these sections, the copy, the design notes, ADR-0008 and ADR-0009.
- **D2:** the mechanical normalization as proposed, but only **one trailing full stop** is ignored; commas, semicolons and colons are not stripped. This is a practice-product policy, not a verified IELTS rule.
- **Highlights are kept** in the finished attempt with answers and pins, including those of imported M4 sessions; an absent field means "not recorded". Flags and view state are not kept.
- **"Choose several" items are one answer unit** in review and retries: an aggregate outcome with option-level correctness, never a positional mark presented as a particular letter; a unit is reviewed or retried whole and once; review progress counts cards; a retry's navigator stays within its subset; repeated-mistake counts use units; retry addresses are validated against the source attempt.
- **Concrete storage guarantees across tabs** (ADR-0009 §2 to §4): write-once entries, sources removed only after their record exists, kind-specific ids, recoverable M4 entries never destroyed by a failed write, tests with interleaved tabs.
- **Coherent result records:** one record per key-revision and rules-version pair even when unchanged, all kept; a correction notice only for learner-visible changes; feedback metadata such as `fromPassage` covered by the existing version numbers; the first try refreshed before patterns are derived; patterns unavailable when the matching content is not.
- **Claims within the evidence:** "Possible spelling issue"; a neutral "not enough evidence" state; tags describe questions; pin comparisons describe agreement with the key's cited sentences; NOT GIVEN feedback separates absent information from contradiction and facts from the writer's views.
- **Copy corrections:** "Your retry"; no claim that answers were viewed or that a retry measures memory; the score may wrap; no empty evidence block for NOT GIVEN; in en, ru and uz.
- **Explanations:** English drafted first, then ru and uz from it, all `aiDraft` in M5; before beta, English review, then reconciling translations, then fluent review, then owner approval, as M11 tasks that only people can complete.

#### Content versions and M4 data (M5)

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
| The session envelope `{ "schema": 1, "session" }` | No: M5 keeps it; the new `retry` field only appears in the new retry entry |
| The test file | **No change at all** in M5 (`fromPassage` is in the key) |
| The key file | Adds `revision`, `review`, optional `trap` and `fromPassage`, variants; sessions never store anything from the key |

**Decision (D23): keep the demo test at `version: 1` while these conditions hold**: the test file stays byte-identical (the fingerprint test) and the session envelope stays at schema 1. If any later change touches the test file, the version increases and M4 sessions of that test read as absent (ADR-0006).

**How a completed attempt stays tied to what judged it** (ADR-0009 §2 to §5): the attempt keeps `testVersion` and its unchanged answers, pins and highlights; each result record names its key revision and rules version. The learner sees the record of the current pair.

| Event | What happens |
|---|---|
| **First view** of an attempt of the current content version | It is checked and a record is written for the current pair |
| **Key revision or rules version increased** | On the next view, the attempt is checked again from its unchanged answers and a record is written for the new pair **even if nothing changed**, so later views know the pair was checked (concurrent views write the same entry once). If the score, an outcome or a note the learner sees changed, the page shows a correction notice ("Rechecked after a correction…"), quoting the earlier score only when the score changed. Otherwise there is no notice. Earlier records are kept (D24) |
| **Content version changed** (the attempt's content is no longer shipped) | No check is possible: the most recent stored record is shown with "This test has changed since you took it, so a detailed review is not available"; without one, "…so your answers can't be checked" |
| **Test no longer shipped** | Its entries stay in storage, shown nowhere, not deleted by M5 |
| **Invalid stored data** | An invalid entry is ignored and removed by the next write of that test's history; an entry with an unknown schema is never overwritten or removed; never a crash (ADR-0009 §8) |

**Import of a completed M4 session** (ADR-0009 §7, D25), on the first load of any Reading page of that test:
1. Read `reading:<testId>:finished`. If it does not parse with the ADR-0006 rules or its `testVersion` is not the current one, leave it untouched and stop.
2. Write the attempt `test-<startedAt>` (unless a valid one exists): `kind: "test"`, `importedFromM4: true`, its mode, times, answers, pins **and highlights** exactly as stored, and no result.
3. Set the test's first try to "unknown".
4. Only if steps 2 and 3 succeeded, remove the `:finished` entry. A failed write leaves it in place, and the next load tries again.
5. Nothing else is created: no score, outcome, check date or first-try claim. The attempt is checked the first time its results are shown, and its results page says "You finished this test before the app checked answers. It was checked when you first opened these results."
6. Earlier M4 finished sessions that M4 overwrote are gone; nothing pretends otherwise.

An **unfinished** M4 session is resumed unchanged and, when finished, recorded like any M5 attempt.

**Across tabs** (ADR-0009 §2 to §4): every attempt, result record and first-try marker has its own entry, written once and never rewritten, so a tab working from stale data cannot overwrite another tab's attempt or result. Finishing writes the finished session first, then the attempt, and removes the session only after the attempt exists. A stale tab cannot overwrite a recorded attempt: the first committed one keeps its answers, pins and highlights. Test and retry attempts have different ids even when started in the same millisecond.

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

**Unanswered questions.** "No answer" is a display status of its own, never shown as "Not correct"; it earns **0 marks** and **stays in the denominator**. Unanswered questions are part of the learning flow: they are in the results breakdown, in the review sequence started from the results ([Evidence-first review](../product/READING_EXPERIENCE.md#evidence-first-review-m5)), and in "Try again" ([Targeted practice](../product/READING_EXPERIENCE.md#targeted-practice-m5)), and every one of those names them. After an Exam time-out each of them carries the note "This question had no answer when the time ran out." Only repeated-mistake detection leaves them out, because a blank says nothing about how an answer was formed.

**Score and denominators.**
- A test attempt: the raw score is the number of marks **out of 40** (scoring positions), whatever was answered: "27 of 40 correct", with "Not correct: 9 · No answer: 4" next to it (also counted in positions, so the three numbers add up to 40). No percentage.
- A retry: "9 of 13 now correct", out of the retried positions (whole units, not-correct and unanswered ones alike; 22–23 counts 2); never shown out of 40 and never combined with the original score.
- Both are counts of correct answers on our own content, labeled as a practice score.

**Raw score is not a band** (D1). ielts.org publishes the average marks per band for official test versions and says they vary between versions; standards are fixed per version. Our demo test is original and has never been calibrated, so a band read from those averages would claim a precision we do not have. **Decided: no band and no "Estimated band" in M5**, for Academic or General Training; the results page says "A practice score on our own practice test. It is not an IELTS band score." Band conversion returns only with calibrated content (content sourcing, M9) and the Academic / General Training decision ([PRODUCT.md](../product/PRODUCT.md#open-questions)). INVARIANTS I-2 stays without an implementation until then.

#### When results are available (M5)

| Situation | Behavior |
|---|---|
| Practice, "Finish test" → "Finish" | The attempt is recorded (ADR-0009) and the results page opens at once |
| Exam, "Finish test" → "Finish" | The same. "Feedback after the test only" holds: nothing is checked before finishing |
| Exam, time-out with the screen open | Finishes by itself (M4) and opens the results page with "Time is up." |
| Exam, time-out while away | On the next visit the session is found finished (ADR-0006); the attempt is recorded once and the results page opens with "Time is up." |
| Reload of results or review | The same attempt and the same record (ADR-0009 §5) |
| The key or the checking rules changed since the last record | Checked again and a record written for the new pair; the correction notice only when something the learner sees changed (D24) |
| An M4 finished session on the device | Imported without a result, checked when its results are first shown, with the note that it was checked later (D25) |
| Opening the test link after finishing | The start screen, with a quiet "See your last results" (D6). M4 showed the finished page there |
| Storage blocked or full | Results are computed and shown, kept in memory for the tab, with the notice; recoverable sources stay in storage |
| During a test, either mode | No checking and no explanations (D17) |

Completed attempts never change: "Start again" and retries create new attempts, and a recheck adds a record instead of replacing one (ADR-0009 §5). Results are traceable to their key and rules, and never silently overwritten.

#### Results page (M5)
- Address: `/{locale}/reading/{testId}/results` (the latest test attempt) or `?attempt={id}` (a specific one); inside the shell, so the header's language switcher is there.
- At 360 px, top to bottom: "Time is up." when the Exam timed out; the H1 "Your results"; the test title (English) and the mode in meta text; "27 of 40 correct" large (it wraps at narrow widths and at 200% zoom; it is not forced onto one line); the honest line; "Not correct: 9 · No answer: 4"; when applicable, the correction, "checked later" or storage note; the red review button; "Mistakes that repeated" ([Error Intelligence](../product/READING_EXPERIENCE.md#error-intelligence-m5)); the quiet "Try again" link (when any unit was not fully correct or unanswered) and "Start again".
- **The red button names what it opens** (D8): "Review mistakes and unanswered questions" (both exist), "Review mistakes" (no unanswered), "Review unanswered questions" (no mistakes), "Review answers" (everything correct). A partly correct "choose several" item counts as a mistake here.
- One primary action. No band, no gauge, no chart, no celebration (honest feedback; UI_ANTI_PATTERNS.md).
- Focus moves to the H1 when the page replaces the test screen, so finishing is announced (as on the M4 finished page).

#### Evidence-first review (M5)

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
  6. **Notes:** the unit's observable signals, one sentence each ([Error Intelligence](../product/READING_EXPERIENCE.md#error-intelligence-m5)).
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

#### Routes and navigation (M5)

Decided as drafted (D21). All pages are prerendered per test and locale; the attempt data comes from the device.

| Address | Shows | Frame |
|---|---|---|
| `/{locale}/reading/{testId}` | The start screen (with "See your last results" when an attempt exists) or the session in progress, as in M4. After finishing it **replaces** itself with the results page, so Back does not return to a finished test | Test bar |
| `/{locale}/reading/{testId}/results[?attempt={id}]` | Results of the latest test attempt, or of the given attempt (a retry, an earlier attempt) | Shell |
| `/{locale}/reading/{testId}/review?attempt={id}&q={n}&set={mistakes\|all}` | The review (`mistakes` = units not fully correct or unanswered). Moving between cards replaces the address, so Back leaves the review instead of stepping through every card | Test bar |
| `/{locale}/reading/{testId}/retry?of={id}&q={numbers}` | A retry of the given units of that test attempt (Practice), validated as in [Targeted practice](../product/READING_EXPERIENCE.md#targeted-practice-m5) | Test bar |

- Attempt ids are `test-<startedAt>` or `retry-<startedAt>` (ADR-0009); invalid parameters fall back as in the empty states.
- The level check and onboarding are not involved: a direct link still bypasses onboarding (USER_FLOWS.md).

#### Home in M5

**Decided (D18): no change.** Reading stays reachable by its direct link (M4 decision), the level check stays the next action (rule 1), and home, rendered on the server from the goal cookie, cannot read the device's attempts (ADR-0006 §4). Next-action rules that use history belong to M8. The options considered were a cookie pointer and a quiet link on home.

#### Error Intelligence (M5)

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

Unanswered questions belong to no category (see [Answer checking](../product/READING_EXPERIENCE.md#answer-checking-m5), Unanswered questions). A "choose several" item counts as one unit, never as two examples.

**Content tags** (optional, one per question, only where true; an item's numbers carry the same tag): `paraphrase` (the question expresses the passage's idea in different words) and `qualifier` (the answer turns on a limiting word such as all, most, only, every, never). They describe the question. The demo key gets them where they apply (M5-02); a category with fewer than 3 tagged units in a test simply cannot appear.

**The first try, precisely** (D15, ADR-0009 §6). Repeated mistakes use only the first try at a test, because later tries repeat questions the learner has already worked on. The first try is stored, never guessed:

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

**Before deriving patterns**, the first try's record is brought up to the current pair if its content version is the current one (ADR-0009 §5: a check writes a record). If the first try's content version is not the current one, **patterns are unavailable**: the page says "Repeated mistakes can't be shown because this test has changed since your first try." Old answers and signals are never combined with another version's groups or tags.

**When the first try is unknown:** no repeated-mistake detection for that test, and the results page says "We can't tell which was your first try at this test on this device, so we don't look for repeated mistakes in it." Each unit's own notes still appear in review, because they describe only that attempt.

**When a mistake counts as repeated** (D15; a **proposed product heuristic, not a validated diagnosis**): the same category on **at least 3 different answer units** from **at least 2 different question groups** of the first try (one group shares one instruction, so a single group could reflect one misread instruction). The numbers are a starting point to be checked against real use (M8); the copy never calls the result a diagnosis or a weakness.

**What the learner sees** (only on a test attempt's results, never on a retry's):
- The scope, in words the evidence supports: on the first try itself, "In this attempt at this test. One test is not enough to show a lasting weakness."; on a later attempt, "From your first attempt at this test on this device. Later attempts repeat questions you have worked on before, so they are not used. One test is not enough to show a lasting weakness."
- Up to two categories, most occurrences first (ties in table order), each with its count out of its opportunities and the question numbers ("3 of 5 questions whose answer was NOT GIVEN, FALSE or NO (questions 2, 3, 30)"), one tip, and "Practise these questions again".
- No repeated category (whether too few units or too few groups): "Not enough evidence to show a repeated pattern in this attempt." (on the first try) or "…in your first attempt at this test." (on a later attempt). Single occurrences stay as notes on their cards in review.
- With one demo test, nothing claims a pattern across tests, a lasting weakness, improvement, a level or a band. Evidence across tests and rates belong to M8.

**Feedback the content can support:** the per-unit explanation (pre-written), the observable note, and per category one fixed tip (catalog copy) that restates the test's own instruction or a verified rule: what FALSE, NO and NOT GIVEN mean (the instructions' wording), that misspelt answers and answers over the limit lose the mark (verified above), that "from the passage" means the passage's words, where the key's evidence is (review), and to compare the question's words with the evidence (paraphrase) or check limiting words (qualifier). The only action offered is to practise those same questions again, labeled as questions attempted before.

#### Targeted practice (M5)

**Decided scope (D16): try again questions from an earlier attempt that were not fully correct or unanswered; no unseen practice in M5.**
- **Which questions:** every answer unit of the source test attempt that is not fully correct (incorrect or partly correct) or unanswered, or the units of a repeated-mistake card. A unit is always included **whole and once**: a retry of 22–23 has both choices empty and counts 2 positions, even if one of them earned a mark before. The link's number is computed after expanding and de-duplicating units ("Try 14 questions again: not correct or no answer" when 13 positions were lost and 22–23 was partly correct).
- **The session:** Practice with only those units; answers start empty; no timer; Pin Evidence available; the navigator ("All questions"), Previous and Next show only those units; "Finish test" and its confirmation as in M4. The header adds "3 of 13 to practise" (positions).
- **Results:** "Your retry": "9 of 14 now correct" and "These are questions you have attempted before. This practice result is not an independent measure of your level." Then the review button (named as on the results page) and "Back to your test results".
- **Validating a retry address** (`?of={id}&q={numbers}`): the source must be a stored **test** attempt of the **current content version**; its record for the current pair is used (written first if needed); the requested numbers are expanded to whole units and every unit must be one the source did not get fully correct. Otherwise a safe state, with "See your last results" and "Start the test":
  - source missing (never existed on this device, or removed by retention): "The attempt these questions came from is no longer on this device.";
  - source from an earlier content version: "This test has changed since that attempt, so its questions can't be practised again.";
  - questions not allowed for that source: "These questions can't be practised from that attempt."
- **What it is not:** independent evidence of ability (never counted in repeated mistakes, never shown out of 40, never combined with the original score, never called improvement); a new test; a content library.
- **Unseen practice** (new questions on a weak point) needs new content: only one demo test exists, and adding content sets is content sourcing (M9). A short original drill set would also need the content contract to allow tests shorter than 3 passages and 40 questions (ADR-0005). Not in M5.
- One retry in progress per test, kept apart from the test's session (ADR-0009 §9): the same retry link resumes it; starting a different retry replaces an unfinished one.

#### Explanations and the AI decision (M5)

**Decided (D12): pre-written explanations and simpler versions in uz, ru and en, without runtime AI.**

**Who writes them, and their status** (ADR-0008 §6). In M5 the explanations, like the demo test and key from M4, are **drafted by Claude (AI)** in a worker task (M5-05): **English first, then ru and uz drafted from the English draft**. All of them stay `aiDraft` in M5 and are never described as written by a person. Each key file and each explanation file carries one review status:

| Status | Meaning | Set by |
|---|---|---|
| `aiDraft` | Drafted by Claude; no person has checked it | The worker task that drafts it |
| `reviewed` | A person has checked it as described below; the review is recorded in PROGRESS.md (reviewer's role, date, what was checked, what changed) | A worker, on the owner's instruction after the recorded review; never without one |
| `approved` | The owner approves it for release | The owner |

**Before beta** (D20; M11-04 to M11-07), every Reading key and explanation file must be `approved`, in this order:
1. **English accuracy review (M11-04, people):** a person with strong English and IELTS Reading knowledge, not the drafting AI, checks every accepted answer and variant against the passage, every cited evidence sentence, every NOT GIVEN judgment, every content tag and `fromPassage`, the questions and passages as far as they affect the answers, and every English explanation and simpler version (grounded only in the passage, accurate, plain, the simpler one saying the same thing more simply). Corrections increase the key revision where the key changes.
2. **Reconcile translations (M11-05, worker):** the ru and uz drafts are updated to every English correction; they stay drafts.
3. **Fluent-speaker review (M11-06, people):** fluent speakers check every ru and uz explanation and simpler version against the reviewed English: same meaning, plain language, consistent terms, English quotes untouched, Uzbek orthography (U+02BB, U+02BC) ([LOCALIZATION.md](../product/LOCALIZATION.md), rule 7). Not raw machine translation.
4. **Owner release approval (M11-07):** the owner sets the files to `approved`.

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

## Part 3. Flows and interface copy

From USER_FLOWS.md.

### Reading results and review flows (M5)

**DRAFT, revised to the owner's M5-01 decision of 2026-10-11** (approval recorded with task M5-01). The screens are specified in [READING_EXPERIENCE.md, M5 specifications](../product/READING_EXPERIENCE.md#m5-specifications-drafts), the visual values in [DESIGN_SYSTEM.md, M5 components](../design/DESIGN_SYSTEM.md#m5-components-reading-results-and-review), the data in ADR-0008 and ADR-0009. The copy is in [Interface copy (M5)](../product/USER_FLOWS.md#interface-copy-m5). Steps count from the M4 reading screen; Reading is still reached by its direct link (M4), and home is unchanged (D18).

#### Finish → results
- **Goal:** right after finishing, the learner sees how many answers were correct and what to do next.
- **Entry point:** "Finish test" in Practice or Exam (M4), or the Exam time-out.
- **Primary action:** on the results page, the red review button, whose text names what it opens: "Review mistakes and unanswered questions", "Review mistakes", "Review unanswered questions" or "Review answers".
- **Steps:** 1. "Finish test" → the confirmation (M4). 2. "Finish" → the results page (`/{locale}/reading/{testId}/results`): "27 of 40 correct", the honest line, "Not correct: 9 · No answer: 4", the red review button, "Mistakes that repeated", and the quiet "Try 14 questions again: not correct or no answer" and "Start again".
- **Step count:** 2, as in M4. An Exam time-out shows the results page with "Time is up." without any step.
- **Empty / error states:** no finished attempt on this device (for example a shared results link) → "No results on this device yet" with the red "Start the test". Results cannot be saved → the notice, results still shown, nothing recoverable removed. An attempt from an earlier content version → its stored score and "This test has changed since you took it…". A record written after a key or rules correction → the correction notice only if something the learner sees changed (with the earlier score only if the score changed). An imported M4 attempt → the note that it was checked later. Unknown test → not-found. Offline after loading → works; opening offline → the M1 error state.
- **Languages checked:** not yet (M5-06: the Russian score line and honest line at 320 px and 200% zoom).

#### Results → understand a mistake
- **Goal:** for each mistake and each unanswered question, see the answer, where it comes from in the passage, and why.
- **Entry point:** the red review button on the results page.
- **Primary action:** reading the review card; moving on with "Next".
- **Steps:** 1. The red review button → the review screen at the first card that is not fully correct or has no answer: the passage with that card's evidence marked and in view, and the review card (outcome, your answer or "You did not answer this question.", correct answer, evidence, why). 2. "Next" → the next such card ("To review: 2 of 12" counts cards; 22–23 is one card).
- **Step count:** 1 from results to the first explanation; 3 from the last test question (finish, confirm, review).
- **Unanswered questions** are never skipped: they are in the sequence, named on the button and shown as "No answer" (not "Not correct").
- **Empty / error states:** all answers correct → the button reads "Review answers" and opens question 1. A question number or attempt not on this device → as above. Review of an attempt from an earlier content version → not available, with the score kept.
- **Languages checked:** not yet (M5-07: the longest outcome, the Russian evidence heading and "Explain simpler" at 320 px; M5-08 at 1024 px).

#### Explain simpler
- **Steps:** 1. "Explain simpler" under the explanation → the simpler version appears right after the button, in the interface language; the button becomes "Hide the simpler explanation".
- **Step count:** 1. Available for every card in Practice and Exam attempts (review happens after the test, so Exam's "no help" rule is kept).

#### Try questions again
- **Goal:** answer once more, without seeing the answers, every question of an attempt that was not fully correct or unanswered, and see how many are now correct.
- **Entry point:** "Try 14 questions again: not correct or no answer" on the results page, or "Practise these questions again" on a repeated-mistake card.
- **Primary action:** answering, then "Finish".
- **Steps:** 1. Tap the link → the reading screen in Practice with only those questions (whole items: 22–23 with both choices empty), answers empty (no start screen: the mode is fixed). 2. Answer and move as in M4; "All questions" lists only these. 3. "Finish test", "Finish" → the retry's results: "Your retry", "9 of 14 now correct", "These are questions you have attempted before. This practice result is not an independent measure of your level.", the review button, "Back to your test results".
- **Step count:** 1 to start.
- **Empty / error states:** nothing to try again → the link is not shown. An unfinished retry of the same questions → resumed. Starting a different retry replaces an unfinished one. The source attempt missing, from an earlier content version, or the questions not allowed → "This practice can't be started" with the reason, "See your last results" and "Start the test".
- **Languages checked:** not yet (M5-09).

#### Come back to results later
- **Steps:** 1. Open the test link → the start screen (M4) with a quiet "See your last results" under "Start", when this device has a finished attempt. 2. Tap it → the results page of the latest test attempt.
- **Step count:** 2. (In M4 the test link showed the finished page instead; D6.)

### Interface copy (M5)

**PROPOSED, revised to the owner's M5-01 decision of 2026-10-11** (approval recorded with task M5-01). Interface strings only. Test content (passages, questions, options, TRUE/FALSE/NOT GIVEN, typed and accepted answers) stays in English from the content. Explanations and their simpler versions are per-test content files, not catalog strings (ADR-0008). `<en>…</en>` marks English answer words inside a localized string, rendered with `lang="en"`. Uzbek uses U+02BB for oʻ and gʻ and U+02BC for the tutuq belgisi. A fluent-speaker review of uz and ru is required before beta, as for M1 to M4. Keys are suggestions.

| Key (suggested) | Used in | en | ru | uz |
|---|---|---|---|---|
| `reading.results.title` | Results H1 and page title | Your results | Ваши результаты | Natijalaringiz |
| `reading.results.score` | Score line (wraps when needed) | {score} of {total} correct | Верно: {score} из {total} | {total} tadan {score} tasi toʻgʻri |
| `reading.results.honest` | Under the score | A practice score on our own practice test. It is not an IELTS band score. | Это результат практики на нашем собственном тесте, а не балл IELTS. | Bu oʻz mashq testimizdagi natija, IELTS bali emas. |
| `reading.results.breakdown` | Under the honest line (positions) | Not correct: {incorrect} · No answer: {unanswered} | Неверно: {incorrect} · Без ответа: {unanswered} | Notoʻgʻri: {incorrect} · Javobsiz: {unanswered} |
| `reading.results.reviewMistakesAndUnanswered` | Results, red, when there are mistakes and unanswered questions | Review mistakes and unanswered questions | Разобрать ошибки и вопросы без ответа | Xatolar va javobsiz savollarni koʻrib chiqish |
| `reading.results.reviewMistakes` | Results, red, mistakes but no unanswered questions | Review mistakes | Разобрать ошибки | Xatolarni koʻrib chiqish |
| `reading.results.reviewUnanswered` | Results, red, unanswered questions but no mistakes | Review unanswered questions | Разобрать вопросы без ответа | Javobsiz savollarni koʻrib chiqish |
| `reading.results.reviewAll` | Results, red, when everything is correct | Review answers | Посмотреть ответы | Javoblarni koʻrib chiqish |
| `reading.results.tryAgain` | Results, quiet; `{count}` = positions of the units not fully correct or unanswered | {count, plural, one {Try # question again: not correct or no answer} other {Try # questions again: not correct or no answer}} | {count, plural, one {Ответить ещё раз на # вопрос с ошибкой или без ответа} few {Ответить ещё раз на # вопроса с ошибкой или без ответа} many {Ответить ещё раз на # вопросов с ошибкой или без ответа} other {Ответить ещё раз на # вопроса с ошибкой или без ответа}} | Xato yoki javobsiz {count} ta savolga qayta javob berish |
| `reading.results.rechecked` | Results, after a correction that changed the score | Rechecked after a correction to the answer key or to how answers are checked. Your earlier result was {score} of {total}. | Перепроверено после исправления ключа ответов или правил проверки. Прежний результат: {score} из {total}. | Javoblar kaliti yoki tekshirish qoidalari tuzatilgandan keyin qayta tekshirildi. Oldingi natija: {total} tadan {score}. |
| `reading.results.recheckedSameScore` | Results, after a correction that changed outcomes or notes but not the score | Rechecked after a correction to the answer key or to how answers are checked. Your score is the same; some answers or notes changed. | Перепроверено после исправления ключа ответов или правил проверки. Результат тот же, но изменились некоторые ответы или пояснения. | Javoblar kaliti yoki tekshirish qoidalari tuzatilgandan keyin qayta tekshirildi. Natija oʻzgarmadi, lekin baʼzi javoblar yoki izohlar oʻzgardi. |
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
| `reading.review.partly` | Outcome of a partly correct "choose several" item | {correct} of {total} correct | Верно {correct} из {total} | {total} tadan {correct} tasi toʻgʻri |
| `reading.review.yourAnswer` | Typed answer label | Your answer | Ваш ответ | Sizning javobingiz |
| `reading.review.yourAnswerCorrect` | Option label: chosen and accepted | Your answer, correct | Ваш ответ, верно | Sizning javobingiz, toʻgʻri |
| `reading.review.yourAnswerIncorrect` | Option label: chosen and not accepted | Your answer, not correct | Ваш ответ, неверно | Sizning javobingiz, notoʻgʻri |
| `reading.review.correctAnswer` | Typed label; option label: accepted, not chosen | Correct answer | Правильный ответ | Toʻgʻri javob |
| `reading.review.alsoAccepted` | Typed answer label | Also accepted | Также засчитывается | Bu ham qabul qilinadi |
| `reading.review.noAnswerGiven` | Unanswered card | You did not answer this question. | Вы не ответили на этот вопрос. | Bu savolga javob bermagansiz. |
| `reading.review.evidenceTitle` | Evidence block | Evidence in the passage | Подтверждение в тексте | Matndagi dalil |
| `reading.review.relatedTitle` | Evidence block for NOT GIVEN with related sentences | Where the passage talks about this | Где в тексте говорится об этом | Matnda bu haqda soʻz boradigan joy |
| `reading.review.why` | Explanation heading | Why | Почему | Nima uchun |
| `reading.review.simpler` | Disclosure button | Explain simpler | Объяснить проще | Soddaroq tushuntirish |
| `reading.review.simplerHide` | Disclosure button, open | Hide the simpler explanation | Скрыть простое объяснение | Sodda tushuntirishni yashirish |
| `reading.review.simplerTitle` | Before the simpler text | In simple words | Простыми словами | Oddiy soʻzlar bilan |
| `reading.review.pinMatch` | Under "Your evidence" | You pinned a sentence the answer key cites as evidence. | Вы закрепили предложение, которое ключ ответов приводит как подтверждение. | Siz javoblar kaliti dalil sifatida keltirgan gapni biriktirgansiz. |
| `reading.review.pinMiss` | Under "Your evidence" | None of your pinned sentences is one the answer key cites as evidence. | Ни одно из закреплённых вами предложений не указано в ключе ответов как подтверждение. | Siz biriktirgan gaplarning hech biri javoblar kalitida dalil sifatida koʻrsatilmagan. |
| `reading.review.pinNotGiven` | Under "Your evidence", NOT GIVEN | The answer is <en>NOT GIVEN</en>, so no sentence in the passage confirms or contradicts the statement. | Ответ: <en>NOT GIVEN</en>, поэтому ни одно предложение текста не подтверждает и не опровергает утверждение. | Javob: <en>NOT GIVEN</en>, shuning uchun matndagi hech bir gap fikrni tasdiqlamaydi ham, rad etmaydi ham. |
| `reading.review.toReview` | Under the card heading in the review sequence (cards) | To review: {current} of {total} | Разбор: {current} из {total} | Tahlil: {total} tadan {current} |
| `reading.review.evidenceMarker` | Accessible name of an evidence chip | Evidence for question {number} | Подтверждение к вопросу {number} | {number}-savol uchun dalil |
| `reading.review.relatedMarker` | Accessible name of a "related" chip | Related to question {number} | Относится к вопросу {number} | {number}-savolga tegishli |
| `reading.navigator.correct` | Navigator state word in review | correct | верно | toʻgʻri |
| `reading.navigator.incorrect` | Navigator state word in review | not correct | неверно | notoʻgʻri |
| `reading.navigator.partly` | Navigator state word in review, "choose several" item | partly correct | частично верно | qisman toʻgʻri |
| `reading.navigator.itemRange` | Accessible name of a navigator button of a "choose several" item | Questions {from}–{to}, {states} | Вопросы {from}–{to}, {states} | {from}–{to}-savollar, {states} |
| `reading.signals.ngInsteadOfFalse.facts` | Note, TRUE/FALSE/NOT GIVEN | You chose <en>NOT GIVEN</en>. The passage contradicts this statement, so the answer is <en>FALSE</en>. <en>NOT GIVEN</en> would mean the passage gives no information on it. | Вы выбрали <en>NOT GIVEN</en>. Текст противоречит этому утверждению, поэтому ответ: <en>FALSE</en>. <en>NOT GIVEN</en> означало бы, что в тексте нет информации об этом. | Siz <en>NOT GIVEN</en> ni tanladingiz. Matn bu fikrga zid, shuning uchun javob: <en>FALSE</en>. <en>NOT GIVEN</en> matnda bu haqda maʼlumot yoʻqligini bildirardi. |
| `reading.signals.ngInsteadOfFalse.views` | Note, YES/NO/NOT GIVEN | You chose <en>NOT GIVEN</en>. The writer's views contradict this statement, so the answer is <en>NO</en>. <en>NOT GIVEN</en> would mean it is impossible to say what the writer thinks about it. | Вы выбрали <en>NOT GIVEN</en>. Взгляды автора противоречат этому утверждению, поэтому ответ: <en>NO</en>. <en>NOT GIVEN</en> означало бы, что невозможно сказать, что автор об этом думает. | Siz <en>NOT GIVEN</en> ni tanladingiz. Muallifning fikri bu fikrga zid, shuning uchun javob: <en>NO</en>. <en>NOT GIVEN</en> muallif bu haqda nima deb oʻylashini aytib boʻlmasligini bildirardi. |
| `reading.signals.falseInsteadOfNg.facts` | Note, TRUE/FALSE/NOT GIVEN | You chose <en>FALSE</en>. The passage gives no information on this: it neither agrees with nor contradicts the statement, so the answer is <en>NOT GIVEN</en>. <en>FALSE</en> would need a sentence that contradicts it. | Вы выбрали <en>FALSE</en>. В тексте нет информации об этом: он не подтверждает утверждение и не противоречит ему, поэтому ответ: <en>NOT GIVEN</en>. Для <en>FALSE</en> нужно предложение, которое ему противоречит. | Siz <en>FALSE</en> ni tanladingiz. Matnda bu haqda maʼlumot yoʻq: u fikrni tasdiqlamaydi ham, unga zid ham emas, shuning uchun javob: <en>NOT GIVEN</en>. <en>FALSE</en> uchun fikrga zid gap kerak. |
| `reading.signals.falseInsteadOfNg.views` | Note, YES/NO/NOT GIVEN | You chose <en>NO</en>. It is impossible to say what the writer thinks about this: the passage neither agrees with nor contradicts the statement, so the answer is <en>NOT GIVEN</en>. <en>NO</en> would need the writer's views to contradict it. | Вы выбрали <en>NO</en>. Невозможно сказать, что автор об этом думает: текст не подтверждает утверждение и не противоречит ему, поэтому ответ: <en>NOT GIVEN</en>. Для <en>NO</en> взгляды автора должны ему противоречить. | Siz <en>NO</en> ni tanladingiz. Muallif bu haqda nima deb oʻylashini aytib boʻlmaydi: matn fikrni tasdiqlamaydi ham, unga zid ham emas, shuning uchun javob: <en>NOT GIVEN</en>. <en>NO</en> uchun muallifning fikri unga zid boʻlishi kerak. |
| `reading.signals.ngInsteadOfTrue.facts` | Note, TRUE/FALSE/NOT GIVEN | You chose <en>NOT GIVEN</en>. The passage agrees with this statement, so the answer is <en>TRUE</en>. <en>NOT GIVEN</en> would mean the passage gives no information on it. | Вы выбрали <en>NOT GIVEN</en>. Текст подтверждает это утверждение, поэтому ответ: <en>TRUE</en>. <en>NOT GIVEN</en> означало бы, что в тексте нет информации об этом. | Siz <en>NOT GIVEN</en> ni tanladingiz. Matn bu fikrni tasdiqlaydi, shuning uchun javob: <en>TRUE</en>. <en>NOT GIVEN</en> matnda bu haqda maʼlumot yoʻqligini bildirardi. |
| `reading.signals.ngInsteadOfTrue.views` | Note, YES/NO/NOT GIVEN | You chose <en>NOT GIVEN</en>. The statement agrees with the writer's views, so the answer is <en>YES</en>. <en>NOT GIVEN</en> would mean it is impossible to say what the writer thinks about it. | Вы выбрали <en>NOT GIVEN</en>. Утверждение совпадает со взглядами автора, поэтому ответ: <en>YES</en>. <en>NOT GIVEN</en> означало бы, что невозможно сказать, что автор об этом думает. | Siz <en>NOT GIVEN</en> ni tanladingiz. Fikr muallifning qarashlariga mos, shuning uchun javob: <en>YES</en>. <en>NOT GIVEN</en> muallif bu haqda nima deb oʻylashini aytib boʻlmasligini bildirardi. |
| `reading.signals.trueInsteadOfNg.facts` | Note, TRUE/FALSE/NOT GIVEN | You chose <en>TRUE</en>. The passage gives no information on this: it neither agrees with nor contradicts the statement, so the answer is <en>NOT GIVEN</en>. <en>TRUE</en> would need a sentence that agrees with it. | Вы выбрали <en>TRUE</en>. В тексте нет информации об этом: он не подтверждает утверждение и не противоречит ему, поэтому ответ: <en>NOT GIVEN</en>. Для <en>TRUE</en> нужно предложение, которое его подтверждает. | Siz <en>TRUE</en> ni tanladingiz. Matnda bu haqda maʼlumot yoʻq: u fikrni tasdiqlamaydi ham, unga zid ham emas, shuning uchun javob: <en>NOT GIVEN</en>. <en>TRUE</en> uchun fikrni tasdiqlaydigan gap kerak. |
| `reading.signals.trueInsteadOfNg.views` | Note, YES/NO/NOT GIVEN | You chose <en>YES</en>. It is impossible to say what the writer thinks about this, so the answer is <en>NOT GIVEN</en>. <en>YES</en> would need the statement to agree with the writer's views. | Вы выбрали <en>YES</en>. Невозможно сказать, что автор об этом думает, поэтому ответ: <en>NOT GIVEN</en>. Для <en>YES</en> утверждение должно совпадать со взглядами автора. | Siz <en>YES</en> ni tanladingiz. Muallif bu haqda nima deb oʻylashini aytib boʻlmaydi, shuning uchun javob: <en>NOT GIVEN</en>. <en>YES</en> uchun fikr muallifning qarashlariga mos boʻlishi kerak. |
| `reading.signals.oneLetterAway` | Note ("Possible spelling issue"; never changes the mark) | Your answer differs from an accepted answer by one letter. | Ваш ответ отличается от принятого ответа одной буквой. | Javobingiz qabul qilingan javobdan bitta harf bilan farq qiladi. |
| `reading.signals.wordLimit` | Note | Your answer has more words than the instruction allows. | В вашем ответе больше слов, чем разрешает задание. | Javobingizda topshiriq ruxsat berganidan koʻproq soʻz bor. |
| `reading.signals.notFromPassage` | Note | Your answer uses a word that is not in the passage. This task asks for words from the passage. | В ответе есть слово, которого нет в тексте. В этом задании нужны слова из текста. | Javobingizda matnda yoʻq soʻz bor. Bu topshiriqda matndagi soʻzlar kerak. |
| `reading.signals.timeUp` | Note on unanswered questions of a timed-out Exam | This question had no answer when the time ran out. | Когда время закончилось, на этот вопрос не было ответа. | Vaqt tugaganda bu savolga javob berilmagan edi. |
| `reading.patterns.title` | Results section heading | Mistakes that repeated | Повторившиеся ошибки | Takrorlangan xatolar |
| `reading.patterns.scopeThisTry` | Under the heading, on the first attempt's results | In this attempt at this test. One test is not enough to show a lasting weakness. | В этой попытке этого теста. Одного теста мало, чтобы говорить о постоянной слабости. | Bu testdagi shu urinishda. Doimiy zaif tomonni koʻrsatish uchun bitta test yetarli emas. |
| `reading.patterns.scopeFirstTry` | Under the heading, on a later attempt's results | From your first attempt at this test on this device. Later attempts repeat questions you have worked on before, so they are not used. One test is not enough to show a lasting weakness. | По вашей первой попытке этого теста на этом устройстве. Последующие попытки повторяют вопросы, над которыми вы уже работали, поэтому не учитываются. Одного теста мало, чтобы говорить о постоянной слабости. | Bu qurilmadagi bu testning birinchi urinishingiz boʻyicha. Keyingi urinishlar avval ishlagan savollaringizni takrorlaydi, shuning uchun hisobga olinmaydi. Doimiy zaif tomonni koʻrsatish uchun bitta test yetarli emas. |
| `reading.patterns.noneThisTry` | No repeated category, first attempt | Not enough evidence to show a repeated pattern in this attempt. | Недостаточно данных, чтобы показать повторяющуюся закономерность в этой попытке. | Bu urinishda takrorlanuvchi qonuniyatni koʻrsatish uchun maʼlumot yetarli emas. |
| `reading.patterns.noneFirstTry` | No repeated category, later attempt | Not enough evidence to show a repeated pattern in your first attempt at this test. | Недостаточно данных, чтобы показать повторяющуюся закономерность в вашей первой попытке этого теста. | Bu testdagi birinchi urinishingizda takrorlanuvchi qonuniyatni koʻrsatish uchun maʼlumot yetarli emas. |
| `reading.patterns.unknownFirstTry` | First attempt unknown (M4 import, other entries) | We can't tell which was your first try at this test on this device, so we don't look for repeated mistakes in it. | Мы не знаем, какая попытка этого теста на этом устройстве была первой, поэтому не ищем в нём повторяющиеся ошибки. | Bu qurilmada bu testning qaysi urinishi birinchi boʻlganini bilmaymiz, shuning uchun undagi takrorlangan xatolarni qidirmaymiz. |
| `reading.patterns.unavailable` | First attempt from an earlier content version | Repeated mistakes can't be shown because this test has changed since your first attempt. | Повторяющиеся ошибки нельзя показать: тест изменился после вашей первой попытки. | Takrorlangan xatolarni koʻrsatib boʻlmaydi: birinchi urinishingizdan keyin test oʻzgargan. |
| `reading.patterns.practise` | Pattern card, quiet | Practise these questions again | Повторить эти вопросы | Bu savollarni qayta ishlash |
| `reading.patterns.ngFalse.title` | Pattern card | <en>NOT GIVEN</en> mixed up with <en>FALSE</en> or <en>NO</en> | <en>NOT GIVEN</en> путается с <en>FALSE</en> или <en>NO</en> | <en>NOT GIVEN</en> bilan <en>FALSE</en> yoki <en>NO</en> adashtirilgan |
| `reading.patterns.ngFalse.count` | Pattern card | {count} of {total} questions whose answer was <en>NOT GIVEN</en>, <en>FALSE</en> or <en>NO</en> (questions {numbers}) | {count} из {total, plural, one {# вопроса} other {# вопросов}} с ответом <en>NOT GIVEN</en>, <en>FALSE</en> или <en>NO</en> (вопросы {numbers}) | Javobi <en>NOT GIVEN</en>, <en>FALSE</en> yoki <en>NO</en> boʻlgan {total} ta savoldan {count} tasi ({numbers}-savollar) |
| `reading.patterns.ngFalse.tip` | Pattern card | <en>FALSE</en> or <en>NO</en> means the passage, or the writer's view, contradicts the statement. <en>NOT GIVEN</en> means it neither agrees nor contradicts: the information or the writer's view is not there. Before choosing <en>FALSE</en> or <en>NO</en>, find what contradicts the statement. | <en>FALSE</en> или <en>NO</en>: текст или взгляд автора противоречит утверждению. <en>NOT GIVEN</en>: текст не подтверждает и не опровергает его, такой информации или мнения автора нет. Прежде чем выбрать <en>FALSE</en> или <en>NO</en>, найдите то, что противоречит утверждению. | <en>FALSE</en> yoki <en>NO</en>: matn yoki muallif fikri bu fikrga zid. <en>NOT GIVEN</en>: matn uni tasdiqlamaydi ham, rad etmaydi ham, bunday maʼlumot yoki muallif fikri yoʻq. <en>FALSE</en> yoki <en>NO</en> ni tanlashdan oldin fikrga zid narsani toping. |
| `reading.patterns.ngTrue.title` | Pattern card | <en>NOT GIVEN</en> mixed up with <en>TRUE</en> or <en>YES</en> | <en>NOT GIVEN</en> путается с <en>TRUE</en> или <en>YES</en> | <en>NOT GIVEN</en> bilan <en>TRUE</en> yoki <en>YES</en> adashtirilgan |
| `reading.patterns.ngTrue.count` | Pattern card | {count} of {total} questions whose answer was <en>NOT GIVEN</en>, <en>TRUE</en> or <en>YES</en> (questions {numbers}) | {count} из {total, plural, one {# вопроса} other {# вопросов}} с ответом <en>NOT GIVEN</en>, <en>TRUE</en> или <en>YES</en> (вопросы {numbers}) | Javobi <en>NOT GIVEN</en>, <en>TRUE</en> yoki <en>YES</en> boʻlgan {total} ta savoldan {count} tasi ({numbers}-savollar) |
| `reading.patterns.ngTrue.tip` | Pattern card | <en>TRUE</en> or <en>YES</en> needs the passage, or the writer's view, to agree with the statement, often in other words. If nothing agrees and nothing contradicts, the answer is <en>NOT GIVEN</en>. | Для <en>TRUE</en> или <en>YES</en> текст или взгляд автора должен совпадать с утверждением, часто другими словами. Если ничто не подтверждает и не противоречит, ответ: <en>NOT GIVEN</en>. | <en>TRUE</en> yoki <en>YES</en> uchun matn yoki muallif fikri bu fikrga mos boʻlishi kerak, koʻpincha boshqa soʻzlar bilan. Hech narsa tasdiqlamasa va zid boʻlmasa, javob: <en>NOT GIVEN</en>. |
| `reading.patterns.oneLetterAway.title` | Pattern card | Possible spelling issues | Возможные ошибки в написании | Ehtimoliy imlo xatolari |
| `reading.patterns.oneLetterAway.count` | Pattern card | {count} of {total} typed answers were one letter away from an accepted answer (questions {numbers}) | {count} из {total, plural, one {# письменного ответа} other {# письменных ответов}} отличались от принятого ответа одной буквой (вопросы {numbers}) | Yozilgan {total} ta javobdan {count} tasi qabul qilingan javobdan bitta harf bilan farq qildi ({numbers}-savollar) |
| `reading.patterns.oneLetterAway.tip` | Pattern card (rule: Cambridge IELTS FAQs) | One letter away may be a spelling slip or a different word. In the test, a misspelt answer loses the mark, so copy words from the passage letter by letter. | Отличие в одну букву может быть опиской, а может быть другим словом. На экзамене ответ с ошибкой в написании не засчитывается, поэтому переписывайте слова из текста буква за буквой. | Bitta harf farqi imlo xatosi ham, boshqa soʻz ham boʻlishi mumkin. Imtihonda xato yozilgan javob uchun ball berilmaydi, shuning uchun soʻzlarni matndan harfma-harf koʻchiring. |
| `reading.patterns.wordLimit.title` | Pattern card | Too many words | Слишком много слов | Soʻzlar juda koʻp |
| `reading.patterns.wordLimit.count` | Pattern card | {count} of {total} typed answers had more words than allowed (questions {numbers}) | {count} из {total, plural, one {# письменного ответа} other {# письменных ответов}} содержали больше слов, чем разрешено (вопросы {numbers}) | Yozilgan {total} ta javobdan {count} tasida ruxsat etilganidan koʻp soʻz bor edi ({numbers}-savollar) |
| `reading.patterns.wordLimit.tip` | Pattern card (rule: ielts.org Reading format pages) | In the test, an answer with more words than allowed loses the mark. Check the limit in the instruction, for example <en>NO MORE THAN TWO WORDS</en>, and write only the words that answer the question. | На экзамене ответ, в котором больше слов, чем разрешено, не засчитывается. Проверяйте ограничение в задании, например <en>NO MORE THAN TWO WORDS</en>, и пишите только слова, которые отвечают на вопрос. | Imtihonda ruxsat etilganidan koʻp soʻzli javob uchun ball berilmaydi. Topshiriqdagi cheklovni tekshiring, masalan <en>NO MORE THAN TWO WORDS</en>, va faqat savolga javob boʻladigan soʻzlarni yozing. |
| `reading.patterns.notFromPassage.title` | Pattern card | Words not from the passage | Слова не из текста | Matnda yoʻq soʻzlar |
| `reading.patterns.notFromPassage.count` | Pattern card | {count} of {total} typed answers used a word that is not in the passage (questions {numbers}) | В {count} из {total, plural, one {# письменного ответа} other {# письменных ответов}} есть слово, которого нет в тексте (вопросы {numbers}) | Yozilgan {total} ta javobdan {count} tasida matnda yoʻq soʻz bor edi ({numbers}-savollar) |
| `reading.patterns.notFromPassage.tip` | Pattern card | When the instruction says <en>from the passage</en>, write the passage's own words, even if you know a synonym. | Если в задании сказано <en>from the passage</en>, пишите слова из текста, даже если знаете синоним. | Topshiriqda <en>from the passage</en> deyilgan boʻlsa, sinonimni bilsangiz ham, matndagi soʻzlarni yozing. |
| `reading.patterns.pins.title` | Pattern card | Pins differed from the cited evidence | Закреплённые предложения не совпали с подтверждением из ключа | Biriktirilgan gaplar kalitdagi dalilga mos kelmadi |
| `reading.patterns.pins.count` | Pattern card | {count} of {total} questions with pinned sentences: none of the pins was a sentence the key cites (questions {numbers}) | {count} из {total, plural, one {# вопроса} other {# вопросов}} с закреплёнными предложениями: ни одно не указано в ключе (вопросы {numbers}) | Gap biriktirilgan {total} ta savoldan {count} tasida biriktirilgan gaplarning hech biri kalitda koʻrsatilmagan ({numbers}-savollar) |
| `reading.patterns.pins.tip` | Pattern card | Compare your pinned sentence with the sentence the review cites. Look for the same idea in the passage, not only the same words. | Сравните закреплённое предложение с тем, которое приводится в разборе. Ищите в тексте ту же мысль, а не только те же слова. | Biriktirgan gapingizni tahlilda keltirilgan gap bilan solishtiring. Matndan faqat oʻsha soʻzlarni emas, oʻsha fikrni qidiring. |
| `reading.patterns.paraphrase.title` | Pattern card (content tag) | Questions that use other words | Вопросы, сформулированные другими словами | Boshqa soʻzlar bilan berilgan savollar |
| `reading.patterns.paraphrase.count` | Pattern card | {count} of {total} questions that say the passage's idea in other words were not fully correct (questions {numbers}) | Не полностью верно: {count} из {total, plural, one {# вопроса} other {# вопросов}}, где мысль текста передана другими словами (вопросы {numbers}) | Matndagi fikr boshqa soʻzlar bilan berilgan {total} ta savoldan {count} tasi toʻliq toʻgʻri emas ({numbers}-savollar) |
| `reading.patterns.paraphrase.tip` | Pattern card | Look for the same idea, not the same words. In the review, compare the question's words with the evidence. | Ищите ту же мысль, а не те же слова. В разборе сравните слова вопроса с подтверждением. | Bir xil soʻzlarni emas, bir xil fikrni qidiring. Tahlilda savoldagi soʻzlarni dalil bilan solishtiring. |
| `reading.patterns.qualifier.title` | Pattern card (content tag) | Questions that turn on a small word | Вопросы, где всё решает одно маленькое слово | Bitta kichik soʻzga bogʻliq savollar |
| `reading.patterns.qualifier.count` | Pattern card | {count} of {total} questions that turn on a word like <en>all</en>, <en>most</en> or <en>only</en> were not fully correct (questions {numbers}) | Не полностью верно: {count} из {total, plural, one {# вопроса} other {# вопросов}}, где всё решает слово вроде <en>all</en>, <en>most</en> или <en>only</en> (вопросы {numbers}) | <en>all</en>, <en>most</en> yoki <en>only</en> kabi soʻzga bogʻliq {total} ta savoldan {count} tasi toʻliq toʻgʻri emas ({numbers}-savollar) |
| `reading.patterns.qualifier.tip` | Pattern card | Check words such as <en>all</en>, <en>most</en>, <en>some</en>, <en>only</en>, <en>always</en> and <en>never</en> in both the question and the passage. | Сверяйте слова вроде <en>all</en>, <en>most</en>, <en>some</en>, <en>only</en>, <en>always</en> и <en>never</en> в вопросе и в тексте. | Savolda ham, matnda ham <en>all</en>, <en>most</en>, <en>some</en>, <en>only</en>, <en>always</en> va <en>never</en> kabi soʻzlarni tekshiring. |
| `reading.retry.progress` | Retry sheet header, under the question number (positions) | {current} of {total} to practise | {current} из {total} для повторения | Takrorlash uchun {total} tadan {current} |
| `reading.retry.title` | Retry results H1 | Your retry | Повторная практика | Takroriy mashq |
| `reading.retry.score` | Retry results | {score} of {total} now correct | Теперь верно: {score} из {total} | Endi {total} tadan {score} tasi toʻgʻri |
| `reading.retry.honest` | Retry results | These are questions you have attempted before. This practice result is not an independent measure of your level. | Это вопросы, которые вы уже пробовали раньше. Этот результат практики не является независимой оценкой вашего уровня. | Bu savollarni avval ishlab koʻrgansiz. Bu mashq natijasi darajangizning mustaqil oʻlchovi emas. |
| `reading.retry.backToResults` | Retry results, quiet | Back to your test results | Вернуться к результатам теста | Test natijalariga qaytish |
| `reading.retry.unavailable` | Retry safe state H1 | This practice can't be started | Эту практику нельзя начать | Bu mashqni boshlab boʻlmaydi |
| `reading.retry.sourceMissing` | Retry safe state | The attempt these questions came from is no longer on this device. | Попытки, из которой взяты эти вопросы, больше нет на этом устройстве. | Bu savollar olingan urinish endi bu qurilmada yoʻq. |
| `reading.retry.sourceOldVersion` | Retry safe state | This test has changed since that attempt, so its questions can't be practised again. | Тест изменился после той попытки, поэтому её вопросы нельзя повторить. | Oʻsha urinishdan keyin test oʻzgargan, shuning uchun uning savollarini qayta ishlab boʻlmaydi. |
| `reading.retry.notAllowed` | Retry safe state | These questions can't be practised from that attempt. | Эти вопросы нельзя повторить из той попытки. | Bu savollarni oʻsha urinishdan qayta ishlab boʻlmaydi. |

Reused without change: "Time is up.", "Start again", "Show in passage", "Your evidence", "Paragraph {letter}", "All questions", "Previous", "Next", "Finish test" and the finish confirmation, the navigator's "no answer" and "current", the navigator item name, "Practice" / "Exam", "Start the test", and "See your last results" in the retry safe state.

## Part 4. Design values

From DESIGN_SYSTEM.md.

### M5 components (Reading results and review)

**DRAFT, revised to the owner's M5-01 decision of 2026-10-11** (approval recorded with task M5-01). Visual values for the M5 drafts ([READING_EXPERIENCE.md, M5 specifications](../product/READING_EXPERIENCE.md#m5-specifications-drafts)). Reused unchanged: the brand palette, the type scale, the focus style, motion, the breakpoints, the M3 primary button and quiet link, the M4 secondary button, option rows, test bar, sheet, navigator cells, "Your evidence" quote style and desktop columns, including the approved desktop navigator bar (content-driven height: two rows at 1280 px and up to three at 1024 px acceptable; Previous, Next and "Mark for review" keep their text labels). Contrast computed with the WCAG 2.x formula.

#### Status: correct, not correct, no answer
The [Status colors](../design/DESIGN_SYSTEM.md#status-colors) are TBD and M5 is the first milestone that shows correctness. **Every outcome is an icon plus a word** ("Correct", "Not correct", "No answer", and for a "choose several" item "1 of 2 correct"), never color alone (I-8); color only supports "correct". "No answer" is its own state, never drawn as "not correct".

| Outcome | Icon (20 px; 16 px in navigator badges) | Color | Contrast |
|---|---|---|---|
| Correct | A check mark in a filled circle | **New token `status.correct` `#157A3C`** (green) for the circle; white check | 5.41:1 on `surface.base`, 5.15:1 on `surface.warm`; white on it 5.41:1. Usable for text too (AA) |
| Not correct | A cross in an outlined circle | `ink` (no new color) | 18.58:1 |
| No answer | A dash in a dashed-outline circle | `text.secondary` | 8.22:1 |
| Partly correct ("choose several" item only) | A circle whose start half is filled | `status.correct` fill, `ink` outline | Fill 5.41:1, outline 18.58:1 on `surface.base`; the words "1 of 2 correct" carry the meaning |

- **Why "not correct" gets no color (decided, D11):** red is the brand's action color and this document requires "incorrect" to stay distinct from it and from Reading's red family; a second hue (orange, amber, purple) would collide with a skill color or read as a warning. The cross and the word carry the meaning; the screen stays calm, as review should.
- **Not chosen:** a dedicated "incorrect" hue outside the red family (for example a dark amber `#9A5B00`, 5.43:1 on white): amber reads as "warning", and Writing's orange is close.
- `status.correct` is a yellower green than Speaking's teal (`#0F7A5A`); the two never appear together without their labels.

#### Results page
- Inside the shell (header with the language switcher), in the approved onboarding and home column (36rem).
- "Time is up." (when the Exam timed out) in Heading 3 above the H1, as on the M4 finished page.
- **Score:** "27 of 40 correct" in Heading 1 size, weight 800, the score in tabular figures, prominent but **allowed to wrap** at narrow widths and at 200% zoom (never forced onto one line, never truncated). No ring, gauge, chart, percentage, confetti or color fill ([UI_ANTI_PATTERNS.md](../design/UI_ANTI_PATTERNS.md)).
- The honest line in body text `ink` directly under the score; the breakdown ("Not correct: 9 · No answer: 4") in body text `text.secondary`, each count with its outcome icon.
- Notes (rechecked, imported, older version, storage) in body text `ink` with the 20 px info icon, 16 px under the breakdown, before the button.
- The red review button 24 px below (its text names what it opens); "Mistakes that repeated" 32 px below it; the quiet links ("Try 14 questions again: not correct or no answer", "Start again") last, 8 px apart. Long Russian and Uzbek link texts wrap.

**Result states** (each is the same page; only the listed parts change):

| State | Score line | Note | Red button | Repeated mistakes | Quiet links |
|---|---|---|---|---|---|
| Finished, mistakes and unanswered | "27 of 40 correct" | none | "Review mistakes and unanswered questions" | Cards, or the "none" text, with the scope line | Try again, Start again |
| Finished, mistakes only | as above | none | "Review mistakes" | as above | as above |
| Finished, unanswered only | as above | none | "Review unanswered questions" | as above | as above |
| Everything correct | "40 of 40 correct" | none | "Review answers" | the "none" text | Start again |
| Exam time-out | as above, "Time is up." above the H1 | none | as above | as above | as above |
| Rechecked, score changed | the new score | "Rechecked… Your earlier result was 27 of 40." | as above | from the first attempt's current record | as above |
| Rechecked, score unchanged but outcomes or notes changed | the score | "Rechecked… Your score is the same; some answers or notes changed." | as above | as above | as above |
| Rechecked, nothing visible changed | the score | none | as above | as above | as above |
| Imported from M4 | as above | "You finished this test before the app checked answers…" | as above | "We can't tell which was your first try…" | as above |
| First attempt from an earlier content version | as above | none | as above | "Repeated mistakes can't be shown because this test has changed…" | as above |
| Earlier content version, result stored | the stored score | "This test has changed since you took it, so a detailed review is not available." | none; "Start the test" becomes the red button | none | none |
| Earlier content version, no result | none | "…so your answers can't be checked." | "Start the test" | none | none |
| No attempt on this device | none; H1 "No results on this device yet" and its sentence | none | "Start the test" | none | none |
| Storage blocked or full | as in the matching state | the storage notice | as above | as above | as above |
| A retry's results | H1 "Your retry", "9 of 14 now correct" and "These are questions you have attempted before…" | none | the review button for the retry | never | "Back to your test results" |
| A retry that can't be started | H1 "This practice can't be started" and the reason (source missing, earlier content version, questions not allowed) | none | "See your last results" | never | "Start the test" |

#### Pattern card ("Mistakes that repeated")
- At most two cards. A card is allowed here because each is one distinct unit with its own action ([UI_ANTI_PATTERNS.md](../design/UI_ANTI_PATTERNS.md)): `surface.warm`, `radius.lg`, 16 px padding, no shadow, no border.
- The scope line ("In this attempt at this test…" or "From your first attempt…") in body text `text.secondary` under the section heading, before the cards.
- Title in Heading 3; the count line in body text; the tip in body text `text.secondary` (7.83:1 on warm); the action "Practise these questions again" as a quiet link (48 px tap area). English answer words (TRUE, NOT GIVEN) inside are `lang="en"`, not styled differently.
- The "not enough evidence", "first try unknown" and "unavailable" texts are plain body text, not cards.

#### Review: passage marks
- **Evidence of the current question:** an inline chip before the sentence, like the M4 pin marker (`radius.full`, 1 px `ink` border, `surface.base`), with a 14 px quote-mark icon and the question number in bold meta text, plus a 2 px **dotted** `ink` underline under the sentence (18.58:1). Accessible name: "Evidence for question 5".
- **NOT GIVEN "related" sentences:** the same chip with an outlined (not filled) quote icon and the accessible name "Related to question 3"; the underline is dashed, so "related" and "evidence" differ by shape, not color.
- **The user's own marks:** highlights keep the approved `highlight` tint and border; the current question's pins keep the M4 pin chip. A sentence can carry both chips; the chips sit side by side and wrap with the text.
- Selection (blush) is not used in review: sentences are not selectable there.

#### Review card (phone sheet and desktop column)
- **One card per answer unit** ("Questions 22–23" is one card). **Header row:** "Question 5 of 40" in Heading 3, then the unit outcome (icon and word, body weight 700) on its own line; on phones, "All questions" stays in the header as in M4. In the review sequence, "To review: 3 of 12" (cards) in meta text `text.secondary` under the heading.
- **Answers:**
  - Choice and list types (including "choose several"): the question's option rows, read-only (no hover, no pressed state; they are a list, not controls), each labeled on its own: "Your answer, correct" (correct icon, 2 px `status.correct` boundary), "Your answer, not correct" (cross icon, 2 px `ink` dashed boundary), or "Correct answer" for an accepted option the learner did not choose (correct icon, 2 px `status.correct` boundary). Other options stay plain. Labels are text, so nothing depends on the boundary color, and no label ties a positional mark to a letter.
  - Typed types: two label-value rows, "Your answer" and "Correct answer" (and "Also accepted"), the values in passage typography with `lang="en"`. An unanswered question shows "You did not answer this question." in place of the value, with the "No answer" icon.
- **Evidence block:** the M4 "Your evidence" quote style (`surface.warm`, `radius.md`, 12/16 px padding, the paragraph label in meta text, the sentence in passage typography) under the heading "Evidence in the passage" (or "Where the passage talks about this"), each with "Show in passage" as a quiet link. **When a NOT GIVEN answer has no related sentences, the block is not rendered**: no heading, no empty container, no "Show in passage".
- **Explanation:** heading "Why" in Heading 3, body text in the interface language; `lang="en"` spans in the same style.
- **"Explain simpler":** a secondary button (the M4 secondary button) with `aria-expanded`; the simpler text appears right after it, introduced by "In simple words" in bold, with a 4 px `ink` bar along its start edge (the approved current-question bar), so it is visibly a second version and not a new section.
- **Signal notes:** one sentence each in body text with a 20 px info icon (a circle with "i", `ink`), not a status color.
- **Your evidence comparison** (Practice attempts with pins): the M4 "Your evidence" block, followed by one sentence in body text weight 700 about agreement with the key's cited sentences.
- Spacing between blocks 24 px; inside a block 8 px. Previous / Next as in M4.

#### Review: navigator outcome badges
- The M4 cells (44 × 44 px, number in the cell). In review: a correct question's cell gets the 16 px correct badge in the top corner (where M4 shows the flag); a not-correct question's cell the cross badge; an unanswered question keeps the M4 "unanswered" outline style plus the dash badge. Both cells of a "choose several" item show **the unit's** badge (including "partly correct") and open the same card. Fills: none (all cells are outlined), so the badge shapes carry the outcome. The current cell keeps the M4 3 px `ink` bar. Flags are not shown in review.
- Accessible names: "Question 5, not correct, current"; "Question 38, no answer"; "Questions 22–23, partly correct".
- **In a retry**, the navigator lists only the retried units (as in the test screen, without badges).

#### Review on phone, tablet and desktop

| | Phone (320–599 px) | Tablet (600–1023 px) | Desktop (from 1024 px) |
|---|---|---|---|
| Frame | Test bar ("Results", passage, no timer) | Same | Same |
| Passage | Full width between the gutters, read-only, marks as above | Centered at the 40rem measure | Start column, 55%, at the 40rem measure |
| Review card | In the M4 sheet: partial by default, expanded for long cards and the navigator, collapsed to read; the card scrolls inside the sheet | The phone sheet, as wide as the passage | End column, 45%: the current question's card only, scrolling on its own |
| Navigator | "All questions" opens it in the expanded sheet | Same | The M4 bottom bar with outcome badges, Previous and Next, content-driven height, text labels |
| Question change | The passage scrolls so the first evidence sentence sits above the sheet; focus to the card heading | Same | The passage column scrolls the evidence into view; focus to the card heading |

#### Accessibility treatment (M5 screens)
- **Not by color alone (I-8):** outcomes are icon plus word; answer rows carry text labels; evidence and related marks differ by icon and underline style; navigator badges differ by shape (check, cross, dash, half-filled circle) and are named in words.
- **Focus:** results H1 on arrival from the test; the review card's heading on opening and on every question change; "Show in passage" moves focus to the sentence; the navigator returns focus to "All questions" on Escape. The approved focus ring everywhere.
- **Announcements:** the focused headings announce the outcome; nothing else uses a live region except the storage notice (polite, once).
- **Disclosure:** "Explain simpler" is a button with `aria-expanded`; the simpler text follows it in reading order.
- **Language:** English test content, typed and accepted answers, and `en` spans in explanations and copy carry `lang="en"`.
- **Targets:** every control at least 44 × 44 px (48 px for buttons and quiet links), including at 320 px.
- **320 px and 200% zoom:** no horizontal scroll; the score and long uz and ru labels wrap and are never truncated; at 200% the partial sheet may show only the card header, with the rest scrolling inside it, as in M4.
- **Reduced motion:** the passage jumps to the evidence instead of scrolling smoothly; the sheet does not animate.

#### Tokens this would add
`--color-status-correct` (`#157A3C`) only. Everything else uses existing or approved values.

## Part 5. ADR-0008 (Proposed)

### ADR-0008: Reading Answer Checking, Explanations and Review Content

- **Status:** Proposed (2026-10-11, M5 planning; revised the same day for the owner review packet and again to apply the owner's M5-01 decision and amendments). If accepted, it amends [ADR-0005](../architecture/decisions/0005-reading-content-contract.md) §2 (the answer key is loaded by the results and review pages) and §1 (what increases a test's version), extends the key file and adds per-locale explanation files (§3 to §5 below).
- **Date:** 2026-10-11
- **Deciders:** Project owner (acceptance), Claude (draft)

#### Context

[ADR-0005](../architecture/decisions/0005-reading-content-contract.md) keeps each test's answer key and evidence in a separate file (`<testId>.key.json`) that the web app does not load in M4, and leaves answer checking open. The owner moved answer checking to M5 (M4-09). M5 (drafts in [READING_EXPERIENCE.md, M5 specifications](../product/READING_EXPERIENCE.md#m5-specifications-drafts)) needs:

- checking every M4 question type and a raw score, with no band conversion for the uncalibrated demo test;
- evidence-first review: the accepted answer, the evidence sentences, an explanation and a simpler explanation, in uz, ru and en;
- observable signals for repeated-mistake detection (for example a typed answer one letter away from an accepted one);
- results that stay tied to the key and checking rules that produced them ([ADR-0009](../architecture/decisions/0009-reading-attempts-on-the-device.md) §1).

**What the M4 contract does today** (`apps/web/src/domain/reading/parse-content.ts`; owner decisions for M5 recorded in READING_EXPERIENCE.md, Decisions for M5-01): the test and key parsers build their objects from known fields only, so an unknown field is ignored, not rejected; every list in a key entry must have at least one item, so `evidence` cannot be empty; a key's `version` must equal its test's; each `accept` value must be an option of its question; nothing checks that the numbers of a "choose several" item share one set, or how many options it has.

Forces:
- **Honest feedback and one scoring source** (PRODUCT.md; INVARIANTS I-1 to I-4; `.claude/rules/domain/ielts-scoring.md`): checking is domain code with tests for every rule; IELTS rules are sourced.
- **Content integrity (I-5)** and **content as untrusted data** (ADR-0005): new files are validated like tests and keys.
- **Who wrote it:** the demo test, its key and the explanations are drafted by Claude (AI). That must stay visible until people have reviewed them.
- **Localization:** explanations are in the interface language; test content stays in English and is marked `lang="en"` ([LOCALIZATION.md](../product/LOCALIZATION.md)). Interface strings live in the catalogs (I-6).
- **Device-only practice:** answers live in the browser (ADR-0006). Review must show the accepted answers, so any page that reviews must receive the key.
- **No AI decision exists** (ARCHITECTURE.md: AI provider is TBD).

#### Decision

##### 1. Checking is one domain module with a rules version
- `apps/web/src/domain/reading/scoring.ts` (the name keeps it under `.claude/rules/domain/ielts-scoring.md`): a pure function from the test, the key and an attempt's answers (and pins) to a result: per question number (scoring position) an outcome (`correct`, `incorrect`, `unanswered`), per answer unit its observable signals, plus the marks and the number of scoring positions. Review, retries and repeated-mistake detection work in answer units (a "choose several" item is one unit), never in single positions of an item.
- **`SCORING_RULES_VERSION`**, one integer constant in that module, increases whenever a change could alter an outcome, a mark or a signal for the same answers and key, bug fixes included. Each stored result records it (ADR-0009 §1, §5).
- The rules (normalization, accepted variants, "choose several" marks, unanswered, denominators, signals) are those in [READING_EXPERIENCE.md, Answer checking (M5)](../product/READING_EXPERIENCE.md#answer-checking-m5) and [Error Intelligence (M5)](../product/READING_EXPERIENCE.md#error-intelligence-m5), each with unit tests that cite their source or say that no official source exists.
- **No band conversion** in M5: nothing converts a raw score to a band, so INVARIANTS I-2 still has no implementation to protect.

##### 2. Checking runs in the browser, on the results and review pages
- The results and review pages import the key and the active locale's explanations as static data (read and validated on the server at build time, like the tests, ADR-0005 §3) and pass them to their client parts, which check the attempt from the device's storage.
- **The test screen does not import them**, so the key is not part of the page a learner answers on.
- **Trust model, stated plainly:** a determined user can read the key from the results or review page before taking the test. Device-only practice cannot keep it secret: a server check would have to return the accepted answers for review anyway. This is practice, not a proctored test, as with the device clock (ADR-0006).

##### 3. Answer key additions (`<testId>.key.json`, still validated against its test)
- **`revision`** (integer, from 1): increases with **any** change to the key file once it may have been used for results: accepted answers, evidence, tags, `fromPassage`. A key correction needs **no content version change**, because no stored answer or anchor becomes invalid; stored results record the revision they used, and ADR-0009 §5 decides what a correction does to them. `version` keeps matching the test's content version, as today.
- **Fingerprint tests** make both rules enforceable: a unit test holds a hash of each shipped test file per content version and of each key file per revision, and fails when a file changes without the matching increase (the author then increases the number and updates the hash). This amends ADR-0005 §1 for tests whose results may exist: any change to the test file increases the version, because checking and feedback read word limits and passage words from it.
- **Typed answers:** `accept` lists every accepted answer in full: no optional-word brackets or slash syntax to parse. Variants are written into the key ahead of time and reviewed; none are generated when checking. Each is non-empty, distinct from the others after normalization, and within the group's word limit by the validator's word count ([READING_EXPERIENCE.md, Answer checking (M5)](../product/READING_EXPERIENCE.md#answer-checking-m5): hyphenated words count once, articles count, one number is free only where the limit allows a number). The M4 Practice warning keeps its own, more lenient count.
- **"Choose several" (new validator rule):** every number of an item has the same `accept` set, with exactly as many options as the item has numbers (its `choose`), and no option twice. The key format stays one entry per question number.
- **NOT GIVEN (contract change):** `evidence` of a NOT GIVEN answer lists the sentences where the passage deals with the statement's topic and **may be empty**; M4's validator requires at least one. Review presents these sentences as related text, never as proof. For every other answer, at least one evidence sentence stays required.
- **Optional `trap`** per question, one of `paraphrase`, `qualifier`: what the question tests, not a judgment of the learner (READING_EXPERIENCE.md, Error Intelligence). All numbers of a "choose several" item carry the same tag or none.
- **Optional `fromPassage: true`** on typed questions whose instruction says the words come from the passage; the "not from the passage" signal applies only there. It lives in the key, not the test file, so that every input of feedback other than the test text is covered by the key revision. The validator rejects it on other question types.
- **`review`**, required: `{ "status": "aiDraft" | "reviewed" | "approved" }` for the key as a whole (§6).

##### 4. The test file does not change
M5 adds nothing to the test file. Its content version therefore stays valid for stored sessions as long as the file stays byte-identical, which the fingerprint test checks (READING_EXPERIENCE.md, Content versions and M4 data).

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
- **`aiDraft`**: drafted by Claude (AI), including any text a worker task writes. Never described as written by a person. In M5 the English explanations are drafted first, then the ru and uz drafts from the English draft; all stay `aiDraft`.
- **`reviewed`**: a person has checked it (the English key and explanations against the passage by someone with strong English and IELTS Reading knowledge; ru and uz, after they are reconciled with any English corrections, by fluent speakers), recorded in PROGRESS.md with the reviewer's role and date. A worker never sets it without such a recorded review.
- **`approved`**: the owner has approved it for release.
- M5 finishes with `aiDraft` files; nothing is released to real users before beta. The pre-beta sequence (English review, reconciling ru and uz, fluent review, owner approval) is M11-04 to M11-07 (READING_EXPERIENCE.md, Explanations (M5), decision D20). The status is not shown in the interface in M5.

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

- **Implementation:** M5-02 (key additions, validator, fingerprint tests), M5-03 (`scoring.ts` and its rules version), M5-05 (explanation files, their validator, AI drafts marked `aiDraft`), M5-06 and M5-07 (loading on the results and review pages); the pre-beta reviews are M11-04 to M11-07.
- **Docs on acceptance:** the ADR index; ADR-0005's status line ("§2 amended by ADR-0008"); ARCHITECTURE.md (content model: checking and explanations decided); LOCALIZATION.md (explanations are localized content files, not catalog strings).

## Part 6. ADR-0009 (Proposed)

### ADR-0009: Reading Attempts and Results on the Device

- **Status:** Proposed (2026-10-11, M5 planning; revised the same day for the owner review packet and again to apply the owner's M5-01 decision and amendments). If accepted, it amends [ADR-0006](../architecture/decisions/0006-reading-session-state.md) §2: the `reading:<testId>:finished` entry is replaced by the attempt history below.
- **Date:** 2026-10-11
- **Deciders:** Project owner (acceptance), Claude (draft)

#### Context

M4 keeps a Reading session on the device ([ADR-0006](../architecture/decisions/0006-reading-session-state.md)): the current session under `reading:<testId>` and the most recent finished one under `reading:<testId>:finished`, both in the envelope `{ "schema": 1, "session": … }`. "Start again" starts a new session, and when that one finishes it **replaces** the earlier finished session. Nothing is checked or scored in M4, so no M4 session has a score.

M5 ([READING_EXPERIENCE.md, M5 specifications](../product/READING_EXPERIENCE.md#m5-specifications-drafts)) adds results, evidence-first review, repeated-mistake detection and retries. That needs:

- **Results tied to what produced them**: the content version, the answer-key revision and the checking rules ([ADR-0008](../architecture/decisions/0008-reading-answer-checking-and-explanations.md) §3), with corrections visible, never silent.
- **More than one finished attempt per test**, with answers, pins and highlights kept as finished, and new attempts and retries never overwriting an earlier one.
- **A known first try**, or an explicit "unknown".
- **Safety across tabs**: two tabs can finish, check, import and retry at the same time; a stale tab must not overwrite what another tab committed.
- **Compatibility with M4 data**, without losing a recoverable M4 entry when a write fails.

Forces (unchanged from ADR-0006): no accounts and no server-side guest record (ADR-0003); stored data is untrusted input; domain rules stay out of the UI (I-3, I-4; ADR-0004); home is rendered on the server and cannot read `localStorage`. One attempt is a few kilobytes.

**`localStorage` is not a transactional store across tabs.** Within one tab, a synchronous read followed by a write cannot be interrupted. Across tabs, browsers give no lock around a read-modify-write, and Chromium keeps a per-process copy that other processes update asynchronously, so a tab can read data that another tab has already replaced. A design that rewrites a shared list can therefore drop another tab's entry.

The answer key is not loaded on the test screen ([ADR-0008](../architecture/decisions/0008-reading-answer-checking-and-explanations.md) §2), so the test screen records an attempt and the results page checks it.

#### Decision

##### 1. Four version numbers, each guarding one thing

| Number | Where | Guards | Changes when |
|---|---|---|---|
| **Content version** | `ReadingTest.version` (ADR-0005); copied into every session and attempt as `testVersion` | Everything in the test file: what answers and marks point at (question numbers, items, option ids, passages, paragraph letters, sentence ids) and everything checking or feedback reads from it (word limits, passage words) | Any change to the test file once results may exist (ADR-0008 §3: a fingerprint test enforces it) |
| **Storage schema** | `schema` in each stored envelope | The shape of the stored JSON | The stored shape changes. M5 keeps the session envelope at 1 and starts the attempt, result and first-try envelopes at 1 |
| **Answer-key revision** | `revision` in the key file; recorded in each result | Everything in the key: accepted answers, evidence, tags, `fromPassage` | Any change to the key once results may exist (fingerprint test) |
| **Checking-rules version** | `SCORING_RULES_VERSION` in the checking module; recorded in each result | Normalization, marks, outcomes and signal rules | Any code change that could change a mark, an outcome or a signal for the same answers, key and content |

Nothing else is versioned. Explanations are shown next to a result but are not part of it.

##### 2. One write-once entry per record

| Key | Value | Written |
|---|---|---|
| `reading:<testId>` | The current test session (ADR-0006), in progress **or finished and not yet recorded** | As in M4, after every change; on finishing, the finished session first (§4) |
| `reading:<testId>:retry` | The current retry session (§9), same rules | Likewise |
| `reading:<testId>:attempt:<id>` | `{ "schema": 1, "attempt": ReadingAttempt }` | Once (§3) |
| `reading:<testId>:result:<id>:<keyRevision>.<rulesVersion>` | `{ "schema": 1, "result": Result }` | Once per attempt and pair (§5) |
| `reading:<testId>:firstTry` | `{ "schema": 1, "firstTry": "<id>" \| "unknown" }` | When the first try is decided, and only towards "unknown" afterwards (§6) |
| `reading:<testId>:finished` | M4's entry | Never written by M5; imported and then removed (§7) |

```
ReadingAttempt
  id               "test-<startedAt>" | "retry-<startedAt>": the kind and the session's start time
  testId, testVersion
  kind             "test" | "retry"
  retryOf?         the id of the test attempt whose questions are retried (retry only)
  questions?       the retried question numbers, whole answer units (retry only)
  mode             "practice" | "exam"        (a retry is always "practice")
  startedAt, finishedAt, finishReason ("user" | "timeUp")
  answers, pins    copied from the session, in the ADR-0006 shapes
  highlights?      copied from the session (sentence ids); absent means "not recorded" (§7)
  importedFromM4?  true for an attempt imported from M4's ":finished" entry

Result
  attemptId, keyRevision, rulesVersion, checkedAt
  outcomes         per question number (scoring position): "correct" | "incorrect" | "unanswered"
  signals          per answer unit (its first number): the observable signal codes (ADR-0008 §1)
  score, total     marks and scoring positions (40 for a test attempt; the retried positions for a retry)
```

- **Kept:** answers, pins and highlights, because review shows them. **Not kept:** flags and the view (sheet state, scroll), which only matter during the test.
- **Why one entry per record:** a write never rewrites another record, so a tab that reads stale data cannot drop another tab's attempt or result. Attempts and results are never modified after they are written.
- **Ids carry the kind**, so a test and a retry started in the same millisecond have different ids. Two sessions of one kind for one test cannot exist at once (one current entry each), so an id never names two different sessions on one device.

##### 3. Write-once
- An entry is written only if no **valid** entry exists at its key. A valid existing entry always wins, so the first committed attempt keeps its answers, pins and highlights even if a stale tab later finishes the same session with different ones.
- An entry with our schema that fails validation is not a committed record: it may be replaced. An entry with an **unknown schema** (written by a newer app) is never overwritten or removed.

##### 4. Finishing records the attempt without risking the source
1. When `apply` returns a finished session (the user finished, or the Exam time ran out, also when that is noticed on load), the finished session is written to its current entry (`reading:<testId>` or `:retry`), as M4 writes every change.
2. The attempt is written (§3).
3. For a test attempt with no first-try entry, the first try is decided (§6).
4. **Only if step 2 succeeded or an equal or earlier committed attempt with that id already exists**, the current entry is removed.
- If step 2 fails (storage full or blocked), the finished session stays in its current entry as the recoverable source, the attempt is kept in memory for this tab (§10), and the next load repeats steps 2 to 4. A current entry holding a finished session whose attempt exists is simply removed.
- A stale tab that keeps writing its in-progress copy of a session already recorded is refused: a current session whose attempt id exists is never written again.

##### 5. Results are records per key revision and rules version
- **When the results or review page shows an attempt** whose `testVersion` is the current content version, and no result exists for the current pair (key revision, rules version), the attempt is checked from its unchanged answers and a result is written for that pair **even if nothing differs** from the previous record, so later views know this pair has been checked. Concurrent views write the same key; the first valid record wins.
- **All earlier records are kept.** The learner sees the record of the current pair.
- **Correction notice:** when the shown record differs from the most recent earlier record in anything the learner sees (the score, an outcome, or a signal shown as a note), the page shows "Rechecked after a correction to the answer key or to how answers are checked. Your earlier result was 27 of 40." When only the pair changed, no notice is shown and nothing suggests the score changed. If the score is the same but an outcome or note changed, the notice says so without quoting a different score (the copy has two forms).
- A recheck never creates an attempt and never counts as new evidence (READING_EXPERIENCE.md, Error Intelligence).
- **Content no longer available** (the attempt's `testVersion` is not the current one): no check is possible. The most recent stored record is shown (score and counts) with "This test has changed since you took it, so a detailed review is not available"; with no record, "…so your answers can't be checked". An attempt of a test the app no longer ships is kept, shown nowhere, and not deleted by M5.

##### 6. First-try provenance
- `firstTry` is decided when a **test** attempt is recorded and no first-try entry exists: if no other attempt entry exists for that test (valid, invalid or unknown), it is this attempt's id; otherwise "unknown".
- It moves only towards "unknown": an M4 import writes "unknown" even over an id (the imported attempt is older than anything M5 recorded); an entry that names a missing or invalid attempt reads as "unknown". It never changes from one id to another.
- Retries never decide it. "Start again" creates later attempts. A new content version does not change it.
- What the device cannot know: attempts in another browser, on another device, or before site data was cleared. The copy says "on this device".

##### 7. Compatibility with M4
- **In-progress sessions** (`reading:<testId>`, envelope schema 1): unchanged and resumed as in M4; when finished, recorded by §4.
- **The M4 `:finished` entry**, on the first load of any Reading page of that test:
  1. If it does not parse with the ADR-0006 rules or its `testVersion` is not the current one: left untouched, never read again.
  2. Otherwise the attempt `test-<startedAt>` is written (§3) with `importedFromM4: true`, its mode, times, answers, pins **and highlights** exactly as stored, and no result.
  3. The first-try entry is set to "unknown".
  4. Only if steps 2 and 3 succeeded (or a valid attempt with that id already existed), the `:finished` entry is removed. A failed write leaves it in place to be imported later.
- Nothing is invented: no score, outcome, check date or first-try claim. The attempt is checked the first time its results are shown, and its results page says so.
- **Absent highlights:** M4 sessions always carry `highlights` (possibly empty), so an imported attempt has them. An attempt entry without the field is valid and means "not recorded": review then shows no highlights and says nothing about them. An empty list means the learner highlighted nothing.
- **Content version:** M5 keeps the demo test's version because it does not change the test file; a fingerprint test fails if the file changes without a version increase (ADR-0008 §3).

##### 8. Stored data is untrusted
- Every entry is parsed by a domain parser as untrusted input. An entry that is not valid JSON, has our schema but fails validation, or belongs to another test is ignored; the next write of that test's history removes it, except at keys that a write would replace anyway.
- An entry with an unknown schema is ignored for display but never overwritten or removed. An unknown-schema first-try entry reads as "unknown".
- Results are only used with the attempt they name and only if their pair, outcomes and signals are consistent with the attempt's question numbers.

##### 9. Retries in progress
- `reading:<testId>:retry` holds one retry session (the ADR-0006 envelope, schema 1; the session additionally carries `retry: { of, questions }`, whole answer units). The main entry never carries `retry`. A retry is recorded by §4 as a `retry` attempt.
- Starting a retry is validated against its source attempt (READING_EXPERIENCE.md, Targeted practice): the source must be a stored test attempt of the current content version, and the questions must be whole units it got not fully correct.

##### 10. Retention, reset and unavailable storage
- At most **20 attempts per test**. When recording a new attempt exceeds that, the oldest attempts are removed with their result records, **except the first-try attempt**, and except entries with an unknown schema. About 100 KB per test at most.
- **No reset control in M5.** Clearing the browser's site data clears everything (ADR-0006).
- **Storage blocked or full:** attempts and results are kept in memory in the storage module for the tab's lifetime (client-side navigation to results and review keeps them; a reload loses them) and the pages show the notice. Recoverable sources (§4, §7) are never removed after a failed write.

##### 11. Derived, not stored
- Repeated mistakes are derived from the first try's record for the current pair on every read (refreshed by §5 first; READING_EXPERIENCE.md).
- The review position lives in the page address.

##### 12. Not decided here
- Home showing a Reading activity (ADR-0006 §4): not in M5 (owner, M5-01).
- Server storage and moving the history to an account (M7); progress over time and evidence across tests (M8).

#### Alternatives considered

| Option | Pros | Cons |
|---|---|---|
| **A. One write-once entry per attempt, per result record and for the first try; recording writes before it removes (chosen)** | No write ever rewrites another record, so stale tabs cannot drop entries; synchronous like ADR-0006; no dependency | Reading a history scans the test's keys; a few more keys per attempt |
| B. One list per test, rewritten on every change | One read for the whole history | A stale tab's rewrite can drop another tab's entry; locks do not fix stale per-process copies |
| C. B plus the Web Locks API | Serializes tabs that hold the lock | Asynchronous; still exposed to stale per-process copies; more code than A |
| D. IndexedDB transactions | Real cross-tab transactions | Asynchronous writes may not finish when the tab closes (rejected in ADR-0006 for this data) |
| E. Freeze the first result, never recheck | Simplest | A known-wrong judgment stays forever after a key correction |
| F. Recheck and overwrite | No history | The earlier result disappears silently |
| G. Tie key corrections to the content version | One number fewer | A key typo fix would discard in-progress sessions and end review of earlier attempts |
| H. Infer the first try as "the earliest attempt" | No stored field | Wrong after an M4 import or a damaged history |

#### Why this decision

- **Correctness:** every record is written once and never rewritten; sources are removed only after their record exists; results name the key and rules that produced them; first-try provenance is never invented.
- **Simplicity:** synchronous browser storage, envelopes and parsers as in ADR-0006; no dependency.
- **Consistency:** device-only guest state (ADR-0003, ADR-0006); rules in `domain/`, storage in `data/` (ADR-0004).

#### Consequences

- **Positive:** results, review, repeated mistakes and retries read one history; corrections are visible; M4 data carries over with its highlights and without invented scores.
- **Costs accepted:** a cleared browser or another device starts with no history; Safari may clear a site's storage after 7 days without a visit (ADR-0006); attempt ids trust the device clock. **Residual race:** two tabs that finish the same session within the moment it takes one tab's write to reach the other may both see "no attempt yet", and the later write wins; the answers then come from one of the two tabs' copies of the same session. Different records can never overwrite each other.
- **Harder to change later:** the entry shapes, once stored (mitigated by `schema` and the parsers).

#### Follow-up / migration notes

- **Implementation:** M5-04 (entries, parsers, recording, import, provenance, retention, in-memory fallback, interleaved-tab tests); checking on view and rechecking (M5-06); retries (M5-09); first-try use (M5-10).
- **Docs on acceptance:** the ADR index; ADR-0006's status line ("§2 amended by ADR-0009"); ARCHITECTURE.md (guest practice state); BOUNDARIES.md if the storage module gains a rule.

## Part 7. M5 tasks and the M11 review tasks

Rendered from TASKS.json. Every M5 implementation task depends on M5-01 directly or through other tasks.

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
- **Goal:** The answer key carries everything checking and Error Intelligence need, validated and fingerprinted, while the test file stays byte-identical so the demo test keeps content version 1.
- **Scope:**
  - Per ADR-0008 §3, §4 and §6: validator rules for the key's `revision` (integer from 1) and required `review.status` (`aiDraft` | `reviewed` | `approved`); typed variants (non-empty, distinct after normalization, within the word limit by the validator's count: every space-separated part is a word, a hyphenated part is one word, one numeric part is free where the limit allows a number, articles count, D4); every number of a 'choose several' item has the same `accept` set with exactly as many distinct options as the item has numbers, and the same `trap` tag or none; NOT GIVEN evidence may be empty (relaxing M4's at-least-one rule for NOT GIVEN keys only); the optional `trap` tag (`paraphrase` | `qualifier`); the optional per-question `fromPassage: true`, on typed questions only
  - The validator's word count as one domain function, its tests citing the ielts.org hyphenation rule and stating that the article rule has no official source
  - Demo key, drafted by Claude and marked `review.status: aiDraft`, `revision: 1`: `fromPassage` on its typed questions; variants only where the passage supports them (optional words, British and American spellings, figures and words; dates as listed variants, D22); `trap` tags where they apply. Record each choice in PROGRESS.md as an AI draft awaiting the pre-beta reviews (M11-04 to M11-07)
  - Fingerprint tests (ADR-0008 §3): a hash of each shipped test file per content version and of each key file per revision; a change without the matching increase fails
  - The demo test file stays byte-identical (D23); a test asserts that M4-format stored sessions of the demo test still parse
  - Unit tests for every new validator rule with small original fixtures; every content file still validated by the content test
- **Out of scope:**
  - checking answers (M5-03)
  - explanations (M5-05)
  - UI
  - any change to the test file, new tests or passages
- **Acceptance criteria:**
  - Every rule of ADR-0008 §3, §4 and §6 is enforced and tested
  - The demo test and key validate; the test file is unchanged and still version 1; M4-format sessions still parse; the existing M4 session tests pass unchanged
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
  - `apps/web/src/domain/reading/scoring.ts` (under .claude/rules/domain/ielts-scoring.md) per READING_EXPERIENCE.md 'M5 specifications', 'Answer checking (M5)': normalization (NFC, case, spaces, typographic apostrophes, phone hyphens, **one trailing full stop only**, D2 as amended); outcomes per scoring position for all 13 M4 types; 'choose several' marks in either order with positions taking the marks in order for counting only; the answer-unit outcome (correct, partly correct, not correct, no answer) and option-level correctness for review; unanswered distinct from incorrect, 0 marks, kept in the denominator; the raw score out of the attempt's positions (40 for a test attempt, the retried positions for a retry)
  - `SCORING_RULES_VERSION` (ADR-0008 §1), recorded by every result
  - The observable signals per answer unit: ngInsteadOfFalse, falseInsteadOfNg, ngInsteadOfTrue, trueInsteadOfNg (with the question type, facts or views), oneLetterAway (exactly one letter added, missing or changed from an accepted variant of at least 4 letters; never changes a mark), wordLimit, notFromPassage (key `fromPassage`), timeUp, pinnedElsewhere (pins of all the unit's numbers)
  - Result types that keep a practice raw score distinct from any band or estimate; no band conversion anywhere
  - Unit tests for every rule and edge case, each IELTS rule citing its official source (or stating that none exists): case; spaces; smart apostrophes; phone hyphens; one trailing full stop accepted, a trailing comma, semicolon or colon not; a misspelling is incorrect; British and American spellings only when listed in the key; over the limit never correct; every 'choose two' case of the worked example (both, reversed, one right one wrong, none right, one chosen, nothing chosen; duplicates and unknown ids never award a mark or more than `choose`), with unit outcome and option labels; every shipped test has exactly 40 scoring positions and a maximum of 40 marks; unanswered vs incorrect; each signal's positive and negative cases, including the facts/views distinction, using the demo test and small fixtures
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
- **Goal:** Finished sessions become immutable attempts with answers, pins and highlights, kept on the device in write-once entries that stay correct across tabs and compatible with M4 data.
- **Scope:**
  - Per ADR-0009: the entry layout (one write-once entry per attempt, per result record and for the first-try marker; ids `test-<startedAt>` and `retry-<startedAt>`); domain parsers for each entry as untrusted input (attempts with answers, pins and optional highlights; absent highlights read as 'not recorded'); write-once semantics (a valid entry always wins; an invalid entry with our schema may be replaced; an unknown schema is never overwritten or removed)
  - Recording on finish (ADR-0009 §4): the finished session written to its current entry, then the attempt, then the first-try decision, and the current entry removed only after the attempt exists; a current session whose attempt exists is never written again (stale tabs); a finished session left in a current entry is recorded on the next load
  - Result records per key revision and rules version (ADR-0009 §5) as an adapter function the results page calls: written once per pair even when unchanged; all kept
  - First-try provenance (ADR-0009 §6): decided when the first test attempt is recorded and no other attempt entries exist; moves only towards 'unknown' (M4 import, other entries, a marker naming a missing or invalid attempt)
  - M4 import exactly as in READING_EXPERIENCE.md 'Import of a completed M4 session': answers, pins and highlights as stored, no result, first try 'unknown', the `:finished` entry removed only after both writes succeeded; a non-importable entry left untouched
  - Retention (20 per test, never the first-try attempt or unknown-schema entries); the retry entry `reading:<testId>:retry` and the session's optional `retry` field (whole units), never on the main entry; an in-memory fallback when storage is blocked or full that never removes a recoverable source
  - The test screen's finish (by the user, by time-out, and a time-out noticed on load) records the attempt instead of writing `:finished`. The M4 finished page stays until M5-06 replaces it
  - Tests with stored values in the exact M4 format (schema 1, in progress and finished, with highlights) and with two simulated tabs sharing one storage, interleaved: both tabs finish the same session with different answers (the first committed attempt keeps its answers, pins and highlights); a stale tab writes its in-progress copy after the attempt exists (refused); two tabs write the same result pair (one record); a tab with a stale view records another attempt (no entry lost); import in two tabs (one attempt); a test and a retry started in the same millisecond (two attempts); a failed attempt write (the finished session and the M4 `:finished` entry stay and are recorded on the next load); unknown schema never overwritten; invalid entries removed on the next write; retention; first-try provenance for a first attempt, an M4 import, a restart, a retry and existing entries
- **Out of scope:**
  - the results and review UI (M5-06, M5-07)
  - retry screens (M5-09)
  - server storage, accounts (M7)
- **Acceptance criteria:**
  - Behavior matches ADR-0009, proven by tests that include M4-format data and interleaved tabs
  - No path removes a recoverable session or M4 entry after a failed write
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
  - Per ADR-0008 §5: the explanation file type, its domain validator (test and version match, one item per answer unit, both texts in every locale, a known `review.status`, no empty text, the approved length limits, simpler shorter than the explanation, `en` segments) and a server-side loader in `data/` that returns one locale's file; a content test validating every file
  - Draft (Claude, AI) `demo-academic-1.explanations.en.json` first, then `ru` and `uz` from the English draft, all with `review.status: aiDraft`, by the approved authoring rules: grounded only in the passage, question and key; the paraphrase named; NOT GIVEN explanations say what the passage covers and why that is neither agreement nor contradiction, in facts (TRUE/FALSE/NOT GIVEN) or the writer's views (YES/NO/NOT GIVEN), never an invented sentence; English quotes as `en` segments of at most 8 words
  - Original text for this project; never described as written by a person; PROGRESS.md records the files as AI drafts awaiting M11-04 to M11-07. No human review is a prerequisite of this task
- **Out of scope:**
  - UI (M5-07)
  - runtime AI
  - other tests
- **Acceptance criteria:**
  - All 39 answer units (40 questions, 22–23 as one item) have both texts in en, ru and uz, and the files validate
  - The validator rejects a missing unit, an unknown unit, an empty or too long text, a simpler text not shorter than its explanation, an unknown review status, and a wrong test or version (tests)
  - Each explanation refers only to its question's evidence and passage
  - Every file's review status is `aiDraft`
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
- **Goal:** Finishing a test in either mode, or running out of time, leads to an honest results page whose results are traceable to their key and rules and never silently overwritten.
- **Scope:**
  - The results address as approved (D21), inside the shell: the key loaded on the server for the results and review pages only (ADR-0008 §2); a result record written for the current key revision and rules version when missing, also after a correction (ADR-0009 §5); the correction notice only when the score, an outcome or a note changed (two copy forms), none otherwise; 'Time is up.', 'Your results', the score out of 40 (wrapping allowed), the honest line, the breakdown in positions, the red review button whose text names what it opens (a partly correct item counts as a mistake; linking to the review address that M5-07 builds), 'Start again'
  - Finishing and time-out replace the test screen with the results page; the test link shows the start screen with 'See your last results' (D6); the M4 finished page and its now unused copy are removed
  - Every result state in DESIGN_SYSTEM.md 'Result states', including rechecked (score changed, outcomes changed, nothing visible changed), imported from M4 (note), no attempt, unknown attempt, an earlier content version (record kept, or cannot be checked), storage blocked (notice, in memory)
  - The `status.correct` token and outcome icons as approved (DESIGN_SYSTEM.md M5); uz/ru/en copy as approved
  - Tests: component tests; e2e on phone and desktop: Practice finish, Exam finish, Exam time-out on screen and while away (controlled clock), reload shows the same record, a record stored for an older key revision gets a new record (with and without a visible change), an M4-format finished session with highlights seeded in storage shows results with the note, storage blocked, 320 px and 200% zoom in uz/ru/en, axe
- **Out of scope:**
  - review (M5-07, M5-08)
  - repeated mistakes (M5-10)
  - retries (M5-09)
  - band conversion
  - Home (unless D18 decided otherwise)
- **Acceptance criteria:**
  - Results appear exactly as approved in every situation of 'When results are available (M5)'
  - Every shown result names its key revision and rules version in storage; no record is overwritten
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
- **Goal:** From the results, a learner reviews every answer unit (mistakes and unanswered first, correct ones too) with their answer, the accepted answer, the key's evidence, the explanation and 'Explain simpler', on a phone.
- **Scope:**
  - The review address as approved, in the test-screen layout: the test bar with 'Results'; the read-only passage with evidence and related chips and underlines, the attempt's recorded highlights (none, and no claim, when not recorded) and the current unit's pins; one card per answer unit in the approved order (unit outcome, option-level labels or typed answers, evidence, why, 'Explain simpler', the pin comparison with the key's cited sentences, notes); the navigator with outcome badges, both numbers of an item showing the unit's badge and opening its one card
  - Sequences (D8): the red button's sequence walks every card not fully correct or unanswered, unanswered ones shown as 'No answer' with 'You did not answer this question.' (and the time-out note), never skipped; progress counts cards; the address replaced on card change; the passage scrolls to the evidence (D9), instantly with reduced motion, and stays when there is none; NOT GIVEN as 'Where the passage talks about this', never proof, and no evidence block at all when no sentence is listed; statement notes in the facts or views wording; focus and keyboard behavior as specified; the empty and error states
  - Explanations of the active locale only; test content and `en` segments marked lang=en; uz/ru/en copy as approved
  - Tests: component tests of the card for each interaction family, the 'choose two' cases (aggregate outcome, option labels, never a positional letter), NOT GIVEN with and without related sentences, absent and empty highlights; e2e on phone: results to the first card to review, Next through mistakes and unanswered questions with card-based progress, a correct and an unanswered question through the navigator, 22–23 from either number, 'Explain simpler', 'Show in passage', the keyboard path, 320 px in uz/ru/en, 200% zoom, reduced motion, axe
- **Out of scope:**
  - the desktop layout (M5-08)
  - repeated mistakes (M5-10)
  - retries (M5-09)
  - runtime AI
- **Acceptance criteria:**
  - Every M4 question type can be reviewed as approved on a phone, in both modes' attempts
  - A 'choose several' item is one card with an aggregate outcome; no positional mark is shown as a letter
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
- **Goal:** A learner can answer again, without seeing the answers, the answer units of an attempt that were not fully correct or unanswered, and sees an honestly labeled result that never changes the original attempt.
- **Scope:**
  - The retry address as approved, validated against its source (READING_EXPERIENCE.md 'Targeted practice'): a stored test attempt of the current content version, its record for the current pair (written first if needed), the requested numbers expanded to whole units, every unit one the source did not get fully correct; otherwise the safe states (source missing or pruned, earlier content version, questions not allowed) with 'See your last results' and 'Start the test'
  - A Practice session limited to those units (the session's `retry` field, ADR-0009 §9), enforced in the domain transitions (moving, answering and pinning only within the subset; the answered count and the finish confirmation over the subset); the navigator ('All questions'), Previous / Next and the desktop column show only those units; 22–23 starts with both choices empty; 'n of m to practise' in positions
  - One retry in progress per test: the same retry resumes, a different one replaces it; finishing records a `retry` attempt (id `retry-<startedAt>`)
  - The retry's results ('Your retry', the score out of the retried positions, 'These are questions you have attempted before. This practice result is not an independent measure of your level.', the review button named as on the results page, 'Back to your test results') and review of the retry; the quiet 'Try n questions again: not correct or no answer' on a test attempt's results, n counted in positions after expanding and de-duplicating units (hidden when there are none)
  - Tests: domain tests for subset transitions and unit expansion (22–23 included once with a denominator of 2); address validation for every safe state; e2e on phone and desktop; the original attempt and its records are unchanged after a retry (stored data and its results page)
- **Out of scope:**
  - unseen or new practice content (M9)
  - repeated-mistake cards (M5-10)
  - Exam-mode retries
- **Acceptance criteria:**
  - Retries behave as approved, are validated against their source, and are never shown out of 40 or combined with the original
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
- **Goal:** The results page shows repeated mistakes only when the first attempt's evidence meets the approved heuristic, describes what happened without guessing why, and links to practising those questions again.
- **Scope:**
  - Domain code per READING_EXPERIENCE.md 'M5 specifications', 'Error Intelligence (M5)': the first try from the stored marker (ADR-0009 §6), per test, never guessed, with no detection when it is unknown; the first try's record brought up to the current key revision and rules version before deriving (ADR-0009 §5), and patterns unavailable when its content version is not the current one (old signals never combined with another version's groups or tags); the categories from signals and content tags, counted in answer units (an item never counts twice) with their opportunities; the threshold (D15, ≥ 3 units in ≥ 2 groups), presented as a heuristic, never as a diagnosis; ordering and the limit of two; unanswered questions excluded
  - 'Mistakes that repeated' on a test attempt's results: the scope line ('In this attempt at this test…' or 'From your first attempt…'), the cards (title, count of opportunities with question numbers, tip, 'Practise these questions again' as a retry of those units), 'Not enough evidence to show a repeated pattern…' (whether units or groups fall short), the 'first try unknown' and 'unavailable' texts, nothing on a retry's results; 'Possible spelling issues'; pin cards about agreement with the key's cited sentences; no wording that claims a pattern across tests, a lasting weakness, a cause or improvement
  - uz/ru/en copy as approved, with English answer words lang=en
  - Tests: domain tests at every boundary (2 vs 3 units, 1 vs 2 groups, a 'choose two' item counted once, first try only, later attempts, restarts, retries and rechecks ignored, an imported M4 attempt and other entries (unknown first try), a first try from an earlier content version (unavailable), a first try whose record predates the current key revision (refreshed first), unanswered excluded, content tags, ties); e2e with seeded attempts for a card, the not-enough-evidence state, a later attempt and the unknown state
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
  - e2e journeys on both projects in uz/ru/en with English test content marked lang=en: a Practice test → finish → results → review mistakes and unanswered questions (each interaction family, a NOT GIVEN question with and without related sentences, an unanswered question, 22–23 as one card, 'Explain simpler') → try them again → the retry's results → back; an Exam with a time-out → results → review; a reload at each step; M4-format data already on the device (an unfinished session resumed, a finished one imported with its highlights, the 'checked later' note and no repeated-mistake detection)
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

#### M11-04: Required before beta: English accuracy review of the Reading key and explanations

- **Owner:** human · **Status:** `todo` · **Depends on:** M5-11
- **Goal:** A person with strong English and IELTS Reading knowledge, not the drafting AI, confirms that every Reading answer key and English explanation is accurate before beta.
- **Scope:**
  - For every shipped Reading test: check each accepted answer and variant against the passage, each cited evidence sentence, each NOT GIVEN judgment, each content tag and `fromPassage`, and the questions and passages as far as they affect the answers
  - Check each English explanation and simpler version: grounded only in the passage, accurate, plain; NOT GIVEN explained as neither agreement nor contradiction, in facts or the writer's views
  - Report corrections; a worker applies them (key corrections increase the key revision) and records the review in PROGRESS.md (reviewer's role, date, what was checked, what changed), then sets the reviewed files to `reviewed`
- **Out of scope:**
  - ru and uz texts (M11-05, M11-06)
  - release approval (M11-07)
- **Acceptance criteria:**
  - A recorded human review exists in PROGRESS.md for every key and English explanation file
  - Only files covered by that recorded review are `reviewed`; no worker marks this task done without it
- **Validation:**
  - `grep -n 'review' docs/execution/PROGRESS.md`
- **References:**
  - docs/product/READING_EXPERIENCE.md
  - docs/architecture/decisions/0008-reading-answer-checking-and-explanations.md

#### M11-05: Required before beta: reconcile ru and uz explanations with the reviewed English

- **Owner:** worker · **Status:** `todo` · **Depends on:** M11-04
- **Goal:** The ru and uz explanation drafts match the reviewed English, ready for fluent-speaker review.
- **Scope:**
  - Update every ru and uz explanation and simpler version to every correction made in M11-04; they stay `aiDraft`
  - Record in PROGRESS.md which items changed
- **Out of scope:**
  - changing the English
  - setting any status other than `aiDraft` for ru and uz
- **Acceptance criteria:**
  - Every English correction is reflected in ru and uz
  - ru and uz files stay `aiDraft`
  - All gates pass
- **Validation:**
  - `pnpm check`
  - `pnpm build`
- **References:**
  - docs/product/READING_EXPERIENCE.md
  - docs/product/LOCALIZATION.md

#### M11-06: Required before beta: fluent-speaker review of the ru and uz explanations

- **Owner:** human · **Status:** `todo` · **Depends on:** M11-05
- **Goal:** Fluent speakers confirm that every ru and uz explanation and simpler version says the same as the reviewed English, plainly and correctly.
- **Scope:**
  - Check each text against the English: same meaning, plain language, consistent terms, English quotes untouched, Uzbek orthography (U+02BB, U+02BC)
  - A worker applies the corrections, records the review in PROGRESS.md (reviewer's role, date, what changed) and sets the reviewed files to `reviewed`
- **Out of scope:**
  - release approval (M11-07)
- **Acceptance criteria:**
  - A recorded fluent-speaker review exists in PROGRESS.md for every ru and uz explanation file
  - No worker marks this task done without it
- **Validation:**
  - `grep -n 'review' docs/execution/PROGRESS.md`
- **References:**
  - docs/product/LOCALIZATION.md
  - docs/product/READING_EXPERIENCE.md

#### M11-07: Required before beta: owner release approval of the Reading keys and explanations

- **Owner:** human · **Status:** `todo` · **Depends on:** M11-04, M11-06
- **Goal:** The owner approves the reviewed Reading keys and explanations for release.
- **Scope:**
  - Review the recorded reviews; approve, and a worker sets the files to `approved` on that instruction
- **Acceptance criteria:**
  - Every Reading key and explanation file is `approved` on the owner's recorded instruction
- **Validation:**
  - `grep -rn '"status"' apps/web/content/reading`
- **References:**
  - docs/product/READING_EXPERIENCE.md
