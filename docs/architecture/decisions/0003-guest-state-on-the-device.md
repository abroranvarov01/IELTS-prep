# ADR-0003: Guest State on the Device

- **Status:** Accepted (2026-10-10, owner, task M3-05; drafted in M3-03).
- **Date:** 2026-10-10
- **Deciders:** Project owner (acceptance), Claude (draft)

## Context

M3 lets a user answer two onboarding questions (exam type, target band) and then shows a home page built on those answers ([USER_FLOWS.md](../../product/USER_FLOWS.md#onboarding-and-home-flows-m3), draft). The product is guest-first: there are no accounts, and registration is never required before value ([PRODUCT.md](../../product/PRODUCT.md#approved-product-principles)). The answers must survive a reload and a later visit.

Forces:
- **Owner decision (2026-10-10):** persist only what is appropriate for the current architecture, and do not invent auth.
- The API has a database but no product tables. Hosting and data residency are TBD, and Uzbekistan's personal-data law has localization requirements ([ARCHITECTURE.md](../ARCHITECTURE.md#open-decisions-tbd)). The product may be used by minors.
- Home is the main screen, opened on mid-range Android phones over variable connections. It should show the right content on first paint, not a loading state followed by a jump.
- The web app renders with Next.js `cacheComponents` (static shell, dynamic parts streamed). `proxy.ts` already decides locale redirects before rendering, and the language choice is already a cookie (`NEXT_LOCALE`).
- The service worker caches static assets only, never pages (ADR-0001 §9, `apps/web/src/app/sw.ts`). The offline scope is TBD.
- The M1 language switcher works without JavaScript. The M3 drafts ask the same of onboarding where the storage allows it.

What has to be stored in M3 is small: the exam type (Academic, General Training, or "I don't know yet") and the target band (6.0, 6.5, 7.0, 7.5, 8+, or "I don't know yet"), each possibly not answered yet. Neither is personal data on its own: no name, no contact, no identifier.

## Decision

### 1. The guest's goal lives in one first-party cookie, written and read by the web server
- One cookie holds the onboarding answers (the "goal"): a **versioned, compact value**, for example `v1` plus the exam type and target band, each possibly missing. The exact encoding is chosen in M3-06.
- **Written only on the server**, by Next.js Server Actions behind plain `<form>`s: tapping an answer submits the form, the action validates the value, sets the cookie, and redirects to the next step. This works without JavaScript and needs no client-side storage code.
- **Read only on the server**: by `proxy.ts` and by server components. No client component reads it.
- Attributes: `Path=/`, `SameSite=Lax`, `HttpOnly` (no script needs it), `Secure` in production, `Max-Age` 400 days (the longest Chrome keeps a cookie), refreshed on every write.

### 2. The value is untrusted input, parsed by one pure domain function
- A pure function in web domain code (location per ADR-0004) turns the raw cookie value into a goal or "no goal". It accepts only the current version and the known values.
- An **old version, an unknown value, or a tampered or corrupted string reads as "not answered"**. It never throws and never shows an error. Onboarding then resumes at the first unanswered step.
- Server Actions validate submitted values with the same domain definitions before writing.

### 3. The home → onboarding decision is made before rendering
- `proxy.ts` sends a request for home (`/{locale}`) to the first unanswered onboarding step, with an HTTP redirect, when the goal is incomplete. No other path is ever redirected to onboarding (direct links bypass it, USER_FLOWS.md).
- **No loop when cookies are blocked:** links that leave onboarding for home ("Not now", the end of the flow) carry a marker in the address that the proxy honors by not redirecting. Home then renders with "Target band: not set yet". Without the marker, a later visit starts onboarding again, as the spec says.

### 4. Scope: small preferences only
- The cookie holds the goal and nothing else. **Never** personal data, free text, or anything a user typed.
- Practice state (answers, attempts, results, unfinished activities from M4 on) is **not** stored in this cookie. A cookie is sent with every request and holds about 4 KB. Where practice state lives is decided when it first exists, with the offline scope and accounts in mind.

### 5. Changing and clearing
- "Change goal" reruns the two questions, and each answer overwrites its part of the cookie. There is no separate reset control in M3.
- Clearing the browser's site data clears the goal; the next visit starts onboarding again. Nothing is kept on a server, so there is nothing else to delete.

## Alternatives considered

| Option | Pros | Cons |
|---|---|---|
| **A. First-party cookie written and read by the server (chosen)** | Home renders the right state on first paint; the onboarding redirect is a real HTTP redirect before rendering; works without JavaScript; same mechanism as `NEXT_LOCALE`; no client storage code | Sent with every request (tens of bytes); about 4 KB at most, so it only suits small preferences; home becomes dynamic (its personalized part streams after the static shell) |
| B. `localStorage` | Simple API; about 5 MB; home could stay fully static | Only the client can read it: home first renders without the goal, then redirects or re-renders after JavaScript loads (slow and jumpy on mid-range phones); no JavaScript, no onboarding; Safari deletes script-written storage after 7 days without a visit |
| C. IndexedDB | Large, structured, works offline; a likely home for practice state later | Same client-only drawbacks as B, plus an asynchronous API, for two values |
| D. Server-side guest record (an anonymous ID in a cookie, a table behind the API) | Data on the server, easier to move into an account later | Needs an identifier, a table, an endpoint, abuse protection and a retention policy: close to auth, which the owner ruled out. A server record about a person runs into the open hosting and data-residency decision |
| E. Not stored (ask every visit) | Nothing to build | Breaks "returning user → next action" |

## Why this decision

- **Correctness:** one parser treats the stored value as untrusted, so a bad value can only mean "not answered", never a crash. The redirect happens before rendering, so a user never sees the wrong screen first.
- **Simplicity:** no client storage code, no API, no database, no identifier. It reuses the mechanism the app already has for the language choice.
- **Consistency:** like the language switcher, onboarding works without JavaScript, and the server decides what to render.

## Consequences

- **Positive:** M3 needs no backend work and stores nothing about a person on a server. The goal is available to every server-rendered page and to `proxy.ts`.
- **Costs accepted:** home is rendered per request (its static shell is still prerendered). The goal is device- and browser-bound: on iOS, an installed home-screen app has storage separate from Safari, so a user may answer onboarding twice there. A blocked cookie means onboarding is asked again on the next visit.
- **Harder to change later:** moving the goal elsewhere means reading the old cookie once and migrating it (the version field makes that possible).

## Follow-up / migration notes

- **Implementation:** M3-06 (domain definitions, the parser, the cookie writes and reads, unit tests), M3-07 (Server Actions behind the onboarding forms), M3-08 (the proxy redirect and home).
- **Still open:** where practice state lives (M4), the offline scope (if pages are ever cached by the service worker, server-rendered personalization needs another look), and moving the goal into an account (M7, Authentication ADR).
- **Legal:** the cookie is strictly functional, holds no personal data and does no tracking. It is listed for the legal review before beta (M11).
- **Security:** Next.js Server Actions accept only POST and check the request's origin. The cookie value is never logged.
