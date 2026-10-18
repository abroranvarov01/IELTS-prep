# ADR-0011: Level-Check Forms, Results and Storage

- **Status:** Proposed
- **Date:** 2026-10-18
- **Deciders:** owner (at M7-05); drafted by the worker in M7-04

## Context

M7 replaces the interim level-check page with a real check ([LEVEL_CHECK.md](../../product/LEVEL_CHECK.md), DRAFT; flows in [USER_FLOWS.md, Level check flows (M7)](../../product/USER_FLOWS.md#level-check-flows-m7)). Its Reading section is a short fixed form of original items answered in the Reading engine; its result is a starting level per skill on the product's own scale, never an IELTS band; a section can be left, resumed, finished and retaken; the Listening section joins in M9, accounts and sync in M10, personalization in M11.

Forces:

- **Reuse without entanglement.** The Reading engine, its content contract ([ADR-0005](0005-reading-content-contract.md)), session model ([ADR-0006](0006-reading-session-state.md)), checking module ([ADR-0008](0008-reading-answer-checking-and-explanations.md)) and attempt history ([ADR-0009](0009-reading-attempts-on-the-device.md)) exist and are tested. The check must use them through their public APIs, and **must not** write into the Reading attempt history: a check is not a practice attempt (it must never count as a first try, appear in the Practice Hub, or feed "Mistakes that repeated"), and Reading's stores must keep their M5 guarantees untouched.
- **Honesty is versioned.** A result is meaningful only with the form it was taken on, the checking rules that scored it and the level rules that named it. Any of the three may change; results must stay traceable and never be rewritten (as ADR-0009 §7).
- **Home cannot read the device.** Home is server-rendered from a cookie ([ADR-0003](0003-guest-state-on-the-device.md)) and cannot read `localStorage` or IndexedDB (ADR-0006 §4), yet after the check its next action changes.
- **Later milestones.** M9 adds a second section with its own engine; M10 carries the device's history into an account without rewriting it; M11 reads results for recommendations. The shape must hold per-skill sections and merge without conflicts.

## Decision

### 1. A form is a Reading test file with a separate key, under its own id and version

- A **form** is a file in the Reading content contract (ADR-0005), with its own id (`level-check-reading-a`), `version` (the **form version**), two passages, 14 questions in the approved M4 types, validated by the same validator. Its **answer key** is a separate file as in ADR-0008 §3 (revision, accepted answers, evidence, tags). Its explanations are per-locale files as ADR-0008 §5, shown only through the review after the result (LEVEL_CHECK.md D13).
- The form lives under `apps/web/content/level-check/`, not among the practice tests, and the **Reading catalog never lists it** (the Practice Hub and the Reading routes do not see it). A fingerprint test freezes each form version as ADR-0008 §3 freezes tests.
- The Listening section (M9) uses the Listening content contract the same way, as a form with its own id and version.

### 2. The section runs on the Reading session model, in a separate storage entry

- The section's in-progress state is a Reading `Session` (ADR-0006 §1: the same reducer and transitions, mode `practice`, with the check's removals done by not rendering the controls, never by a new session kind). It is kept in `localStorage` under **`levelCheck:reading`** (one entry per skill section; the form id is inside the envelope), written after every transition, read as untrusted input by the existing session parser plus the check's envelope parser. A session whose form id or version is not the current form reads as "not started" (as ADR-0006 §2 for stale content).
- "Start over" and "Take the check again" replace the entry with a new session (new id). Nothing is committed until the section is finished.

### 3. Finished sections are committed atomically to the check's own database

- One IndexedDB database **`ielts-prep-level-check`**, version 1, object stores **`attempts`** (key `id`, index `skill`) and **`results`** (key `[attemptId, keyRevision, rulesVersion, levelRulesVersion]`). It is separate from `ielts-prep-reading` so that neither database's version, retention or transactions can touch the other.
- **Commit** follows ADR-0009 §4 exactly, in this database: the finished session is written to `localStorage` first; one read-write transaction adds the attempt if no attempt with its id exists (two tabs: the first commits, the second keeps it); the `localStorage` entry is removed only after the transaction completed and the attempt exists. A failed transaction leaves the finished session as the recoverable source.
- **Result records** are written as ADR-0009 §7: when the result page shows an attempt and no record exists for the current (key revision, checking-rules version, level-rules version), the attempt is checked by the ADR-0008 checking module and the level computed by the level-rules module, and one record is added (exactly one per attempt and triple, whichever tab first). Earlier records are kept. An attempt whose form version is no longer current gets no new record; the most recent stored one is shown with the "check has changed" note.

```
LevelCheckAttempt (store "attempts")
  schema          1
  id              the session's id (ADR-0009 §3)
  skill           "reading" | "listening"
  formId, formVersion
  startedAt, finishedAt, finishReason ("user")
  answers         copied from the session (ADR-0006 shapes); no pins, no highlights
  timeTakenMs     finishedAt − startedAt minus nothing (whole wall-clock span; M11 decides how to read it)
  committedAt

LevelCheckResult (store "results")
  schema, attemptId, keyRevision, rulesVersion, levelRulesVersion, checkedAt
  outcomes        per question number: "correct" | "incorrect" | "unanswered"   (ADR-0008 §1)
  signals         per answer unit (ADR-0008 §1), kept for "practise first"
  score, total    correct positions and the form's positions
  answered        positions with an answer (for the insufficient-data rule)
  level           1 | 2 | 3, or "insufficient"
  practiseFirst   up to two question-type ids (LEVEL_CHECK.md §5.1)
```

- **Retention:** at most 10 attempts per skill, the oldest removed with their records inside the commit transaction. The level check has no first-try marker (nothing in the product reads one for it).
- **The starting point** of a skill is the result record of the **latest finished attempt** of that skill at the current form version, derived at read time (ADR-0009 §10: derived, not stored).

### 4. The level rules are a pure domain module with their own version

- `entities/level-check/model/` (the FSD entity; ADR-0010) holds the result computation: from a checking result (ADR-0008's outcomes and signals) and the form's positions to `level`, `answered`, `practiseFirst`, with **`LEVEL_RULES_VERSION`** (an integer) that increases whenever a change could alter a level or a suggestion for the same outcomes (thresholds, the insufficient-data rule, the "practise first" rule). The checking module is reused, not copied; its `SCORING_RULES_VERSION` is recorded separately.
- Types cannot hold a band: the level is a union of `1 | 2 | 3 | "insufficient"`, and nothing converts a score to a band (`.claude/rules/domain/ielts-scoring.md`; INVARIANTS I-2 still has nothing to protect). The thresholds are product policy, tested at every boundary (M7-07).

### 5. Home learns the state through a second small cookie

- A first-party cookie **`ielts-prep-level-check`**, written **only by Server Actions** (as ADR-0003 §1), holds a versioned, compact state per skill section and nothing else: `v1` plus, per skill, `none | inProgress | done`. About 20 bytes; no score, no level, no timestamps.
- The section page calls the action when a session starts (`inProgress`) and when a commit completes (`done`); "Start over" after `done` keeps `done` (the earlier result stands until a new one is committed). The action validates the value with the same domain definitions and sets the cookie with ADR-0003's attributes.
- Home and onboarding step 3 read it on the server to choose their card (find / continue / practise); the result page reads the device. If cookies are blocked, Home keeps "Find your level" and the intro still shows the device's state (the cookie is a hint for a server-rendered page, never the source of truth). M11 decides Home's full data path and may replace this cookie; until then it is the only level-check data outside the device's storage.

### 6. Untrusted data, unavailable storage, sync

- Every record read from either store is parsed by a domain parser; invalid records are ignored, unknown schemas are ignored and never overwritten; a database at a newer version is treated as unavailable (ADR-0009 §9).
- IndexedDB unavailable: the finished section is checked and shown from memory with the storage notice; the `localStorage` source is kept for a later commit. `localStorage` unavailable: the section runs in memory and "Exit" asks first (USER_FLOWS.md).
- **Sync (M10):** attempts and results are append-only records with device-unique ids and full version triples, so they merge by union; the "latest finished attempt" rule resolves which starting point a device shows. The cookie is not synced; after sync the server knows the state from the records.

### 7. Not decided here

The form's items (M7-06); the UI (M7-09, M7-10); whether a second form rotates for retakes (M13); what M11 reads from `timeTakenMs` and `signals`; server-side storage of results (M10).

## Alternatives considered

| Option | Pros | Cons |
|---|---|---|
| **A (chosen): a form in the Reading content contract, the Reading session model, a separate `localStorage` entry and a separate IndexedDB database, a pure level module with its own version, a state-only cookie** | Reuses every tested engine piece; Reading's stores and guarantees untouched; results traceable to form, key, checking and level rules; append-only for sync; Home works server-side | Two databases to keep in mind; a second cookie; a form file that is a "test" the catalog must hide |
| B: store check attempts in `ielts-prep-reading` with a `kind: "levelCheck"` | One database, one history | Retention, first-try marking and the Hub must all learn to skip the check; a schema bump of a store that holds real M5 data; a check mistaken for practice by any reader that forgets the kind |
| C: a new check-specific session model and engine | No removals, nothing hidden | Duplicates the reducer, sheet, navigator and controls that the check needs unchanged; two engines to keep in sync with every M8 layout |
| D: Home reads the device after mounting (no cookie) | No second cookie | A server-rendered Home that flashes the wrong card, or a client Home that decides M11's data path early; ADR-0006 §4 chose the cookie pointer for this case |
| E: result records without a level-rules version | Simpler key | A threshold change silently relabels old results, or forces a recheck that the key did not justify |

## Why this decision

Correctness first: the check's data cannot corrupt Reading's history or be mistaken for practice, and every result carries the versions that give it meaning. Clarity and simplicity next: one new entity, one new database with two stores, one cookie with three words, and an engine reused by removal rather than extension. Consistency: the same commit transaction, parsers, retention and "derived, not stored" rules as ADR-0009. Maintainability: M9 adds a skill, M10 merges by union, M11 reads records; none of them changes this shape.

## Consequences

- Positive: the Reading engine serves the check unchanged; results are honest by construction (no band type exists); a learner's history survives form changes and sync.
- Negative / costs accepted: a second IndexedDB database and a second cookie to document and test; the catalog must exclude the form; the engine's controls need a "not rendered" path for flags, pins and the evidence block.
- What becomes harder to change later: the result record's key (four parts) and the cookie's shape, once results exist on devices.

## Follow-up / migration notes

- M7-07: the level module with `LEVEL_RULES_VERSION` and boundary tests; M7-08: the storage adapters and parsers, the commit transaction, two-tab tests; the cookie action next to the goal action.
- A fingerprint test for each form version and key revision; a test that the Reading catalog does not list the form.
- BOUNDARIES.md: the `entities/level-check` slice and the `views/level-check` rework; LOCALIZATION.md: nothing new.
- M9: `skill: "listening"` records and the Listening form; M10: sync by union; M11: may replace §5.
