# Localization

Canonical owner of **interface language rules**. The technical architecture (library, file format, routing) is **TBD** and will be recorded in an ADR (or in the foundation ADR) when implementation starts.

## Languages

| Language | Role | Notes |
|---|---|---|
| Uzbek | Interface | **Script is TBD:** Latin (official) only, or Latin and Cyrillic? Do not decide this silently. |
| Russian | Interface | Widely used by the target users. |
| English | Interface **and** test content | |

- **IELTS test content stays in English** (passages, audio, questions, model answers), because the practice must be realistic.
- The surrounding text (instructions, explanations, feedback, navigation) is in the user's interface language. Explanations are available in all three interface languages, including "Explain simpler" ([PRODUCT.md](PRODUCT.md#approved-product-principles)).

## Rules (apply once UI code exists)

1. **No hard-coded user-facing strings in components.** Every interface string goes through the localization layer. Test content is data, not interface strings.
2. **Design for the longest language, not English.** Russian and Uzbek strings are often 20–40% longer than English. Buttons, tabs, and headings must wrap or adapt without truncating meaning. Do not use fixed-width containers sized to English text.
3. **No string concatenation for sentences.** Use full message templates with placeholders. Word order and plural rules differ between languages (Russian has several plural forms).
4. **Locale-aware formatting** for numbers, dates, and durations. Band scores always use IELTS notation (for example "6.5"), never a locale's decimal comma.
5. **Uzbek Latin orthography:** use the proper characters in oʻ and gʻ (U+02BB) and the tutuq belgisi ʼ (U+02BC), not ASCII apostrophes or backticks. Search and input matching should tolerate the ASCII variants that users type.
6. **Fonts must cover every script used:** Latin, U+02BB/U+02BC, and Cyrillic. Verify this before adopting any font (see [DESIGN_SYSTEM.md](../design/DESIGN_SYSTEM.md#typography)).
7. Plain-language rules ([UX_PRINCIPLES.md](UX_PRINCIPLES.md#6-plain-language)) and honest-feedback wording ([PRODUCT.md](PRODUCT.md#honest-feedback-non-negotiable)) apply in every language. Translations are reviewed by fluent speakers, not shipped raw from machine translation.

## Future deterministic enforcement

Missing-key checks and hard-coded-string linting belong in tooling. See [QUALITY_GATES.md](../engineering/QUALITY_GATES.md#future-deterministic-enforcement).
