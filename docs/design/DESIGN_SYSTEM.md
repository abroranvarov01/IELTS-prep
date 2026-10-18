# Design System

Canonical owner of **design token values, the token policy, and component state conventions**.

> **STATUS:**
>
> - **Core brand palette: APPROVED.** Change it only with explicit product approval.
> - **Everything else** (neutrals, skill shades, type sizes, spacing, radii, shadows, breakpoints): **INITIAL DIRECTION / SUBJECT TO DESIGN REVIEW**, unless a section marks a value Approved.
>
> Once implementation starts, the token source in code becomes the single source of truth for values. This document then describes intent and usage and stops duplicating raw numbers.
>
> **Token source in code:** `apps/web/src/shared/ui/tokens.css` (Tailwind v4 `@theme`). Tailwind's default colors, spacing, radii, font sizes, font weights, and shadows are reset there, so only these tokens produce utilities. Fonts are loaded in `apps/web/src/app/[locale]/layout.tsx` (`next/font`). `pnpm lint` runs `scripts/check-tokens.mjs`, which rejects raw colors outside the token file. The content max width (`--container-content`, `max-w-content`) the raised shadow (`--shadow-raised`, `shadow-raised`), and the Heading 1 size (`--text-heading-1` with its line height, `text-heading-1`) are in code. Since M3-07, M3-08, M4-13 and M4-18 also: the passage highlight (`--color-highlight`, `bg-highlight`), the Heading 2 and 3 sizes (`--text-heading-2`, `--text-heading-3`), the passage size (`--text-passage`, `text-passage`, Literata via `font-passage`), the reading measure (`--container-measure`, `max-w-measure`), the "base" duration (`--duration-base`, used as `duration-(--duration-base)`), the small meta text size (`--text-meta`, `text-meta`), the tablet breakpoint (`--breakpoint-tablet`, `tablet:`), the onboarding and home column (`--container-column`, `max-w-column`), the "fast" duration and easing as Tailwind's transition defaults (`--default-transition-duration`, `--default-transition-timing-function`), and since M5-06 the status color for correct answers (`--color-status-correct`, used only by the outcome icons in `shared/ui/OutcomeIcon.tsx`, shared by the Reading and Listening results since M9-08). The M3 primary button lives in `apps/web/src/shared/ui/` as `PrimaryLink` and `PrimaryButton` (shared classes in `primary-action.ts`), the quiet link as `QuietLink`, the answer option as `AnswerOption` and the option row as `OptionRow`; the M4 Reading components in `apps/web/src/views/reading-test/ui/` (`QuestionSheet`, `SecondaryButton`, `TestBar`, `ExamTimer`, the desktop `QuestionColumn` and `QuestionBar`, `ConfirmDialog`, sheet heights in `SHEET_HEIGHT`) and `apps/web/src/features/mark-passage/ui/` (`PassageView`, `SentenceActions`, `EvidenceList`). Tailwind's default breakpoints and container sizes are reset, so no unapproved breakpoint exists. The desktop breakpoint (64rem) is used since M4-21 by the Reading screen, which renders a different layout from it (a `matchMedia` query in `views/reading-test/ui/TestWorkspace.tsx`); no CSS uses it yet, so it has no token (added when first needed, owner decision 2026-10-09; the M1 values were approved on 2026-10-10 with the condition that no speculative token is added). Since the onboarding art direction (owner request, 2026-10-12): the desktop breakpoint (`--breakpoint-desktop`, `desktop:`) is in CSS for the onboarding composition. Since the visual overhaul (owner request, 2026-10-12): the soft selected tint (`--color-brand-blush-soft`, `bg-brand-blush-soft`), the [quiet button](#quiet-button) (`QUIET_BUTTON` in `apps/web/src/shared/ui/quiet-action.ts`) and the [line icons](#icons) (`LineIcon` and the shared check, chevron and close icons in `apps/web/src/shared/ui/icons.tsx`).

## Token policy

Tokens exist to hold **design decisions**, not to give every number a name.

**Must use tokens:**

- **All colors.** No raw color values (hex, rgb, hsl, named colors) appear outside the token definitions. The only exception is platform metadata that cannot read CSS variables (the web app manifest and the `theme-color` meta tag). It must mirror token values exactly, and the token check allowlists it explicitly.
- Typography (families, sizes, weights, line heights), the spacing scale, radii, shadows, and motion durations.
- Any value that is repeated or carries semantic meaning (e.g. "page gutter", "touch target minimum"), and reusable component states.

**May stay local:**

- A genuinely local structural dimension. For example, the fixed aspect of one illustration, or the width of a specific layout column that only this component uses. It may stay in the component when a global token would add indirection without reusable or semantic meaning.

**Never:**

- Use a local value to bypass the system, for example an "almost-16" padding, an off-scale font size, or a one-off radius. If a design needs a value the scale lacks, either use the nearest scale value or propose a scale change here.
- Add tokens "for completeness". Every token exists because it is used.

Contrast values below were computed with the WCAG 2.x formula. Re-verify them whenever a value changes.

## Color

### Core brand palette (APPROVED)

| Token               | Value     | Role                                                                    | Contrast notes                                                                                                                  |
| ------------------- | --------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `brand.primary`     | `#E51F3A` | Primary brand and action color: primary CTAs, key brand moments         | White text on it: 4.6:1 (passes AA). As text on `surface.warm`: 4.4:1, **fails** for small text. Use `brand.primaryDeep` there. |
| `brand.primaryDeep` | `#D90D31` | Pressed/hover state, red text on light surfaces                         | White text on it: 5.2:1. On `surface.warm`: 4.9:1.                                                                              |
| `brand.highlight`   | `#FF5268` | Non-text accents: indicators, progress fills, small graphic details     | 3.15:1 on white. Meets 3:1 for non-text UI only. **Never** use it for text, and never with white text on it.                    |
| `brand.blush`       | `#F7C7CA` | Soft brand surfaces, selected/emphasis backgrounds                      | Use only `ink` text on it (12.4:1). Red text on blush fails.                                                                    |
| `ink`               | `#111318` | Primary text, headings                                                  | 18.6:1 on white, 17.7:1 on `surface.warm`                                                                                       |
| `surface.warm`      | `#FFF8F4` | Warm background: page backgrounds behind white surfaces, quiet grouping | n/a                                                                                                                             |
| `surface.base`      | `#FFFFFF` | Default surface. The interface is white-first.                          | n/a                                                                                                                             |

Red is the application's **unmistakable** primary action color. No other color (including skill colors) is used for a primary CTA.

### Neutrals (proposal)

| Token            | Proposed value | Use                          | Contrast                                            |
| ---------------- | -------------- | ---------------------------- | --------------------------------------------------- |
| `text.secondary` | `#4A4F59`      | Supporting text              | 8.2:1 white, 7.8:1 warm                             |
| `text.tertiary`  | `#5B616B`      | Minimum for small meta text  | 6.2:1 white, 5.9:1 warm                             |
| `border.subtle`  | `#E2E4E8`      | Decorative dividers only     | 1.3:1 (not for essential boundaries)                |
| `border.control` | `#8A9099`      | Input and control boundaries | 3.2:1 white, 3.1:1 warm (meets 3:1 for non-text UI) |

**Approved** (owner, 2026-10-10, task M3-05; proposed in M3-02): `text.secondary` (the "You can change this later." line and the step indicator text), `border.control` (the answer option's boundary), and `border.subtle` (the progress track, decorative). `text.tertiary` remains a proposal until used.

**Approved** (owner, 2026-10-10, task M4-09; proposed in M4-05): `text.tertiary` (disabled option text in "choose several").

### Selected tint

**Visual overhaul** (owner request, 2026-10-12; values to confirm in the owner's screenshot review). The owner asked for a subtle selected background: `brand.blush` was too loud on rows that are chosen often.

| Token             | Value                                                      | Use                                                                                                              | Contrast                                                                                                                               |
| ----------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `brand.blushSoft` | `#FCE9EA` (`brand.blush` mixed 40% into white: no new hue) | Selected answers and options, the selected sentence, the current gap, and hover and open states of quiet buttons | `ink` 15.9:1, `text.secondary` 7.0:1. Never the only sign of a state: a selected answer also has the 2 px `ink` boundary and the check |

`brand.blush` itself is unchanged and stays in the palette for later emphasis surfaces.

### Status colors

Status colors (correct, incorrect, warning, info) are **TBD** and will be set at implementation. Constraints:

- "Incorrect" must stay clearly distinguishable from the brand red and from Reading's red family.
- Status is never conveyed by color alone (see [ACCESSIBILITY.md](ACCESSIBILITY.md)).

### Skill recognition colors

**Families: APPROVED. Exact shades: proposal.** Skill colors are supporting only. They help users recognize a skill. They never act as a CTA color and never appear in gradients.

| Skill     | Family      | Strong (icon/marker)            | Tint (background) | Notes                                                                                              |
| --------- | ----------- | ------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------- |
| Reading   | Red         | `#D90D31` (`brand.primaryDeep`) | `#FDE8EA`         | Strong on tint is 4.4:1. Use `ink` labels on the tint, and use the strong color for icons/markers. |
| Listening | Blue        | `#1D5FD1`                       | `#EAF1FD`         | Strong on tint 5.1:1                                                                               |
| Speaking  | Green       | `#0F7A5A`                       | `#E8F6F0`         | Strong on tint 4.8:1                                                                               |
| Writing   | Warm orange | `#C2410C`                       | `#FFEDDF`         | Strong on tint 4.5:1 (borderline; prefer `ink` labels)                                             |

Because Reading shares the brand's red family, Reading identity must rely on the **skill name and icon** as well as color. A Reading tag must never look like a button.

### Dark mode

**TBD.** Do not build dark mode until it is decided. Keep components token-based so that it stays possible.

## Typography

| Role                  | Proposal                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| UI font               | **Onest** (owner decision 2026-10-09, replacing Manrope, which has no U+02BB/U+02BC glyphs). Weights 400, 500, 700, 800. |
| Passage font          | **Literata** (approved direction), subject to real readability and font-coverage testing on phones. Weights 400, 700.    |
| Body size (mobile)    | 16 px minimum. Never smaller for running text.                                                                           |
| Passage size (mobile) | 17–18 px, line height ~1.6, measure ≤ ~70 characters on desktop                                                          |
| Headings              | Bold/extra-bold. Hierarchy through size and weight.                                                                      |
| Small meta text       | 13–14 px minimum, `text.tertiary` or darker                                                                              |

- **Required verification before adoption:** both fonts render Cyrillic and U+02BB/U+02BC correctly, and they load acceptably on slow mobile connections (subsetting, `font-display`).
- Text must respect the user's font-size settings. Use relative units.

### Type scale

**Approved** (owner, 2026-10-10, task M1-03; proposed in M1-02), with Heading 1 and Heading 2 **revised in the visual overhaul** (owner request, 2026-10-12: mobile headings felt oversized; previously 1.75rem/1.2 and 1.375rem/1.3). Sizes are in rem (16 px = 1rem at the default browser setting), so text follows the user's font-size setting. Line heights are unitless. One scale for every width: on desktop, hierarchy comes from layout and spacing, not from bigger type.

| Role                   | Size                    | Line height | Weight     | Rationale                                                                                                                                                                          |
| ---------------------- | ----------------------- | ----------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Heading 1 (page title) | 1.5rem (24 px)          | 1.25        | 800        | Bold and clear at the top of a phone screen without shouting; the weight carries it. A long Russian or Uzbek title fits in two lines at 320 px.                                    |
| Heading 2 (section)    | 1.25rem (20 px)         | 1.3         | 700        | Between H1 and H3; with its weight, clearly above body (the passage title, the next action on home).                                                                               |
| Heading 3 (subsection) | 1.125rem (18 px)        | 1.4         | 700        | The smallest heading. It is told apart from body by weight.                                                                                                                        |
| Body                   | 1rem (16 px, unchanged) | 1.5         | 400        | The existing minimum body size. 1.5 is the line height Tailwind's base styles already apply; this makes it explicit.                                                               |
| Small meta text        | 0.875rem (14 px)        | 1.4         | 400 or 500 | The top of the allowed 13–14 px range, for reading outdoors. Color `text.tertiary` or darker: 6.2:1 on `surface.base`, 5.9:1 on `surface.warm`.                                    |
| Passage (Literata)     | 1.0625rem (17 px)       | 1.6         | 400        | Larger than body for long reading. 17 px rather than 18 px keeps more words per line on a 320–360 px phone, where Literata sets wide. The user's font-size setting can enlarge it. |

All headings and body text use `ink` (18.6:1 on `surface.base`, 17.7:1 on `surface.warm`). Heading levels below H3 are not needed yet.

## Spacing

A 4 px base unit. Proposed scale: 4, 8, 12, 16, 24, 32, 48, 64. Mobile page gutter: 16 px (verify at 320 px width).

**Approved** (owner, 2026-10-10, task M3-05; proposed in M3-02): the steps the M3 components use, 4, 8, 12, 16 (gutter), 24, 32, and 48. See [M3 components](#m3-components-onboarding-and-home). 64 remains a proposal until something uses it.

## Radii

Soft, modern surfaces with moderately generous corners, applied **systematically by element size**, so the result does not look like "everything is a pill".

| Token         | Proposed value | Use                                                                |
| ------------- | -------------- | ------------------------------------------------------------------ |
| `radius.sm`   | 8 px           | Small elements: tags, checkboxes, inline highlights                |
| `radius.md`   | 14 px          | Buttons, inputs, answer options                                    |
| `radius.lg`   | 20 px          | Cards and content surfaces                                         |
| `radius.xl`   | 28 px          | Bottom sheets (top corners), dialogs                               |
| `radius.full` | 9999 px        | **Only** avatars, toggles, progress tracks, and small status chips |

Primary buttons use `radius.md`. They are not pills. Nested surfaces use a smaller radius than their container.

**Approved** (owner, 2026-10-10, task M3-05; proposed in M3-02): `radius.md` (14 px: the primary button and the answer option) and `radius.full` (the step indicator's progress track). The others remain proposals until used.

**Approved** (owner, 2026-10-10, task M4-09; proposed in M4-05): `radius.sm` (navigator cells, the selected-sentence background) and `radius.xl` (the question sheet's top corners).

## Shadows / elevation

Minimal. Proposal: **two levels at most**: none (default) and a subtle raised level for overlays, bottom sheets, and sticky elements. Separation comes from spacing and surface color (`surface.base` on `surface.warm`) first.

**Raised level: Approved** (owner, 2026-10-10, task M1-03; proposed in M1-02). One shadow: `0 2px 12px 0` in `ink` at 12% opacity. **Soft level** (Direction v2, owner 2026-10-18): `0 4px 16px 0` in `ink` at 6% opacity, for cards that are objects on white (option cards, test rows, skill cards, the next-action card). The third level is none.

- Rationale: a soft, short shadow lifts overlays, bottom sheets, and sticky elements without looking dated. With a small vertical offset and a larger blur, it also shows along the top edge of a bottom sheet. Deriving it from `ink` keeps it inside the palette.
- Contrast: the shadow is supporting depth, not an essential boundary, so it has no contrast requirement. Where an edge is essential to understand the component, it also needs a boundary of at least 3:1 (`border.control`) or a scrim.

## Motion

Short (≤ 200 ms) and functional: it shows a state change or a spatial relationship (for example, a bottom sheet expanding). Never delay interaction. Honor `prefers-reduced-motion`.

**Durations and easing: Approved** (owner, 2026-10-10, task M1-03; proposed in M1-02).

| Token         | Value                        | Use                                                                | Rationale                                                                                  |
| ------------- | ---------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| Duration fast | 120 ms                       | Small state changes: color, opacity, pressed state, a list opening | Feels immediate, but still shows that something changed.                                   |
| Duration base | 200 ms                       | Spatial changes: a bottom sheet expanding, a panel sliding in      | The documented maximum. Larger movements need slightly more time to follow.                |
| Easing        | `cubic-bezier(0.2, 0, 0, 1)` | All transitions                                                    | Starts fast and settles gently, so a response begins at once and never feels like a delay. |

With `prefers-reduced-motion: reduce`, transitions and animations are effectively off (the base styles in `globals.css` already do this).

## Component states

Every interactive component defines: default, hover (pointer devices), focus-visible, pressed, disabled, loading. Where it applies, also selected, error, and correct/incorrect (answer states). The focus-visible state is never removed.

**Focus-visible style: Approved** (owner, 2026-10-10, task M1-03; proposed in M1-02). A 2 px solid `ink` outline, offset 2 px from the element, on every focusable element. This is the style F-09 implemented as an assumption, approved unchanged.

- Rationale: `ink` is the highest-contrast token and does not compete with the red primary action or look like an error. The offset puts the ring on the surface around the element, so it stays visible on red buttons too. An outline (not a box shadow) also stays visible in Windows forced-colors mode.
- Contrast of the ring against the surface around it: 18.6:1 on `surface.base`, 17.7:1 on `surface.warm`, 12.4:1 on `brand.blush`, and 15.8:1 or more on every skill tint. All meet the 3:1 minimum for non-text UI. The ring is 2 px thick and fully surrounds the element, as WCAG 2.2's focus appearance criterion (2.4.13) describes.
- Limit: against `brand.primary` the ring would be only 4.1:1, and 3.6:1 against `brand.primaryDeep`. Both still pass 3:1, with less margin.

## Shared controls (visual overhaul)

**Visual overhaul** (owner request, 2026-10-12; to confirm in the owner's screenshot review). They replace underlined links and mixed icons in bars and headers, so tools stop looking like raw HTML.

### Quiet button

For tool actions in bars, headers and panels: the test bar's "Exit", "Mark for review", "All questions", "Back", the sentence actions, the other passages in the desktop navigator bar, and the language switcher.

| Property             | Value                                                                                                                                                                                                 |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Look                 | A 16 px line icon and the label in `ink`, weight 500; no fill, no boundary, no underline                                                                                                              |
| Size                 | At least 48 px high, 12 px side padding (pulled back by 12 px where it starts or ends a row, so its text lines up with the gutter), 8 px between icon and label; a long label wraps inside the button |
| Hover, pressed, open | `brand.blushSoft` fill, `radius.md` (`ink` 15.9:1)                                                                                                                                                    |
| Focus                | The approved ring                                                                                                                                                                                     |

The underlined [quiet link](#quiet-secondary-action-text-link) stays for a secondary choice under a primary button ("Not now", "Keep working", "Leave", "Start again") and for actions inside content ("Clear answer", "Show in passage", "Remove from evidence"), now with a 4 px underline offset.

### Icons

One line family (this answers the icon-convention question of 2026-10-12): a 16 px grid, a 1.5 px stroke with round ends and joins, `currentColor`; drawn with `LineIcon`. 16 px next to a label, 20 px for the selected check, 12 px in the navigator's flag badge. Hidden from screen readers; the label or the control's name carries the meaning. A fill is used only where it carries a state: the flag while a question is marked, and the M5 outcome icons. No emoji, no filled glyph families.

### Confirmation dialog

The native `<dialog>` for leaving a running Exam and for "Finish test" on desktop: `surface.base`, `radius.xl`, 24 px padding, the approved raised shadow, **no boundary**, and an `ink` scrim at 40% behind it, so the decision stands apart without a second outline.

### Language switcher

The header's quiet button: a 20 px line globe, the language code and a down chevron; `brand.blushSoft` while the list is open. The list: `surface.base`, `radius.md`, 4 px padding, the raised shadow; each language a 48 px row with `radius.sm` hover in `brand.blushSoft`, the current one bold with the check.

## Responsive behavior

| Range       | Treatment                                                                                                                                                                  |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 320–359 px  | Must work: no horizontal scroll, no clipped actions                                                                                                                        |
| 360–599 px  | **Primary design target**                                                                                                                                                  |
| 600–1023 px | Tablet: phone layout given more room, or two columns where that is meaningful                                                                                              |
| ≥ 1024 px   | Desktop layout of its own where it helps (e.g. realistic Exam Mode with passage and questions side by side, see [READING_EXPERIENCE.md](../product/READING_EXPERIENCE.md)) |

**Breakpoints: Approved** (owner, 2026-10-10, task M1-03; proposed in M1-02). Two breakpoints, as minimum widths. They are written in rem, so a user with a larger default font size gets the roomier layout later, which keeps text from being squeezed.

| Breakpoint | Value            | Starts the range |
| ---------- | ---------------- | ---------------- |
| Tablet     | 37.5rem (600 px) | 600–1023 px      |
| Desktop    | 64rem (1024 px)  | ≥ 1024 px        |

- Rationale: they match the documented range boundaries exactly. 320–599 px is one phone layout, so there is no breakpoint at 360 px. 360 px is a design target, not a layout change. Tailwind's default breakpoints would be reset like the other token namespaces, so only these two exist.
- Today, Tailwind's default breakpoints still apply, because no approved values existed when the foundation was built (ADR-0001 did not decide them).

**Content max width: Approved** (owner decision 2026-10-10). Page content on desktop sits in a centered column with a default maximum width of 1200 px. Feature-specific layouts, such as Reading Exam mode, may override it later.

## M3 components (onboarding and home)

**Approved** (owner, 2026-10-10, task M3-05; proposed in M3-02), including the progress bar under the step indicator. Visual values for the components in the M3 flows ([USER_FLOWS.md](../product/USER_FLOWS.md#onboarding-and-home-flows-m3)). Approved values are reused unchanged: the brand palette, the type scale (H1, H2, body, small meta text), the focus-visible style, the motion durations and easing, and the breakpoints. Contrast ratios were computed with the WCAG 2.x formula. Nothing here is in code yet; each value goes into `tokens.css` with its first use (M3-07, M3-08), and no other token is added.

### Primary button

The one red action per screen ("Start the level check"). It formalizes the style M1 already uses for its red action (`StatusMessage.tsx`), so the app has one primary button.

| Property                    | Proposed value                                                                                                         | Rationale                                                                                                           |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Height                      | at least 48 px (`spacing` 48); grows when the label wraps                                                              | ACCESSIBILITY.md prefers 48 px for primary actions                                                                  |
| Padding                     | 12 px vertical, 24 px horizontal                                                                                       | Room for a two-line Russian or Uzbek label without touching the edges                                               |
| Radius                      | `radius.md` (14 px)                                                                                                    | Not a pill (Radii section)                                                                                          |
| Type                        | Body size (1rem), weight 700, centered; the label wraps and is never truncated                                         | Bold carries the emphasis; the size stays readable at 200% zoom                                                     |
| Default                     | `surface.base` text on `brand.primary`                                                                                 | 4.58:1 (AA for 16 px bold)                                                                                          |
| Hover (pointer) and pressed | `brand.primaryDeep` background                                                                                         | 5.18:1. The palette names `primaryDeep` as the hover and pressed color. Background change in 120 ms (motion "fast") |
| Focus-visible               | The approved 2 px `ink` ring, offset 2 px                                                                              | Approved style, 4.1:1 against the red                                                                               |
| Width                       | Full column width below the tablet breakpoint (600 px); its natural width from 600 px, aligned with the column's start | A full-width target is easiest to hit with a thumb; on wide screens a stretched button looks like a banner          |
| Disabled, loading           | Not proposed: no M3 screen has a disabled or loading primary button                                                    | No speculative states (Token policy)                                                                                |

The M1 status pages keep their approved inline button layout unless the owner wants them to adopt the full-width rule.

### Quiet secondary action (text link)

"Not now" (onboarding step 3) and "Change goal" (home). It formalizes M1's quieter "Go to home page" link.

| Property       | Proposed value                                                | Rationale                                                                                             |
| -------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Look           | `ink` text, weight 500, always underlined; no fill, no border | Clearly an action, clearly quieter than the red button; underline means it is not told apart by color |
| Tap area       | At least 48 px high (the text sits in a 48 px tall link)      | Touch target                                                                                          |
| Hover, pressed | No change other than the browser default cursor               | Nothing to compete with the primary button                                                            |
| Contrast       | 18.58:1 on `surface.base`                                     |                                                                                                       |

### Answer option (single-choice answer button)

The answers on onboarding steps 1 and 2. Each is a button that saves and advances (USER_FLOWS.md: answering rules).

| State                                                  | Proposed treatment                                                                                                                                                                                                             | Contrast                                                                                                                          |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Default                                                | `surface.base` fill, 1 px `border.control` boundary, `radius.md`, `ink` text at body size weight 500, left-aligned; at least 48 px high with 12 px vertical and 16 px horizontal padding; full column width                    | Boundary 3.22:1 against white (meets 3:1 for an essential boundary); text 18.58:1                                                 |
| Hover (pointer)                                        | Boundary becomes `ink`                                                                                                                                                                                                         | 18.58:1                                                                                                                           |
| Pressed                                                | `surface.warm` fill                                                                                                                                                                                                            | Text 17.68:1                                                                                                                      |
| Focus-visible                                          | The approved ring                                                                                                                                                                                                              |                                                                                                                                   |
| Selected (the earlier answer when returning to a step) | `brand.blushSoft` fill (visual overhaul, 2026-10-12; was `brand.blush`), a 2 px `ink` boundary, and a 20 px `ink` check mark at the end (the shared line check, hidden from screen readers, with the text "Selected" for them) | Text and check 15.9:1 on the soft tint. Selected is shown by the check mark and the heavier boundary, not by the fill alone (I-8) |

- **Arrangement:** one vertical list with 8 px between answers (visual overhaul, 2026-10-12; was 12 px), the same on step 1 and step 2 and in every option list. The five band values are a list too, not a grid: one scan direction, the same component on both steps, and it works at 320 px and at 200% zoom. Six 48 px answers with 8 px gaps take about 330 px, so the whole step still fits a 360 × 800 screen without scrolling.
- **Not red:** the answers are not primary buttons. Steps 1 and 2 have no red element at all (USER_FLOWS.md: one primary action).

### Step indicator

"Step 1 of 3" above the question on every onboarding step.

| Part                    | Proposed treatment                                                                                                                                                      | Contrast                                                                                                                                                                                                           |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Text                    | Small meta text (0.875rem), weight 500, `text.secondary`                                                                                                                | 8.22:1. The text alone carries the meaning                                                                                                                                                                         |
| Progress bar (optional) | A 4 px high track in `border.subtle` with `radius.full`, filled one third per step in `brand.highlight`, 8 px under the text; decorative and hidden from screen readers | Fill against track 2.48:1, below 3:1. Acceptable only because the text carries the meaning (WCAG 1.4.11 applies to graphics needed for understanding). `brand.highlight` is the palette's color for progress fills |

**Option:** drop the bar and keep the text only. **Recommendation: keep the bar.** It shows at a glance that the flow is short, which matters on the first screen a new user sees.

**Onboarding art direction** (owner reference, 2026-10-15). The bar is three 32 × 4 px segments (`radius.full`, 4 px apart, `brand.primary` up to the current step, `border.subtle` after it) on the same line as the text, 12 px before it, 16 px above the H1; still decorative.

### Onboarding art direction (steps 1–3)

**Owner reference, 2026-10-15** (the owner's composition image for the three steps, desktop and phone; it replaces the 2026-10-12 "stage" composition. Behavior, order, choices, routes and the cookie are unchanged). Each step is the question on white and, on desktop, a picture panel beside it. The answers stay submit buttons in one group named by the question.

**Composition.**

- **Desktop (from the 64rem breakpoint):** two equal halves across the content column (up to 1200 px), 64 px apart, filling the window under the header. Start side: a **picture panel**, `brand.blushSoft`, `radius.xl`, 48 px padding; the step's picture centered in it, and at its bottom the step's encouragement: two short sentences, one per line, in Heading 1 size weight 800, then one sentence in `text.secondary`. End side: the question (step indicator, H1, the sentence in `text.secondary`) and its answers or actions, vertically centered.
- **Phones and tablets:** the question on white in the 36rem column, then the answers or actions. No panel. Step 3 alone has a small picture between the step indicator and the H1.
- **Pictures** (`views/onboarding/ui/pictures.tsx`): flat shapes in `brand.primary`, `brand.primaryDeep`, `brand.highlight`, `brand.blush` and white, decorative and hidden from screen readers. Step 1: a graduation cap on three books, a town with a clock tower behind, on a `surface.warm` disc. Step 2: a target (`brand.blush` and white rings, red center) with an arrow, the five band values around it in Literata italic, the chosen band circled in `brand.primaryDeep`. Step 3: the [skills picture](#pictures); on phones, its small form on a `brand.blushSoft` field.

**Step 1, exam type: two path cards.** Academic and General Training, stacked on phones and side by side from the tablet breakpoint (12 px apart; 16 px on desktop): white, a 1 px `border.subtle` boundary, `radius.lg`, 16 px padding (24 px on desktop). The icon in a 48 px `brand.blushSoft` circle (64 px on desktop) with `brand.primaryDeep` line icon, beside the text on phones and above it on desktop; the label in Heading 3 bold, and under it who the path is for in meta `text.secondary`. Hover: the boundary turns `brand.blush`. **Selected** (the earlier answer, when returning): `brand.blushSoft` fill, a `brand.primary` boundary, the icon circle turns `brand.primary` with a white icon, and a 24 px red check badge in the top end corner.

**Step 2, target band: a compact selector.** The five values in a grid, three per row on phones and one row of five from the tablet breakpoint (12 px gaps): white, a 1 px `border.subtle` boundary, `radius.md`, at least 56 px high, the value in Heading 2 size bold with tabular figures. **Selected:** `brand.primary` fill, white text (4.6:1, bold 20 px), a 16 px white check in the top end corner. Under the values, when a band is chosen, a **band note**: `brand.blushSoft`, `radius.lg`, 16 px padding, a 32 px line icon of rising bars in `brand.primaryDeep`, what the band means in bold body and one sentence in meta `text.secondary` (copy per band in the catalogs, `onboarding.targetBand.notes`).

**"I don't know yet"** (steps 1 and 2): under the answers (and the note), 16 px away (24 px on desktop), a quiet action, not a card: a 24 px question-mark icon in `text.secondary`, the label in weight 500, a right chevron; no boundary; hover `brand.blushSoft`. Selected: a white fill, a 1 px `ink` boundary, a check instead of the chevron.

**Step 3, level-check invitation.** The H1 and the sentence, then the primary button with a right arrow after its label and "Not now" as the quiet link under it, 24 px below the sentence (32 px on desktop). The skills picture says what the check looks at; the sentence carries the meaning.

Every selected answer is also named "Selected" for screen readers; its look changes in fill and with a check, never by color alone.

### Home: next-action block and goal line

**Revised with the onboarding reference** (owner request, 2026-10-15). The next action is the screen's one focal block, in the onboarding's picture language.

- **H1 ("Your next step"):** a quiet label above the block: meta size, weight 700, `brand.primaryDeep` (5.2:1). The next action, not the page's name, is what the screen shows.
- **Next-action block:** 12 px under the H1, `brand.blushSoft`, `radius.xl`, 16 px padding on phones, 32 px from the tablet breakpoint. Phones and tablets: no picture, so the action is in the first screen height (owner, M6-04: Home option (b)): the H2 in Heading 1 size weight 800, the sentence in `text.secondary` 8 px under it, and the primary button 24 px under the sentence. Desktop: the full content column, 48 px padding, two halves 48 px apart: the text and button on the start side (button 32 px under the sentence), Home's own [starting-point picture](#pictures) on the end side (Home option (a)).
- **Goal line:** 24 px under the block, one wrapping row: a 16 px line flag, the line in `text.secondary` with the band in `ink` weight 700 ("Target band: **7.0** · Academic"), and "Change goal" as the quiet link at the row's end. No divider.

### Picture layout and status pages

`PictureLayout` (`apps/web/src/shared/ui/PictureLayout.tsx`) is the desktop frame of the onboarding steps and the status pages: two halves 64 px apart across the content column, filling the window under the header; the start half a `brand.blushSoft` panel (`radius.xl`, 48 px padding) holding the picture, the end half the content on white, vertically centered. Phones and tablets: the content alone in the 36rem column.

The status pages (`StatusMessage`: page not found, unexpected error, the level check being prepared) use it with one picture each: a signpost (not found), a circular "try again" arrow (errors), the skills picture (level check). On phones the picture sits small (160 px wide; the skills picture's small form) on a `brand.blushSoft` field (`radius.lg`, 16 px vertical padding) 24 px above the H1. The H1, the sentence in `text.secondary` 8 px under it, and the actions 24 px under the sentence (32 px on desktop).

### Pictures

Flat pictures in the brand's reds, `brand.blush`, `surface.warm` and white, decorative and hidden from screen readers. Never behind text. The skills picture (`apps/web/src/shared/ui/SkillsPicture.tsx`, onboarding step 3 and the level-check page): the skills the product has, Reading and Listening (owner, M6-04: audit Q3), as white tiles on opposite sides of a white circle with three red bars (icon in a 48 px `brand.blushSoft` circle); large (352 px, skill names in English in meta bold `brand.primaryDeep` on the tiles, as IELTS names them (Q4), a dashed `brand.blush` orbit) and small (208 × 120 px, icons only). The starting-point picture (`apps/web/src/views/home/ui/StartingPointPicture.tsx`, Home on desktop only, 352 px): a dashed `brand.blush` path from a start flag, through a `brand.blush`-ringed circle with three red bars, to a target in `brand.blush`, white and red rings. The status pictures live with `StatusMessage`, the onboarding pictures in `views/onboarding/ui/pictures.tsx` ([Onboarding art direction](#onboarding-art-direction-steps-13)).

### Illustrations

Spot illustrations in the line-icon style, drawn on a 24 px grid with the same 1.5 px stroke and round ends (`Illustration` in `apps/web/src/shared/ui/illustrations.tsx`), shown at 20–32 px in `brand.primaryDeep`, or white on `brand.primary` (a selected path's icon). Decorative and hidden from screen readers: the text beside them carries the meaning. Current set: graduation cap (Academic), briefcase (General Training), question mark ("I don't know yet"), rising bars (the band note), and the skill icons of the skills the product has (book, headphones).

### Column width for onboarding and home

| Property      | Proposed value                                                                  | Rationale                                                                                                                                                |
| ------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Maximum width | 36rem (576 px at the default font size), centered in the 1200 px content column | About 65 characters of body text per line, and answers and buttons do not stretch across a desktop screen. In rem, so it grows with the user's font size |
| Below 600 px  | The full width between the 16 px gutters                                        |                                                                                                                                                          |

This would be one new layout token (a container width) used by onboarding and home only.

### Spacing used by these components

4 (progress bar height), 8 (heading to sentence, indicator to bar), 12 (button vertical padding, gap between answers), 16 (gutter, answer horizontal padding), 24 (button horizontal padding, H1 to block, sentence to button, indicator to question), 32 (block to goal line), 48 (minimum heights). All are on the proposed 4 px scale.

## M4 components (Reading)

**Approved** (owner, 2026-10-10, task M4-09; proposed in M4-05), with the highlight's bottom border added at approval. Visual values for the M4 Reading specs ([READING_EXPERIENCE.md, M4 specifications](../product/READING_EXPERIENCE.md#m4-specifications-drafts)). Reused unchanged: the brand palette, the type scale (including the approved Heading 3 and passage sizes), the focus style, motion, the breakpoints, the M3 primary button, quiet link and answer option. Contrast computed with the WCAG 2.x formula. Status colors (correct/incorrect) stay TBD: M4 shows no correctness (M4-01 open question 2).

### New color: passage highlight

| Token       | Proposed value          | Use                                            | Contrast                                        |
| ----------- | ----------------------- | ---------------------------------------------- | ----------------------------------------------- |
| `highlight` | `#FFEFA3` (soft yellow) | Background of highlighted sentences (`<mark>`) | `ink` text on it 16.04:1. Against white 1.16:1. |

- Yellow is what readers expect from a highlighter (computer-delivered IELTS uses it too), and it is clearly not the red of actions or the blush of selection (blush against it 1.30:1, plus selection has its own underline below).
- **Plus a subtle bottom border** (owner decision at approval, 2026-10-10): a 2 px bottom border in `border.control` (3.22:1 against white), so a highlight stays visible against white without relying on the light fill alone. The fill keeps the text easy to read (`ink` 16.04:1); screen readers get the highlight from `<mark>`.

### Test bar

- 48 px high, `surface.base`, a 1 px `border.subtle` line under it (decorative).
- "Exit" as a [quiet button](#quiet-button) with the close icon (visual overhaul, 2026-10-12; was the underlined quiet link), 12 px between the bar's items; "Passage 1 of 3" in body text, weight 500; the timer in body text, weight 700, with tabular figures so it does not jiggle, weight 800 from 5 minutes left.

### Passage

- The approved passage size (Literata 17 px, line height 1.6), `ink` (18.58:1). Paragraph spacing 16 px.
- Width: the full width between the gutters on phones; from the tablet breakpoint a reading measure of **40rem** (about 70 characters of Literata at 17 px).
- Passage title: Heading 2 (Onest). Paragraph letters: bold Onest in `text.secondary` (8.22:1) at the start of the paragraph, followed by a space; not a separate column, so phones lose no width.

### Sentences: keyboard focus, selection, highlight, pin marker

- **Keyboard focus** on a sentence: the approved focus ring.
- **Selected** (action bar open): `brand.blushSoft` background (visual overhaul, 2026-10-12; `ink` 15.9:1) with a 2 px `ink` underline, `radius.sm` corners, so selection is not shown by color alone.
- **Highlighted:** the `highlight` background above.
- **Pin marker** (the current question's pins): an inline chip before the sentence, `radius.full`, 1 px `ink` border, a 14 px line pin icon and the question number in bold meta text, `ink` on `surface.base` (18.58:1).

### Sentence action bar

- Floats 8 px above the sheet, the full width between the gutters on phones (at most 36rem), `surface.base`, `radius.md`, the approved raised shadow, 4 px inner padding; its actions are [quiet buttons](#quiet-button) with a line icon and a label (no underline), each at least 48 px.
- **Height follows the content** (owner, 2026-10-11, replacing the earlier 56 px): compact on phones, **at most two rows**, no horizontal clipping, no critical action hidden, and understandable in uz, ru and en. Where the labels would need a third row, shorter approved labels or icons are used, with the full label kept as the accessible name.
- **Arrangement** (M4-24): Highlight (or Remove highlight) and Cancel share the first row, Cancel as a 48 px × icon button named "Cancel"; Pin (or Unpin), where offered, takes the second row. A label too long for its row wraps inside its own button rather than adding a row. The refused-pin message is contextual feedback above the actions, shown only after a refused pin; it does not count as one of the two rows (owner, 2026-10-11).

### Question sheet (phone and tablet)

- `surface.base`, `radius.xl` top corners, the approved raised shadow; 16 px side padding.
- **Handle:** a 32 × 4 px bar in `border.control` (3.22:1 on white), 8 px from the top. The handle button covers the bar and the question's title row (about 52 px), so the title shares the grab area instead of sitting under a 48 px row of its own (visual overhaul, 2026-10-12).
- **Heights:** collapsed = its content (handle and title, 80 px; 96 px before the visual overhaul); partial = 45% of the visible viewport height, at least 240 px; expanded = the visible height below the test bar. State changes animate height with the approved "base" duration (200 ms) and easing, none with reduced motion.
- **Header row:** "Question 5 of 40" in Heading 3 (18 px, 700) with "· answered" in meta text, then one row with the flag toggle and "All questions" as [quiet buttons](#quiet-button), 48 px high; a long Russian or Uzbek label wraps inside its own button rather than adding a row. The flag icon is filled while the question is marked (the fill carries the state). Panels (the navigator, an option list) have "Back" as a quiet button with a left chevron.
- **Footer row:** Previous and Next as **secondary buttons** (new component, below) with a left or right chevron; the red primary button only for "Finish test". On phones "Finish test" is full width, as the primary button is there, on its own row under Previous (owner, 2026-10-11).

### Secondary button (new)

- For Previous / Next and similar navigation that must look like buttons but not compete with the red action: 48 px minimum height, 12/16 px padding (visual overhaul, 2026-10-12; was 12/24 px), an optional 16 px line chevron 8 px from the label, `radius.md`, 1 px `border.control` boundary (3.22:1), `ink` text weight 500 on `surface.base`; hover: `ink` boundary; pressed: `surface.warm` fill (`ink` 17.68:1); focus: the approved ring.

### Choice controls in the sheet

- **Option rows** reuse the M3 answer option (default, hover, pressed, focus, selected with `brand.blushSoft`, the 2 px `ink` boundary and the 20 px check mark at the end) over a visually hidden native radio or checkbox. **No radio or checkbox indicator is drawn inside the row** (visual overhaul, owner request 2026-10-12: a circle or square inside a bordered row read as a nested, form-like double boundary). The check's room is kept when unchosen, so choosing never moves the text. "Choose several" is explained by its instruction and the "1 of 2 chosen" line. The option letter is bold before the text.
- **Disabled** (the limit of "choose several" reached): text in `text.tertiary` (6.24:1 on white), boundary `border.subtle`, no hover.
- **Answer button** ("choose from a list"): the option-row look with a trailing chevron; "Choose an answer" in `text.secondary` (8.22:1) when empty, the chosen option's letter and text in `ink` when filled.
- **Typed-answer field:** 48 px high, 1 px `border.control` boundary (3.22:1), `radius.md`, 12/16 px padding, body text; focus: the approved ring.
- **Gaps in summaries and notes:** the number in bold followed by a 2 px `ink` underline as wide as about six characters; the **current gap** gets the selected look (`brand.blushSoft` background, `radius.sm`).
- **Word-limit warning** (Practice): body text in `ink` with a 20 px warning icon (a circle with "!"), not a status color.

### "Your evidence" block

- Each pinned sentence as a quote on `surface.warm` with `radius.md`, 12/16 px padding: the paragraph label in meta text `text.secondary` (7.83:1 on warm), the sentence in the approved passage typography (`ink`, 17.68:1 on warm), then "Show in passage" and "Remove from evidence" as quiet links.

### Question navigator

- Cells 44 × 44 px with 4 px gaps, `radius.sm`, the number in body text weight 700 with tabular figures.
- **Unanswered:** `surface.base` with a 1 px `border.control` boundary (3.22:1). **Answered:** `ink` fill with a `surface.base` number (18.58:1). **Current:** a 3 px `ink` bar 4 px under the cell, in addition to its fill or outline. **Marked for review:** a 16 px badge in the top corner: a `surface.base` circle with a 1 px `ink` border and an `ink` flag. Each state is a shape, so none relies on color.
- Group headings ("Passage 1") in Heading 3.

### Desktop exam layout (from 64rem / 1024 px)

- Columns: passage 55%, questions 45%, separated by a 1 px `border.subtle` line (decorative: the columns are also separated by space and scroll on their own); both on `surface.base`; the passage at the 40rem measure inside its column. The question column has 32 px side padding, its content at most the 36rem column width, and 48 px between question groups (visual overhaul, 2026-10-12).
- The current question in the question column: a 4 px `ink` bar along its start edge.
- Navigator bar: a 1 px `border.subtle` line above it; the same 44 px cells; other passages as [quiet buttons](#quiet-button) with their progress and a right chevron (visual overhaul, 2026-10-12; were secondary buttons); "Mark for review" as a quiet button with the flag icon. **Its height follows its content** (owner, 2026-10-11, replacing the fixed 64 px): 64 px is the preferred compact height when everything fits one row; two rows at 1280 px and up to three rows at 1024 px are acceptable. Previous, Next and "Mark for review" keep their text labels; they are not made icon-only to save space.

### Tokens this would add

`--color-highlight`, `--container-measure` (40rem), `--breakpoint-desktop` (the approved 64rem, first use), and the approved "base" duration (200 ms) for the sheet. Everything else uses existing or approved values.

## M5 components (Reading results and review)

**Approved with amendments** (owner, 2026-10-11, task M5-01). Visual values for the M5 drafts ([READING_EXPERIENCE.md, M5 specifications](../product/READING_EXPERIENCE.md#m5-specifications-drafts)). Reused unchanged: the brand palette, the type scale, the focus style, motion, the breakpoints, the M3 primary button and quiet link, the M4 secondary button, option rows, test bar, sheet, navigator cells, "Your evidence" quote style and desktop columns, including the approved desktop navigator bar (content-driven height: two rows at 1280 px and up to three at 1024 px acceptable; Previous, Next and "Mark for review" keep their text labels). Contrast computed with the WCAG 2.x formula.

### Status: correct, not correct, no answer

The [Status colors](#status-colors) are TBD and M5 is the first milestone that shows correctness. **Every outcome is an icon plus a word** ("Correct", "Not correct", "No answer", and for a "choose several" item "1 of 2 correct"), never color alone (I-8); color only supports "correct". "No answer" is its own state, never drawn as "not correct".

| Outcome                                     | Icon (20 px; 16 px in navigator badges) | Color                                                                        | Contrast                                                                                         |
| ------------------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Correct                                     | A check mark in a filled circle         | **New token `status.correct` `#157A3C`** (green) for the circle; white check | 5.41:1 on `surface.base`, 5.15:1 on `surface.warm`; white on it 5.41:1. Usable for text too (AA) |
| Not correct                                 | A cross in an outlined circle           | `ink` (no new color)                                                         | 18.58:1                                                                                          |
| No answer                                   | A dash in a dashed-outline circle       | `text.secondary`                                                             | 8.22:1                                                                                           |
| Partly correct ("choose several" item only) | A circle whose start half is filled     | `status.correct` fill, `ink` outline                                         | Fill 5.41:1, outline 18.58:1 on `surface.base`; the words "1 of 2 correct" carry the meaning     |

- **Why "not correct" gets no color (decided, D11):** red is the brand's action color and this document requires "incorrect" to stay distinct from it and from Reading's red family; a second hue (orange, amber, purple) would collide with a skill color or read as a warning. The cross and the word carry the meaning; the screen stays calm, as review should.
- **Not chosen:** a dedicated "incorrect" hue outside the red family (for example a dark amber `#9A5B00`, 5.43:1 on white): amber reads as "warning", and Writing's orange is close.
- `status.correct` is a yellower green than Speaking's teal (`#0F7A5A`); the two never appear together without their labels.

### Results page

- Inside the shell (header with the language switcher), in the approved onboarding and home column (36rem).
- "Time is up." (when the Exam timed out) in Heading 3 above the H1, as on the M4 finished page.
- **Score:** "27 of 40 correct" in Heading 1 size, weight 800, the score in tabular figures, prominent but **allowed to wrap** at narrow widths and at 200% zoom (never forced onto one line, never truncated). No ring, gauge, chart, percentage, confetti or color fill ([UI_ANTI_PATTERNS.md](UI_ANTI_PATTERNS.md)).
- The honest line in body text `ink` directly under the score; the breakdown ("Not correct: 9 · No answer: 4") in body text `text.secondary`, each count with its outcome icon.
- Notes (rechecked, imported, older version, storage) in body text `ink` with the 20 px info icon, 16 px under the breakdown, before the button.
- The red review button 24 px below (its text names what it opens); "Mistakes that repeated" 32 px below it; the quiet links ("Try 14 questions again: not correct or no answer", "Start again") last, 8 px apart. Long Russian and Uzbek link texts wrap.

**Result states** (each is the same page; only the listed parts change):

| State                                                                        | Score line                                                                                                          | Note                                                                              | Red button                                    | Repeated mistakes                                                 | Quiet links                                                          |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------- |
| Finished, mistakes and unanswered                                            | "27 of 40 correct"                                                                                                  | none                                                                              | "Review mistakes and unanswered questions"    | Cards, or the "none" text, with the scope line                    | Try again, Start again                                               |
| Finished, mistakes only                                                      | as above                                                                                                            | none                                                                              | "Review mistakes"                             | as above                                                          | as above                                                             |
| Finished, unanswered only                                                    | as above                                                                                                            | none                                                                              | "Review unanswered questions"                 | as above                                                          | as above                                                             |
| Everything correct                                                           | "40 of 40 correct"                                                                                                  | none                                                                              | "Review answers"                              | the "none" text                                                   | Start again                                                          |
| Exam time-out                                                                | as above, "Time is up." above the H1                                                                                | none                                                                              | as above                                      | as above                                                          | as above                                                             |
| Rechecked, score changed                                                     | the new score                                                                                                       | "Rechecked… Your earlier result was 27 of 40."                                    | as above                                      | from the first attempt's current record                           | as above                                                             |
| Rechecked, score unchanged but outcomes or notes changed                     | the score                                                                                                           | "Rechecked… Your score is the same; some answers or notes changed."               | as above                                      | as above                                                          | as above                                                             |
| Rechecked, nothing visible changed                                           | the score                                                                                                           | none                                                                              | as above                                      | as above                                                          | as above                                                             |
| Imported from M4                                                             | as above                                                                                                            | "You finished this test before the app checked answers…"                          | as above                                      | "We can't tell which was your first try…"                         | as above                                                             |
| First attempt from an earlier content version                                | as above                                                                                                            | none                                                                              | as above                                      | "Repeated mistakes can't be shown because this test has changed…" | as above                                                             |
| Earlier content version, result stored                                       | the stored score                                                                                                    | "This test has changed since you took it, so a detailed review is not available." | none; "Start the test" becomes the red button | none                                                              | none                                                                 |
| Earlier content version, no result                                           | none                                                                                                                | "…so your answers can't be checked."                                              | "Start the test"                              | none                                                              | none                                                                 |
| No attempt on this device                                                    | none; H1 "No results on this device yet" and its sentence                                                           | none                                                                              | "Start the test"                              | none                                                              | none                                                                 |
| Storage blocked or full                                                      | as in the matching state                                                                                            | the storage notice                                                                | as above                                      | as above                                                          | as above                                                             |
| Loading (the history is read after the page mounts, usually within a moment) | none                                                                                                                | none                                                                              | none                                          | none                                                              | none; the shell and the H1 only, so nothing jumps or announces twice |
| A retry's results                                                            | H1 "Your retry", "9 of 14 now correct" and "These are questions you have attempted before…"                         | none                                                                              | the review button for the retry               | never                                                             | "Back to your test results"                                          |
| A retry that can't be started                                                | H1 "This practice can't be started" and the reason (source missing, earlier content version, questions not allowed) | none                                                                              | "See your last results"                       | never                                                             | "Start the test"                                                     |

### Pattern card ("Mistakes that repeated")

- At most two cards. A card is allowed here because each is one distinct unit with its own action ([UI_ANTI_PATTERNS.md](UI_ANTI_PATTERNS.md)): `surface.warm`, `radius.lg`, 16 px padding, no shadow, no border.
- The scope line ("In this attempt at this test…" or "From your first attempt…") in body text `text.secondary` under the section heading, before the cards.
- Title in Heading 3; the count line in body text; the tip in body text `text.secondary` (7.83:1 on warm); the action "Practise these questions again" as a quiet link (48 px tap area). English answer words (TRUE, NOT GIVEN) inside are `lang="en"`, not styled differently.
- The "not enough evidence", "first try unknown" and "unavailable" texts are plain body text, not cards.

### Review: passage marks

- **Evidence of the current question:** an inline chip before the sentence, like the M4 pin marker (`radius.full`, 1 px `ink` border, `surface.base`), with a 14 px quote-mark icon and the question number in bold meta text, plus a 2 px **dotted** `ink` underline under the sentence (18.58:1). Accessible name: "Evidence for question 5".
- **NOT GIVEN "related" sentences:** the same chip with an outlined (not filled) quote icon and the accessible name "Related to question 3"; the underline is dashed, so "related" and "evidence" differ by shape, not color.
- **The user's own marks:** highlights keep the approved `highlight` tint and border; the current question's pins keep the M4 pin chip. A sentence can carry both chips; the chips sit side by side and wrap with the text.
- Selection (blush) is not used in review: sentences are not selectable there.

### Review card (phone sheet and desktop column)

- **One card per answer unit** ("Questions 22–23" is one card). **Header row:** "Question 5 of 40" in Heading 3, then the unit outcome (icon and word, body weight 700) on its own line; on phones, "All questions" stays in the header as in M4. In the review sequence, "To review: 3 of 12" (cards) in meta text `text.secondary` under the heading.
- **Answers:**
  - Choice and list types (including "choose several"): the question's option rows, read-only (no hover, no pressed state; they are a list, not controls), each labeled on its own: "Your answer, correct" (correct icon, 2 px `status.correct` boundary), "Your answer, not correct" (cross icon, 2 px `ink` dashed boundary), or "Correct answer" for an accepted option the learner did not choose (correct icon, 2 px `status.correct` boundary). Other options stay plain. Labels are text, so nothing depends on the boundary color, and no label ties a positional mark to a letter.
  - Typed types: two label-value rows, "Your answer" and "Correct answer" (and "Also accepted"), the values in passage typography with `lang="en"`. An unanswered question shows "You did not answer this question." in place of the value, with the "No answer" icon.
- **Evidence block:** the M4 "Your evidence" quote style (`surface.warm`, `radius.md`, 12/16 px padding, the paragraph label in meta text, the sentence in passage typography) under the heading "Evidence in the passage" (or "Where the passage talks about this"), each with "Show in passage" as a quiet link. **When a NOT GIVEN answer has no related sentences, the block is not rendered**: no heading, no empty container, no "Show in passage".
- **Explanation:** heading "Why" in Heading 3, body text in the interface language; `lang="en"` spans in the same style.
- **"Explain simpler":** a secondary button (the M4 secondary button) with `aria-expanded`; the simpler text appears right after it, introduced by "In simple words" in bold, with a 4 px `ink` bar along its start edge (the approved current-question bar), so it is visibly a second version and not a new section.
- **Signal notes:** one sentence each in body text with a 20 px info icon (a circle with "i", `ink`), not a status color.
- **Your evidence comparison** (Practice attempts with pins): the M4 "Your evidence" block, followed by one sentence in body text weight 700 about agreement with the key's cited sentences.
- Spacing between blocks 24 px; inside a block 8 px. Previous / Next as in M4.

### Review: navigator outcome badges

- The M4 cells (44 × 44 px, number in the cell). In review: a correct question's cell gets the 16 px correct badge in the top corner (where M4 shows the flag); a not-correct question's cell the cross badge; an unanswered question keeps the M4 "unanswered" outline style plus the dash badge. Both cells of a "choose several" item show **the unit's** badge (including "partly correct") and open the same card. Fills: none (all cells are outlined), so the badge shapes carry the outcome. The current cell keeps the M4 3 px `ink` bar. Flags are not shown in review.
- Accessible names: "Question 5, not correct, current"; "Question 38, no answer"; "Questions 22–23, partly correct".
- **In a retry**, the navigator lists only the retried units (as in the test screen, without badges).

### Review on phone, tablet and desktop

|                 | Phone (320–599 px)                                                                                                                   | Tablet (600–1023 px)                    | Desktop (from 1024 px)                                                                       |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------- | -------------------------------------------------------------------------------------------- |
| Frame           | Test bar ("Results", passage, no timer)                                                                                              | Same                                    | Same                                                                                         |
| Passage         | Full width between the gutters, read-only, marks as above                                                                            | Centered at the 40rem measure           | Start column, 55%, at the 40rem measure                                                      |
| Review card     | In the M4 sheet: partial by default, expanded for long cards and the navigator, collapsed to read; the card scrolls inside the sheet | The phone sheet, as wide as the passage | End column, 45%: the current question's card only, scrolling on its own                      |
| Navigator       | "All questions" opens it in the expanded sheet                                                                                       | Same                                    | The M4 bottom bar with outcome badges, Previous and Next, content-driven height, text labels |
| Question change | The passage scrolls so the first evidence sentence sits above the sheet; focus to the card heading                                   | Same                                    | The passage column scrolls the evidence into view; focus to the card heading                 |

### Accessibility treatment (M5 screens)

- **Not by color alone (I-8):** outcomes are icon plus word; answer rows carry text labels; evidence and related marks differ by icon and underline style; navigator badges differ by shape (check, cross, dash, half-filled circle) and are named in words.
- **Focus:** results H1 on arrival from the test; the review card's heading on opening and on every question change; "Show in passage" moves focus to the sentence; the navigator returns focus to "All questions" on Escape. The approved focus ring everywhere.
- **Announcements:** the focused headings announce the outcome; nothing else uses a live region except the storage notice (polite, once).
- **Disclosure:** "Explain simpler" is a button with `aria-expanded`; the simpler text follows it in reading order.
- **Language:** English test content, typed and accepted answers, and `en` spans in explanations and copy carry `lang="en"`.
- **Targets:** every control at least 44 × 44 px (48 px for buttons and quiet links), including at 320 px.
- **320 px and 200% zoom:** no horizontal scroll; the score and long uz and ru labels wrap and are never truncated; at 200% the partial sheet may show only the card header, with the rest scrolling inside it, as in M4.
- **Reduced motion:** the passage jumps to the evidence instead of scrolling smoothly; the sheet does not animate.

### Tokens this would add

`--color-status-correct` (`#157A3C`) only. Everything else uses existing or approved values.

## M6 components (navigation, Practice Hub, page compositions)

> **Direction v2** (owner, 2026-10-18) changes the desktop navigation (a sidebar instead of header links), Home and the Hub's rows, and adds depth to every surface below. Where this section and [Direction v2 components](#direction-v2-components-owner-mockup-2026-10-18) differ, v2 wins.

**Approved** (owner, 2026-10-18, task M6-04, as recommended; drafted in M6-03), including Home options (a) and (b). Visual values for [USER_FLOWS.md, Navigation and Practice Hub (M6)](../product/USER_FLOWS.md#navigation-and-practice-hub-m6) and for the must-fix items of [M6-01-ui-audit.md](../execution/M6-01-ui-audit.md). Reused unchanged: the brand palette, the type scale, spacing, radii, the raised shadow, motion, the focus ring, the breakpoints, the primary button, the quiet button and link, the line icons, `PictureLayout` and the skills picture. Contrast computed with the WCAG 2.x formula. **No new color token**; one layout value is proposed (the task composition's columns, below).

### Navigation (if N1 (b) is approved)

**Phone and tablet below 64rem — the bottom bar** (shell pages only):

| Property    | Value                                                                                                                                                                                                               | Contrast                                                    |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Position    | Fixed to the bottom of the window, full width, above the page; the device's safe-area inset added below it; page content gets matching bottom padding so nothing hides behind it                                    |                                                             |
| Surface     | `surface.base`, a 1 px `border.subtle` line on its top edge (decorative), no shadow                                                                                                                                 |                                                             |
| Layout      | 2–4 destinations of equal width; 8 px vertical padding; each destination at least 48 px high                                                                                                                        |                                                             |
| Destination | A 20 px line icon above its label; label in meta size (0.875rem), weight 500, centered; a long label wraps to a second line and the bar grows (content-driven height, never truncated)                              |                                                             |
| Inactive    | Icon and label in `text.secondary`                                                                                                                                                                                  | 8.2:1                                                       |
| Current     | Icon and label in `ink`, label weight 700, and a 24 × 3 px `brand.primary` bar (`radius.full`) 4 px above the icon; `aria-current="page"`. Current is told by the bar's shape and the weight as well as color (I-8) | `ink` 18.6:1; the bar 4.6:1 against white (non-text, ≥ 3:1) |
| Pressed     | `brand.blushSoft` fill on the destination, `radius.md`                                                                                                                                                              | `ink` 15.9:1                                                |
| Motion      | None (no sliding or bouncing)                                                                                                                                                                                       |                                                             |

**From the tablet breakpoint — header links** (all shell pages, including onboarding if N2 (b)): between the logo and the language button, each destination a [quiet button](#quiet-button) with its 16 px icon; current: label weight 700 and a 2 px `brand.primary` underline bar 8 px below the label, plus `aria-current="page"`. The header keeps its approved height; with four destinations and a Russian label it still fits one row at 600 px (to verify in M6-05).

**Icons** (16 px line family, 20 px in the bar): Home: a house; Practice: an open book with a small check; later Progress: three rising bars (reusing the illustration's motif as a line icon); the account: a person.

### Page compositions

Three named compositions, so every later screen picks one instead of inventing its own desktop layout (audit C2). Phones and tablets keep the single 36rem column for all three; the compositions differ from the 64rem breakpoint.

| Composition                                                                                                | Desktop (from 64rem)                                                                                                                                                                                                                                                                                                                                                                                     | Used by                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Picture stage** (existing `PictureLayout`; `PictureStage` in `StatusMessage.tsx` adds the phone picture) | Two equal halves 64 px apart: a `brand.blushSoft` picture panel and the content, vertically centered                                                                                                                                                                                                                                                                                                     | Onboarding steps, not-found, errors, the level-check page until M7, and the test-bar safe and empty states, with the signpost: the retry that cannot start, the review with nothing to show (M6-08)                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **Task page** (`apps/web/src/shared/ui/TaskLayout.tsx`)                                                    | Within the 1200 px content column: a **main column of 7/12** (about 680 px) holding the page's purpose, start-aligned with the header's logo; a **side column of 4/12** after a 1/12 gap for supporting content; both start at the top. Without supporting content the main column stays start-aligned (never a narrow column centered in an empty canvas) and the page's own width is the main column's | The Reading start screen (main: title, mode choice, Start; side: the test's skill identity and format on a `surface.warm` card, `radius.lg`, 24 px padding: the skill's 32 px icon circle and name in Heading 3, the format in `text.secondary` under it, 7.8:1 on the card; on phones and tablets the identity is a meta-bold line with the icon circle above the title and the format in meta `text.secondary` under it), results (main: score, honest line, counts, notes, the review action, also for the states without a result; side: "Mistakes that repeated" and the quiet links), later the level-check intro and result, the mock entry |
| **List page** (new)                                                                                        | The content column's full width (up to 1200 px); a section heading per group, then its rows in **two columns**, 16 px apart                                                                                                                                                                                                                                                                              | The Practice Hub; later Progress lists                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

The task page's columns are the only new layout value: a 12-column grid with 32 px gaps inside the existing 1200 px column (local to the composition, no new token unless a second component needs it).

Reading order and focus never change with the composition: on desktop the side column comes after the main column in the DOM and for screen readers.

### Practice Hub

| Part                    | Value                                                                                                                                                                                                                                                          | Contrast                      |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| H1                      | Heading 1, 24 px under the header                                                                                                                                                                                                                              |                               |
| Skill section heading   | Heading 2 with the skill's 20 px icon in a 32 px circle of the skill's tint (`skill.reading` tint, `brand.primaryDeep` icon; Listening later: its tint and strong color)                                                                                       | Icon on tint 4.4:1 (non-text) |
| Test row                | One link: `surface.base`, 1 px `border.subtle`, `radius.lg`, 16 px padding, at least 72 px high; title in body weight 700 (`lang="en"`); format in meta `text.secondary`; the state line in meta weight 500 `ink` with a 16 px line icon; a chevron at the end | Title 18.6:1; format 8.2:1    |
| State icons             | Not started: an empty circle; in progress: a circle with a play triangle; finished: a circle with a check, all in the line family and `ink` (not the M5 outcome icons, which mean correctness). The words carry the state                                      |                               |
| Row hover / pressed     | Boundary `ink` / `surface.warm` fill (as the answer option)                                                                                                                                                                                                    |                               |
| "See your last results" | The quiet link, 4 px under its row, outside the row's link (no nested interactive elements)                                                                                                                                                                    |                               |
| Storage notice          | The M5 note pattern (20 px info icon, body text) under the H1                                                                                                                                                                                                  |                               |
| Spacing                 | 32 px between sections, 12 px between rows on phones, 16 px in the desktop grid                                                                                                                                                                                |                               |

### Home (audit C3) — options

Home was recomposed at the owner's request on 2026-10-15 in the onboarding's picture language ([Home: next-action block and goal line](#home-next-action-block-and-goal-line)). The audit's point is that a returning learner sees the same picture and promise as onboarding step 3 and the interim level-check page. Options:

- **(a) Keep the 2026-10-15 composition**, change only the picture: a Home-specific picture of the next step instead of the shared four-skill picture (and beta skills only, audit Q3). Smallest change.
- **(b) Next action first on phones**: no picture above the action at 320–599 px (the picture stays on desktop), so the action is in the first screen height at 320 px; desktop as (a).
- **(c) Task page composition on desktop**: the next-action block in the main column, the goal context in the side column.

**Recommendation: (a) + (b)**: it keeps the owner's composition and language, removes the duplication, and brings the action up on small phones. (c) waits for M11, when Home has more than one thing to show.

### Loading, empty and error patterns

- **Loading:** content known at render shows at once; values read from the device after mounting reserve their line (no layout jump) and appear without animation; no spinner for reads under a second; the heading always renders first (as on the M5 results page).
- **Empty:** a sentence and one action, in the page's own composition; the picture stage only for whole-page empty states.
- **Errors and notices:** a whole-page error uses the status pages; an inline problem uses the M5 note (20 px `ink` info icon and one sentence), never a red box.

### Motion and pictures

- **Motion** only for state and spatial changes, as approved (≤ 200 ms, off with reduced motion). The navigation never animates.
- **Pictures** only where they carry meaning: onboarding, whole-page status and empty states, and Home's next action. Never on practice, test, results or review surfaces, never behind text, always decorative and hidden from screen readers. Skill pictures show only skills the product has (audit Q3).

### Tokens this would add

None. The task composition's 12-column grid is a local layout value of the composition; the bottom bar's 3 px indicator follows the M4 current-cell bar.

## Direction v2 components (owner mockup, 2026-10-18)

**Approved** (owner, 2026-10-18: the composition image [references/brand/direction-2026-10-18.png](references/brand/direction-2026-10-18.png) and, in the session, the desktop sidebar, the rework of the M6 screens in its language, and Reading and Listening only in the pictures). Values derived from the image by the worker; the owner reviews them in the screenshots at M6-09. Reused unchanged: the brand palette, the type scale, spacing, radii, motion, the focus ring, the breakpoints, the primary and quiet buttons, the line icons, the task page composition. Contrast computed with the WCAG 2.x formula.

### Tokens added

| Token                                 | Value                                                                                                                                                                 | Use                                                                                                                                                                                                                           | Contrast                                                                                                                                                               |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--gradient-blush` (`bg-blush-field`) | Two faint radial glows of `brand.blush` (70% and 45% into white, at the top end and bottom start corners) over a 135° linear gradient from `brand.blushSoft` to white | Direction-setting panels: the onboarding stage, the status pages' panel and phone field, Home's goal and next-action cards, the start screen's side card. Never behind running text longer than a sentence, never on controls | At the darkest point (70% blush, `#F9D8DA`): `ink` 14.0:1, `text.secondary` 6.2:1; red text 3.9:1, so **red is never text on the field**, only icons (non-text, ≥ 3:1) |
| `shadow.soft`                         | `0 4px 16px 0` `ink` at 6%                                                                                                                                            | Cards that are objects on white, always with a 1 px `border.subtle` line                                                                                                                                                      | Supporting depth, no requirement                                                                                                                                       |
| `text.display`                        | 2.5rem (40 px), line height 1.1, weight 800, tabular figures                                                                                                          | The one figure a card is about: the target band on Home; later a score, an estimated band                                                                                                                                     | `ink`, as the headings                                                                                                                                                 |

The gradient is a theme variable whose utility (`bg-blush-field`) is defined once in `globals.css`; its colors are only tokens.

### Desktop sidebar (from 64rem)

| Part              | Value                                                                                                                                                                                                                                                    | Contrast                                |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Column            | 15rem wide (a local layout value of the shell), `surface.base`, a 1 px `border.subtle` line on its end edge, sticky and as tall as the window; the content column takes the rest, 32 px from the sidebar                                                 |                                         |
| Logo              | At the top, 24 px padding, the approved 48 px height; it links Home                                                                                                                                                                                      |                                         |
| Destinations      | A list 8 px apart under the logo, 16 px side padding; each a row at least 48 px high, 12 px padding, `radius.md`: a 20 px line icon and the label, weight 500, `text.secondary`                                                                          | 8.2:1                                   |
| Current           | `brand.blushSoft` fill, the label `ink` weight 700, the icon `brand.primaryDeep`, a 3 × 24 px `brand.primary` bar at the row's start edge (inside, `radius.full`), `aria-current="page"`. Told by the bar, the weight and the fill, never by color alone | `ink` 15.9:1; the icon 4.4:1 (non-text) |
| Hover, pressed    | `brand.blushSoft` fill                                                                                                                                                                                                                                   |                                         |
| Header on desktop | Only the language switcher at the end (the logo moved into the sidebar); the skip link stays first in the reading order, then the sidebar, then `main`                                                                                                   |                                         |
| Below 64rem       | Unchanged: header links from the tablet breakpoint, the bottom bar on phones ([M6 components](#navigation-if-n1-b-is-approved))                                                                                                                          |                                         |

The sidebar appears on shell pages only, never on test-bar screens or onboarding. Beside it, the content column keeps its 1200 px maximum, centered in the remaining width (at 1280 px it fills that width, 976 px, after 32 px of padding on each side).

### Home v2

Phones: one column, the next action first. Desktop: a 12-column grid, 24 px gaps.

| Part                                             | Value                                                                                                                                                                                                                                                                                                                                                               | Contrast                            |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Welcome                                          | H1 "Welcome!" in Heading 1, the sentence in `text.secondary` 4 px under it                                                                                                                                                                                                                                                                                          |                                     |
| Next-action card (desktop 7/12, first on phones) | 24 px under the sentence; the blush field, `radius.lg`, 24 px padding (32 px on desktop); a 48 px white circle with the level icon in `brand.primaryDeep`; the H2 (Heading 2), the sentence in `text.secondary` 8 px under, the primary button with a right arrow 24 px under; on desktop the [starting-point picture](#pictures) at the end, 12rem wide            | `ink` and `text.secondary` as above |
| Goal card (desktop 5/12)                         | The blush field, `radius.lg`, 24 px padding: "Goal" in meta weight 700 `text.secondary`; the target band in `text.display`, or the "not set yet" sentence in body; the exam type as a white chip (meta weight 700, `radius.full`, 4 × 12 px padding) when known; "Change goal" as the quiet link at the bottom; a small document illustration at the end on desktop | chip text `ink` 18.6:1              |
| "Choose a skill"                                 | H2 in Heading 2, 32 px under the cards; the skill cards 16 px under it, three per row on desktop                                                                                                                                                                                                                                                                    |                                     |
| Skill card                                       | One link: `surface.base`, 1 px `border.subtle`, `shadow.soft`, `radius.lg`, 20 px padding; a 40 px circle of the skill's tint with its 20 px icon in the strong color, the skill's name in Heading 3 beside it, one sentence in meta `text.secondary` under; hover: the boundary turns `brand.blush`. Only skills with tests (N3): Reading now, Listening from M8   | icon 4.4:1 (non-text)               |

The next action stays the page's one red button; the skill card and "Change goal" are links.

### Practice Hub v2

The task page composition (the list in the main column, start-aligned; no side column until there is real supporting content). Each row becomes a card: `surface.base`, 1 px `border.subtle`, `shadow.soft`, `radius.lg`, 16 px padding, at least 72 px high; a 40 px circle of the skill's tint with the skill's icon at the start; the title, format and state line as in M6; the chevron at the end. Hover: the boundary turns `brand.blush`.

### Onboarding, status pages and the start screen

- The picture panel of `PictureLayout` and the phone picture field are the blush field; the panel keeps `radius.xl` and 48 px padding.
- The onboarding path cards and the band values gain `shadow.soft` (with their `border.subtle` line); selected states are unchanged.
- Pictures gain depth: each sits on a disc with a radial `brand.blush` glow, and the step 1 scene gets a skyline silhouette in `brand.blush` behind the cap; the target's band values float around it as before. Only Reading and Listening in the skills picture.
- The Reading start screen's side card is the blush field (`radius.lg`, 24 px padding) with the skill identity and format; the results page keeps the M5 and M6 values.
- The Reading test and review screens keep their approved M4 and M5 values: the direction image's practice screen has the same structure (bar, passage, questions, numbered navigator); refinements come with M8's content work.

## M7 components (Level check)

**Approved** (owner, 2026-10-18, task M7-05; drafted in M7-03). Visual values for [USER_FLOWS.md, Level check flows (M7)](../product/USER_FLOWS.md#level-check-flows-m7) and [LEVEL_CHECK.md](../product/LEVEL_CHECK.md). Reused unchanged: the brand palette, the type scale (with `text.display`), spacing, radii, the three elevation levels, motion, the focus ring, the breakpoints, the primary, secondary and quiet buttons, the line icons, the picture stage and task page compositions, the blush field, the M4 test bar, sheet, navigator and choice controls, the M5 outcome icons and note pattern, and the M6 next-action card. **No new token.** Contrast computed with the WCAG 2.x formula.

### Intro (`/level-check`)

The picture stage (Direction v2): on desktop the blush-field panel with the large skills picture and the step-3 encouragement under it ("Let's find your starting point." and its sentence); on phones the small skills picture on the blush field above the content (as the status pages). It replaces the interim page in the same frame, so nothing moves for a learner who saw the interim page.

| Part | Value | Contrast |
|---|---|---|
| H1 | Heading 1: "Find your level"; in progress: "Continue the level check" | `ink` 18.6:1 |
| Facts | A list 16 px under the H1, three rows 8 px apart, each a 20 px line icon in `text.secondary` and body text `ink`: the book (what it covers), the clock (time), the device (saved on this device) | 18.6:1 |
| Honest line | The M5 note pattern (20 px `ink` info icon, body text `ink`), 16 px under the facts; the Academic-style line, when shown, a second note 8 px under it | 18.6:1 |
| In progress | Instead of the facts: the sentence "You answered 6 of 14 questions…" in body text, and under it the M3 step indicator's bar, 14 segments wide, the answered ones in `brand.primary` (decorative; the sentence carries the count) | bar 4.6:1 (non-text) |
| Finished | The facts, then the retake line and the "same questions" line as two notes | |
| Storage blocked | One more note under the honest line | |
| Actions | The primary button 24 px under the last line (32 px on desktop), with a right arrow after "Start" and "Continue"; the quiet link ("Not now", "Start over", "See your starting point") 8 px under it | white on red 4.6:1 |

### Section (`/level-check/reading`)

The M4 reading screen in Practice: the test bar ("Exit" as the quiet button; "Passage 1 of 2" at the end; **no timer**), the passage, the sheet, the navigator, the choice controls and the finish confirmation, all unchanged. Differences, by removal only: no flag toggle in the sheet header (the "All questions" button takes the row alone), no pin action in the sentence action bar (Highlight and Cancel only, one row), no "Your evidence" block. The sheet header counts the form's questions ("Question 3 of 14"); the navigator groups them by passage. The last question's red button reads "Finish" (not "Finish test") and the confirmation heading "Finish the check?". Desktop: the M4 exam layout and navigator bar, with the same removals.

### Result (`/level-check/result`)

Inside the shell, in the task page composition: the main column holds the result, the side column "Practise first" on desktop (phones: in the flow, before the button).

| Part | Value | Contrast |
|---|---|---|
| H1 | Heading 1: "Your Reading starting point"; focus moves to it when the page replaces the section | 18.6:1 |
| Level | The level name in `text.display` weight 800, 16 px under the H1, with a **three-step indicator** 8 px under it: three 32 × 4 px segments 4 px apart, `radius.full`, the first *n* in `brand.primary`, the rest `border.subtle` (decorative: the name is the level; never a gauge, ring or percentage) | name 18.6:1; segments 4.6:1 (non-text) |
| Score | "9 of 14 correct" in Heading 2 weight 700 with tabular figures, 12 px under the indicator | 18.6:1 |
| Scope and honest lines | Two notes (the M5 pattern), 16 px under the score, 8 px apart; the Academic-style note third when shown | 18.6:1 |
| Practise first | A card on `surface.warm`, `radius.lg`, 16 px padding (24 px on desktop): "Practise first:" in meta weight 700 `text.secondary`, then the one or two type names in body text `ink`, each on its own row with a 20 px line icon of the type's family (a list for choice types, a pencil for typed answers), or the single "Any Reading practice…" sentence. Phones: 24 px under the notes; desktop: the side column, top-aligned | 7.8:1 / 17.7:1 on warm |
| Actions | The red "Practise Reading" 24 px under the notes (phones: under the card), with a right arrow; the quiet links "See your answers" and "Take the check again" 8 px apart, 16 px under the button | 4.6:1 |
| Insufficient data | H1 "Not enough answers for a starting point"; no level, no indicator; "5 of 14 answered." in Heading 2; the sentence as a note; the red "Take the check again"; the quiet "Practise Reading". No "Practise first" card | |
| Earlier form version | The level and score as stored; the "check has changed" note replaces "See your answers" | |
| Nothing finished on this device | The picture stage with the signpost (as the review's empty state): H1 "No starting point on this device yet", the sentence, the red "Find your level" | |

### Home and onboarding step 3 after the check

The M6 next-action card unchanged in shape: the level icon stays its mark; the H2 becomes "Practise Reading" (finished) or "Continue the level check" (in progress), the sentence the matching copy, the red button the matching label with its arrow; when finished, the quiet "See your starting point" link 8 px under the button (the card's only link). The starting-point picture stays on desktop. Onboarding step 3 shows the same H1, sentence and actions in its frame while the check is in progress or finished.

### Motion and pictures

The sheet and the navigator animate as in M4 (200 ms, none with reduced motion); the result page has no animation (no counting up, no reveal). The skills picture on the intro is the only picture of the flow; the section and the result have none ([Direction v2, pictures](#direction-v2-components-owner-mockup-2026-10-18)).

### Tokens this would add

None. The three-step indicator reuses the step indicator's segments; the fact rows reuse the line icons.

## M8 components (Listening)

**Approved** (owner, 2026-10-18, task M8-06; drafted in M8-05). Visual values for [LISTENING_EXPERIENCE.md](../product/LISTENING_EXPERIENCE.md) (question types, the player, resume and weak connections, the phone and desktop screens) and [USER_FLOWS.md, Listening flows (M8)](../product/USER_FLOWS.md#listening-flows-m8). The table, flow-chart and labelling layouts below are **shared with Reading** (M8-17 to M8-19 use them unchanged). Reused unchanged: the brand palette, the type scale, spacing, radii, the three elevation levels, motion, the focus ring, the breakpoints, the primary, secondary and quiet buttons, the line icon family, the confirmation dialog, the task page composition and the Reading start screen, the M4 test bar, timer, option rows, answer button, typed-answer field, word-limit warning, navigator cells and sheet and one-line storage notice, the M5 note pattern. **No new token**: the Listening skill colors already exist (`skill.listening` `#1D5FD1`, `skill.listening.tint` `#EAF1FD`) and are used here for the first time. Contrast computed with the WCAG 2.x formula.

### The Listening skill color: where blue appears

Blue is the restrained secondary accent of the surface direction; red stays the brand and the one primary action.

| Use | Value | Contrast |
|---|---|---|
| The headphones line icon (the Listening identity: Hub section, Home card, start screen side card, the Exam player) | `skill.listening` | 5.82:1 on `surface.base` (non-text needs 3:1) |
| The played part of the player's progress line and slider, the Exam download bar | `skill.listening` fill | 5.82:1 on white; 4.57:1 against the unplayed `border.subtle` track |
| The "Part 2 has started" notice | `skill.listening.tint` background, `ink` text | `ink` 16.37:1 |
| Never | Buttons, links, text, selected states, the navigator, answer controls | n/a |

### Player

A band directly under the test bar, `surface.base`, a 1 px `border.subtle` line under it (decorative), sticky with the test bar. 8 px vertical padding, the gutter at the sides; on desktop 16 px vertical, at the question column's width.

**Practice controls:**

| Part | Value | Contrast |
|---|---|---|
| Play / Pause | A 48 × 48 px circle, `ink` fill, a 20 px `surface.base` line play or pause icon; hover: `text.secondary` fill; focus: the approved ring. Not red: the screen's red is "Finish test", and play is a tool, not the screen's decision | icon 18.58:1 |
| Back 5 / Forward 5 | [Quiet buttons](#quiet-button), 48 px, a 20 px line arrow-around icon with the "5" in bold meta text beside it; the accessible name is the full copy ("Back 5 seconds") | `ink` 18.58:1 |
| Slider | A native range input restyled: a 4 px track, `radius.full`, unplayed `border.subtle`, played `skill.listening`; a 20 px `ink` thumb with a 2 px `surface.base` ring; the hit area 48 px high | thumb 18.58:1 against white |
| Times | "1:23 / 7:40" in meta text, `text.secondary`, tabular figures | 8.22:1 |
| Speed | A quiet button "1×" (bold) with a down chevron; the list as the language switcher's (48 px rows, the current one bold with the check) | 18.58:1 |

**Arrangement:** phones: row 1 the slider across the full width with the times under it at its ends; row 2 Back 5, Play / Pause, Forward 5 centered, Speed at the end; about 120 px in all. From the tablet breakpoint one row: Play / Pause, Back 5, Forward 5, the slider (flexible), the times, Speed; 64 px.

**States:**

| State | Shows |
|---|---|
| Loading (before it can play) | Play disabled: a `surface.base` circle with a 1 px `border.subtle` line and a `text.tertiary` icon (6.24:1), as disabled options; the times replaced by "Loading the audio…" in meta text |
| Paused, Playing | The play or pause icon; the slider moves with the audio without a transition |
| Buffering | As Playing, with "Loading the audio…" replacing the times; no spinner (a static 16 px line clock icon at most) |
| Ended | "End of Part 2" in meta text weight 700 replacing the times; the main button shows a restart icon and is named "Play again" |
| Failed | The controls disabled; under them the [M5 note pattern](#m5-components-reading-results-and-review) with the 20 px warning icon: "The audio couldn't load." and the quiet button "Try again" |

**Exam player:** one row, 56 px: the headphones icon in `skill.listening` (20 px), "Recording: Part 2" in body weight 500 `ink`, and a non-interactive 4 px progress line of the current part (played `skill.listening`, unplayed `border.subtle`, decorative: the text carries the state; no times). On desktop a volume control at the end: a 20 px line speaker icon and a slider (the Practice slider's look, 8rem wide, named "Volume"). On phones, in its place, "Use your device's volume buttons." in meta text `text.secondary` under the row.

### Exam: preparing, resuming, interrupted

| Screen | Value |
|---|---|
| Preparing the audio | The task page composition: H1 "Preparing the audio"; a progress bar 8 px high, `radius.full`, track `border.subtle`, fill `skill.listening` (decorative; the text carries it), 16 px under the H1; "6 of 14 MB" in body text with tabular figures 8 px under it. Ready: the bar full, the ready sentence, the red "Start the recording" 24 px under it. Failed: the note pattern with the warning icon and the red "Try again" |
| Continue the test | The same composition: H1, the sentence, the red "Continue" |
| The audio stopped | The [confirmation dialog](#confirmation-dialog) (modal: the Exam is paused): the heading, the sentence, the red "Try again", the quiet link "Finish without the rest" 8 px under it |
| Time to check | The test bar's timer as Reading's (weight 700, tabular), weight 800 in the last 30 seconds |
| "Part 2 has started." | A notice under the player: `skill.listening.tint`, `radius.md`, 12/16 px padding, the 20 px info icon and the sentence in body `ink`, "Go to Part 2" as a quiet button at its end (wrapping under the sentence at 320 px) |

### Questions on the Listening screen

- **The question area:** phones and tablets the gutter and, from the tablet breakpoint, the 40rem reading measure (`container.measure`), centered; desktop the same measure, except labelling groups (below). `surface.base`.
- **Group heading** "Questions 1–5" in Heading 3; the instruction under it as Reading's (English test content); the group's title (form, table, notes) in body weight 700. 32 px between groups on phones, 48 px on desktop; 24 px between questions in a group.
- **The current question:** a 4 px `ink` bar along its start edge (the Reading desktop marker), at every width, because every question of the group is on screen.
- **Choose one, choose several, the answer button:** Reading's option rows and answer button, unchanged.
- **Letter buttons** (LISTENING_EXPERIENCE.md L2 (b)): 44 × 44 px, 4 px gaps, wrapping; `radius.sm`; the letter in body weight 700. Unchosen: `surface.base`, 1 px `border.control` (3.22:1). Chosen: `ink` fill, `surface.base` letter (18.58:1), a fill change, not a hue (as the navigator's answered cell). Hover: `brand.blushSoft`. Focus: the approved ring. The shared list above the items: one row per option, its letter bold, 8 px apart.
- **Fields in the text** (L1 (b)): the question number in bold before the field; the field 44 px high (the touch minimum inside running text), at least 7rem and at most the line's width, `radius.sm` (a small element inside text), 1 px `border.control`, 8/12 px padding, body text; focus: the approved ring. Lines that hold fields get 8 px between them so fields never touch.
- **Form completion:** phones: each line's label in meta weight 700 `text.secondary` (8.22:1) above its value in body text; from the tablet breakpoint two columns, the label 40% and the value 60%, 16 px apart, rows 12 px apart. Given lines (no gap) look the same.
- **Note completion:** heading lines in body weight 700; note lines with an 8 px `text.secondary` bullet, sub-lines indented 24 px.

### Table completion (shared with Reading)

- **From the tablet breakpoint:** a real table at the column width; the header row on `surface.warm` with header text in body weight 700 `ink` (17.68:1); cells with 12 px padding, top-aligned; rows separated by a 1 px `border.subtle` line, no vertical lines (the columns are separated by space); the row-header column, when the content has one, in weight 700. A gap's field fills its cell's width (at least 7rem; a cell never gets narrower than that, which is why tables are limited to four columns, ADR-0012).
- **Phones (L5 (a)):** one block per row on `surface.warm`, `radius.md`, 12/16 px padding, 8 px between blocks; the row's first cell as its heading in body weight 700; each other cell as a line with its column heading in meta weight 700 `text.secondary` (7.83:1 on warm) above the content. No card shadow: the blocks are grouping, not objects.

### Flow-chart completion (shared with Reading)

- Steps as boxes at the column width: `surface.base`, 1 px `border.subtle`, the soft shadow (objects on white, Direction v2), `radius.md`, 12/16 px padding, the text in body.
- Between boxes a 20 px line arrow pointing down in `text.secondary`, centered, with 4 px above and below (decorative; the list order carries the sequence).
- The title, when the content has one, in body weight 700 above the first box.

### Plan, map and diagram labelling (shared with Reading)

- **The picture:** in a frame with a 1 px `border.subtle` line and `radius.md` (the image clipped to it), on `surface.base`, with its intrinsic aspect ratio; phones the full width between the gutters.
- **Markers drawn by the app** (ADR-0012), centered on their coordinates: **letters** in a 28 px circle, **question numbers** in a 28 px rounded square (`radius.sm`), so the two kinds differ by shape; both `surface.base` with a 2 px `ink` border and the label in body weight 700 `ink` (18.58:1), plus a 2 px `surface.base` outer ring so the border reads on dark parts of a picture. The current question's marker: `brand.blushSoft` fill and a 3 px `ink` border. Marker sizes are in rem: they grow with the user's font size, not with the picture's zoom in the enlarged view.
- **"Enlarge picture":** a quiet button with a 16 px line expand icon, 8 px under the picture at its start.
- **The enlarged view:** a modal over the whole screen, `surface.base`; the picture fills the space above a toolbar; the toolbar at the bottom (top on desktop) with "Zoom in", "Zoom out" (quiet buttons with line plus and minus icons and their labels) and "Close" (the close icon and the label); zoom steps 1×, 1.5×, 2×, 3×; at 1× the picture fits the screen. No animation of the zoom with reduced motion; otherwise the base duration.
- **Desktop:** the group breaks out of the 40rem measure to the content width: the picture 55% on the start side (sticky at the top of the question area while the questions scroll), the questions 45% on the end side, 32 px apart, as the Reading desktop columns.

### Phone bottom bar and the navigator

- **Bottom bar** (phones and tablets): `surface.base`, a 1 px `border.subtle` line above it, the raised shadow, the gutter at the sides, 8 px vertical padding. **Its height follows its content** (as the Reading desktop navigator bar): phones two rows: "Mark for review" and "All questions" as quiet buttons, then Previous and Next as secondary buttons, each half the width (the last question's red "Finish test" full width under Previous, as Reading's sheet footer); about 112 px. From the tablet breakpoint one row of four. While a field has focus it sits behind the on-screen keyboard (LISTENING_EXPERIENCE.md).
- **The navigator** in Reading's sheet (expanded state), headed by part ("Part 1" in Heading 3), with Reading's cells, states and badges.
- **Desktop navigator bar:** Reading's, with parts instead of passages ("Part 3: 4 of 10 answered" as quiet buttons).

### Practice Hub, Home and the start screen

- **Hub:** the Listening section as Reading's (Direction v2 test rows), headed by "Listening" with the headphones icon in `skill.listening`; rows unchanged; "Finished" without a score in the state line.
- **Home:** the Listening skill card as Reading's, with the headphones icon in `skill.listening` on `skill.listening.tint` (the Reading card's red icon on its tint, in blue).
- **Start screen:** the Reading start screen composition; the side card (desktop) and the identity line (phones) with the headphones icon and "Listening"; the audio-size and headphones lines as two rows of the intro's fact pattern (20 px line icons: a download arrow and headphones, in `text.secondary`, body text `ink`) under the mode choice. A device that cannot play the audio: the note pattern with the warning icon in place of those lines, and "Start" disabled.
- **Temporary practice content** (added after the gate at the owner's instruction): on the start screen the [M5 note pattern](#m5-components-reading-results-and-review) with the 20 px info icon, "Temporary practice test" in body weight 700 and the attribution line under it in meta text `text.secondary` (8.22:1), above the mode choice; in the Hub the row's format line followed by "Temporary practice test" in meta text `text.secondary`. No chip, no color: it is information, not a state.

### Motion and pictures

No waveform, equalizer or pulsing play button (LISTENING_EXPERIENCE.md P8). The slider and the progress lines move with the audio but have no transition; the bottom sheet for the navigator animates as in M4; nothing in the player animates with reduced motion. No illustration on the Listening screen; the Hub, Home and the start screen use the existing pictures.

### New icons

Line icons in the approved family (16 px grid, 1.5 px stroke): headphones, play, pause, back 5 (an arrow turning back), forward 5, restart, speaker, download arrow, expand, plus, minus, arrow down. No new icon style.

### Tokens this would add

None. First use of `skill.listening` and `skill.listening.tint`, which `tokens.css` already defines.

## M9 components (Listening results and review)

> **STATUS: APPROVED for implementation** (owner, 2026-10-18, task M9-04; drafted in M9-02). V1 was approved first; V2 and the rest at M9-04, with the clarifications in [LISTENING_EXPERIENCE.md, Clarified at the M9-04 approval](../product/LISTENING_EXPERIENCE.md#clarified-at-the-m9-04-approval). Approval authorizes implementation; no screenshot exists yet, so each UI task's focused visual checks stay. Visual values for [LISTENING_EXPERIENCE.md, M9 specifications](../product/LISTENING_EXPERIENCE.md#m9-specifications-drafts) and [USER_FLOWS.md, Listening results and review flows (M9)](../product/USER_FLOWS.md#listening-results-and-review-flows-m9). Reused unchanged: everything the M5, M7 and M8 sections list, in particular the M5 results page, outcome icons, option labels, label-value rows, "Explain simpler", the note pattern, navigator badges and the pattern card; the M8 player, question layouts (fields in the text, form lines, table and flow-chart blocks, labelling picture and markers), bottom bar and navigator by part; the M7 result composition. **No new token.** Contrast computed with the WCAG 2.x formula.

The direction this follows: the surface direction's "Listening review's signature evidence is the exact timestamp, a transcript excerpt with the evidence phrase highlighted, replay, and the explanation" ([DESIGN_CONSTITUTION.md](DESIGN_CONSTITUTION.md#surface-direction)); the product-design skill's "avoid turning review into a giant stack of bordered cards"; and the owner's composition image (screen 07, Listening practice) for a transcript as lines with their times at the start. No approved Listening reference screenshot exists yet (`references/listening/` is empty), so M9-09 and M9-10 compare with the Reading review references and the image.

### Results page (Listening)

The M5 results page and its state table unchanged, with:
- the meta line under the H1: the test title (English), the mode, and for a temporary test "Temporary practice test", in meta text `text.secondary`;
- the notes, in the M5 note pattern and order: "Temporary practice test" (info icon), the interrupted-sitting line (info icon), then M5's notes. A note is information, not a warning: no warning icon and no color;
- the Practice Hub row of a finished Listening test: "Last result: 27 of 40 correct" (M6's finished state) replaces M8's "Finished";
- under "Mistakes that repeated", after the scope line, the heuristic line (LD15) in body text `text.secondary` (8.22:1); the "not enough evidence" text keeps M5's plain body style with its added sentence.

**Start screen addition** (LD4): the day-first date line as one more row of the start screen's fact pattern, under the headphones row, with the 20 px info icon (no new icon).

| Extra state | Score line | Note | Red button | Repeated mistakes | Quiet links |
|---|---|---|---|---|---|
| Exam, check time ended | as M5, "Time is up." above the H1 | none | as M5 | as M5 | as M5 |
| Exam with an audio failure ("Finish without the rest", or continued after "Try again") | as M5 | "The recording was interrupted, so this was not a full exam sitting." | as M5 | as M5 (an interrupted first try still counts; the questions not reached are unanswered and belong to no category) | as M5 |
| Imported M8 finished session | as M5 | M5's "checked later" note | as M5 | M5's "We can't tell which was your first try…" | as M5 |

### The evidence block: timestamp and replay

The signature object of the review card, after the answers.

| Part | Value | Contrast |
|---|---|---|
| Heading | "Evidence in the recording" in Heading 3 | `ink` 18.58:1 |
| Timestamp | "Heard in Part 2 at 3:14": a 20 px line headphones icon in `skill.listening` (the Listening identity; M8 lists it), then the sentence in body weight 700 `ink`, the time in tabular figures; 8 px under the heading | icon 5.82:1 (non-text); text 18.58:1 |
| "Play from 3:14" | The M4 [secondary button](#secondary-button-new), 48 px high, its width from its label, a 20 px line play icon before the label, the time in tabular figures; 8 px under the timestamp. While the evidence plays: the pause icon and "Pause"; when it ends, back to "Play from 3:14". Focus stays on it | as the secondary button |
| Audio unavailable | The button in the secondary button's disabled style; under it, the reason sentence in meta text `text.secondary` | 8.22:1 |
| Several evidence entries | One timestamp, button and excerpt per entry, 16 px apart, in recording order; for a unit with several answers, "For B" in meta weight 700 `text.secondary` above each | 8.22:1 |

Not chosen: a red replay button (red is the screen's decision, and review's only decision is to move on); a blue button (M8: blue is never a button); a waveform with the evidence region (M8 P8).

### Transcript excerpt and the evidence mark

| Part | Value | Contrast |
|---|---|---|
| Excerpt | The M4 "Your evidence" quote style: `surface.warm`, `radius.md`, 12/16 px padding, 8 px under "Play from"; no border, no shadow (grouping, not an object) | |
| Speaker line | The speaker's role (English, `lang="en"`) in meta weight 700 `text.secondary`, then "· 3:14" in meta tabular | 7.83:1 on warm |
| Text | Passage typography (Literata, `text.passage`), `ink`, `lang="en"` | 17.68:1 on warm |
| Evidence phrase (**V1 approved**, owner, 2026-10-18) | A `<mark>` with the [passage highlight](#new-color-passage-highlight) `highlight` fill and, instead of the highlight's bottom border, the M5 evidence underline (2 px dotted `ink`) as the non-color cue; its accessible description "Evidence" | `ink` on `highlight` 16.04:1; the fill against warm is 1.10:1, so the dotted underline carries the boundary |

- **Why the highlighter here and not Reading's chip:** Listening has no learner highlights (P9), so yellow cannot be confused with the learner's own marks, and a marked phrase (not a whole sentence) is what the direction asks for. Reading's review keeps its chips and underlines.
- The quote shows the whole segment; it is never cut to the quote, so the phrase is read in its sentence.

### The whole transcript

- **Phones and tablets:** the disclosure "Show the transcript of Part 2" as a [quiet button](#quiet-button) with a 16 px chevron (down closed, up open, `aria-expanded`), 16 px under the excerpt; the transcript follows it in the reading order, as a region named "Transcript of Part 2". It stays open across cards of the same part and closes when the card's part changes.
- **Desktop:** the transcript is the start column (below).
- **Rows** (both): a two-column grid, 12 px between rows. Start column 4.5rem: the time as a quiet button 44 px high ("3:14" in meta tabular `text.secondary` with a 16 px line play icon), named "Play from 3:14". End column: the speaker in meta weight 700 `text.secondary`, the text in passage typography `ink`. Narrator lines ("You now have some time…") in `text.secondary` (8.22:1), so instructions read as quieter than speech.
- **The current card's evidence rows:** the approved 4 px `ink` current bar along the start edge of the row, and the evidence phrase marked as above. Other cards' evidence is not marked (one question at a time).
- **No following of the audio:** the row being played is not highlighted and the transcript does not scroll with the audio (motion, and the test's L4 principle); the player's times say where it is.

### The review player

The M8 Practice player, unchanged in values and arrangement, under the test bar, with one addition: an **evidence tick** above the slider's track at the current card's evidence start, a 2 × 12 px `ink` mark (decorative, hidden from screen readers; the card's timestamp carries the meaning). With two evidence entries, two ticks. Its states (loading, failed) are M8's.

### Review card (Listening)

- **Phones:** no sheet: the card is the page's `main` under the player, at the gutter; from the tablet breakpoint centered at the 40rem measure. 24 px between blocks, 8 px inside a block (M5).
- **Header:** M5's ("Question 14 of 40" in Heading 3, the outcome icon and word on its own line, "To review: 3 of 12" in meta text).
- **The question in its context:** the group's instruction as in the test (English), then only the context of this unit:
  - **Completion gaps** (form, note, sentence): the line that contains the gap, with the M8 line values; the gap shows **the answer in place**: an inline box (`radius.sm`, 8/12 px padding, body text) with the question number in bold and a 16 px outcome icon before the answer as typed (`lang="en"`); its boundary as the M5 option labels: correct 2 px `status.correct`, not correct 2 px `ink` dashed, no answer 1 px `text.secondary` dashed with the dash icon and the words "No answer". Other gaps on the line show their number and an empty `border.subtle` line, quietly.
  - **Table gaps:** the gap's row only, as the M8 phone row block (on desktop too: the card column is narrow), with the answer in place in its cell.
  - **Flow-chart gaps:** the title and the step that contains the gap, as the M8 box, without the arrows.
  - **Labelling:** the M8 picture frame at the card's width with the markers, the current question's marker in its M8 current style, and "Enlarge picture".
  - **Choice types:** the M5 read-only option rows and labels. **Matching and letter answers:** the item's prompt, then two M5 label-value rows "Your answer" and "Correct answer" with the letter and its text (the letter-button row is a control and is not shown in review).
- **Answers** (typed): the M5 label-value rows "Your answer", "Correct answer", "Also accepted", under the context.
- **Then:** the evidence block, the excerpt, the transcript disclosure (phones), "Why" and "Explain simpler", the notes (M5 pattern, info icon).
- **Footer (phones and tablets):** the M8 bottom bar without "Mark for review": "All questions" as a quiet button, Previous and Next as secondary buttons; content-driven height (two rows at 320 px, one from the tablet breakpoint). No red button: review has no decision to make.

### Navigator in review

The M8 navigator by part with the M5 outcome badges and accessible names; each part's heading in Heading 3 followed by "6 of 10 correct" in meta text `text.secondary`. Desktop navigator bar: the current part's cells with badges; the other parts as quiet buttons "Part 3: 6 of 10 correct" with a right chevron.

### Review on phone, tablet and desktop (Listening)

| | Phone (320–599 px) | Tablet (600–1023 px) | Desktop (from 1024 px) |
|---|---|---|---|
| Frame | Test bar ("Results", "Part 2 of 4", no timer) | Same | Same |
| Player | M8 phone player, sticky under the test bar, with the evidence tick | M8 one-row player | M8 player band across the content width |
| Transcript | The excerpt in the card; the whole part behind the disclosure | Same | Start column, 55%, at the 40rem measure, the heading "Transcript of Part 2" (Heading 3) sticky at its top; scrolls on its own; on card change it scrolls the first evidence row into view (instantly with reduced motion) |
| Review card | `main`, the gutter | Centered, 40rem | End column, 45%, 32 px from the transcript; the excerpt is not repeated in the card (the column shows it); scrolls on its own |
| Navigator | "All questions" opens it in the M8 sheet | Same | The bar along the bottom |
| Card change | Focus to the card heading; the player moves to the evidence, paused | Same | Same, and the transcript column scrolls |

### Level check: two sections

**Intro.** The M7 intro composition; the facts become **two section rows**, 16 px under the H1, separated by a 1 px `border.subtle` line (rows, not cards): each a 20 px line skill icon (Reading's book in `brand.primary`, as on Home's Reading card; Listening's headphones in `skill.listening`), the facts line in body text `ink`, and the state in meta text `text.secondary` (8.22:1); a section in progress adds M7's 14-segment bar under its state. The Listening row adds its notes in the note pattern, 8 px apart: "Each recording plays once. You can pause it.", "Use headphones if you can.", the temporary-audio disclosure (LD21) and the day-first date line (LD4). The red button names the section; the other section's action is a quiet link 8 px under it.

**The check's player** (`/level-check/listening`): one row under the bar, 56 px (as M8's Exam player): the M8 main button (48 px `ink` circle) with its label beside it in body weight 500 ("Play the recording", then "Pause" / "Continue"), the non-interactive 4 px progress line of the recording (played `skill.listening`, unplayed `border.subtle`) and "1:23 / 4:10" in meta tabular `text.secondary`. No Back, Forward, slider or speed. Ended: the button is removed and "End of recording 1" in meta weight 700 takes its place. Loading and failure: M8's player states. The bar reads "Exit" and "Recording 1 of 2"; the questions, bottom bar (without "Mark for review") and navigator are the Listening screen's.

**Result.**
- One section finished: the M7 result unchanged, with the Listening title and copy.
- Both finished: H1 "Your starting points"; **two section blocks**, each the M7 result's level part: the skill name in Heading 2 with its 20 px skill icon, the level name in Heading 1 size weight 800 (not `text.display`: two display-size names would compete), the three-step indicator, "9 of 14 correct" in Heading 3 weight 700 tabular, and its "Practise first" card (M7 values). Phones: stacked, the section just finished first, 32 px apart with a 1 px `border.subtle` line between them. Desktop: side by side, 50% each, 32 px apart, top-aligned (equal width because neither skill ranks above the other). The scope and honest notes once, under the blocks; then the red button and the quiet links (M7 spacing).
- Insufficient data in one section: that block shows M7's insufficient-data content (no level, no indicator); the other block is unchanged.
- **Listening qualifications** (LD20, LD21): inside the Listening block, 12 px under its score, as M5 notes with the 20 px info icon, in this order: "Completed with pauses…" (when the learner paused; its first two words in body weight 700, so the qualification reads at a glance), "The audio stopped because of a playback problem…" (a technical interruption), the temporary-audio disclosure and "Treat this as a rough starting point…". Information, not warnings: no warning icon, no color, nothing on the level name or indicator. With both blocks, the "separate scales" note sits once under them, before the scope and honest notes, in the same pattern. With one section the same notes sit under the score of the M7 result.

### Accessibility treatment (M9 screens)

- **Not by color alone:** the evidence phrase has the dotted underline and an accessible description, not only the yellow fill; answers in place carry an icon and, for no answer, the words; outcome badges and labels as M5; the current transcript row has the bar.
- **Names:** "Play from Part 2, 3 minutes 14 seconds" for the evidence button; "Play from 3:14" for each transcript time (inside the named region, so the part is known); the review player keeps its M8 names.
- **Focus:** the card heading on opening and on every card change; "Play from" and the transcript times keep focus while playing; the disclosure keeps focus and toggles `aria-expanded`.
- **Announcements:** none for playing, pausing or the end of the evidence (the button's name changes); the storage notice as M5.
- **Language:** the transcript, speaker roles, the question, options, answers and accepted answers carry `lang="en"`.
- **Targets:** every control at least 44 × 44 px (48 px for buttons), including the transcript times at 320 px.
- **320 px and 200% zoom:** no horizontal scroll; the transcript rows' start column stays 4.5rem and the text wraps; at 200% the player keeps its two rows and the card scrolls under it.
- **Reduced motion:** the desktop transcript jumps to the evidence instead of scrolling smoothly; nothing else moves.

### Open questions (M9-02)

- **V1. The evidence mark:** (a) the `highlight` fill with the dotted evidence underline; (b) Reading's evidence chip before the segment and the dotted underline, no fill. **Decided (owner, 2026-10-18): (a)**, with the dotted underline as the non-color cue and `ink` on `highlight` at 16.04:1; Reading's review keeps its chips and underlines.
- **V2. Desktop transcript column:** (a) the whole part, scrolled to the evidence (as Reading's passage); (b) only the excerpt, in a wider single column. **Recommendation: (a)** (LD10). **Decided (owner, 2026-10-18, M9-04): (a).**

### Tokens this would add

None.
