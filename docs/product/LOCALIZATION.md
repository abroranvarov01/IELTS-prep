# Localization

Canonical owner of **interface language rules**. The technical architecture is decided in [ADR-0001 §6](../architecture/decisions/0001-initial-application-foundation.md#6-localization) and its implementation is described under [Technical setup](#technical-setup).

## Languages

| Language | Role | Notes |
|---|---|---|
| Uzbek | Interface | **Script is TBD:** Latin (official) only, or Latin and Cyrillic? Do not decide this silently. |
| Russian | Interface | Widely used by the target users. |
| English | Interface **and** test content | |

- **IELTS test content stays in English** (passages, audio, questions, model answers), because the practice must be realistic.
- The surrounding text (instructions, explanations, feedback, navigation) is in the user's interface language. Explanations are available in all three interface languages, including "Explain simpler" ([PRODUCT.md](PRODUCT.md#approved-product-principles)).
- **Reading explanations are content, not interface strings:** each test has one explanation file per interface language (`apps/web/content/reading/<testId>.explanations.<locale>.json`, [ADR-0008](../architecture/decisions/0008-reading-answer-checking-and-explanations.md) §5), validated like the test. English words and quotes inside them are marked as English segments and rendered with `lang="en"`. Their review status (AI draft, reviewed, approved) is recorded in each file; the uz and ru drafts need the fluent-speaker review of rule 7 before beta.

## Rules (apply once UI code exists)

1. **No hard-coded user-facing strings in components.** Every interface string goes through the localization layer. Test content is data, not interface strings.
2. **Design for the longest language, not English.** Russian and Uzbek strings are often 20–40% longer than English. Buttons, tabs, and headings must wrap or adapt without truncating meaning. Do not use fixed-width containers sized to English text.
3. **No string concatenation for sentences.** Use full message templates with placeholders. Word order and plural rules differ between languages (Russian has several plural forms).
4. **Locale-aware formatting** for numbers, dates, and durations. Band scores always use IELTS notation (for example "6.5"), never a locale's decimal comma.
5. **Uzbek Latin orthography:** use the proper characters in oʻ and gʻ (U+02BB) and the tutuq belgisi ʼ (U+02BC), not ASCII apostrophes or backticks. Search and input matching should tolerate the ASCII variants that users type.
6. **Fonts must cover every script used:** Latin, U+02BB/U+02BC, and Cyrillic. Verify this before adopting any font (see [DESIGN_SYSTEM.md](../design/DESIGN_SYSTEM.md#typography)).
7. Plain-language rules ([UX_PRINCIPLES.md](UX_PRINCIPLES.md#6-plain-language)) and honest-feedback wording ([PRODUCT.md](PRODUCT.md#honest-feedback-non-negotiable)) apply in every language. Translations are reviewed by fluent speakers, not shipped raw from machine translation.

## Technical setup

- **Library:** next-intl (App Router, `next/root-params`), configured in `apps/web/src/i18n/routing.ts` (locales, default, prefix) and `apps/web/src/i18n/request.ts` (loads the catalog for the active locale).
- **Locales:** `uz` (Uzbek Latin), `ru`, `en`. Default `uz`.
- **Routing:** every page lives under `apps/web/src/app/[locale]/` and is served at `/uz/...`, `/ru/...`, `/en/...` (prefix always). `apps/web/src/proxy.ts` redirects `/` and unprefixed paths using the `NEXT_LOCALE` cookie, then `Accept-Language`, with `uz` as the fallback. `<html lang>` is set from the active locale in `app/[locale]/layout.tsx`.
- **Navigation helpers:** `apps/web/src/i18n/navigation.ts` (`createNavigation(routing)`) exports the locale-aware `Link` and `usePathname`. A `Link` with a `locale` prop switches the language and keeps the path.
- **Not-found and error pages** (spec: [USER_FLOWS.md](USER_FLOWS.md#page-not-found-and-unexpected-error)): unknown paths under a locale hit the catch-all `app/[locale]/(valid-locale)/(shell)/[...rest]/page.tsx` and render `app/[locale]/not-found.tsx` in that locale. `[locale]` also matches first segments that are not locales (`/api/...`, `/old-page.html`, which the proxy does not handle): `src/i18n/request.ts` then falls back to `uz`, and `app/[locale]/(valid-locale)/layout.tsx` calls `notFound()`, so they get the Uzbek not-found page. Every page belongs under `(valid-locale)`: pages with the app shell (header, skip link, main; `app/[locale]/Shell.tsx`) under its `(shell)` group, and the Reading test screen, which has its own test bar, under `reading/` (M4-13). The not-found and error pages render the shell themselves. `app/[locale]/error.tsx` handles page errors inside the shell; `app/global-error.tsx` handles errors in the shell itself, choosing the catalog from the URL's locale (otherwise `uz`).
- **Language switcher:** `apps/web/src/app/[locale]/LanguageSwitcher.tsx`, in the header (spec: [USER_FLOWS.md](USER_FLOWS.md#switching-the-interface-language)). A native `<details>` disclosure with plain links, so it also works without JavaScript. The choice persists in next-intl's `NEXT_LOCALE` cookie: the `Link` writes it on the client, and the proxy updates it on page requests. Client components (the switcher, the error boundary) get their messages from `NextIntlClientProvider`, which wraps the shell in the locale layout.
- **Catalogs:** one JSON file per locale in `apps/web/messages/` (`uz.json`, `ru.json`, `en.json`), nested by namespace (e.g. `app.name`). All three files must have the same keys.

## Future deterministic enforcement

Missing-key checks and hard-coded-string linting belong in tooling. See [QUALITY_GATES.md](../engineering/QUALITY_GATES.md#future-deterministic-enforcement).
