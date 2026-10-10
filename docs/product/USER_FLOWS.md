# User Flows

Canonical owner of **flow specifications**: the step-by-step paths users take. This is where the 3-click rule from [UX_PRINCIPLES.md](UX_PRINCIPLES.md) gets checked.

**STATUS: DRAFT.** The core flows below record intent only. No screens are designed yet. Do not treat any of their steps as an approved screen design. The [shell flows](#shell-flows-m1) are approved.

## Flow spec format

Write each flow in this format before implementing it:

```
### <Flow name>
Goal:            what the user is trying to achieve
Entry point:     where the flow starts
Primary action:  the one dominant action on each step
Steps:           numbered user actions (taps/inputs) → result
Step count:      N (must be ≤ 3 for primary actions, or give a justification)
Empty / error states: what happens with no data, offline, or on failure
Languages checked: uz / ru / en (longest-string layout verified)
Open questions:  anything unresolved
```

## Core flows (intent only)

### First open → first practice
Goal: a new user practices something useful within their first minute.
Intent: no tour, no feature overview. One clear starting action, either a short level check or a first practice. No mandatory registration before the user gets value. Personalization may ask for target band and exam date ([PRODUCT.md](PRODUCT.md#approved-product-principles)).

### Direct link → practice
Goal: a user arriving from a direct link (for example a Reading practice link) starts that practice immediately.
Intent: the link opens the practice itself, with minimal or no onboarding and no sign-up wall.

### Returning user → next action
Goal: the user continues without choosing from a library.
Intent: home shows one recommended next action. Browsing is secondary.

### Practice → understand mistakes
Goal: after practice, the user understands what they got wrong and why.
Intent: results lead straight into evidence-first mistake explanations (Reading: [READING_EXPERIENCE.md](READING_EXPERIENCE.md#review-practice-mode)). A score alone is not the end of the flow.

### Phone practice → desktop mock test
Goal: a user who practices on a phone can take a realistic test on a computer.
Intent: progress carries across devices. How the session moves between devices is TBD.

## Shell flows (M1)

**Approved** (owner, 2026-10-10, task M1-03). Specs for the shared app shell (M1-04), the language switch (M1-05), and the not-found and error states (M1-06). They are not built yet. Design values (type scale, breakpoints, focus style) are in [DESIGN_SYSTEM.md](../design/DESIGN_SYSTEM.md). The copy each spec uses is in [Interface copy](#interface-copy-m1).

### App shell (phone and desktop)

**Approved** (owner, 2026-10-10, task M1-03).

- **Goal:** every page has the same calm frame. The user sees where they are and can change the language, and the frame never competes with the page's own primary action.
- **Entry point:** any locale page (`/uz/...`, `/ru/...`, `/en/...`).
- **Primary action:** none of its own. The shell is the frame, and each page owns its one primary action. The header is visually quieter than any page's primary action (no red fill in the header).
- **What is always visible:**
  - A **header** with two items: the IELTS Prep logo from the brand kit (mark and wordmark, links to the home page of the current language) on the start side, and the [language switcher](#switching-the-interface-language) on the end side. Nothing else.
  - One **main** landmark holding the page content.
  - A **skip link** ("Skip to main content"), the first focusable element on every page. It is visually hidden until it receives keyboard focus.
  - No footer. No product navigation (menu, tab bar) until real destinations and screens exist for it (progressive disclosure).
- **Header position:** the header scrolls away with the page. It is not fixed to the top.
- **Phone (primary target, verify at 320 px):** header in one row, page gutter on both sides, content full width below it.
  ```
  ┌──────────────────────────────┐
  │ [mark] IELTS Prep        UZ ▾ │  header
  ├──────────────────────────────┤
  │ <page content>               │  main
  ```
- **Desktop:** the same header and items, spanning the window. Page content sits in a centered column with a maximum width of 1200 px (decided; [DESIGN_SYSTEM.md](../design/DESIGN_SYSTEM.md#responsive-behavior)). Feature-specific layouts, such as Reading Exam mode, may override it later. It is not an enlarged phone layout, but before M3 there is no content that needs a different structure.
- **Steps:**
  1. Open any page → header and main content render. The shell needs no action (0 steps).
  2. Keyboard: press Tab → the skip link appears. Press Enter → focus moves to the start of the main content (1 activation).
- **Step count:** 0 to see the shell. 1 activation (Tab, then Enter) to skip to content. Tapping the logo reaches home in 1 action.
- **UX check:** 10-second rule: the header holds only two items, so the page's heading and primary action stay the focus. 3-click rule: not a primary product action. One primary action: the shell adds none.
- **Empty / error states:**
  - Missing page or unexpected error: see [Page not found and unexpected error](#page-not-found-and-unexpected-error). The header stays visible there, so the user can still change language or go home.
  - Without JavaScript: the header, the logo link, and the skip link still work, because they are plain links.
  - Offline: the app shell's static files are cached, but pages are not. An offline page is out of scope while the offline scope is TBD ([ARCHITECTURE.md](../architecture/ARCHITECTURE.md)).
- **Languages checked:** not yet. To verify in M1-04 at 320 px with the longest strings: the logo and the switcher in one header row, and the Russian skip link (the longest skip-link text).
- **Decided (owner, 2026-10-10):**
  - The header scrolls away with the page.
  - Desktop content has a default maximum width of 1200 px. Feature-specific layouts, such as Reading Exam mode, may override it later.
  - The header shows the approved IELTS Prep logo from the brand kit, not plain text. On narrow phone widths a compact mark + wordmark variant is acceptable. Its accessible name is the product name from the catalog (`app.name`).
  - No footer. No product navigation until real destinations and screens exist for it.
- **Logo asset:** the brand kit (`IELTS_Prep_Brand_Kit.zip`, from the owner on 2026-10-10, kept outside the repository) has a horizontal lockup without tagline (`svg/logo-horizontal-no-tagline.svg`, text converted to paths, mark + wordmark). The header uses that variant: the other lockups carry the English-only tagline "Your Study Partner", which is not localized. It is about 3.9 times as wide as it is tall, so it fits the 320 px header next to the switcher; the kit has no separate compact variant. The logo's own colors (two red gradients) belong to the approved asset and are not tokens.

### Switching the interface language

**Approved** (owner, 2026-10-10, task M1-03).

- **Goal:** the user reads the interface in Uzbek, Russian, or English, and the app remembers the choice.
- **Entry point:** the language switcher in the header, on any page.
- **Primary action:** choosing a language.
- **Form:** a quiet button in the header that shows the current language's code (for example "UZ ▾"). It opens a short list of all three languages. Each language is named in its own language ("Oʻzbekcha", "Русский", "English") and marked with its own `lang` attribute, so screen readers pronounce it correctly. The order is fixed (uz, ru, en). The current language is marked visibly with more than color and announced as current. Each entry is a plain link to the same page in that language (a disclosure with links, not an app-style menu), so it also works without JavaScript.
- **Steps:**
  1. Tap the language button → the list of three languages opens. The current one is marked.
  2. Tap a language → the same page opens in that language (only the locale part of the address changes, e.g. `/uz/x` → `/ru/x`). The list closes. The choice is saved, so opening the app again (`/`) opens in that language.
- **Step count:** 2. Language is a setting, so the 3-click budget does not govern it, but the flow is within it.
- **UX check:** 10-second rule: the button shows a language name, which is self-explanatory in every interface language. One primary action: the button is visually quieter than the page's primary action.
- **Behavior details:**
  - Tapping the current language closes the list and does nothing else.
  - Escape, tapping outside, or tapping the button again closes the list. Focus returns to the button.
  - Keyboard: the button and every language are reachable with Tab and activated with Enter.
  - IELTS test content stays in English whatever the interface language ([LOCALIZATION.md](LOCALIZATION.md)).
  - First visit: no language prompt. The language comes from the saved choice, then the browser's language, then Uzbek (current behavior, [LOCALIZATION.md](LOCALIZATION.md#technical-setup)). The visible switcher corrects a wrong guess in 2 steps.
- **Empty / error states:**
  - Offline or a failed load: the browser cannot open the other language's page, and the current page stays as it is. A dedicated offline message is out of scope (offline scope TBD).
  - On a not-found page: switching keeps the address and shows the not-found page in the new language.
  - An error while loading the new page: the [unexpected error](#page-not-found-and-unexpected-error) state, in the new language.
- **Languages checked:** not yet. To verify in M1-05: the button fits the 320 px header, and the open list with "Oʻzbekcha" fits without horizontal scrolling.
- **Decided (owner, 2026-10-10):**
  - The switch is a button in the header that opens a list (2 steps).
  - The button may show the code (UZ / RU / EN). The list always shows full names: "Oʻzbekcha", "Русский", "English". No flags.
- **Note:** Uzbek Cyrillic is TBD ([LOCALIZATION.md](LOCALIZATION.md#languages)) and out of scope here. If it is approved later, the list gains a fourth entry.
  - No language prompt on first open. The language is detected automatically, and the switcher is always accessible.

### Page not found and unexpected error

**Approved** (owner, 2026-10-10, task M1-03).

#### Page not found

- **Goal:** a user who follows a wrong or old link understands what happened and gets back into the app in one tap.
- **Entry point:** an address under a language that does not exist (e.g. `/uz/does-not-exist`). Today this shows Next.js's default English page.
- **Primary action:** "Go to home page".
- **Steps:**
  1. Open an address that does not exist → the page shows, inside the shell, in the address's language: the heading "Page not found", one sentence explaining why, and the "Go to home page" button. The response status is 404.
  2. Tap "Go to home page" → the home page of the same language opens.
- **Step count:** 1 to recover.
- **UX check:** 10-second rule: the heading says what happened and the only button says what to do. One primary action: only "Go to home page". The header's language switcher stays available.
- **Unknown address without a language** (e.g. `/does-not-exist`): today the app redirects it to the detected language (saved choice, then browser language, then Uzbek), which then shows the localized not-found page. Decided: keep this.
- **Addresses outside language routing**: addresses under `/api` are not localized or redirected, and addresses with a file extension (e.g. `/old-page.html`) are not forced through language routing. They get the app's own root-level not-found page, never Next.js's default English page. Its language is the locale in the address when it is valid (e.g. `/ru/old-page.html` → Russian), otherwise Uzbek.
- **Languages checked:** not yet. To verify in M1-06 at 320 px: the Uzbek and Russian heading and sentence wrap without truncation.

#### Unexpected error

- **Goal:** when a page fails to load or crashes, the user is not blamed, sees no technical details, and can try again.
- **Entry point:** any page whose content fails to render.
- **Primary action:** "Try again".
- **Steps:**
  1. A page fails → the shell stays, and the main area shows, in the current language: the heading "Something went wrong", one sentence ("Please try again. If it keeps happening, come back later."), the "Try again" button, and a quieter "Go to home page" link.
  2. Tap "Try again" → the page tries to load again. If it succeeds, the content replaces the message. If it fails again, the same message shows again.
- **Step count:** 1 to retry. 1 to leave (home).
- **UX check:** 10-second rule: one heading, one sentence, one button. One primary action: "Try again" is the only button; "Go to home page" is a quieter link.
- **Rules:** no error codes, stack traces, or technical messages on screen. Error reporting and monitoring are out of scope (M10). When they are added, they follow [INVARIANTS.md](../architecture/INVARIANTS.md) (no personal data in logs).
- **Errors in the shell itself**: a shell-level error boundary catches errors in the shell (the locale layout), where the header cannot render. It shows the same heading, sentence, and "Try again" without the header, and never Next.js's default page. Its language is the locale in the address when it is valid, otherwise Uzbek.
- **Offline:** a failure because the connection dropped shows the same message. A dedicated offline message is out of scope (offline scope TBD).
- **Languages checked:** not yet. To verify in M1-06 at 320 px: the Russian button "Попробовать снова" and the Uzbek sentence fit without truncation.

#### Decided (owner, 2026-10-10)

- Fallback language for pages outside the localized shell (root-level not-found and error pages, the shell-level error boundary): the locale in the address when it is valid, otherwise Uzbek.
- `/api` is not localized or redirected. Addresses with a file extension are not forced through language routing. Both get the root-level fallback instead of Next.js's default English page.
- Unknown addresses without a language and without a file extension (e.g. `/does-not-exist`) keep today's behavior: detect the language, redirect to the localized address, show the translated not-found page.
- Unexpected error: "Try again" is the primary action, and "Go to home page" stays as a quieter secondary link.

### Interface copy (M1)

**Approved for M1** (owner, 2026-10-10, task M1-03). A fluent-speaker review of the uz and ru strings is required before beta ([LOCALIZATION.md](LOCALIZATION.md#rules-apply-once-ui-code-exists), rule 7). It does not block M1. Uzbek is in Latin script with oʻ and gʻ written with U+02BB. None of these strings needs the tutuq belgisi (U+02BC). Catalog keys are suggestions for M1-04 to M1-06. The root-level fallback pages reuse the `notFound`, `error`, and `common` strings of their language, so they need no new copy.

| Key (suggested) | Used in | en | ru | uz |
|---|---|---|---|---|
| `shell.skipToContent` | Skip link | Skip to main content | Перейти к основному содержанию | Asosiy mazmunga oʻtish |
| `languageSwitcher.code` | Switcher button text: the current language's code | EN | RU | UZ |
| `languageSwitcher.label` | Accessible name of the switcher button. `{code}` is the button's visible text and `{language}` the current language's full name. It starts with the visible text, as WCAG 2.5.3 requires. | {code} ({language}), change language | {code} ({language}), сменить язык | {code} ({language}), tilni oʻzgartirish |
| `languageSwitcher.listLabel` | Accessible name of the language list | Choose a language | Выберите язык | Tilni tanlang |
| `languageSwitcher.languages.uz` | Language name in the list (same in all three catalogs, marked `lang="uz"`) | Oʻzbekcha | Oʻzbekcha | Oʻzbekcha |
| `languageSwitcher.languages.ru` | Language name in the list (same in all three catalogs, marked `lang="ru"`) | Русский | Русский | Русский |
| `languageSwitcher.languages.en` | Language name in the list (same in all three catalogs, marked `lang="en"`) | English | English | English |
| `notFound.title` | Not-found heading and page title | Page not found | Страница не найдена | Sahifa topilmadi |
| `notFound.body` | Not-found sentence | The link may be wrong, or the page may have moved. | Возможно, ссылка неверна или страница была перемещена. | Havola notoʻgʻri yoki sahifa koʻchirilgan boʻlishi mumkin. |
| `common.goHome` | Not-found button; secondary link on the error state | Go to home page | Перейти на главную | Bosh sahifaga oʻtish |
| `error.title` | Error heading | Something went wrong | Что-то пошло не так | Xatolik yuz berdi |
| `error.body` | Error sentence | Please try again. If it keeps happening, come back later. | Попробуйте ещё раз. Если ошибка повторится, зайдите позже. | Qaytadan urinib koʻring. Xatolik takrorlansa, keyinroq qayting. |
| `error.retry` | Error button | Try again | Попробовать снова | Qayta urinish |

The working product name (`app.name`, "IELTS Prep") is not new copy. It is the logo's accessible name. The product name stays TBD (the brand kit also calls it a working name and notes the IELTS trademark).
