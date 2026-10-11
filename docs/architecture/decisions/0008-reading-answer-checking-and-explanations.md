# ADR-0008: Reading Answer Checking, Explanations and Review Content

- **Status:** Proposed (2026-10-11, M5 planning; for the owner's decision at task M5-01). If accepted, it amends [ADR-0005](0005-reading-content-contract.md) §2 (the answer key is loaded by the results and review pages) and extends the content contract (§3, §4 below).
- **Date:** 2026-10-11
- **Deciders:** Project owner (acceptance), Claude (draft)

## Context

[ADR-0005](0005-reading-content-contract.md) keeps each test's answer key and evidence in a separate file (`<testId>.key.json`) that the web app does not load in M4, and leaves answer checking open. The owner moved answer checking to M5 (M4-09). M5 (drafts in [READING_EXPERIENCE.md, M5 specifications](../../product/READING_EXPERIENCE.md#m5-specifications-drafts)) needs:

- checking every M4 question type and a raw score, with no band conversion for the uncalibrated demo test;
- evidence-first review: the accepted answer, the evidence sentences, an explanation and a simpler explanation, in uz, ru and en;
- observable signals for Error Intelligence (for example a typed answer one letter away from an accepted one).

Forces:
- **Honest feedback and one scoring source** (PRODUCT.md; INVARIANTS I-1 to I-4; `.claude/rules/domain/ielts-scoring.md`): checking is domain code with tests for every rule; IELTS rules are sourced.
- **Content integrity (I-5)** and **content as untrusted data** (ADR-0005): new content files are validated like tests and keys.
- **Localization:** explanations are in the interface language, test content stays in English and is marked `lang="en"` ([LOCALIZATION.md](../../product/LOCALIZATION.md)). Interface strings live in the catalogs (I-6).
- **Device-only practice:** answers live in the browser (ADR-0006). Review must show the accepted answers, so any page that reviews must receive the key.
- **No AI decision exists** (ARCHITECTURE.md: AI provider is TBD).
- **The demo test keeps `version: 1`** so M4 sessions stay valid ([ADR-0009](0009-reading-attempts-on-the-device.md) §5).

## Decision

### 1. Checking is one domain module
- `apps/web/src/domain/reading/scoring.ts` (the name keeps it under `.claude/rules/domain/ielts-scoring.md`): a pure function from the test, the key and an attempt's answers (and pins) to a result: per question number an outcome (`correct`, `incorrect`, `unanswered`) and its observable signals, plus the raw score and its denominator.
- The rules (normalization, accepted variants, "choose several" marks, unanswered, denominators, signals) are those in [READING_EXPERIENCE.md, Answer checking (M5)](../../product/READING_EXPERIENCE.md#answer-checking-m5) and [Error Intelligence (M5)](../../product/READING_EXPERIENCE.md#error-intelligence-m5), each with unit tests that cite their source or say that no official source exists.
- **No band conversion** in M5: nothing converts a raw score to a band, so INVARIANTS I-2 still has no implementation to protect.

### 2. Checking runs in the browser, on the results and review pages
- The results and review pages import the key and the active locale's explanations as static data (read and validated on the server at build time, like the tests, ADR-0005 §3) and pass them to their client parts, which check the attempt from the device's storage.
- **The test screen does not import them**, so the key is not part of the page a learner answers on.
- **Trust model, stated plainly:** a determined user can read the key from the results or review page before taking the test. Device-only practice cannot keep it secret: a server check would have to return the accepted answers for review anyway. This is practice, not a proctored test, as with the device clock (ADR-0006).

### 3. Answer key additions (`<testId>.key.json`, still validated against its test)
- **Typed answers:** `accept` lists every accepted answer in full: no optional-word brackets or slash syntax to parse. Variants are authored, never generated. Each is non-empty, distinct from the others after normalization, and within the group's word limit by the validator's word count ([READING_EXPERIENCE.md, Answer checking (M5)](../../product/READING_EXPERIENCE.md#answer-checking-m5): hyphenated words count once, articles count, one number is free only where the limit allows a number). The M4 Practice warning keeps its own, more lenient count.
- **"Choose several":** every number of an item has the same `accept` set, with exactly `choose` options.
- **NOT GIVEN:** `evidence` lists the sentences where the passage deals with the statement's topic, and may be empty. Review presents them as related text, never as proof.
- **Optional `trap`** per question, one of `paraphrase`, `qualifier`: what the question tests, written by the content author (READING_EXPERIENCE.md, Error Intelligence).
- **Versioning:** the key may change without a version change until results based on it have shipped. After that, any change to `accept` or `evidence` increases the test's `version` (ADR-0005 §1), so stored results always match a key.

### 4. Content addition: `fromPassage`
- Typed-answer groups may set `fromPassage: true` when their instruction says the words come from the passage. The "not from the passage" signal applies only there. The validator rejects it on other group types. Adding it does not change numbering, options or sentence ids, so the test keeps its version.

### 5. Explanations are per-test, per-locale content files
- `apps/web/content/reading/<testId>.explanations.<locale>.json` for `uz`, `ru` and `en`:

```
{ "testId", "version", "locale",
  "items": { "<unit key>": { "explanation": Segment[], "simpler": Segment[] } } }
Segment = { "text": "…" } | { "en": "…" }
```

- One item per question unit (a "choose several" item once, under its first number, as answers are stored, ADR-0006).
- `en` segments are English test words or short quotes, rendered with `lang="en"` inside a Russian or Uzbek explanation. Structured segments, as with gap texts (ADR-0005), never markers inside strings.
- **Validated with the test and key** by the domain validator: the file's test and version match; every unit has both texts in every locale; no empty text; `simpler` is shorter than `explanation`; length limits from the authoring rules. An invalid or missing file fails the unit tests and the build.
- Only the active locale's file is passed to the review page.
- **Not in `messages/*.json`:** explanations are per-test content, not interface strings. The fixed texts of Error Intelligence (signal notes and tips) are interface strings and do live in the catalogs.

### 6. "Explain simpler" is authored, not generated
The simpler version is the authored `simpler` text. No runtime AI. Generated explanations would first need an AI provider ADR (ARCHITECTURE.md open decision; the decisions it needs are listed in READING_EXPERIENCE.md, Explanations (M5)).

### 7. Not decided here
Band conversion and calibration; AI; authoring tools and review workflow (M9); server-side checking or storage (M7 and later).

## Alternatives considered

| Option | Pros | Cons |
|---|---|---|
| **A. Checking in the browser on the results and review pages; explanations as per-locale content files (chosen)** | No network needed after loading; the test screen never carries the key; explanations validated like other content; only one language sent | The key is readable from those pages |
| B. A Server Action checks the answers and returns the result | The key file stays on the server | No real secrecy (review returns the accepted answers); finishing needs the network; answers still live on the device |
| C. Explanations inside the key file, all languages together | One file per test | Sends three languages to every review; mixes the language-neutral key with localized text |
| D. Explanations in the message catalogs | Existing localization tooling | Catalogs are interface strings; per-test content would grow every page's catalog |
| E. Runtime AI explanations | Tailored, unlimited "simpler" | Needs an AI provider ADR, privacy and data-residency decisions, cost, latency on weak connections, grounding and failure handling |

## Why this decision

- **Correctness:** one tested checking module; content and explanations validated together, so a missing explanation or a broken evidence id cannot ship.
- **Simplicity:** static files and pure functions; no API, database or AI.
- **Consistency:** ADR-0005's file-plus-validator approach; domain in `domain/`, file loading in `data/` (ADR-0004); structured segments as for gap texts.

## Consequences

- **Positive:** results and review work for every M4 question type and stay correct offline once loaded; authors see validation errors at build time.
- **Costs accepted:** about six authored texts per question (two per locale), each needing review; the key is visible to a determined user; a key correction after release costs a content version (and with it in-progress sessions of that test).
- **Harder to change later:** the explanation file shape and the unit keys it uses.

## Follow-up / migration notes

- **Implementation:** M5-02 (key and content additions, validator), M5-03 (`scoring.ts`), M5-05 (explanation files and their validator), M5-06 and M5-07 (loading on the results and review pages).
- **Docs on acceptance:** the ADR index; ADR-0005's status line ("§2 amended by ADR-0008"); ARCHITECTURE.md (content model: checking and explanations decided); LOCALIZATION.md (explanations are localized content files, not catalog strings).
