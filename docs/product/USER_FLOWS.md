# User Flows

Canonical owner of **flow specifications**: the step-by-step paths users take. This is where the 3-click rule from [UX_PRINCIPLES.md](UX_PRINCIPLES.md) gets checked.

**STATUS: DRAFT.** The core flows below record intent only. No screens are designed yet. The [shell flows](#shell-flows-m1) are detailed drafts awaiting owner approval. Do not treat any step as an approved screen design.

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

**DRAFT: awaiting owner approval.** Specs for the shared app shell (M1-04), the language switch (M1-05), and the not-found and error states (M1-06). They are not built yet. Nothing here is approved until the owner marks it Approved (task M1-03). Design values (type scale, breakpoints, focus style) are proposed separately in [DESIGN_SYSTEM.md](../design/DESIGN_SYSTEM.md). The copy each spec uses is in [Proposed interface copy](#proposed-interface-copy-m1).

### App shell (phone and desktop)

**DRAFT: awaiting owner approval.**

- **Goal:** every page has the same calm frame. The user sees where they are and can change the language, and the frame never competes with the page's own primary action.
- **Entry point:** any locale page (`/uz/...`, `/ru/...`, `/en/...`).
- **Primary action:** none of its own. The shell is the frame, and each page owns its one primary action. The header is visually quieter than any page's primary action (no red fill in the header).
- **What is always visible:**
  - A **header** with two items: the working product name (text, links to the home page of the current language) on the start side, and the [language switcher](#switching-the-interface-language) on the end side. Nothing else.
  - One **main** landmark holding the page content.
  - A **skip link** ("Skip to main content"), the first focusable element on every page. It is visually hidden until it receives keyboard focus.
  - No navigation menu, tab bar, or footer before M3, because there are no destinations to navigate to yet (progressive disclosure).
- **Phone (primary target, verify at 320 px):** header in one row, page gutter on both sides, content full width below it.
  ```
  ┌──────────────────────────────┐
  │ IELTS Prep        Oʻzbekcha ▾ │  header
  ├──────────────────────────────┤
  │ <page content>               │  main
  ```
- **Desktop:** the same header and items, spanning the window. Page content sits in a centered column of limited width (see open questions). It is not an enlarged phone layout, but before M3 there is no content that needs a different structure.
- **Steps:**
  1. Open any page → header and main content render. The shell needs no action (0 steps).
  2. Keyboard: press Tab → the skip link appears. Press Enter → focus moves to the start of the main content (1 activation).
- **Step count:** 0 to see the shell. 1 activation (Tab, then Enter) to skip to content. Tapping the product name reaches home in 1 action.
- **UX check:** 10-second rule: the header holds only two items, so the page's heading and primary action stay the focus. 3-click rule: not a primary product action. One primary action: the shell adds none.
- **Empty / error states:**
  - Missing page or unexpected error: see [Page not found and unexpected error](#page-not-found-and-unexpected-error). The header stays visible there, so the user can still change language or go home.
  - Without JavaScript: the header, the product-name link, and the skip link still work, because they are plain links.
  - Offline: the app shell's static files are cached, but pages are not. An offline page is out of scope while the offline scope is TBD ([ARCHITECTURE.md](../architecture/ARCHITECTURE.md)).
- **Languages checked:** not yet. To verify in M1-04 at 320 px with the longest strings: the product name with "Oʻzbekcha" (the longest language name) in one header row, and the Russian skip link (the longest skip-link text).
- **Open questions:**
  1. Does the header scroll away with the page or stay fixed at the top? Recommendation: scroll away. It leaves more height for content on phones. The Reading screens get their own layout in M4.
  2. Product name in the header: the name is TBD, and "IELTS Prep" is the working name. Recommendation: show the working name as bold text until a name and logo exist. No placeholder logo.
  3. Desktop content width: the page column needs a maximum width, and M1-02's list does not include one. Recommendation: one maximum width for text pages, set by the owner together with the M1-02 values.
  4. No navigation and no footer before M3: confirm. Navigation (for example a bottom tab bar) is decided with the M3 home screen.

### Switching the interface language

**DRAFT: awaiting owner approval.**

- **Goal:** the user reads the interface in Uzbek, Russian, or English, and the app remembers the choice.
- **Entry point:** the language switcher in the header, on any page.
- **Primary action:** choosing a language.
- **Proposed form:** a quiet button in the header that shows the current language's name (for example "Oʻzbekcha ▾"). It opens a short list of all three languages. Each language is named in its own language ("Oʻzbekcha", "Русский", "English") and marked with its own `lang` attribute, so screen readers pronounce it correctly. The order is fixed (uz, ru, en). The current language is marked visibly with more than color and announced as current. Each entry is a plain link to the same page in that language (a disclosure with links, not an app-style menu), so it also works without JavaScript.
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
- **Languages checked:** not yet. To verify in M1-05: the button with "Oʻzbekcha" fits the 320 px header, and the open list fits without horizontal scrolling.
- **Open questions:**
  1. Where does the switch live and what form does it take? Options: (a) a button in the header that opens the list (2 steps, recommended: it stays quiet and has room for full names); (b) three always-visible options in the header (1 step, but louder and tight at 320 px with full names); (c) a settings page (3+ steps, and no settings page exists yet).
  2. How are languages labeled? Recommendation: full names in their own language ("Oʻzbekcha", "Русский", "English"), not codes (UZ / RU / EN) and not flags (a flag is a country, not a language). The Uzbek name could also be "Oʻzbek tili" or "Oʻzbek".
  3. Uzbek Cyrillic is TBD ([LOCALIZATION.md](LOCALIZATION.md#languages)) and out of scope here. If it is approved later, the list gains a fourth entry.
  4. No language prompt on first open: confirm.

### Page not found and unexpected error

**DRAFT: awaiting owner approval.**

#### Page not found

- **Goal:** a user who follows a wrong or old link understands what happened and gets back into the app in one tap.
- **Entry point:** an address under a language that does not exist (e.g. `/uz/does-not-exist`). Today this shows Next.js's default English page.
- **Primary action:** "Go to home page".
- **Steps:**
  1. Open an address that does not exist → the page shows, inside the shell, in the address's language: the heading "Page not found", one sentence explaining why, and the "Go to home page" button. The response status is 404.
  2. Tap "Go to home page" → the home page of the same language opens.
- **Step count:** 1 to recover.
- **UX check:** 10-second rule: the heading says what happened and the only button says what to do. One primary action: only "Go to home page". The header's language switcher stays available.
- **Unknown address without a language** (e.g. `/does-not-exist`): today the app redirects it to the detected language (saved choice, then browser language, then Uzbek), which then shows the localized not-found page. Proposed: keep this.
- **Addresses the language redirect does not handle** (addresses with a file extension, e.g. `/old-page.html`, and addresses under `/api`): the language is unknown, so a localized page in the address's language is not possible. See open question 2.
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
- **Offline:** a failure because the connection dropped shows the same message. A dedicated offline message is out of scope (offline scope TBD).
- **Languages checked:** not yet. To verify in M1-06 at 320 px: the Russian button "Попробовать снова" and the Uzbek sentence fit without truncation.

#### Open questions

1. Unknown addresses without a language: keep today's redirect to the detected language followed by the localized not-found page (recommended), or answer 404 directly without a redirect?
2. Addresses the language redirect does not handle (file extensions, `/api`), and errors in the shell itself (where the page's catalog may not be available): which language should the fallback page use? Recommendation: the language in the address if there is one, otherwise Uzbek (the default language, as in the redirect fallback). The alternative, all three languages on one page, makes the page longer and gives it three equal "home" links.
3. Unexpected error: keep "Go to home page" as a quieter secondary link next to "Try again" (recommended, an exit when retrying keeps failing), or show "Try again" only?

### Proposed interface copy (M1)

**PROPOSED: awaiting owner approval.** Every string below is a proposal. The uz and ru translations need review by a fluent speaker before they ship ([LOCALIZATION.md](LOCALIZATION.md#rules-apply-once-ui-code-exists), rule 7). Uzbek is in Latin script with oʻ and gʻ written with U+02BB. None of these strings needs the tutuq belgisi (U+02BC). Catalog keys are suggestions for M1-04 to M1-06.

| Key (suggested) | Used in | en | ru | uz |
|---|---|---|---|---|
| `shell.skipToContent` | Skip link | Skip to main content | Перейти к основному содержанию | Asosiy mazmunga oʻtish |
| `languageSwitcher.label` | Accessible name of the switcher button. `{language}` is the current language's name. It starts with the button's visible text, as WCAG 2.5.3 requires. | {language}, change language | {language}, сменить язык | {language}, tilni oʻzgartirish |
| `languageSwitcher.listLabel` | Accessible name of the language list | Choose a language | Выберите язык | Tilni tanlang |
| `languageSwitcher.languages.uz` | Language name (same in all three catalogs, marked `lang="uz"`) | Oʻzbekcha | Oʻzbekcha | Oʻzbekcha |
| `languageSwitcher.languages.ru` | Language name (same in all three catalogs, marked `lang="ru"`) | Русский | Русский | Русский |
| `languageSwitcher.languages.en` | Language name (same in all three catalogs, marked `lang="en"`) | English | English | English |
| `notFound.title` | Not-found heading and page title | Page not found | Страница не найдена | Sahifa topilmadi |
| `notFound.body` | Not-found sentence | The link may be wrong, or the page may have moved. | Возможно, ссылка неверна или страница была перемещена. | Havola notoʻgʻri yoki sahifa koʻchirilgan boʻlishi mumkin. |
| `common.goHome` | Not-found button; secondary link on the error state | Go to home page | Перейти на главную | Bosh sahifaga oʻtish |
| `error.title` | Error heading | Something went wrong | Что-то пошло не так | Xatolik yuz berdi |
| `error.body` | Error sentence | Please try again. If it keeps happening, come back later. | Попробуйте ещё раз. Если ошибка повторится, зайдите позже. | Qaytadan urinib koʻring. Xatolik takrorlansa, keyinroq qayting. |
| `error.retry` | Error button | Try again | Попробовать снова | Qayta urinish |

The working product name (`app.name`, "IELTS Prep") is not new copy. The product name stays TBD.
