# ADR-0008: Reading Answer Checking, Explanations and Review Content

- **Status:** Proposed (2026-10-11, M5 planning; revised the same day for the owner review packet; for the owner's decision at task M5-01). If accepted, it amends [ADR-0005](0005-reading-content-contract.md) §2 (the answer key is loaded by the results and review pages) and extends the content contract (§3 to §5 below).
- **Date:** 2026-10-11
- **Deciders:** Project owner (acceptance), Claude (draft)

## Context

[ADR-0005](0005-reading-content-contract.md) keeps each test's answer key and evidence in a separate file (`<testId>.key.json`) that the web app does not load in M4, and leaves answer checking open. The owner moved answer checking to M5 (M4-09). M5 (drafts in [READING_EXPERIENCE.md, M5 specifications](../../product/READING_EXPERIENCE.md#m5-specifications-drafts)) needs:

- checking every M4 question type and a raw score, with no band conversion for the uncalibrated demo test;
- evidence-first review: the accepted answer, the evidence sentences, an explanation and a simpler explanation, in uz, ru and en;
- observable signals for repeated-mistake detection (for example a typed answer one letter away from an accepted one);
- results that stay tied to the key and checking rules that produced them ([ADR-0009](0009-reading-attempts-on-the-device.md) §1).

**What the M4 contract does today** (`apps/web/src/domain/reading/parse-content.ts`): the test and key parsers build their objects from known fields only, so an unknown field is ignored, not rejected; every list in a key entry must have at least one item, so `evidence` cannot be empty; a key's `version` must equal its test's; each `accept` value must be an option of its question; nothing checks that the numbers of a "choose several" item share one set, or how many options it has.

Forces:
- **Honest feedback and one scoring source** (PRODUCT.md; INVARIANTS I-1 to I-4; `.claude/rules/domain/ielts-scoring.md`): checking is domain code with tests for every rule; IELTS rules are sourced.
- **Content integrity (I-5)** and **content as untrusted data** (ADR-0005): new files are validated like tests and keys.
- **Who wrote it:** the demo test, its key and the explanations are drafted by Claude (AI). That must stay visible until people have reviewed them.
- **Localization:** explanations are in the interface language; test content stays in English and is marked `lang="en"` ([LOCALIZATION.md](../../product/LOCALIZATION.md)). Interface strings live in the catalogs (I-6).
- **Device-only practice:** answers live in the browser (ADR-0006). Review must show the accepted answers, so any page that reviews must receive the key.
- **No AI decision exists** (ARCHITECTURE.md: AI provider is TBD).

## Decision

### 1. Checking is one domain module with a rules version
- `apps/web/src/domain/reading/scoring.ts` (the name keeps it under `.claude/rules/domain/ielts-scoring.md`): a pure function from the test, the key and an attempt's answers (and pins) to a result: per question number an outcome (`correct`, `incorrect`, `unanswered`) and its observable signals, plus the marks and the number of scoring positions.
- **`SCORING_RULES_VERSION`**, one integer constant in that module, increases whenever a change could alter an outcome, a mark or a signal for the same answers and key, bug fixes included. Each stored result records it (ADR-0009 §1, §4).
- The rules (normalization, accepted variants, "choose several" marks, unanswered, denominators, signals) are those in [READING_EXPERIENCE.md, Answer checking (M5)](../../product/READING_EXPERIENCE.md#answer-checking-m5) and [Error Intelligence (M5)](../../product/READING_EXPERIENCE.md#error-intelligence-m5), each with unit tests that cite their source or say that no official source exists.
- **No band conversion** in M5: nothing converts a raw score to a band, so INVARIANTS I-2 still has no implementation to protect.

### 2. Checking runs in the browser, on the results and review pages
- The results and review pages import the key and the active locale's explanations as static data (read and validated on the server at build time, like the tests, ADR-0005 §3) and pass them to their client parts, which check the attempt from the device's storage.
- **The test screen does not import them**, so the key is not part of the page a learner answers on.
- **Trust model, stated plainly:** a determined user can read the key from the results or review page before taking the test. Device-only practice cannot keep it secret: a server check would have to return the accepted answers for review anyway. This is practice, not a proctored test, as with the device clock (ADR-0006).

### 3. Answer key additions (`<testId>.key.json`, still validated against its test)
- **`revision`** (integer, from 1): increases with any change to accepted answers, evidence or tags once the key has been used for results. A correction needs **no content version change**, because no stored answer or anchor becomes invalid (ADR-0005 §1); stored results record the revision they used, and ADR-0009 §4 decides what a correction does to them. `version` keeps matching the test's content version, as today.
- **Typed answers:** `accept` lists every accepted answer in full: no optional-word brackets or slash syntax to parse. Variants are written into the key ahead of time and reviewed; none are generated when checking. Each is non-empty, distinct from the others after normalization, and within the group's word limit by the validator's word count ([READING_EXPERIENCE.md, Answer checking (M5)](../../product/READING_EXPERIENCE.md#answer-checking-m5): hyphenated words count once, articles count, one number is free only where the limit allows a number). The M4 Practice warning keeps its own, more lenient count.
- **"Choose several" (new validator rule):** every number of an item has the same `accept` set, with exactly as many options as the item has numbers (its `choose`), and no option twice. The key format stays one entry per question number.
- **NOT GIVEN (contract change):** `evidence` of a NOT GIVEN answer lists the sentences where the passage deals with the statement's topic and **may be empty**; M4's validator requires at least one. Review presents these sentences as related text, never as proof. For every other answer, at least one evidence sentence stays required.
- **Optional `trap`** per question, one of `paraphrase`, `qualifier`: what the question tests (READING_EXPERIENCE.md, Error Intelligence).
- **`review`**, required: `{ "status": "aiDraft" | "reviewed" | "approved" }` for the key as a whole (§6).

### 4. Content addition: `fromPassage`
- Typed-answer groups may set `fromPassage: true` when their instruction says the words come from the passage. The "not from the passage" signal applies only there. The validator rejects it on other group types. It changes nothing the content version guards.

### 5. Explanations are per-test, per-locale content files
- `apps/web/content/reading/<testId>.explanations.<locale>.json` for `uz`, `ru` and `en`:

```
{ "testId", "version", "locale",
  "review": { "status": "aiDraft" | "reviewed" | "approved" },
  "items": { "<unit key>": { "explanation": Segment[], "simpler": Segment[] } } }
Segment = { "text": "…" } | { "en": "…" }
```

- One item per question unit (a "choose several" item once, under its first number, as answers are stored, ADR-0006).
- `en` segments are English test words or short quotes, rendered with `lang="en"` inside a Russian or Uzbek explanation. Structured segments, as with gap texts (ADR-0005), never markers inside strings.
- **Validated with the test and key** by the domain validator: the file's test and version match; every unit has both texts; no empty text; `simpler` is shorter than `explanation`; the length limits of the authoring rules; a known review status. An invalid or missing file fails the unit tests and the build.
- Only the active locale's file is passed to the review page.
- **Not in `messages/*.json`:** explanations are per-test content, not interface strings. The fixed texts of repeated-mistake detection (notes and tips) are interface strings and live in the catalogs.

### 6. Authorship and review status are recorded, not implied
- **`aiDraft`**: drafted by Claude (AI), including any text a worker task writes. Never described as written by a person.
- **`reviewed`**: a person has checked it (the English key and explanations against the passage by someone with strong English and IELTS Reading knowledge; ru and uz by fluent speakers), recorded in PROGRESS.md with the reviewer's role and date.
- **`approved`**: the owner has approved it for release.
- M5 may finish with `aiDraft` files; nothing is released to real users before beta. The pre-beta requirement (all `approved`) is in READING_EXPERIENCE.md, Explanations (M5), decision D20. The status is not shown in the interface in M5.

### 7. "Explain simpler" is pre-written, not generated at runtime
The simpler version is the `simpler` text of §5. No runtime AI. Generated explanations would first need an AI provider ADR (ARCHITECTURE.md open decision; the decisions it needs are listed in READING_EXPERIENCE.md, Explanations and the AI decision (M5)).

### 8. Not decided here
Band conversion and calibration; AI; authoring tools and the review workflow beyond the status field (M9); server-side checking or storage (M7 and later).

## Alternatives considered

| Option | Pros | Cons |
|---|---|---|
| **A. Checking in the browser on the results and review pages; key revision and rules version; explanations as per-locale content files with a review status (chosen)** | No network needed after loading; the test screen never carries the key; corrections traceable; AI drafts visible as such | The key is readable from those pages; two version numbers to maintain |
| B. A Server Action checks the answers and returns the result | The key file stays on the server | No real secrecy (review returns the accepted answers); finishing needs the network; answers still live on the device |
| C. Key corrections bump the content version | One number fewer | Discards in-progress sessions and ends review of earlier attempts though no stored answer became invalid |
| D. Explanations inside the key file, all languages together | One file per test | Sends three languages to every review; mixes the language-neutral key with localized text |
| E. Explanations in the message catalogs | Existing localization tooling | Catalogs are interface strings; per-test content would grow every page's catalog |
| F. Runtime AI explanations | Tailored, unlimited "simpler" | Needs an AI provider ADR, privacy and data-residency decisions, cost, latency on weak connections, grounding and failure handling |

## Why this decision

- **Correctness:** one tested checking module; every result traceable to its key revision and rules version; content, key and explanations validated together, so a missing explanation or a broken evidence id cannot ship.
- **Simplicity:** static files and pure functions; no API, database or AI.
- **Consistency:** ADR-0005's file-plus-validator approach; domain in `domain/`, file loading in `data/` (ADR-0004); structured segments as for gap texts.

## Consequences

- **Positive:** results and review work for every M4 question type and stay correct offline once loaded; authors see validation errors at build time; corrections show up as rechecked results instead of silent changes.
- **Costs accepted:** about six texts per question (two per locale), each needing human review before beta; the key is visible to a determined user.
- **Harder to change later:** the explanation file shape and the unit keys it uses.

## Follow-up / migration notes

- **Implementation:** M5-02 (key and content additions, validator), M5-03 (`scoring.ts` and its rules version), M5-05 (explanation files, their validator, AI drafts marked `aiDraft`), M5-06 and M5-07 (loading on the results and review pages).
- **Docs on acceptance:** the ADR index; ADR-0005's status line ("§2 amended by ADR-0008"); ARCHITECTURE.md (content model: checking and explanations decided); LOCALIZATION.md (explanations are localized content files, not catalog strings).
