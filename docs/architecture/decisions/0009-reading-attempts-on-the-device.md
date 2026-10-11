# ADR-0009: Reading Attempts and Results on the Device

- **Status:** Accepted (2026-10-11, owner, task M5-01, with the owner's amendments applied; drafted in M5 planning). Approval source: the owner instruction of 2026-10-11 on the review packet at commit 069877e. It amends [ADR-0006](0006-reading-session-state.md) §2: the `reading:<testId>:finished` entry is replaced by the attempt history below. Code locations: the folders it names (`domain/`, `data/`, `features/`, `components/`) moved with [ADR-0010](0010-feature-sliced-design-in-apps-web.md), which maps them.
- **Amended:** 2026-10-11 by the owner (clarifying the approved requirement that the first committed attempt is preserved): the history moves from write-once `localStorage` entries to IndexedDB transactions, because an existence check followed by a write in `localStorage` is not atomic across tabs; every session gets a unique id. §2 to §9 below are the amended text.
- **Date:** 2026-10-11
- **Deciders:** Project owner (acceptance), Claude (draft)

## Context

M4 keeps a Reading session on the device ([ADR-0006](0006-reading-session-state.md)): the current session under `reading:<testId>` and the most recent finished one under `reading:<testId>:finished`, both in the envelope `{ "schema": 1, "session": … }`. "Start again" starts a new session, and when that one finishes it **replaces** the earlier finished session. Nothing is checked or scored in M4, so no M4 session has a score.

M5 ([READING_EXPERIENCE.md, M5 specifications](../../product/READING_EXPERIENCE.md#m5-specifications-drafts)) adds results, evidence-first review, repeated-mistake detection and retries. The approved requirements:

- **The first committed completed attempt is preserved**: its answers, pins, highlights and timestamps. A later or stale tab must never replace it, including when two tabs finish the same session at the same moment.
- **Results tied to what produced them** (the content version, the answer-key revision, the checking rules; [ADR-0008](0008-reading-answer-checking-and-explanations.md) §3), with exactly one record per attempt and pair, and corrections visible, never silent.
- **A first try that is known or explicitly "unknown"**, decided consistently when tabs race.
- **Ids that never collide** between distinct sessions, of the same kind or not.
- **Compatibility with M4 data**, without losing a recoverable M4 entry when a write fails.

Forces: no accounts and no server-side guest record (ADR-0003); stored data is untrusted input; domain rules stay out of the UI (I-3, I-4; ADR-0004); home is rendered on the server and cannot read browser storage; no new runtime dependency without a reason (CODE_QUALITY.md).

**What the browser offers:**
- **`localStorage`** is synchronous, so a write made while answering survives closing the tab right away (why ADR-0006 keeps sessions there). But it has **no cross-tab atomicity**: no lock around a read followed by a write, and Chromium keeps a per-process copy that other processes update asynchronously, so a tab can read data another tab has already replaced. "Write only if absent" can therefore let two tabs both see "absent" and the later write win.
- **The Web Locks API** serializes tabs that request the same lock, but it does not make `localStorage` reads consistent across processes, so it does not close that gap.
- **IndexedDB** has transactions: read-write transactions whose scopes overlap never run at the same time, across all tabs and connections of the origin, and each one commits all its changes or none. "Read, decide, write" inside one transaction is atomic. Its writes are asynchronous, so a write started just before the tab closes may not complete; the design below keeps the `localStorage` copy until the transaction has completed.

The answer key is not loaded on the test screen ([ADR-0008](0008-reading-answer-checking-and-explanations.md) §2), so the test screen records an attempt and the results page checks it.

## Decision

### 1. Four version numbers, each guarding one thing

| Number | Where | Guards | Changes when |
|---|---|---|---|
| **Content version** | `ReadingTest.version` (ADR-0005); copied into every session and attempt as `testVersion` | Everything in the test file: what answers and marks point at (question numbers, items, option ids, passages, paragraph letters, sentence ids) and everything checking or feedback reads from it (word limits, passage words) | Any change to the test file once results may exist (ADR-0008 §3: a fingerprint test enforces it) |
| **Storage schema** | `schema` in each stored record; the IndexedDB database version | The shape of the stored data | The stored shape changes. M5 keeps the session envelope at 1 (with one optional field, §3) and starts the history records and the database at 1 |
| **Answer-key revision** | `revision` in the key file; recorded in each result | Everything in the key: accepted answers, evidence, tags, `fromPassage` | Any change to the key once results may exist (fingerprint test) |
| **Checking-rules version** | `SCORING_RULES_VERSION` in the checking module; recorded in each result | Normalization, marks, outcomes and signal rules | Any code change that could change a mark, an outcome or a signal for the same answers, key and content |

Nothing else is versioned. Explanations are shown next to a result but are not part of it.

### 2. Where things live

| Data | Store | Why |
|---|---|---|
| The current test session, in progress **or finished and not yet committed** | `localStorage` `reading:<testId>` (ADR-0006) | Synchronous: nothing is lost when the tab closes |
| The current retry session (§8), same rules | `localStorage` `reading:<testId>:retry` | Likewise |
| Committed attempts, result records, first-try markers | **IndexedDB** database `ielts-prep-reading`, version 1, object stores `attempts` (key `id`, index `testId`), `results` (key `[attemptId, keyRevision, rulesVersion]`) and `firstTry` (key `testId`) | Atomic transactions across tabs |
| M4's finished session | `localStorage` `reading:<testId>:finished` | Never written by M5; imported and then removed (§6) |

```
ReadingAttempt (store "attempts")
  schema           1
  id               the session's id (§3)
  testId, testVersion
  kind             "test" | "retry"
  retryOf?         the id of the test attempt whose questions are retried (retry only)
  questions?       the retried question numbers, whole answer units (retry only)
  mode             "practice" | "exam"        (a retry is always "practice")
  startedAt, finishedAt, finishReason ("user" | "timeUp")
  answers, pins    copied from the session, in the ADR-0006 shapes
  highlights?      copied from the session (sentence ids); absent means "not recorded"
  importedFromM4?  true for an attempt imported from M4's ":finished" entry
  committedAt      when this record was committed

Result (store "results")
  schema, attemptId, keyRevision, rulesVersion, checkedAt
  outcomes         per question number (scoring position): "correct" | "incorrect" | "unanswered"
  signals          per answer unit (its first number): the observable signal codes (ADR-0008 §1)
  score, total     marks and scoring positions (40 for a test attempt; the retried positions for a retry)

FirstTry (store "firstTry")
  schema, testId, firstTry: "<attempt id>" | "unknown"
```

- **Kept:** answers, pins and highlights, because review shows them, and the timestamps. **Not kept:** flags and the view (sheet state, scroll).
- Records are never modified after they are committed (§4).

### 3. Ids are unique per session
- **A new session gets a random id** when it starts (a version 4 UUID from `crypto.getRandomValues`, prefixed `s-`), stored in the session as the optional field `sessionId`. The attempt keeps that id. Two distinct sessions, of the same kind or not, in one tab or two, never share an id; the start time is not part of it.
- **M4 sessions have no `sessionId`.** They get deterministic ids, so every tab derives the same one and importing is idempotent:
  - a session found in `reading:<testId>` without an id: `m4-current-<startedAt>`, written into the session the first time M5 saves it;
  - the session in `reading:<testId>:finished`: `m4-finished-<startedAt>`.
  Each `localStorage` slot holds one session, and the two prefixes differ, so two M4 sessions cannot share an id even with equal start times.
- The session envelope stays at schema 1: `sessionId` is optional, and the M4 parser rule (build a fresh object, ignore unknown fields) is kept for everything else. The session parser validates its format.

### 4. Committing a finished session is one atomic transaction
1. When `apply` returns a finished session (the user finished, or the Exam time ran out, also when that is noticed on load), the finished session is written to its `localStorage` entry, as M4 writes every change. A tab never writes an **in-progress** copy over a stored **finished** copy of the same session.
2. One IndexedDB read-write transaction over `attempts`, `results` and `firstTry` (requested with strict durability where the browser supports it):
   - reads the attempt with this id; **if one exists, it is kept unchanged** and nothing else in this step happens;
   - otherwise adds the attempt (`add`, which also fails if the id exists);
   - for a test attempt, reads the test's first-try marker; if there is none, writes this attempt's id if no other attempt of the test exists, otherwise "unknown" (§5);
   - applies retention (§9).
3. **Only when the transaction has completed**, and the committed attempt with this id exists (this tab's or an earlier one), the `localStorage` entry is removed.
- **Two tabs finishing the same session**, at the same moment or one long after the other: their transactions run one after the other; the first commits, the second finds the attempt and keeps it. The first committed attempt's answers, pins, highlights and timestamps are never replaced. The second tab then shows the committed attempt.
- **A failed or interrupted transaction** (storage full, blocked, the tab closing) commits nothing, and the finished session stays in `localStorage` as the recoverable source; the next load commits it. A finished session in `localStorage` whose attempt is already committed is removed. An in-progress session whose id has a committed attempt (a stale tab) is removed on load and never committed.

### 5. First-try provenance, decided inside the same transactions
- The first-try marker is written only inside a read-write transaction that also covers `attempts`, so two tabs cannot both decide it.
- It is set when a **test** attempt is committed and no marker exists: this attempt's id if no other attempt of the test exists, otherwise "unknown".
- It moves only towards "unknown": an M4 import writes "unknown" even over an id (the imported attempt is older than anything M5 committed); a marker naming a missing or invalid attempt reads as "unknown". It never changes from one id to another.
- Retries never set it. "Start again" creates later attempts. A new content version does not change it.
- What the device cannot know: attempts in another browser, on another device, or before site data was cleared. The copy says "on this device".

### 6. Compatibility with M4
- **In-progress sessions** (`reading:<testId>`, envelope schema 1): resumed unchanged; they get the id `m4-current-<startedAt>` (§3) and are committed by §4 when finished.
- **The M4 `:finished` entry**, on the first load of any Reading page of that test:
  1. If it does not parse with the ADR-0006 rules or its `testVersion` is not the current one: left untouched, never read again.
  2. One read-write transaction over `attempts` and `firstTry`: if no attempt `m4-finished-<startedAt>` exists, add it with `importedFromM4: true`, its mode, times, answers, pins **and highlights** exactly as stored, and no result; in any case set the test's marker to "unknown".
  3. Only when that transaction has completed, the `:finished` entry is removed. A failed transaction leaves it in place, and the next load tries again; two tabs importing at once produce one attempt.
- Nothing is invented: no score, outcome, check date or first-try claim. The attempt is checked the first time its results are shown, and its results page says so.
- **Absent highlights:** M4 sessions always carry `highlights` (possibly empty), so an imported attempt has them. An attempt without the field is valid and means "not recorded": review shows no highlights and says nothing about them. An empty list means the learner highlighted nothing.
- **Content version:** M5 keeps the demo test's version because it does not change the test file; a fingerprint test fails if the file changes without a version increase (ADR-0008 §3).

### 7. Results are records per key revision and rules version
- **When the results or review page shows an attempt** whose `testVersion` is the current content version, and no record exists for the current pair (key revision, rules version), the attempt is checked from its unchanged answers and the record is added in a read-write transaction that first reads the key `[attemptId, keyRevision, rulesVersion]`: **exactly one record per attempt and pair**, whichever tab commits first; the others read and show it. The record is written **even if nothing differs** from the previous one, so later views know the pair has been checked.
- **All earlier records are kept.** The learner sees the record of the current pair.
- **Correction notice:** when the shown record differs from the most recent earlier record in anything the learner sees (the score, an outcome, or a note), the page says so ("Rechecked after a correction…"), quoting the earlier score only when the score changed. When only the pair changed, no notice is shown.
- A recheck never creates an attempt and never counts as new evidence (READING_EXPERIENCE.md, Error Intelligence).
- **Content no longer available** (the attempt's `testVersion` is not the current one): no check is possible; the most recent stored record is shown (score and counts) with "This test has changed since you took it, so a detailed review is not available"; with no record, "…so your answers can't be checked". An attempt of a test the app no longer ships is kept, shown nowhere, and not deleted by M5.

### 8. Retries in progress
- `reading:<testId>:retry` holds one retry session (the ADR-0006 envelope, schema 1, with its own `sessionId`; the session additionally carries `retry: { of, questions }`, whole answer units). The main entry never carries `retry`. A retry is committed by §4 as a `retry` attempt.
- Starting a retry is validated against its source attempt (READING_EXPERIENCE.md, Targeted practice): the source must be a committed test attempt of the current content version, and the questions must be whole units it got not fully correct.

### 9. Untrusted data, retention, reset and unavailable storage
- **Untrusted:** every record read from IndexedDB or `localStorage` is parsed by a domain parser. A record with our schema that fails validation is ignored (it is not a committed attempt or result) and may be replaced by a valid one with the same key inside a transaction; a record with an **unknown schema** is ignored for display and never overwritten or removed. A database whose version is newer than the app knows (it cannot be opened at version 1) is treated as unavailable: never upgraded down or deleted.
- **Retention:** at most **20 attempts per test**, applied inside the commit transaction: the oldest attempts are removed with their result records, **except the first-try attempt** and unknown-schema records. About 100 KB per test at most.
- **No reset control in M5.** Clearing the browser's site data clears everything (ADR-0006).
- **IndexedDB unavailable or failing** (blocked, full, an old private mode): committed history is kept in memory in the storage module for the tab's lifetime (client-side navigation to results and review keeps it; a reload loses it), the pages show the notice, and the `localStorage` sources (§4, §6) are never removed, so a later load can commit them.
- **Reading is asynchronous:** the results, review and retry pages, and the start screen's "See your last results", read the history after mounting and show a brief loading state, as the M4 test screen does before it reads the session.

### 10. Derived, not stored
- Repeated mistakes are derived from the first try's record for the current pair on every read (refreshed by §7 first; READING_EXPERIENCE.md).
- The review position lives in the page address.

### 11. Testing the guarantees
- **Unit tests** run the storage adapter against `fake-indexeddb` (a dev dependency for tests only; jsdom has no IndexedDB), with two database connections standing in for two tabs and their operations interleaved.
- **Browser tests** (Playwright, real Chromium) open two pages in one browser context, which share `localStorage` and IndexedDB like two tabs.
- Both cover: two tabs finishing the same session at the same moment and one after the other with different answers, pins and highlights (the first committed attempt and its timestamps survive); a stale tab's in-progress copy after the commit; two tabs viewing results at once (one record per pair); two tabs importing the same M4 entry (one attempt, marker "unknown"); two tabs committing first attempts of the same test (one marker); a test and a retry, and two sessions of one kind, started in the same millisecond (distinct ids); an interrupted transaction (the `localStorage` source survives and is committed on the next load).

### 12. Not decided here
- Home showing a Reading activity (ADR-0006 §4): not in M5 (owner, M5-01).
- Server storage and moving the history to an account (M7); progress over time and evidence across tests (M8).

## Alternatives considered

| Option | Pros | Cons |
|---|---|---|
| **A. Sessions in `localStorage` (ADR-0006); committed history in IndexedDB transactions; random session ids (chosen)** | Atomic across tabs: the first committed attempt, the first-try marker and one record per pair are guaranteed; synchronous writes while answering are kept; no runtime dependency | History reads are asynchronous (a brief loading state); hand-written promise helpers around the IndexedDB API; a test-only dev dependency |
| B. Write-once `localStorage` entries (the earlier draft) | Synchronous, simple | "Write only if absent" is not atomic across tabs: two tabs can both write, the later one wins |
| C. `localStorage` plus the Web Locks API | Serializes tabs holding the lock | Does not make `localStorage` reads consistent across processes; still not atomic |
| D. Everything in IndexedDB, including in-progress sessions | One store | Asynchronous writes while answering may not complete when the tab closes (ADR-0006's reason to use `localStorage`) |
| E. Ids from start time plus kind | Deterministic | Two distinct sessions of one kind started in the same millisecond would share an id |
| F. An IndexedDB wrapper library | Less code | A runtime dependency for a few transactions |
| G. Server storage | Survives devices | Needs accounts (M7) and the open hosting and data-residency decision |

## Why this decision

- **Correctness:** every guarantee that depends on "only if absent" is decided inside an IndexedDB transaction, which the browser runs alone among overlapping read-write transactions across all tabs; sources are removed only after their transaction has completed; ids are random per session.
- **Simplicity:** the platform's own stores, no runtime dependency; `localStorage` stays where synchronous writes matter.
- **Consistency:** device-only guest state (ADR-0003, ADR-0006); rules in `domain/`, storage in `data/` (ADR-0004).

## Consequences

- **Positive:** the first committed attempt, the first-try marker and the one-record-per-pair rule hold across tabs; M4 data carries over with its highlights and without invented scores; corrections are visible.
- **Costs accepted:** the history is read asynchronously; two storage mechanisms to maintain; a cleared browser or another device starts with no history; Safari may clear a site's storage after 7 days without a visit (ADR-0006); a browser without IndexedDB keeps history only in memory for the tab.
- **Harder to change later:** the record shapes and the database layout (mitigated by `schema`, the database version and the parsers).

## Follow-up / migration notes

- **Implementation:** M5-04 (session ids, the database, parsers, the commit transaction, import, provenance, retention, the in-memory fallback, the unit and browser tests of §11); result records per pair (M5-06); retries (M5-09); first-try use (M5-10).
- **Docs on acceptance:** the ADR index; ADR-0006's status line; ARCHITECTURE.md (guest practice state); BOUNDARIES.md if the storage module gains a rule.
