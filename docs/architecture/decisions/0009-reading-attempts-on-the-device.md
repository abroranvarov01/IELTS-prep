# ADR-0009: Reading Attempts and Results on the Device

- **Status:** Proposed (2026-10-11, M5 planning; revised the same day for the owner review packet; for the owner's decision at task M5-01). If accepted, it amends [ADR-0006](0006-reading-session-state.md) §2: the `reading:<testId>:finished` entry is replaced by the attempt history below.
- **Date:** 2026-10-11
- **Deciders:** Project owner (acceptance), Claude (draft)

## Context

M4 keeps a Reading session on the device ([ADR-0006](0006-reading-session-state.md)): the current session under `reading:<testId>` and the most recent finished one under `reading:<testId>:finished`, both in the envelope `{ "schema": 1, "session": … }`. "Start again" starts a new session, and when that one finishes it **replaces** the earlier finished session. Nothing is checked or scored in M4, so no M4 session has a score.

M5 (drafts in [READING_EXPERIENCE.md, M5 specifications](../../product/READING_EXPERIENCE.md#m5-specifications-drafts)) adds results, evidence-first review, repeated-mistake detection and retries. That needs:

- **Results tied to what produced them**: the content version, the answer-key revision and the checking rules ([ADR-0008](0008-reading-answer-checking-and-explanations.md) §3).
- **More than one finished attempt per test**, with new attempts and retries never overwriting an earlier one.
- **A known first try**: repeated-mistake detection uses only the first try at a test, so the history must say whether its first try is known.
- **No duplicates** after a reload, a second tab, or an Exam time-out noticed on load.
- **Compatibility with M4 data** on devices that used M4: in-progress sessions and the `:finished` entry.

Forces (unchanged from ADR-0006): no accounts and no server-side guest record (ADR-0003); stored data is untrusted input; domain rules stay out of the UI (I-3, I-4; ADR-0004); home is rendered on the server and cannot read `localStorage`. One attempt is a few kilobytes.

The answer key is not loaded on the test screen ([ADR-0008](0008-reading-answer-checking-and-explanations.md) §2), so the test screen records an attempt and the results page checks it.

## Decision

### 1. Four version numbers, each guarding one thing

| Number | Where | Guards | Changes when |
|---|---|---|---|
| **Content version** | `ReadingTest.version` (ADR-0005); copied into every session and attempt as `testVersion` | Everything a stored answer or mark points at: question numbers, the "choose several" items, option ids, passages and their ids, paragraph letters, sentence ids | Any of those changes (ADR-0005 §1, unchanged) |
| **Storage schema** | `schema` in each stored envelope | The shape of the stored JSON | The stored shape changes. M5 keeps the session envelope at 1 and starts the attempts envelope at 1 |
| **Answer-key revision** | `revision` in the key file ([ADR-0008](0008-reading-answer-checking-and-explanations.md) §3); recorded in each result | Accepted answers, evidence, tags | Any change to them after a key has been used for results |
| **Checking-rules version** | One constant in the checking module (ADR-0008 §1); recorded in each result | Normalization, marks and signal rules | Any code change that could change an outcome, a mark or a signal for the same answers and key |

Nothing else is versioned. Explanations are text shown next to a result; they are not part of it.

### 2. A finished session becomes an attempt in a per-test history
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

### 3. Finishing records the attempt once
- When `apply` returns a finished session (the user finished, or the Exam time ran out, also when that is noticed on load), the storage adapter (a) appends the attempt with `results: []` **unless an attempt with that id exists**, then (b) removes `reading:<testId>`.
- On load, a current session whose `startedAt` equals an existing attempt id is removed: finishing was interrupted between (a) and (b).
- A reload, a second tab (both tabs share the one current session) and a time-out noticed on load therefore lead to one attempt. Answers, pins and times are never changed after (a).

### 4. Results are computed when first shown and are append-only
- **First view:** if the attempt's `testVersion` is the current content version, the attempt is checked with the current key and rules and the result is appended.
- **Later views:** if the latest result's `keyRevision` and `rulesVersion` are the current ones, it is shown as stored. If either is older and the content version still matches, the attempt is checked again from its unchanged answers. If any outcome, signal or the score differs, the new result is appended and shown, with the note "Rechecked after a correction to the answer key or to how answers are checked. Your earlier result was 27 of 40." If nothing differs, nothing is written.
- **Nothing is overwritten:** earlier results stay in the list, so the learner's first result is never lost and a correction is always visible. Retries and new attempts never touch another attempt.
- **Content no longer available** (the attempt's `testVersion` is not the current one): no new check is possible. The latest stored result is shown (score and counts) with "This test has changed since you took it, so a detailed review is not available"; with no stored result, "…so your answers can't be checked". An attempt of a test the app no longer ships is kept in storage, shown nowhere, and not deleted by M5.

### 5. Compatibility with M4
- **In-progress sessions** (`reading:<testId>`, envelope schema 1): unchanged and resumed as in M4. When one finishes under M5 it is recorded by §3 like any session.
- **The M4 `:finished` entry:** on the first load of any Reading page of that test, if it parses with the ADR-0006 rules and its `testVersion` is the current content version, it is imported as one attempt: `kind: "test"`, `importedFromM4: true`, id = its `startedAt`, its answers, pins and times as stored, and **`results: []`**. No score, outcome or date is invented: it is checked the first time its results are shown, with the then-current key and rules, like any attempt, and the results page says so ("You finished this test before the app checked answers. It was checked when you first opened these results."). The import also sets `firstTry` to `"unknown"` (§6). The entry is then removed. If the id already exists, nothing is imported and the entry is removed.
- **An M4 `:finished` entry that does not parse or has another content version** is not imported and is left untouched (a few kilobytes, never read again).
- **Content version:** M5's content additions keep the demo test's version **only because they change nothing it guards** (§1): see [READING_EXPERIENCE.md, Content versions and M4 data (M5)](../../product/READING_EXPERIENCE.md#content-versions-and-m4-data-m5). If M5-02 had to change any guarded part, the version would increase and M4 sessions of that test would read as absent (ADR-0006).
- **Retries in progress** live in their own entry, `reading:<testId>:retry` (the ADR-0006 envelope, schema 1; the session additionally carries `retry: { of, questions }`), so a retry never touches the test's current session. The main entry never carries `retry`.

### 6. First-try provenance is stored, not guessed
- `firstTry` is written **once**, in the same write as the attempt that decides it:
  - the first `test` attempt recorded into a history that did not exist → its id;
  - an M4 import → `"unknown"`: M4 kept only the latest finished session, so earlier finished sessions may have been overwritten;
  - a history that existed but could not be read and is written again (§7) → `"unknown"`.
- `firstTry` is per test, across content versions. Retries never set it. "Start again" creates later attempts.
- If `firstTry` names an attempt that is missing or invalid, it reads as `"unknown"`.
- What the device cannot know: attempts in another browser, on another device, or before site data was cleared. The first try is therefore "the first try on this device", and the copy says so.

### 7. Stored data is untrusted
- **Entry by entry:** a domain parser next to the session parser validates each attempt. An invalid attempt is ignored and removed on the next write of that test's history; an invalid result entry is ignored and removed likewise (the attempt is checked again if possible). Duplicate ids keep the first. One bad entry never loses the others.
- **An envelope that is not valid JSON or not an object** reads as an empty history. It holds nothing recoverable, so the next write replaces it, with `firstTry: "unknown"`.
- **A well-formed envelope with an unknown `schema`** (written by a newer version of the app) is **never overwritten**: that test's attempts are then kept in memory with the storage notice, as in §9.

### 8. Retention and reset
- At most **20 attempts per test**. When a new attempt would exceed that, the oldest attempt is removed, **except the attempt named by `firstTry`**. That bounds a test's history at roughly 100 KB.
- **No reset control in M5.** Clearing the browser's site data clears the history, as it clears sessions today (ADR-0006). Nothing is kept on a server.

### 9. Storage unavailable or full
- Attempts are then kept in memory in the storage module for the tab's lifetime: finishing and opening results or review are client-side navigations, so they work in that tab; a reload loses them. Results and review show the notice. A failed write never crashes.

### 10. Derived, not stored
- **Repeated mistakes** are computed from the first try's latest result on every read (domain code).
- **The review position** (attempt, question, sequence) lives in the page address.

### 11. Not decided here
- Home showing a Reading activity (a cookie pointer, ADR-0006 §4) stays out unless the owner approves it at M5-01.
- Server storage and moving the history to an account (M7); progress over time and evidence across tests (M8).

## Alternatives considered

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

## Why this decision

- **Correctness:** attempts are recorded idempotently; every result names the key and rules that produced it; corrections are visible instead of silent; first-try provenance is never invented.
- **Simplicity:** the same browser storage, envelope and parser style as ADR-0006; two integers and one field for provenance; no new dependency.
- **Consistency:** device-only guest state (ADR-0003, ADR-0006); rules in `domain/`, storage in `data/` (ADR-0004).

## Consequences

- **Positive:** results, review, repeated mistakes and retries read one history; M4 data carries over without invented scores.
- **Costs accepted:** a cleared browser or another device starts with no history; Safari may clear a site's storage after 7 days without a visit (ADR-0006); attempt ids trust the device clock; a device that used M4 gets no repeated-mistake detection for that test, because its first try is unknown.
- **Harder to change later:** the attempt shape, once stored (mitigated by `schema` and the entry-by-entry parser).

## Follow-up / migration notes

- **Implementation:** M5-04 (attempt model, parser, recording, import, provenance, retention, in-memory fallback, tests with M4-format data); checking on first view and rechecking (M5-06); retries (M5-09); first-try use (M5-10).
- **Docs on acceptance:** the ADR index; ADR-0006's status line ("§2 amended by ADR-0009"); ARCHITECTURE.md (guest practice state); BOUNDARIES.md if the storage module gains a rule.
