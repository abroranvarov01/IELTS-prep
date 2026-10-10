# Design System

Canonical owner of **design token values, the token policy, and component state conventions**.

> **STATUS:**
> - **Core brand palette: APPROVED.** Change it only with explicit product approval.
> - **Everything else** (neutrals, skill shades, type sizes, spacing, radii, shadows, breakpoints): **INITIAL DIRECTION / SUBJECT TO DESIGN REVIEW**, unless a section marks a value Approved.
>
> Once implementation starts, the token source in code becomes the single source of truth for values. This document then describes intent and usage and stops duplicating raw numbers.
>
> **Token source in code:** `apps/web/src/styles/tokens.css` (Tailwind v4 `@theme`). Tailwind's default colors, spacing, radii, font sizes, font weights, and shadows are reset there, so only these tokens produce utilities. Fonts are loaded in `apps/web/src/app/[locale]/layout.tsx` (`next/font`). `pnpm lint` runs `scripts/check-tokens.mjs`, which rejects raw colors outside the token file. The content max width (`--container-content`, `max-w-content`) the raised shadow (`--shadow-raised`, `shadow-raised`), and the Heading 1 size (`--text-heading-1` with its line height, `text-heading-1`) are in code. Since M3-07 and M3-08 also: the Heading 2 size (`--text-heading-2`, `text-heading-2`), the small meta text size (`--text-meta`, `text-meta`), the tablet breakpoint (`--breakpoint-tablet`, `tablet:`), the onboarding and home column (`--container-column`, `max-w-column`), and the "fast" duration and easing as Tailwind's transition defaults (`--default-transition-duration`, `--default-transition-timing-function`). The M3 primary button and quiet link live in `apps/web/src/components/` (`PrimaryLink`, `QuietLink`), the answer option in `apps/web/src/features/onboarding/AnswerList.tsx`. Tailwind's default breakpoints and container sizes are reset, so no unapproved breakpoint exists. Not yet in code (added when first needed, owner decision 2026-10-09; the M1 values were approved on 2026-10-10 with the condition that no speculative token is added): the "base" duration, the Heading 3 size, the passage size, the desktop breakpoint.

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

| Token | Value | Role | Contrast notes |
|---|---|---|---|
| `brand.primary` | `#E51F3A` | Primary brand and action color: primary CTAs, key brand moments | White text on it: 4.6:1 (passes AA). As text on `surface.warm`: 4.4:1, **fails** for small text. Use `brand.primaryDeep` there. |
| `brand.primaryDeep` | `#D90D31` | Pressed/hover state, red text on light surfaces | White text on it: 5.2:1. On `surface.warm`: 4.9:1. |
| `brand.highlight` | `#FF5268` | Non-text accents: indicators, progress fills, small graphic details | 3.15:1 on white. Meets 3:1 for non-text UI only. **Never** use it for text, and never with white text on it. |
| `brand.blush` | `#F7C7CA` | Soft brand surfaces, selected/emphasis backgrounds | Use only `ink` text on it (12.4:1). Red text on blush fails. |
| `ink` | `#111318` | Primary text, headings | 18.6:1 on white, 17.7:1 on `surface.warm` |
| `surface.warm` | `#FFF8F4` | Warm background: page backgrounds behind white surfaces, quiet grouping | n/a |
| `surface.base` | `#FFFFFF` | Default surface. The interface is white-first. | n/a |

Red is the application's **unmistakable** primary action color. No other color (including skill colors) is used for a primary CTA.

### Neutrals (proposal)

| Token | Proposed value | Use | Contrast |
|---|---|---|---|
| `text.secondary` | `#4A4F59` | Supporting text | 8.2:1 white, 7.8:1 warm |
| `text.tertiary` | `#5B616B` | Minimum for small meta text | 6.2:1 white, 5.9:1 warm |
| `border.subtle` | `#E2E4E8` | Decorative dividers only | 1.3:1 (not for essential boundaries) |
| `border.control` | `#8A9099` | Input and control boundaries | 3.2:1 white, 3.1:1 warm (meets 3:1 for non-text UI) |

**Approved** (owner, 2026-10-10, task M3-05; proposed in M3-02): `text.secondary` (the "You can change this later." line and the step indicator text), `border.control` (the answer option's boundary), and `border.subtle` (the progress track, decorative). `text.tertiary` remains a proposal until used.

**PROPOSED for approval in M4** (task M4-05): `text.tertiary` (disabled option text in "choose several").

### Status colors

Status colors (correct, incorrect, warning, info) are **TBD** and will be set at implementation. Constraints:
- "Incorrect" must stay clearly distinguishable from the brand red and from Reading's red family.
- Status is never conveyed by color alone (see [ACCESSIBILITY.md](ACCESSIBILITY.md)).

### Skill recognition colors

**Families: APPROVED. Exact shades: proposal.** Skill colors are supporting only. They help users recognize a skill. They never act as a CTA color and never appear in gradients.

| Skill | Family | Strong (icon/marker) | Tint (background) | Notes |
|---|---|---|---|---|
| Reading | Red | `#D90D31` (`brand.primaryDeep`) | `#FDE8EA` | Strong on tint is 4.4:1. Use `ink` labels on the tint, and use the strong color for icons/markers. |
| Listening | Blue | `#1D5FD1` | `#EAF1FD` | Strong on tint 5.1:1 |
| Speaking | Green | `#0F7A5A` | `#E8F6F0` | Strong on tint 4.8:1 |
| Writing | Warm orange | `#C2410C` | `#FFEDDF` | Strong on tint 4.5:1 (borderline; prefer `ink` labels) |

Because Reading shares the brand's red family, Reading identity must rely on the **skill name and icon** as well as color. A Reading tag must never look like a button.

### Dark mode

**TBD.** Do not build dark mode until it is decided. Keep components token-based so that it stays possible.

## Typography

| Role | Proposal |
|---|---|
| UI font | **Onest** (owner decision 2026-10-09, replacing Manrope, which has no U+02BB/U+02BC glyphs). Weights 400, 500, 700, 800. |
| Passage font | **Literata** (approved direction), subject to real readability and font-coverage testing on phones. Weights 400, 700. |
| Body size (mobile) | 16 px minimum. Never smaller for running text. |
| Passage size (mobile) | 17–18 px, line height ~1.6, measure ≤ ~70 characters on desktop |
| Headings | Bold/extra-bold. Hierarchy through size and weight. |
| Small meta text | 13–14 px minimum, `text.tertiary` or darker |

- **Required verification before adoption:** both fonts render Cyrillic and U+02BB/U+02BC correctly, and they load acceptably on slow mobile connections (subsetting, `font-display`).
- Text must respect the user's font-size settings. Use relative units.

### Type scale

**Approved** (owner, 2026-10-10, task M1-03; proposed in M1-02). Sizes are in rem (16 px = 1rem at the default browser setting), so text follows the user's font-size setting. Line heights are unitless. One scale for every width: on desktop, hierarchy comes from layout and spacing, not from bigger type.

| Role | Size | Line height | Weight | Rationale |
|---|---|---|---|---|
| Heading 1 (page title) | 1.75rem (28 px) | 1.2 | 800 | Bold and clear at the top of a phone screen. A long Russian or Uzbek title still fits in two or three lines at 320 px. |
| Heading 2 (section) | 1.375rem (22 px) | 1.3 | 700 | Clearly smaller than H1 and clearly larger than body, so the step is visible by size and weight alone. |
| Heading 3 (subsection) | 1.125rem (18 px) | 1.4 | 700 | The smallest heading. It is told apart from body by weight. |
| Body | 1rem (16 px, unchanged) | 1.5 | 400 | The existing minimum body size. 1.5 is the line height Tailwind's base styles already apply; this makes it explicit. |
| Small meta text | 0.875rem (14 px) | 1.4 | 400 or 500 | The top of the allowed 13–14 px range, for reading outdoors. Color `text.tertiary` or darker: 6.2:1 on `surface.base`, 5.9:1 on `surface.warm`. |
| Passage (Literata) | 1.0625rem (17 px) | 1.6 | 400 | Larger than body for long reading. 17 px rather than 18 px keeps more words per line on a 320–360 px phone, where Literata sets wide. The user's font-size setting can enlarge it. |

All headings and body text use `ink` (18.6:1 on `surface.base`, 17.7:1 on `surface.warm`). Heading levels below H3 are not needed yet.

## Spacing

A 4 px base unit. Proposed scale: 4, 8, 12, 16, 24, 32, 48, 64. Mobile page gutter: 16 px (verify at 320 px width).

**Approved** (owner, 2026-10-10, task M3-05; proposed in M3-02): the steps the M3 components use, 4, 8, 12, 16 (gutter), 24, 32, and 48. See [M3 components](#m3-components-onboarding-and-home). 64 remains a proposal until something uses it.

## Radii

Soft, modern surfaces with moderately generous corners, applied **systematically by element size**, so the result does not look like "everything is a pill".

| Token | Proposed value | Use |
|---|---|---|
| `radius.sm` | 8 px | Small elements: tags, checkboxes, inline highlights |
| `radius.md` | 14 px | Buttons, inputs, answer options |
| `radius.lg` | 20 px | Cards and content surfaces |
| `radius.xl` | 28 px | Bottom sheets (top corners), dialogs |
| `radius.full` | 9999 px | **Only** avatars, toggles, progress tracks, and small status chips |

Primary buttons use `radius.md`. They are not pills. Nested surfaces use a smaller radius than their container.

**Approved** (owner, 2026-10-10, task M3-05; proposed in M3-02): `radius.md` (14 px: the primary button and the answer option) and `radius.full` (the step indicator's progress track). The others remain proposals until used.

**PROPOSED for approval in M4** (task M4-05): `radius.sm` (navigator cells, the selected-sentence background) and `radius.xl` (the question sheet's top corners).

## Shadows / elevation

Minimal. Proposal: **two levels at most**: none (default) and a subtle raised level for overlays, bottom sheets, and sticky elements. Separation comes from spacing and surface color (`surface.base` on `surface.warm`) first.

**Raised level: Approved** (owner, 2026-10-10, task M1-03; proposed in M1-02). One shadow: `0 2px 12px 0` in `ink` at 12% opacity. The only other level is none.
- Rationale: a soft, short shadow lifts overlays, bottom sheets, and sticky elements without looking dated. With a small vertical offset and a larger blur, it also shows along the top edge of a bottom sheet. Deriving it from `ink` keeps it inside the palette.
- Contrast: the shadow is supporting depth, not an essential boundary, so it has no contrast requirement. Where an edge is essential to understand the component, it also needs a boundary of at least 3:1 (`border.control`) or a scrim.

## Motion

Short (≤ 200 ms) and functional: it shows a state change or a spatial relationship (for example, a bottom sheet expanding). Never delay interaction. Honor `prefers-reduced-motion`.

**Durations and easing: Approved** (owner, 2026-10-10, task M1-03; proposed in M1-02).

| Token | Value | Use | Rationale |
|---|---|---|---|
| Duration fast | 120 ms | Small state changes: color, opacity, pressed state, a list opening | Feels immediate, but still shows that something changed. |
| Duration base | 200 ms | Spatial changes: a bottom sheet expanding, a panel sliding in | The documented maximum. Larger movements need slightly more time to follow. |
| Easing | `cubic-bezier(0.2, 0, 0, 1)` | All transitions | Starts fast and settles gently, so a response begins at once and never feels like a delay. |

With `prefers-reduced-motion: reduce`, transitions and animations are effectively off (the base styles in `globals.css` already do this).

## Component states

Every interactive component defines: default, hover (pointer devices), focus-visible, pressed, disabled, loading. Where it applies, also selected, error, and correct/incorrect (answer states). The focus-visible state is never removed.

**Focus-visible style: Approved** (owner, 2026-10-10, task M1-03; proposed in M1-02). A 2 px solid `ink` outline, offset 2 px from the element, on every focusable element. This is the style F-09 implemented as an assumption, approved unchanged.
- Rationale: `ink` is the highest-contrast token and does not compete with the red primary action or look like an error. The offset puts the ring on the surface around the element, so it stays visible on red buttons too. An outline (not a box shadow) also stays visible in Windows forced-colors mode.
- Contrast of the ring against the surface around it: 18.6:1 on `surface.base`, 17.7:1 on `surface.warm`, 12.4:1 on `brand.blush`, and 15.8:1 or more on every skill tint. All meet the 3:1 minimum for non-text UI. The ring is 2 px thick and fully surrounds the element, as WCAG 2.2's focus appearance criterion (2.4.13) describes.
- Limit: against `brand.primary` the ring would be only 4.1:1, and 3.6:1 against `brand.primaryDeep`. Both still pass 3:1, with less margin.

## Responsive behavior

| Range | Treatment |
|---|---|
| 320–359 px | Must work: no horizontal scroll, no clipped actions |
| 360–599 px | **Primary design target** |
| 600–1023 px | Tablet: phone layout given more room, or two columns where that is meaningful |
| ≥ 1024 px | Desktop layout of its own where it helps (e.g. realistic Exam Mode with passage and questions side by side, see [READING_EXPERIENCE.md](../product/READING_EXPERIENCE.md)) |

**Breakpoints: Approved** (owner, 2026-10-10, task M1-03; proposed in M1-02). Two breakpoints, as minimum widths. They are written in rem, so a user with a larger default font size gets the roomier layout later, which keeps text from being squeezed.

| Breakpoint | Value | Starts the range |
|---|---|---|
| Tablet | 37.5rem (600 px) | 600–1023 px |
| Desktop | 64rem (1024 px) | ≥ 1024 px |

- Rationale: they match the documented range boundaries exactly. 320–599 px is one phone layout, so there is no breakpoint at 360 px. 360 px is a design target, not a layout change. Tailwind's default breakpoints would be reset like the other token namespaces, so only these two exist.
- Today, Tailwind's default breakpoints still apply, because no approved values existed when the foundation was built (ADR-0001 did not decide them).

**Content max width: Approved** (owner decision 2026-10-10). Page content on desktop sits in a centered column with a default maximum width of 1200 px. Feature-specific layouts, such as Reading Exam mode, may override it later.

## M3 components (onboarding and home)

**Approved** (owner, 2026-10-10, task M3-05; proposed in M3-02), including the progress bar under the step indicator. Visual values for the components in the M3 flows ([USER_FLOWS.md](../product/USER_FLOWS.md#onboarding-and-home-flows-m3)). Approved values are reused unchanged: the brand palette, the type scale (H1, H2, body, small meta text), the focus-visible style, the motion durations and easing, and the breakpoints. Contrast ratios were computed with the WCAG 2.x formula. Nothing here is in code yet; each value goes into `tokens.css` with its first use (M3-07, M3-08), and no other token is added.

### Primary button

The one red action per screen ("Start the level check"). It formalizes the style M1 already uses for its red action (`StatusMessage.tsx`), so the app has one primary button.

| Property | Proposed value | Rationale |
|---|---|---|
| Height | at least 48 px (`spacing` 48); grows when the label wraps | ACCESSIBILITY.md prefers 48 px for primary actions |
| Padding | 12 px vertical, 24 px horizontal | Room for a two-line Russian or Uzbek label without touching the edges |
| Radius | `radius.md` (14 px) | Not a pill (Radii section) |
| Type | Body size (1rem), weight 700, centered; the label wraps and is never truncated | Bold carries the emphasis; the size stays readable at 200% zoom |
| Default | `surface.base` text on `brand.primary` | 4.58:1 (AA for 16 px bold) |
| Hover (pointer) and pressed | `brand.primaryDeep` background | 5.18:1. The palette names `primaryDeep` as the hover and pressed color. Background change in 120 ms (motion "fast") |
| Focus-visible | The approved 2 px `ink` ring, offset 2 px | Approved style, 4.1:1 against the red |
| Width | Full column width below the tablet breakpoint (600 px); its natural width from 600 px, aligned with the column's start | A full-width target is easiest to hit with a thumb; on wide screens a stretched button looks like a banner |
| Disabled, loading | Not proposed: no M3 screen has a disabled or loading primary button | No speculative states (Token policy) |

The M1 status pages keep their approved inline button layout unless the owner wants them to adopt the full-width rule.

### Quiet secondary action (text link)

"Not now" (onboarding step 3) and "Change goal" (home). It formalizes M1's quieter "Go to home page" link.

| Property | Proposed value | Rationale |
|---|---|---|
| Look | `ink` text, weight 500, always underlined; no fill, no border | Clearly an action, clearly quieter than the red button; underline means it is not told apart by color |
| Tap area | At least 48 px high (the text sits in a 48 px tall link) | Touch target |
| Hover, pressed | No change other than the browser default cursor | Nothing to compete with the primary button |
| Contrast | 18.58:1 on `surface.base` | |

### Answer option (single-choice answer button)

The answers on onboarding steps 1 and 2. Each is a button that saves and advances (USER_FLOWS.md: answering rules).

| State | Proposed treatment | Contrast |
|---|---|---|
| Default | `surface.base` fill, 1 px `border.control` boundary, `radius.md`, `ink` text at body size weight 500, left-aligned; at least 48 px high with 12 px vertical and 16 px horizontal padding; full column width | Boundary 3.22:1 against white (meets 3:1 for an essential boundary); text 18.58:1 |
| Hover (pointer) | Boundary becomes `ink` | 18.58:1 |
| Pressed | `surface.warm` fill | Text 17.68:1 |
| Focus-visible | The approved ring | |
| Selected (the earlier answer when returning to a step) | `brand.blush` fill, a 2 px `ink` boundary, and a 20 px `ink` check mark at the end (an inline SVG like the language switcher's, hidden from screen readers, with the text "Selected" for them) | Text and check 12.37:1 on blush. Selected is shown by the check mark and the heavier boundary, not by the fill alone (I-8) |

- **Arrangement:** one vertical list with 12 px between answers, the same on step 1 and step 2. The five band values are a list too, not a grid: one scan direction, the same component on both steps, and it works at 320 px and at 200% zoom. Six 48 px answers with 12 px gaps take about 350 px, so the whole step still fits a 360 × 800 screen without scrolling.
- **Not red:** the answers are not primary buttons. Steps 1 and 2 have no red element at all (USER_FLOWS.md: one primary action).

### Step indicator

"Step 1 of 3" above the question on every onboarding step.

| Part | Proposed treatment | Contrast |
|---|---|---|
| Text | Small meta text (0.875rem), weight 500, `text.secondary` | 8.22:1. The text alone carries the meaning |
| Progress bar (optional) | A 4 px high track in `border.subtle` with `radius.full`, filled one third per step in `brand.highlight`, 8 px under the text; decorative and hidden from screen readers | Fill against track 2.48:1, below 3:1. Acceptable only because the text carries the meaning (WCAG 1.4.11 applies to graphics needed for understanding). `brand.highlight` is the palette's color for progress fills |

**Option:** drop the bar and keep the text only. **Recommendation: keep the bar.** It shows at a glance that the flow is short, which matters on the first screen a new user sees.

### Home: next-action block and goal line

- **Next-action block:** no card. No border, no fill, no shadow: the H2 ("Find your level", approved H2 size), the sentence (body, 8 px under the H2), and the primary button (24 px under the sentence) on the white page. The block is not one tappable unit (only its button is), so the card rule in [UI_ANTI_PATTERNS.md](UI_ANTI_PATTERNS.md) says no card. Hierarchy comes from the H2's size and the red button.
- **Goal line:** body text in `ink`, the band value in weight 700 ("Target band: **7.0**"), the exam type after it in regular weight, and "Change goal" as the quiet link. 32 px above it separate it from the next-action block. No divider.
- **Spacing on home:** 24 px between the H1 and the next-action block, 32 px between the block and the goal line.

### Column width for onboarding and home

| Property | Proposed value | Rationale |
|---|---|---|
| Maximum width | 36rem (576 px at the default font size), centered in the 1200 px content column | About 65 characters of body text per line, and answers and buttons do not stretch across a desktop screen. In rem, so it grows with the user's font size |
| Below 600 px | The full width between the 16 px gutters | |

This would be one new layout token (a container width) used by onboarding and home only.

### Spacing used by these components

4 (progress bar height), 8 (heading to sentence, indicator to bar), 12 (button vertical padding, gap between answers), 16 (gutter, answer horizontal padding), 24 (button horizontal padding, H1 to block, sentence to button, indicator to question), 32 (block to goal line), 48 (minimum heights). All are on the proposed 4 px scale.

## M4 components (Reading)

**PROPOSED: awaiting owner approval** (task M4-05, decided at the M4-09 gate). Visual values for the M4 Reading drafts ([READING_EXPERIENCE.md, M4 specifications](../product/READING_EXPERIENCE.md#m4-specifications-drafts)). Reused unchanged: the brand palette, the type scale (including the approved Heading 3 and passage sizes), the focus style, motion, the breakpoints, the M3 primary button, quiet link and answer option. Contrast computed with the WCAG 2.x formula. Status colors (correct/incorrect) stay TBD: M4 shows no correctness (M4-01 open question 2).

### New color: passage highlight

| Token | Proposed value | Use | Contrast |
|---|---|---|---|
| `highlight` | `#FFEFA3` (soft yellow) | Background of highlighted sentences (`<mark>`) | `ink` text on it 16.04:1. Against white 1.16:1. |

- Yellow is what readers expect from a highlighter (computer-delivered IELTS uses it too), and it is clearly not the red of actions or the blush of selection (blush against it 1.30:1, plus selection has its own underline below).
- The tint is light by design, so the text stays easy to read. A highlight is a reading aid the user made, not information needed to understand the page; screen readers get it from `<mark>`. If the owner wants highlights to stand out more, the option is a 2 px underline in `ink` as well.

### Test bar
- 48 px high, `surface.base`, a 1 px `border.subtle` line under it (decorative).
- "Exit" in the quiet-link style with a 48 px tap area; "Passage 1 of 3" in body text, weight 500; the timer in body text, weight 700, with tabular figures so it does not jiggle, weight 800 from 5 minutes left.

### Passage
- The approved passage size (Literata 17 px, line height 1.6), `ink` (18.58:1). Paragraph spacing 16 px.
- Width: the full width between the gutters on phones; from the tablet breakpoint a reading measure of **40rem** (about 70 characters of Literata at 17 px).
- Passage title: Heading 2 (Onest). Paragraph letters: bold Onest in `text.secondary` (8.22:1) at the start of the paragraph, followed by a space; not a separate column, so phones lose no width.

### Sentences: keyboard focus, selection, highlight, pin marker
- **Keyboard focus** on a sentence: the approved focus ring.
- **Selected** (action bar open): `brand.blush` background (`ink` 12.37:1) with a 2 px `ink` underline, `radius.sm` corners, so selection is not shown by color alone.
- **Highlighted:** the `highlight` background above.
- **Pin marker** (the current question's pins): an inline chip before the sentence, `radius.full`, 1 px `ink` border, a 14 px pin icon and the question number in bold meta text, `ink` on `surface.base` (18.58:1).

### Sentence action bar
- Floats 8 px above the sheet, the full width between the gutters on phones (at most 36rem), `surface.base`, `radius.md`, the approved raised shadow, 56 px high; its actions are quiet buttons with an icon and a label, each at least 48 px.

### Question sheet (phone and tablet)
- `surface.base`, `radius.xl` top corners, the approved raised shadow; 16 px side padding.
- **Handle:** a 32 × 4 px bar in `border.control` (3.22:1 on white) centered in a 48 px-high button.
- **Heights:** collapsed = its content (handle and header, about 96 px); partial = 45% of the visible viewport height, at least 240 px; expanded = the visible height below the test bar. State changes animate height with the approved "base" duration (200 ms) and easing, none with reduced motion.
- **Header row:** "Question 5 of 40" in Heading 3 (18 px, 700), the flag toggle and "All questions" as icon-plus-label quiet buttons, 48 px high.
- **Footer row:** Previous and Next as **secondary buttons** (new component, below); the red primary button only for "Finish test".

### Secondary button (new)
- For Previous / Next and similar navigation that must look like buttons but not compete with the red action: 48 px minimum height, 12/24 px padding, `radius.md`, 1 px `border.control` boundary (3.22:1), `ink` text weight 500 on `surface.base`; hover: `ink` boundary; pressed: `surface.warm` fill (`ink` 17.68:1); focus: the approved ring.

### Choice controls in the sheet
- **Option rows** reuse the approved M3 answer option (default, hover, pressed, focus, selected with `brand.blush`, the 2 px `ink` ring and the check mark), with a 20 px indicator at the start: a circle for "choose one" (radio) and a square with 4 px corners for "choose several" (checkbox; 4 px is a local dimension of this one indicator, since `radius.sm` would make a 20 px square look round, per the Token policy's "may stay local"), both with a 2 px `border.control` outline, filled `ink` with a white dot or check when chosen. The option letter is bold before the text.
- **Disabled** (the limit of "choose several" reached): text in `text.tertiary` (6.24:1 on white), boundary `border.subtle`, no hover.
- **Answer button** ("choose from a list"): the option-row look with a trailing chevron; "Choose an answer" in `text.secondary` (8.22:1) when empty, the chosen option's letter and text in `ink` when filled.
- **Typed-answer field:** 48 px high, 1 px `border.control` boundary (3.22:1), `radius.md`, 12/16 px padding, body text; focus: the approved ring.
- **Gaps in summaries and notes:** the number in bold followed by a 2 px `ink` underline as wide as about six characters; the **current gap** gets the selected look (`brand.blush` background, `radius.sm`).
- **Word-limit warning** (Practice): body text in `ink` with a 20 px warning icon (a circle with "!"), not a status color.

### "Your evidence" block
- Each pinned sentence as a quote on `surface.warm` with `radius.md`, 12/16 px padding: the paragraph label in meta text `text.secondary` (7.83:1 on warm), the sentence in the approved passage typography (`ink`, 17.68:1 on warm), then "Show in passage" and "Remove from evidence" as quiet links.

### Question navigator
- Cells 44 × 44 px with 4 px gaps, `radius.sm`, the number in body text weight 700 with tabular figures.
- **Unanswered:** `surface.base` with a 1 px `border.control` boundary (3.22:1). **Answered:** `ink` fill with a `surface.base` number (18.58:1). **Current:** a 3 px `ink` bar 4 px under the cell, in addition to its fill or outline. **Marked for review:** a 16 px badge in the top corner: a `surface.base` circle with a 1 px `ink` border and an `ink` flag. Each state is a shape, so none relies on color.
- Group headings ("Passage 1") in Heading 3.

### Desktop exam layout (from 64rem / 1024 px)
- Columns: passage 55%, questions 45%, separated by a 1 px `border.subtle` line (decorative: the columns are also separated by space and scroll on their own); both on `surface.base`; the passage at the 40rem measure inside its column.
- The current question in the question column: a 4 px `ink` bar along its start edge.
- Navigator bar: 64 px high with a 1 px `border.subtle` line above it; the same 44 px cells; other passages as secondary buttons with their progress.

### Tokens this would add
`--color-highlight`, `--container-measure` (40rem), `--breakpoint-desktop` (the approved 64rem, first use), and the approved "base" duration (200 ms) for the sheet. Everything else uses existing or approved values.

