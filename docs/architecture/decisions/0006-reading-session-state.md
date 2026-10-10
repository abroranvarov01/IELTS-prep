# ADR-0006: Reading Session State and Persistence

- **Status:** Proposed (2026-10-10, task M4-07). Waiting for the owner's acceptance at the M4-09 gate.
- **Date:** 2026-10-10
- **Deciders:** Project owner (acceptance), Claude (draft)

## Context

A Reading session (M4 drafts in [READING_EXPERIENCE.md](../../product/READING_EXPERIENCE.md#m4-specifications-drafts) and [USER_FLOWS.md, Reading flows (M4)](../../product/USER_FLOWS.md#reading-flows-m4)) changes constantly: answers, the current question, flags, highlights, pins, the sheet state, the passage positions, and in Exam Mode a 60-minute clock. The flows require that nothing is lost when the phone locks, the tab closes, or the user taps "Exit", and that the Exam clock keeps running while the user is away.

Forces:
- **No accounts and no server-side guest record:** ADR-0003 rejected an anonymous server record (close to auth, open data residency) and keeps cookies for small preferences only; "where practice state lives" was left to this decision.
- **Size:** one session is small (40 answers of a few words, at most a few hundred sentence ids for highlights and pins): a few kilobytes.
- **Untrusted input:** stored data can be old, edited or corrupted, like the goal cookie (ADR-0003).
- **Content versions:** stored answers and anchors are only valid for the content `version` they were made with (ADR-0005, proposed).
- **Rules out of the UI (INVARIANTS I-3, I-4; ADR-0004):** session transitions and timer arithmetic are domain logic, testable without rendering.
- The reading screen is interactive by nature; the passage itself is static text.

## Decision

### 1. The session is a pure domain model with explicit transitions
In `apps/web/src/domain/reading/` (ADR-0004):

```
ReadingSession
  testId, testVersion, mode ("practice" | "exam")
  status ("inProgress" | "finished"), finishReason? ("user" | "timeUp")
  startedAt, finishedAt?           (epoch milliseconds)
  currentQuestion                  (1–40)
  answers                          (per question or "choose several" item, in the ADR-0005 answer shapes)
  flagged                          (question numbers)
  highlights                       (sentence ids)
  pins                             (per question number, at most 3 sentence ids; Practice only)
  view                             (sheet state, last passage, scroll position per passage)
```

- **Transitions** are one function, `apply(session, event, now)`, for events such as `answer`, `clearAnswer`, `goTo`, `toggleFlag`, `toggleHighlight`, `pin`, `unpin`, `finish`, `setView`. It enforces the rules: no changes after `finished`; no pins in Exam Mode; at most three pins; "choose several" never above its limit; question numbers within the test.
- **Time is never a running counter.** `remaining(session, test, now) = startedAt + duration - now`. When an Exam session is applied or loaded at or after its end, it becomes `finished` with `timeUp`. This is correct across reloads, closed tabs and a locked phone. The clock is the device's: changing it changes the timer (this is practice, not a proctored test).
- Every transition, the time arithmetic and the limits have unit tests without rendering.

### 2. It is kept in `localStorage`, one entry per test
- Key `reading:<testId>` for the current session, `reading:<testId>:finished` for the most recent finished one (kept for review in M5; "Start again" replaces it). That bounds the storage per test.
- Value: an envelope `{ "schema": 1, "session": { … } }` as JSON.
- **Written after every transition** (a few kilobytes; synchronous and immediate, so closing the tab right after answering loses nothing).
- **Read as untrusted input** by a validator next to the model: an unknown `schema`, a malformed value, unknown question numbers or sentence ids, or more pins than allowed make it read as "no session". Never a crash.
- **Stale content:** if `testVersion` differs from the test's current `version`, the stored session is not used (its numbers and anchors may no longer match); the start screen opens. (Rare while content is hand-made; M9 handles content updates for real.)
- **Storage unavailable** (blocked, full, or throwing): the session runs in memory and the screen shows the notice from the M4-02 draft ("Your answers can't be saved on this device. Don't close this page.").
- Private windows keep `localStorage` for the window's lifetime, which matches what users expect there.

### 3. In React: the domain reducer, context, and one storage effect
- The reading screen's client part holds the session in `useReducer` with the domain `apply` function, and shares it through one React context, because the passage, the sheet and the navigator all read and change it. **No state-management library.**
- Loading happens on the client after mount (`localStorage` does not exist on the server): the passage is rendered on the server as static text, and the parts that depend on the session (the sheet, highlights, pins) render once the session is loaded. An effect writes the session to storage after each change (synchronizing with an external system, which is what effects are for).
- The storage adapter lives in `apps/web/src/data/` (ADR-0004), the only code that touches `localStorage` for Reading.

### 4. Not decided here
- **"Continue previous activity" on home.** Home is rendered on the server from the goal cookie (ADR-0003) and cannot read `localStorage`. When home should show it, the smallest fit is a cookie holding only a pointer (test id, mode, in progress), written when a session starts or finishes, which ADR-0003 allows as a small preference. Not built in M4 unless approved.
- Moving sessions to an account and syncing across devices (M7), offline use beyond a loaded test (M10), and server-side storage of results for review statistics (M5 or later).

## Alternatives considered

| Option | Pros | Cons |
|---|---|---|
| **A. `localStorage`, one versioned JSON entry per test (chosen)** | Built in, synchronous (nothing lost on close), enough space for a few kilobytes, trivial to validate and clear | Client-only (server cannot render from it); about 5 MB per origin; Safari may clear script-written storage after 7 days without a visit (not for installed home-screen apps) |
| B. IndexedDB | Large, structured, asynchronous, a likely home for offline test content later | Asynchronous transactions or a wrapper library for a few kilobytes; writes are not guaranteed to finish if the tab closes right away |
| C. A cookie per session | The server could render from it | Sent with every request, about 4 KB limit, against ADR-0003 (cookies for small preferences only) |
| D. Server storage with an anonymous guest id | Survives across devices once accounts link it | Rejected in ADR-0003 (an identifier and a table close to auth; open data residency) |
| E. A state library (e.g. Zustand) instead of `useReducer` and context | Selectors, devtools | A pattern-setting dependency for one screen; the domain reducer already holds the logic |

## Why this decision

- **Correctness:** one pure transition function guards every rule, the timer is derived from a stored start, and stored data is validated on read.
- **Simplicity:** built-in browser storage and React primitives, no new dependency.
- **Consistency:** device-only guest state like ADR-0003; domain logic in `domain/`, storage in `data/` (ADR-0004).

## Consequences

- **Positive:** resume works exactly as the flows say; review (M5) finds the finished session and its pins on the device.
- **Costs accepted:** the sheet appears a moment after the passage on first load (client-side loading); a cleared browser or another device starts fresh; the timer trusts the device clock; Safari's 7-day rule can clear an abandoned session.
- **Harder to change later:** the stored envelope (mitigated by `schema` and the validator, which can migrate or discard).

## Follow-up / migration notes

- **Implementation:** M4-12 (model, transitions, timer, validator, storage adapter, tests), then the screens (M4-13 onward).
- **Docs on acceptance:** the ADR index; ARCHITECTURE.md (guest practice state decided); BOUNDARIES.md if the storage adapter adds a rule.
