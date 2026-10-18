# ADR-0014: Listening Attempts, Checking and a Multi-Skill History on the Device

- **Status:** Accepted (owner, 2026-10-18, task M9-04). The storage approach (§1 to §5, §8a) was accepted first; §6 to §8 at M9-04 with the owner's clarifications, applied below: playback coverage for `notReached` (§2), the compatibility check before Listening level-check records are written (§7), and review audio from a valid cache when available (§6). The owner's decisions LD4, LD6, LD13 and LD20 are applied in §7. Drafted in M9-03, 2026-10-18.
- **Date:** 2026-10-18
- **Deciders:** Project owner (acceptance), Claude (draft)

## Context

M9 adds results, evidence-first review, repeated mistakes and retries to Listening ([LISTENING_EXPERIENCE.md, M9 specifications (drafts)](../../product/LISTENING_EXPERIENCE.md#m9-specifications-drafts), decisions LD1–LD22) and the level check's Listening section. Listening needs what Reading got in M5: committed attempts that the first tab keeps, a first try that is known or explicitly "unknown", one result record per attempt and pair of versions, retries, and checking that records what judged it.

**What exists on learners' devices today** (inspected 2026-10-18 in the code):

| Store | Holds | Defined by |
|---|---|---|
| IndexedDB `ielts-prep-reading`, **version 1**: `attempts` (key `id`, index `testId`), `results` (key `[attemptId, keyRevision, rulesVersion]`, index `attemptId`), `firstTry` (key `testId`) | Reading attempts (`s-…`, `m4-current-…`, `m4-finished-…` ids; `kind` test or retry; answers, pins, highlights), result records, first-try markers; schema 1 | ADR-0009 §2 (`entities/reading/api/history.ts`) |
| IndexedDB `ielts-prep-level-check`, version 1: `attempts` (key `id`, index `skill`), `results` (key `[attemptId, keyRevision, rulesVersion, levelRulesVersion]`) | Level-check attempts with `skill: "reading" \| "listening"` (only Reading written so far) and their records | [ADR-0011](0011-level-check-forms-results-and-storage.md); kept **separate from `ielts-prep-reading` "so that neither database's version, retention or transactions can touch the other"** |
| `localStorage` `reading:<testId>`, `reading:<testId>:retry`, `reading:<testId>:finished` (M4, imported and removed) | Reading sessions | ADR-0006, ADR-0009 |
| `localStorage` `listening:<testId>` and **`listening:<testId>:finished`** | Listening sessions with a random `sessionId`; the finished one kept, **one per test, overwritten** by the next finish, "until M9's attempt history imports it" | [ADR-0013](0013-listening-audio-delivery-and-session-state.md) §3 |
| `localStorage` `levelCheck:reading` | The level check's Reading section in progress | ADR-0011 |

**Forces:** every Reading record must stay exactly as it is (the milestone's goal, M9-06's acceptance criterion); old app versions may still run in another tab while a new one opens the same storage; stored data is untrusted input; domain logic stays out of the UI (I-3, I-4); no new runtime dependency without a reason; M10 will carry the history into an account and M11 will read across skills.

**What an IndexedDB upgrade involves:** opening a database at a higher version runs one versionchange transaction that can add or delete stores and indexes and rewrite records; it is atomic (an interrupted upgrade leaves the old version), but every other open connection must close first (the current code closes on `versionchange`), and an app that still asks for the old version afterwards gets a `VersionError` (the current code then falls back to memory and shows the storage notice, ADR-0009 §9). An index cannot list records that lack its key path, so a `skill` index over existing Reading records would require writing `skill` into every one of them.

## Decision

### 1. Listening gets its own history database; the Reading database is not upgraded

- A new IndexedDB database **`ielts-prep-listening`, version 1**, with the three stores of ADR-0009 §2 in the same layout: `attempts` (key `id`, index `testId`), `results` (key `[attemptId, keyRevision, rulesVersion]`, index `attemptId`), `firstTry` (key `testId`).
- **`ielts-prep-reading` stays at version 1, unchanged.** No upgrade, no new store or index, no record written by Listening code. Reading's records, versions, retention and transactions cannot be touched by Listening, as ADR-0011 already decided for the level check.
- **First-try markers per test and skill** follow from this: each skill's `firstTry` store holds its own tests. Test ids need not be unique across skills.
- **"The history" is a set of databases, one per area** (Reading practice, Listening practice, the level check), each with `skill` implied by the database (practice) or stored per record (the level check). A reader across skills (M10 sync, M11 progress) opens each database it needs; with at most 20 attempts per test (§4) a full read is small.
- **Shared code, not shared stores:** the transaction helpers, the open-and-fallback logic and the commit, import, first-try and retention steps of ADR-0009 §4 to §9 are skill-independent; M9-06 may move them into `shared/lib/` behind a small interface parameterized by the database name and the record parsers, **behavior-preserving for Reading** (its unit and browser tests unchanged and passing). The record shapes and parsers stay in each skill's entity (`entities/reading`, `entities/listening`).

### 2. Listening record shapes (database `ielts-prep-listening`, schema 1)

```
ListeningAttempt (store "attempts")
  schema           1
  id               the session's sessionId (ADR-0013 §3: "s-" and a random UUID), also for an
                   imported M8 finish (§5)
  testId, testVersion
  kind             "test" | "retry"
  retryOf?, questions?           retry only: the source test attempt, the retried numbers (whole answer units)
  mode             "practice" | "exam"          (a retry is always "practice")
  startedAt, finishedAt
  finishReason     "user" | "timeUp" | "audioFailed"
  answers          copied from the session, in the ADR-0013 shapes (a "List TWO" question: one typed answer per number)
  exam?            Exam only, copied at commit: recordingStartedAt?, pausedMs (any pause open at finishedAt
                   closed at finishedAt), interruptions, playedToMs? (per part, the furthest position
                   actually played; absent means coverage unknown)
  importedFromM8?  true for an attempt imported from "listening:<testId>:finished"
  committedAt

Result (store "results")       as ADR-0009 §2: schema, attemptId, keyRevision, rulesVersion, checkedAt,
                               outcomes per question number, signals per answer unit (codes), score, total
FirstTry (store "firstTry")    as ADR-0009 §2: schema, testId, firstTry: "<attempt id>" | "unknown"
```

- **Kept:** answers, timestamps, and the Exam timing inputs, because the "interrupted" line is derived from them ("derived, not stored", ADR-0009 §10).
- **Playback coverage for `notReached`** (owner clarification at M9-04): elapsed time is not evidence that a passage was heard. The ADR-0013 session gains an optional Exam field `playedToMs` (per part, the furthest position of the audio element's `currentTime` while it was actually playing, saved with the heartbeat and on pause; Exam allows no seeking, so this is the covered range). It is an additive optional field, so the session envelope stays at schema 1 and older sessions read as "coverage unknown". `notReached` is derived only from `playedToMs` and the unit's first evidence segment; with coverage unknown (an M8 session, an unreadable value), no note asserts whether a question was heard. **Not kept:** flags, the view, Practice audio positions and speed (they describe the sitting, not the answers).
- **Signal codes only:** a result stores codes (`mentionedOption`, `notReached`, …); the note's details (the option text, the times, the word) are read from the test, key and transcript at display, which the result's versions pin.
- **Answer units for "List TWO":** stored answers stay per number (no session change); checking and review group the question's numbers into one unit (LD6), keyed by its first number, as a "choose several" item is.

### 3. Commit, ids, first try, results and retries: ADR-0009 unchanged

Applied to the Listening database with these Listening keys, and otherwise exactly as written there:
- **§3 ids:** every Listening session already has a random `sessionId` (ADR-0013); M8 never stored a session without one, so there is no `m8-current-…` id.
- **§4 commit:** the finished session stays in `listening:<testId>` until the IndexedDB transaction that adds the attempt (only if absent) and decides the first try has completed; a stale in-progress copy of a committed session is removed on load.
- **§5 first try**, **§7 result records** per attempt and pair (written even when unchanged, all kept, the correction notice only for visible changes), **§8 retries** (`listening:<testId>:retry`, validated against a committed test attempt of the current content version), **§9** untrusted data, unknown schemas never overwritten, a newer database never touched, the in-memory fallback, asynchronous reads, **§10** derived values, **§11** the same two-tab tests against `fake-indexeddb` and in Playwright.

### 4. Retention

At most **20 attempts per test** in the Listening database, the oldest removed with their records inside the commit transaction, never the first-try attempt or an unknown-schema record (ADR-0009 §9). A Listening attempt with its records is a few kilobytes (no highlights or pins), so the limit is about consistency, not size.

### 5. The one migration: M8's finished Listening sessions

M8 kept the latest finished session per test in `localStorage` (`listening:<testId>:finished`), overwriting earlier ones. It is imported exactly as ADR-0009 §6 imported M4's Reading finishes:
1. On the first load of any Listening page of that test (the start screen, results, review, retry), read the entry. If it does not parse with the ADR-0013 session parser, is not `finished`, or its `testVersion` is not the current one: leave it untouched and never read it again.
2. One read-write transaction over `attempts` and `firstTry`: if no attempt with the session's `sessionId` exists, add it with `importedFromM8: true`, its mode, times, finish reason, answers and Exam timing exactly as stored, and no result; in any case set the test's first-try marker to **"unknown"** (M8 kept only the latest finish, so earlier ones may have existed).
3. Only when that transaction has completed, remove the `:finished` entry. A failed transaction leaves it, and the next load tries again; two tabs importing at once produce one attempt.
4. The attempt is checked the first time its results are shown, with the "checked later" note. Nothing is invented: no score, outcome, check date or first-try claim.
- **The import uses the session's own `sessionId`**, unlike M4's deterministic `m4-finished-…` ids (M4 sessions had no id). So a stale tab that commits the same M8 session through §3, before or after the import, meets the same key: whichever transaction runs first commits the attempt and the other keeps it unchanged (ADR-0009 §4). One sitting is never held twice.
- **Reading data is not migrated.** Nothing in `ielts-prep-reading`, the `reading:*` entries or `ielts-prep-level-check` is read, written or removed by M9's Listening code.

### 6. Listening checking: ADR-0008 applied to Listening

- **One domain module** `entities/listening/model/scoring.ts` (the file name keeps it under `.claude/rules/domain/ielts-scoring.md`): a pure function from the test, the key, the transcript and an attempt (answers, mode, finish reason, Exam timing) to a result: outcomes per question number, signals per answer unit, marks and positions. **`LISTENING_SCORING_RULES_VERSION`**, its own integer from 1, recorded in each Listening result; a change to Listening's rules never rechecks Reading attempts, and the reverse.
- **Shared normalization:** Reading's typed-answer normalization (ADR-0008, D2) moves to `shared/content/` and both modules call it (LD2). The move must not change any Reading outcome: Reading's checking tests run unchanged against it, so Reading's `SCORING_RULES_VERSION` stays as it is. **Word counting stays per skill**: Listening's "A NUMBER" part (LD5) is wider than Reading's, and Reading's count does not change.
- **No signal on a correct answer** (owner clarification): spelling, word-limit, `notInTranscript` and number-format signals are computed only for incorrect answers; `notInTranscript` only for `fromRecording` questions, after normalization, ignoring any word that appears in an accepted variant.
- **Review audio** (owner clarification): the review player uses a part's file from Cache Storage when a copy with the right `sha256` is there (ADR-0013 §2; its cleanup rule is unchanged), otherwise the network; with neither, the review works without audio and says so. No offline playback is promised.
- **Where checking runs** (ADR-0008 §2): in the browser, on the results and review pages only. Their server-only entry points load the key, the transcript and the active locale's explanations; the test screen loads none of them (ADR-0012 §4, §5). The same trust model: a determined user can read them from those pages.
- **No band conversion** (LD1).

### 7. Listening key and explanation files

**Key additions** (`<testId>.key.json`, validated against the test and the transcript; every change increases `revision`, enforced by the existing fingerprint test):
- **`transcriptRevision`** (required): the transcript revision the key was checked against; the validator requires it to equal the transcript file's `revision`. So **a transcript correction cannot ship without a key revision**, and a result's `keyRevision` also pins the transcript that `notInTranscript`, the excerpts and the timestamps came from. This keeps the result key of ADR-0009 (and ADR-0011's level-check key path) unchanged.
- **`fromRecording: true`** (optional, typed questions only): the `notInTranscript` signal applies.
- **`ordered: true`** (optional, on a "List TWO" question's first number, LD6): the instruction requires an order, so each field is checked against its own number's entry instead of in either order.
- **`tag`** (optional): one of `paraphrase`, `spelledOut`, `correction`; all numbers of a "choose several" item or a "List TWO" question carry the same tag or none.
- **`distractors`** (optional): `[{ option?, text?, segment, quote, review }]`, exactly one of `option` (an option id of the question or group) and `text` (a typed string, validated like an accepted variant and never equal to one); `segment` and `quote` checked as evidence is (ADR-0012 §5); **`review`: `"aiDraft" | "verified"` per entry** (LD13, owner): `verified` only after a person has checked that claim and its timestamp against the recording, recorded in PROGRESS.md (M15-09). Checking produces `mentionedOption` only from `verified` entries; `aiDraft` entries are ignored everywhere a learner could see them.
- **Dates** (LD4, owner): numeric date variants are listed day first; a form that reads as two dates is listed only in its day-first reading; nothing is accepted that is not listed. Product policy, recorded in the checking module's comments and tests as such.
- **Rules carried from ADR-0008 §3:** typed variants in full, each non-empty, distinct after normalization and within the word limit by Listening's count; "choose several" numbers share one `accept` set of exactly `choose` options; **new:** a "List TWO" question's numbers list different things, so no variant appears under two of its numbers.
- **`review`** as today (`aiDraft` / `reviewed` / `approved`, ADR-0008 §6).

**Explanation files:** `content/listening/<testId>.explanations.<locale>.json` for `uz`, `ru` and `en`, in ADR-0008 §5's format (one item per answer unit under its first number; `explanation` and `simpler` as segments; the same length limits and validator; `review` status). One segment kind is added: **`{ "at": "<segment id>" }`**, rendered as that segment's start time ("2:40"), so a time in an explanation is checked by the validator and moves with the transcript instead of being typed by hand.

**The level check's Listening form** uses the same files and rules, as a form of the Listening contract with its own id and version (ADR-0012 §1). Its attempts and records go to `ielts-prep-level-check` as `skill: "listening"` records in ADR-0011's shapes, with Listening answers and the Listening rules version; the database is not upgraded (its `skill` index and key path appear to fit). **Before M9-12 writes such records** (owner clarification), it verifies compatibility with that database's stores, key paths, validators and readers (for example that the attempt parser and the readers accept `skill: "listening"` and the Listening answer shapes without misreading Reading records); Reading records are preserved. If a schema change is actually required, the specific incompatibility is reported to the owner and this design is not changed silently. The Listening thresholds there are provisional product heuristics (LEVEL_CHECK.md §9.1). Its section in progress is `levelCheck:listening` in `localStorage`, an ADR-0013 session (Practice mode, with the check's removals in the interface, LD20). **Pauses and interruptions** (LD20, owner): the section's session adds `check: { pauses, interruptions }` counts (the learner's pauses, including leaving while the audio plays; and playback stops the learner did not make), and each recording's exact position, resumed with no rewind; the committed Listening level-check attempt keeps both counts as optional fields of ADR-0011's attempt shape (absent on Reading records, so no Reading record changes), and the result is qualified from them at display. Neither count changes the score or level.

### 8. How M10 sync will carry both skills (constraints for the M10 ADR, not decided here)

- **Union by key, per database.** Attempts and result records are immutable once committed and keyed by random ids or by `[attemptId, keyRevision, rulesVersion]`, so a device's records and an account's merge by set union without rewriting any record. The skill is the database's (practice) or the record's (level check); the server stores it explicitly.
- **First-try markers merge towards "unknown"**: the same id on both sides stays; different ids, or an id on one side and attempts of the test on the other, become "unknown" (ADR-0009 §5's rule that a marker only moves towards "unknown").
- **Retention after a merge** per test and database, never removing a first-try attempt.
- Sessions in progress, the cookie for Home, server storage and data residency are M10's.

### 8a. Storage-independent interfaces for progress and sync (accepted; documented, not built)

Code outside a skill's entity never opens a history database, names one, or reads its records' storage form. Each skill's entity (`entities/reading`, `entities/listening`, and `entities/level-check` for its records) exposes its history through its public API (ADR-0010), and future readers depend only on that:
- **Read side, for progress (M11):** per skill, a reader that lists committed attempts as storage-independent summaries (`skill`, attempt id, test or form id and version, kind, mode, `startedAt`, `finishedAt`, finish reason, and for the record of the current pair: score, total and the versions that produced it, plus the level-check level and its qualifications) and returns a test's first-try marker and an attempt's result records. Readers across skills combine the per-skill readers; they never assume one database or one record shape.
- **Sync side, for M10:** per skill, an export of immutable records with their keys, and an import that adds absent records by the union rule of §8 inside the skill's own transaction, so the merge rules stay next to the storage they protect.
- **What changes when storage changes:** only the entity's adapter. Moving a skill's history to one combined database later, or to the server in M10, keeps these interfaces.
- **Not built in M9:** no cross-skill reader, export or import exists until M10 or M11 needs it; M9-06 keeps the Listening history behind the entity's public API, as Reading's is, so the interfaces can be added without touching callers.

### 9. Not decided here

Band conversion and calibration; runtime AI; the content system's authoring and review workflow (M13); server storage and sync (M10); progress across tests and skills (M11); transcripts during a test for deaf or hard-of-hearing learners (ACCESSIBILITY.md TBD).

## Alternatives considered

| Option | Pros | Cons |
|---|---|---|
| **A. A separate `ielts-prep-listening` database; `ielts-prep-reading` untouched (chosen)** | No upgrade and no migration of Reading data, so every Reading record stays as it is by construction; a Listening bug cannot reach Reading's stores, retention or transactions; old app versions keep working with their database; first try per skill for free; consistent with ADR-0011's separate level-check database | Cross-skill readers (M10, M11) open more than one database; the generic history code must be shared (or duplicated) |
| B. **Upgrade `ielts-prep-reading` to version 2** for both skills: Listening records with `skill: "listening"` in the same stores; Reading records left without `skill` ("absent means Reading"); `firstTry` keyed by `testId` with test ids made unique across skills, or a new `firstTryBySkill` store keyed `[skill, testId]` with the existing markers copied into it; the upgrade transaction creates the new store and copies; tests with real M4/M5 shapes (sessions, imported M4 attempts, highlights, pins, retries, first-try markers), two tabs, and an interrupted upgrade | One database for all practice; one place for M10 to sync | An upgrade that every open Reading tab must yield to (an old tab then falls back to memory and loses its history until reloaded); a copy of first-try markers (the only Reading data that would be rewritten); a `skill` index would require writing `skill` into every Reading record; Reading's retention and transactions share stores with Listening; the database keeps a misleading name |
| C. The same database, **no version change**, Listening records with `skill` | No upgrade | All of B's sharing and naming costs; test ids must be unique across skills forever; a Reading parser could meet a Listening record under a colliding key |
| D. A new `ielts-prep-history` database for both skills, copying Reading's records into it and deleting the old database | A clean name and one store set | Copies every Reading record across databases, which IndexedDB cannot do atomically; a failed copy needs its own recovery; the highest risk to the data the milestone must protect |
| E. Listening attempts in `localStorage` | Synchronous, simple | Not atomic across tabs (ADR-0009's reason for IndexedDB) |
| F. A separate `transcriptRevision` in each result record's key | The transcript versioned on its own in results | Changes the result key path, which for the level check's database means an upgrade; the key's `transcriptRevision` (chosen) gives the same guarantee without it |

## Why this decision

- **Correctness:** the milestone's hardest requirement is that no Reading record changes; a database Listening never opens for writing cannot change one. The ADR-0009 guarantees (first committed attempt kept, one first-try decision, one record per pair) carry over by reusing the same transactions on a database with the same layout. A transcript correction cannot silently change a result, because it forces a key revision.
- **Simplicity:** no upgrade path, no copy, no "absent means Reading" rule; the only migration is M8's single `localStorage` entry per test, by a procedure already proven for M4.
- **Consistency:** the same split ADR-0011 chose for the level check; the same record shapes, parsers, retention and versions as Reading.
- **Maintainability:** a later skill adds a database of the same layout; M10 merges by union per database; M11 reads records. Cost accepted: readers across skills open several databases.

## Consequences

- **Positive:** Reading's history, its tests and its behavior are untouched; Listening gets the full M5 model; corrections to a key or a transcript are visible and traceable; the level check's Listening section needs no storage change.
- **Costs accepted:** a third IndexedDB database on the device; cross-skill reads open several databases; shared history code to extract (M9-06) or a duplicate to avoid.
- **Harder to change later:** merging the databases into one (option D's copy) if M10's server model wants one stream; mitigated by immutable records and union merges, which make a later copy idempotent.

## Follow-up / migration notes

- **M9-06's scope was changed accordingly** (owner, 2026-10-18): instead of "the accepted database upgrade and migration" and "interrupted upgrades", M9-06 builds the Listening database, the M8 import, the shared history code, and tests that **`ielts-prep-reading` and the `reading:*` entries are unchanged** after Listening activity, using real M4/M5 shapes (sessions, imported M4 attempts, highlights, pins, retries, first-try markers), plus two tabs and interrupted transactions for the import, with the history behind the entity's public API (§8a).
- **Implementation:** M9-05 (checking, signals, the rules version, the shared normalization with Reading's tests unchanged, the key and explanation validators), M9-06 (storage, import, retention, fallback), M9-07 (explanation files with `at` segments), M9-12 (the level check's Listening form and records).
- **Enforcement:** the fingerprint tests (key, transcript, test), the validator's `transcriptRevision` equality, Reading's existing checking and history tests unchanged, a test that Listening code never opens `ielts-prep-reading`, and the two-tab tests of ADR-0009 §11 for Listening.
- **Docs on acceptance:** the ADR index (Accepted); ARCHITECTURE.md ("Guest practice state": Listening attempts confirmed); BOUNDARIES.md if history code moves to `shared/lib/`; ADR-0013 §3's "until M9's attempt history imports it" points here.
