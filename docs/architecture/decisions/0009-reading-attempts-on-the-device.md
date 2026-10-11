# ADR-0009: Reading Attempts and Results on the Device

- **Status:** Proposed (2026-10-11, M5 planning; for the owner's decision at task M5-01). If accepted, it amends [ADR-0006](0006-reading-session-state.md) §2: the `reading:<testId>:finished` entry is replaced by the attempt history below.
- **Date:** 2026-10-11
- **Deciders:** Project owner (acceptance), Claude (draft)

## Context

M4 keeps a Reading session on the device ([ADR-0006](0006-reading-session-state.md)): the current session under `reading:<testId>` and the most recent finished one under `reading:<testId>:finished`. "Start again" starts a new session, and when that one finishes it **replaces** the earlier finished session. Nothing is checked or scored in M4.

M5 (drafts in [READING_EXPERIENCE.md, M5 specifications](../../product/READING_EXPERIENCE.md#m5-specifications-drafts)) adds results, evidence-first review, recurring error patterns and retries of known mistakes. That needs:

- **Results that never change once shown**, and retries or new attempts that never overwrite an earlier result.
- **More than one finished attempt per test**: patterns count only the first try at a test, and a retry is an attempt of its own.
- **No duplicates**: a reload, a second tab, or an Exam time-out noticed on load must not record the same attempt twice.
- **Compatibility with M4 data**: in-progress sessions and the M4 `:finished` entry on devices that used M4.

Forces (unchanged from ADR-0006): no accounts and no server-side guest record (ADR-0003); stored data is untrusted input; domain rules stay out of the UI (I-3, I-4; ADR-0004); home is rendered on the server and cannot read `localStorage`. One attempt is a few kilobytes (40 answers, at most 120 pinned sentence ids, a result of 40 short codes).

The answer key is not loaded on the test screen ([ADR-0008](0008-reading-answer-checking-and-explanations.md) §2), so the test screen can record an attempt but cannot check it.

## Decision

### 1. A finished session becomes an attempt in a per-test history
- Key `reading:<testId>:attempts`, value `{ "schema": 1, "attempts": [ … ] }`, ordered by `startedAt`.

```
ReadingAttempt
  id               String(startedAt): the session's start time, which a session never changes
  testId, testVersion
  kind             "test" | "retry"
  retryOf?         the id of the attempt whose questions are retried (retry only)
  questions?       the retried question numbers (retry only)
  mode             "practice" | "exam"        (a retry is always "practice")
  startedAt, finishedAt, finishReason ("user" | "timeUp")
  answers, pins    copied from the session, in the ADR-0006 shapes
  result?          written once (§3)
  importedFromM4?  true for an attempt imported from M4's ":finished" entry (§5)
```

- Flags, highlights and the view are not kept: results and review do not use them.

### 2. Finishing records the attempt once
- When `apply` returns a finished session (the user finished, or the Exam time ran out, also when that is noticed on load), the storage adapter (a) appends the attempt **unless an attempt with that id already exists**, then (b) removes `reading:<testId>`.
- On load, a current session whose `startedAt` equals an existing attempt id is removed: finishing was interrupted between (a) and (b).
- So a reload, a second tab (both tabs share the one current session), or a time-out noticed on load all lead to one attempt.

### 3. The result is computed once and then kept
- The result (each question's outcome and observable signals, the raw score and its denominator; [ADR-0008](0008-reading-answer-checking-and-explanations.md) §1) is computed **the first time the attempt's results are shown**, with the answer key of the attempt's `testVersion`, and stored in `result`. It is never recomputed or changed afterwards, even when the checking code or the key changes later.
- Finishing opens the results page at once, so the result is normally written seconds after the attempt.
- An attempt without a result whose `testVersion` is no longer the current content version cannot be checked; its results page says so. This can only happen when content changes before results were opened.

### 4. Attempts are immutable
- An attempt is never changed after it is written, except for adding `result` once.
- "Start again" creates a new session and later a new attempt. A retry creates a `retry` attempt. Nothing overwrites another attempt.

### 5. Compatibility with M4
- **In-progress sessions** (`reading:<testId>`, envelope schema 1): unchanged, resumed as in M4.
- **The M4 `:finished` entry:** on the first load of any Reading page of that test, if it parses with the ADR-0006 rules (same test and content version), it is imported as an attempt (`kind: "test"`, `importedFromM4: true`, id = its `startedAt`) unless that id exists, and the entry is then removed. M5 never writes `:finished`. Its results are computed when they are first shown, like any attempt.
- **Content version:** the demo test keeps `version: 1` through M5, so M4 data stays valid. M5's content additions do not change numbering, options or sentence ids ([ADR-0005](0005-reading-content-contract.md) §1).
- **Retries in progress** live in their own entry, `reading:<testId>:retry` (the ADR-0006 envelope; the session additionally carries `retry: { of, questions }`), so a retry never touches the test's current session. The main entry never carries `retry`.

### 6. Stored data is untrusted
- The history is validated **entry by entry** by a domain parser next to the session parser: an invalid entry is dropped and the others are kept, so one corrupted entry never loses the whole history. Duplicate ids keep the first.
- An unknown envelope schema reads as an empty history.
- Attempts of another content version are kept and show their stored result; review needs the attempt's version to be the current one.

### 7. Retention and reset
- At most **20 attempts per test**. When a new attempt would exceed that, the oldest attempt is removed, **except the first `test` attempt of each content version**, which Error Intelligence uses as first-try evidence. That bounds a test's history at roughly 100 KB.
- **No reset control in M5.** Clearing the browser's site data clears the history, as it clears sessions today (ADR-0006). Nothing is kept on a server.

### 8. Storage unavailable or full
- Attempts are then kept in memory in the storage module for the tab's lifetime: finishing and opening results or review are client-side navigations, so they still work in that tab; a reload loses them. Results and review show the notice from the M5 copy. A failed write never crashes.

### 9. Derived, not stored
- **Recurring patterns** are computed from the stored results on every read (domain code), not stored.
- **The review position** (attempt, question, sequence) lives in the page address, not in storage.

### 10. Not decided here
- Home showing a Reading activity (a cookie pointer, ADR-0006 §4) stays out unless the owner approves it at M5-01.
- Server storage and moving the history to an account (M7); progress over time (M8).

## Alternatives considered

| Option | Pros | Cons |
|---|---|---|
| **A. One validated attempts list per test in `localStorage`, appended once, result stored once (chosen)** | Same storage and validation approach as ADR-0006; ordered history in one read; results stay as first shown | Read-modify-write of a list of a few tens of kilobytes; the result is written in a second step |
| B. Keep M4's single `:finished` entry and add a `:first` entry | Smallest change | Retries and later attempts still overwrite each other; no history for retries |
| C. One `localStorage` entry per attempt (`reading:<testId>:attempt:<id>`) | Write-once per key; no list rewrite | Listing and retention need a scan of all keys; the snapshot for `useSyncExternalStore` must join many entries |
| D. IndexedDB | Large, structured | Rejected in ADR-0006 for a few kilobytes: asynchronous writes may not finish when the tab closes |
| E. Derive results on every view, store only answers | No stored result | Results could change silently after a code or key change; attempts of an earlier content version could no longer be shown |
| F. Server storage | Survives devices | Needs accounts (M7) and the open hosting and data-residency decision |

## Why this decision

- **Correctness:** the attempt id comes from the session itself, so recording is idempotent; a result is shown and then frozen; one bad entry cannot erase the history.
- **Simplicity:** the same browser storage, envelope and parser style as ADR-0006; no new dependency.
- **Consistency:** device-only guest state (ADR-0003, ADR-0006); rules in `domain/`, storage in `data/` (ADR-0004).

## Consequences

- **Positive:** results, review, patterns and retries all read one history; M4 data carries over.
- **Costs accepted:** a cleared browser or another device starts with no history; Safari may clear storage of a site not visited for 7 days (ADR-0006); attempt ids trust the device clock; the first-try evidence of a device that used M4 may be a later try, because M4 kept only the latest finished session.
- **Harder to change later:** the attempt shape, once stored (mitigated by `schema` and the entry-by-entry parser).

## Follow-up / migration notes

- **Implementation:** M5-04 (attempt model, parser, recording, import, retention, in-memory fallback, tests with M4-format data); the result snapshot with the results page (M5-06); retries (M5-09).
- **Docs on acceptance:** the ADR index; ADR-0006's status line ("§2 amended by ADR-0009"); ARCHITECTURE.md (guest practice state); BOUNDARIES.md if the storage module gains a rule.
