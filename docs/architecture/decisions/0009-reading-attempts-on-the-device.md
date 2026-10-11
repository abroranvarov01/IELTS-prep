# ADR-0009: Reading Attempts and Results on the Device

- **Status:** Accepted (2026-10-11, owner, task M5-01, with the owner's amendments applied; drafted in M5 planning). Approval source: the owner instruction of 2026-10-11 on the review packet at commit 069877e. It amends [ADR-0006](0006-reading-session-state.md) §2: the `reading:<testId>:finished` entry is replaced by the attempt history below.
- **Date:** 2026-10-11
- **Deciders:** Project owner (acceptance), Claude (draft)

## Context

M4 keeps a Reading session on the device ([ADR-0006](0006-reading-session-state.md)): the current session under `reading:<testId>` and the most recent finished one under `reading:<testId>:finished`, both in the envelope `{ "schema": 1, "session": … }`. "Start again" starts a new session, and when that one finishes it **replaces** the earlier finished session. Nothing is checked or scored in M4, so no M4 session has a score.

M5 ([READING_EXPERIENCE.md, M5 specifications](../../product/READING_EXPERIENCE.md#m5-specifications-drafts)) adds results, evidence-first review, repeated-mistake detection and retries. That needs:

- **Results tied to what produced them**: the content version, the answer-key revision and the checking rules ([ADR-0008](0008-reading-answer-checking-and-explanations.md) §3), with corrections visible, never silent.
- **More than one finished attempt per test**, with answers, pins and highlights kept as finished, and new attempts and retries never overwriting an earlier one.
- **A known first try**, or an explicit "unknown".
- **Safety across tabs**: two tabs can finish, check, import and retry at the same time; a stale tab must not overwrite what another tab committed.
- **Compatibility with M4 data**, without losing a recoverable M4 entry when a write fails.

Forces (unchanged from ADR-0006): no accounts and no server-side guest record (ADR-0003); stored data is untrusted input; domain rules stay out of the UI (I-3, I-4; ADR-0004); home is rendered on the server and cannot read `localStorage`. One attempt is a few kilobytes.

**`localStorage` is not a transactional store across tabs.** Within one tab, a synchronous read followed by a write cannot be interrupted. Across tabs, browsers give no lock around a read-modify-write, and Chromium keeps a per-process copy that other processes update asynchronously, so a tab can read data that another tab has already replaced. A design that rewrites a shared list can therefore drop another tab's entry.

The answer key is not loaded on the test screen ([ADR-0008](0008-reading-answer-checking-and-explanations.md) §2), so the test screen records an attempt and the results page checks it.

## Decision

### 1. Four version numbers, each guarding one thing

| Number | Where | Guards | Changes when |
|---|---|---|---|
| **Content version** | `ReadingTest.version` (ADR-0005); copied into every session and attempt as `testVersion` | Everything in the test file: what answers and marks point at (question numbers, items, option ids, passages, paragraph letters, sentence ids) and everything checking or feedback reads from it (word limits, passage words) | Any change to the test file once results may exist (ADR-0008 §3: a fingerprint test enforces it) |
| **Storage schema** | `schema` in each stored envelope | The shape of the stored JSON | The stored shape changes. M5 keeps the session envelope at 1 and starts the attempt, result and first-try envelopes at 1 |
| **Answer-key revision** | `revision` in the key file; recorded in each result | Everything in the key: accepted answers, evidence, tags, `fromPassage` | Any change to the key once results may exist (fingerprint test) |
| **Checking-rules version** | `SCORING_RULES_VERSION` in the checking module; recorded in each result | Normalization, marks, outcomes and signal rules | Any code change that could change a mark, an outcome or a signal for the same answers, key and content |

Nothing else is versioned. Explanations are shown next to a result but are not part of it.

### 2. One write-once entry per record

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

### 3. Write-once
- An entry is written only if no **valid** entry exists at its key. A valid existing entry always wins, so the first committed attempt keeps its answers, pins and highlights even if a stale tab later finishes the same session with different ones.
- An entry with our schema that fails validation is not a committed record: it may be replaced. An entry with an **unknown schema** (written by a newer app) is never overwritten or removed.

### 4. Finishing records the attempt without risking the source
1. When `apply` returns a finished session (the user finished, or the Exam time ran out, also when that is noticed on load), the finished session is written to its current entry (`reading:<testId>` or `:retry`), as M4 writes every change.
2. The attempt is written (§3).
3. For a test attempt with no first-try entry, the first try is decided (§6).
4. **Only if step 2 succeeded or an equal or earlier committed attempt with that id already exists**, the current entry is removed.
- If step 2 fails (storage full or blocked), the finished session stays in its current entry as the recoverable source, the attempt is kept in memory for this tab (§10), and the next load repeats steps 2 to 4. A current entry holding a finished session whose attempt exists is simply removed.
- A stale tab that keeps writing its in-progress copy of a session already recorded is refused: a current session whose attempt id exists is never written again.

### 5. Results are records per key revision and rules version
- **When the results or review page shows an attempt** whose `testVersion` is the current content version, and no result exists for the current pair (key revision, rules version), the attempt is checked from its unchanged answers and a result is written for that pair **even if nothing differs** from the previous record, so later views know this pair has been checked. Concurrent views write the same key; the first valid record wins.
- **All earlier records are kept.** The learner sees the record of the current pair.
- **Correction notice:** when the shown record differs from the most recent earlier record in anything the learner sees (the score, an outcome, or a signal shown as a note), the page shows "Rechecked after a correction to the answer key or to how answers are checked. Your earlier result was 27 of 40." When only the pair changed, no notice is shown and nothing suggests the score changed. If the score is the same but an outcome or note changed, the notice says so without quoting a different score (the copy has two forms).
- A recheck never creates an attempt and never counts as new evidence (READING_EXPERIENCE.md, Error Intelligence).
- **Content no longer available** (the attempt's `testVersion` is not the current one): no check is possible. The most recent stored record is shown (score and counts) with "This test has changed since you took it, so a detailed review is not available"; with no record, "…so your answers can't be checked". An attempt of a test the app no longer ships is kept, shown nowhere, and not deleted by M5.

### 6. First-try provenance
- `firstTry` is decided when a **test** attempt is recorded and no first-try entry exists: if no other attempt entry exists for that test (valid, invalid or unknown), it is this attempt's id; otherwise "unknown".
- It moves only towards "unknown": an M4 import writes "unknown" even over an id (the imported attempt is older than anything M5 recorded); an entry that names a missing or invalid attempt reads as "unknown". It never changes from one id to another.
- Retries never decide it. "Start again" creates later attempts. A new content version does not change it.
- What the device cannot know: attempts in another browser, on another device, or before site data was cleared. The copy says "on this device".

### 7. Compatibility with M4
- **In-progress sessions** (`reading:<testId>`, envelope schema 1): unchanged and resumed as in M4; when finished, recorded by §4.
- **The M4 `:finished` entry**, on the first load of any Reading page of that test:
  1. If it does not parse with the ADR-0006 rules or its `testVersion` is not the current one: left untouched, never read again.
  2. Otherwise the attempt `test-<startedAt>` is written (§3) with `importedFromM4: true`, its mode, times, answers, pins **and highlights** exactly as stored, and no result.
  3. The first-try entry is set to "unknown".
  4. Only if steps 2 and 3 succeeded (or a valid attempt with that id already existed), the `:finished` entry is removed. A failed write leaves it in place to be imported later.
- Nothing is invented: no score, outcome, check date or first-try claim. The attempt is checked the first time its results are shown, and its results page says so.
- **Absent highlights:** M4 sessions always carry `highlights` (possibly empty), so an imported attempt has them. An attempt entry without the field is valid and means "not recorded": review then shows no highlights and says nothing about them. An empty list means the learner highlighted nothing.
- **Content version:** M5 keeps the demo test's version because it does not change the test file; a fingerprint test fails if the file changes without a version increase (ADR-0008 §3).

### 8. Stored data is untrusted
- Every entry is parsed by a domain parser as untrusted input. An entry that is not valid JSON, has our schema but fails validation, or belongs to another test is ignored; the next write of that test's history removes it, except at keys that a write would replace anyway.
- An entry with an unknown schema is ignored for display but never overwritten or removed. An unknown-schema first-try entry reads as "unknown".
- Results are only used with the attempt they name and only if their pair, outcomes and signals are consistent with the attempt's question numbers.

### 9. Retries in progress
- `reading:<testId>:retry` holds one retry session (the ADR-0006 envelope, schema 1; the session additionally carries `retry: { of, questions }`, whole answer units). The main entry never carries `retry`. A retry is recorded by §4 as a `retry` attempt.
- Starting a retry is validated against its source attempt (READING_EXPERIENCE.md, Targeted practice): the source must be a stored test attempt of the current content version, and the questions must be whole units it got not fully correct.

### 10. Retention, reset and unavailable storage
- At most **20 attempts per test**. When recording a new attempt exceeds that, the oldest attempts are removed with their result records, **except the first-try attempt**, and except entries with an unknown schema. About 100 KB per test at most.
- **No reset control in M5.** Clearing the browser's site data clears everything (ADR-0006).
- **Storage blocked or full:** attempts and results are kept in memory in the storage module for the tab's lifetime (client-side navigation to results and review keeps them; a reload loses them) and the pages show the notice. Recoverable sources (§4, §7) are never removed after a failed write.

### 11. Derived, not stored
- Repeated mistakes are derived from the first try's record for the current pair on every read (refreshed by §5 first; READING_EXPERIENCE.md).
- The review position lives in the page address.

### 12. Not decided here
- Home showing a Reading activity (ADR-0006 §4): not in M5 (owner, M5-01).
- Server storage and moving the history to an account (M7); progress over time and evidence across tests (M8).

## Alternatives considered

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

## Why this decision

- **Correctness:** every record is written once and never rewritten; sources are removed only after their record exists; results name the key and rules that produced them; first-try provenance is never invented.
- **Simplicity:** synchronous browser storage, envelopes and parsers as in ADR-0006; no dependency.
- **Consistency:** device-only guest state (ADR-0003, ADR-0006); rules in `domain/`, storage in `data/` (ADR-0004).

## Consequences

- **Positive:** results, review, repeated mistakes and retries read one history; corrections are visible; M4 data carries over with its highlights and without invented scores.
- **Costs accepted:** a cleared browser or another device starts with no history; Safari may clear a site's storage after 7 days without a visit (ADR-0006); attempt ids trust the device clock. **Residual race:** two tabs that finish the same session within the moment it takes one tab's write to reach the other may both see "no attempt yet", and the later write wins; the answers then come from one of the two tabs' copies of the same session. Different records can never overwrite each other.
- **Harder to change later:** the entry shapes, once stored (mitigated by `schema` and the parsers).

## Follow-up / migration notes

- **Implementation:** M5-04 (entries, parsers, recording, import, provenance, retention, in-memory fallback, interleaved-tab tests); checking on view and rechecking (M5-06); retries (M5-09); first-try use (M5-10).
- **Docs on acceptance:** the ADR index; ADR-0006's status line ("§2 amended by ADR-0009"); ARCHITECTURE.md (guest practice state); BOUNDARIES.md if the storage module gains a rule.
