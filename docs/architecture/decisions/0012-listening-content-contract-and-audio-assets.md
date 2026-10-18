# ADR-0012: Listening Content Contract and Audio Assets

- **Status:** Accepted (2026-10-18, owner, task M8-06; drafted in M8-03), with the owner's amendment applied in §1, §3 and §8: original audio production is deferred, and the first working test is one temporary test from existing material whose terms permit this use.
- **Date:** 2026-10-18
- **Deciders:** Project owner (acceptance), Claude (draft)

## Context

The Listening engine (M8) renders tests of the question types in [LISTENING_EXPERIENCE.md, Question types (M8)](../../product/LISTENING_EXPERIENCE.md#question-types-m8) (draft), played by the player in [Player, modes and sections (M8)](../../product/LISTENING_EXPERIENCE.md#player-modes-and-sections-m8) (draft). Before the first Listening test is written (M8-07, M8-08), the shape of that content must be fixed: the screens render from it, the session stores answers and audio positions against it (M8-04), review (M9) shows a timestamp and a transcript excerpt as each answer's evidence, and the content system (M13) will author, review and publish it.

Forces (facts):
- **Content integrity (INVARIANTS I-5):** content is original or licensed. Audio adds voices: synthetic voices have tool licences, recorded people need consent. Who produces the audio was the owner's decision at M8-06: original production is deferred, and the first test uses existing permitted material (amendment); the contract records either case.
- **Weak connections and mid-range phones** (PRODUCT.md): a test is about 30 minutes of audio. Its size decides the wait before an Exam (LISTENING_EXPERIENCE.md P10) and the learner's data cost.
- **The format** (ielts.org, checked 2026-10-18): 4 parts, 10 questions each, 40 questions; questions follow the order of the recording; the same Listening test for Academic and General Training.
- **Reading's contract exists and is accepted** ([ADR-0005](0005-reading-content-contract.md)): JSON files, explicit stable ids, structured gap texts, word limits as data, a separate key, one validator, fingerprints and a key revision ([ADR-0008](0008-reading-answer-checking-and-explanations.md) §3). Several Listening question types are Reading types (M8-01), and three layouts are shared with Reading (table, flow chart, labelling; Reading adopts them in M8-17 to M8-19 as new type values, as ADR-0005 §1 foresaw).
- **Answers must not be in the browser during a test**: the key, and also the transcript, which contains every answer.
- **Browsers** (MDN "Web audio codec guide", checked 2026-10-18): AAC in an MP4 container plays in all major browsers ("AAC is likely your best choice if you can only support one audio format"); Opus is efficient for speech but Safari's support is limited by container; MP3 plays everywhere at a larger size for the same quality.
- **Code structure** ([ADR-0010](0010-feature-sliced-design-in-apps-web.md), [BOUNDARIES.md](../BOUNDARIES.md)): slices of one layer never import each other; what two slices need moves to a lower layer. The shared completion layouts are features (M8-15, M8-16) used by both skills.

## Decision

### 1. A Listening test is JSON in the ADR-0005 pattern

```
ListeningTest  id, version, title, origin, parts[4]
Part           id, number (1–4), audio (AudioAsset), questionGroups[]
QuestionGroup  id, type, instruction (English test text), + the fields of its type
Question       number (1–40), + the fields of its type
```

- Files: `apps/web/content/listening/<testId>.json` (the test), `<testId>.key.json` (§5), `<testId>.transcript.json` (§4). The test's audio and image files (§3, §6) live in the asset folder [ADR-0013](0013-listening-audio-delivery-and-session-state.md) decides (`apps/web/public/media/listening/<testId>/`, hashed file names), which also decides how they are served, cached and preloaded.
- **No `examType`:** Listening is the same test for Academic and General Training (ielts.org).
- **No duration field:** the test's length is the sum of its parts' audio durations; the 2-minute check time is a rule in code (sourced, LISTENING_EXPERIENCE.md), not content.
- **Explicit ids** for parts, groups, transcript segments, images and markers, never derived from positions or text (ADR-0005 §1).
- **`version`** increases with any change to the test file or to an audio file once sessions or results may exist (ADR-0008 §3): audio positions, numbering and options are stored against it. A changed audio file always changes the version, because every stored position and transcript time would shift.
- **`origin`** as ADR-0005 (required) for the test as a whole; each audio file and image has its own provenance (§3, §6). For licensed material `origin` is `{ "kind": "licensed", "source", "license", "url"?, "attribution"? }`: `attribution`, when present, is the exact text the terms require and is shown on the start screen. These two optional fields extend the shared origin shape; Reading files are unaffected.
- **`temporary`** (optional, `true`): the test is temporary practice content (the M8-06 amendment). The interface labels it as such ([LISTENING_EXPERIENCE.md, Temporary practice content](../../product/LISTENING_EXPERIENCE.md#temporary-practice-content-m8)); nothing else changes. For a temporary test the validator requires `origin.kind` `licensed` with `source` and `license`; whether the terms require an attribution text is verified and recorded in M8-07.
- **The validator takes a shape** (parts, questions per part) as ADR-0011 §1 lets the Reading validator take one, so the level check's Listening section (M9) is a form in this contract with its own id and version. The default shape is 4 parts × 10 questions.

### 2. Question types: Reading's where they are the same, new shared types where the layout is new

| Type value | Used by | Shape |
|---|---|---|
| `multipleChoice` | Listening, Reading | As ADR-0005 (stems with lettered options; three options are usual in Listening, not enforced) |
| `multipleChoiceMulti` | Listening, Reading | As ADR-0005 (one item, several numbers, `choose` = the number of numbers) |
| `matchingFeatures` | Listening matching, Reading | As ADR-0005 (a group `options` list, `allowRepeat`, one statement per question). Listening's "matching" is this shape; no new value |
| `sentenceCompletion` | Listening, Reading | As ADR-0005 |
| `noteCompletion` | Listening, Reading | As ADR-0005 (lines of gap segments), plus optional `heading` lines (a line that is a heading has no gap). Adding an optional field does not change existing Reading files |
| `shortAnswer` | Listening, Reading | As ADR-0005, plus: a question may carry `numbers` (2–3) instead of `number`, one question text with one typed answer per number ("List TWO …"). Whether those answers count in either order is M9's checking decision |
| `formCompletion` | Listening (new) | `title?`, `lines[]` of `{ label, value: GapSegment[] }`; a line without a gap is given information |
| `tableCompletion` | Listening, Reading (new, shared) | `title?`, `columns[]` (header texts, 2–4), `rows[]` of `{ cells: GapSegment[][] }` with exactly one cell per column; the first column may be a row header (`rowHeaders: true`) |
| `flowChartCompletion` | Listening, Reading (new, shared) | `title?`, `steps[]` (2–12), each a list of lines of gap segments; linear only (LISTENING_EXPERIENCE.md L6) |
| `labelling` | Listening plans, maps, diagrams; Reading diagram label completion (new, shared) | `image` (§6), `markers[]` and `questions[]` (below) |

**How a completion gap is answered** is data on the group, for `formCompletion`, `noteCompletion`, `sentenceCompletion`, `tableCompletion`, `flowChartCompletion` and `labelling`: `answer: { kind: "typed", wordLimit }` or `answer: { kind: "choose", options, allowRepeat }` (LISTENING_EXPERIENCE.md L7). Reading's existing groups keep their `wordLimit` field unchanged; the `answer` field is used by the new types, and by `noteCompletion` and `sentenceCompletion` only in Listening files (the Listening validator requires it there; the Reading validator keeps reading `wordLimit`). Stored answers keep the Reading shapes: an option id or typed text (LISTENING_EXPERIENCE.md, What an answer is).

**Labelling** covers the three ways a picture is labelled:

| Picture shows | Questions | Answer |
|---|---|---|
| Letters at places (A–H) | Each names a place ("Café") | `choose`, the options are the letter markers |
| Question numbers at places | Each is a numbered place | `choose` from the group's own word list (A–G) |
| Question numbers at labels | Each is a numbered label | `typed` with a word limit |

- `markers[]`: `{ id, label, x, y }` with `x`, `y` as percentages of the image (0–100), and `question?` (its number) or `option?` (its letter). **The app draws the markers over the image** (they are not baked into the image), so their size, contrast and accessible names follow the design system and M8-01, and the same image works at every zoom.
- `questions[]`: `{ number, prompt? }`; `prompt` is required when the markers carry letters.

### 3. Audio assets

```
AudioAsset   src (file name in the test's asset folder, ADR-0013), mimeType ("audio/mp4"),
             durationMs, bytes, sha256, provenance
Provenance   producedBy, method ("synthetic" | "recorded"), tool?, voices[], license, sourceUrl?, attribution?, consentRef?, producedAt, note?
```

- **One file per part** (4 files per test). The player and the session work per part; Practice can start a part when that file can play; Exam downloads all four first (ADR-0013 decides how).
- **Format: AAC-LC in an MP4 container (`.m4a`), mono, 44.1 or 48 kHz.** One format, no fallback chain.
- **Bitrate target: 48 kbps** (about 11 MB for 30 minutes); **ceiling 64 kbps** (about 14.5 MB). The validator rejects a file whose `bytes / durationMs` exceeds the ceiling plus 10% for the container. The target applies to the temporary test's files as transcoded in M8-08 (never upscaled: a source below the target keeps its own bitrate) and is confirmed by the owner when they first listen to it: if 48 kbps does not keep the voices clear, the target moves within the ceiling without a new ADR.
- **The reading pauses are silence inside the recording** (LISTENING_EXPERIENCE.md); the app adds no pauses, so the files are the whole timeline.
- **Part boundaries:** each file starts at its part's spoken introduction; Exam plays the four files in order.
- **Provenance** is required on every file: who produced it (a role or organisation, **no personal data** of voice talent in content files: `consentRef` is the reference to a consent or release record kept outside the repository), synthetic or recorded, the tool and its licence terms for synthetic voices, the accents (`voices[]`: role, accent: "British", "Australian", "New Zealand", "North American", others allowed), the licence under which the product uses the file, and the date. For **existing third-party material** (the M8-06 amendment): `producedBy` is the publisher, `method` is how they made it, `license` names the licence or permission and the terms that apply, `sourceUrl` where it was obtained, and `attribution` the exact text the terms require, when they require one; a permission granted by email or contract is referenced, never copied, when it contains personal data.
- **Files are stored in the repository** for M8 (one test, about 11–15 MB), **only when the material's terms allow copying, conversion to this format and serving to learners from the product** (M8-07 verifies this). Moving assets to object storage is the content system's (M13) or ADR-0013's decision.

### 4. The transcript is a separate file, not loaded during a test

```
Transcript   testId, version (= the test's), revision, review, parts[4]
TranscriptPart  partId, segments[]
Segment      id, startMs, endMs, speaker, text
```

- One segment per utterance or sentence, as the script writer divides it. **Times are in milliseconds from the start of the part's file.** Segments are in order and do not overlap; every segment lies within its file's duration; ids are unique in the test.
- `speaker` is a role label from the script ("Receptionist", "Student 1"), not a real person's name.
- The **spoken instructions** ("You now have some time to look at questions 1 to 5") are segments too, with `speaker: "Narrator"`.
- **Stored now, shown in M9** (review only, LISTENING_EXPERIENCE.md P4). The test page never loads it; the server-only entry point that reads it is separate from the test's (as Reading's key, BOUNDARIES.md).
- **`revision`** increases with any change once results may exist (a typo fix in a segment). Times change only with the audio, which also changes the test's `version` (§1).
- **`review`**: `{ "status": "aiDraft" | "reviewed" | "approved" }` as ADR-0008 §6. A transcript written by Claude is `aiDraft`; one aligned to the recorded audio is checked by a person before it can be `reviewed`.

### 5. The key: as ADR-0008 §3, with evidence in the transcript

- `<testId>.key.json`: `version` (the test's), `revision`, `review`, and per question number `accept` (option ids, or accepted strings in full; ADR-0008 §3's rules for typed variants) and **`evidence`**: one or more `{ segment, quote }`, where `segment` is a transcript segment id and `quote` is the exact phrase within that segment's text that gives the answer (M9 highlights it, and its time is the segment's start). The validator checks that the segment exists and the quote is a substring of its text.
- Every answer has at least one evidence entry (Listening has no NOT GIVEN).
- Checking rules (spelling, numbers, dates, word limits), tags and explanations are M9's decisions (ROADMAP M9-04); M9 adds fields to the key as ADR-0008 did for Reading, covered by the key revision.

### 6. Images, shared with Reading

```
Image        src, mimeType ("image/svg+xml" | "image/webp"), width, height (intrinsic, px),
             alt (short name), description (long text alternative), bytes, sha256, provenance
```

- **SVG for drawn plans, maps and diagrams** (sharp in the enlarged view at any zoom, small), **WebP** for anything else. Budgets: SVG ≤ 100 KB, WebP ≤ 200 KB and at least 1200 px wide.
- **SVG is rendered with `<img>`**, never inlined, so nothing in it can run. The validator also rejects SVG files containing `<script>`, event-handler attributes, `<foreignObject>` or references to other files or URLs.
- **`description` is required** and describes the picture neutrally, including where each marker is, never which answer belongs where (LISTENING_EXPERIENCE.md, Plan, map and diagram labelling).
- **Provenance** as for audio (an original drawing by the content author, or licensed).
- Reading's diagram label completion (M8-19) uses the same `Image` and `labelling` shapes inside a Reading test file.

### 7. Validation, fingerprints and code location

- **One validator per skill**, each turning unknown JSON into a typed test or clear errors, plus **validators for the shared shapes** (gap segments, options, word limits, `answer`, tables, flow charts, labelling, images, origins) that both use. The Listening validator checks: the shape (4 parts × 10 questions, numbered 1–40 in order across parts); unique ids; every gap has exactly one question; option ids unique and referenced options existing; the table, flow-chart and labelling limits above; markers within 0–100 and pointing at an existing question or option; asset metadata present and within budget; `origin` and provenance present. Key and transcript are validated against the test (every question has a key entry; every evidence segment and quote exists; segments ordered, non-overlapping, within duration).
- **Unit tests read the actual asset files** and check their `bytes` and `sha256` against the test file, so a replaced recording cannot ship with stale metadata. Duration is measured at production (M8-08) and recorded; a test may confirm it from the MP4 header without a dependency.
- **Fingerprint tests** as ADR-0008 §3 for the test file (per `version`), the key (per `revision`) and the transcript (per `revision`); audio and image files are covered by their `sha256` in the test file, so changing one changes the test file and its fingerprint.
- **Code:** the shared content shapes and their validators live in **`apps/web/src/shared/content/`** (no product rules beyond structure; both entities import it by path, BOUNDARIES.md updated on acceptance); the Listening contract, its validator and its server-only loaders in a new **`entities/listening`** slice, as `entities/reading` holds Reading's. The Reading types that M8-17 to M8-19 add, and the Reading types that move onto the shared shapes, keep their JSON exactly as it is (no Reading content version changes).

### 8. Not decided here

Audio delivery, caching, preloading and the Listening session (ADR-0013, M8-04); Listening answer checking, explanations and the attempt history (M9); authoring tools, review workflow and publishing (M13); original audio production (deferred by the owner at M8-06 to the content system, M13-07 and M13-08; the owner's final materials replace the temporary test in M13-10 and M13-11).

## Alternatives considered

| Decision | Option | Pros | Cons |
|---|---|---|---|
| Contract | **A. JSON in the ADR-0005 pattern, Reading's types reused, shared new types (chosen)** | One way to write content for both skills; renderers and validators reused; the shared layouts are one implementation | Shared shapes need a home both entities can import (`shared/content`) |
| | B. A separate Listening contract with its own copies of every type | No coupling between skills | Two table, flow-chart and labelling contracts for one layout; drifts |
| | C. Defer: Listening content as TypeScript modules for the demo | Fast for one test | Content becomes code (ADR-0005 rejected this); rework in M13 |
| Audio files | **One file per part (chosen)** | Practice per part starts sooner; a failed download retries one part; matches the session's positions | Exam crosses three file boundaries (in the recording's silence) |
| | One file per test | Gapless Exam playback; one download | Practice must load or seek into the whole file; one failure restarts everything |
| | One file per question group | Smallest units | Many requests; boundaries inside parts are audible; nothing needs it |
| Audio format | **AAC-LC in MP4, one format (chosen)** | Plays in all major browsers (MDN); one file per part, one validator rule | Patent-encumbered codec (for encoder developers, not for a site serving files) |
| | Opus (WebM) with an AAC fallback | Smaller for speech | Two files per part and a fallback chain; Safari's Opus support depends on container (MDN) |
| | MP3 | Plays everywhere | Larger for the same speech quality |
| Transcript | **A separate file, not loaded during a test (chosen)** | Answers cannot leak; its own revision for typo fixes | Three files per test |
| | Inside the test file | One file | Every answer in the browser during the test |
| Markers | **Drawn by the app over the image (chosen)** | Accessible names, contrast and size from the design system; one image for every zoom | Positions must be authored as coordinates |
| | Baked into the image | Simple authoring | Letters lose contrast and size control; no accessible names; harder to reuse an image |

## Why this decision

- **Correctness:** answers and the transcript never reach the browser during a test; evidence points at a segment and an exact quote the validator checks; audio and images are pinned by hash, so a recording cannot change under stored positions.
- **Simplicity:** one format, one file per part, files in the repository for the demo; Reading's types and validators reused rather than copied.
- **Consistency:** ADR-0005's files and ids, ADR-0008's revisions, fingerprints and review statuses, ADR-0011's validator shape for forms, ADR-0010's layers.
- **Weak connections:** 48 kbps mono speech keeps a 30-minute test near 11 MB, with a hard ceiling the validator enforces.

## Consequences

- **Positive:** the demo scripts and audio (M8-07, M8-08), the renderers (M8-14 to M8-16), Reading's follow-ups (M8-17 to M8-19), review (M9) and the level check's Listening section (M9) have one exact contract.
- **Costs accepted:** coordinates for markers and millisecond times for segments are authored by hand until M13's tools; binary assets in the repository (about 11–15 MB per test); a new `shared/content` module and BOUNDARIES.md rule.
- **Harder to change later:** type names, segment ids and the per-part file layout once sessions and results refer to them (mitigated by `version` and the transcript `revision`).

## Follow-up / migration notes

- **Implementation:** M8-09 (types and validators, the shared shapes, fixtures and fingerprint tests), M8-07 and M8-08 (the demo test, its key, transcript and audio with provenance).
- **Docs on acceptance:** the ADR index (Accepted); ARCHITECTURE.md (the Listening contract confirmed; "Audio" and "Content model" updated); BOUNDARIES.md (`shared/content`, `entities/listening`, the transcript's server-only entry point).
- **Enforcement:** the validators and their unit tests; fingerprint tests; the asset hash and size test; the existing lint boundaries for the new slice.
