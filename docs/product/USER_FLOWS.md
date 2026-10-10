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
- **Layout at 360 px:** inside the shell, top to bottom: the step indicator (small meta text, with a slim progress bar if M3-02 approves one), the question as the page's H1, the "You can change this later." line, then the answers as a vertical list of full-width answer buttons (each at least 48 px high). On step 2, the five band values may sit in a compact grid of equal buttons with "I don't know yet" full width below; M3-02 proposes the arrangement. Nothing else: no illustration, no hero, no explanation of the product. Step 3: indicator, H1, the sentence, the full-width red primary button, and the "Not now" link under it.
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
  4. **Small progress preview**, only when there is practice history: one short line, no chart, no tiles (for example how many practices this week). "Your progress" itself belongs to M8. **Not shown in M3** (no data).
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

**DRAFT: awaiting owner approval** (task M4-02, decided at the M4-09 gate). The screen they run on is specified in [READING_EXPERIENCE.md, Mobile reading screen (M4)](READING_EXPERIENCE.md#mobile-reading-screen-m4); modes in [Practice and Exam Mode (M4)](READING_EXPERIENCE.md#practice-and-exam-mode-m4).

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

**PROPOSED: awaiting owner approval** (tasks M4-01 to M4-04, decided at the M4-09 gate). Interface strings only: test content (passages, questions, instructions, TRUE/FALSE/NOT GIVEN, option texts) stays in English and comes from the content, not from the catalogs. A fluent-speaker review of the uz and ru strings is required before beta. Uzbek uses U+02BB for oʻ and gʻ. Keys are suggestions for M4-13 to M4-21.

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
