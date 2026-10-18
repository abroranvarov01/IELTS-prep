# ADR-0013: Listening Audio Delivery, Preloading and Session State

- **Status:** Proposed (drafted in M8-04 for the owner's gate M8-06)
- **Date:** 2026-10-18
- **Deciders:** Project owner (acceptance), Claude (draft)

## Context

[ADR-0012](0012-listening-content-contract-and-audio-assets.md) (Proposed) fixes what a Listening test and its audio are: one AAC-LC `.m4a` file per part, about 11 MB for a 30-minute test, pinned by `sha256`. [LISTENING_EXPERIENCE.md](../../product/LISTENING_EXPERIENCE.md) (draft, M8-02) fixes how it must behave: Practice starts a part once it can play and pauses on buffering; Exam downloads the whole recording before it starts, never stops for a slow connection, keeps going while the learner is away, and pauses only when the audio fails; Practice resumes at the saved position. This ADR decides how the files reach the phone and how a Listening session is kept, **without deciding production hosting** (M14).

Forces (facts):
- **Learners:** mid-range Android phones, variable mobile connections, data that costs money (PRODUCT.md).
- **Browsers** need byte-range (HTTP 206) responses to seek in media served over HTTP, and do not let a page start sound before a user gesture; mobile browsers may ignore `preload` hints.
- **The PWA** ([ADR-0001](0001-initial-application-foundation.md) §9): a Serwist service worker that precaches the build's static assets, **app-shell caching only**; the offline scope is TBD and belongs to M14 (offline downloads are out of this task's scope).
- **Reading's session pattern** ([ADR-0006](0006-reading-session-state.md)): a pure model with one transition function, time derived from stored times, one `localStorage` entry per test written after every transition, read as untrusted input; finished attempts later moved to IndexedDB with a random session id ([ADR-0009](0009-reading-attempts-on-the-device.md)). The Listening attempt history is M9's ADR.
- **No server-side product data yet:** content is public, no accounts (M10), the API has no models.

## Decision

### 1. Delivery: static files served by the web app, with immutable names

- **Where:** a test's audio and image files are served as static files from `apps/web/public/media/listening/<testId>/` (this is the asset folder ADR-0012 refers to). The NestJS API is not involved: the content is public and needs no logic.
- **Names carry the content hash:** `part-1.<first 12 hex of sha256>.m4a`, `plan.<hash>.svg`. The validator (ADR-0012 §7) checks that each name matches its file's hash. A changed file therefore has a new URL, and old URLs never serve new bytes.
- **Headers** (in `next.config.ts` `headers()`, for `/media/:path*`): `Cache-Control: public, max-age=31536000, immutable`; `Content-Type` from the extension (`audio/mp4`, `image/svg+xml`, `image/webp`); `X-Content-Type-Options: nosniff`.
- **Range requests:** the files must be served with `Accept-Ranges: bytes` and `206 Partial Content` for ranges. The implementation (M8-11) verifies this in an e2e or integration test against `next dev` and `next start`; if Next.js's static serving does not answer ranges, the fallback is one route handler for `/media/` that does (decided then, recorded in PROGRESS.md, no ADR change).
- **Not in the service worker's precache.** The precache manifest must exclude `public/media/**` (a test asserts it), so installing the PWA never downloads audio. The service worker adds no runtime caching for media in M8.
- **Constraints production hosting must meet (decided in M14):** HTTPS; byte ranges (206) with `Accept-Ranges`; the immutable caching headers above, or a CDN that keeps them; correct `Content-Type`; no compression of audio (it is already compressed); same origin as the app, **or** CORS allowing the app's origin for `GET` with `Range`, because the Exam download (§2) uses `fetch`. Moving files to object storage or a CDN changes only the base URL.

### 2. Preloading and buffering

**Practice** streams.
- The player uses one `<audio>` element per test with `preload="auto"` on the part on screen. Playback starts when the browser reports it can play through (`canplaythrough`) or the learner taps Play after `canplay`; the browser's HTTP cache and media buffer do the work.
- A `waiting` event shows "Loading the audio…" (LISTENING_EXPERIENCE.md); playback continues by itself on `playing`.
- **The next part is prefetched** at low priority (`fetch(url, { priority: "low" })` into the HTTP cache) once the current part has fully loaded, **unless the browser reports a data-saving preference** (`navigator.connection.saveData`), in which case nothing loads ahead.

**Exam** downloads first.
- After "Start", the four files are fetched in part order with `fetch`, reading each response stream to show the bytes received ("6 of 14 MB"); totals come from the test file's `bytes`, not from headers.
- Each finished file is checked against its `sha256` (Web Crypto) and stored in the **Cache Storage API** in a cache named `listening-audio-v1`, keyed by its immutable URL. The player then plays it from a `blob:` URL created from the cached response, so playback never touches the network again.
- **A failed or interrupted download** keeps the files already stored; "Try again" fetches only what is missing.
- **If Cache Storage is unavailable or the write fails** (quota, private window), the files are kept in memory as Blobs for this page's lifetime; everything works, but a learner who closes the page must download again on return (the "Preparing the audio" screen appears again). Before downloading, `navigator.storage.estimate()` is read; if the free quota is under twice the test's size, the memory path is taken directly.
- **Cleanup:** a test's cached files are deleted when its Exam session finishes, when a new session starts with another content version, and on load for any test without an unfinished Exam session. At most one test's audio is kept, so the cache never grows beyond one test.
- **Why Cache Storage and not the service worker:** the window can write and read Cache Storage itself, so no service-worker route is added and the offline scope stays M14's; the stored files are only what an Exam in progress needs.
- `navigator.storage.persist()` is not requested (some browsers prompt for it); persistent storage is M14's.

**Images** load as ordinary `<img>` elements with their intrinsic `width` and `height` (no layout shift), eagerly for the group on screen and lazily otherwise; in an Exam they are part of the download in the same cache, so a labelling group never waits for its picture.

### 3. Listening session state: the ADR-0006 pattern

In `entities/listening` ([ADR-0010](0010-feature-sliced-design-in-apps-web.md)): a pure model, one transition function, and a storage adapter.

```
ListeningSession
  schema 1
  sessionId                  random (as ADR-0009 §3)
  testId, testVersion, mode ("practice" | "exam")
  status ("inProgress" | "finished"), finishReason? ("user" | "timeUp" | "audioFailed")
  startedAt, finishedAt?     epoch ms
  currentQuestion            1–40
  answers                    per question or "choose several" item, in the ADR-0005 shapes
  flagged                    question numbers
  view                       part on screen, scroll position per part
  practice?                  positions: per part, ms into the part's file; speed (0.75 | 1 | 1.25)
  exam?                      recordingStartedAt?   epoch ms of "Start the recording"
                             pausedMs              total time not counted (buffering while open, audio failures)
                             pause?                { since, kind: "buffering" | "audioFailed" }
                             interruptions         count of audio failures
                             lastActiveAt          epoch ms, saved at least every 5 s while the page is open
```

- **Transitions** in one function `apply(session, event, now)`: the Reading events that apply (`answer`, `clearAnswer`, `goTo`, `toggleFlag`, `setView`, `finish`) plus `startRecording`, `setPosition` and `setSpeed` (Practice only), `stall`, `resume`, `audioFailed`, `heartbeat` (Exam only). Rules: no changes after `finished`; Practice events refused in Exam and the reverse; positions within the part's duration.
- **The Exam clock is derived, never counted**: `examClock(session, test, now)` returns the phase (`notStarted`, `recording`, `checking`, `over`), and in `recording` the part and the offset in its file, from `elapsed = now − recordingStartedAt − pausedMs − (open pause)`, the parts' `durationMs` in order, and the 2-minute check after them. `over` makes the session `finished` with `timeUp` when it is applied or loaded (as ADR-0006 §1).
- **Leaving keeps the clock running** (LISTENING_EXPERIENCE.md P1): nothing pauses the clock while the page is closed. **A buffering pause** is open only while the page is: on load, an open `buffering` pause is closed at `lastActiveAt`, so time away is not subtracted. **An audio failure** stays open until the learner taps "Try again" or "Finish without the rest" (`finishReason: "audioFailed"`), because that is the only pause the Exam allows.
- **While the page is open, the clock is the truth and the player follows it:** whenever playback (re)starts (the first start, "Continue", "Try again", the end of a stall), the player seeks to the clock's position and plays the right part's file; during playback it does not seek. The device's clock is used, as in Reading (practice, not a proctored test).
- **Practice positions** are saved on pause, on a part change, on `pagehide` and when the page becomes hidden, and at least every 5 seconds while playing. Resume seeks to the saved position minus 3 seconds (LISTENING_EXPERIENCE.md).
- **Storage:** `localStorage`, key `listening:<testId>`, envelope `{ "schema": 1, "session": { … } }`, written after every transition (small: no audio in it), read as untrusted input by a validator next to the model; unknown schema, malformed values, unknown numbers or a different `testVersion` read as "no session" (the start screen opens). Storage unavailable: the session runs in memory with Reading's notice.
- **Finishing:** the finished session is written under `listening:<testId>:finished` (one per test, as M4 did for Reading) until M9's attempt history imports it as ADR-0009 §6 imported M4 sessions. The finished page reads `interruptions` to show the "was interrupted" line.
- **The Practice Hub** reads both keys to show "In progress · {mode}" and "Finished".
- The level check's Listening section (M9) runs on this model as ADR-0011 §2 runs the Reading section on Reading's.

### 4. Not decided here

Production hosting, CDN and object storage (M14, within §1's constraints); offline downloads of tests and service-worker media caching (M14); the Listening attempt history and its migration (M9, extending ADR-0009); sync of sessions across devices (M10).

## Alternatives considered

| Decision | Option | Pros | Cons |
|---|---|---|---|
| Delivery | **Static files from the web app, hashed names, immutable caching (chosen)** | Nothing to build; byte ranges and caching are standard; the base URL can move to a CDN later | Binary files in the web app's `public/` |
| | Streamed by the NestJS API | One place for future access control | Re-implements static serving and ranges; the API has no reason to see public content |
| | Object storage and a CDN now | Production-like | Hosting is M14's decision (data residency is TBD) |
| Exam preload | **`fetch` into Cache Storage, played from `blob:` URLs (chosen)** | Exact progress; hash-checked; survives a reload; no service-worker change | Memory for the Blob of the playing part; a cleanup rule to keep |
| | Service-worker runtime caching of media | Transparent to the player | Enters the offline scope (M14); range requests through a service worker need extra handling; worker updates complicate it |
| | `preload="auto"` only | No code | Browsers may not download everything, so a slow connection could stop an exam mid-part |
| | Memory only | Simple | A reload or a closed tab means downloading again |
| Session clock | **Derived from stored times, buffering and failures subtracted (chosen)** | Correct across reloads, closed tabs and locked phones; testable without audio | The player must follow the clock on every (re)start |
| | The audio element's `currentTime` as truth, saved periodically | Simple while playing | Wrong after a reload (no wall-clock time) and when the page is closed; contradicts "keeps going while away" |
| Session storage | **`localStorage`, one entry per test, as ADR-0006 (chosen)** | Proven pattern; synchronous writes | Small size limit (sessions are a few KB) |
| | IndexedDB for sessions | Large capacity | Asynchronous writes can be lost when a tab closes; ADR-0009 kept sessions in `localStorage` for this reason |

## Why this decision

- **Correctness:** an Exam never waits on the network once started; the clock is a pure function with tests; files are hash-checked before use; old URLs never serve new bytes.
- **Simplicity:** static files and standard caching; Reading's session pattern; no service-worker change and no new library.
- **Weak connections:** a resumable, hash-checked download with exact progress; streaming with a single prefetch in Practice, none under data saving.
- **Reversibility:** hosting moves by changing the base URL within §1's constraints; offline downloads can later reuse the same cache and files.

## Consequences

- **Positive:** the player (M8-11), the screens (M8-12, M8-13) and M9's history get one exact model; production hosting has a written checklist.
- **Costs accepted:** a cache cleanup rule; a `headers()` entry and a precache exclusion to keep; one Blob of up to a few MB in memory while a part plays.
- **Harder to change later:** the session's shape once sessions exist on devices (mitigated by `schema` and `testVersion`); the hashed naming of media files.

## Follow-up / migration notes

- **Implementation:** M8-10 (the session model, clock and storage), M8-11 (the player, delivery headers, range check, Exam download and cache), M8-12 and M8-13 (screens).
- **Enforcement:** unit tests for `apply` and `examClock` (stalls, failures, time away, part boundaries, the check, time-out); a test that the precache manifest has no `media/` entry; a range-request test; the validator's hash-name rule (ADR-0012 §7).
- **Docs on acceptance:** the ADR index (Accepted); ARCHITECTURE.md (Listening delivery and session confirmed; "Audio" and "Guest practice state" updated, hosting constraints noted for M14); BOUNDARIES.md (`entities/listening` storage and cache adapters).
