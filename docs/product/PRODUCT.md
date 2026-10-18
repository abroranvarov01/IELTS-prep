# Product

Canonical owner of: what we are building, for whom, why it is different, the approved product principles, the honest-feedback rule, and content integrity.

## What we are building

A mobile-first IELTS preparation PWA. The user opens it and immediately knows what to do next.

**Product loop:** Open → understand what to do → practice → understand mistakes → improve.

## Who it is for

- **Launch market:** Uzbekistan.
- **Users:** students and other IELTS candidates in Uzbekistan. The product is mobile-first and must work well on mid-range Android phones and on variable mobile connections. The product may be used by minors (see [Open questions](#open-questions)).
- **Interface languages:** Uzbek, Russian, English. Test content stays in English. Details: [LOCALIZATION.md](LOCALIZATION.md).
- Other markets may come later. Do **not** design for hypothetical international scale now (multi-region, multi-currency, many locales). Add it when a real market decision exists.

## Differentiation

1. Extremely simple UX: no learning curve.
2. Built for phones, not a desktop UI squeezed onto mobile.
3. Personalized next action instead of a huge content library to navigate.
4. High-quality explanations of mistakes.
5. A Reading experience designed specifically for phones (see [READING_EXPERIENCE.md](READING_EXPERIENCE.md)).
6. Free core IELTS preparation.
7. Uzbek, Russian, and English interface.
8. Easy move between comfortable phone practice and realistic desktop exam simulation.
9. Honest AI feedback that is clearly separated from official IELTS scores.

UX rules that implement this: [UX_PRINCIPLES.md](UX_PRINCIPLES.md). Feature scope: [FEATURE_MAP.md](FEATURE_MAP.md).

## Approved product principles

These are decided product direction. **None of them is implemented yet.** The implementation approach for each one is open.

- **Value before registration.** Users get real value (practice, results, explanations) before any mandatory sign-up. Registration is asked for when it gives the user something, such as saving progress across devices.
- **Direct entry paths.** A direct acquisition link (for example to a Reading practice) starts that practice with minimal or no onboarding friction.
- **Light personalization.** Personalization may ask for the user's **target band** and **exam date**. Nothing more is required to begin.
- **Clear next action for returning users.** A returning user sees one clear recommended next action, not a library to navigate.
- **"Explain simpler".** This is a deliberate explanation capability: any explanation can be re-explained more simply, in Uzbek, Russian, or English. The test content itself stays in English.
- **Error Intelligence.** Mistake analysis goes beyond right/wrong. It detects **recurring error patterns** (for example, repeated confusion of "Not Given" with "False", or the same paraphrase type missed again) and turns them into targeted practice.
- **Mobile for learning, desktop for simulation.** Mobile is optimized for comfortable learning. Desktop can provide realistic, computer-delivered IELTS simulation.
- **Honest AI scores.** Writing and Speaking scores stay estimates or ranges (see [Honest feedback](#honest-feedback-non-negotiable)).

## Honest feedback (non-negotiable)

AI may later evaluate Writing and Speaking. The rules:

- **Never present an AI evaluation as an official IELTS result or an examiner's judgment.**
- Label AI scores as estimates: "Estimated band", "Estimated range". The equivalent wording applies in Uzbek and Russian.
- **No false precision.** Prefer a range (for example "6.0–6.5") over a single band when the certainty does not support one. Never show decimals finer than IELTS's half-band steps.
- **Keep explanation quality separate from score certainty.** A detailed, useful explanation of mistakes does not make the score more certain, and the UI must not imply that it does.
- Scores computed deterministically from answer keys (Reading and Listening practice) are still practice results, not official scores.

Code-level enforcement: [`.claude/rules/domain/ielts-scoring.md`](../../.claude/rules/domain/ielts-scoring.md).

## Content integrity and brand

- Practice content must be original or properly licensed. Never copy passages, recordings, or questions from published IELTS materials (for example the Cambridge IELTS books) and never generate content that claims to be official.
- IELTS is a registered trademark of its owners (British Council, IDP, Cambridge University Press & Assessment). The product is not affiliated with them unless that changes. The visual identity takes inspiration from IELTS but does not copy it (see [DESIGN_CONSTITUTION.md](../design/DESIGN_CONSTITUTION.md)).

## Non-goals (for now)

- Matching competitors feature-for-feature.
- Content-library browsing as the main way to use the product.
- Gamification that adds noise without improving preparation.
- International expansion infrastructure.

## Open questions

These are deliberately unresolved. Do not settle them silently in code. Raise them (see the `architecture-decision` skill when they are architectural).

- Academic only, or Academic and General Training at launch? (This affects Reading and Writing Task 1 content and the Reading band conversion.)
- Accounts: at which moment registration is offered or required, and which sign-in methods to use (phone/SMS, Telegram, Google, email). Practice before registration is already decided (see [Approved product principles](#approved-product-principles)).
- What exactly is "free core", and what (if anything) is paid?
- Minors: consent and data-handling requirements for users under 18.
- Content sourcing: who writes the practice content, and how is it reviewed? (Owner, 2026-10-18, M8-06: original Listening audio production is deferred; one temporary Listening test from existing material whose terms permit this use supplies the first working test, labelled as temporary with its attribution, until the owner's final materials replace it. The question stays open for the beta library, M13.)
- How AI estimates are validated against real examiner bands before launch.
