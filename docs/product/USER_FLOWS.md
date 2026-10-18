# User Flows

Canonical owner of **flow specifications**: the step-by-step paths users take. This is where the 3-click rule from [UX_PRINCIPLES.md](UX_PRINCIPLES.md) gets checked.

**STATUS: DRAFT.** The core flows below record intent only. No screens are designed yet. Do not treat any of their steps as an approved screen design. The [shell flows](#shell-flows-m1) are approved. The [onboarding and home flows](#onboarding-and-home-flows-m3) are approved.

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
Refined for M3 (approved): [First open → onboarding → level-check invitation](#first-open--onboarding--level-check-invitation).

### Direct link → practice
Goal: a user arriving from a direct link (for example a Reading practice link) starts that practice immediately.
Intent: the link opens the practice itself, with minimal or no onboarding and no sign-up wall.
Refined for M3 (approved): [Direct link → practice bypasses onboarding](#direct-link--practice-bypasses-onboarding).

### Returning user → next action
Goal: the user continues without choosing from a library.
Intent: home shows one recommended next action. Browsing is secondary.
Refined for M3 (approved): [Returning user → home](#returning-user--home).

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
- **Rules:** no error codes, stack traces, or technical messages on screen. Error reporting and monitoring are out of scope (M14, formerly M10). When they are added, they follow [INVARIANTS.md](../architecture/INVARIANTS.md) (no personal data in logs).
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

## Onboarding and home flows (M3)

**Approved** (owner, 2026-10-10, task M3-05; drafted in M3-01). Specs for onboarding (M3-07), home (M3-08), the level-check destination (M3-09), and the rule that direct links bypass onboarding. Visual values are in [DESIGN_SYSTEM.md](../design/DESIGN_SYSTEM.md#m3-components-onboarding-and-home). Where answers are stored is decided in [ADR-0003](../architecture/decisions/0003-guest-state-on-the-device.md) (a server-managed cookie); these specs only say that answers are kept **on this device**. The copy each spec uses is in [Interface copy (M3)](#interface-copy-m3).

**Owner decisions these specs implement (2026-10-10):**
- No mandatory registration before value. The first flow is extremely short: (1) Academic / General Training / Don't know, (2) target band 6.0 / 6.5 / 7.0 / 7.5 / 8+ / Don't know, (3) an invitation to start a diagnostic.
- Never asked: name, age, occupation, country, motivation, self-rated level. (Exam date is also not asked in M3. [PRODUCT.md](PRODUCT.md#approved-product-principles) allows it, but it is not one of the owner's three steps.)
- Direct links to practice may bypass onboarding.
- Home answers "What should I do now to improve IELTS?": one dominant CTA, the target band, the current estimate only when real data exists, Today's Practice / the recommended next action, Continue previous activity when relevant, a small progress preview only, no dashboard of cards, the approved white + red design.
- Guest-first: usable before an account, persistence that fits the current architecture, no auth.

**Plain-language name for the diagnostic:** the interface calls it the **level check** ("Find your level", per [UX_PRINCIPLES.md](UX_PRINCIPLES.md#6-plain-language)). "Diagnostic" stays an internal word. The level check itself (questions, length, how it produces an estimate) is **not designed**. It is a blocking decision in [ROADMAP.md](../execution/ROADMAP.md), and Reading practice arrives in M4. See [open question 1](#open-questions-m3).

### First open → onboarding → level-check invitation

**Approved** (owner, 2026-10-10, task M3-05).

- **Goal:** a new user tells us which IELTS they are taking and the band they need, and is invited to find their level, in three taps and well under a minute.
- **Entry point:** the home page (`/{locale}`) opened by someone with no saved answers on this device: directly, from the installed app icon, or after `/` redirects to a language. Onboarding is triggered **only** from home ([Direct link → practice](#direct-link--practice-bypasses-onboarding)).
- **Addresses:** each step has its own address under the language (e.g. `/uz/start/exam`, `/uz/start/band`, `/uz/start/level-check`). Home sends a user without saved answers to the first unanswered step. Because steps are separate pages, the phone's back gesture and the browser's back button go to the previous step, and switching the interface language on a step keeps the step (only the language part of the address changes, as in [Switching the interface language](#switching-the-interface-language)).
- **Primary action:** on steps 1 and 2 the answers themselves (tapping one is the action; there is no separate Continue button and no red button). On step 3, "Start the level check".
- **Steps:**
  1. **Exam type.** The page shows "Step 1 of 3", the question "Which IELTS are you taking?", the line "You can change this later.", and three answers: **Academic**, **General Training**, **I don't know yet**. Tap an answer → it is saved on this device and step 2 opens.
  2. **Target band.** "Step 2 of 3", the question "Which band score do you need?", the same "You can change this later." line, and six answers: **6.0**, **6.5**, **7.0**, **7.5**, **8+** (announced as "8 or higher"), **I don't know yet**. Tap an answer → it is saved and step 3 opens.
  3. **Level-check invitation.** "Step 3 of 3", the heading "Find your level", one sentence ("A short level check shows where you are now and what to practice first."), the primary button "Start the level check", and below it a quieter "Not now" link. Tap "Start the level check" → the level check's address ([open question 1](#open-questions-m3)). Tap "Not now" → home.
- **Step count:** 3 actions from first open to starting the level check (2 answers + 1 tap). 3 actions to reach home with a saved goal instead (2 answers + "Not now").
- **Answering rules:**
  - One tap answers. Each answer is a button, not a radio button, because a radio group that advances on selection would jump ahead as soon as a keyboard user moves with the arrow keys. Keyboard: Tab to an answer, Enter or Space answers.
  - "I don't know yet" is a full answer, not an error, and it is the way to skip a question. There is no separate Skip control.
  - Going back to a step shows the earlier answer marked as chosen (a check mark and the text "Selected" for screen readers, never color alone). Tapping any answer, including the same one, saves it and moves on.
  - There is no Back button inside the page. The device's back works. The header logo leads to home, which sends the user to the first unanswered step.
- **What is saved, and when:** each answer is saved on this device the moment it is tapped. Onboarding counts as **complete once step 2 is answered**. Step 3 is an invitation, not a question. A user who leaves after step 1 continues at step 2 next time. After step 2, home opens on later visits and onboarding is not shown again (the user can change the answers from home).
- **Layout at 360 px:** inside the shell, top to bottom: the step indicator (small meta text, with a slim progress bar if M3-02 approves one), the question as the page's H1, the "You can change this later." line, then the answers as a vertical list of full-width answer buttons (each at least 48 px high). On step 2, the five band values may sit in a compact grid of equal buttons with "I don't know yet" full width below; M3-02 proposes the arrangement. (Onboarding art direction, owner 2026-10-12: step 1 shows the two exam types as path tiles and step 2 the band values in one row, each with "I don't know yet" as a quieter row below; visual values in DESIGN_SYSTEM.md.) Nothing else: no illustration, no hero, no explanation of the product. Step 3: indicator, H1, the sentence, the full-width red primary button, and the "Not now" link under it.
- **Layout on desktop:** the same single column, centered, at a comfortable reading width rather than the full 1200 px content width (the width is a M3-02 proposal). No second column.
- **UX check:** 10-second rule: each step is one question with its answers directly below it. One primary action: steps 1 and 2 have no competing button, and step 3 has one red button with a quieter link. No carousel, tour or coach marks ([UI_ANTI_PATTERNS.md](../design/UI_ANTI_PATTERNS.md)). 3-click rule: 3.
- **Empty / error states:**
  - **Answers cannot be saved** (for example storage is blocked in a private window): the flow still moves forward to step 3 and to home. The user is never sent back into onboarding in a loop during the same visit. On the next visit, onboarding starts again. How this is detected depends on ADR-0003.
  - **A saved value is unreadable** (old format, edited, corrupted): it counts as not answered, and onboarding resumes at that step. Never an error page.
  - **Offline, or a page fails to load:** the existing [unexpected error](#page-not-found-and-unexpected-error) state. A dedicated offline experience is out of scope (offline scope TBD).
  - **Without JavaScript:** the steps should still work, like the language switcher (answers as plain links or forms). Whether this is possible depends on the storage chosen in ADR-0003.
- **Accessibility:** the question is the page's H1 and labels the group of answers. The step indicator is text. After each answer, the next step is a new page with its question as the first heading. Answer buttons meet the 44 px minimum (48 px preferred, [ACCESSIBILITY.md](../design/ACCESSIBILITY.md)). "8+" has the accessible name "8 or higher".
- **Languages checked:** not yet. To verify in M3-07 at 320 px: the Russian question "Какой IELTS вы сдаёте?", the Uzbek invitation sentence, and "General Training" fit without truncation.
- **Open questions:** [1, 2 and 4 below](#open-questions-m3).

### Returning user → home

**Approved** (owner, 2026-10-10, task M3-05).

- **Goal:** the user opens the app and knows within seconds what to do now to improve their IELTS, and does it in one tap.
- **Entry point:** the home page (`/{locale}`) for a user whose onboarding is complete on this device. Also the header logo from any page.
- **Primary action:** the **next action**: one red button. In M3 it is always "Start the level check".
- **Sections, in priority order (top to bottom):**
  1. **Your next step** (the page's H1) with the **next action** directly under it: its title as an H2, one sentence saying why, and the one red button. This block is "Today's Practice / the recommended next action". When an unfinished activity exists (from M4 on), **continuing it is the next action**, so "Continue previous activity" takes this place and this button rather than adding a second loud button. One primary action, always.
  2. **Your goal:** a quiet line with the target band and the exam type, e.g. "Target band: 7.0 · Academic", and a "Change goal" link. If the target band is "I don't know yet": "Target band: not set yet". If the exam type is "I don't know yet", the exam type is simply left out. "Change goal" opens onboarding step 1 with the current answers marked, so changing the goal reuses the same two questions and ends like onboarding (step 3, then home).
  3. **Current estimate**, only when a real estimate exists (from the level check or practice results, M4 or later): shown on the goal line, e.g. "Estimated band: 6.0–6.5 · Target band: 7.0". Always labeled "Estimated band", a range when certainty does not support one band, never finer than half bands, and never as an official result ([PRODUCT.md](PRODUCT.md#honest-feedback-non-negotiable)). **Not shown in M3** (no data).
  4. **Small progress preview**, only when there is practice history: one short line, no chart, no tiles (for example how many practices this week). "Your progress" itself belongs to M11 (formerly M8). **Not shown in M3** (no data).
- **What M3 renders:** sections 1 and 2 only. Sections without data are not rendered at all: no empty placeholders, no "0 practices", no "coming soon" tiles.
- **Steps:**
  1. Open the app → home shows "Your next step", the level check with its red button, and the goal line.
  2. Tap "Start the level check" → the level check's address ([open question 1](#open-questions-m3)).
- **Step count:** 1 action from home to the next action. "Change goal": 1 action to open it, then 2 answers.
- **Next-action rules (M3):** these are the rules a pure domain function implements and tests (M3-08).
  - **Rule 1:** with no practice history on this device, the next action is the level check, whatever the exam type and target band.
  - Rules that use history (continue an unfinished practice, what to practice after the level check, how the target band changes the recommendation) are added by the milestones that create the data (M4 onward), each approved then. The exam type and target band are stored now so those rules can use them later. Whether General Training content exists at launch is still an open question in [PRODUCT.md](PRODUCT.md#open-questions); choosing it changes nothing in M3.
- **Layout at 360 px:** H1 "Your next step"; the next-action block (H2 "Find your level", the sentence, the full-width red button); spacing; the goal line in body text with "Change goal" as a link. That is the whole page in M3: the action is above the fold with room to spare. Whether the next-action block sits on a soft surface or is plain is a M3-02 proposal (a card only if it is one distinct unit, [UI_ANTI_PATTERNS.md](../design/UI_ANTI_PATTERNS.md)).
- **Layout on desktop:** the same single column at the M3-02 reading width, centered. No sidebar, no tiles.
- **UX check:** 10-second rule: cover the goal line and the H1 plus the red button still tell the user what to do. One primary action: one red button; "Change goal" is a link. Progressive disclosure: estimate and progress appear only when they mean something. No dashboard of cards.
- **Empty / error states:**
  - **No saved answers** (first visit, cleared browser data, unreadable value): home sends the user into onboarding at the first unanswered step.
  - **Answers could not be saved** during this visit: home still shows the next action, with "Target band: not set yet" ([onboarding error states](#first-open--onboarding--level-check-invitation)).
  - **Offline, or the page fails to load:** the existing [unexpected error](#page-not-found-and-unexpected-error) state.
- **Languages checked:** not yet. To verify in M3-08 at 320 px: the Russian goal line "Целевой балл: 7.0 · General Training" and the Uzbek button "Daraja tekshiruvini boshlash" fit without truncation.
- **Open questions:** [1 and 3 below](#open-questions-m3).

### Direct link → practice bypasses onboarding

**Approved** (owner, 2026-10-10, task M3-05).

- **Goal:** someone who follows a link to a specific practice starts it immediately ([PRODUCT.md](PRODUCT.md#approved-product-principles): direct entry paths).
- **Rule:** onboarding is triggered **only** by opening home without saved answers. No other page redirects to onboarding, asks the onboarding questions, or waits for them. Practice pages do not exist until M4; M4 keeps this rule, and its e2e tests check it.
- **Afterwards:** when that user later opens home, onboarding appears once, as for any user without saved answers. Whether a direct-link user is ever invited to set a goal elsewhere (for example after their first practice) is decided with the practice flow in M4, not here.
- **Step count:** 0 onboarding actions before the linked page.
- **Languages:** a direct link carries its language in the address, as today.

### Open questions (M3)

**Decided (owner, 2026-10-10, task M3-05):**
1. "Start the level check" leads to the level check's future address with an honest "being prepared" state (option a). The address stays when the real level check replaces it.
2. The target band answers stay exactly as decided: 6.0 / 6.5 / 7.0 / 7.5 / 8+ / I don't know yet.
3. Home shows the IELTS type on the goal line.
4. "Not now" stays on onboarding step 3. It takes the user to home without starting the level check.
5. "Academic" and "General Training" stay in English in all locales for now.

The questions as they were put to the owner, with the options considered:

1. **Where does "Start the level check" lead in M3?** The level check is not designed (questions, length, scoring), and Reading practice arrives in M4.
   - (a) An honest interim page at the level check's future address (e.g. `/{locale}/level-check`): "The level check is being prepared", one sentence, and "Go to home page". The address stays when the real level check replaces it.
   - (b) Hide or disable the button until the level check exists. Home and step 3 would then have no primary action, which breaks UX rule 3.
   - (c) Make the first Reading practice (M4) serve as the level check, and defer the button's destination to M4 (the button would need (a) until then anyway).
   - **Recommendation: (a).** There are no real users before beta, the page is honest, and nothing about it needs undoing later. The level-check design itself stays a separate decision.
2. **Band values below 6.0.** The owner's list starts at 6.0. Some users need 5.5 (for some colleges or visas). Options: (a) keep the list as decided; such users choose "I don't know yet" or 6.0; (b) add 5.5. **Recommendation: (a)**, as decided, and revisit if real users ask.
3. **Show the exam type on home?** Proposed: yes, after the target band on the goal line ("Target band: 7.0 · Academic"), so the user sees what we will tailor practice to. Option: show the target band only. **Recommendation: show it** (one word, no extra element).
4. **"Not now" on step 3.** Proposed: yes, a quiet link to home, so starting the level check is never forced (value before registration, no pressure). Option: no link (the user can still use the header logo). **Recommendation: keep "Not now".**

### Interface copy (M3)

**Approved for implementation** (owner, 2026-10-10, task M3-05; proposed in M3-01). A fluent-speaker review of the uz and ru strings is still required before beta ([LOCALIZATION.md](LOCALIZATION.md#rules-apply-once-ui-code-exists), rule 7). Uzbek is in Latin script with oʻ and gʻ written with U+02BB; none of these strings needs the tutuq belgisi (U+02BC). Band values use IELTS notation in every language ("6.5", never "6,5"). Catalog keys are suggestions for M3-07 to M3-09. Strings shared by onboarding step 3 and home live under `levelCheck`.

| Key (suggested) | Used in | en | ru | uz |
|---|---|---|---|---|
| `onboarding.step` | Step indicator. `{current}` and `{total}` are numbers | Step {current} of {total} | Шаг {current} из {total} | Qadam {current}/{total} |
| `onboarding.changeLater` | Line under the question on steps 1 and 2 | You can change this later. | Это можно изменить позже. | Buni keyinroq oʻzgartirish mumkin. |
| `onboarding.selected` | Screen-reader text on the earlier answer when returning to a step | Selected | Выбрано | Tanlangan |
| `onboarding.examType.title` | Step 1 question (H1 and page title) | Which IELTS are you taking? | Какой IELTS вы сдаёте? | Qaysi IELTS topshirasiz? |
| `examType.academic` | Step 1 answer; goal line on home. The official module name, kept in English in every language (see note) | Academic | Academic | Academic |
| `examType.general` | Step 1 answer; goal line on home (same note) | General Training | General Training | General Training |
| `onboarding.dontKnow` | The "don't know" answer on steps 1 and 2 | I don't know yet | Пока не знаю | Hali bilmayman |
| `onboarding.targetBand.title` | Step 2 question (H1 and page title) | Which band score do you need? | Какой балл вам нужен? | Sizga qaysi ball kerak? |
| `targetBand.eightPlusLabel` | Accessible name of the "8+" answer (the visible text is "8+" in every language) | 8 or higher | 8 или выше | 8 va undan yuqori |
| `levelCheck.title` | Step 3 heading (H1); home next-action heading (H2) | Find your level | Узнайте свой уровень | Darajangizni aniqlang |
| `levelCheck.body` | Step 3 sentence; home next-action sentence | A short level check shows where you are now and what to practice first. | Короткая проверка уровня покажет, где вы сейчас и что тренировать в первую очередь. | Qisqa daraja tekshiruvi hozirgi darajangizni va avval nimani mashq qilish kerakligini koʻrsatadi. |
| `levelCheck.start` | The red button on step 3 and home | Start the level check | Начать проверку уровня | Daraja tekshiruvini boshlash |
| `onboarding.notNow` | Quiet link under the step 3 button | Not now | Не сейчас | Hozir emas |
| `home.title` | Home H1 and page title | Your next step | Ваш следующий шаг | Keyingi qadamingiz |
| `home.goal.targetBand` | Goal line. `{band}` is the band in IELTS notation; `<b>` marks it bold (markup only, M3-08) | Target band: <b>{band}</b> | Целевой балл: <b>{band}</b> | Maqsadli ball: <b>{band}</b> |
| `home.goal.targetBandNotSet` | Goal line when the band is "I don't know yet" | Target band: not set yet | Целевой балл: пока не выбран | Maqsadli ball: hali tanlanmagan |
| `home.goal.change` | Link on the goal line | Change goal | Изменить цель | Maqsadni oʻzgartirish |
| `levelCheck.comingSoon.title` | The interim level-check page's H1 and page title (open question 1, decided: a) | The level check is being prepared | Проверка уровня готовится | Daraja tekshiruvi tayyorlanmoqda |
| `levelCheck.comingSoon.body` | The interim level-check page's sentence | It will be available here soon. Your goal is saved on this device. | Скоро она будет доступна здесь. Ваша цель сохранена на этом устройстве. | Tez orada shu yerda paydo boʻladi. Maqsadingiz shu qurilmada saqlangan. |

- The interim page's button reuses `common.goHome` ("Go to home page"). The band values (6.0, 6.5, 7.0, 7.5, 8+) are not translated.
- **Note on module names:** "Academic" and "General Training" are the names candidates see when they register. They stay in English in all three languages for now (owner, 2026-10-10). Alternatives for the fluent review: ru "Академический" / "Общий (General Training)", uz "Akademik" / "Umumiy (General Training)".
- The "Estimated band" wording for section 3 of home is not needed until an estimate exists (M4 or later). It will follow [PRODUCT.md](PRODUCT.md#honest-feedback-non-negotiable) in all three languages.

## Reading flows (M4)

**Approved** (owner, 2026-10-10, task M4-09; drafted in M4-02). The screen they run on is specified in [READING_EXPERIENCE.md, Mobile reading screen (M4)](READING_EXPERIENCE.md#mobile-reading-screen-m4); modes in [Practice and Exam Mode (M4)](READING_EXPERIENCE.md#practice-and-exam-mode-m4).

### Open a Reading test
- **Goal:** start reading and answering at once.
- **Entry point:** the test's direct link `/{locale}/reading/{testId}` (open question 3 of M4-02). The link may carry the mode (M4-04).
- **Steps:** 1. Open the link → the test's start screen (its title, the mode, the time, one red "Start" button; M4-04). 2. Tap "Start" → the reading screen with question 1 in the partial sheet and the timer running if the mode has one.
- **Step count:** 2.
- **Empty / error states:** unknown test → the localized not-found page; offline → the M1 error state.

### Answer and move between questions
- **Steps:** 1. Answer in the sheet (one tap, or typing). 2. "Next" (or a number in the navigator: "All questions", then the number).
- **Step count:** 2 per question; any question is 2 actions away through the navigator.

### Finish a test
- **Steps:** 1. "Finish test" (on question 40 or at the end of the navigator) → a confirmation in the expanded sheet: "Finish the test?", the number of unanswered questions if any, the red "Finish" and a quiet "Keep working". 2. "Finish" → the finished state (M4-04).
- **Step count:** 2. In Exam Mode, time-out finishes without the confirmation (M4-04).

### Leave and come back
- **Goal:** nothing is lost when the phone locks, the tab closes, or the user taps "Exit".
- **Steps:** opening the same test link again → the reading screen exactly where the user left it: same question, answers, flags, highlights and pins, sheet state, passage positions (kept on the device, ADR-0006). In Exam Mode the timer has kept running in the meantime (M4-04).
- **"Exit":** returns to home. In Exam Mode it first asks "Leave the test? The time keeps running." (M4-04).
- **Step count:** 1 to resume.

## Interface copy (M4)

**Approved for implementation** (owner, 2026-10-10, task M4-09; proposed in M4-01 to M4-04). Interface strings only: test content (passages, questions, instructions, TRUE/FALSE/NOT GIVEN, option texts) stays in English and comes from the content, not from the catalogs. A fluent-speaker review of the uz and ru strings is still required before beta. Uzbek uses U+02BB for oʻ and gʻ. Keys are suggestions for M4-13 to M4-21.

| Key (suggested) | Used in | en | ru | uz |
|---|---|---|---|---|
| `reading.answer.clear` | Quiet action under a "choose one" question once answered (M4-01) | Clear answer | Очистить ответ | Javobni tozalash |
| `reading.answer.choose` | Answer button of a "choose from a list" question when empty (M4-01) | Choose an answer | Выберите ответ | Javobni tanlang |
| `reading.answer.chosenCount` | Count under a "choose several" instruction (M4-01) | {count} of {total} chosen | Выбрано {count} из {total} | {total} tadan {count} tasi tanlandi |
| `reading.answer.chosenFor` | Marker on an option chosen for another question; `{question}` is its number or label (M4-01) | Chosen for {question} | Выбрано для {question} | {question} uchun tanlangan |
| `reading.answer.label` | Label of a typed-answer field (M4-01) | Answer {number} | Ответ {number} | {number}-javob |
| `reading.answer.selected` | Screen-reader text on a chosen option row, where the native control does not already announce it (M4-01) | Selected | Выбрано | Tanlangan |
| `reading.skipToQuestion` | Skip link on the test screen (M4-02) | Skip to the question | Перейти к вопросу | Savolga oʻtish |
| `reading.exit` | Test bar (M4-02) | Exit | Выйти | Chiqish |
| `reading.passageOf` | Test bar: the current passage (M4-02) | Passage {number} of {total} | Текст {number} из {total} | {total} tadan {number}-matn |
| `reading.sheet.label` | Accessible name of the question sheet region (M4-02) | Questions | Вопросы | Savollar |
| `reading.sheet.show` | Sheet handle when collapsed (M4-02) | Show question | Показать вопрос | Savolni koʻrsatish |
| `reading.sheet.hide` | Sheet handle when partial (M4-02) | Hide question | Скрыть вопрос | Savolni yashirish |
| `reading.sheet.back` | Closes an option list or the navigator in the expanded sheet (M4-02) | Back | Назад | Orqaga |
| `reading.question.of` | Sheet header (M4-02) | Question {number} of {total} | Вопрос {number} из {total} | {total} tadan {number}-savol |
| `reading.question.range` | Sheet header for a "choose several" item (M4-02) | Questions {from}–{to} | Вопросы {from}–{to} | {from}–{to}-savollar |
| `reading.question.previous` | Sheet footer (M4-02) | Previous | Предыдущий | Oldingi |
| `reading.question.next` | Sheet footer (M4-02) | Next | Следующий | Keyingi |
| `reading.flag.add` | Flag toggle when off (M4-02) | Mark for review | Отметить для проверки | Tekshirish uchun belgilash |
| `reading.flag.remove` | Flag toggle when on (M4-02) | Remove mark | Снять отметку | Belgini olib tashlash |
| `reading.navigator.open` | Sheet header button and the navigator heading (M4-02) | All questions | Все вопросы | Barcha savollar |
| `reading.navigator.passage` | Navigator group heading (M4-02) | Passage {number} | Текст {number} | {number}-matn |
| `reading.navigator.item` | Accessible name of a navigator button; `{states}` joins the state words below (M4-02) | Question {number}, {states} | Вопрос {number}, {states} | {number}-savol, {states} |
| `reading.navigator.answered` | State word (M4-02) | answered | есть ответ | javob berilgan |
| `reading.navigator.unanswered` | State word (M4-02) | no answer | нет ответа | javob yoʻq |
| `reading.navigator.flagged` | State word (M4-02) | marked for review | отмечен для проверки | tekshirish uchun belgilangan |
| `reading.navigator.current` | State word (M4-02) | current | текущий | joriy |
| `reading.finish.button` | Last question and navigator; the screen's red action (M4-02) | Finish test | Завершить тест | Testni yakunlash |
| `reading.finish.title` | Finish confirmation heading (M4-02) | Finish the test? | Завершить тест? | Test yakunlansinmi? |
| `reading.finish.unanswered` | Finish confirmation; ICU plural (M4-02) | {count, plural, one {# question has no answer.} other {# questions have no answer.}} | {count, plural, one {# вопрос без ответа.} few {# вопроса без ответа.} many {# вопросов без ответа.} other {# вопроса без ответа.}} | {count} ta savolga javob berilmagan. |
| `reading.finish.confirm` | Finish confirmation, red (M4-02) | Finish | Завершить | Yakunlash |
| `reading.finish.cancel` | Finish confirmation, quiet (M4-02) | Keep working | Продолжить | Davom etish |
| `reading.timer.label` | Accessible name of the timer (M4-02) | Time left: {time} | Осталось времени: {time} | Qolgan vaqt: {time} |
| `reading.timer.warning` | Live announcement at 10 and 5 minutes; ICU plural (M4-02) | {minutes, plural, one {# minute left} other {# minutes left}} | {minutes, plural, one {Осталась # минута} few {Осталось # минуты} many {Осталось # минут} other {Осталось # минуты}} | {minutes} daqiqa qoldi |
| `reading.storage.unavailable` | Notice when answers cannot be kept (M4-02) | Your answers can't be saved on this device. Don't close this page. | Ответы не сохраняются на этом устройстве. Не закрывайте страницу. | Javoblar bu qurilmada saqlanmaydi. Sahifani yopmang. |
| `reading.passage.label` | Accessible name and hint of the passage when focused (M4-03) | Passage. Use the arrow keys to move between sentences, Enter for actions. | Текст. Стрелки — переход между предложениями, Enter — действия. | Matn. Gaplar orasida oʻtish uchun strelkalar, amallar uchun Enter. |
| `reading.mark.actions` | Accessible name of the sentence action bar (M4-03) | Sentence actions | Действия с предложением | Gap bilan amallar |
| `reading.mark.highlight` | Action bar (M4-03) | Highlight | Выделить | Ajratib koʻrsatish |
| `reading.mark.removeHighlight` | Action bar on a highlighted sentence (M4-03) | Remove highlight | Снять выделение | Ajratishni olib tashlash |
| `reading.mark.pin` | Action bar (M4-03) | Pin to question {number} | Закрепить за вопросом {number} | {number}-savolga biriktirish |
| `reading.mark.unpin` | Action bar on a sentence pinned to the current question (M4-03) | Unpin from question {number} | Открепить от вопроса {number} | {number}-savoldan ajratish |
| `reading.mark.cancel` | Action bar (M4-03) | Cancel | Отмена | Bekor qilish |
| `reading.mark.highlighted` | Polite announcement (M4-03) | Highlighted | Выделено | Ajratib koʻrsatildi |
| `reading.mark.pinned` | Polite announcement (M4-03) | Pinned to question {number} | Закреплено за вопросом {number} | {number}-savolga biriktirildi |
| `reading.evidence.title` | Sheet block heading (M4-03) | Your evidence | Ваше обоснование | Sizning dalilingiz |
| `reading.evidence.paragraph` | Label of a pinned quote (M4-03) | Paragraph {letter} | Абзац {letter} | {letter} xatboshi |
| `reading.evidence.show` | Pinned quote action (M4-03) | Show in passage | Показать в тексте | Matnda koʻrsatish |
| `reading.evidence.remove` | Pinned quote action (M4-03) | Remove from evidence | Убрать из обоснования | Dalildan olib tashlash |
| `reading.evidence.limit` | Message when a fourth pin is refused (M4-03) | You can pin up to {max} sentences to one question. | К одному вопросу можно закрепить до {max} предложений. | Bitta savolga {max} tagacha gap biriktirish mumkin. |
| `reading.mode.legend` | Start screen, above the two modes (M4-04) | Choose how to take it | Выберите режим | Rejimni tanlang |
| `reading.mode.practice` | Start screen option (M4-04) | Practice | Практика | Mashq |
| `reading.mode.practiceDetail` | Start screen option detail (M4-04) | No time limit. Mark evidence for your answers. | Без ограничения времени. Отмечайте обоснование ответов. | Vaqt cheklanmagan. Javoblaringiz uchun dalillarni belgilang. |
| `reading.mode.exam` | Start screen option (M4-04) | Exam | Экзамен | Imtihon |
| `reading.mode.examDetail` | Start screen option detail (M4-04) | 60 minutes, like the real test. No help. The time keeps running if you leave. | 60 минут, как на настоящем тесте. Без подсказок. Если выйти, время продолжает идти. | Haqiqiy testdagidek 60 daqiqa. Yordamsiz. Chiqib ketsangiz ham vaqt davom etadi. |
| `reading.start` | Start screen, red (M4-04) | Start | Начать | Boshlash |
| `reading.exitExam.title` | Exam "Exit" confirmation (M4-04) | Leave the test? | Выйти из теста? | Testdan chiqasizmi? |
| `reading.exitExam.body` | Exam "Exit" confirmation (M4-04) | The time keeps running while you are away. | Пока вас нет, время идёт. | Siz yoʻqligingizda vaqt davom etadi. |
| `reading.exitExam.leave` | Exam "Exit" confirmation, quiet (M4-04) | Leave | Выйти | Chiqish |
| `reading.exitExam.stay` | Exam "Exit" confirmation, red (M4-04) | Stay | Остаться | Qolish |
| `reading.wordLimit` | Practice warning under a typed answer; ICU plural (M4-04) | {max, plural, one {This answer has more than # word.} other {This answer has more than # words.}} | {max, plural, one {В ответе больше # слова.} few {В ответе больше # слов.} many {В ответе больше # слов.} other {В ответе больше # слова.}} | Bu javobda {max} tadan ortiq soʻz bor. |
| `reading.finished.title` | Finished page heading (M4-04) | Test finished | Тест завершён | Test yakunlandi |
| `reading.finished.timeUp` | Finished page, after a time-out (M4-04) | Time is up. | Время вышло. | Vaqt tugadi. |
| `reading.finished.answered` | Finished page (M4-04) | You answered {answered} of {total} questions. | Вы ответили на {answered} из {total} вопросов. | {total} ta savoldan {answered} tasiga javob berdingiz. |
| `reading.finished.notChecked` | Finished page, honest note (M4-04) | Checking answers and explanations will come in a later version. | Проверка ответов и разборы появятся в следующей версии. | Javoblarni tekshirish va izohlar keyingi versiyada paydo boʻladi. |
| `reading.finished.again` | Finished page, quiet (M4-04) | Start again | Начать заново | Qaytadan boshlash |
| `reading.navigator.passageProgress` | Desktop navigator button for another passage (M4-04) | Passage {number}: {answered} of {total} answered | Текст {number}: отвечено {answered} из {total} | {number}-matn: {total} tadan {answered} tasiga javob berilgan |

## Reading results and review flows (M5)

**Approved with amendments** (owner, 2026-10-11, task M5-01). The screens are specified in [READING_EXPERIENCE.md, M5 specifications](READING_EXPERIENCE.md#m5-specifications-drafts), the visual values in [DESIGN_SYSTEM.md, M5 components](../design/DESIGN_SYSTEM.md#m5-components-reading-results-and-review), the data in ADR-0008 and ADR-0009. The copy is in [Interface copy (M5)](#interface-copy-m5). Steps count from the M4 reading screen; Reading is still reached by its direct link (M4), and home is unchanged (D18).

### Finish → results
- **Goal:** right after finishing, the learner sees how many answers were correct and what to do next.
- **Entry point:** "Finish test" in Practice or Exam (M4), or the Exam time-out.
- **Primary action:** on the results page, the red review button, whose text names what it opens: "Review mistakes and unanswered questions", "Review mistakes", "Review unanswered questions" or "Review answers".
- **Steps:** 1. "Finish test" → the confirmation (M4). 2. "Finish" → the results page (`/{locale}/reading/{testId}/results`): "27 of 40 correct", the honest line, "Not correct: 9 · No answer: 4", the red review button, "Mistakes that repeated", and the quiet "Try 14 questions again: not correct or no answer" and "Start again".
- **Step count:** 2, as in M4. An Exam time-out shows the results page with "Time is up." without any step.
- **Empty / error states:** no finished attempt on this device (for example a shared results link) → "No results on this device yet" with the red "Start the test". Results cannot be saved → the notice, results still shown, nothing recoverable removed. An attempt from an earlier content version → its stored score and "This test has changed since you took it…". A record written after a key or rules correction → the correction notice only if something the learner sees changed (with the earlier score only if the score changed). An imported M4 attempt → the note that it was checked later. Unknown test → not-found. Offline after loading → works; opening offline → the M1 error state.
- **Languages checked:** not yet (M5-06: the Russian score line and honest line at 320 px and 200% zoom).

### Results → understand a mistake
- **Goal:** for each mistake and each unanswered question, see the answer, where it comes from in the passage, and why.
- **Entry point:** the red review button on the results page.
- **Primary action:** reading the review card; moving on with "Next".
- **Steps:** 1. The red review button → the review screen at the first card that is not fully correct or has no answer: the passage with that card's evidence marked and in view, and the review card (outcome, your answer or "You did not answer this question.", correct answer, evidence, why). 2. "Next" → the next such card ("To review: 2 of 12" counts cards; 22–23 is one card).
- **Step count:** 1 from results to the first explanation; 3 from the last test question (finish, confirm, review).
- **Unanswered questions** are never skipped: they are in the sequence, named on the button and shown as "No answer" (not "Not correct").
- **Empty / error states:** all answers correct → the button reads "Review answers" and opens question 1. A question number or attempt not on this device → as above. Review of an attempt from an earlier content version → not available, with the score kept.
- **Languages checked:** phone (M5-07, 2026-10-17): uz, ru and en at 320 px and at 200% zoom (the longest outcome "1 of 2 correct", the evidence heading, "Explain simpler" opened, the navigator), with axe. Desktop (M5-08, 2026-10-17): uz, ru and en at 1024 and 1280 px, with axe.

### Explain simpler
- **Steps:** 1. "Explain simpler" under the explanation → the simpler version appears right after the button, in the interface language; the button becomes "Hide the simpler explanation".
- **Step count:** 1. Available for every card in Practice and Exam attempts (review happens after the test, so Exam's "no help" rule is kept).

### Try questions again
- **Goal:** answer once more, without seeing the answers, every question of an attempt that was not fully correct or unanswered, and see how many are now correct.
- **Entry point:** "Try 14 questions again: not correct or no answer" on the results page, or "Practise these questions again" on a repeated-mistake card.
- **Primary action:** answering, then "Finish".
- **Steps:** 1. Tap the link → the reading screen in Practice with only those questions (whole items: 22–23 with both choices empty), answers empty (no start screen: the mode is fixed). 2. Answer and move as in M4; "All questions" lists only these. 3. "Finish test", "Finish" → the retry's results: "Your retry", "9 of 14 now correct", "These are questions you have attempted before. This practice result is not an independent measure of your level.", the review button, "Back to your test results".
- **Step count:** 1 to start.
- **Empty / error states:** nothing to try again → the link is not shown. An unfinished retry of the same questions → resumed. Starting a different retry replaces an unfinished one. The source attempt missing, from an earlier content version, or the questions not allowed → "This practice can't be started" with the reason, "See your last results" and "Start the test".
- **Languages checked:** M5-09 (2026-10-17), screenshots: ru at 320 px (the "Try … again" link, the safe state, the retry sheet), en at 360 and 1280 px; uz not yet (M5-11 pass).

### Come back to results later
- **Steps:** 1. Open the test link → the start screen (M4) with a quiet "See your last results" under "Start", when this device has a finished attempt. 2. Tap it → the results page of the latest test attempt.
- **Step count:** 2. (In M4 the test link showed the finished page instead; D6.)

## Interface copy (M5)

**Approved for implementation** (owner, 2026-10-11, task M5-01). Interface strings only. Test content (passages, questions, options, TRUE/FALSE/NOT GIVEN, typed and accepted answers) stays in English from the content. Explanations and their simpler versions are per-test content files, not catalog strings (ADR-0008). `<en>…</en>` marks English answer words inside a localized string, rendered with `lang="en"`. Uzbek uses U+02BB for oʻ and gʻ and U+02BC for the tutuq belgisi. A fluent-speaker review of uz and ru is required before beta, as for M1 to M4. Keys are suggestions.

| Key (suggested) | Used in | en | ru | uz |
|---|---|---|---|---|
| `reading.results.title` | Results H1 and page title | Your results | Ваши результаты | Natijalaringiz |
| `reading.results.score` | Score line (wraps when needed) | {score} of {total} correct | Верно: {score} из {total} | {total} tadan {score} tasi toʻgʻri |
| `reading.results.honest` | Under the score | A practice score on our own practice test. It is not an IELTS band score. | Это результат практики на нашем собственном тесте, а не балл IELTS. | Bu oʻz mashq testimizdagi natija, IELTS bali emas. |
| `reading.results.breakdown` | Under the honest line (positions); `<notCorrect>` and `<noAnswer>` place each outcome icon (markup only) | <notCorrect>Not correct: {incorrect}</notCorrect> · <noAnswer>No answer: {unanswered}</noAnswer> | <notCorrect>Неверно: {incorrect}</notCorrect> · <noAnswer>Без ответа: {unanswered}</noAnswer> | <notCorrect>Notoʻgʻri: {incorrect}</notCorrect> · <noAnswer>Javobsiz: {unanswered}</noAnswer> |
| `reading.results.reviewMistakesAndUnanswered` | Results, red, when there are mistakes and unanswered questions | Review mistakes and unanswered questions | Разобрать ошибки и вопросы без ответа | Xatolar va javobsiz savollarni koʻrib chiqish |
| `reading.results.reviewMistakes` | Results, red, mistakes but no unanswered questions | Review mistakes | Разобрать ошибки | Xatolarni koʻrib chiqish |
| `reading.results.reviewUnanswered` | Results, red, unanswered questions but no mistakes | Review unanswered questions | Разобрать вопросы без ответа | Javobsiz savollarni koʻrib chiqish |
| `reading.results.reviewAll` | Results, red, when everything is correct | Review answers | Посмотреть ответы | Javoblarni koʻrib chiqish |
| `reading.results.tryAgain` | Results, quiet; `{count}` = positions of the units not fully correct or unanswered | {count, plural, one {Try # question again: not correct or no answer} other {Try # questions again: not correct or no answer}} | {count, plural, one {Ответить ещё раз на # вопрос с ошибкой или без ответа} few {Ответить ещё раз на # вопроса с ошибкой или без ответа} many {Ответить ещё раз на # вопросов с ошибкой или без ответа} other {Ответить ещё раз на # вопроса с ошибкой или без ответа}} | Xato yoki javobsiz {count} ta savolga qayta javob berish |
| `reading.results.rechecked` | Results, after a correction that changed the score | Rechecked after a correction to the answer key or to how answers are checked. Your earlier result was {score} of {total}. | Перепроверено после исправления ключа ответов или правил проверки. Прежний результат: {score} из {total}. | Javoblar kaliti yoki tekshirish qoidalari tuzatilgandan keyin qayta tekshirildi. Oldingi natija: {total} tadan {score}. |
| `reading.results.recheckedSameScore` | Results, after a correction that changed outcomes or notes but not the score | Rechecked after a correction to the answer key or to how answers are checked. Your score is the same; some answers or notes changed. | Перепроверено после исправления ключа ответов или правил проверки. Результат тот же, но изменились некоторые ответы или пояснения. | Javoblar kaliti yoki tekshirish qoidalari tuzatilgandan keyin qayta tekshirildi. Natija oʻzgarmadi, lekin baʼzi javoblar yoki izohlar oʻzgardi. |
| `reading.results.importedFromM4` | Results of an attempt imported from M4 | You finished this test before the app checked answers. It was checked when you first opened these results. | Вы завершили этот тест, когда приложение ещё не проверяло ответы. Он проверен, когда вы впервые открыли эти результаты. | Siz bu testni ilova javoblarni tekshirmagan paytda yakunlagansiz. U natijalarni birinchi marta ochganingizda tekshirildi. |
| `reading.results.storageUnavailable` | Notice on results and review | Your results can't be saved on this device. They will be lost if you close or reload this page. | Результаты не сохраняются на этом устройстве. Они пропадут, если закрыть или обновить страницу. | Natijalar bu qurilmada saqlanmaydi. Sahifani yopsangiz yoki yangilasangiz, ular yoʻqoladi. |
| `reading.results.none.title` | No attempt on this device | No results on this device yet | На этом устройстве пока нет результатов | Bu qurilmada hali natijalar yoʻq |
| `reading.results.none.body` | No attempt on this device | Results appear here after you finish the test on this device. | Результаты появятся здесь, когда вы завершите тест на этом устройстве. | Testni shu qurilmada yakunlaganingizdan soʻng natijalar shu yerda chiqadi. |
| `reading.results.none.start` | No attempt, red | Start the test | Начать тест | Testni boshlash |
| `reading.results.oldVersion` | Attempt from an earlier content version | This test has changed since you took it, so a detailed review is not available. | Тест изменился после вашей попытки, поэтому подробный разбор недоступен. | Siz topshirganingizdan keyin test oʻzgargan, shuning uchun batafsil tahlil mavjud emas. |
| `reading.results.cannotCheck` | Unchecked attempt from an earlier version | This test has changed since you took it, so your answers can't be checked. | Тест изменился после вашей попытки, поэтому ответы нельзя проверить. | Siz topshirganingizdan keyin test oʻzgargan, shuning uchun javoblarni tekshirib boʻlmaydi. |
| `reading.lastResults` | Start screen, quiet, when an attempt exists | See your last results | Посмотреть последние результаты | Oxirgi natijalarni koʻrish |
| `reading.review.toResults` | Review test bar (start side) | Results | Результаты | Natijalar |
| `reading.review.correct` | Outcome | Correct | Верно | Toʻgʻri |
| `reading.review.incorrect` | Outcome | Not correct | Неверно | Notoʻgʻri |
| `reading.review.unanswered` | Outcome | No answer | Нет ответа | Javob yoʻq |
| `reading.review.partly` | Outcome of a partly correct "choose several" item | {correct} of {total} correct | Верно {correct} из {total} | {total} tadan {correct} tasi toʻgʻri |
| `reading.review.yourAnswer` | Typed answer label | Your answer | Ваш ответ | Sizning javobingiz |
| `reading.review.yourAnswerCorrect` | Option label: chosen and accepted | Your answer, correct | Ваш ответ, верно | Sizning javobingiz, toʻgʻri |
| `reading.review.yourAnswerIncorrect` | Option label: chosen and not accepted | Your answer, not correct | Ваш ответ, неверно | Sizning javobingiz, notoʻgʻri |
| `reading.review.correctAnswer` | Typed label; option label: accepted, not chosen | Correct answer | Правильный ответ | Toʻgʻri javob |
| `reading.review.alsoAccepted` | Typed answer label | Also accepted | Также засчитывается | Bu ham qabul qilinadi |
| `reading.review.noAnswerGiven` | Unanswered card | You did not answer this question. | Вы не ответили на этот вопрос. | Bu savolga javob bermagansiz. |
| `reading.review.evidenceTitle` | Evidence block | Evidence in the passage | Подтверждение в тексте | Matndagi dalil |
| `reading.review.relatedTitle` | Evidence block for NOT GIVEN with related sentences | Where the passage talks about this | Где в тексте говорится об этом | Matnda bu haqda soʻz boradigan joy |
| `reading.review.why` | Explanation heading | Why | Почему | Nima uchun |
| `reading.review.simpler` | Disclosure button | Explain simpler | Объяснить проще | Soddaroq tushuntirish |
| `reading.review.simplerHide` | Disclosure button, open | Hide the simpler explanation | Скрыть простое объяснение | Sodda tushuntirishni yashirish |
| `reading.review.simplerTitle` | Before the simpler text | In simple words | Простыми словами | Oddiy soʻzlar bilan |
| `reading.review.pinMatch` | Under "Your evidence" | You pinned a sentence the answer key cites as evidence. | Вы закрепили предложение, которое ключ ответов приводит как подтверждение. | Siz javoblar kaliti dalil sifatida keltirgan gapni biriktirgansiz. |
| `reading.review.pinMiss` | Under "Your evidence" | None of your pinned sentences is one the answer key cites as evidence. | Ни одно из закреплённых вами предложений не указано в ключе ответов как подтверждение. | Siz biriktirgan gaplarning hech biri javoblar kalitida dalil sifatida koʻrsatilmagan. |
| `reading.review.pinNotGiven` | Under "Your evidence", NOT GIVEN | The answer is <en>NOT GIVEN</en>, so no sentence in the passage confirms or contradicts the statement. | Ответ: <en>NOT GIVEN</en>, поэтому ни одно предложение текста не подтверждает и не опровергает утверждение. | Javob: <en>NOT GIVEN</en>, shuning uchun matndagi hech bir gap fikrni tasdiqlamaydi ham, rad etmaydi ham. |
| `reading.review.toReview` | Under the card heading in the review sequence (cards) | To review: {current} of {total} | Разбор: {current} из {total} | Tahlil: {total} tadan {current} |
| `reading.review.evidenceMarker` | Accessible name of an evidence chip | Evidence for question {number} | Подтверждение к вопросу {number} | {number}-savol uchun dalil |
| `reading.review.relatedMarker` | Accessible name of a "related" chip | Related to question {number} | Относится к вопросу {number} | {number}-savolga tegishli |
| `reading.navigator.correct` | Navigator state word in review | correct | верно | toʻgʻri |
| `reading.navigator.incorrect` | Navigator state word in review | not correct | неверно | notoʻgʻri |
| `reading.navigator.partly` | Navigator state word in review, "choose several" item | partly correct | частично верно | qisman toʻgʻri |
| `reading.navigator.itemRange` | Accessible name of a navigator button of a "choose several" item | Questions {from}–{to}, {states} | Вопросы {from}–{to}, {states} | {from}–{to}-savollar, {states} |
| `reading.signals.ngInsteadOfFalse.facts` | Note, TRUE/FALSE/NOT GIVEN | You chose <en>NOT GIVEN</en>. The passage contradicts this statement, so the answer is <en>FALSE</en>. <en>NOT GIVEN</en> would mean the passage gives no information on it. | Вы выбрали <en>NOT GIVEN</en>. Текст противоречит этому утверждению, поэтому ответ: <en>FALSE</en>. <en>NOT GIVEN</en> означало бы, что в тексте нет информации об этом. | Siz <en>NOT GIVEN</en> ni tanladingiz. Matn bu fikrga zid, shuning uchun javob: <en>FALSE</en>. <en>NOT GIVEN</en> matnda bu haqda maʼlumot yoʻqligini bildirardi. |
| `reading.signals.ngInsteadOfFalse.views` | Note, YES/NO/NOT GIVEN | You chose <en>NOT GIVEN</en>. The writer's views contradict this statement, so the answer is <en>NO</en>. <en>NOT GIVEN</en> would mean it is impossible to say what the writer thinks about it. | Вы выбрали <en>NOT GIVEN</en>. Взгляды автора противоречат этому утверждению, поэтому ответ: <en>NO</en>. <en>NOT GIVEN</en> означало бы, что невозможно сказать, что автор об этом думает. | Siz <en>NOT GIVEN</en> ni tanladingiz. Muallifning fikri bu fikrga zid, shuning uchun javob: <en>NO</en>. <en>NOT GIVEN</en> muallif bu haqda nima deb oʻylashini aytib boʻlmasligini bildirardi. |
| `reading.signals.falseInsteadOfNg.facts` | Note, TRUE/FALSE/NOT GIVEN | You chose <en>FALSE</en>. The passage gives no information on this: it neither agrees with nor contradicts the statement, so the answer is <en>NOT GIVEN</en>. <en>FALSE</en> would need a sentence that contradicts it. | Вы выбрали <en>FALSE</en>. В тексте нет информации об этом: он не подтверждает утверждение и не противоречит ему, поэтому ответ: <en>NOT GIVEN</en>. Для <en>FALSE</en> нужно предложение, которое ему противоречит. | Siz <en>FALSE</en> ni tanladingiz. Matnda bu haqda maʼlumot yoʻq: u fikrni tasdiqlamaydi ham, unga zid ham emas, shuning uchun javob: <en>NOT GIVEN</en>. <en>FALSE</en> uchun fikrga zid gap kerak. |
| `reading.signals.falseInsteadOfNg.views` | Note, YES/NO/NOT GIVEN | You chose <en>NO</en>. It is impossible to say what the writer thinks about this: the passage neither agrees with nor contradicts the statement, so the answer is <en>NOT GIVEN</en>. <en>NO</en> would need the writer's views to contradict it. | Вы выбрали <en>NO</en>. Невозможно сказать, что автор об этом думает: текст не подтверждает утверждение и не противоречит ему, поэтому ответ: <en>NOT GIVEN</en>. Для <en>NO</en> взгляды автора должны ему противоречить. | Siz <en>NO</en> ni tanladingiz. Muallif bu haqda nima deb oʻylashini aytib boʻlmaydi: matn fikrni tasdiqlamaydi ham, unga zid ham emas, shuning uchun javob: <en>NOT GIVEN</en>. <en>NO</en> uchun muallifning fikri unga zid boʻlishi kerak. |
| `reading.signals.ngInsteadOfTrue.facts` | Note, TRUE/FALSE/NOT GIVEN | You chose <en>NOT GIVEN</en>. The passage agrees with this statement, so the answer is <en>TRUE</en>. <en>NOT GIVEN</en> would mean the passage gives no information on it. | Вы выбрали <en>NOT GIVEN</en>. Текст подтверждает это утверждение, поэтому ответ: <en>TRUE</en>. <en>NOT GIVEN</en> означало бы, что в тексте нет информации об этом. | Siz <en>NOT GIVEN</en> ni tanladingiz. Matn bu fikrni tasdiqlaydi, shuning uchun javob: <en>TRUE</en>. <en>NOT GIVEN</en> matnda bu haqda maʼlumot yoʻqligini bildirardi. |
| `reading.signals.ngInsteadOfTrue.views` | Note, YES/NO/NOT GIVEN | You chose <en>NOT GIVEN</en>. The statement agrees with the writer's views, so the answer is <en>YES</en>. <en>NOT GIVEN</en> would mean it is impossible to say what the writer thinks about it. | Вы выбрали <en>NOT GIVEN</en>. Утверждение совпадает со взглядами автора, поэтому ответ: <en>YES</en>. <en>NOT GIVEN</en> означало бы, что невозможно сказать, что автор об этом думает. | Siz <en>NOT GIVEN</en> ni tanladingiz. Fikr muallifning qarashlariga mos, shuning uchun javob: <en>YES</en>. <en>NOT GIVEN</en> muallif bu haqda nima deb oʻylashini aytib boʻlmasligini bildirardi. |
| `reading.signals.trueInsteadOfNg.facts` | Note, TRUE/FALSE/NOT GIVEN | You chose <en>TRUE</en>. The passage gives no information on this: it neither agrees with nor contradicts the statement, so the answer is <en>NOT GIVEN</en>. <en>TRUE</en> would need a sentence that agrees with it. | Вы выбрали <en>TRUE</en>. В тексте нет информации об этом: он не подтверждает утверждение и не противоречит ему, поэтому ответ: <en>NOT GIVEN</en>. Для <en>TRUE</en> нужно предложение, которое его подтверждает. | Siz <en>TRUE</en> ni tanladingiz. Matnda bu haqda maʼlumot yoʻq: u fikrni tasdiqlamaydi ham, unga zid ham emas, shuning uchun javob: <en>NOT GIVEN</en>. <en>TRUE</en> uchun fikrni tasdiqlaydigan gap kerak. |
| `reading.signals.trueInsteadOfNg.views` | Note, YES/NO/NOT GIVEN | You chose <en>YES</en>. It is impossible to say what the writer thinks about this, so the answer is <en>NOT GIVEN</en>. <en>YES</en> would need the statement to agree with the writer's views. | Вы выбрали <en>YES</en>. Невозможно сказать, что автор об этом думает, поэтому ответ: <en>NOT GIVEN</en>. Для <en>YES</en> утверждение должно совпадать со взглядами автора. | Siz <en>YES</en> ni tanladingiz. Muallif bu haqda nima deb oʻylashini aytib boʻlmaydi, shuning uchun javob: <en>NOT GIVEN</en>. <en>YES</en> uchun fikr muallifning qarashlariga mos boʻlishi kerak. |
| `reading.signals.oneLetterAway` | Note ("Possible spelling issue"; never changes the mark) | Your answer differs from an accepted answer by one letter. | Ваш ответ отличается от принятого ответа одной буквой. | Javobingiz qabul qilingan javobdan bitta harf bilan farq qiladi. |
| `reading.signals.wordLimit` | Note | Your answer has more words than the instruction allows. | В вашем ответе больше слов, чем разрешает задание. | Javobingizda topshiriq ruxsat berganidan koʻproq soʻz bor. |
| `reading.signals.notFromPassage` | Note | Your answer uses a word that is not in the passage. This task asks for words from the passage. | В ответе есть слово, которого нет в тексте. В этом задании нужны слова из текста. | Javobingizda matnda yoʻq soʻz bor. Bu topshiriqda matndagi soʻzlar kerak. |
| `reading.signals.timeUp` | Note on unanswered questions of a timed-out Exam | This question had no answer when the time ran out. | Когда время закончилось, на этот вопрос не было ответа. | Vaqt tugaganda bu savolga javob berilmagan edi. |
| `reading.patterns.title` | Results section heading | Mistakes that repeated | Повторившиеся ошибки | Takrorlangan xatolar |
| `reading.patterns.scopeThisTry` | Under the heading, on the first attempt's results | In this attempt at this test. One test is not enough to show a lasting weakness. | В этой попытке этого теста. Одного теста мало, чтобы говорить о постоянной слабости. | Bu testdagi shu urinishda. Doimiy zaif tomonni koʻrsatish uchun bitta test yetarli emas. |
| `reading.patterns.scopeFirstTry` | Under the heading, on a later attempt's results | From your first attempt at this test on this device. Later attempts repeat questions you have worked on before, so they are not used. One test is not enough to show a lasting weakness. | По вашей первой попытке этого теста на этом устройстве. Последующие попытки повторяют вопросы, над которыми вы уже работали, поэтому не учитываются. Одного теста мало, чтобы говорить о постоянной слабости. | Bu qurilmadagi bu testning birinchi urinishingiz boʻyicha. Keyingi urinishlar avval ishlagan savollaringizni takrorlaydi, shuning uchun hisobga olinmaydi. Doimiy zaif tomonni koʻrsatish uchun bitta test yetarli emas. |
| `reading.patterns.noneThisTry` | No repeated category, first attempt | Not enough evidence to show a repeated pattern in this attempt. | Недостаточно данных, чтобы показать повторяющуюся закономерность в этой попытке. | Bu urinishda takrorlanuvchi qonuniyatni koʻrsatish uchun maʼlumot yetarli emas. |
| `reading.patterns.noneFirstTry` | No repeated category, later attempt | Not enough evidence to show a repeated pattern in your first attempt at this test. | Недостаточно данных, чтобы показать повторяющуюся закономерность в вашей первой попытке этого теста. | Bu testdagi birinchi urinishingizda takrorlanuvchi qonuniyatni koʻrsatish uchun maʼlumot yetarli emas. |
| `reading.patterns.unknownFirstTry` | First attempt unknown (M4 import, other entries) | We can't tell which was your first try at this test on this device, so we don't look for repeated mistakes in it. | Мы не знаем, какая попытка этого теста на этом устройстве была первой, поэтому не ищем в нём повторяющиеся ошибки. | Bu qurilmada bu testning qaysi urinishi birinchi boʻlganini bilmaymiz, shuning uchun undagi takrorlangan xatolarni qidirmaymiz. |
| `reading.patterns.unavailable` | First attempt from an earlier content version | Repeated mistakes can't be shown because this test has changed since your first attempt. | Повторяющиеся ошибки нельзя показать: тест изменился после вашей первой попытки. | Takrorlangan xatolarni koʻrsatib boʻlmaydi: birinchi urinishingizdan keyin test oʻzgargan. |
| `reading.patterns.practise` | Pattern card, quiet | Practise these questions again | Повторить эти вопросы | Bu savollarni qayta ishlash |
| `reading.patterns.ngFalse.title` | Pattern card | <en>NOT GIVEN</en> mixed up with <en>FALSE</en> or <en>NO</en> | <en>NOT GIVEN</en> путается с <en>FALSE</en> или <en>NO</en> | <en>NOT GIVEN</en> bilan <en>FALSE</en> yoki <en>NO</en> adashtirilgan |
| `reading.patterns.ngFalse.count` | Pattern card | {count} of {total} questions whose answer was <en>NOT GIVEN</en>, <en>FALSE</en> or <en>NO</en> (questions {numbers}) | {count} из {total, plural, one {# вопроса} other {# вопросов}} с ответом <en>NOT GIVEN</en>, <en>FALSE</en> или <en>NO</en> (вопросы {numbers}) | Javobi <en>NOT GIVEN</en>, <en>FALSE</en> yoki <en>NO</en> boʻlgan {total} ta savoldan {count} tasi ({numbers}-savollar) |
| `reading.patterns.ngFalse.tip` | Pattern card | <en>FALSE</en> or <en>NO</en> means the passage, or the writer's view, contradicts the statement. <en>NOT GIVEN</en> means it neither agrees nor contradicts: the information or the writer's view is not there. Before choosing <en>FALSE</en> or <en>NO</en>, find what contradicts the statement. | <en>FALSE</en> или <en>NO</en>: текст или взгляд автора противоречит утверждению. <en>NOT GIVEN</en>: текст не подтверждает и не опровергает его, такой информации или мнения автора нет. Прежде чем выбрать <en>FALSE</en> или <en>NO</en>, найдите то, что противоречит утверждению. | <en>FALSE</en> yoki <en>NO</en>: matn yoki muallif fikri bu fikrga zid. <en>NOT GIVEN</en>: matn uni tasdiqlamaydi ham, rad etmaydi ham, bunday maʼlumot yoki muallif fikri yoʻq. <en>FALSE</en> yoki <en>NO</en> ni tanlashdan oldin fikrga zid narsani toping. |
| `reading.patterns.ngTrue.title` | Pattern card | <en>NOT GIVEN</en> mixed up with <en>TRUE</en> or <en>YES</en> | <en>NOT GIVEN</en> путается с <en>TRUE</en> или <en>YES</en> | <en>NOT GIVEN</en> bilan <en>TRUE</en> yoki <en>YES</en> adashtirilgan |
| `reading.patterns.ngTrue.count` | Pattern card | {count} of {total} questions whose answer was <en>NOT GIVEN</en>, <en>TRUE</en> or <en>YES</en> (questions {numbers}) | {count} из {total, plural, one {# вопроса} other {# вопросов}} с ответом <en>NOT GIVEN</en>, <en>TRUE</en> или <en>YES</en> (вопросы {numbers}) | Javobi <en>NOT GIVEN</en>, <en>TRUE</en> yoki <en>YES</en> boʻlgan {total} ta savoldan {count} tasi ({numbers}-savollar) |
| `reading.patterns.ngTrue.tip` | Pattern card | <en>TRUE</en> or <en>YES</en> needs the passage, or the writer's view, to agree with the statement, often in other words. If nothing agrees and nothing contradicts, the answer is <en>NOT GIVEN</en>. | Для <en>TRUE</en> или <en>YES</en> текст или взгляд автора должен совпадать с утверждением, часто другими словами. Если ничто не подтверждает и не противоречит, ответ: <en>NOT GIVEN</en>. | <en>TRUE</en> yoki <en>YES</en> uchun matn yoki muallif fikri bu fikrga mos boʻlishi kerak, koʻpincha boshqa soʻzlar bilan. Hech narsa tasdiqlamasa va zid boʻlmasa, javob: <en>NOT GIVEN</en>. |
| `reading.patterns.oneLetterAway.title` | Pattern card | Possible spelling issues | Возможные ошибки в написании | Ehtimoliy imlo xatolari |
| `reading.patterns.oneLetterAway.count` | Pattern card | {count} of {total} typed answers were one letter away from an accepted answer (questions {numbers}) | {count} из {total, plural, one {# письменного ответа} other {# письменных ответов}} отличались от принятого ответа одной буквой (вопросы {numbers}) | Yozilgan {total} ta javobdan {count} tasi qabul qilingan javobdan bitta harf bilan farq qildi ({numbers}-savollar) |
| `reading.patterns.oneLetterAway.tip` | Pattern card (rule: Cambridge IELTS FAQs) | One letter away may be a spelling slip or a different word. In the test, a misspelt answer loses the mark, so copy words from the passage letter by letter. | Отличие в одну букву может быть опиской, а может быть другим словом. На экзамене ответ с ошибкой в написании не засчитывается, поэтому переписывайте слова из текста буква за буквой. | Bitta harf farqi imlo xatosi ham, boshqa soʻz ham boʻlishi mumkin. Imtihonda xato yozilgan javob uchun ball berilmaydi, shuning uchun soʻzlarni matndan harfma-harf koʻchiring. |
| `reading.patterns.wordLimit.title` | Pattern card | Too many words | Слишком много слов | Soʻzlar juda koʻp |
| `reading.patterns.wordLimit.count` | Pattern card | {count} of {total} typed answers had more words than allowed (questions {numbers}) | {count} из {total, plural, one {# письменного ответа} other {# письменных ответов}} содержали больше слов, чем разрешено (вопросы {numbers}) | Yozilgan {total} ta javobdan {count} tasida ruxsat etilganidan koʻp soʻz bor edi ({numbers}-savollar) |
| `reading.patterns.wordLimit.tip` | Pattern card (rule: ielts.org Reading format pages) | In the test, an answer with more words than allowed loses the mark. Check the limit in the instruction, for example <en>NO MORE THAN TWO WORDS</en>, and write only the words that answer the question. | На экзамене ответ, в котором больше слов, чем разрешено, не засчитывается. Проверяйте ограничение в задании, например <en>NO MORE THAN TWO WORDS</en>, и пишите только слова, которые отвечают на вопрос. | Imtihonda ruxsat etilganidan koʻp soʻzli javob uchun ball berilmaydi. Topshiriqdagi cheklovni tekshiring, masalan <en>NO MORE THAN TWO WORDS</en>, va faqat savolga javob boʻladigan soʻzlarni yozing. |
| `reading.patterns.notFromPassage.title` | Pattern card | Words not from the passage | Слова не из текста | Matnda yoʻq soʻzlar |
| `reading.patterns.notFromPassage.count` | Pattern card | {count} of {total} typed answers used a word that is not in the passage (questions {numbers}) | В {count} из {total, plural, one {# письменного ответа} other {# письменных ответов}} есть слово, которого нет в тексте (вопросы {numbers}) | Yozilgan {total} ta javobdan {count} tasida matnda yoʻq soʻz bor edi ({numbers}-savollar) |
| `reading.patterns.notFromPassage.tip` | Pattern card | When the instruction says <en>from the passage</en>, write the passage's own words, even if you know a synonym. | Если в задании сказано <en>from the passage</en>, пишите слова из текста, даже если знаете синоним. | Topshiriqda <en>from the passage</en> deyilgan boʻlsa, sinonimni bilsangiz ham, matndagi soʻzlarni yozing. |
| `reading.patterns.pins.title` | Pattern card | Pins differed from the cited evidence | Закреплённые предложения не совпали с подтверждением из ключа | Biriktirilgan gaplar kalitdagi dalilga mos kelmadi |
| `reading.patterns.pins.count` | Pattern card | {count} of {total} questions with pinned sentences: none of the pins was a sentence the key cites (questions {numbers}) | {count} из {total, plural, one {# вопроса} other {# вопросов}} с закреплёнными предложениями: ни одно не указано в ключе (вопросы {numbers}) | Gap biriktirilgan {total} ta savoldan {count} tasida biriktirilgan gaplarning hech biri kalitda koʻrsatilmagan ({numbers}-savollar) |
| `reading.patterns.pins.tip` | Pattern card | Compare your pinned sentence with the sentence the review cites. Look for the same idea in the passage, not only the same words. | Сравните закреплённое предложение с тем, которое приводится в разборе. Ищите в тексте ту же мысль, а не только те же слова. | Biriktirgan gapingizni tahlilda keltirilgan gap bilan solishtiring. Matndan faqat oʻsha soʻzlarni emas, oʻsha fikrni qidiring. |
| `reading.patterns.paraphrase.title` | Pattern card (content tag) | Questions that use other words | Вопросы, сформулированные другими словами | Boshqa soʻzlar bilan berilgan savollar |
| `reading.patterns.paraphrase.count` | Pattern card | {count} of {total} questions that say the passage's idea in other words were not fully correct (questions {numbers}) | Не полностью верно: {count} из {total, plural, one {# вопроса} other {# вопросов}}, где мысль текста передана другими словами (вопросы {numbers}) | Matndagi fikr boshqa soʻzlar bilan berilgan {total} ta savoldan {count} tasi toʻliq toʻgʻri emas ({numbers}-savollar) |
| `reading.patterns.paraphrase.tip` | Pattern card | Look for the same idea, not the same words. In the review, compare the question's words with the evidence. | Ищите ту же мысль, а не те же слова. В разборе сравните слова вопроса с подтверждением. | Bir xil soʻzlarni emas, bir xil fikrni qidiring. Tahlilda savoldagi soʻzlarni dalil bilan solishtiring. |
| `reading.patterns.qualifier.title` | Pattern card (content tag) | Questions that turn on a small word | Вопросы, где всё решает одно маленькое слово | Bitta kichik soʻzga bogʻliq savollar |
| `reading.patterns.qualifier.count` | Pattern card | {count} of {total} questions that turn on a word like <en>all</en>, <en>most</en> or <en>only</en> were not fully correct (questions {numbers}) | Не полностью верно: {count} из {total, plural, one {# вопроса} other {# вопросов}}, где всё решает слово вроде <en>all</en>, <en>most</en> или <en>only</en> (вопросы {numbers}) | <en>all</en>, <en>most</en> yoki <en>only</en> kabi soʻzga bogʻliq {total} ta savoldan {count} tasi toʻliq toʻgʻri emas ({numbers}-savollar) |
| `reading.patterns.qualifier.tip` | Pattern card | Check words such as <en>all</en>, <en>most</en>, <en>some</en>, <en>only</en>, <en>always</en> and <en>never</en> in both the question and the passage. | Сверяйте слова вроде <en>all</en>, <en>most</en>, <en>some</en>, <en>only</en>, <en>always</en> и <en>never</en> в вопросе и в тексте. | Savolda ham, matnda ham <en>all</en>, <en>most</en>, <en>some</en>, <en>only</en>, <en>always</en> va <en>never</en> kabi soʻzlarni tekshiring. |
| `reading.retry.progress` | Retry sheet header, under the question number (positions) | {current} of {total} to practise | {current} из {total} для повторения | Takrorlash uchun {total} tadan {current} |
| `reading.retry.title` | Retry results H1 | Your retry | Повторная практика | Takroriy mashq |
| `reading.retry.score` | Retry results | {score} of {total} now correct | Теперь верно: {score} из {total} | Endi {total} tadan {score} tasi toʻgʻri |
| `reading.retry.honest` | Retry results | These are questions you have attempted before. This practice result is not an independent measure of your level. | Это вопросы, которые вы уже пробовали раньше. Этот результат практики не является независимой оценкой вашего уровня. | Bu savollarni avval ishlab koʻrgansiz. Bu mashq natijasi darajangizning mustaqil oʻlchovi emas. |
| `reading.retry.backToResults` | Retry results, quiet | Back to your test results | Вернуться к результатам теста | Test natijalariga qaytish |
| `reading.retry.unavailable` | Retry safe state H1 | This practice can't be started | Эту практику нельзя начать | Bu mashqni boshlab boʻlmaydi |
| `reading.retry.sourceMissing` | Retry safe state | The attempt these questions came from is no longer on this device. | Попытки, из которой взяты эти вопросы, больше нет на этом устройстве. | Bu savollar olingan urinish endi bu qurilmada yoʻq. |
| `reading.retry.sourceOldVersion` | Retry safe state | This test has changed since that attempt, so its questions can't be practised again. | Тест изменился после той попытки, поэтому её вопросы нельзя повторить. | Oʻsha urinishdan keyin test oʻzgargan, shuning uchun uning savollarini qayta ishlab boʻlmaydi. |
| `reading.retry.notAllowed` | Retry safe state | These questions can't be practised from that attempt. | Эти вопросы нельзя повторить из той попытки. | Bu savollarni oʻsha urinishdan qayta ishlab boʻlmaydi. |

Reused without change: "Time is up.", "Start again", "Show in passage", "Your evidence", "Paragraph {letter}", "All questions", "Previous", "Next", "Finish test" and the finish confirmation, the navigator's "no answer" and "current", the navigator item name, "Practice" / "Exam", "Start the test", and "See your last results" in the retry safe state.

## Navigation and Practice Hub (M6)

**Approved** (owner, 2026-10-18, task M6-04, as recommended; drafted in M6-02). Decided: N1 (b) the phone bottom bar with header links from the tablet breakpoint; N2 (a) no navigation on the onboarding steps; N3 (a) skills without tests are not shown; N4 (a) "Last result: … correct" in the Hub; N5 skill names translated in the navigation, the Hub and Home, kept in English inside test content and the level check. The findings behind it are in [M6-01-ui-audit.md](../execution/M6-01-ui-audit.md) (C1: no product navigation; Reading reachable only by a direct link). Visual values follow in DESIGN_SYSTEM.md (M6-03). **This changes an approved M1 decision**: the [app shell](#app-shell-phone-and-desktop) says "No product navigation until real destinations and screens exist for it". The Practice Hub is the first such destination; Progress (M11) and an optional account (M10) follow, so the navigation is chosen now for up to four destinations, while only two exist.

### Navigation and shell (M6)

- **Goal:** from any shell page, a learner reaches Home or practice in one tap, and the frame never competes with the page's own primary action.
- **Destinations now:** Home (`/{locale}`) and Practice (`/{locale}/practice`). **Later, when they exist:** Progress (M11) and the account (M10). No placeholder for a destination that does not exist (progressive disclosure, UX rule 4).
- **Options:**

  | | (a) Header links on every width | (b) Phone bottom bar, header links from the tablet breakpoint | (c) A menu button |
  |---|---|---|---|
  | Phone | Logo, two or three links and the language button share one 320 px row; with Progress and the account (M10, M11) they no longer fit in uz and ru | A bar of 2–4 labelled destinations at the bottom, within thumb reach; the header keeps the logo and the language | One icon opens a list |
  | Desktop | Links in the header | Links in the header, the same destinations | A menu on a wide screen hides what has room to show |
  | Cost | Rework in M10 or M11 when destinations grow | About 56 px of phone height on shell pages; never on test-bar screens | Destinations are invisible; an icon-only control needs explaining (UI_ANTI_PATTERNS.md) |
  | Fits a PWA on a phone | Partly | Yes (installed apps use bottom navigation) | Poorly |

  **Recommendation: (b).** Each destination is an icon with a visible label (never icon-only), the current one marked by more than color and by `aria-current="page"`, inside a `nav` landmark named "Main". It appears on shell pages only.
- **Where navigation does not appear:** test-bar screens (Reading test, review, retry: they keep their own bar with "Exit" or "Results"), and onboarding steps (a three-step focused flow; recommended, open question N2). Not-found and error pages show it, so a lost learner has a way on.
- **Header:** unchanged from M1 on phones (logo, language). From the tablet breakpoint: logo, the destinations, language. The header still scrolls away; the phone bar stays fixed at the bottom and respects the device's safe area and the on-screen keyboard (it hides while a text field has focus). **Direction v2 (owner, 2026-10-18):** from the desktop breakpoint the destinations are a sidebar at the start of the window, with the logo at its top; the header keeps only the language switcher. Below it, unchanged.
- **Steps:** 1. Tap "Practice" → the Practice Hub. 1. Tap "Home" → Home.
- **Step count:** 1 to either destination from any shell page.
- **Keyboard and screen readers:** the skip link stays first; the navigation comes after the header in the reading order on desktop and after `main` on phones (bottom bar), so screen readers reach the page content first; every destination is a link reachable by Tab.
- **Empty / error states:** without JavaScript the destinations are plain links. Offline: as the shell (offline scope is M14).
- **Languages checked:** M6-05 (2026-10-18): the two-destination bar at 320 px and the header links at 600 px in uz, ru and en (e2e fit and axe; screenshots at 320, 390, 600, 1024 and 1280 px). The four-item bar is checked when Progress and the account arrive.

### Practice Hub (M6)

- **Goal:** every practice test the app ships is in one place, each with where the learner stands with it on this device, so practice never depends on having the direct link.
- **Entry point:** "Practice" in the navigation. Direct test links keep working and keep bypassing onboarding.
- **Address:** `/{locale}/practice`, inside the shell.
- **Primary action:** opening a test. The Hub is a list, so no single red button: each test row is one link (the row's whole area), visually a quiet, distinct unit.
- **What it shows at 360 px, top to bottom:** the H1 "Practice"; a section per skill that has tests, in a fixed order (Reading now, Listening from M8), headed by the skill's name and icon in its supporting color; one row per test:
  - the test title (English test content, `lang="en"`), and its format as meta text: "3 passages · 40 questions · about 60 minutes";
  - its state on this device, as words and a small icon: **Not started**; **In progress** with the mode ("In progress · Practice", "In progress · Exam"); **Finished** with the latest practice score in the M5 wording ("Last result: 27 of 40 correct", never a band);
  - for a finished test, a quiet "See your last results" link next to the row (the row itself opens the test, where "Start again" is the start screen and the results are one tap away, as in M5).
- **Where a row leads:** the test's own address (`/{locale}/reading/{testId}`): the start screen, or the session in progress (resumed as in M4), so the Hub adds no new behavior to the test.
- **Skills without tests:** not shown (recommended, open question N3); Listening appears when M8 ships its first test.
- **Home and the Hub:** Home keeps its one primary action (the level check until M7, then M7's and M11's next action) and gains no second button: the navigation is the way to the Hub. On desktop the same.
- **Steps:** 1. Tap "Practice" → the Hub. 2. Tap a test → its start screen (or the session in progress). 3. Tap "Start" → the test (Practice preselected).
- **Step count:** 3 from Home to answering the first question; 2 to resume a test in progress.
- **States:**
  - **Loading:** the device's sessions and attempts are read after the page mounts (ADR-0009 §9): titles and formats render at once; the state line appears when known, without the list jumping (a reserved line).
  - **Storage blocked or failing:** titles and formats only, with the one-line notice "Your progress on this device can't be read." (proposed copy); every test still opens.
  - **No tests at all** (not possible with the shipped content, kept for safety): "No practice tests yet." and a link to Home.
  - **Offline after loading:** the list stays; opening a test needs the network (offline scope is M14).
  - The Hub never changes stored sessions or attempts by being visited.
- **Accessibility:** one H1; each skill section a heading (H2) with its list; each row a single link whose name includes the title, the format and the state; the state never by color alone.
- **Languages checked:** M6-06 (2026-10-18): every state in uz, ru and en at 320, 390 and 1280 px (screenshots), and 320 and 1280 px fit with axe in the e2e spec.

### Open questions (M6-02)

- **N1 Navigation model:** (a) header links, (b) phone bottom bar with header links from the tablet breakpoint, (c) a menu. **Recommendation: (b)**, sized for four destinations so M10 and M11 add items instead of reworking the shell.
- **N2 Navigation during onboarding:** (a) hidden on the three onboarding steps; (b) shown. **Recommendation: (a)**: onboarding is a short, focused flow, and its "Not now" already leads Home.
- **N3 Skills without tests in the Hub:** (a) not shown; (b) shown as "coming soon". **Recommendation: (a)**: a promise of something that does not exist yet is not useful practice, and it would show Writing and Speaking, which are post-beta.
- **N4 The finished state's score in the Hub:** (a) "Last result: 27 of 40 correct" (the M5 practice-score wording); (b) only "Finished". **Recommendation: (a)**: the learner's own fact, worded as in M5, never a band.
- **N5 Skill names in the navigation and the Hub** (audit Q4): translated in these interface places ("Чтение", "Oʻqish") or kept as the IELTS module names in English. **Recommendation: translated here**, kept in English inside test content.

### Interface copy (M6)

Approved for implementation (owner, 2026-10-18, task M6-04); keys are suggestions. Uzbek uses U+02BB for oʻ and gʻ. A fluent-speaker review of uz and ru is required before beta (M15-11).

| Key (suggested) | Used in | en | ru | uz |
|---|---|---|---|---|
| `nav.label` | Accessible name of the navigation landmark | Main | Основная навигация | Asosiy navigatsiya |
| `nav.home` | Navigation destination | Home | Главная | Bosh sahifa |
| `nav.practice` | Navigation destination | Practice | Практика | Mashq |
| `practice.title` | Hub H1 and page title | Practice | Практика | Mashq |
| `practice.skill.reading` | Skill section heading (N5 recommendation) | Reading | Чтение | Oʻqish |
| `practice.format` | Row meta text | {passages} passages · {questions} questions · about {minutes} minutes | Текстов: {passages} · вопросов: {questions} · около {minutes} минут | {passages} ta matn · {questions} ta savol · taxminan {minutes} daqiqa |
| `practice.state.notStarted` | Row state | Not started | Не начат | Boshlanmagan |
| `practice.state.inProgress` | Row state; `{mode}` is "Practice" or "Exam" (`reading.mode.*`) | In progress · {mode} | В процессе · {mode} | Davom etmoqda · {mode} |
| `practice.state.finished` | Row state with the latest practice score | Last result: {score} of {total} correct | Последний результат: верно {score} из {total} | Oxirgi natija: {total} tadan {score} tasi toʻgʻri |
| `practice.storageUnavailable` | Notice when the device's progress can't be read | Your progress on this device can't be read. | Не удаётся прочитать ваш прогресс на этом устройстве. | Bu qurilmadagi natijalaringizni oʻqib boʻlmadi. |
| `practice.empty` | No tests (safety state) | No practice tests yet. | Пока нет тестов для практики. | Hozircha mashq testlari yoʻq. |

Reused without change: "See your last results" (`reading.lastResults`), "Practice" and "Exam" (`reading.mode.*`), the skip link.

### Home v2 (Direction v2, owner 2026-10-18)

**Approved** (owner, 2026-10-18: the composition image [references/brand/direction-2026-10-18.png](../design/references/brand/direction-2026-10-18.png) and the session decisions). It replaces the layout of [Returning user → home](#returning-user--home); the next-action rules, the goal cookie, "Change goal" and every state stay as approved there.

- **What it shows at 360 px, top to bottom:** H1 "Welcome!" with one sentence; the **next-action card** (H2 "Find your level", the sentence, the red button): the one primary action, first; the **goal card** ("Goal", the target band large, the exam type as a chip, "Change goal"); **"Choose a skill"** with one card per skill that has tests (Reading now; Listening from M8), each a link to the Practice Hub. Nothing for data the device does not have (no progress, no estimate).
- **Desktop:** the sidebar; the goal card and the next-action card side by side (the action the wider), then the skill cards in a row. Visual values: [DESIGN_SYSTEM.md, Home v2](../design/DESIGN_SYSTEM.md#home-v2).
- **UX check:** 10-second rule: the welcome and the red button say what to do; one primary action: one red button, the skill card and "Change goal" are links; progressive disclosure unchanged.
- **Copy** (approved with the image; the Russian strings are the image's; a fluent-speaker review of uz and ru stays required before beta, M15-11):

| Key | Used in | en | ru | uz |
|---|---|---|---|---|
| `home.title` (changed) | Home H1 and page title | Welcome! | Добро пожаловать! | Xush kelibsiz! |
| `home.subtitle` | The sentence under the H1 | Keep going toward the band you need. | Продолжайте путь к желаемому баллу. | Kerakli ballingiz sari davom eting. |
| `home.goal.title` | The goal card's label | Goal | Цель | Maqsad |
| `home.chooseSkill` | H2 above the skill cards | Choose a skill | Выберите навык | Koʻnikmani tanlang |
| `home.skills.reading` | The Reading card's sentence | Build your reading skills. | Развивайте навыки чтения. | Oʻqish koʻnikmalarini rivojlantiring. |

Reused: `levelCheck.*`, `home.goal.targetBandNotSet`, `home.goal.change`, `examType.*`, `practice.skill.reading`.

## Level check flows (M7)

> **DRAFT, awaiting owner approval (M7-05).** Drafted in M7-02 (2026-10-18) on [LEVEL_CHECK.md](LEVEL_CHECK.md) (purpose, scope, the result model and its decisions D1–D14). Visual values follow in DESIGN_SYSTEM.md (M7-03); the data in the M7 ADR (M7-04). The copy is in [Interface copy (M7)](#interface-copy-m7). Steps count from onboarding step 3 or Home; the level check replaces the interim page at `/{locale}/level-check` ([open question 1 of M3](#open-questions-m3)).

**Screens:** the **intro** (`/{locale}/level-check`), the **section** (`/{locale}/level-check/reading`: the Reading engine with the check's own bar), and the **result** (`/{locale}/level-check/result`). The section and the result are the shell-less test-screen layout with their own bar, like Reading; the intro and the result are inside the shell. Only the Reading section exists in M7 (D1); M9 adds `/level-check/listening` and its result.

### Onboarding step 3 → level check → result → next action
- **Goal:** a learner who has just set a goal finds a starting point in about 15 minutes and knows what to practise first.
- **Entry point:** "Start the level check" on onboarding step 3 or on Home's next-action card.
- **Primary action:** on the intro, "Start"; in the section, answering; on the result, "Practise Reading".
- **Steps:**
  1. **Intro.** H1 "Find your level"; what it covers, as three short lines: "Reading · 2 short texts · 14 questions", "About 15 minutes. No time limit.", "Your answers are saved on this device, so you can stop and continue later."; the honest line "You get a starting point on our practice scale, not an IELTS band."; for a learner whose goal is General Training, one more line: "The texts are Academic-style. The reading skills it checks are the same." (D6); the red "Start"; the quiet "Not now" → Home.
  2. **Tap "Start"** → the section: passage 1 with question 1 in the partial sheet, exactly the M4 reading screen in Practice without a timer, without "Mark for review" and without evidence pins (LEVEL_CHECK.md §3); highlighting stays. The bar reads "Exit" on the start side and "Passage 1 of 2" on the end side. Progress is the sheet's "Question 3 of 14" and the navigator.
  3. **Answer and move** as in Reading ([Answer and move between questions](#answer-and-move-between-questions)); the navigator lists the 14 questions in two passages.
  4. **"Finish"** (on question 14 or at the end of the navigator) → the confirmation in the expanded sheet: "Finish the check?", the unanswered count if any, the red "Finish" and the quiet "Keep working". **"Finish"** → the section is committed once and checked (LEVEL_CHECK.md §5), and the result opens.
  5. **Result.** Focus on the H1. H1 "Your Reading starting point"; the level name as the page's figure ("On the way"); "9 of 14 correct"; the scope sentence "Based on 14 questions in a short check, not a full test."; the honest line "This is where to start on our practice scale. It is not an IELTS band."; **"Practise first:"** with at most two question types named in English test terms ("True / False / Not Given questions", "matching headings"), or, with none, "Any Reading practice is a good next step."; the red **"Practise Reading"** → the Practice Hub (D11); the quiet "See your answers" → the M5 review of the check's attempt (D13) and the quiet "Take the check again" (D10). For a General Training goal, the Academic-style line again.
  6. **Home afterwards:** the next-action card reads "Practise Reading" with "You have a Reading starting point. Keep going with a practice test." and the red "Practise Reading" → the Hub; a quiet "See your starting point" link under it → the result page (D12: Home knows the state only; the result page reads the device). Onboarding step 3, if revisited, shows the same card content in place of the invitation.
- **Step count:** 2 from step 3 or Home to the first question (intro, Start); 2 to finish from the last question (Finish, confirm); 1 from the result to Reading practice. 3-click rule: Home → intro → Start = 2.
- **UX check:** 10-second rule: the intro is one heading, three facts and one red button; the result is one level name, one number and one red button. One primary action on every screen; "Not now", "See your answers" and "Take the check again" are quiet. Progressive disclosure: no settings, no mode choice (the check has one mode), no explanation of the scale beyond one line (the review explains the answers).
- **Honest wording:** every result string names the skill, the scale and what it is not; the level name is never a number; the scope sentence is always shown ([LEVEL_CHECK.md §9](LEVEL_CHECK.md#9-honest-wording)).
- **Empty / error states:**
  - **Insufficient data** (more than half unanswered, D9): the result's H1 is "Not enough answers for a starting point", then "5 of 14 answered.", "Answer at least half of the questions to get a starting point.", the red "Take the check again" and the quiet "Practise Reading". Home's card stays "Find your level".
  - **Storage blocked or unavailable** (private window, full storage): the intro says "Your answers can't be saved on this device. Don't close the page while you take the check." under the facts; the section runs in memory for the tab; "Exit" asks "Leave the check? Your answers can't be saved on this device." (red "Stay", quiet "Leave"); the result is shown with the M5 storage notice and Home cannot know about it (the cookie flag is still written, D12, so Home still moves on).
  - **A result on the device from an earlier form version** (the form changed): the result page shows the stored level and score with "The check has changed since you took it, so your answers can't be reviewed." and offers "Take the check again"; Home's state stays "finished".
  - **Offline after loading:** the section works to the end (content and checking are in the page); the result opens; nothing needs the network until the Hub. Opening offline → the M1 error state.
  - **Without JavaScript:** the intro and the result's safe states are plain pages; the section needs JavaScript (as the Reading screen does).
- **Accessibility:** the intro's H1 labels the page; the section's skip link, sheet, navigator and finish confirmation are the Reading screen's; the result's H1 takes focus when it replaces the section; the level name, the score and "Practise first" are text, never color or a gauge; the question-type names in English are marked `lang="en"`.
- **Languages checked:** not yet. To verify in M7-09 and M7-10 at 320 px: the Russian intro facts, the Uzbek result H1 "Oʻqish boʻyicha boshlangʻich nuqtangiz" and the "Practise first" line with two English type names.

### Leave and come back
- **Goal:** nothing is lost when the phone locks, the tab closes, or the learner taps "Exit"; the check is finished in a later sitting.
- **Steps:** 1. "Exit" in the section's bar → Home (no confirmation: there is no timer, and the answers are saved on the device at every change). 2. Later, "Continue the level check" on Home's card or on onboarding step 3, or opening `/{locale}/level-check` → the intro in its **in-progress form**: H1 "Continue the level check", "You answered 6 of 14 questions. Pick up where you left off.", the red "Continue" → the section at the question where the learner left, and the quiet "Start over" → the section from question 1 with the answers cleared (the old session is discarded; nothing was committed).
- **Step count:** 1 to leave; 1 to resume from Home (the intro's "Continue"), 2 from a cold open.
- **Empty / error states:** the saved session is unreadable or from an earlier form version → it counts as not started: the normal intro, with no error. Storage blocked → as above: nothing to resume; the intro is the normal one.

### Take the check again
- **Goal:** a learner who wants a fresh starting point takes the same check again; the latest finished result is the starting point, all results are kept (D10).
- **Entry point:** "Take the check again" on the result page, or the intro opened after a finished check.
- **Steps:** 1. The intro in its **finished form**: H1 "Find your level", "You took this check on {date}. Your starting point: On the way.", the same facts, the honest line, and one more: "It has the same questions as before. Practice tells you more than repeating a check." (D10), the red "Take the check again", the quiet "See your starting point" → the result. 2. "Take the check again" → the section from question 1. 3. Finish as above → the new result; Home's card is unchanged ("Practise Reading").
- **Step count:** 2 from the result page (Take the check again on the result opens the intro's finished form; its red button starts). *Alternative for the owner:* the result's "Take the check again" starts the section directly (1 step) and the honest "same questions" line moves onto the result page. **Recommendation:** the intro in between, so the honest line is read before starting, and one entry point serves every case.
- **Empty / error states:** a retake left unfinished → "Continue the level check" as above; it does not touch the earlier result.

### Direct entry
- **Goal:** a direct link to `/{locale}/level-check` works for anyone, with or without a goal ([PRODUCT.md, direct entry paths](PRODUCT.md#approved-product-principles)).
- **Steps:** 1. Open the link → the intro in the form that matches the device's state (not started, in progress, finished). The goal is not required; without one, the General Training line is not shown.
- **Step count:** 2 to the first question.
- **Empty / error states:** `/level-check/reading` opened directly with nothing in progress → redirected to the intro. `/level-check/result` with no finished check on the device → "No starting point on this device yet", "The result appears here after you finish the check on this device.", the red "Find your level" → the intro.

### Interface copy (M7)

**DRAFT.** Keys are suggestions; `levelCheck.*` extends the M3 namespace. Uzbek uses U+02BB for oʻ and gʻ; band values and the English test terms (question types, TRUE / FALSE / NOT GIVEN) stay in English in every language (`lang="en"`). A fluent-speaker review of uz and ru is required before beta (M15-11). Reused without change: `levelCheck.title` ("Find your level"), `levelCheck.start` ("Start the level check"), `onboarding.notNow`, `reading.exit`, `reading.passageOf`, the sheet, navigator and answer strings, `reading.finish.unanswered`, `reading.finish.confirm`, `reading.finish.cancel`, `reading.results.storageUnavailable`, `reading.results.score` ("{score} of {total} correct"), `common.goHome`, `nav.practice`.

| Key (suggested) | Used in | en | ru | uz |
|---|---|---|---|---|
| `levelCheck.intro.covers` | Intro fact 1 (`{passages}`, `{questions}` are numbers; "Reading" in English) | Reading · {passages} short texts · {questions} questions | Reading · коротких текстов: {passages} · вопросов: {questions} | Reading · {passages} ta qisqa matn · {questions} ta savol |
| `levelCheck.intro.time` | Intro fact 2 | About {minutes} minutes. No time limit. | Около {minutes} минут. Без ограничения времени. | Taxminan {minutes} daqiqa. Vaqt cheklanmagan. |
| `levelCheck.intro.saved` | Intro fact 3 | Your answers are saved on this device, so you can stop and continue later. | Ответы сохраняются на этом устройстве: можно остановиться и продолжить позже. | Javoblaringiz shu qurilmada saqlanadi: toʻxtab, keyinroq davom etishingiz mumkin. |
| `levelCheck.intro.honest` | Intro, the honest line | You get a starting point on our practice scale, not an IELTS band. | Вы получите стартовую точку по нашей шкале практики, а не балл IELTS. | Siz IELTS balini emas, bizning mashq shkalamiz boʻyicha boshlangʻich nuqtani olasiz. |
| `levelCheck.intro.academicNote` | Intro and result, General Training goal | The texts are Academic-style. The reading skills it checks are the same. | Тексты в стиле Academic. Навыки чтения, которые проверяются, те же. | Matnlar Academic uslubida. Tekshiriladigan oʻqish koʻnikmalari bir xil. |
| `levelCheck.intro.start` | Intro, red (not started) | Start | Начать | Boshlash |
| `levelCheck.intro.storageUnavailable` | Intro, storage blocked | Your answers can't be saved on this device. Don't close the page while you take the check. | Ответы не сохранятся на этом устройстве. Не закрывайте страницу, пока проходите проверку. | Javoblaringiz bu qurilmada saqlanmaydi. Tekshiruv davomida sahifani yopmang. |
| `levelCheck.resume.title` | Intro H1 and page title, in progress; Home card title; onboarding step 3 | Continue the level check | Продолжить проверку уровня | Daraja tekshiruvini davom ettirish |
| `levelCheck.resume.body` | Intro, in progress | You answered {answered} of {total} questions. Pick up where you left off. | Вы ответили на {answered} из {total} вопросов. Продолжите с того места, где остановились. | Siz {total} tadan {answered} ta savolga javob berdingiz. Toʻxtagan joyingizdan davom eting. |
| `levelCheck.resume.continue` | Intro, red, in progress | Continue | Продолжить | Davom etish |
| `levelCheck.resume.startOver` | Intro, quiet, in progress | Start over | Начать заново | Qaytadan boshlash |
| `levelCheck.retake.body` | Intro, finished (`{date}` locale-formatted; `{level}` the level name) | You took this check on {date}. Your starting point: {level}. | Вы проходили эту проверку {date}. Ваша стартовая точка: {level}. | Siz bu tekshiruvni {date} kuni oʻtgansiz. Boshlangʻich nuqtangiz: {level}. |
| `levelCheck.retake.sameQuestions` | Intro, finished; honest line | It has the same questions as before. Practice tells you more than repeating a check. | Вопросы те же, что и в прошлый раз. Практика скажет больше, чем повтор проверки. | Savollar avvalgidek. Tekshiruvni takrorlashdan koʻra mashq koʻproq narsani koʻrsatadi. |
| `levelCheck.retake.start` | Intro, red, finished; result, quiet | Take the check again | Пройти проверку ещё раз | Tekshiruvni qayta oʻtish |
| `levelCheck.section.title` | Section page title | Level check: Reading | Проверка уровня: Reading | Daraja tekshiruvi: Reading |
| `levelCheck.finish.button` | Last question and navigator, red | Finish | Завершить | Yakunlash |
| `levelCheck.finish.title` | Finish confirmation heading | Finish the check? | Завершить проверку? | Tekshiruv yakunlansinmi? |
| `levelCheck.exitUnsaved.title` | "Exit" confirmation, storage blocked | Leave the check? | Выйти из проверки? | Tekshiruvdan chiqasizmi? |
| `levelCheck.exitUnsaved.body` | "Exit" confirmation, storage blocked | Your answers can't be saved on this device. | Ответы не сохранятся на этом устройстве. | Javoblaringiz bu qurilmada saqlanmaydi. |
| `levelCheck.result.title` | Result H1 and page title ("Reading" in English) | Your Reading starting point | Ваша стартовая точка по Reading | Reading boʻyicha boshlangʻich nuqtangiz |
| `levelCheck.result.scope` | Result, the scope sentence | Based on {questions} questions in a short check, not a full test. | На основе {questions} вопросов короткой проверки, а не полного теста. | Toʻliq test emas, qisqa tekshiruvdagi {questions} ta savol asosida. |
| `levelCheck.result.honest` | Result, the honest line | This is where to start on our practice scale. It is not an IELTS band. | Это стартовая точка по нашей шкале практики, а не балл IELTS. | Bu bizning mashq shkalamiz boʻyicha boshlangʻich nuqta, IELTS bali emas. |
| `levelCheck.result.practiseFirst` | Result, label before the type names | Practise first: | Начните с: | Avval mashq qiling: |
| `levelCheck.result.practiseAny` | Result, when no type stands out | Any Reading practice is a good next step. | Любая практика Reading будет хорошим следующим шагом. | Har qanday Reading mashqi yaxshi keyingi qadam. |
| `levelCheck.result.practise` | Result, red; Home card, red | Practise Reading | Практиковать Reading | Reading mashq qilish |
| `levelCheck.result.seeAnswers` | Result, quiet | See your answers | Посмотреть ответы | Javoblarni koʻrish |
| `levelCheck.result.insufficient.title` | Result H1, insufficient data | Not enough answers for a starting point | Недостаточно ответов для стартовой точки | Boshlangʻich nuqta uchun javoblar yetarli emas |
| `levelCheck.result.insufficient.answered` | Result, insufficient data | {answered} of {total} answered. | Дано ответов: {answered} из {total}. | {total} tadan {answered} tasiga javob berilgan. |
| `levelCheck.result.insufficient.body` | Result, insufficient data | Answer at least half of the questions to get a starting point. | Ответьте хотя бы на половину вопросов, чтобы получить стартовую точку. | Boshlangʻich nuqtani olish uchun kamida yarim savolga javob bering. |
| `levelCheck.result.oldForm` | Result from an earlier form version | The check has changed since you took it, so your answers can't be reviewed. | Проверка изменилась после того, как вы её прошли, поэтому разобрать ответы нельзя. | Siz oʻtganingizdan keyin tekshiruv oʻzgargan, shuning uchun javoblarni koʻrib boʻlmaydi. |
| `levelCheck.result.none.title` | Result page, nothing finished on this device | No starting point on this device yet | На этом устройстве пока нет стартовой точки | Bu qurilmada hali boshlangʻich nuqta yoʻq |
| `levelCheck.result.none.body` | Result page, nothing finished | The result appears here after you finish the check on this device. | Результат появится здесь, когда вы завершите проверку на этом устройстве. | Natija shu qurilmada tekshiruvni yakunlaganingizdan keyin shu yerda paydo boʻladi. |
| `levelCheck.levels.1` | Level name (D14) | Starting out | Начало пути | Boshlanish |
| `levelCheck.levels.2` | Level name | On the way | В пути | Yoʻlda |
| `levelCheck.levels.3` | Level name | Strong start | Уверенный старт | Ishonchli boshlanish |
| `levelCheck.types.trueFalseNotGiven` | "Practise first" type name (English test term inside) | <en>True / False / Not Given</en> questions | вопросы <en>True / False / Not Given</en> | <en>True / False / Not Given</en> savollari |
| `levelCheck.types.matchingHeadings` | "Practise first" type name | matching headings | подбор заголовков (<en>matching headings</en>) | sarlavhalarni moslashtirish (<en>matching headings</en>) |
| `levelCheck.types.sentenceCompletion` | "Practise first" type name | sentence completion | дополнение предложений (<en>sentence completion</en>) | gaplarni toʻldirish (<en>sentence completion</en>) |
| `levelCheck.types.multipleChoice` | "Practise first" type name | multiple choice | выбор ответа (<en>multiple choice</en>) | javobni tanlash (<en>multiple choice</en>) |
| `home.nextAction.practiseReading.body` | Home card after a finished check | You have a Reading starting point. Keep going with a practice test. | У вас есть стартовая точка по Reading. Продолжайте с практического теста. | Sizda Reading boʻyicha boshlangʻich nuqta bor. Mashq testi bilan davom eting. |
| `home.nextAction.seeStartingPoint` | Home card, quiet | See your starting point | Посмотреть стартовую точку | Boshlangʻich nuqtani koʻrish |
| `home.nextAction.continueCheck.body` | Home card while the check is in progress | You stopped partway. Your answers are saved on this device. | Вы остановились на середине. Ответы сохранены на этом устройстве. | Siz oʻrtasida toʻxtadingiz. Javoblaringiz shu qurilmada saqlangan. |

Type names for the other M4 question types follow the same pattern when a form uses them (M7-06 adds the keys it needs). "Reading" stays in English in the level-check copy because it names the IELTS part being checked (N5: English inside test content and the level check; translated in navigation and the Hub).
