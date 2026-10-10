# ADR-0005: Reading Content Contract

- **Status:** Accepted (2026-10-10, owner, task M4-09; drafted in M4-06).
- **Date:** 2026-10-10
- **Deciders:** Project owner (acceptance), Claude (draft)

## Context

The Reading engine (M4) renders tests made of passages and questions of the IELTS types in [READING_EXPERIENCE.md, Question types (M4)](../../product/READING_EXPERIENCE.md#question-types-m4) (draft). Before any test is written, the shape of that content has to be fixed: the screens render from it, the session stores answers, highlights and pins against it (ADR-0006, session state, drafted in M4-07), and review (M5) will compare pins with the real evidence.

Forces:
- **Content integrity (INVARIANTS I-5):** content is original or licensed. M4 uses only small original demo content (owner, 2026-10-10).
- **Stable anchors:** highlights and pins (M4-03 draft: whole sentences) must still point at the same sentence after a typo fix in the content.
- **Untrusted data:** content will later come from an authoring pipeline and the API (M9). The engine must reject malformed content clearly rather than render it wrongly.
- **Answers and checking:** whether M4 checks answers is open (M4-01, recommendation M5). If nothing in M4 checks answers, the answer key should not be sent to the browser at all.
- **Academic and General Training** share the question types but differ in texts and band conversion (PRODUCT.md open question).
- ADR-0004 puts pure rules in `apps/web/src/domain/` and data access in `apps/web/src/data/`.

## Decision

### 1. The model

```
ReadingTest   id, version, title, examType ("academic" | "general"), durationMinutes, origin, passages[3]
Passage       id, number, title, paragraphs[], questionGroups[]
Paragraph     id, letter? ("A"…; needed by matching headings and matching information), sentences[]
Sentence      id (stable, e.g. "p2-c-s4"), text
QuestionGroup id, type, instruction (English test text), wordLimit?, options?, allowRepeat?, text?, questions[]
Question      number (1–40), plus the fields of its type
```

- **Question types** (the approved M4 scope): `trueFalseNotGiven`, `yesNoNotGiven`, `multipleChoice` (one answer), `multipleChoiceMulti` (one item covering several numbers, with `choose: n`), `matchingHeadings`, `matchingInformation`, `matchingFeatures`, `matchingSentenceEndings`, `summaryWordBox`, `sentenceCompletion`, `summaryCompletion`, `noteCompletion`, `shortAnswer`. Deferred types (table, flow chart, diagram) are added later as new values without changing the others.
- **Per type:**
  - Statements for TRUE/FALSE/NOT GIVEN and YES/NO/NOT GIVEN; their answer words come from the type, not from each question.
  - Stems and lettered `options` for multiple choice.
  - A group-level `options` list (headings i–x, features A–E, endings A–G, words A–J) for the matching types and the word box, with `allowRepeat` when an option may be used more than once.
  - `matchingHeadings` questions point at a paragraph `id`; `matchingInformation` uses the passage's paragraph letters as its options.
  - Gap texts (summaries, notes, sentences with a gap) are **structured segments**, e.g. `[{ "text": "Bees use " }, { "gap": 19 }, { "text": " to find food." }]`, never strings with markers to parse. Notes are a list of such lines.
- **`wordLimit`** is data (`{ "words": 2, "numbers": true }` for "NO MORE THAN TWO WORDS AND/OR A NUMBER"); the instruction text states it for the reader and the Practice warning (M4-04 draft) uses the data.
- **Identifiers** (`id` of passages, paragraphs, sentences, groups) are explicit in the content, not derived from positions or text, so editing a sentence keeps its anchor.
- **`version`** (an integer) increases whenever a change could invalidate stored answers or anchors (numbering, options, sentence ids). Sessions store the version they were made with (ADR-0006).
- **`origin`** is required: `{ "kind": "original", "author": "…", "note": "…" }` or, later, `{ "kind": "licensed", "source": "…", "license": "…" }`. Content without it is rejected.

### 2. The answer key is separate
- Each test has a second file with its **answer key and evidence**: per question number, the accepted answers (option ids, or accepted strings with their variants) and the evidence sentence ids that review (M5) will show.
- **It is not loaded by the web app in M4** (if the M4-09 gate keeps answer checking in M5). The validator still checks it against the test (every question has a key, every evidence id exists), so keys are written and checked together with the content.

### 3. Format, location, loading
- **JSON**, one file per test plus its key file: `apps/web/content/reading/<testId>.json` and `<testId>.key.json`. JSON is data, not code, and is what an API will serve later (M9).
- **Domain types and one validator** in `apps/web/src/domain/reading/` (ADR-0004): the validator turns unknown JSON into a typed `ReadingTest` or a list of clear errors. It checks the structure and the cross-references: 40 question numbers, unique and contiguous across the test; unique identifiers; paragraph letters in order; every gap in a text has exactly one question; option ids unique and referenced options existing; `choose` no larger than the options; a `wordLimit` where a typed type needs one; `origin` present.
- **Loading** in `apps/web/src/data/` (server-side): the content files are read at build time and validated; an invalid file fails the build and the unit tests. Pages for the known tests can therefore be prerendered.
- **Every content file is validated by a unit test**, so a broken test cannot be merged.

### 4. Not decided here
Authoring tools, review workflow, storage in the database and delivery by the API (M9, content model and authoring), the deferred question types, images for diagram labelling, and answer checking itself (M4-01 open question 2).

## Alternatives considered

| Option | Pros | Cons |
|---|---|---|
| **A. JSON files plus a domain validator (chosen)** | Plain data an API can serve later; validated as untrusted input; reviewable diffs; no runtime cost beyond the build | Needs a hand-written validator (no schema library in the project yet) |
| B. TypeScript modules typed against the domain types | The compiler checks shapes; no parsing | Content becomes code bundled with the app; cross-references (numbering, anchors) still need a validator; harder to move to the API |
| C. Content in the database, served by the API now | Closest to the final system | Authoring and the API belong to M9; adds endpoints and tables for demo content (owner: no product tables before a feature needs them) |
| D. Markdown with custom syntax for gaps and options | Pleasant to author by hand | Needs a parser and an authoring convention now; authoring is M9 |
| E. Answer key inside the test file | One file | Ships answers to the browser even when nothing uses them |

## Why this decision

- **Correctness:** one validator guards every structural rule, explicit identifiers keep highlights and pins valid across edits, and structured gap texts cannot be mis-parsed.
- **Simplicity:** files and one validator; no database, API or parser before M9.
- **Consistency:** pure types and validation in `domain/`, file access in `data/` (ADR-0004), content treated as untrusted input like the goal cookie (ADR-0003).

## Consequences

- **Positive:** the demo test (M4-11) and every renderer (M4-15 to M4-17) have one exact contract; review (M5) gets evidence ids that line up with pins.
- **Costs accepted:** a hand-written validator to maintain; writing content means writing JSON by hand until M9's tools exist; sentence ids must be assigned by the author.
- **Harder to change later:** the identifiers and the question-type names, once sessions and pins refer to them (mitigated by `version`).

## Follow-up / migration notes

- **Implementation:** M4-10 (types and validator, with small test fixtures), M4-11 (the original demo test and its key, validated by a test).
- **Docs on acceptance:** the ADR index; ARCHITECTURE.md ("Content model and authoring": the Reading contract is decided, authoring stays M9); BOUNDARIES.md if loading adds a rule.
- If a schema library is ever adopted for validation (for example with the contracts decision of ADR-0002 §6), the validator can move onto it without changing the contract.
